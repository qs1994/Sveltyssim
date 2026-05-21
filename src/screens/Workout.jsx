import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { t, locale } from '../lib/i18n'
import WorkoutCatalog from './WorkoutCatalog'

const GROUPS = ['biceps', 'triceps', 'jambes', 'pecs', 'dos', 'epaules']
const GROUP_EMOJI = {
  biceps: '💪',
  triceps: '🦾',
  jambes: '🦵',
  pecs: '🫁',
  dos: '🏋️',
  epaules: '🤸',
}

export default function Workout({ user, onBack }) {
  const [activeGroup, setActiveGroup] = useState('biceps')
  const [exercises, setExercises] = useState([])
  const [logs, setLogs] = useState([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [selectedExo, setSelectedExo] = useState(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [notes, setNotes] = useState('')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (!showCatalog) {
      fetchExercises()
      fetchLogs()
    }
  }, [showCatalog])

  const fetchExercises = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (data) setExercises(data)
  }

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) setLogs(data)
  }

  const handleSaveLog = async () => {
    if (!selectedExo) return
    const w = parseFloat(weight)
    const r = parseInt(reps, 10)
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return
    setLoading(true)
    await supabase.from('workout_logs').insert({
      user_id: user.id,
      exercise_id: selectedExo.id,
      date: logDate,
      weight: w,
      reps: r,
      notes: notes.trim() || null,
    })
    setLoading(false)
    setSavedFlash(true)
    setWeight('')
    setReps('')
    setNotes('')
    setLogDate(new Date().toISOString().split('T')[0])
    fetchLogs()
    setTimeout(() => setSavedFlash(false), 2500)
  }

  const handleDeleteLog = async (logId) => {
    if (!window.confirm(t(user, 'workout_delete_log'))) return
    await supabase.from('workout_logs').delete().eq('id', logId)
    fetchLogs()
  }

  if (showCatalog) {
    return <WorkoutCatalog user={user} onBack={() => setShowCatalog(false)} />
  }

  // Exos du groupe actif
  const groupExos = exercises.filter(e => e.muscle_group === activeGroup)

  // Dernière perf et meilleure perf par exo (à partir des logs)
  const exoStats = (exoId) => {
    const exoLogs = logs.filter(l => l.exercise_id === exoId)
    if (exoLogs.length === 0) return { last: null, best: null }
    const last = exoLogs[0] // déjà trié desc par date
    const best = exoLogs.reduce((max, l) => (Number(l.weight) > Number(max.weight) ? l : max), exoLogs[0])
    return { last, best }
  }

  // === Indice musculation global ===
  // Pour chaque date où il y a au moins un log :
  //   - pour chaque exo, on prend son MAX-cumulé jusqu'à cette date (forward-fill)
  //   - variation % vs la 1ère valeur connue de cet exo
  //   - on moyenne sur tous les exos qui ont déjà été commencés
  const buildGlobalChart = () => {
    if (logs.length === 0) return []
    const exoDateMax = {}
    logs.forEach(l => {
      if (!exoDateMax[l.exercise_id]) exoDateMax[l.exercise_id] = {}
      const w = Number(l.weight)
      const cur = exoDateMax[l.exercise_id][l.date]
      if (cur == null || w > cur) exoDateMax[l.exercise_id][l.date] = w
    })
    const exoFirstWeight = {}
    Object.entries(exoDateMax).forEach(([exoId, dateMap]) => {
      const earliest = Object.keys(dateMap).sort()[0]
      exoFirstWeight[exoId] = dateMap[earliest]
    })
    const allDates = [...new Set(logs.map(l => l.date))].sort()
    return allDates.map(date => {
      const variations = []
      Object.entries(exoDateMax).forEach(([exoId, dateMap]) => {
        const firstDate = Object.keys(dateMap).sort()[0]
        if (firstDate > date) return
        let maxUpToHere = -Infinity
        Object.entries(dateMap).forEach(([d, w]) => { if (d <= date && w > maxUpToHere) maxUpToHere = w })
        const first = exoFirstWeight[exoId]
        if (first > 0 && maxUpToHere > -Infinity) {
          variations.push(((maxUpToHere - first) / first) * 100)
        }
      })
      return {
        date,
        label: new Date(date + 'T12:00:00').toLocaleDateString(locale(user), { day: '2-digit', month: 'short' }),
        indice: variations.length ? variations.reduce((s, v) => s + v, 0) / variations.length : 0,
      }
    })
  }
  const globalChart = buildGlobalChart()
  const latestIndice = globalChart.length ? globalChart[globalChart.length - 1].indice : null
  const indiceMin = globalChart.length ? Math.min(0, ...globalChart.map(d => d.indice)) - 1 : -5
  const indiceMax = globalChart.length ? Math.max(0, ...globalChart.map(d => d.indice)) + 1 : 5

  // Si un exo est sélectionné : afficher la saisie + son historique + son graph
  if (selectedExo) {
    const exoLogs = logs.filter(l => l.exercise_id === selectedExo.id)
    const sortedAsc = [...exoLogs].sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at))

    // Graph : poids max par séance/date
    const byDate = {}
    sortedAsc.forEach(l => {
      const w = Number(l.weight)
      if (byDate[l.date] == null || w > byDate[l.date]) byDate[l.date] = w
    })
    const chartData = Object.keys(byDate).sort().map(d => ({
      date: d,
      label: new Date(d + 'T12:00:00').toLocaleDateString(locale(user), { day: '2-digit', month: 'short' }),
      poids: byDate[d],
    }))

    const stats = exoStats(selectedExo.id)
    const isToday = logDate === new Date().toISOString().split('T')[0]

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.back} onClick={() => setSelectedExo(null)}>{t(user, 'back')}</button>
          <h2 style={styles.title}>{selectedExo.name}</h2>
          <div style={{ width: 36 }} />
        </div>

        <div style={styles.scroll}>
          {/* Stats résumé */}
          {(stats.last || stats.best) && (
            <div style={styles.statsRow}>
              {stats.last && (
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>{t(user, 'workout_last_perf')}</p>
                  <p style={styles.statVal}>{stats.last.weight} kg</p>
                  <p style={styles.statSub}>× {stats.last.reps} reps</p>
                </div>
              )}
              {stats.best && (
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>🏆 {t(user, 'workout_best')}</p>
                  <p style={{ ...styles.statVal, color: 'var(--coral)' }}>{stats.best.weight} kg</p>
                  <p style={styles.statSub}>× {stats.best.reps} reps</p>
                </div>
              )}
            </div>
          )}

          {/* Saisie d'une nouvelle perf */}
          <div style={styles.inputCard}>
            <p style={styles.inputLabel}>{t(user, 'workout_add_log')}</p>

            <div style={styles.dateRow}>
              <span style={styles.dateIcon}>📅</span>
              <input
                style={styles.dateInput}
                type="date"
                value={logDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setLogDate(e.target.value)}
              />
              {!isToday && (
                <button style={styles.todayBtn} onClick={() => setLogDate(new Date().toISOString().split('T')[0])}>
                  {t(user, 'today')}
                </button>
              )}
            </div>

            <div style={styles.perfRow}>
              <div style={styles.perfBox}>
                <label style={styles.perfLabel}>{t(user, 'workout_weight')}</label>
                <div style={styles.perfInputWrap}>
                  <input
                    style={styles.perfInput}
                    type="number" inputMode="decimal" step="0.5"
                    placeholder="—"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                  <span style={styles.perfUnit}>{t(user, 'workout_unit_kg')}</span>
                </div>
              </div>
              <div style={styles.perfBox}>
                <label style={styles.perfLabel}>{t(user, 'workout_reps')}</label>
                <div style={styles.perfInputWrap}>
                  <input
                    style={styles.perfInput}
                    type="number" inputMode="numeric"
                    placeholder="—"
                    value={reps}
                    onChange={e => setReps(e.target.value)}
                  />
                  <span style={styles.perfUnit}>×</span>
                </div>
              </div>
            </div>

            <input
              style={styles.notesInput}
              type="text"
              placeholder={t(user, 'workout_notes_placeholder')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <button
              style={styles.saveBtn}
              onClick={handleSaveLog}
              disabled={loading || !weight || !reps}
            >
              {savedFlash ? `✅ ${t(user, 'workout_log_saved')}` : loading ? t(user, 'saving') : t(user, 'save')}
            </button>
          </div>

          {/* Graphique */}
          {chartData.length > 1 && (
            <div style={styles.chartCard}>
              <p style={styles.cardTitle}>{t(user, 'workout_progress')}</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--white)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow)', fontSize: '13px' }}
                    formatter={(val) => [`${val} kg`, t(user, 'workout_weight')]}
                  />
                  <Line type="monotone" dataKey="poids" stroke="#E8715A" strokeWidth={3}
                    dot={{ fill: '#E8715A', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Historique */}
          <div style={styles.histCard}>
            <p style={styles.cardTitle}>{t(user, 'workout_logs_history')}</p>
            {exoLogs.length === 0 ? (
              <p style={styles.noLogs}>{t(user, 'workout_no_logs')}</p>
            ) : (
              exoLogs.slice(0, 30).map(log => (
                <div key={log.id} style={styles.logItem}>
                  <div style={styles.logLeft}>
                    <p style={styles.logDate}>
                      {new Date(log.date + 'T12:00:00').toLocaleDateString(locale(user), { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    {log.notes && <p style={styles.logNotes}>“{log.notes}”</p>}
                  </div>
                  <div style={styles.logPerf}>
                    <span style={styles.logWeight}>{log.weight} kg</span>
                    <span style={styles.logReps}>× {log.reps}</span>
                  </div>
                  <button style={styles.delBtn} onClick={() => handleDeleteLog(log.id)}>🗑️</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // === Vue principale : tabs des groupes + liste d'exos ===
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>{t(user, 'back')}</button>
        <h2 style={styles.title}>🏋️ {t(user, 'workout_title')}</h2>
        <button style={styles.gear} onClick={() => setShowCatalog(true)}>⚙️</button>
      </div>

      {/* Tabs groupes musculaires */}
      <div style={styles.tabsRow}>
        {GROUPS.map(g => (
          <button
            key={g}
            style={{ ...styles.tab, ...(activeGroup === g ? styles.tabActive : {}) }}
            onClick={() => setActiveGroup(g)}
          >
            <span style={styles.tabIcon}>{GROUP_EMOJI[g]}</span>
            <span style={styles.tabLabel}>{t(user, `mg_${g}`)}</span>
          </button>
        ))}
      </div>

      <div style={styles.scroll}>
        {/* Indice global musculation */}
        {latestIndice != null && (
          <div style={styles.globalCard}>
            <div style={styles.globalHeaderRow}>
              <div>
                <p style={styles.globalLabel}>{t(user, 'workout_global_indice')}</p>
                <p style={{
                  ...styles.globalValue,
                  color: latestIndice > 0 ? '#4A7C59' : latestIndice < 0 ? '#E8715A' : '#8E8E93',
                }}>
                  {latestIndice > 0 ? '+' : ''}{latestIndice.toFixed(1)}%
                </p>
              </div>
              <div style={styles.globalIconWrap}>
                <span style={styles.globalIcon}>🏋️</span>
              </div>
            </div>
            {globalChart.length > 1 && (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={globalChart} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[indiceMin, indiceMax]} tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <ReferenceLine y={0} stroke="#C0BBB3" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{ background: 'var(--white)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow)', fontSize: '13px' }}
                    formatter={(val) => [`${val > 0 ? '+' : ''}${val.toFixed(1)}%`, t(user, 'workout_global_indice')]}
                  />
                  <Line type="monotone" dataKey="indice" stroke="#4A7C59" strokeWidth={3}
                    dot={{ fill: '#4A7C59', r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
            <p style={styles.globalHint}>{t(user, 'workout_global_hint')}</p>
          </div>
        )}

        {groupExos.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🏋️</p>
            <p style={styles.emptyText}>{t(user, 'workout_no_exos')}</p>
            <button style={styles.setupBtn} onClick={() => setShowCatalog(true)}>
              {t(user, 'workout_setup')}
            </button>
            {exercises.length === 0 && (
              <p style={styles.emptyHint}>
                💡 {t(user, 'workout_prefill')} {t(user, 'workout_setup').replace('⚙️', '→')}
              </p>
            )}
          </div>
        ) : (
          groupExos.map(ex => {
            const stats = exoStats(ex.id)
            return (
              <button key={ex.id} style={styles.exoBtn} onClick={() => setSelectedExo(ex)}>
                <div style={styles.exoBtnLeft}>
                  <p style={styles.exoBtnName}>{ex.name}</p>
                  {stats.last ? (
                    <p style={styles.exoBtnHint}>
                      {t(user, 'workout_last_perf')} : <strong>{stats.last.weight} kg × {stats.last.reps}</strong>
                    </p>
                  ) : (
                    <p style={styles.exoBtnHintMuted}>{t(user, 'workout_no_logs')}</p>
                  )}
                </div>
                <span style={styles.exoBtnArrow}>→</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '52px 20px 12px', borderBottom: '1px solid var(--border)', background: 'var(--white)',
  },
  back: { background: 'none', fontSize: '22px', color: 'var(--green)', width: 36 },
  title: { fontSize: '18px', fontWeight: '700' },
  gear: { background: 'none', fontSize: '20px', width: 36 },

  // Tabs groupes
  tabsRow: {
    display: 'flex', overflowX: 'auto', gap: '6px',
    padding: '12px 16px', background: 'var(--white)',
    borderBottom: '1px solid var(--border)',
  },
  tab: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    padding: '8px 12px', borderRadius: '14px',
    background: 'var(--cream)', border: '1.5px solid transparent',
    minWidth: '62px', flexShrink: 0,
  },
  tabActive: { background: 'var(--green-pale)', borderColor: 'var(--green)' },
  tabIcon: { fontSize: '18px' },
  tabLabel: { fontSize: '11px', fontWeight: '700', color: 'var(--text)' },

  scroll: { flex: 1, overflowY: 'auto', padding: '16px 20px 100px' },

  // Indice global muscu
  globalCard: {
    background: 'var(--white)', borderRadius: '20px', padding: '16px',
    marginBottom: '14px', boxShadow: 'var(--shadow)',
  },
  globalHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' },
  globalLabel: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  globalValue: { fontSize: '30px', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '2px' },
  globalIconWrap: {
    background: 'var(--green-pale)', borderRadius: '50%',
    width: '44px', height: '44px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  globalIcon: { fontSize: '22px' },
  globalHint: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center', fontStyle: 'italic' },

  emptyState: { textAlign: 'center', padding: '40px 20px', background: 'var(--white)', borderRadius: '20px', boxShadow: 'var(--shadow)' },
  emptyIcon: { fontSize: '44px', marginBottom: '10px' },
  emptyText: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' },
  setupBtn: {
    padding: '12px 18px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '14px',
  },
  emptyHint: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' },

  exoBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
    background: 'var(--white)', borderRadius: '14px', padding: '14px 16px',
    marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textAlign: 'left',
  },
  exoBtnLeft: { flex: 1 },
  exoBtnName: { fontSize: '15px', fontWeight: '700' },
  exoBtnHint: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  exoBtnHintMuted: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' },
  exoBtnArrow: { fontSize: '18px', color: 'var(--green)' },

  // Sub-screen (selected exo)
  statsRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  statCard: {
    flex: 1, background: 'var(--white)', borderRadius: '16px', padding: '14px',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statLabel: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' },
  statVal: { fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--green)' },
  statSub: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },

  inputCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' },
  inputLabel: { fontSize: '16px', fontWeight: '700', marginBottom: '14px' },

  dateRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  dateIcon: { fontSize: '20px' },
  dateInput: {
    flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', fontSize: '15px',
    background: 'var(--cream)',
  },
  todayBtn: {
    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green-pale)', color: 'var(--green)', fontSize: '13px', fontWeight: '600',
  },

  perfRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  perfBox: { flex: 1, minWidth: 0 },
  perfLabel: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' },
  perfInputWrap: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'var(--cream)', borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--green-pale)', padding: '4px 8px',
    minWidth: 0,
  },
  perfInput: {
    flex: 1, minWidth: 0, width: '100%', background: 'transparent',
    border: 'none', fontSize: '20px', fontWeight: '700',
    textAlign: 'center', padding: '4px 0',
    WebkitAppearance: 'none', MozAppearance: 'textfield',
  },
  perfUnit: { fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', flexShrink: 0 },

  notesInput: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', fontSize: '14px',
    background: 'var(--cream)', marginBottom: '12px',
  },

  saveBtn: {
    width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '15px',
    boxShadow: '0 4px 14px rgba(74, 124, 89, 0.3)',
  },

  cardTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '12px' },
  chartCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' },

  histCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow)' },
  noLogs: { fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' },
  logItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 0', borderBottom: '1px solid var(--border)',
  },
  logLeft: { flex: 1 },
  logDate: { fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: '600' },
  logNotes: { fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' },
  logPerf: { display: 'flex', alignItems: 'baseline', gap: '6px' },
  logWeight: { fontSize: '16px', fontWeight: '700', color: 'var(--text)' },
  logReps: { fontSize: '13px', color: 'var(--text-muted)' },
  delBtn: { background: 'none', fontSize: '16px', padding: '4px' },
}
