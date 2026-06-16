import exp from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { userApp }      from './apis/userAPI.js'
import { stockApp }     from './apis/stockAPI.js'
import { tradeApp }     from './apis/tradeAPI.js'
import { portfolioApp } from './apis/portfolioAPI.js'
import { adminApp }     from './apis/adminAPI.js'

config()

const app = exp()

// CORS — allow Vite dev server
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))
app.use(exp.json())
app.use(cookieParser())

// ── API routes ─────────────────────────────────────────────────────────────────
app.use("/user-api",      userApp)
app.use("/stock-api",     stockApp)
app.use("/trade-api",     tradeApp)
app.use("/portfolio-api", portfolioApp)
app.use("/admin-api",     adminApp)

const port = process.env.PORT || 5000

const connectionDb = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("MongoDB connected")
        app.listen(port, () => console.log(`Server running on port ${port}`))
    } catch (err) {
        console.log(err)
    }
}
connectionDb()

// 404 handler
app.use((req, res, next) => {
    console.log(req.url)
    res.status(404).json({ message: "Invalid path" })
})

// Global error handler
app.use((err, req, res, next) => {
    console.log(err.name)
    console.log(err.message)

    if (err.name === 'ValidationError')
        return res.status(400).json({ message: "Validation failed", error: err.message })

    if (err.name === 'CastError')
        return res.status(400).json({ message: "Invalid ID format" })

    res.status(500).json({ message: "Internal server error", error: err.message })
})