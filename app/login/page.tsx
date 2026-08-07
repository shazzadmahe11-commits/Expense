'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSignupDone(true);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Gorib</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {mode === 'signin' ? 'Log in to your account' : 'Create your account'}
          </p>
        </div>

        {signupDone ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 16 }}>
              Check your email to confirm your account, then log in below.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }}
              onClick={() => { setMode('signin'); setSignupDone(false); }}>
              Back to log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="form-input" required
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" type="password" className="form-input" required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            </div>

            {error && (
              <div style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 12 }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Log in' : 'Sign up'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-solid)', cursor: 'pointer', font: 'inherit', fontWeight: 600 }}>
                {mode === 'signin' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
