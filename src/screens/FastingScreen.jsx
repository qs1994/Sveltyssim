import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function FastingScreen({ user }) {
  const [goal, setGoal] = useState(16)
  const [editingGoal, setEditingGoal] = useState(false)
  const [tempGoal, setTempGoal] = useState('16')
  const [activeFast, setActiveFast] = useState(null)
  const [history, setHistory] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchGoal()
    fetchActiveFast()
    fetchHistory()
  }, [])

  useEffect(() => {
    if (activeFast) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(activeFast.started_at).getTime()) / 1000))
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      setElapsed(0)
    }
    return () => clearInterval(intervalRef.current)
  }, [activeFast])

  const fetchGoal = async () => {
    const { data } = await supabase.from('goals').select('fasting_goal').eq('user_id', user.id).single()
    if (data?.fasting_goal) setGoal(data.fasting_goal)
  }

  const fetchActiveFast = async () => {
    const { data } = await supabase.from('fasts').select('*').eq('user_id', user.id).is('ended_at', null).single()
    if (data) setActiveFast(data)
  }

  const fetchHistory = async () => {
    const { data } = await supabase.from('fasts').select('*').eq('user_id', user.id).not('ended_at', 'is', null).order('started_at', { ascending: false }).limit(10)
    if (data) setHistory(data)
  }

  const handleStart = async () => {
    const { data } = await supabase.from('fasts').insert({ user_id: user.id, started_at: new Date().toISOString(), goal_hours: goal }).select().single()
    if (data) setActiveFast(data)
  }

  const handleStop = async () => {
    await supabase.from('fasts').update({ ended_at: new Date().toISOString() }).eq('id', activeFast.id)
    setActiveFast(null)
    fetchHistory()
  }

  const saveGoal = async () => {
    const val = Math.max(1, Math.min(72, parseInt(tempGoal) || 16))
    setGoal(val)
    setEditingGoal(false)
    await supabase.from('goals').upsert({ user_id: user.id, fasting_goal: val }, { onConflict: 'user_id' })
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatDuration = (start, end) => {
    const diff = Math.floor((new Date(end) - new Date(start)) / 1000)
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    return `${h}h${m > 0 ? `${m}m` : ''}`
  }

  const goalSeconds = goal * 3600
  const progress = activeFast ? Math.min(elapsed / goalSeconds, 1) : 0
  const isComplete = progress >= 1

  const size = 240
  const r = (size - 24) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * progress

  return (
    <div style={styles.container}>
      <div style={styles.scroll}>
        <p style={styles.pageTitle}>⏱️ Jeûne intermittent</p>

        {/* Goal setting */}
        <div style={styles.goalCard}>
          <p style={styles.goalLabel}>Objectif de jeûne</p>
          {editingGoal ? (
            <div style={styles.goalEditRow}>
              <input
                style={styles.goalInput}
                type="number"
                inputMode="numeric"
                value={tempGoal}
                onChange={e => setTempGoal(e.target.value)}
                autoFocus
              />
              <span style={styles.goalUnit}>heures</span>
              <button style={styles.goalSaveBtn} onClick={saveGoal}>✅</button>
            </div>
          ) : (
            <div style={styles.goalDisplay}>
              <span style={styles.goalValue}>{goal}h</span>
              {!activeFast && (
                <button style={styles.goalEditBtn} onClick={() => { setTempGoal(String(goal)); setEditingGoal(true) }}>✏️ Modifier</button>
              )}
            </div>
          )}
        </div>

        {/* Timer ring */}
        <div style={styles.ringContainer}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EAE4" strokeWidth="16" />
            <circle
              cx={size/2} cy={size/2} r={r} fill="none"
              stroke={isComplete ? '#4A7C59' : '#E8715A'}
              strokeWidth="16"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div style={styles.ringContent}>
            {activeFast ? (
              <>
                <p style={styles.timerLabel}>{isComplete ? '🎉 Objectif atteint !' : 'En cours'}</p>
                <p style={styles.timerValue}>{formatTime(elapsed)}</p>
                <p style={styles.timerSub}>{Math.round(progress * 100)}% de {goal}h</p>
              </>
            ) : (
              <>
                <p style={styles.timerLabel}>Prêt ?</p>
                <p style={styles.timerValueSmall}>{goal}h</p>
                <p style={styles.timerSub}>objectif</p>
              </>
            )}
          </div>
        </div>

        {/* Start / Stop button */}
        {activeFast ? (
          <button style={styles.stopBtn} onClick={handleStop}>
            ⏹️ Terminer le jeûne
          </button>
        ) : (
          <button style={styles.startBtn} onClick={handleStart}>
            ▶️ Démarrer le jeûne
          </button>
        )}

        {activeFast && (
          <p style={styles.startedAt}>
            Démarré à {new Date(activeFast.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · objectif {new Date(new Date(activeFast.started_at).getTime() + goal * 3600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={styles.histSection}>
            <p style={styles.histTitle}>Historique</p>
            {history.map(f => {
              const dur = Math.floor((new Date(f.ended_at) - new Date(f.started_at)) / 3600000 * 10) / 10
              const success = dur >= (f.goal_hours || goal)
              return (
                <div key={f.id} style={styles.histItem}>
                  <div>
                    <p style={styles.histDate}>
                      {new Date(f.started_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p style={styles.histTime}>
                      {new Date(f.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} → {new Date(f.ended_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={styles.histRight}>
                    <p style={{ ...styles.histDur, color: success ? '#4A7C59' : '#E8715A' }}>
                      {formatDuration(f.started_at, f.ended_at)}
                    </p>
                    <p style={styles.histBadge}>{success ? '✅' : '⚡'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  scroll: { flex: 1, overflowY: 'auto', padding: '20px 20px 100px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', marginBottom: '20px', paddingTop: '8px' },
  goalCard: {
    background: 'var(--white)', borderRadius: '20px', padding: '18px 20px',
    marginBottom: '24px', boxShadow: 'var(--shadow)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  goalLabel: { fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)' },
  goalDisplay: { display: 'flex', alignItems: 'center', gap: '12px' },
  goalValue: { fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--green)' },
  goalEditBtn: { background: 'var(--green-pale)', color: 'var(--green)', padding: '6px 12px', borderRadius: '50px', fontSize: '13px', fontWeight: '600' },
  goalEditRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  goalInput: { width: '60px', padding: '8px', borderRadius: '10px', border: '2px solid var(--green)', fontSize: '18px', fontWeight: '700', textAlign: 'center', background: 'var(--cream)' },
  goalUnit: { fontSize: '14px', color: 'var(--text-muted)' },
  goalSaveBtn: { background: 'var(--green-pale)', borderRadius: '10px', padding: '8px 12px', fontSize: '16px' },
  ringContainer: { position: 'relative', width: 240, height: 240, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ringContent: { position: 'absolute', textAlign: 'center' },
  timerLabel: { fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' },
  timerValue: { fontSize: '42px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text)', letterSpacing: '-1px' },
  timerValueSmall: { fontSize: '52px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text)' },
  timerSub: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' },
  startBtn: {
    display: 'block', width: '100%', padding: '18px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontSize: '18px', fontWeight: '700',
    boxShadow: '0 4px 20px rgba(74,124,89,0.4)', marginBottom: '12px',
  },
  stopBtn: {
    display: 'block', width: '100%', padding: '18px', borderRadius: 'var(--radius-sm)',
    background: '#E8715A', color: 'white', fontSize: '18px', fontWeight: '700',
    boxShadow: '0 4px 20px rgba(232,113,90,0.4)', marginBottom: '12px',
  },
  startedAt: { textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' },
  histSection: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginTop: '8px' },
  histTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '12px' },
  histItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' },
  histDate: { fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' },
  histTime: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  histRight: { textAlign: 'right' },
  histDur: { fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-display)' },
  histBadge: { fontSize: '14px', marginTop: '2px' },
}
