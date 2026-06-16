import exp from 'express'
import { UserModel }        from '../models/userModel.js'
import { StockModel }       from '../models/stockModel.js'
import { TransactionModel } from '../models/transactionModel.js'
import { PortfolioModel }   from '../models/portfolioModel.js'
import { verifyToken }      from '../middleware/verifyToken.js'

export const adminApp = exp.Router()

// ── Admin guard ────────────────────────────────────────────────────────────────
const isAdmin = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id)
        if (!user || user.role !== "admin")
            return res.status(403).json({ message: "Access denied: Admins only" })
        next()
    } catch (err) {
        res.status(403).json({ message: "Admin check failed", error: err.message })
    }
}

// All admin routes need JWT + admin role
adminApp.use(verifyToken, isAdmin)

// ── DASHBOARD STATS ────────────────────────────────────────────────────────────
adminApp.get("/stats", async (req, res) => {
    try {
        const [totalUsers, totalStocks, totalTransactions, volumeAgg] = await Promise.all([
            UserModel.countDocuments(),
            StockModel.countDocuments({ isActive: true }),
            TransactionModel.countDocuments(),
            TransactionModel.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }])
        ])
        const recentTransactions = await TransactionModel
            .find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("userId", "name email")

        res.status(200).json({
            message: "Dashboard stats",
            payload: {
                totalUsers,
                totalStocks,
                totalTransactions,
                totalTradingVolume: volumeAgg[0]?.total || 0,
                recentTransactions
            }
        })
    } catch (err) {
        console.log("Stats error", err)
        res.status(500).json({ message: "Error fetching stats", error: err.message })
    }
})

// ── USER MANAGEMENT ────────────────────────────────────────────────────────────
adminApp.get("/users", async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query
        const skip  = (parseInt(page) - 1) * parseInt(limit)
        const total = await UserModel.countDocuments()
        const users = await UserModel.find().select("-password -refreshToken").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
        res.status(200).json({ message: "Users fetched", payload: users, total })
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message })
    }
})

adminApp.put("/users/:id/role", async (req, res) => {
    try {
        const { role } = req.body
        if (!["user", "admin"].includes(role))
            return res.status(400).json({ message: "Role must be 'user' or 'admin'" })
        const user = await UserModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password -refreshToken")
        if (!user) return res.status(404).json({ message: "User not found" })
        res.status(200).json({ message: "Role updated", payload: user })
    } catch (err) {
        res.status(500).json({ message: "Error updating role", error: err.message })
    }
})

adminApp.put("/users/:id/toggle", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)
        if (!user) return res.status(404).json({ message: "User not found" })
        if (user.role === "admin") return res.status(400).json({ message: "Cannot deactivate admin accounts" })
        user.isActive = !user.isActive
        await user.save()
        res.status(200).json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, payload: user })
    } catch (err) {
        res.status(500).json({ message: "Error toggling user", error: err.message })
    }
})

adminApp.delete("/users/:id", async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).json({ message: "User not found" })
        // Also clean up portfolio
        await PortfolioModel.deleteOne({ userId: req.params.id })
        res.status(200).json({ message: "User deleted" })
    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message })
    }
})

// ── STOCK MANAGEMENT ───────────────────────────────────────────────────────────
adminApp.get("/stocks", async (req, res) => {
    try {
        const stocks = await StockModel.find().select("-historicalData").sort({ symbol: 1 })
        res.status(200).json({ message: "All stocks", payload: stocks })
    } catch (err) {
        res.status(500).json({ message: "Error fetching stocks", error: err.message })
    }
})

adminApp.post("/stocks", async (req, res) => {
    try {
        const stock = await StockModel.create(req.body)
        res.status(201).json({ message: "Stock created", payload: stock })
    } catch (err) {
        console.log("Create stock error", err)
        res.status(500).json({ message: "Error creating stock", error: err.message })
    }
})

adminApp.put("/stocks/:symbol", async (req, res) => {
    try {
        const stock = await StockModel.findOneAndUpdate(
            { symbol: req.params.symbol.toUpperCase() },
            req.body,
            { new: true, runValidators: true }
        )
        if (!stock) return res.status(404).json({ message: "Stock not found" })
        res.status(200).json({ message: "Stock updated", payload: stock })
    } catch (err) {
        res.status(500).json({ message: "Error updating stock", error: err.message })
    }
})

