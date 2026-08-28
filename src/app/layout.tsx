import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SupaFlow AI',
  description: 'SupaFlow V2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}   