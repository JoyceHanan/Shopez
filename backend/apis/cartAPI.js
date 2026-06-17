import exp from 'express'
import { Cart, Product } from '../models/Schema.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const cartApp = exp.Router()

// All cart routes require login
cartApp.use(verifyToken)

// ── GET CART ──────────────────────────────────────────────────────────────────
cartApp.get('/', async (req, res) => {
    try {
        const items = await Cart.find({ userId: req.user.id }).sort({ createdAt: -1 })

        // Calculate totals
        const subtotal = items.reduce((sum, item) => {
            const finalPrice = item.price - (item.price * item.discount) / 100
            return sum + finalPrice * item.quantity
        }, 0)

        res.status(200).json({
            message: 'Cart fetched',
            payload: items,
            subtotal: parseFloat(subtotal.toFixed(2)),
            totalItems: items.length
        })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cart', error: err.message })
    }
})

// ── ADD TO CART ───────────────────────────────────────────────────────────────
cartApp.post('/add', async (req, res) => {
    try {
        const { productId, size, quantity = 1 } = req.body
        if (!productId) return res.status(400).json({ message: 'Product ID required' })

        const product = await Product.findById(productId)
        if (!product || !product.isActive)
            return res.status(404).json({ message: 'Product not found' })

        // Check if same product+size already in cart
        const existing = await Cart.findOne({ userId: req.user.id, productId, size })
        if (existing) {
            existing.quantity += parseInt(quantity)
            await existing.save()
            return res.status(200).json({ message: 'Cart updated', payload: existing })
        }

        const cartItem = await Cart.create({
            userId:      req.user.id,
            productId:   product._id,
            title:       product.title,
            description: product.description,
            mainImg:     product.mainImg,
            size:        size || '',
            quantity:    parseInt(quantity),
            price:       product.price,
            discount:    product.discount
        })

        res.status(201).json({ message: 'Added to cart', payload: cartItem })
    } catch (err) {
        res.status(500).json({ message: 'Error adding to cart', error: err.message })
    }
})

// ── UPDATE QUANTITY ───────────────────────────────────────────────────────────
cartApp.put('/:id', async (req, res) => {
    try {
        const { quantity } = req.body
        if (!quantity || quantity < 1)
            return res.status(400).json({ message: 'Quantity must be at least 1' })

        const item = await Cart.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { quantity: parseInt(quantity) },
            { new: true }
        )
        if (!item) return res.status(404).json({ message: 'Cart item not found' })
        res.status(200).json({ message: 'Quantity updated', payload: item })
    } catch (err) {
        res.status(500).json({ message: 'Error updating cart', error: err.message })
    }
})

// ── REMOVE FROM CART ──────────────────────────────────────────────────────────
cartApp.delete('/:id', async (req, res) => {
    try {
        const item = await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
        if (!item) return res.status(404).json({ message: 'Cart item not found' })
        res.status(200).json({ message: 'Item removed from cart' })
    } catch (err) {
        res.status(500).json({ message: 'Error removing item', error: err.message })
    }
})

// ── CLEAR CART ────────────────────────────────────────────────────────────────
cartApp.delete('/', async (req, res) => {
    try {
        await Cart.deleteMany({ userId: req.user.id })
        res.status(200).json({ message: 'Cart cleared' })
    } catch (err) {
        res.status(500).json({ message: 'Error clearing cart', error: err.message })
    }
})