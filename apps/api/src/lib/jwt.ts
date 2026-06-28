import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export function signAccessToken(userId: string) {
    return jwt.sign({ userId }, ACCESS_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    })
}

export function signRefreshToken(userId: string) {
    return jwt.sign({ userId }, REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    })
}

export function verifyAccessToken(token: string): { userId: string } {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string }
}

export function verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string }
}