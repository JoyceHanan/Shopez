import exp from 'express'
import { Admin, User, Product, Orders } from '../models/Schema.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyAdmin } from '../middleware/verifyAdmin.js'

export const adminApp = exp.Router()

// All admin routes require auth + admin role
adminApp.use(verifyToken, verifyAdmin)

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
adminApp.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
            User.countDocuments({ usertype: 'user' }),
            Product.countDocuments({ isActive: true }),
            Orders.countDocuments(),
            Orders.aggregate([
                { $match: { orderStatus: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: {
                                $multiply: [
                                    { $subtract: ['$price', { $multiply: ['$price', { $divide: ['$discount', 100] }] }] },
                                    '$quantity'
                                ]
                            }
                        }
                    }
                }
            ])
        ])

        const recentOrders = await Orders.find()
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .limit(10)

        res.status(200).json({
            message: 'Stats fetched',
            payload: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: parseFloat((revenueAgg[0]?.totalRevenue || 0).toFixed(2)),
                recentOrders
            }
        })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats', error: err.message })
    }
})

// ── BANNER ────────────────────────────────────────────────────────────────────
adminApp.get('/banner', async (req, res) => {
    try {
        let adminDoc = await Admin.findOne()
        if (!adminDoc) adminDoc = await Admin.create({})
        res.status(200).json({ message: 'Banner fetched', payload: adminDoc.banner })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching banner' })
    }
})

adminApp.put('/banner', async (req, res) => {
    try {
        const { banner } = req.body
        let adminDoc = await Admin.findOneAndUpdate({}, { banner }, { new: true, upsert: true })
        res.status(200).json({ message: 'Banner updated', payload: adminDoc.banner })
    } catch (err) {
        res.status(500).json({ message: 'Error updating banner' })
    }
})

// ── CATEGORIES ────────────────────────────────────────────────────────────────
adminApp.get('/categories', async (req, res) => {
    try {
        let adminDoc = await Admin.findOne()
        if (!adminDoc) adminDoc = await Admin.create({})
        res.status(200).json({ message: 'Categories fetched', payload: adminDoc.categories })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' })
    }
})

adminApp.put('/categories', async (req, res) => {
    try {
        const { categories } = req.body
        if (!Array.isArray(categories))
            return res.status(400).json({ message: 'Categories must be an array' })
        const adminDoc = await Admin.findOneAndUpdate({}, { categories }, { new: true, upsert: true })
        res.status(200).json({ message: 'Categories updated', payload: adminDoc.categories })
    } catch (err) {
        res.status(500).json({ message: 'Error updating categories' })
    }
})

// ── USER MANAGEMENT ───────────────────────────────────────────────────────────
adminApp.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 })
        res.status(200).json({ message: 'Users fetched', payload: users })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' })
    }
})

adminApp.put('/users/:id/toggle', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ message: 'User not found' })
        if (user.usertype === 'admin')
            return res.status(400).json({ message: 'Cannot deactivate admin accounts' })
        user.isActive = !user.isActive
        await user.save()
        res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, payload: user })
    } catch (err) {
        res.status(500).json({ message: 'Error toggling user status' })
    }
})

// ── ALL ORDERS (admin view) ───────────────────────────────────────────────────
adminApp.get('/orders', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query
        const query = status ? { orderStatus: status } : {}
        const skip  = (parseInt(page) - 1) * parseInt(limit)
        const total = await Orders.countDocuments(query)
        const orders = await Orders.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
        res.status(200).json({ message: 'Orders fetched', payload: orders, total })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' })
    }
})

adminApp.put('/orders/:id/status', async (req, res) => {
    try {
        const { orderStatus } = req.body
        const validStatuses = ['order placed', 'shipped', 'out for delivery', 'delivered', 'cancelled']
        if (!validStatuses.includes(orderStatus))
            return res.status(400).json({ message: 'Invalid status' })

        const order = await Orders.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true })
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.status(200).json({ message: 'Status updated', payload: order })
    } catch (err) {
        res.status(500).json({ message: 'Error updating status' })
    }
})