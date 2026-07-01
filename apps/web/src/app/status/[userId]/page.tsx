import { notFound } from 'next/navigation'

interface Monitor {
    id: string
    name: string
    url: string
    status: 'active' | 'down' | 'paused'
    lastCheckedAt: string | null
}

interface StatusData {
    user: { name: string }
    overall: 'operational' | 'degraded'
    monitors: Monitor[]
}

async function getStatus(userId: string): Promise<StatusData | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status/${userId}`, {
            next: { revalidate: 30 },
        })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}

export default async function StatusPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params
    const data = await getStatus(userId)
    if (!data) notFound()

    const isOperational = data.overall === 'operational'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
            <div className="fixed top-[-100px] left-1/3 w-[500px] h-[500px] bg-[#2EDB8F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#2EDB8F]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto px-4 py-16 relative z-10">
                <div className="mb-10">
                    <p className="text-white/40 text-sm mb-1">{data.user.name}</p>
                    <h1 className="text-3xl font-semibold text-white">System Status</h1>
                    <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border ${
                        isOperational
                            ? 'bg-emerald-400/10 border-emerald-400/20'
                            : 'bg-red-400/10 border-red-400/20'
                    }`}>
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isOperational ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
                        }`} />
                        <span className={`text-sm font-medium ${isOperational ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isOperational ? 'All systems operational' : 'Partial outage detected'}
                        </span>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 divide-y divide-white/10">
                    {data.monitors.length === 0 ? (
                        <div className="px-6 py-10 text-center text-white/30 text-sm">No monitors configured</div>
                    ) : (
                        data.monitors.map(monitor => (
                            <div key={monitor.id} className="flex items-center justify-between px-6 py-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white">{monitor.name}</p>
                                    <p className="text-xs text-white/30 mt-0.5 truncate">{monitor.url}</p>
                                </div>
                                <StatusBadge status={monitor.status} />
                            </div>
                        ))
                    )}
                </div>

                <p className="mt-8 text-center text-xs text-white/20">
                    Last updated {new Date().toUTCString()} &middot; Powered by WatchYourAPI
                </p>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        active: { label: 'Operational', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
        down:   { label: 'Down',        cls: 'bg-red-400/10 text-red-400 border-red-400/20' },
        paused: { label: 'Paused',      cls: 'bg-white/5 text-white/40 border-white/10' },
    }
    const { label, cls } = map[status] ?? map.paused
    return (
        <span className={`text-xs px-2 py-1 rounded-full border font-medium flex-shrink-0 ml-4 ${cls}`}>
            {label}
        </span>
    )
}