import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'Supaflow AI Trading Lab',description:'Free local AI trading strategy research and backtesting lab'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
