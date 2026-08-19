'use client';

import { useState, useEffect } from 'react';
import { useTransactionModal } from '@/lib/transaction-modal-context';
import { todayLocalISO } from '@/lib/utils';

interface Card { id: string; name: string; type: string; color: string; limit: number | null; }
interface Category { id: string; name: string; icon: string; color: string; }

const emptyForm = {
  amount: '', type: 'EXPENSE', description: '', date: todayLocalISO(),
  cardId: '', categoryId: '',
};

export default function GlobalAddTransactionModal() {
  const { isOpen, close } = useTransactionModal();
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(emptyForm);
    setLoadingLists(true);
    Promise.all([
      fetch('/api/cards').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([cardData, catData]) => {
      setCards(cardData);
      setCategories(catData);
      setLoadingLists(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

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
    close();
    // Let any page showing a transaction list (e.g. /transactions) know to refresh.
    window.dispatchEvent(new Event('transactions:changed'));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Transaction</span>
          <button className="modal-close" onClick={close}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Type</label>
              <div className="form-radio-group">
                {['EXPENSE', 'INCOME'].map(t => (
                  <div className="form-radio" key={t}>
                    <input type="radio" id={`gtype-${t}`} name="gtype" value={t} checked={form.type === t}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
                    <label htmlFor={`gtype-${t}`}>{t === 'EXPENSE' ? '↓ Expense' : '↑ Income'}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="gtx-amount">Amount (CAD)</label>
                <input id="gtx-amount" type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gtx-date">Date</label>
                <input id="gtx-date" type="date" className="form-input"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="gtx-card">Card</label>
                <select id="gtx-card" className="form-select" value={form.cardId}
                  onChange={e => setForm(f => ({ ...f, cardId: e.target.value }))} required disabled={loadingLists}>
                  <option value="">Select card</option>
                  {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gtx-category">Category</label>
                <select id="gtx-category" className="form-select" value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required disabled={loadingLists}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gtx-desc">Description (optional)</label>
              <input id="gtx-desc" type="text" className="form-input" placeholder="e.g. Loblaws weekly groceries"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || loadingLists}>
              {submitting ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
