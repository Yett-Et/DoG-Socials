import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moments. Gallery — Social Calendar',
  description: 'Social media planning calendar for campaigns and events',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
