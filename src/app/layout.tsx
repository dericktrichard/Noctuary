import type { Metadata } from 'next';
import { Nunito, Philosopher } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

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
  title: 'Noctuary - human Ink_Soul.',
  description: 'Honest poetry commission platform. Every poem is crafted by human hands, never by algorithms. Order custom or quick poems for any occasion.',
  keywords: ['poetry', 'custom poems', 'commission poetry', 'human-written', 'poet for hire'],
  authors: [{ name: 'Noctuary' }],
  openGraph: {
    title: 'Noctuary - Human Ink_Soul',
    description: 'Commission honest, human-written poetry for your heart.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noctuary - Human Ink_Soul',
    description: 'Commission honest, human-written poetry for your heart.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${philosopher.variable} ${nunito.variable} font-serif antialiased`}>
        {children}
      </body>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        strategy="lazyOnload"
      />
    </html>
  );
}