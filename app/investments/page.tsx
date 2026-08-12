'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCAD, BROKERS } from '@/lib/utils';

interface Investment {
  id: string; broker: string; stock: string; amount: number; createdAt: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editInv, setEditInv] = useState<Investment | null>(null);
  const [form, setForm] = useState({ broker: BROKERS[0], stock: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/investments');
    setInvestments(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = investments.reduce((sum, i) => sum + i.amount, 0);

  const openAdd = () => {
    setEditInv(null);
    setForm({ broker: BROKERS[0], stock: '', amount: '' });
    setShowModal(true);
  };

  const openEdit = (inv: Investment) => {
    setEditInv(inv);
    setForm({ broker: inv.broker, stock: inv.stock, amount: String(inv.amount) });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.broker || !form.stock || !form.amount) return;
    setSubmitting(true);
    if (editInv) {
      await fetch(`/api/investments/${editInv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setSubmitting(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this investment?')) return;
    await fetch(`/api/investments/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Investments</h2>
        <p className="page-subtitle">Track what you hold and where — separate from your everyday spending</p>
      </div>

      <div className="page-body">
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{formatCAD(total)}</div>
            <div className="stat-sub">{investments.length} holding{investments.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="action-bar">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {investments.length} investment{investments.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary" id="add-investment-btn" onClick={openAdd}>+ Add Investment</button>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : investments.length > 0 ? (
            <>
              <table className="data-table desktop-only-table">
                <thead>
                  <tr>
                    <th>Stock / Asset</th>
                    <th>Broker</th>
                    <th style={{ textAlign: 'right' }}>Amount Invested</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 500 }}>{inv.stock}</td>
                      <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{inv.broker}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCAD(inv.amount)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(inv)} style={{ marginRight: 6 }}>Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv.id)} aria-label="Delete investment">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mobile-tx-list">
                {investments.map((inv) => (
                  <div key={inv.id} className="tx-row">
                    <div className="tx-row-main">
                      <div className="tx-row-icon">📈</div>
                      <div className="tx-row-info">
                        <div className="tx-row-title">{inv.stock}</div>
                        <div className="tx-row-sub">{inv.broker}</div>
                      </div>
                    </div>
                    <div className="tx-row-end">
                      <div className="tx-row-amount" style={{ color: 'var(--blue)' }}>{formatCAD(inv.amount)}</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(inv)} aria-label="Edit investment">✎</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv.id)} aria-label="Delete investment">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <div className="empty-title">No investments yet</div>
              <div className="empty-desc">Add your first holding using the + Add Investment button</div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editInv ? 'Edit Investment' : 'Add Investment'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="inv-broker">Broker</label>
                  <select id="inv-broker" className="form-select"
                    value={form.broker} onChange={e => setForm(f => ({ ...f, broker: e.target.value }))} required>
                    {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="inv-stock">Stock / Asset Name</label>
                  <input id="inv-stock" type="text" className="form-input" placeholder="e.g. VFV, AAPL, Bitcoin"
                    value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="inv-amount">Amount Invested (CAD)</label>
                  <input id="inv-amount" type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-investment-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editInv ? 'Save Changes' : 'Add Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
