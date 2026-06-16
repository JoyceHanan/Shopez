import { Schema, model } from 'mongoose'

const holdingSchema = new Schema({
    stockId: {
        type: Schema.Types.ObjectId,
        ref: "stock",
        required: true
    },
    stockSymbol:    { type: String, required: true, uppercase: true },
    stockName:      { type: String, required: true },
    quantity:       { type: Number, required: true, min: 0 },
    averageBuyPrice:{ type: Number, required: true, min: 0 },
    totalInvested:  { type: Number, required: true, min: 0 }
}, { _id: false })

const portfolioSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User ID required"],
        unique: true
    },
    holdings:          { type: [holdingSchema], default: [] },
    totalInvested:     { type: Number, default: 0 },
    totalCurrentValue: { type: Number, default: 0 },
    totalProfitLoss:   { type: Number, default: 0 },
    virtualBalance:    { type: Number, default: 100000 },  // $1,00,000 starting balance
    lastUpdated:       { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
})


export const PortfolioModel = model("portfolio", portfolioSchema)