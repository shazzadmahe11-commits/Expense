'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '◉', label: 'Dashboard' },
  { href: '/transactions', icon: '↕', label: 'Transactions' },
  { href: '/cards', icon: '▣', label: 'Cards' },
  { href: '/categories', icon: '◈', label: 'Categories' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>GORIB</h1>
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
    </aside>
  );
}
