import type { Metadata } from 'next';
import { Nunito, Philosopher } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/theme-provider';
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
  title: 'Noctuary Ink - Soul Scripted',
  description: 'Premium poetry commission platform. Every poem is crafted by human hands, never by algorithms. Order custom or quick poems for any occasion.',
  keywords: ['poetry', 'custom poems', 'commission poetry', 'human-written', 'poet for hire', 'bespoke poetry'],
  authors: [{ name: 'Noctuary' }],
  openGraph: {
    title: 'Noctuary Ink - Soul Scripted',
    description: 'Commission premium, human-written poetry crafted with intention.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noctuary Ink - Soul Scripted',
    description: 'Commission premium, human-written poetry crafted with intention.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${philosopher.variable} ${nunito.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Script
            src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
            strategy="lazyOnload"
          />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}