import exp from 'express'
import { PortfolioModel } from '../models/portfolioModel.js'
import { StockModel }     from '../models/stockModel.js'
import { verifyToken }    from '../middleware/verifyToken.js'

export const portfolioApp = exp.Router()

// ── GET /portfolio-api/ — Current user's portfolio with live P&L ───────────────
portfolioApp.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id

        let portfolio = await PortfolioModel.findOne({ userId })
        if (!portfolio)
            portfolio = await PortfolioModel.create({ userId })

        // Enrich each holding with current market price & P&L
        let totalCurrentValue = 0
        let totalInvested     = 0

        const enrichedHoldings = await Promise.all(
            portfolio.holdings.map(async (holding) => {
                const stock = await StockModel
                    .findOne({ symbol: holding.stockSymbol })
                    .select("currentPrice change changePercent")

                const currentPrice = stock ? stock.currentPrice : holding.averageBuyPrice
                const currentValue = parseFloat((currentPrice * holding.quantity).toFixed(2))
                const profitLoss   = parseFloat((currentValue - holding.totalInvested).toFixed(2))
                const profitLossPct= holding.totalInvested > 0
                    ? parseFloat(((profitLoss / holding.totalInvested) * 100).toFixed(2))
                    : 0

                totalCurrentValue += currentValue
                totalInvested     += holding.totalInvested

                return {
                    ...holding.toObject(),
                    currentPrice,
                    currentValue,
                    profitLoss,
                    profitLossPct,
                    dailyChange:    stock ? stock.change        : 0,
                    dailyChangePct: stock ? stock.changePercent : 0
                }
            })
        )

        const totalProfitLoss    = parseFloat((totalCurrentValue - totalInvested).toFixed(2))
        const totalProfitLossPct = totalInvested > 0
            ? parseFloat(((totalProfitLoss / totalInvested) * 100).toFixed(2))
            : 0

        res.status(200).json({
            message: "Portfolio fetched",
            payload: {
                holdings:          enrichedHoldings,
                totalInvested:     parseFloat(totalInvested.toFixed(2)),
                totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
                totalProfitLoss,
                totalProfitLossPct,
                virtualBalance:    portfolio.virtualBalance,
                totalAccountValue: parseFloat((portfolio.virtualBalance + totalCurrentValue).toFixed(2))
            }
        })
    } catch (err) {
        console.log("Portfolio error", err)
        res.status(500).json({ message: "Error fetching portfolio", error: err.message })
    }
})