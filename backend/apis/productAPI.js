import exp from 'express'
import { Product } from '../models/Schema.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyAdmin } from '../middleware/verifyAdmin.js'

export const productApp = exp.Router()

// ── GET ALL PRODUCTS (with filters) ──────────────────────────────────────────
// GET /product-api/?category=Shirts&gender=Men&search=polo&page=1&limit=12
productApp.get('/', async (req, res) => {
    try {
        const { category, gender, search, page = 1, limit = 12 } = req.query
        const query = { isActive: true }

        if (category) query.category = category
        if (gender)   query.gender   = gender
        if (search)   query.title    = { $regex: search, $options: 'i' }

        const skip  = (parseInt(page) - 1) * parseInt(limit)
        const total = await Product.countDocuments(query)
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        res.status(200).json({
            message: 'Products fetched',
            payload: products,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err.message })
    }
})

// ── GET SINGLE PRODUCT ────────────────────────────────────────────────────────
productApp.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product || !product.isActive)
            return res.status(404).json({ message: 'Product not found' })
        res.status(200).json({ message: 'Product fetched', payload: product })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product', error: err.message })
    }
})

// ── GET CATEGORIES (distinct values) ─────────────────────────────────────────
productApp.get('/meta/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true })
        res.status(200).json({ message: 'Categories fetched', payload: categories })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' })
    }
})

// ── ADMIN: CREATE PRODUCT ─────────────────────────────────────────────────────
productApp.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const product = await Product.create(req.body)
        res.status(201).json({ message: 'Product created', payload: product })
    } catch (err) {
        res.status(500).json({ message: 'Error creating product', error: err.message })
    }
})

// ── ADMIN: UPDATE PRODUCT ─────────────────────────────────────────────────────
productApp.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!product) return res.status(404).json({ message: 'Product not found' })
        res.status(200).json({ message: 'Product updated', payload: product })
    } catch (err) {
        res.status(500).json({ message: 'Error updating product', error: err.message })
    }
})

// ── ADMIN: DELETE (soft) PRODUCT ──────────────────────────────────────────────
productApp.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
        if (!product) return res.status(404).json({ message: 'Product not found' })
        res.status(200).json({ message: 'Product removed' })
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err.message })
    }
})

// ── ADMIN: SEED DEMO PRODUCTS ─────────────────────────────────────────────────
productApp.post('/admin/seed', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const demo = [
            { title: "Classic White Shirt", description: "A timeless white formal shirt.", mainImg: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400", carousel: [], sizes: ['S','M','L','XL'], category: "Shirts", gender: "Men", price: 1299, discount: 10 },
            { title: "Black Slim Jeans", description: "Slim fit black denim jeans.", mainImg: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", carousel: [], sizes: ['28','30','32','34'], category: "Jeans", gender: "Men", price: 2499, discount: 15 },
            { title: "Floral Summer Dress", description: "Light and breezy floral print dress.", mainImg: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", carousel: [], sizes: ['XS','S','M','L'], category: "Dresses", gender: "Women", price: 1899, discount: 20 },
            { title: "Sports Running Shoes", description: "Lightweight breathable running shoes.", mainImg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", carousel: [], sizes: ['6','7','8','9','10'], category: "Footwear", gender: "Unisex", price: 3499, discount: 5 },
            { title: "Casual Hoodie", description: "Comfortable fleece hoodie for everyday wear.", mainImg: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400", carousel: [], sizes: ['S','M','L','XL','XXL'], category: "Hoodies", gender: "Unisex", price: 1999, discount: 0 },
            { title: "Leather Handbag", description: "Premium leather tote bag.", mainImg: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", carousel: [], sizes: [], category: "Bags", gender: "Women", price: 4999, discount: 25 },
        ]
        await Product.deleteMany({})
        const products = await Product.insertMany(demo)
        res.status(201).json({ message: `Seeded ${products.length} products`, payload: products })
    } catch (err) {
        res.status(500).json({ message: 'Seed failed', error: err.message })
    }
})