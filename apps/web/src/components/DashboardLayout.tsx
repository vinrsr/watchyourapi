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
        { href: '/settings', label: 'Settings' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="font-semibold text-gray-900">WatchYourAPI</span>
                        <div className="flex items-center gap-1">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname === item.href
                                        ? 'bg-gray-100 text-gray-900 font-medium'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>
            <main className="max-w-6xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}