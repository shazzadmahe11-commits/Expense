'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORY_COLORS } from '@/lib/utils';

const CATEGORY_ICONS = ['🍽️', '🛒', '🚗', '⛽', '🎬', '🛍️', '💊', '💡', '📱', '✈️', '💵', '📦', '🏠', '🎓', '🐾', '💰', '🍺', '☕', '🏋️', '🎮'];

interface Category { id: string; name: string; icon: string; color: string; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditCat(null);
    setForm({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    setError('');
    const url = editCat ? `/api/categories/${editCat.id}` : '/api/categories';
    const method = editCat ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
      return;
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This will fail if it has existing transactions.')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Cannot delete — category has existing transactions.');
      return;
    }
    load();
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Categories</h2>
        <p className="page-subtitle">Organize your expense categories</p>
      </div>

      <div className="page-body">
        <div className="action-bar">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{categories.length} categories</span>
          <button className="btn btn-primary" id="add-category-btn" onClick={openAdd}>+ Add Category</button>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : categories.length > 0 ? (
            <ul className="tx-list">
              {categories.map((cat) => (
                <li key={cat.id} className="category-item">
                  <div className="category-icon" style={{ background: cat.color + '22' }}>
                    {cat.icon}
                  </div>
                  <div className="category-info">
                    <div className="category-name">{cat.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)} id={`edit-cat-${cat.id}`}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)} id={`delete-cat-${cat.id}`}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <div className="empty-title">No categories yet</div>
              <div className="empty-desc">Add categories to classify your expenses</div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editCat ? 'Edit Category' : 'Add Category'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ padding: '8px 12px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="cat-name">Category Name</label>
                  <input id="cat-name" type="text" className="form-input" placeholder="e.g. Groceries"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {CATEGORY_ICONS.map(icon => (
                      <button key={icon} type="button"
                        style={{
                          width: 36, height: 36, borderRadius: 8, border: '2px solid',
                          borderColor: form.icon === icon ? 'var(--text-primary)' : 'var(--border)',
                          background: form.icon === icon ? 'var(--accent-light)' : 'transparent',
                          fontSize: 18, cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onClick={() => setForm(f => ({ ...f, icon }))}
                        aria-label={`Select icon ${icon}`}
                      >{icon}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="color-picker-row">
                    {CATEGORY_COLORS.map(color => (
                      <button key={color} type="button"
                        className={`color-swatch${form.color === color ? ' selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => setForm(f => ({ ...f, color }))}
                        aria-label={`Select color ${color}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-category-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editCat ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
