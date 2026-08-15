'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { href: '/', icon: '🏠', label: 'Dashboard' },
  { href: '/transactions', icon: '💸', label: 'Transactions' },
  { href: '/cards', icon: '💳', label: 'Cards' },
  { href: '/categories', icon: '🏷️', label: 'Categories' },
  { href: '/investments', icon: '📈', label: 'Investments' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <header className="mobile-topbar">
        <button className="mobile-topbar-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <Link href="/" className="mobile-topbar-title" style={{ flex: 1, textDecoration: 'none' }}>Gorib</Link>
        <ThemeToggle />
      </header>

      {open && <div className="mobile-drawer-overlay" onClick={() => setOpen(false)} />}

      <aside className={`mobile-drawer${open ? ' open' : ''}`}>
        <div className="mobile-drawer-header">
          <div>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="mobile-drawer-logo">Gorib</div>
            </Link>
            <div className="mobile-drawer-sub">Personal Finance Tracker</div>
          </div>
          <button className="mobile-drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="mobile-drawer-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-drawer-link${pathname === item.href ? ' active' : ''}`}
            >
              <span className="drawer-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mobile-drawer-footer">
          {email && <div className="mobile-drawer-email">{email}</div>}
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
