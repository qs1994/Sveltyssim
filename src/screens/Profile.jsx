import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Profile({ user, goals, onBack, onGoalsUpdated }) {
  const [form, setForm] = useState({
    calories: goals.calories || 2000,
    carbs: goals.carbs || 250,
    proteins: goals.proteins || 150,
    target_weight: goals.target_weight || '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.from('goals').upsert({
      user_id: user.id,
      calories: Number(form.calories),
      carbs: Number(form.carbs),
      proteins: Number(form.proteins),
      target_weight: form.target_weight ? Number(form.target_weight) : null,
    }, { onConflict: 'user_id' })
    setLoading(false)
    if (!error) {
      setSaved(true)
      onGoalsUpdated(form)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const name = user?.user_metadata?.name || user?.email?.split('@')[0]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>←</button>
        <h2 style={styles.title}>Mon profil</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={styles.scroll}>
        {/* User card */}
        <div style={styles.userCard}>
          <div style={styles.avatar}>{name?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <p style={styles.userName}>{name}</p>
            <p style={styles.userEmail}>{user.email}</p>
          </div>
        </div>

        {/* Goals */}
        <p style={styles.sectionTitle}>🎯 Mes objectifs journaliers</p>

        {[
          { key: 'calories', label: '🔥 Calories', unit: 'kcal', color: '#E8715A' },
          { key: 'carbs', label: '🌾 Glucides', unit: 'g', color: '#F4A836' },
          { key: 'proteins', label: '💪 Protéines', unit: 'g', color: '#4A7C59' },
          { key: 'target_weight', label: '⚖️ Poids cible', unit: 'kg', color: '#5B8DEF' },
        ].map(f => (
          <div key={f.key} style={{ ...styles.goalCard, borderLeft: `4px solid ${f.color}` }}>
            <div style={styles.goalRow}>
              <div>
                <p style={styles.goalLabel}>{f.label}</p>
                <p style={styles.goalHint}>Objectif quotidien</p>
              </div>
              <div style={styles.goalInputRow}>
                <input
                  style={styles.goalInput}
                  type="number"
                  inputMode="numeric"
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                />
                <span style={styles.goalUnit}>{f.unit}</span>
              </div>
            </div>
          </div>
        ))}

        <button style={{ ...styles.saveBtn, ...(saved ? styles.saveBtnSuccess : {}) }} onClick={handleSave} disabled={loading}>
          {saved ? '✅ Objectifs sauvegardés !' : loading ? '⏳ Sauvegarde...' : 'Sauvegarder les objectifs'}
        </button>

        {/* Logout */}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--white)',
  },
  back: { background: 'none', fontSize: '22px', color: 'var(--green)', width: 36 },
  title: { fontSize: '18px', fontWeight: '700' },
  scroll: { flex: 1, overflowY: 'auto', padding: '20px 20px 100px' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: 'linear-gradient(135deg, var(--green) 0%, #6AAB7A 100%)',
    borderRadius: '20px', padding: '20px', marginBottom: '24px',
    boxShadow: '0 6px 20px rgba(74, 124, 89, 0.3)',
  },
  avatar: {
    width: '56px', height: '56px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '700',
  },
  userName: { fontSize: '20px', fontWeight: '700', color: 'white', fontFamily: 'var(--font-display)' },
  userEmail: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '16px' },
  goalCard: {
    background: 'var(--white)', borderRadius: '16px', padding: '16px 20px',
    marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  goalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  goalLabel: { fontSize: '15px', fontWeight: '600' },
  goalHint: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  goalInputRow: { display: 'flex', alignItems: 'baseline', gap: '4px' },
  goalInput: {
    width: '80px', padding: '8px 10px', borderRadius: '10px',
    border: '1.5px solid var(--border)', textAlign: 'right',
    fontSize: '18px', fontWeight: '700', background: 'var(--cream)',
  },
  goalUnit: { fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' },
  saveBtn: {
    width: '100%', padding: '18px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontSize: '16px', fontWeight: '700',
    marginTop: '8px', marginBottom: '16px',
    boxShadow: '0 4px 16px rgba(74, 124, 89, 0.35)',
  },
  saveBtnSuccess: { background: '#2D8B55' },
  logoutBtn: {
    width: '100%', padding: '16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--cream-dark)', color: 'var(--text-muted)',
    fontSize: '15px', fontWeight: '600',
  },
}
