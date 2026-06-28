import { eq } from 'drizzle-orm'
import { db } from '../index'
import { users, refreshTokens } from '../schema'

export async function createUser(email: string, passwordHash: string, name: string) {
    const result = await db.insert(users).values({ email, passwordHash, name }).returning()
    return result[0]
}

export async function findUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] || null
}

export async function findUserById(id: string) {
    const result = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id))
    return result[0] || null
}

export async function saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    await db.insert(refreshTokens).values({ userId, token, expiresAt })
}

export async function deleteRefreshToken(token: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token))
}

export async function findRefreshToken(token: string) {
    const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token))
    return result[0] || null
}