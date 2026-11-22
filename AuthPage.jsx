import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';
  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setFieldErrors({});
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFieldErrors({});
    setError('');
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      // Field messages show under the inputs; only show the general message when there are none.
      if (!err.details?.length) setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1 className="wordmark">Taskline</h1>
        <p className="lead">{isRegister ? 'Create an account to start your list.' : 'Sign in to see your tasks.'}</p>

        {isRegister && (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={update('name')} autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} />
            {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {isRegister && !fieldErrors.password && <p className="hint">At least 8 characters.</p>}
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        </div>

        {error && <p className="banner-error" role="alert">{error}</p>}

        <button className="btn primary" disabled={busy}>
          {busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>

        <p className="switch">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </form>
    </main>
  );
}
