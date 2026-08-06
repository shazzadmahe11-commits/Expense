'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/transactions', icon: '💸', label: 'Txns' },
  { href: '/cards', icon: '💳', label: 'Cards' },
  { href: '/categories', icon: '🏷️', label: 'Cats' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`mobile-nav-link${pathname === item.href ? ' active' : ''}`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="mobile-nav-link"
        style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </nav>
  );
}
