'use client';

import { LayoutDashboard, ArrowLeftRight, CreditCard, Tags, TrendingUp, Info } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    desc: 'A monthly overview of your net amount, income, expenses, and total invested — with a category breakdown, card spending, budget progress, and your most recent transactions at a glance.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Transactions',
    desc: 'Log income and expenses, assign each to a category and a card, then filter and search your full history.',
  },
  {
    icon: CreditCard,
    title: 'Cards',
    desc: 'Keep a record of your credit and debit cards and see how much you have spent on each one.',
  },
  {
    icon: Tags,
    title: 'Budgets',
    desc: 'Organize your spending into categories and set a monthly budget for each — the dashboard and this page will flag any category running over.',
  },
  {
    icon: TrendingUp,
    title: 'Investments',
    desc: 'Track what you hold separately from everyday spending, and see the total reflected on your dashboard.',
  },
];

export default function FeaturesModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={17} strokeWidth={2} />
            What you can do here
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <ul className="feature-list">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="feature-item">
                  <div className="feature-icon">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
