'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { incidentsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'
import PageLoading from '@/components/PageLoading'

export default function IncidentsPage() {
    const { data: incidents = [], isLoading } = useQuery({
        queryKey: ['incidents'],
        queryFn: incidentsApi.all,
        refetchInterval: 30_000,
    })

    const open = incidents.filter((i: any) => !i.resolvedAt)
    const resolved = incidents.filter((i: any) => i.resolvedAt)

    if (isLoading) {
        return (
            <DashboardLayout>
                <PageLoading />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Incidents</h1>
                    <p className="text-white/40 text-sm mt-1">
                        {open.length > 0 ? `${open.length} ongoing` : 'All systems operational'}
                    </p>
                </div>

                {open.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/20">
                        <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                            <h2 className="font-medium text-white">Ongoing</h2>
                        </div>
                        <div className="divide-y divide-white/10">
                            {open.map((incident: any) => (
                                <IncidentRow key={incident.id} incident={incident} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="px-4 sm:px-6 py-4 border-b border-white/10">
                        <h2 className="font-medium text-white">History</h2>
                    </div>
                    {resolved.length === 0 ? (
                        <div className="px-4 sm:px-6 py-8 text-center text-sm text-white/30">
                            No resolved incidents yet
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {resolved.map((incident: any) => (
                                <IncidentRow key={incident.id} incident={incident} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

function IncidentRow({ incident }: { incident: any }) {
    const duration = incident.durationSeconds
        ? incident.durationSeconds < 60
            ? `${incident.durationSeconds}s`
            : `${Math.round(incident.durationSeconds / 60)}m`
        : null

    return (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4">
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <Link
                        href={`/monitors/${incident.monitor?.id ?? ''}`}
                        className="text-sm font-medium text-white hover:text-[#7DF0BC] transition-colors"
                    >
                        {incident.monitor?.name ?? 'Unknown monitor'}
                    </Link>
                    {!incident.resolvedAt && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20 font-medium">
                            Ongoing
                        </span>
                    )}
                </div>
                <p className="text-xs text-white/40 mt-0.5">{incident.cause}</p>
                <p className="text-xs text-white/25 mt-0.5">
                    {new Date(incident.startedAt).toLocaleString()}
                </p>
            </div>
            <div className="text-right flex-shrink-0">
                {incident.resolvedAt ? (
                    <>
                        <p className="text-xs text-emerald-400 font-medium">Resolved</p>
                        {duration && <p className="text-xs text-white/30 mt-0.5">{duration} downtime</p>}
                    </>
                ) : (
                    <p className="text-xs text-red-400/60">
                        {formatElapsed(incident.startedAt)}
                    </p>
                )}
            </div>
        </div>
    )
}

function formatElapsed(startedAt: string) {
    const seconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
}
