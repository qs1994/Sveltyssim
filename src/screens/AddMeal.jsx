import { useState } from 'react'
import { supabase } from '../lib/supabase'

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation']

export default function AddMeal({ user, onBack, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    meal_type: 'Déjeuner',
    calories: '',
    carbs: '',
    proteins: '',
    quantity: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    if (!form.name || !form.calories) {
      setError('Le nom et les calories sont obligatoires.')
      return
    }
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const { error: err } = await supabase.from('meals').insert({
      user_id: user.id,
      date: today,
      name: form.name,
      meal_type: form.meal_type,
      calories: Number(form.calories),
      carbs: Number(form.carbs) || 0,
      proteins: Number(form.proteins) || 0,
      quantity: form.quantity,
    })
    setLoading(false)
    if (err) setError(err.message)
    else onSaved()
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>←</button>
        <h2 style={styles.title}>Ajouter un repas</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={styles.scroll}>
        {/* Meal type selector */}
        <p style={styles.sectionLabel}>Type de repas</p>
        <div style={styles.typeRow}>
          {MEAL_TYPES.map(t => (
            <button
              key={t}
              style={{ ...styles.typeBtn, ...(form.meal_type === t ? styles.typeBtnActive : {}) }}
              onClick={() => set('meal_type', t)}
            >
              {getMealEmoji(t)} {t.split('-')[0]}
            </button>
          ))}
        </div>

        {/* Name */}
        <p style={styles.sectionLabel}>Aliment ou repas</p>
        <input
          style={styles.input}
          placeholder="Ex: Salade César, Yaourt nature..."
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />

        <p style={styles.sectionLabel}>Quantité (optionnel)</p>
        <input
          style={styles.input}
          placeholder="Ex: 200g, 1 portion..."
          value={form.quantity}
          onChange={e => set('quantity', e.target.value)}
        />

        {/* Macros */}
        <p style={styles.sectionLabel}>Valeurs nutritionnelles</p>
        <div style={styles.macroGrid}>
          {[
            { key: 'calories', label: '🔥 Calories', unit: 'kcal', color: '#E8715A' },
            { key: 'carbs', label: '🌾 Glucides', unit: 'g', color: '#F4A836' },
            { key: 'proteins', label: '💪 Protéines', unit: 'g', color: '#4A7C59' },
          ].map(m => (
            <div key={m.key} style={{ ...styles.macroCard, borderTop: `3px solid ${m.color}` }}>
              <p style={styles.macroLabel}>{m.label}</p>
              <div style={styles.macroInputRow}>
                <input
                  style={styles.macroInput}
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={form[m.key]}
                  onChange={e => set(m.key, e.target.value)}
                />
                <span style={styles.macroUnit}>{m.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? '⏳ Enregistrement...' : '✅ Enregistrer ce repas'}
        </button>
      </div>
    </div>
  )
}

const getMealEmoji = (type) => {
  const map = { 'Petit-déjeuner': '🌅', 'Déjeuner': '☀️', 'Dîner': '🌙', 'Collation': '🍎' }
  return map[type] || '🍽️'
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    background: 'var(--white)',
  },
  back: { background: 'none', fontSize: '22px', color: 'var(--green)', width: 36 },
  title: { fontSize: '18px', fontWeight: '700' },
  scroll: { flex: 1, overflowY: 'auto', padding: '24px 20px 100px' },
  sectionLabel: { fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', marginTop: '20px' },
  typeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' },
  typeBtn: {
    padding: '8px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '500',
    background: 'var(--cream-dark)', color: 'var(--text-muted)', transition: 'all 0.2s',
  },
  typeBtnActive: { background: 'var(--green)', color: 'white', fontWeight: '600' },
  input: {
    width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', background: 'var(--white)',
    fontSize: '15px', color: 'var(--text)', marginBottom: '4px',
  },
  macroGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' },
  macroCard: {
    background: 'var(--white)', borderRadius: '14px', padding: '14px 12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  macroLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' },
  macroInputRow: { display: 'flex', alignItems: 'baseline', gap: '4px' },
  macroInput: {
    width: '100%', border: 'none', background: 'transparent',
    fontSize: '22px', fontWeight: '700', color: 'var(--text)', padding: 0,
  },
  macroUnit: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' },
  error: { color: 'var(--coral)', fontSize: '14px', marginBottom: '12px', textAlign: 'center' },
  saveBtn: {
    width: '100%', padding: '18px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontSize: '16px', fontWeight: '700',
    boxShadow: '0 4px 16px rgba(74, 124, 89, 0.35)',
  },
}
