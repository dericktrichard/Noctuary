import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Noctuary - Human Ink, Digital Canvas',
  description: 'Premium poetry commission platform. Every poem is crafted by human hands, never by algorithms. Order custom or quick poems for any occasion.',
  keywords: ['poetry', 'custom poems', 'commission poetry', 'human-written', 'poet for hire'],
  authors: [{ name: 'Noctuary' }],
  openGraph: {
    title: 'Noctuary - Human Ink, Digital Canvas',
    description: 'Commission authentic, human-written poetry for any occasion.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noctuary - Human Ink, Digital Canvas',
    description: 'Commission authentic, human-written poetry for any occasion.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
