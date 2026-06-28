'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { monitorsApi, incidentsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'

export default function DashboardPage() {
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
        return <div className="text-sm text-gray-500">Loading...</div>
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Your API monitoring at a glance</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total monitors', value: total, color: 'text-gray-900' },
                        { label: 'Operational', value: up, color: 'text-green-600' },
                        { label: 'Down', value: down, color: 'text-red-600' },
                        { label: 'Open incidents', value: openIncidents, color: 'text-amber-600' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-medium text-gray-900">Monitors</h2>
                        <Link href="/monitors" className="text-sm text-blue-600 hover:underline">View all</Link>
                    </div>
                    {monitors.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500 text-sm">No monitors yet</p>
                            <Link href="/monitors" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                                Add your first monitor
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {monitors.slice(0, 5).map((monitor: any) => (
                                <Link
                                    key={monitor.id}
                                    href={`/monitors/${monitor.id}`}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{monitor.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{monitor.url}</p>
                                    </div>
                                    <StatusBadge status={monitor.status} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-green-50 text-green-700 border-green-200',
        down: 'bg-red-50 text-red-700 border-red-200',
        paused: 'bg-gray-50 text-gray-600 border-gray-200',
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