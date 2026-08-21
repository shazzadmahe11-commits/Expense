import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import GlobalAddTransactionModal from '@/components/GlobalAddTransactionModal';
import { TransactionModalProvider } from '@/lib/transaction-modal-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gorib.com',
  description: 'Track your monthly expenses, card spending, and net amount.',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#12141a',
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
                if (meta) meta.setAttribute('content', isLight ? '#f7f8fb' : '#12141a');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <TransactionModalProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
          <MobileNav />
          <GlobalAddTransactionModal />
        </TransactionModalProvider>
      </body>
    </html>
  );
}
