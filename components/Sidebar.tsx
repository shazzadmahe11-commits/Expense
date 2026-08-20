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
      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        <button
          type="button"
          onClick={openAdd}
          className="btn btn-primary"
          id="sidebar-add-transaction-btn"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}
        >
          <Plus size={15} strokeWidth={2.5} /> Add Transaction
        </button>
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
      </nav>
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
        {email && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
        )}
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={handleLogout}>
          <LogOut size={14} /> Log out
        </button>
      </div>
    </aside>
  );
}
