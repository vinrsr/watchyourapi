import Link from 'next/link'
import Image from 'next/image'

const UPTIME_BLOCKS = Array.from({ length: 90 }, (_, i) =>
    i === 22 || i === 61 ? 'down' : 'up'
)

const LATENCY_BARS = [35, 42, 38, 55, 41, 60, 48, 52, 39, 45, 62, 44, 38, 50, 47, 55, 41, 38, 45, 52, 44, 39, 48, 55, 42]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">

            {/* Background glow orbs */}
            <div className="absolute top-[-100px] left-1/3 w-[600px] h-[600px] bg-[#2EDB8F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-[-100px] w-96 h-96 bg-[#2EDB8F]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-[-50px] w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top-right auth links */}
            <div className="absolute top-0 right-0 z-50 px-6 py-5 flex items-center gap-5">
                <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
                    Sign in
                </Link>
                <Link href="/register" className="text-sm text-white/50 hover:text-white transition-colors">
                    Sign up
                </Link>
            </div>

            {/* â”€â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="max-w-5xl mx-auto px-4 pt-20 pb-20 text-center relative z-10">
                <Image
                    src="/logo.png"
                    alt="WatchYourAPI"
                    height={100}
                    width={100}
                    style={{ width: 'auto', height: '100px' }}
                    className="mx-auto mb-6"
                />
                <span className="inline-block mb-5 px-3 py-1 rounded-full bg-white/5 text-[#7DF0BC] text-xs font-medium border border-white/10 backdrop-blur-sm">
                    API Monitoring
                </span>
                <h1 className="text-5xl font-bold text-white mb-5 leading-tight tracking-tight max-w-2xl mx-auto">
                    Know when your APIs go down before your users do
                </h1>
                <p className="text-white/50 mb-10 leading-relaxed max-w-xl mx-auto">
                    Add your endpoints, set an alert email, and get a dashboard with uptime history, response time trends, and a full incident log â€” plus an email the moment anything goes down.
                </p>
                <Link href="/register" className="inline-block px-6 py-2.5 bg-[#2EDB8F] text-white text-sm font-medium rounded-lg hover:bg-[#52E8A5] transition-colors">
                    Start monitoring for free
                </Link>
            </section>

            {/* â”€â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="max-w-5xl mx-auto px-4 pb-20 relative z-10">
                <div className="mb-8">
                    <p className="text-xs font-medium text-[#2EDB8F] uppercase tracking-widest mb-2">Features</p>
                    <h2 className="text-2xl font-semibold text-white">Everything you need to stay on top of your APIs</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {/* Uptime */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                        <div className="w-9 h-9 rounded-lg bg-emerald-400/10 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-white mb-2">Uptime Monitoring</h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-5">
                            Continuous HTTP checks on every endpoint you add. Outages are detected fast and recorded with their exact start and end time.
                        </p>
                        <div className="flex gap-px">
                            {UPTIME_BLOCKS.map((status, i) => (
                                <div key={i} className={`flex-1 h-4 rounded-sm ${status === 'up' ? 'bg-emerald-400/35' : 'bg-red-400/70'}`} />
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm bg-emerald-400/35" />
                                    <span className="text-[10px] text-white/25">Operational</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm bg-red-400/70" />
                                    <span className="text-[10px] text-white/25">Incident</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-white/25">Last 90 days</span>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                        <div className="w-9 h-9 rounded-lg bg-[#2EDB8F]/10 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-[#2EDB8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-white mb-2">Instant Alerts</h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-5">
                            Get notified by email the moment a monitor goes down. Attach alert channels per monitor so the right person gets paged â€” not everyone.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-red-400/15 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-white font-medium">Monitor down</div>
                                    <div className="text-[10px] text-white/30 mt-0.5">Incident detected</div>
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-violet-400/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-[#2EDB8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs text-white font-medium">Email sent</div>
                                    <div className="text-[10px] text-white/30 mt-0.5">Alert dispatched</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Response times */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                        <div className="w-9 h-9 rounded-lg bg-[#2EDB8F]/10 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-[#2EDB8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-white mb-2">Response Time Trends</h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-4">Spot latency degradation before it becomes a full outage.</p>
                        <div className="flex items-end gap-px h-12">
                            {LATENCY_BARS.map((h, i) => (
                                <div key={i} className="flex-1 bg-[#52E8A5]/30 rounded-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>

                    {/* Incident history */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                        <div className="w-9 h-9 rounded-lg bg-red-400/10 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-white mb-2">Incident History</h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-5">Full log of every downtime event â€” when it started, how long it lasted, and when it resolved.</p>
                        <div className="space-y-2">
                            {[
                                { dot: 'bg-emerald-400', label: 'Incident resolved', sub: 'Duration recorded Â· Root cause logged' },
                                { dot: 'bg-emerald-400', label: 'Incident resolved', sub: 'Duration recorded Â· Root cause logged' },
                                { dot: 'bg-red-400', label: 'Incident ongoing', sub: 'Started tracking Â· Alert sent' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${row.dot}`} />
                                    <div>
                                        <div className="text-xs text-white/60 font-medium">{row.label}</div>
                                        <div className="text-[10px] text-white/25 mt-0.5">{row.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* â”€â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="max-w-5xl mx-auto px-4 pb-20 relative z-10">
                <div className="mb-8">
                    <p className="text-xs font-medium text-[#2EDB8F] uppercase tracking-widest mb-2">How it works</p>
                    <h2 className="text-2xl font-semibold text-white">Designed to never miss a thing</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-amber-400', bg: 'bg-amber-400/10', value: '24/7', label: 'Monitors run continuously â€” no schedules, no gaps' },
                        { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-400', bg: 'bg-blue-400/10', value: '<1 min', label: 'From a failed check to an alert in your inbox' },
                        { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', color: 'text-emerald-400', bg: 'bg-emerald-400/10', value: '30 sec', label: 'Minimum check interval â€” catch outages fast' },
                    ].map(({ icon, color, bg, value, label }) => (
                        <div key={value} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col justify-between">
                            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                                <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                                </svg>
                            </div>
                            <div className="mt-8">
                                <div className="text-4xl font-bold text-white mb-2">{value}</div>
                                <div className="text-sm text-white/40">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* â”€â”€â”€ How it works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="max-w-5xl mx-auto px-4 pb-20 relative z-10">
                <div className="mb-8">
                    <p className="text-xs font-medium text-[#2EDB8F] uppercase tracking-widest mb-2">Get started</p>
                    <h2 className="text-2xl font-semibold text-white">Up and running in minutes</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { n: '01', title: 'Add a monitor', desc: 'Enter your endpoint URL and choose a check interval. Monitoring starts immediately.' },
                        { n: '02', title: 'Set up alerts', desc: 'Add an email alert channel and attach it to any monitor. No missed incidents.' },
                        { n: '03', title: 'Track incidents', desc: 'View the full log of downtime events, durations, and resolution times on your dashboard.' },
                    ].map(({ n, title, desc }) => (
                        <div key={n} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                            <div className="text-xs font-mono text-white/20 mb-6">{n}</div>
                            <h3 className="font-semibold text-white mb-2">{title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* â”€â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="max-w-5xl mx-auto px-4 pb-24 relative z-10">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-16 text-center">
                    <h2 className="text-2xl font-semibold text-white mb-3">Ready to monitor your APIs?</h2>
                    <p className="text-white/40 text-sm mb-8">Create an account and add your first monitor in under a minute.</p>
                    <Link href="/register" className="inline-block px-6 py-2.5 bg-[#2EDB8F] text-white text-sm font-medium rounded-lg hover:bg-[#52E8A5] transition-colors">
                        Get started free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 relative z-10">
                <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
                    <span className="text-sm text-white/20">WatchYourAPI</span>
                    <span className="text-xs text-white/20">API uptime monitoring</span>
                </div>
            </footer>

        </div>
    )
}
