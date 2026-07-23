'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/queries'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, clearAuth } = useAuthStore()

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (!token) router.push('/login')
    }, [router])

    async function handleLogout() {
        const refreshToken = localStorage.getItem('refreshToken') || ''
        await authApi.logout(refreshToken)
        clearAuth()
        router.push('/login')
    }

    const navItems = [
        { href: '/dashboard', label: 'Overview' },
        { href: '/monitors', label: 'Monitors' },
        { href: '/incidents', label: 'Incidents' },
        { href: '/settings', label: 'Settings' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            {/* Fixed background orbs */}
            <div className="fixed top-[-100px] left-1/3 w-[600px] h-[600px] bg-[#2EDB8F]/20 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="fixed top-1/2 right-[-100px] w-96 h-96 bg-[#2EDB8F]/15 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="fixed bottom-0 left-[-50px] w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />

            <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="font-semibold text-[#2EDB8F]">WatchYourAPI</span>
                        <div className="flex items-center gap-1">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname === item.href
                                        ? 'bg-white/10 text-white font-medium'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-[#2EDB8F] flex-shrink-0" />
                            <span className="text-sm text-white/70" title="Signed in as">{user?.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-white/50 hover:text-white transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                {children}
            </main>
        </div>
    )
}
