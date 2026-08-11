'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/', icon: '◉', label: 'Dashboard' },
  { href: '/transactions', icon: '↕', label: 'Transactions' },
  { href: '/cards', icon: '▣', label: 'Cards' },
  { href: '/categories', icon: '◈', label: 'Categories' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
      <div className="sidebar-logo">
        <h1>Gorib</h1>
        <p>Personal Finance Tracker</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${pathname === item.href ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
        {email && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
        )}
        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
