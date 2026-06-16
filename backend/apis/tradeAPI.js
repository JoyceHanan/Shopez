import exp from 'express'
import { StockModel }       from '../models/stockModel.js'
import { TransactionModel } from '../models/transactionModel.js'
import { PortfolioModel }   from '../models/portfolioModel.js'
import { UserModel }        from '../models/userModel.js'
import { verifyToken }      from '../middleware/verifyToken.js'

export const tradeApp = exp.Router()

// ── POST /trade-api/ — Execute a BUY or SELL ──────────────────────────────────
tradeApp.post("/", verifyToken, async (req, res) => {
    try {
        const { stockSymbol, type, quantity } = req.body
        const userId = req.user.id

        if (!stockSymbol || !type || !quantity)
            return res.status(400).json({ message: "stockSymbol, type, and quantity are required" })

        const tradeType = type.toUpperCase()
        if (!["BUY", "SELL"].includes(tradeType))
            return res.status(400).json({ message: "type must be BUY or SELL" })

        const qty = parseInt(quantity)
        if (qty < 1)
            return res.status(400).json({ message: "Quantity must be at least 1" })

        const stock = await StockModel.findOne({ symbol: stockSymbol.toUpperCase(), isActive: true })
        if (!stock)
            return res.status(404).json({ message: "Stock not found" })

        // Ensure portfolio doc exists
        let portfolio = await PortfolioModel.findOne({ userId })
        if (!portfolio)
            portfolio = await PortfolioModel.create({ userId })

        const totalAmount = parseFloat((stock.currentPrice * qty).toFixed(2))

        if (tradeType === "BUY") {
            // ── BUY ──────────────────────────────────────────────────────
            if (portfolio.virtualBalance < totalAmount)
                return res.status(400).json({
                    message: `Insufficient balance. Need ₹${totalAmount}, have ₹${portfolio.virtualBalance.toFixed(2)}`
                })

            portfolio.virtualBalance = parseFloat((portfolio.virtualBalance - totalAmount).toFixed(2))

            const existing = portfolio.holdings.find(h => h.stockSymbol === stock.symbol)
            if (existing) {
                const newTotalInvested = existing.totalInvested + totalAmount
                const newQty           = existing.quantity + qty
                existing.averageBuyPrice = parseFloat((newTotalInvested / newQty).toFixed(2))
                existing.quantity        = newQty
                existing.totalInvested   = parseFloat(newTotalInvested.toFixed(2))
            } else {
                portfolio.holdings.push({
                    stockId:         stock._id,
                    stockSymbol:     stock.symbol,
                    stockName:       stock.name,
                    quantity:        qty,
                    averageBuyPrice: stock.currentPrice,
                    totalInvested:   totalAmount
                })
            }
        } else {
            // ── SELL ─────────────────────────────────────────────────────
            const holding = portfolio.holdings.find(h => h.stockSymbol === stock.symbol)
            if (!holding || holding.quantity < qty)
                return res.status(400).json({
                    message: `Insufficient shares. You own ${holding ? holding.quantity : 0} shares of ${stock.symbol}`
                })

            portfolio.virtualBalance = parseFloat((portfolio.virtualBalance + totalAmount).toFixed(2))
            holding.quantity        -= qty
            holding.totalInvested    = parseFloat((holding.averageBuyPrice * holding.quantity).toFixed(2))

            if (holding.quantity === 0)
                portfolio.holdings = portfolio.holdings.filter(h => h.stockSymbol !== stock.symbol)
        }

        portfolio.lastUpdated = new Date()
        await portfolio.save()

        // Record the transaction
        const transaction = await TransactionModel.create({
            userId,
            stockId:      stock._id,
            stockSymbol:  stock.symbol,
            stockName:    stock.name,
            type:         tradeType,
            quantity:     qty,
            pricePerShare:stock.currentPrice,
            totalAmount,
            status:       "COMPLETED",
            balanceAfter: portfolio.virtualBalance
        })

        res.status(201).json({
            message: `${tradeType === "BUY" ? "Bought" : "Sold"} ${qty} shares of ${stock.symbol} successfully`,
            payload: transaction,
            newBalance: portfolio.virtualBalance
        })
    } catch (err) {
        console.log("Trade error", err)
        res.status(500).json({ message: "Trade failed", error: err.message })
    }
})

// ── GET /trade-api/history — User transaction history ─────────────────────────
tradeApp.get("/history", verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query
        const query = { userId: req.user.id }
        if (type) query.type = type.toUpperCase()

        const skip  = (parseInt(page) - 1) * parseInt(limit)
        const total = await TransactionModel.countDocuments(query)
        const transactions = await TransactionModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        res.status(200).json({
            message: "Transaction history fetched",
            payload: transactions,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        })
    } catch (err) {
        console.log("History error", err)
        res.status(500).json({ message: "Error fetching history", error: err.message })
    }
})