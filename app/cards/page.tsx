'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCAD, CARD_COLORS, todayLocalISO } from '@/lib/utils';

interface Card {
  id: string; name: string; type: string; color: string; limit: number | null;
  totalSpent: number; totalIncome: number; totalTransferredOut: number; available: number | null;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [form, setForm] = useState({ name: '', type: 'CREDIT', color: CARD_COLORS[0], limit: '' });
  const [submitting, setSubmitting] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromCardId: '', toCardId: '', amount: '',
    date: todayLocalISO(), description: '',
  });
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/cards');
    setCards(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditCard(null);
    setForm({ name: '', type: 'CREDIT', color: CARD_COLORS[0], limit: '' });
    setShowModal(true);
  };

  const openEdit = (card: Card) => {
    setEditCard(card);
    setForm({ name: card.name, type: card.type, color: card.color, limit: card.limit ? String(card.limit) : '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    if (editCard) {
      await fetch(`/api/cards/${editCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/cards', {
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
    if (!confirm('Delete this card? All transactions linked to it will also be deleted.')) return;
    await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    load();
  };

  const openTransfer = () => {
    setTransferError(null);
    setTransferForm({
      fromCardId: cards.find(c => c.type === 'DEBIT')?.id || cards[0]?.id || '',
      toCardId: cards.find(c => c.type === 'CREDIT')?.id || '',
      amount: '',
      date: todayLocalISO(),
      description: '',
    });
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    if (!transferForm.fromCardId || !transferForm.toCardId || !transferForm.amount) return;
    if (transferForm.fromCardId === transferForm.toCardId) {
      setTransferError('Pick two different cards.');
      return;
    }
    setTransferSubmitting(true);
    const res = await fetch('/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transferForm),
    });
    setTransferSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setTransferError(data.error || 'Something went wrong.');
      return;
    }
    setShowTransferModal(false);
    load();
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Cards</h2>
        <p className="page-subtitle">Manage your credit and debit cards</p>
      </div>

      <div className="page-body">
        <div className="action-bar">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {cards.length >= 2 && (
              <button className="btn btn-secondary" id="transfer-btn" onClick={openTransfer}>🔁 Transfer</button>
            )}
            <button className="btn btn-primary" id="add-card-btn" onClick={openAdd}>+ Add Card</button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : cards.length > 0 ? (
          <div className="cards-grid">
            {cards.map((card) => (
              <div key={card.id} className="payment-card" style={{ '--card-color': card.color } as React.CSSProperties}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: card.color, borderRadius: '26px 26px 0 0' }} />
                <div className="payment-card-header">
                  <div>
                    <div className="payment-card-name">{card.name}</div>
                    <div className="payment-card-type">{card.type}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18 }}>{card.type === 'CREDIT' ? '💳' : '🏦'}</span>
                  </div>
                </div>
                {card.type === 'CREDIT' ? (
                  <>
                    <div style={{ marginBottom: 4 }}>
                      <div className="payment-card-label">Used</div>
                      <div className="payment-card-amount" style={{ fontSize: 16 }}>{formatCAD(card.totalSpent)}</div>
                    </div>
                    {card.limit ? (
                      <>
                        <div style={{ height: 6, borderRadius: 999, background: 'var(--border)', overflow: 'hidden', margin: '8px 0' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min((card.totalSpent / card.limit) * 100, 100)}%`,
                            background: card.totalSpent >= card.limit ? 'var(--red)' : card.color,
                            borderRadius: 999,
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span>Available: {formatCAD(card.available ?? 0)}</span>
                          <span>Limit: {formatCAD(card.limit)}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No credit limit set</div>
                    )}
                  </>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: card.totalTransferredOut > 0 ? 6 : 0 }}>
                      <div>
                        <div className="payment-card-label">Spent</div>
                        <div className="payment-card-amount" style={{ fontSize: 16, color: 'var(--red)' }}>{formatCAD(card.totalSpent)}</div>
                      </div>
                      <div>
                        <div className="payment-card-label">Income</div>
                        <div className="payment-card-amount" style={{ fontSize: 16, color: 'var(--green)' }}>{formatCAD(card.totalIncome)}</div>
                      </div>
                    </div>
                    {card.totalTransferredOut > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        🔁 Paid to cards: {formatCAD(card.totalTransferredOut)}
                      </div>
                    )}
                  </div>
                )}
                <div className="payment-card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(card)} style={{ flex: 1 }} id={`edit-card-${card.id}`}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(card.id)} id={`delete-card-${card.id}`}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <div className="empty-title">No cards yet</div>
              <div className="empty-desc">Add your first card to start tracking</div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editCard ? 'Edit Card' : 'Add Card'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="card-name">Card Name</label>
                  <input id="card-name" type="text" className="form-input" placeholder="e.g. TD Visa"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Type</label>
                  <div className="form-radio-group">
                    {['CREDIT', 'DEBIT'].map(t => (
                      <div className="form-radio" key={t}>
                        <input type="radio" id={`card-type-${t}`} name="card-type" value={t}
                          checked={form.type === t} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
                        <label htmlFor={`card-type-${t}`}>{t === 'CREDIT' ? '💳 Credit' : '🏦 Debit'}</label>
                      </div>
                    ))}
                  </div>
                </div>
                {form.type === 'CREDIT' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-limit">Credit Limit (CAD, optional)</label>
                    <input id="card-limit" type="number" min="0" step="100" className="form-input" placeholder="e.g. 10000"
                      value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Color Label</label>
                  <div className="color-picker-row">
                    {CARD_COLORS.map(color => (
                      <button key={color} type="button" className={`color-swatch${form.color === color ? ' selected' : ''}`}
                        style={{ background: color }} onClick={() => setForm(f => ({ ...f, color }))}
                        aria-label={`Select color ${color}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-card-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editCard ? 'Save Changes' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTransferModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">🔁 Transfer Between Cards</span>
              <button className="modal-close" onClick={() => setShowTransferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTransferSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Use this for moving your own money — like paying a credit card bill from your debit account.
                  It won&apos;t be counted as spending or income.
                </p>
                <div className="form-group">
                  <label className="form-label" htmlFor="transfer-from">From</label>
                  <select id="transfer-from" className="form-select"
                    value={transferForm.fromCardId} onChange={e => setTransferForm(f => ({ ...f, fromCardId: e.target.value }))} required>
                    <option value="" disabled>Select a card</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="transfer-to">To</label>
                  <select id="transfer-to" className="form-select"
                    value={transferForm.toCardId} onChange={e => setTransferForm(f => ({ ...f, toCardId: e.target.value }))} required>
                    <option value="" disabled>Select a card</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="transfer-amount">Amount (CAD)</label>
                    <input id="transfer-amount" type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00"
                      value={transferForm.amount} onChange={e => setTransferForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="transfer-date">Date</label>
                    <input id="transfer-date" type="date" className="form-input"
                      value={transferForm.date} onChange={e => setTransferForm(f => ({ ...f, date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="transfer-desc">Note (optional)</label>
                  <input id="transfer-desc" type="text" className="form-input" placeholder="e.g. Credit card bill payment"
                    value={transferForm.description} onChange={e => setTransferForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                {transferError && (
                  <div style={{ fontSize: 12.5, color: 'var(--red)' }}>{transferError}</div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-transfer-btn" disabled={transferSubmitting}>
                  {transferSubmitting ? 'Saving...' : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
