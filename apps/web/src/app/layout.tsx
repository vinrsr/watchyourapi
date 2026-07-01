import type { Metadata } from 'next'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
    title: { default: 'WatchYourAPI', template: '%s | WatchYourAPI' },
    description: 'API monitoring that alerts you the moment your endpoints go down.',
    icons: { icon: '/favicon-32x32.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
