'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCAD, formatMonth, formatDate, todayLocalISO } from '@/lib/utils';
import CategoryPieChart from '@/components/CategoryPieChart';

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

interface Card { id: string; name: string; type: string; color: string; limit: number | null; }
interface Category { id: string; name: string; icon: string; color: string; }

export default function DashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    amount: '', type: 'EXPENSE', description: '', date: todayLocalISO(),
    cardId: '', categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [sumRes, txRes, invRes, cardRes, catRes] = await Promise.all([
      fetch(`/api/summary?year=${year}&month=${month}`),
      fetch(`/api/transactions?year=${year}&month=${month}`),
      fetch('/api/investments'),
      fetch('/api/cards'),
      fetch('/api/categories'),
    ]);
    const sumData = await sumRes.json();
    const txData = await txRes.json();
    const invData = await invRes.json();
    setSummary(sumData);
    setRecentTx(txData.slice(0, 8));
    setTotalInvested(Array.isArray(invData) ? invData.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0) : 0);
    setCards(await cardRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ amount: '', type: 'EXPENSE', description: '', date: todayLocalISO(), cardId: '', categoryId: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.cardId || !form.categoryId) return;
    setSubmitting(true);
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    setShowModal(false);
    load();
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <button className="btn btn-primary" id="dashboard-add-transaction-btn" onClick={openAdd}>+ Add</button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : summary ? (
          <>
            {/* Summary Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Spent</div>
                <div className="stat-value red">{formatCAD(summary.totalExpenses)}</div>
                <div className="stat-sub">{summary.transactionCount} transactions</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Income</div>
                <div className="stat-value green">{formatCAD(summary.totalIncome)}</div>
                <div className="stat-sub">This month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Net Amount</div>
                <div className={`stat-value ${summary.netAmount >= 0 ? 'green' : 'red'}`}>
                  {formatCAD(summary.netAmount)}
                </div>
                <div className="stat-sub">
                  All time · {summary.netAmount >= 0 ? 'Positive balance ✓' : 'Over budget'}
                </div>
              </div>
              <a href="/investments" className="stat-card" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="stat-label">Total Invested</div>
                <div className="stat-value" style={{ color: 'var(--blue)' }}>{formatCAD(totalInvested)}</div>
                <div className="stat-sub">View investments →</div>
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
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>All time</span>
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

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Transaction</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <div className="form-radio-group">
                    {['EXPENSE', 'INCOME'].map(t => (
                      <div className="form-radio" key={t}>
                        <input type="radio" id={`dash-type-${t}`} name="dash-type" value={t} checked={form.type === t} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
                        <label htmlFor={`dash-type-${t}`}>{t === 'EXPENSE' ? '↓ Expense' : '↑ Income'}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="dash-tx-amount">Amount (CAD)</label>
                    <input id="dash-tx-amount" type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00"
                      value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dash-tx-date">Date</label>
                    <input id="dash-tx-date" type="date" className="form-input"
                      value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="dash-tx-card">Card</label>
                    <select id="dash-tx-card" className="form-select" value={form.cardId} onChange={e => setForm(f => ({ ...f, cardId: e.target.value }))} required>
                      <option value="">Select card</option>
                      {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dash-tx-category">Category</label>
                    <select id="dash-tx-category" className="form-select" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="dash-tx-desc">Description (optional)</label>
                  <input id="dash-tx-desc" type="text" className="form-input" placeholder="e.g. Loblaws weekly groceries"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="dash-submit-transaction-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
