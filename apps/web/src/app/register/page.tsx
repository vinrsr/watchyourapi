'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/queries'
import { useAuthStore } from '@/store/auth'
import PasswordInput from '@/components/PasswordInput'

export default function RegisterPage() {
    const router = useRouter()
    const setAuth = useAuthStore(s => s.setAuth)
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = await authApi.register(form)
            setAuth(data.user, data.accessToken, data.refreshToken)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex items-center justify-center">

            {/* Background glow orbs */}
            <div className="absolute top-[-100px] left-1/3 w-[500px] h-[500px] bg-[#2EDB8F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#2EDB8F]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                    <h1 className="text-2xl font-semibold text-white mb-1">Create an account</h1>
                    <p className="text-white/40 text-sm mb-8">Start monitoring your APIs for free</p>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors"
                                placeholder="Your name"
                                autoComplete="name"
                                required
                            />
                        </div>
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
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
                            <PasswordInput
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors"
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                                required
                                minLength={8}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-[#2EDB8F] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#52E8A5] disabled:opacity-50 transition-colors mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/40">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#2EDB8F] hover:text-[#7DF0BC] transition-colors">Sign in</Link>
                    </p>
                </div>
                <p className="mt-4 text-center text-sm text-white/30">
                    <Link href="/" className="hover:text-white/60 transition-colors">Back to home</Link>
                </p>
            </div>
        </div>
    )
}
