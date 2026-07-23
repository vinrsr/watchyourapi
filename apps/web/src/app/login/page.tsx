'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/queries'
import { useAuthStore } from '@/store/auth'
import PasswordInput from '@/components/PasswordInput'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const setAuth = useAuthStore(s => s.setAuth)
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const justReset = searchParams.get('reset') === '1'

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = await authApi.login(form)
            setAuth(data.user, data.accessToken, data.refreshToken)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed')
            setForm(f => ({ ...f, password: '' }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md relative z-10 px-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
                <p className="text-white/40 text-sm mb-8">Sign in to your WatchYourAPI account</p>

                {justReset && (
                    <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-sm">
                        Password reset successfully. Sign in with your new password.
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-white/60">Password</label>
                            <Link href="/forgot-password" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <PasswordInput
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-[#2EDB8F] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#25C07A] disabled:opacity-50 transition-colors mt-2"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/40">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-[#2EDB8F] hover:text-[#7DF0BC] transition-colors">Sign up</Link>
                </p>
            </div>
            <p className="mt-4 text-center text-sm text-white/30">
                <Link href="/" className="hover:text-white/60 transition-colors">Back to home</Link>
            </p>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-[-100px] left-1/3 w-[500px] h-[500px] bg-[#2EDB8F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#2EDB8F]/15 rounded-full blur-3xl pointer-events-none" />
            <Suspense>
                <LoginForm />
            </Suspense>
        </div>
    )
}
