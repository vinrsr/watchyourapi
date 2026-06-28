import bcrypt from 'bcryptjs'
import { createUser, findUserByEmail, saveRefreshToken, deleteRefreshToken, findRefreshToken } from '../db/queries/users'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'

export async function register(email: string, password: string, name: string) {
    const existing = await findUserByEmail(email)
    if (existing) throw new Error('Email already in use')

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await createUser(email, passwordHash, name)

    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await saveRefreshToken(user.id, refreshToken, expiresAt)

    return { user, accessToken, refreshToken }
}

export async function login(email: string, password: string) {
    const user = await findUserByEmail(email)
    if (!user) throw new Error('Invalid email or password')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new Error('Invalid email or password')

    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await saveRefreshToken(user.id, refreshToken, expiresAt)

    const { passwordHash, ...safeUser } = user
    return { user: safeUser, accessToken, refreshToken }
}

export async function refresh(refreshToken: string) {
    const stored = await findRefreshToken(refreshToken)
    if (!stored) throw new Error('Invalid refresh token')

    try {
        const payload = verifyRefreshToken(refreshToken)
        const accessToken = signAccessToken(payload.userId)
        return { accessToken }
    } catch {
        throw new Error('Invalid refresh token')
    }
}

export async function logout(refreshToken: string) {
    await deleteRefreshToken(refreshToken)
}