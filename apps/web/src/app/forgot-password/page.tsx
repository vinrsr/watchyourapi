'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/axios'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
        } catch {
            // swallow - we always show success to avoid leaking email existence
        } finally {
            setLoading(false)
            setSubmitted(true)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-[-100px] left-1/3 w-[500px] h-[500px] bg-[#2EDB8F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#2EDB8F]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                    {submitted ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                                <span className="text-emerald-400 text-xl">&#10003;</span>
                            </div>
                            <h1 className="text-xl font-semibold text-white mb-2">Check your email</h1>
                            <p className="text-white/40 text-sm">
                                If that email address is registered, we&apos;ve sent a password reset link. Check your inbox.
                            </p>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-semibold text-white mb-1">Forgot password</h1>
                            <p className="text-white/40 text-sm mb-8">Enter your email and we&apos;ll send a reset link</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 px-4 bg-[#2EDB8F] text-white rounded-lg text-sm font-medium hover:bg-[#25C07A] disabled:opacity-50 transition-colors mt-2"
                                >
                                    {loading ? 'Sending...' : 'Send reset link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
                <p className="mt-4 text-center text-sm text-white/30">
                    <Link href="/login" className="hover:text-white/60 transition-colors">&larr; Back to sign in</Link>
                </p>
            </div>
        </div>
    )
}
