'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import { useTransactionModal } from '@/lib/transaction-modal-context';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Tags, TrendingUp, LogOut, Plus, Info } from 'lucide-react';
import FeaturesModal from '@/components/FeaturesModal';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/cards', icon: CreditCard, label: 'Cards' },
  { href: '/categories', icon: Tags, label: 'Budgets' },
  { href: '/investments', icon: TrendingUp, label: 'Investments' },
];

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openAdd } = useTransactionModal();
  const [email, setEmail] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);

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
    <>
      <header className="topbar">
        <Link href="/" className="topbar-logo">
          <img src="/logo.svg" alt="" width={28} height={28} style={{ borderRadius: 8, flexShrink: 0 }} />
          <span className="topbar-title">Gorib.com</span>
        </Link>

        <nav className="topbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`topbar-link${pathname === item.href ? ' active' : ''}`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="topbar-actions">
          <button
            type="button"
            onClick={openAdd}
            className="topbar-add-btn"
            id="topbar-add-transaction-btn"
          >
            <span className="topbar-add-btn-icon"><Plus size={13} strokeWidth={2.5} /></span>
            Add Transaction
          </button>

          <button
            type="button"
            onClick={() => setShowFeatures(true)}
            aria-label="What can this app do?"
            className="topbar-icon-btn"
          >
            <Info size={17} strokeWidth={2} />
          </button>

          <ThemeToggle />

          <div className="topbar-divider" />

          <div className="topbar-profile">
            <div className="topbar-avatar">{initials}</div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="topbar-icon-btn"
            >
              <LogOut size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <FeaturesModal open={showFeatures} onClose={() => setShowFeatures(false)} />
    </>
  );
}
