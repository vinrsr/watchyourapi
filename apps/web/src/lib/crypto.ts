export async function hashPassword(password: string, email: string): Promise<string> {
    const encoder = new TextEncoder()

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    )

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: encoder.encode(email.toLowerCase() + ':watchyourapi'),
            iterations: 100_000,
            hash: 'SHA-256',
        },
        keyMaterial,
        256
    )

    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}
