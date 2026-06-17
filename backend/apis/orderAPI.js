import exp from 'express'
import { Orders, Cart, Product } from '../models/Schema.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyAdmin } from '../middleware/verifyAdmin.js'

export const orderApp = exp.Router()

// ── PLACE ORDER (single product — "Shop Now" flow) ────────────────────────────
// POST /order-api/place
orderApp.post('/place', verifyToken, async (req, res) => {
    try {
        const {
            name, email, mobile, address, pincode,
            productId, size, quantity = 1, paymentMethod = 'COD'
        } = req.body

        if (!name || !email || !mobile || !address || !pincode || !productId)
            return res.status(400).json({ message: 'All delivery and product details are required' })

        const product = await Product.findById(productId)
        if (!product || !product.isActive)
            return res.status(404).json({ message: 'Product not found' })

        const order = await Orders.create({
            userId:        req.user.id,
            name, email, mobile, address, pincode,
            title:         product.title,
            description:   product.description,
            mainImg:       product.mainImg,
            size:          size || '',
            quantity:      parseInt(quantity),
            price:         product.price,
            discount:      product.discount,
            paymentMethod,
            orderDate:     new Date(),
            deliveryDate:  getDeliveryDate(5),
        })

        res.status(201).json({ message: 'Order placed successfully!', payload: order })
    } catch (err) {
        console.log('Order error', err)
        res.status(500).json({ message: 'Error placing order', error: err.message })
    }
})

// ── PLACE ORDER FROM CART (checkout all cart items) ───────────────────────────
// POST /order-api/checkout
orderApp.post('/checkout', verifyToken, async (req, res) => {
    try {
        const { name, email, mobile, address, pincode, paymentMethod = 'COD' } = req.body

        if (!name || !email || !mobile || !address || !pincode)
            return res.status(400).json({ message: 'All delivery details are required' })

        const cartItems = await Cart.find({ userId: req.user.id })
        if (cartItems.length === 0)
            return res.status(400).json({ message: 'Cart is empty' })

        const orders = await Promise.all(
            cartItems.map(item =>
                Orders.create({
                    userId:        req.user.id,
                    name, email, mobile, address, pincode,
                    title:         item.title,
                    description:   item.description,
                    mainImg:       item.mainImg,
                    size:          item.size,
                    quantity:      item.quantity,
                    price:         item.price,
                    discount:      item.discount,
                    paymentMethod,
                    orderDate:     new Date(),
                    deliveryDate:  getDeliveryDate(5),
                })
            )
        )

        // Clear cart after successful order
        await Cart.deleteMany({ userId: req.user.id })

        res.status(201).json({
            message: `${orders.length} order(s) placed successfully!`,
            payload: orders
        })
    } catch (err) {
        console.log('Checkout error', err)
        res.status(500).json({ message: 'Checkout failed', error: err.message })
    }
})

// ── GET MY ORDERS ─────────────────────────────────────────────────────────────
orderApp.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const orders = await Orders.find({ userId: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json({ message: 'Orders fetched', payload: orders })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message })
    }
})

// ── GET SINGLE ORDER ──────────────────────────────────────────────────────────
orderApp.get('/:id', verifyToken, async (req, res) => {
    try {
        const order = await Orders.findOne({ _id: req.params.id, userId: req.user.id })
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.status(200).json({ message: 'Order fetched', payload: order })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching order', error: err.message })
    }
})

// ── CANCEL ORDER ──────────────────────────────────────────────────────────────
orderApp.put('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const order = await Orders.findOne({ _id: req.params.id, userId: req.user.id })
        if (!order) return res.status(404).json({ message: 'Order not found' })
        if (['delivered', 'cancelled'].includes(order.orderStatus))
            return res.status(400).json({ message: `Cannot cancel a ${order.orderStatus} order` })

        order.orderStatus = 'cancelled'
        await order.save()
        res.status(200).json({ message: 'Order cancelled', payload: order })
    } catch (err) {
        res.status(500).json({ message: 'Error cancelling order', error: err.message })
    }
})

// ── ADMIN: GET ALL ORDERS ─────────────────────────────────────────────────────
orderApp.get('/', verifyToken, verifyAdmin, async (req, res) => {
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

        res.status(200).json({ message: 'All orders fetched', payload: orders, total })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message })
    }
})

// ── ADMIN: UPDATE ORDER STATUS ────────────────────────────────────────────────
orderApp.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { orderStatus } = req.body
        const validStatuses = ['order placed', 'shipped', 'out for delivery', 'delivered', 'cancelled']
        if (!validStatuses.includes(orderStatus))
            return res.status(400).json({ message: 'Invalid order status' })

        const order = await Orders.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        )
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.status(200).json({ message: 'Order status updated', payload: order })
    } catch (err) {
        res.status(500).json({ message: 'Error updating status', error: err.message })
    }
})

// ── HELPER ────────────────────────────────────────────────────────────────────
function getDeliveryDate(daysFromNow) {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}