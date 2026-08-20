'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCAD, formatMonth, formatDate } from '@/lib/utils';
import CategoryPieChart from '@/components/CategoryPieChart';
import { TrendingUp } from 'lucide-react';

interface CardBreakdownItem {
  card: { id: string; name: string; color: string; type: string; limit: number | null };
  expenses: number;
  income: number;
}

interface CategoryBreakdownItem {
  category: { id: string; name: string; icon: string; color: string };
  total: number;
}

interface Summary {
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  cardBreakdown: CardBreakdownItem[];
  categoryBreakdown: CategoryBreakdownItem[];
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
  card: { name: string; color: string };
  category: { name: string; icon: string };
}

export default function DashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [sumRes, txRes, invRes] = await Promise.all([
      fetch(`/api/summary?year=${year}&month=${month}`),
      fetch(`/api/transactions?year=${year}&month=${month}`),
      fetch('/api/investments'),
    ]);
    const sumData = await sumRes.json();
    const txData = await txRes.json();
    const invData = await invRes.json();
    setSummary(sumData);
    setRecentTx(txData.slice(0, 8));
    setTotalInvested(Array.isArray(invData) ? invData.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0) : 0);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  // Refresh when a transaction is added from the global FAB modal.
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('transactions:changed', handler);
    return () => window.removeEventListener('transactions:changed', handler);
  }, [load]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">Your monthly spending overview</p>
          </div>
          <div className="dashboard-header-actions">
            <div className="month-picker">
              <button className="month-btn" onClick={prevMonth} id="prev-month-btn" aria-label="Previous month">‹</button>
              <span className="month-label">{formatMonth(new Date(year, month, 1))}</span>
              <button
                className="month-btn"
                onClick={nextMonth}
                disabled={isCurrentMonth}
                id="next-month-btn"
                aria-label="Next month"
                style={{ opacity: isCurrentMonth ? 0.3 : 1, cursor: isCurrentMonth ? 'not-allowed' : 'pointer' }}
              >›</button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : summary ? (
          <>
            {/* Hero: Net Amount */}
            <div className="hero-card">
              <div className="hero-top">
                <div>
                  <div className="hero-label">Net Amount</div>
                  <div className="hero-value">{formatCAD(summary.netAmount)}</div>
                </div>
                <div className="hero-badge">
                  {summary.netAmount >= 0 ? '✓ Positive' : '⚠ Over budget'}
                </div>
              </div>
              <div className="hero-sub">All time · {formatMonth(new Date(year, month, 1))} activity below</div>
            </div>

            {/* Money summary row */}
            <div className="money-summary-card">
              <div className="money-summary-item">
                <div className="money-summary-icon down">↓</div>
                <div>
                  <div className="money-summary-label">Spent</div>
                  <div className="money-summary-value">{formatCAD(summary.totalExpenses)}</div>
                </div>
              </div>
              <div className="money-summary-item">
                <div className="money-summary-icon up">↑</div>
                <div>
                  <div className="money-summary-label">Income</div>
                  <div className="money-summary-value">{formatCAD(summary.totalIncome)}</div>
                </div>
              </div>
              <a href="/investments" className="money-summary-item" style={{ textDecoration: 'none' }}>
                <div className="money-summary-icon invest"><TrendingUp size={16} /></div>
                <div>
                  <div className="money-summary-label">Invested</div>
                  <div className="money-summary-value">{formatCAD(totalInvested)}</div>
                </div>
              </a>
            </div>

            {/* Charts & Breakdowns */}
            <div className="dashboard-grid">
              {/* Pie Chart */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Spending by Category</span>
                </div>
                <div className="card-body">
                  {summary.categoryBreakdown.length > 0 ? (
                    <CategoryPieChart data={summary.categoryBreakdown} total={summary.totalExpenses} />
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">🍩</div>
                      <div className="empty-title">No expenses yet</div>
                      <div className="empty-desc">Add a transaction to see your spending breakdown</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Breakdown */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Card Spending</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>This month</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {summary.cardBreakdown.length > 0 ? (
                    <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Card</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Spent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.cardBreakdown.map((item) => (
                          <tr key={item.card.id}>
                            <td>
                              <div className="card-chip">
                                <div className="card-stripe" style={{ background: item.card.color }} />
                                <span style={{ fontWeight: 500, fontSize: 13 }}>{item.card.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge badge-${item.card.type.toLowerCase()}`}>
                                {item.card.type}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>
                              {formatCAD(item.expenses)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">💳</div>
                      <div className="empty-title">No card activity</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="card full-width">
                <div className="card-header">
                  <span className="card-title">Recent Transactions</span>
                  <a href="/transactions" className="btn btn-ghost btn-sm">View all →</a>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {recentTx.length > 0 ? (
                    <ul className="tx-list">
                      {recentTx.map((tx) => (
                        <li key={tx.id} className="tx-item">
                          <div className="tx-icon">{tx.type === 'TRANSFER' ? '🔁' : tx.category.icon}</div>
                          <div className="tx-info">
                            <div className="tx-desc">{tx.description || tx.category.name}</div>
                            <div className="tx-meta">
                              <span>{formatDate(tx.date)}</span>
                              <span>·</span>
                              <div className="card-chip" style={{ gap: 4 }}>
                                <div className="color-dot" style={{ background: tx.card.color }} />
                                <span>{tx.card.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`tx-amount ${tx.type.toLowerCase()}`}>
                            {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}{formatCAD(tx.amount)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">No transactions this month</div>
                      <div className="empty-desc">Add your first transaction to get started</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
