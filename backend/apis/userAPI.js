import exp from 'express'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/Schema.js'
import { verifyToken } from '../middleware/verifyToken.js'

const { sign, verify } = jwt
export const userApp = exp.Router()

const COOKIE_OPTS = {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,   // set true in production (HTTPS)
}

const generateTokens = (user) => {
    const token = sign(
        { id: user._id, email: user.email, usertype: user.usertype },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    )
    const refreshToken = sign(
        { id: user._id },
        process.env.JWT_REFRESH,
        { expiresIn: '7d' }
    )
    return { token, refreshToken }
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
userApp.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body
        if (!username || !email || !password)
            return res.status(400).json({ message: 'All fields are required' })

        const exists = await User.findOne({ email })
        if (exists)
            return res.status(400).json({ message: 'Email already registered' })

        const hashedPwd = await hash(password, 12)
        const newUser = await User.create({ username, email, password: hashedPwd })

        res.status(201).json({ message: 'Registration successful. Please login.' })
    } catch (err) {
        console.log('Register error', err)
        res.status(500).json({ message: err.message || 'Registration failed' })
    }
})

// ── LOGIN ─────────────────────────────────────────────────────────────────────
userApp.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' })

        const user = await User.findOne({ email })
        if (!user)
            return res.status(401).json({ message: 'Invalid email or password' })

        if (!user.isActive)
            return res.status(403).json({ message: 'Account deactivated. Contact admin.' })

        const match = await compare(password, user.password)
        if (!match)
            return res.status(401).json({ message: 'Invalid email or password' })

        const { token, refreshToken } = generateTokens(user)
        user.refreshToken = refreshToken
        await user.save()

        const userObj = user.toObject()
        delete userObj.password
        delete userObj.refreshToken

        res
            .cookie('token', token, { ...COOKIE_OPTS, maxAge: 2 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .status(200)
            .json({ message: 'Login successful', payload: userObj })
    } catch (err) {
        console.log('Login error', err)
        res.status(500).json({ message: err.message || 'Login failed' })
    }
})

// ── LOGOUT ────────────────────────────────────────────────────────────────────
userApp.get('/logout', async (req, res) => {
    try {
        const rt = req.cookies.refreshToken
        if (rt) {
            const user = await User.findOne({ refreshToken: rt })
            if (user) { user.refreshToken = null; await user.save() }
        }
        res
            .clearCookie('token', COOKIE_OPTS)
            .clearCookie('refreshToken', COOKIE_OPTS)
            .status(200)
            .json({ message: 'Logged out successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Logout failed' })
    }
})

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
userApp.post('/refresh', async (req, res) => {
    try {
        const rt = req.cookies.refreshToken
        if (!rt) return res.status(401).json({ message: 'No refresh token' })

        const decoded = verify(rt, process.env.JWT_REFRESH)
        const user = await User.findById(decoded.id)
        if (!user || user.refreshToken !== rt)
            return res.status(403).json({ message: 'Invalid refresh token' })

        const { token, refreshToken } = generateTokens(user)
        user.refreshToken = refreshToken
        await user.save()

        res
            .cookie('token', token, { ...COOKIE_OPTS, maxAge: 2 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .status(200)
            .json({ message: 'Token refreshed' })
    } catch (err) {
        res.status(401).json({ message: 'Token refresh failed' })
    }
})

// ── CHECK AUTH ────────────────────────────────────────────────────────────────
userApp.get('/check-auth', async (req, res) => {
    try {
        const token = req.cookies.token
        if (!token) return res.status(401).json({ message: 'Not authenticated' })

        const decoded = verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password -refreshToken')
        if (!user || !user.isActive)
            return res.status(401).json({ message: 'User not found' })

        res.status(200).json({ message: 'Authenticated', payload: user })
    } catch (err) {
        res.status(401).json({ message: 'Not authenticated' })
    }
})

// ── GET PROFILE ───────────────────────────────────────────────────────────────
userApp.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.status(200).json({ message: 'Profile fetched', payload: user })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' })
    }
})

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
userApp.put('/profile', verifyToken, async (req, res) => {
    try {
        const { username } = req.body
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username },
            { new: true }
        ).select('-password -refreshToken')
        res.status(200).json({ message: 'Profile updated', payload: user })
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile' })
    }
})

// ── GET USER ORDERS (profile section) ────────────────────────────────────────
// This is a convenience endpoint; full orders are in orderAPI
import { Orders } from '../models/Schema.js'
userApp.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const orders = await Orders.find({ userId: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json({ message: 'Orders fetched', payload: orders })
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' })
    }
})