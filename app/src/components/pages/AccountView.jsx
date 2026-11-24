import { useEffect, useState } from 'react';
import { managementRequest, cacheUser } from '../../services/database';
import '../admin/Management.css';
const fields = { name: 'Full name', email: 'Email', phone: 'Phone', student_id: 'Student ID', course: 'Course', campus: 'Campus', residence_area: 'Residence area' };
export default function AccountView({ user, onUpdated, onLogout }) {
  const [form, setForm] = useState(() => Object.fromEntries(Object.keys(fields).map(key => [key, user[key] || ''])));
  const [enabled, setEnabled] = useState(false), [secret, setSecret] = useState(''), [password, setPassword] = useState(''), [code, setCode] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  useEffect(() => { managementRequest('/security').then(data => setEnabled(data.enabled)).catch(err => setError(err.message)); }, []);
  async function run(action) { setBusy(true); setError(''); setNotice(''); try { await action(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <section className="management"><header className="portal-heading"><div><p className="portal-eyebrow">SETTLEIN / YOUR ACCOUNT</p><h1>Profile &amp; security</h1><p>Your access level: {user.role}</p></div></header>
    {error && <p role="alert">{error}</p>}{notice && <p className="portal-notice" role="status">{notice}</p>}
    <div className="portal-panel"><h2>Your details</h2><form onSubmit={event => { event.preventDefault(); run(async () => { await managementRequest('/users/' + user.id, 'PUT', form); const updated = await managementRequest('/users/' + user.id); cacheUser(updated); onUpdated(updated); setNotice('Profile saved.'); }); }}>
      {Object.entries(fields).filter(([key]) => user.role === 'student' || !['student_id', 'course'].includes(key)).map(([key, label]) => <label key={key}>{label}<input type={key === 'email' ? 'email' : 'text'} required={['name', 'email'].includes(key)} maxLength={['phone','campus'].includes(key) ? 50 : 100} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })}/></label>)}
      <button className="portal-primary" disabled={busy}>Save profile</button>
    </form></div>
    <div className="portal-panel"><h2>Two-factor authentication</h2><p>{enabled ? 'Enabled. Sign-in requires your password and an authenticator code.' : 'Add an extra sign-in check using an authenticator app.'}</p><p>Keep access to your authenticator. Self-service password and authenticator recovery are not available.</p>
      <form onSubmit={event => { event.preventDefault(); run(async () => { const action = enabled ? 'disable' : secret ? 'confirm' : 'setup'; const result = await managementRequest('/security/' + action, 'POST', { password, code }); if (result.secret) setSecret(result.secret); else onLogout(); }); }}>
        <label>Current password<input type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={event => setPassword(event.target.value)}/></label>
        {secret && <div><p>In your authenticator, choose “Enter a setup key”, account SettleIn, time-based, and enter:</p><code className="setup-secret">{secret}</code><p>Enter the generated code below to finish. This key is private.</p></div>}
        {(enabled || secret) && <label>Fresh authenticator code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value)}/></label>}
        <button disabled={busy}>{enabled ? 'Disable two-factor authentication' : secret ? 'Verify and enable' : 'Set up authenticator'}</button>
      </form></div>
  </section>;
}
