'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import { useTransactionModal } from '@/lib/transaction-modal-context';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Tags, TrendingUp, Plus, LogOut, Info } from 'lucide-react';
import FeaturesModal from '@/components/FeaturesModal';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/cards', icon: CreditCard, label: 'Cards' },
  { href: '/categories', icon: Tags, label: 'Budgets' },
  { href: '/investments', icon: TrendingUp, label: 'Investments' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openAdd } = useTransactionModal();
  const [showFeatures, setShowFeatures] = useState(false);

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
        <Link href="/" className="mobile-topbar-title" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.svg" alt="" width={26} height={26} style={{ borderRadius: 7 }} />
          Gorib.com
        </Link>
        <button
          type="button"
          onClick={() => setShowFeatures(true)}
          aria-label="What can this app do?"
          style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 6 }}
        >
          <Info size={19} strokeWidth={2} />
        </button>
        <ThemeToggle />
      </header>

      <FeaturesModal open={showFeatures} onClose={() => setShowFeatures(false)} />

      <nav className="bottom-nav">
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-link${pathname === item.href ? ' active' : ''}`}
            >
              <Icon size={20} strokeWidth={2} />
            </Link>
          );
        })}
        <button type="button" onClick={openAdd} className="bottom-nav-fab" aria-label="Add expense">
          <Plus size={26} strokeWidth={2.5} />
        </button>
        {navItems.slice(3).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-link${pathname === item.href ? ' active' : ''}`}
            >
              <Icon size={20} strokeWidth={2} />
            </Link>
          );
        })}
        <button type="button" onClick={handleLogout} className="bottom-nav-link" aria-label="Log out">
          <LogOut size={20} strokeWidth={2} />
        </button>
      </nav>
    </>
  );
}
