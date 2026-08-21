import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import GlobalAddTransactionModal from '@/components/GlobalAddTransactionModal';
import { TransactionModalProvider } from '@/lib/transaction-modal-context';
import { PrivacyProvider } from '@/lib/privacy-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gorib.com',
  description: 'Track your monthly expenses, card spending, and net amount.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1c1f27',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                var isLight = t === 'light';
                if (isLight) document.documentElement.setAttribute('data-theme', 'light');
                var meta = document.querySelector('meta[name="theme-color"]');
                if (meta) meta.setAttribute('content', isLight ? '#ffffff' : '#1c1f27');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <PrivacyProvider>
        <TransactionModalProvider>
          <div className="app-layout">
            <TopBar />
            <main className="main-content">
              {children}
            </main>
          </div>
          <MobileNav />
          <GlobalAddTransactionModal />
        </TransactionModalProvider>
        </PrivacyProvider>
      </body>
    </html>
  );
}
