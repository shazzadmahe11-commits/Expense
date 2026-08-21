'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import { useTransactionModal } from '@/lib/transaction-modal-context';
import { usePrivacy } from '@/lib/privacy-context';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Tags, TrendingUp, Plus, LogOut, Eye, EyeOff } from 'lucide-react';

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
  const { hideAmounts, toggleHideAmounts } = usePrivacy();

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
          onClick={toggleHideAmounts}
          aria-label={hideAmounts ? 'Show amounts' : 'Hide amounts'}
          title={hideAmounts ? 'Show amounts' : 'Hide amounts'}
          className={`theme-toggle-btn${hideAmounts ? ' active' : ''}`}
        >
          {hideAmounts ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
        </button>
        <ThemeToggle />
      </header>

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
