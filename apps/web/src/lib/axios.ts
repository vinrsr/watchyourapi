import axios from 'axios'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh']

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some(path => original?.url?.includes(path))

        if (error.response?.status === 401 && !original._retry && !isPublicAuthRequest) {
            original._retry = true

            try {
                const refreshToken = localStorage.getItem('refreshToken')
                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/refresh`,
                    { refreshToken }
                )

                localStorage.setItem('accessToken', data.accessToken)
                original.headers.Authorization = `Bearer ${data.accessToken}`
                return api(original)
            } catch {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)