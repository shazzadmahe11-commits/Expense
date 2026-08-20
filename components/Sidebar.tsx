'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import { useTransactionModal } from '@/lib/transaction-modal-context';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Tags, TrendingUp, LogOut, Plus } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/cards', icon: CreditCard, label: 'Cards' },
  { href: '/categories', icon: Tags, label: 'Categories' },
  { href: '/investments', icon: TrendingUp, label: 'Investments' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openAdd } = useTransactionModal();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="" width={34} height={34} style={{ borderRadius: 9, flexShrink: 0 }} />
          <div>
            <h1>Gorib.com</h1>
            <p>Personal Finance Tracker</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sidebar-body">
        <div className="sidebar-cta-wrap">
          <button
            type="button"
            onClick={openAdd}
            className="sidebar-add-btn"
            id="sidebar-add-transaction-btn"
          >
            <span className="sidebar-add-btn-icon"><Plus size={15} strokeWidth={2.5} /></span>
            Add Transaction
          </button>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          <div className="nav-group">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${pathname === item.href ? ' active' : ''}`}
                >
                  <span className="nav-icon"><Icon size={17} strokeWidth={2} /></span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <span className="sidebar-avatar">{initials}</span>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-email">{email ?? 'Signed out'}</div>
            <div className="sidebar-profile-sub">Account</div>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
