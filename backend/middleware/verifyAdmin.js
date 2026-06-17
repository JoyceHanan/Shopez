import { User } from '../models/Schema.js'

export async function verifyAdmin(req, res, next) {
    try {
        const user = await User.findById(req.user.id)
        if (!user || user.usertype !== 'admin')
            return res.status(403).json({ message: 'Access denied: Admins only' })
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Admin verification failed' })
    }
}