import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const COLORS = { cal: '#E8715A', carbs: '#F4A836', prot: '#4A7C59' }

function Ring({ value, max, color, size = 80 }) {
  const pct = Math.min(value / max, 1)
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EAE4" strokeWidth="8" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

export default function Dashboard({ user, goals, onNavigate }) {
  const [meals, setMeals] = useState([])
  const [weight, setWeight] = useState(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchToday()
    fetchWeight()
  }, [])

  const fetchToday = async () => {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
    if (data) setMeals(data)
  }

  const fetchWeight = async () => {
    const { data } = await supabase
      .from('weights')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
    if (data && data.length > 0) setWeight(data[0].weight)
  }

  const totals = meals.reduce((acc, m) => ({
    cal: acc.cal + (m.calories || 0),
    carbs: acc.carbs + (m.carbs || 0),
    prot: acc.prot + (m.proteins || 0),
  }), { cal: 0, carbs: 0, prot: 0 })

  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'toi'

  const dayGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={styles.container}>
      <div style={styles.scroll}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.greeting}>{dayGreeting()}, {name} 👋</p>
            <p style={styles.date}>{dateLabel}</p>
          </div>
          <button style={styles.avatarBtn} onClick={() => onNavigate('profile')}>
            <span style={styles.avatar}>{name[0].toUpperCase()}</span>
          </button>
        </div>

        {/* Calories card */}
        <div style={styles.calCard}>
          <div style={styles.calMain}>
            <Ring value={totals.cal} max={goals.calories} color={COLORS.cal} size={100} />
            <div style={styles.calInfo}>
              <p style={styles.calValue}>{totals.cal}</p>
              <p style={styles.calLabel}>/ {goals.calories} kcal</p>
              <p style={styles.calRemain}>{Math.max(0, goals.calories - totals.cal)} restantes</p>
            </div>
          </div>

          <div style={styles.macros}>
            {[
              { label: 'Glucides', val: totals.carbs, max: goals.carbs, unit: 'g', color: COLORS.carbs },
              { label: 'Protéines', val: totals.prot, max: goals.proteins, unit: 'g', color: COLORS.prot },
            ].map(m => (
              <div key={m.label} style={styles.macro}>
                <div style={styles.macroTop}>
                  <span style={{ ...styles.macroDot, background: m.color }} />
                  <span style={styles.macroLabel}>{m.label}</span>
                </div>
                <p style={styles.macroVal}>{m.val}g</p>
                <div style={styles.macroBar}>
                  <div style={{
                    ...styles.macroFill,
                    width: `${Math.min(100, (m.val / m.max) * 100)}%`,
                    background: m.color
                  }} />
                </div>
                <p style={styles.macroMax}>/ {m.max}g</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div style={styles.weightCard}>
          <div style={styles.weightLeft}>
            <p style={styles.weightLabel}>⚖️ Poids actuel</p>
            <p style={styles.weightVal}>{weight ? `${weight} kg` : '—'}</p>
          </div>
          <button style={styles.weightBtn} onClick={() => onNavigate('weight')}>
            {weight ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>

        {/* Today's meals */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionTitle}>Repas du jour</p>
            <button style={styles.addBtn} onClick={() => onNavigate('addMeal')}>+ Ajouter</button>
          </div>
          {meals.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyIcon}>🍽️</p>
              <p style={styles.emptyText}>Aucun repas enregistré</p>
              <p style={styles.emptyHint}>Commence par ajouter ton petit-déjeuner !</p>
            </div>
          ) : (
            <div style={styles.mealList}>
              {meals.map(meal => (
                <div key={meal.id} style={styles.mealItem}>
                  <div style={styles.mealEmoji}>{getMealEmoji(meal.meal_type)}</div>
                  <div style={styles.mealInfo}>
                    <p style={styles.mealName}>{meal.name}</p>
                    <p style={styles.mealMeta}>{meal.meal_type} · {meal.carbs}g glucides · {meal.proteins}g protéines</p>
                  </div>
                  <p style={styles.mealCal}>{meal.calories} kcal</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const getMealEmoji = (type) => {
  const map = { 'Petit-déjeuner': '🌅', 'Déjeuner': '☀️', 'Dîner': '🌙', 'Collation': '🍎' }
  return map[type] || '🍽️'
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column' },
  scroll: { flex: 1, overflowY: 'auto', padding: '20px 20px 100px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingTop: '8px' },
  greeting: { fontSize: '22px', fontWeight: '700', color: 'var(--text)' },
  date: { fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' },
  avatarBtn: { background: 'none' },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    background: 'var(--green)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '700',
  },
  calCard: {
    background: 'var(--white)', borderRadius: '24px', padding: '24px',
    boxShadow: 'var(--shadow)', marginBottom: '16px',
  },
  calMain: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' },
  calInfo: { flex: 1 },
  calValue: { fontSize: '40px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--coral)', lineHeight: 1 },
  calLabel: { fontSize: '15px', color: 'var(--text-muted)', marginTop: '2px' },
  calRemain: { fontSize: '13px', color: 'var(--green)', fontWeight: '600', marginTop: '6px' },
  macros: { display: 'flex', gap: '12px' },
  macro: { flex: 1, background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '12px' },
  macroTop: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  macroDot: { width: '8px', height: '8px', borderRadius: '50%' },
  macroLabel: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' },
  macroVal: { fontSize: '20px', fontWeight: '700', color: 'var(--text)' },
  macroBar: { height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '8px 0 4px', overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' },
  macroMax: { fontSize: '11px', color: 'var(--text-muted)' },
  weightCard: {
    background: 'linear-gradient(135deg, var(--green) 0%, #6AAB7A 100%)',
    borderRadius: '20px', padding: '20px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', boxShadow: '0 6px 20px rgba(74, 124, 89, 0.3)',
  },
  weightLeft: {},
  weightLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  weightVal: { fontSize: '28px', fontWeight: '700', color: 'white', fontFamily: 'var(--font-display)' },
  weightBtn: {
    background: 'rgba(255,255,255,0.2)', color: 'white',
    padding: '10px 18px', borderRadius: '50px', fontSize: '13px', fontWeight: '600',
    backdropFilter: 'blur(4px)',
  },
  section: { marginBottom: '24px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text)' },
  addBtn: {
    background: 'var(--green-pale)', color: 'var(--green)',
    padding: '8px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: '600',
  },
  empty: { textAlign: 'center', padding: '40px 20px', background: 'var(--white)', borderRadius: '20px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' },
  emptyHint: { fontSize: '14px', color: 'var(--text-muted)' },
  mealList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  mealItem: {
    background: 'var(--white)', borderRadius: '16px', padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  mealEmoji: { fontSize: '28px' },
  mealInfo: { flex: 1 },
  mealName: { fontSize: '15px', fontWeight: '600', color: 'var(--text)' },
  mealMeta: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  mealCal: { fontSize: '15px', fontWeight: '700', color: 'var(--coral)' },
}
