'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, X, LayoutDashboard, ArrowLeftRight, CreditCard, Tags, TrendingUp, LogOut } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/cards', icon: CreditCard, label: 'Cards' },
  { href: '/categories', icon: Tags, label: 'Categories' },
  { href: '/investments', icon: TrendingUp, label: 'Investments' },
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
          <Menu size={22} />
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
            <X size={18} />
          </button>
        </div>

        <nav className="mobile-drawer-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-drawer-link${pathname === item.href ? ' active' : ''}`}
              >
                <span className="drawer-icon"><Icon size={19} strokeWidth={2} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-drawer-footer">
          {email && <div className="mobile-drawer-email">{email}</div>}
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={handleLogout}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
