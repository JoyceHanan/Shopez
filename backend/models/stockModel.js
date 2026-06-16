import { Schema, model } from 'mongoose'

const historicalDataSchema = new Schema({
    date: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low:  { type: Number, required: true },
    close:{ type: Number, required: true },
    volume:{ type: Number, default: 0 }
}, { _id: false })

const stockSchema = new Schema({
    symbol: {
        type: String,
        required: [true, "Symbol required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, "Company name required"],
        trim: true
    },
    currentPrice: {
        type: Number,
        required: [true, "Current price required"],
        min: 0
    },
    previousClose: { type: Number, default: 0 },
    openPrice:     { type: Number, default: 0 },
    dayHigh:       { type: Number, default: 0 },
    dayLow:        { type: Number, default: 0 },
    volume:        { type: Number, default: 0 },
    marketCap:     { type: Number, default: 0 },
    change:        { type: Number, default: 0 },
    changePercent: { type: Number, default: 0 },
    sector:        { type: String, default: "Technology" },
    description:   { type: String, default: "" },
    historicalData: [historicalDataSchema],
    isActive:      { type: Boolean, default: true },
    lastUpdated:   { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
})

stockSchema.index({ symbol: 1 })
stockSchema.index({ name: 'text', symbol: 'text' })

export const StockModel = model("stock", stockSchema)