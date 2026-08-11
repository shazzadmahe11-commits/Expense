import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Track your monthly expenses, card spending, and net amount.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
