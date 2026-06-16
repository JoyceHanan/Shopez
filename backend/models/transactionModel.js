import { Schema, model } from 'mongoose'

const transactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User ID required"]
    },
    stockId: {
        type: Schema.Types.ObjectId,
        ref: "stock",
        required: [true, "Stock ID required"]
    },
    stockSymbol: {
        type: String,
        required: [true, "Stock symbol required"],
        uppercase: true
    },
    stockName: {
        type: String,
        required: [true, "Stock name required"]
    },
    type: {
        type: String,
        enum: ["BUY", "SELL"],
        required: [true, "Transaction type required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity required"],
        min: [1, "Quantity must be at least 1"]
    },
    pricePerShare: {
        type: Number,
        required: [true, "Price per share required"],
        min: 0
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount required"]
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "CANCELLED"],
        default: "COMPLETED"
    },
    balanceAfter: {
        type: Number,
        required: [true, "Balance after trade required"]
    }
}, {
    timestamps: true,
    versionKey: false
})

transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ stockSymbol: 1 })

export const TransactionModel = model("transaction", transactionSchema)