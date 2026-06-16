import exp from 'express'
import { StockModel } from '../models/stockModel.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const stockApp = exp.Router()

// ── GET all stocks (with optional search & sector filter) ──────────────────────
stockApp.get("/", async (req, res) => {
    try {
        const { search, sector, page = 1, limit = 20 } = req.query
        const query = { isActive: true }

        if (search) {
            query.$or = [
                { symbol: { $regex: search, $options: 'i' } },
                { name:   { $regex: search, $options: 'i' } }
            ]
        }
        if (sector) query.sector = sector

        const skip  = (parseInt(page) - 1) * parseInt(limit)
        const total = await StockModel.countDocuments(query)
        const stocks = await StockModel
            .find(query)
            .select("-historicalData")
            .sort({ symbol: 1 })
            .skip(skip)
            .limit(parseInt(limit))

        res.status(200).json({
            message: "Stocks fetched",
            payload: stocks,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        })
    } catch (err) {
        console.log("Get stocks error", err)
        res.status(500).json({ message: "Error fetching stocks", error: err.message })
    }
})

// ── GET market summary (top gainers, losers, most active) ─────────────────────
stockApp.get("/market/summary", async (req, res) => {
    try {
        const [topGainers, topLosers, mostActive] = await Promise.all([
            StockModel.find({ isActive: true }).select("-historicalData").sort({ changePercent: -1 }).limit(5),
            StockModel.find({ isActive: true }).select("-historicalData").sort({ changePercent: 1  }).limit(5),
            StockModel.find({ isActive: true }).select("-historicalData").sort({ volume: -1         }).limit(5)
        ])
        res.status(200).json({ message: "Market summary", payload: { topGainers, topLosers, mostActive } })
    } catch (err) {
        console.log("Market summary error", err)
        res.status(500).json({ message: "Error fetching market summary", error: err.message })
    }
})

// ── GET single stock by symbol ─────────────────────────────────────────────────
stockApp.get("/:symbol", async (req, res) => {
    try {
        const stock = await StockModel.findOne({
            symbol: req.params.symbol.toUpperCase(),
            isActive: true
        })
        if (!stock)
            return res.status(404).json({ message: "Stock not found" })
        res.status(200).json({ message: "Stock fetched", payload: stock })
    } catch (err) {
        console.log("Get stock error", err)
        res.status(500).json({ message: "Error fetching stock", error: err.message })
    }
})

// ── SIMULATE price update (demo: random ±2% swing on all stocks) ──────────────
stockApp.get("/simulate/update", async (req, res) => {
    try {
        const stocks = await StockModel.find({ isActive: true })
        const updates = stocks.map(async (stock) => {
            const changePct  = (Math.random() - 0.48) * 4
            const newPrice   = parseFloat((stock.currentPrice * (1 + changePct / 100)).toFixed(2))
            const change     = parseFloat((newPrice - stock.previousClose).toFixed(2))
            stock.previousClose = stock.currentPrice
            stock.currentPrice  = newPrice
            stock.change        = change
            stock.changePercent = parseFloat(changePct.toFixed(2))
            stock.dayHigh       = Math.max(stock.dayHigh, newPrice)
            stock.dayLow        = stock.dayLow > 0 ? Math.min(stock.dayLow, newPrice) : newPrice
            stock.lastUpdated   = new Date()
            return stock.save()
        })
        await Promise.all(updates)
        res.status(200).json({ message: `Updated ${stocks.length} stock prices` })
    } catch (err) {
        console.log("Simulate error", err)
        res.status(500).json({ message: "Simulation failed", error: err.message })
    }
})