adminApp.delete("/stocks/:symbol", async (req, res) => {
    try {
        const stock = await StockModel.findOneAndUpdate(
            { symbol: req.params.symbol.toUpperCase() },
            { isActive: false },
            { new: true }
        )
        if (!stock) return res.status(404).json({ message: "Stock not found" })
        res.status(200).json({ message: "Stock deactivated", payload: stock })
    } catch (err) {
        res.status(500).json({ message: "Error deactivating stock", error: err.message })
    }
})

// ── ALL TRANSACTIONS (admin view) ──────────────────────────────────────────────
adminApp.get("/transactions", async (req, res) => {
    try {
        const { page = 1, limit = 30 } = req.query
        const skip  = (parseInt(page) - 1) * parseInt(limit)
        const total = await TransactionModel.countDocuments()
        const transactions = await TransactionModel
            .find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
        res.status(200).json({ message: "All transactions", payload: transactions, total })
    } catch (err) {
        res.status(500).json({ message: "Error fetching transactions", error: err.message })
    }
})

// ── SEED STOCKS (one-time demo data) ──────────────────────────────────────────
adminApp.post("/stocks/seed", async (req, res) => {
    try {
        const seedData = [
            { symbol:"AAPL",  name:"Apple Inc.",           currentPrice:189.50, previousClose:187.20, sector:"Technology",        change: 2.30, changePercent: 1.23, dayHigh:191.00, dayLow:186.50, volume:52000000, marketCap:2900000000000 },
            { symbol:"GOOGL", name:"Alphabet Inc.",         currentPrice:141.80, previousClose:139.50, sector:"Technology",        change: 2.30, changePercent: 1.65, dayHigh:143.00, dayLow:138.20, volume:21000000, marketCap:1800000000000 },
            { symbol:"MSFT",  name:"Microsoft Corp.",       currentPrice:378.90, previousClose:376.10, sector:"Technology",        change: 2.80, changePercent: 0.74, dayHigh:381.00, dayLow:374.50, volume:18000000, marketCap:2800000000000 },
            { symbol:"AMZN",  name:"Amazon.com Inc.",       currentPrice:178.20, previousClose:175.80, sector:"Consumer Cyclical", change: 2.40, changePercent: 1.37, dayHigh:179.50, dayLow:174.00, volume:35000000, marketCap:1850000000000 },
            { symbol:"TSLA",  name:"Tesla Inc.",            currentPrice:248.50, previousClose:252.30, sector:"Automotive",        change:-3.80, changePercent:-1.51, dayHigh:255.00, dayLow:245.00, volume:98000000, marketCap:790000000000  },
            { symbol:"META",  name:"Meta Platforms Inc.",   currentPrice:505.30, previousClose:498.70, sector:"Technology",        change: 6.60, changePercent: 1.32, dayHigh:508.00, dayLow:496.00, volume:14000000, marketCap:1290000000000 },
            { symbol:"NVDA",  name:"NVIDIA Corp.",          currentPrice:875.40, previousClose:862.10, sector:"Technology",        change:13.30, changePercent: 1.54, dayHigh:882.00, dayLow:858.00, volume:41000000, marketCap:2150000000000 },
            { symbol:"JPM",   name:"JPMorgan Chase & Co.",  currentPrice:198.70, previousClose:201.20, sector:"Financial",        change:-2.50, changePercent:-1.24, dayHigh:203.00, dayLow:197.00, volume:9000000,  marketCap:574000000000  },
            { symbol:"V",     name:"Visa Inc.",             currentPrice:278.10, previousClose:275.60, sector:"Financial",        change: 2.50, changePercent: 0.91, dayHigh:280.00, dayLow:274.00, volume:6500000,  marketCap:569000000000  },
            { symbol:"JNJ",   name:"Johnson & Johnson",     currentPrice:152.30, previousClose:154.70, sector:"Healthcare",       change:-2.40, changePercent:-1.55, dayHigh:155.50, dayLow:151.00, volume:7800000,  marketCap:368000000000  }
        ]
        await StockModel.deleteMany({})
        const stocks = await StockModel.insertMany(seedData)
        res.status(201).json({ message: `Seeded ${stocks.length} stocks`, payload: stocks })
    } catch (err) {
        console.log("Seed error", err)
        res.status(500).json({ message: "Seed failed", error: err.message })
    }
})