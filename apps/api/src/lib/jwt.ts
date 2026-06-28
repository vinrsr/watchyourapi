import jwt, { SignOptions } from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export function signAccessToken(userId: string) {
    const options: SignOptions = {
        expiresIn: '15m'
    }
    return jwt.sign({ userId }, ACCESS_SECRET, options)
}

export function signRefreshToken(userId: string) {
    const options: SignOptions = {
        expiresIn: '7d'
    }
    return jwt.sign({ userId }, REFRESH_SECRET, options)
}

export function verifyAccessToken(token: string): { userId: string } {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string }
}

export function verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string }
}