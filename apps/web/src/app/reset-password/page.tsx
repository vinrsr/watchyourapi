'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/axios'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')

        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, newPassword: form.newPassword })
            router.push('/login?reset=1')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-white/40 text-sm">Invalid reset link.</p>
                <Link href="/forgot-password" className="mt-2 inline-block text-sm text-[#2EDB8F] hover:text-[#7DF0BC] transition-colors">
                    Request a new one
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md relative z-10 px-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                <h1 className="text-2xl font-semibold text-white mb-1">Set new password</h1>
                <p className="text-white/40 text-sm mb-8">Choose a strong password, at least 8 characters</p>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1.5">New password</label>
                        <input
                            type="password"
                            value={form.newPassword}
                            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors"
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1.5">Confirm new password</label>
                        <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors"
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-[#2EDB8F] text-white rounded-lg text-sm font-medium hover:bg-[#25C07A] disabled:opacity-50 transition-colors mt-2"
                    >
                        {loading ? 'Resetting...' : 'Reset password'}
                    </button>
                </form>
            </div>
            <p className="mt-4 text-center text-sm text-white/30">
                <Link href="/login" className="hover:text-white/60 transition-colors">&larr; Back to sign in</Link>
            </p>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-[-100px] left-1/3 w-[500px] h-[500px] bg-[#2EDB8F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#2EDB8F]/15 rounded-full blur-3xl pointer-events-none" />
            <Suspense>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
