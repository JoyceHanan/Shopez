import mongoose from 'mongoose'

// ── USER ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    usertype: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshToken: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false })

// ── ADMIN ─────────────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
    banner:     { type: String, default: '' },
    categories: { type: Array, default: [] }
}, { timestamps: true, versionKey: false })

// ── PRODUCT ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    mainImg:     { type: String, required: true },
    carousel:    { type: Array, default: [] },
    sizes:       { type: Array, default: [] },       // e.g. ['S','M','L','XL']
    category:    { type: String, required: true },
    gender:      { type: String, enum: ['Men', 'Women', 'Unisex', 'Kids'], default: 'Unisex' },
    price:       { type: Number, required: true, min: 0 },
    discount:    { type: Number, default: 0, min: 0, max: 100 },
    isActive:    { type: Boolean, default: true }
}, { timestamps: true, versionKey: false })

// Virtual: discounted price
productSchema.virtual('finalPrice').get(function () {
    return parseFloat((this.price - (this.price * this.discount) / 100).toFixed(2))
})

// ── CART ──────────────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    title:       { type: String, required: true },
    description: { type: String },
    mainImg:     { type: String },
    size:        { type: String, default: '' },
    quantity:    { type: Number, default: 1, min: 1 },
    price:       { type: Number, required: true },
    discount:    { type: Number, default: 0 }
}, { timestamps: true, versionKey: false })

// ── ORDER ─────────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    name:          { type: String, required: true },
    email:         { type: String, required: true },
    mobile:        { type: String, required: true },
    address:       { type: String, required: true },
    pincode:       { type: String, required: true },
    // Product snapshot (stored so order remains accurate if product changes)
    title:         { type: String, required: true },
    description:   { type: String },
    mainImg:       { type: String },
    size:          { type: String, default: '' },
    quantity:      { type: Number, required: true, min: 1 },
    price:         { type: Number, required: true },
    discount:      { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
    orderDate:     { type: Date, default: Date.now },
    deliveryDate:  { type: String, default: '' },
    orderStatus:   { type: String, enum: ['order placed', 'shipped', 'out for delivery', 'delivered', 'cancelled'], default: 'order placed' }
}, { timestamps: true, versionKey: false })

export const User    = mongoose.model('users',    userSchema)
export const Admin   = mongoose.model('admin',    adminSchema)
export const Product = mongoose.model('products', productSchema)
export const Cart    = mongoose.model('cart',     cartSchema)
export const Orders  = mongoose.model('orders',   orderSchema)