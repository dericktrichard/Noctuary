import type { Metadata } from 'next';
import { Nunito, Philosopher } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const philosopher = Philosopher({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-philosopher',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Noctuary - Human Ink, Soul Scripted',
  description: 'Premium poetry commission platform. Every poem is crafted by human hands, never by algorithms. Order custom or quick poems for any occasion.',
  keywords: ['poetry', 'custom poems', 'commission poetry', 'human-written', 'poet for hire', 'bespoke poetry'],
  authors: [{ name: 'Noctuary' }],
  openGraph: {
    title: 'Noctuary - Human Ink, Soul Scripted',
    description: 'Commission premium, human-written poetry crafted with intention.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noctuary - Human Ink, Soul Scripted',
    description: 'Commission premium, human-written poetry crafted with intention.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${philosopher.variable} ${nunito.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}