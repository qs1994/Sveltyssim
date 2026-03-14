import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      })
      if (error) setMessage(error.message)
      else setMessage('Vérifie tes emails pour confirmer ton compte !')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('Email ou mot de passe incorrect.')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.leaf}>🌿</div>
        <h1 style={styles.title}>Sveltyssim</h1>
        <p style={styles.subtitle}>Ton compagnon bien-être</p>
      </div>

      <div style={styles.card}>
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
            onClick={() => setMode('login')}
          >Connexion</button>
          <button
            style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}
            onClick={() => setMode('signup')}
          >Créer un compte</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.field}>
              <label style={styles.label}>Prénom</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Ex: Marie"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {message && <p style={styles.message}>{message}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '⏳ Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'linear-gradient(160deg, #E8F5EC 0%, #FFF8F2 60%)',
  },
  header: { textAlign: 'center', marginBottom: '36px' },
  leaf: { fontSize: '48px', marginBottom: '8px' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '38px',
    color: 'var(--green)',
    letterSpacing: '-1px',
  },
  subtitle: { color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' },
  card: {
    background: 'var(--white)',
    borderRadius: '24px',
    padding: '28px',
    width: '100%',
    boxShadow: 'var(--shadow-lg)',
  },
  tabs: { display: 'flex', gap: '4px', background: 'var(--cream-dark)', borderRadius: '12px', padding: '4px', marginBottom: '24px' },
  tab: {
    flex: 1, padding: '10px', borderRadius: '10px', background: 'transparent',
    color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
  },
  tabActive: { background: 'var(--white)', color: 'var(--green)', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)',
    fontSize: '16px', background: 'var(--cream)', color: 'var(--text)', transition: 'border-color 0.2s',
  },
  message: { fontSize: '14px', color: 'var(--coral)', textAlign: 'center' },
  btn: {
    marginTop: '4px', padding: '16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontSize: '16px', fontWeight: '600',
    boxShadow: '0 4px 16px rgba(74, 124, 89, 0.35)', transition: 'transform 0.1s, opacity 0.2s',
  },
}
