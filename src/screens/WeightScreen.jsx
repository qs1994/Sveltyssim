import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { buildWeightMessage } from '../lib/weightMessages'

const moodColor = (mood) => {
  if (mood === 'good') return '#4A7C59'
  if (mood === 'warning') return '#E8715A'
  return '#5B8DEF'
}

const moodEmoji = (mood) => {
  if (mood === 'good') return '🎉'
  if (mood === 'warning') return '💪'
  return '🌱'
}

export default function WeightScreen({ user, goals, onBack }) {
  const [weights, setWeights] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => { fetchWeights() }, [])

  const fetchWeights = async () => {
    const { data } = await supabase
      .from('weights')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(90)
    if (data) setWeights(data)
  }

  const handleSave = async () => {
    if (!newWeight || !selectedDate) return
    const newW = parseFloat(newWeight)
    // Poids précédent = la dernière entrée strictement antérieure à selectedDate
    // (weights est trié par date ascendante)
    const prevEntries = weights.filter(w => w.date < selectedDate)
    const previousWeight = prevEntries.length > 0
      ? Number(prevEntries[prevEntries.length - 1].weight)
      : null

    setLoading(true)
    await supabase.from('weights').upsert({
      user_id: user.id,
      date: selectedDate,
      weight: newW,
    }, { onConflict: 'user_id,date' })
    setLoading(false)
    setSaved(true)
    setNewWeight('')
    setSelectedDate(new Date().toISOString().split('T')[0])
    fetchWeights()
    setTimeout(() => setSaved(false), 2000)

    // Construire et afficher le message d'encouragement
    const msg = buildWeightMessage({
      user,
      previousWeight,
      newWeight: newW,
      targetWeight: goals?.target_weight ?? null,
    })
    setMessage(msg)
  }

  const handleEdit = (w) => {
    setEditingId(w.id)
    setEditValue(String(w.weight))
  }

  const handleEditSave = async (id) => {
    if (!editValue) return
    await supabase.from('weights').update({ weight: parseFloat(editValue) }).eq('id', id)
    setEditingId(null)
    setEditValue('')
    fetchWeights()
  }

  const handleDelete = async (id) => {
    await supabase.from('weights').delete().eq('id', id)
    setEditingId(null)
    fetchWeights()
  }

  const last = weights[weights.length - 1]
  const first = weights[0]
  const diff = last && first ? (last.weight - first.weight).toFixed(1) : null

  const chartData = weights.map(w => ({
    date: new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    poids: w.weight,
  }))

  const allValues = [...weights.map(w => w.weight), ...(goals.target_weight ? [Number(goals.target_weight)] : [])]
  const minW = allValues.length ? Math.min(...allValues) - 2 : 50
  const maxW = allValues.length ? Math.max(...allValues) + 2 : 100
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>←</button>
        <h2 style={styles.title}>Suivi du poids</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={styles.scroll}>
        {/* Input card */}
        <div style={styles.inputCard}>
          <p style={styles.inputLabel}>⚖️ Ajouter un poids</p>
          <div style={styles.dateRow}>
            <span style={styles.dateIcon}>📅</span>
            <input
              style={styles.dateInput}
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
            />
            {!isToday && (
              <button style={styles.todayBtn} onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                Aujourd'hui
              </button>
            )}
          </div>
          {!isToday && (
            <p style={styles.pastDateLabel}>
              📆 Entrée pour le {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          )}
          <div style={styles.inputRow}>
            <input
              style={styles.weightInput}
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="Ex: 72.5"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
            />
            <span style={styles.kg}>kg</span>
            <button style={styles.saveBtn} onClick={handleSave} disabled={loading || !newWeight}>
              {saved ? '✅' : loading ? '⏳' : 'Sauver'}
            </button>
          </div>
        </div>

        {/* Stats */}
        {last && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Actuel</p>
              <p style={styles.statVal}>{last.weight} kg</p>
            </div>
            {goals.target_weight && (
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Objectif</p>
                <p style={{ ...styles.statVal, color: 'var(--green)' }}>{goals.target_weight} kg</p>
              </div>
            )}
            {diff !== null && weights.length > 1 && (
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Évolution</p>
                <p style={{ ...styles.statVal, color: parseFloat(diff) > 0 ? '#E8715A' : '#4A7C59' }}>
                  {diff > 0 ? '+' : ''}{diff} kg
                </p>
              </div>
            )}
            {goals.target_weight && last && (
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Reste</p>
                <p style={{ ...styles.statVal, color: last.weight > goals.target_weight ? '#E8715A' : '#4A7C59' }}>
                  {last.weight > goals.target_weight
                    ? `-${(last.weight - goals.target_weight).toFixed(1)} kg`
                    : '🎯 Atteint !'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        {weights.length > 1 ? (
          <div style={styles.chartCard}>
            <p style={styles.chartTitle}>Courbe sur {weights.length} entrées</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[minW, maxW]} tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--white)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow)', fontSize: '13px' }}
                  formatter={(val) => [`${val} kg`, 'Poids']}
                />
                {goals.target_weight && (
                  <ReferenceLine y={goals.target_weight} stroke="#4A7C59" strokeDasharray="4 4" label={{ value: 'Objectif', position: 'insideTopRight', fontSize: 10, fill: '#4A7C59' }} />
                )}
                <Line
                  type="monotone" dataKey="poids"
                  stroke="#4A7C59" strokeWidth={3}
                  dot={{ fill: '#4A7C59', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4A7C59' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={styles.emptyChart}>
            <p style={styles.emptyIcon}>📈</p>
            <p style={styles.emptyText}>Ajoute au moins 2 entrées pour voir ta courbe !</p>
          </div>
        )}

        {/* Modal d'encouragement */}
        {message && (
          <div style={styles.modalOverlay} onClick={() => setMessage(null)}>
            <div
              style={{
                ...styles.modalCard,
                borderTop: `6px solid ${moodColor(message.mood)}`,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={styles.modalEmoji}>{moodEmoji(message.mood)}</div>
              <p style={{ ...styles.modalTitle, color: moodColor(message.mood) }}>
                {message.title}
              </p>
              <p style={styles.modalBody}>{message.body}</p>
              <button
                style={{ ...styles.modalCloseBtn, background: moodColor(message.mood) }}
                onClick={() => setMessage(null)}
              >
                {message.closeLabel}
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {weights.length > 0 && (
          <div style={styles.histSection}>
            <p style={styles.histTitle}>Historique <span style={styles.histHint}>· appuie sur ✏️ pour modifier</span></p>
            {[...weights].reverse().map(w => (
              <div key={w.id}>
                {editingId === w.id ? (
                  /* Mode édition */
                  <div style={styles.editRow}>
                    <p style={styles.editDate}>
                      {new Date(w.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <div style={styles.editInputRow}>
                      <input
                        style={styles.editInput}
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <span style={styles.editKg}>kg</span>
                    </div>
                    <div style={styles.editActions}>
                      <button style={styles.confirmBtn} onClick={() => handleEditSave(w.id)}>✅</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(w.id)}>🗑️</button>
                      <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  </div>
                ) : (
                  /* Mode normal */
                  <div style={styles.histItem}>
                    <p style={styles.histDate}>
                      {new Date(w.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p style={styles.histWeight}>{w.weight} kg</p>
                    <button style={styles.editBtn} onClick={() => handleEdit(w)}>✏️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '52px 20px 16px', borderBottom: '1px solid var(--border)', background: 'var(--white)',
  },
  back: { background: 'none', fontSize: '22px', color: 'var(--green)', width: 36 },
  title: { fontSize: '18px', fontWeight: '700' },
  scroll: { flex: 1, overflowY: 'auto', padding: '20px 20px 100px' },
  inputCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' },
  inputLabel: { fontSize: '16px', fontWeight: '700', marginBottom: '16px' },
  dateRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  dateIcon: { fontSize: '20px' },
  dateInput: {
    flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', fontSize: '15px',
    background: 'var(--cream)', color: 'var(--text)',
  },
  todayBtn: {
    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green-pale)', color: 'var(--green)',
    fontSize: '13px', fontWeight: '600',
  },
  pastDateLabel: {
    fontSize: '13px', color: 'var(--coral)', fontWeight: '500',
    marginBottom: '12px', textTransform: 'capitalize',
  },
  inputRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  weightInput: {
    flex: 1, minWidth: 0, padding: '14px 10px', borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--green-pale)', fontSize: '22px', fontWeight: '700',
    textAlign: 'center', background: 'var(--cream)',
  },
  kg: { fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)', flexShrink: 0 },
  saveBtn: {
    flexShrink: 0, padding: '14px 16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '15px',
  },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  statCard: {
    flex: 1, background: 'var(--white)', borderRadius: '16px', padding: '16px',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statLabel: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' },
  statVal: { fontSize: '22px', fontWeight: '700', fontFamily: 'var(--font-display)' },
  chartCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' },
  chartTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '16px' },
  emptyChart: { textAlign: 'center', padding: '40px 20px', background: 'var(--white)', borderRadius: '20px', marginBottom: '16px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { fontSize: '14px', color: 'var(--text-muted)', maxWidth: '200px', margin: '0 auto' },
  histSection: { background: 'var(--white)', borderRadius: '20px', padding: '20px' },
  histTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '12px' },
  histHint: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400' },
  histItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid var(--border)',
  },
  histDate: { fontSize: '14px', color: 'var(--text-muted)', textTransform: 'capitalize', flex: 1 },
  histWeight: { fontSize: '16px', fontWeight: '700', marginRight: '12px' },
  editBtn: { background: 'none', fontSize: '18px', padding: '4px' },
  editRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 0', borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  editDate: { fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize', flex: 1, minWidth: '100px' },
  editInputRow: { display: 'flex', alignItems: 'baseline', gap: '4px' },
  editInput: {
    width: '80px', padding: '8px 10px', borderRadius: '10px',
    border: '2px solid var(--green)', fontSize: '18px', fontWeight: '700',
    textAlign: 'center', background: 'var(--cream)',
  },
  editKg: { fontSize: '13px', color: 'var(--text-muted)' },
  editActions: { display: 'flex', gap: '6px' },
  confirmBtn: { background: 'var(--green-pale)', borderRadius: '8px', padding: '6px 10px', fontSize: '16px' },
  deleteBtn: { background: '#FFF0EE', borderRadius: '8px', padding: '6px 10px', fontSize: '16px' },
  cancelBtn: { background: 'var(--cream-dark)', borderRadius: '8px', padding: '6px 10px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '700' },
  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(20, 25, 35, 0.55)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', zIndex: 1000,
    animation: 'fadeIn 0.18s ease-out',
  },
  modalCard: {
    background: 'var(--white)',
    borderRadius: '24px',
    padding: '28px 24px 22px',
    maxWidth: '360px', width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
    animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  modalEmoji: {
    fontSize: '52px',
    marginBottom: '8px',
    lineHeight: 1,
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    marginBottom: '14px',
    letterSpacing: '0.3px',
  },
  modalBody: {
    fontSize: '15px',
    lineHeight: 1.55,
    color: 'var(--text)',
    whiteSpace: 'pre-line',
    marginBottom: '22px',
  },
  modalCloseBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 'var(--radius-sm)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
  },
}
