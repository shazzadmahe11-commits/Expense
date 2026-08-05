'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/transactions', icon: '💸', label: 'Txns' },
  { href: '/cards', icon: '💳', label: 'Cards' },
  { href: '/categories', icon: '🏷️', label: 'Cats' },
];

export default function MobileNav() {
  const pathname = usePathname();
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
    </nav>
  );
}
