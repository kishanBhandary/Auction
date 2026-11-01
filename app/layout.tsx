import type { Metadata } from 'next';
import { Barlow_Condensed, Inter, Orbitron, Rajdhani } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const rajdhani = Rajdhani({
  variable: '--font-rajdhani',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Narayana Guru Premier League Auction',
  description: 'Live player auction platform for the Narayana Guru Premier League.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${rajdhani.variable} ${orbitron.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
