'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { monitorsApi, incidentsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'

export default function DashboardPage() {
    const [userId, setUserId] = useState<string | null>(null)
    useEffect(() => { setUserId(localStorage.getItem('userId')) }, [])
    const { data: monitors = [], isLoading } = useQuery({
        queryKey: ['monitors'],
        queryFn: monitorsApi.list,
    })

    const { data: incidents = [] } = useQuery({
        queryKey: ['incidents'],
        queryFn: incidentsApi.all,
    })

    const total = monitors.length
    const down = monitors.filter((m: any) => m.status === 'down').length
    const paused = monitors.filter((m: any) => m.status === 'paused').length
    const up = total - down - paused
    const openIncidents = incidents.filter((i: any) => !i.resolvedAt).length

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="text-sm text-white/40">Loading...</div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Overview</h1>
                    <p className="text-white/40 text-sm mt-1">Your API monitoring at a glance</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total monitors', value: total, color: 'text-white' },
                        { label: 'Operational', value: up, color: 'text-emerald-400' },
                        { label: 'Down', value: down, color: 'text-red-400' },
                        { label: 'Open incidents', value: openIncidents, color: 'text-amber-400' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
                            <p className="text-sm text-white/40">{stat.label}</p>
                            <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-medium text-white">Monitors</h2>
                        <Link href="/monitors" className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                            View all
                        </Link>
                    </div>
                    {monitors.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-white/40 text-sm">No monitors yet</p>
                            <Link href="/monitors" className="mt-2 inline-block text-sm text-[#2EDB8F] hover:text-[#7DF0BC] transition-colors">
                                Add your first monitor
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {monitors.slice(0, 5).map((monitor: any) => (
                                <Link
                                    key={monitor.id}
                                    href={`/monitors/${monitor.id}`}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">{monitor.name}</p>
                                        <p className="text-xs text-white/30 mt-0.5">{monitor.url}</p>
                                    </div>
                                    <StatusBadge status={monitor.status} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {userId && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Your public status page</p>
                            <p className="text-xs text-white/30 mt-0.5">Share this link so others can check your API status</p>
                        </div>
                        <Link
                            href={`/status/${userId}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0 ml-4"
                        >
                            View status page &#8599;
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
        down: 'bg-red-400/10 text-red-400 border-red-400/20',
        paused: 'bg-white/5 text-white/40 border-white/10',
    }
    const labels: Record<string, string> = {
        active: 'Operational',
        down: 'Down',
        paused: 'Paused',
    }
    return (
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${styles[status] || styles.paused}`}>
            {labels[status] || status}
        </span>
    )
}
