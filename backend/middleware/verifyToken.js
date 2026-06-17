import jwt from 'jsonwebtoken'
const { verify } = jwt

export function verifyToken(req, res, next) {
    const token = req.cookies.token
    if (!token)
        return res.status(401).json({ message: 'Please login to continue' })
    try {
        const decoded = verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Session expired, please re-login' })
    }
}