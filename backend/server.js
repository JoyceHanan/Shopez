import exp from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { userApp }    from './apis/userAPI.js'
import { productApp } from './apis/productAPI.js'
import { cartApp }    from './apis/cartAPI.js'
import { orderApp }   from './apis/orderAPI.js'
import { adminApp }   from './apis/adminAPI.js'

config()

const app = exp()

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(exp.json())
app.use(cookieParser())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/user-api',    userApp)
app.use('/product-api', productApp)
app.use('/cart-api',    cartApp)
app.use('/order-api',   orderApp)
app.use('/admin-api',   adminApp)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    console.log('404:', req.method, req.url)
    res.status(404).json({ message: 'Route not found' })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.log(err.name, err.message)
    if (err.name === 'ValidationError')
        return res.status(400).json({ message: 'Validation failed', error: err.message })
    if (err.name === 'CastError')
        return res.status(400).json({ message: 'Invalid ID format' })
    res.status(500).json({ message: 'Internal server error', error: err.message })
})

// ── DB + Server ───────────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log('MongoDB connected')
        const PORT = process.env.PORT || 5000
        app.listen(PORT, () => console.log(` Server running on port ${PORT}`))
    } catch (err) {
        console.log(' DB connection failed:', err.message)
        process.exit(1)
    }
}

startServer()