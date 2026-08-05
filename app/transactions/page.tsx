'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCAD, formatDate, formatMonth, CARD_COLORS, CATEGORY_COLORS } from '@/lib/utils';

interface Card { id: string; name: string; type: string; color: string; limit: number | null; }
interface Category { id: string; name: string; icon: string; color: string; }
interface Transaction {
  id: string; amount: number; type: string; description: string | null;
  date: string; card: Card; category: Category;
}

export default function TransactionsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCard, setFilterCard] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form state
  const [form, setForm] = useState({
    amount: '', type: 'EXPENSE', description: '', date: now.toISOString().split('T')[0],
    cardId: '', categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (filterCard) params.set('cardId', filterCard);
    if (filterType) params.set('type', filterType);
    if (filterCategory) params.set('categoryId', filterCategory);
    const [txRes, cardRes, catRes] = await Promise.all([
      fetch(`/api/transactions?${params}`),
      fetch('/api/cards'),
      fetch('/api/categories'),
    ]);
    setTransactions(await txRes.json());
    setCards(await cardRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  }, [year, month, filterCard, filterType, filterCategory]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

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
    setForm({ amount: '', type: 'EXPENSE', description: '', date: now.toISOString().split('T')[0], cardId: '', categoryId: '' });
    loadAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    loadAll();
  };

  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="page-title">Transactions</h2>
            <p className="page-subtitle">{transactions.length} records · {formatCAD(totalExpenses)} spent · {formatCAD(totalIncome)} income</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="month-picker">
              <button className="month-btn" onClick={prevMonth} id="tx-prev-month">‹</button>
              <span className="month-label">{formatMonth(new Date(year, month, 1))}</span>
              <button className="month-btn" onClick={nextMonth} disabled={isCurrentMonth}
                style={{ opacity: isCurrentMonth ? 0.3 : 1, cursor: isCurrentMonth ? 'not-allowed' : 'pointer' }}
                id="tx-next-month">›</button>
            </div>
            <button className="btn btn-primary" id="add-transaction-btn" onClick={() => setShowModal(true)}>+ Add</button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="filters-bar">
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)} id="filter-type">
            <option value="">All Types</option>
            <option value="EXPENSE">Expenses</option>
            <option value="INCOME">Income</option>
          </select>
          <select className="filter-select" value={filterCard} onChange={e => setFilterCard(e.target.value)} id="filter-card">
            <option value="">All Cards</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} id="filter-category">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          {(filterType || filterCard || filterCategory) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setFilterType(''); setFilterCard(''); setFilterCategory(''); }}>Clear filters</button>
          )}
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : transactions.length > 0 ? (
            <>
            <table className="data-table desktop-only-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Card</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 500 }}>{tx.description || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12.5 }}>{formatDate(tx.date)}</td>
                    <td>
                      <div className="card-chip">
                        <div className="color-dot" style={{ background: tx.card.color }} />
                        <span style={{ fontSize: 12.5 }}>{tx.card.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{tx.category.icon} {tx.category.name}</td>
                    <td><span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'EXPENSE' ? 'var(--red)' : 'var(--green)' }}>
                      {tx.type === 'EXPENSE' ? '-' : '+'}{formatCAD(tx.amount)}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(tx.id)} aria-label="Delete transaction">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-tx-list">
              {transactions.map((tx) => (
                <div key={tx.id} className="tx-row">
                  <div className="tx-row-main">
                    <div className="tx-row-icon">{tx.category.icon}</div>
                    <div className="tx-row-info">
                      <div className="tx-row-title">{tx.description || tx.category.name}</div>
                      <div className="tx-row-sub">{formatDate(tx.date)} · {tx.card.name}</div>
                    </div>
                  </div>
                  <div className="tx-row-end">
                    <div className="tx-row-amount" style={{ color: tx.type === 'EXPENSE' ? 'var(--red)' : 'var(--green)' }}>
                      {tx.type === 'EXPENSE' ? '-' : '+'}{formatCAD(tx.amount)}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(tx.id)} aria-label="Delete transaction">✕</button>
                  </div>
                </div>
              ))}
            </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No transactions found</div>
              <div className="empty-desc">Add your first transaction using the + Add button</div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Transaction</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Type */}
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <div className="form-radio-group">
                    {['EXPENSE', 'INCOME'].map(t => (
                      <div className="form-radio" key={t}>
                        <input type="radio" id={`type-${t}`} name="type" value={t} checked={form.type === t} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
                        <label htmlFor={`type-${t}`}>{t === 'EXPENSE' ? '↓ Expense' : '↑ Income'}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  {/* Amount */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="tx-amount">Amount (CAD)</label>
                    <input id="tx-amount" type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00"
                      value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  {/* Date */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="tx-date">Date</label>
                    <input id="tx-date" type="date" className="form-input"
                      value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  {/* Card */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="tx-card">Card</label>
                    <select id="tx-card" className="form-select" value={form.cardId} onChange={e => setForm(f => ({ ...f, cardId: e.target.value }))} required>
                      <option value="">Select card</option>
                      {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="tx-category">Category</label>
                    <select id="tx-category" className="form-select" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                </div>
                {/* Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="tx-desc">Description (optional)</label>
                  <input id="tx-desc" type="text" className="form-input" placeholder="e.g. Loblaws weekly groceries"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-transaction-btn" disabled={submitting}>
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
