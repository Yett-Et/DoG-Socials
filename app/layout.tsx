import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dreaming of Greece — Social Calendar',
  description: 'Social media posting calendar for the Dreaming of Greece event, Apr 14–18',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
