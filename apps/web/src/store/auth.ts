import { create } from 'zustand'

interface User {
    id: string
    email: string
    name: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    setAuth: (user: User, accessToken: string, refreshToken: string) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,

    setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('userId', user.id)
        set({ user, accessToken })
    },

    clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userId')
        set({ user: null, accessToken: null })
    },
}))