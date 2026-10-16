import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'CHAMBER — The Court of Agent Accountability', description: 'Fund mandates. Trace authority. Settle responsibility. A working GenLayer application for bonded agent delegation and GEN settlement.', icons: {icon:'/icon.svg'} };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
