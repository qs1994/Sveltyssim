import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { t, locale } from '../lib/i18n'
import MeasurementZones from './MeasurementZones'

export default function Measurements({ user, onBack }) {
  const [zones, setZones] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [inputs, setInputs] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showZones, setShowZones] = useState(false)

  useEffect(() => {
    if (!showZones) {
      fetchZones()
      fetchMeasurements()
    }
  }, [showZones])

  const fetchZones = async () => {
    const { data } = await supabase
      .from('measurement_zones')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    if (data) setZones(data)
  }

  const fetchMeasurements = async () => {
    const { data } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    if (data) setMeasurements(data)
  }

  const setInput = (zoneId, val) => setInputs(prev => ({ ...prev, [zoneId]: val }))

  const handleSaveAll = async () => {
    const entries = Object.entries(inputs)
      .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
      .map(([zone_id, v]) => ({
        user_id: user.id,
        zone_id,
        date: selectedDate,
        value_cm: parseFloat(v),
      }))
    if (entries.length === 0) return

    setLoading(true)
    await supabase.from('measurements').upsert(entries, { onConflict: 'zone_id,date' })
    setLoading(false)
    setSaved(true)
    setInputs({})
    setSelectedDate(new Date().toISOString().split('T')[0])
    fetchMeasurements()
    setTimeout(() => setSaved(false), 2500)
  }

  // === Calcul des indices tronc / membres ===
  // Pour chaque date où il existe au moins une mesure :
  //   - on regarde, pour chaque zone, sa valeur ce jour-là (si dispo)
  //   - on calcule le % de variation vs. la 1ère valeur connue de cette zone
  //   - on moyenne ces % séparément pour les zones de type 'tronc' et 'membres'
  const zoneById = Object.fromEntries(zones.map(z => [z.id, z]))

  // groupe par date
  const byDate = {}
  measurements.forEach(m => {
    if (!byDate[m.date]) byDate[m.date] = {}
    byDate[m.date][m.zone_id] = Number(m.value_cm)
  })

  // 1ère valeur de chaque zone
  const firstByZone = {}
  zones.forEach(z => {
    const ms = measurements.filter(m => m.zone_id === z.id)
    if (ms.length > 0) firstByZone[z.id] = Number(ms[0].value_cm)
  })

  const sortedDates = Object.keys(byDate).sort()
  const chartData = sortedDates.map(date => {
    const dayValues = byDate[date]
    const variations = { tronc: [], membres: [] }
    Object.entries(dayValues).forEach(([zoneId, value]) => {
      const zone = zoneById[zoneId]
      const first = firstByZone[zoneId]
      if (!zone || !first) return
      const variation = ((value - first) / first) * 100
      variations[zone.zone_type].push(variation)
    })
    const avg = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null
    return {
      date,
      label: new Date(date).toLocaleDateString(locale(user), { day: '2-digit', month: 'short' }),
      tronc: avg(variations.tronc),
      membres: avg(variations.membres),
    }
  })

  // Indices actuels (dernière date)
  const latest = chartData[chartData.length - 1]
  const allChartValues = chartData.flatMap(d => [d.tronc, d.membres]).filter(v => v != null)
  const minY = allChartValues.length ? Math.min(0, ...allChartValues) - 1 : -5
  const maxY = allChartValues.length ? Math.max(0, ...allChartValues) + 1 : 5

  // Historique : on regroupe par date
  const sessions = sortedDates.slice().reverse().slice(0, 20).map(date => {
    const entries = Object.entries(byDate[date]).map(([zoneId, value]) => {
      const z = zoneById[zoneId]
      return { name: z?.name || '?', value, type: z?.zone_type }
    })
    return { date, entries }
  })

  // === Si on affiche le sous-écran zones, on remplace ===
  if (showZones) {
    return <MeasurementZones user={user} onBack={() => setShowZones(false)} />
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>{t(user, 'back')}</button>
        <h2 style={styles.title}>{t(user, 'meas_title')}</h2>
        <button style={styles.gear} onClick={() => setShowZones(true)}>⚙️</button>
      </div>

      <div style={styles.scroll}>
        {/* Saisie */}
        <div style={styles.inputCard}>
          <p style={styles.inputLabel}>{t(user, 'meas_add')}</p>

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
                {t(user, 'today')}
              </button>
            )}
          </div>

          {zones.length === 0 ? (
            <div style={styles.noZones}>
              <p style={styles.noZonesText}>{t(user, 'meas_no_zones')}</p>
              <button style={styles.setupBtn} onClick={() => setShowZones(true)}>
                {t(user, 'meas_setup_zones')}
              </button>
            </div>
          ) : (
            <>
              <p style={styles.hint}>{t(user, 'meas_input_hint')}</p>

              {/* Inputs groupés par type */}
              {['tronc', 'membres'].map(type => {
                const groupZones = zones.filter(z => z.zone_type === type)
                if (groupZones.length === 0) return null
                return (
                  <div key={type} style={styles.zoneGroup}>
                    <p style={styles.zoneGroupTitle}>
                      {t(user, type === 'tronc' ? 'zones_type_tronc' : 'zones_type_membres')}
                    </p>
                    {groupZones.map(z => (
                      <div key={z.id} style={styles.zoneInputRow}>
                        <label style={styles.zoneInputLabel}>{z.name}</label>
                        <input
                          style={styles.zoneInput}
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          placeholder="—"
                          value={inputs[z.id] ?? ''}
                          onChange={e => setInput(z.id, e.target.value)}
                        />
                        <span style={styles.unit}>{t(user, 'meas_unit')}</span>
                      </div>
                    ))}
                  </div>
                )
              })}

              <button
                style={styles.saveBtn}
                onClick={handleSaveAll}
                disabled={loading || Object.values(inputs).every(v => !v)}
              >
                {saved ? `✅ ${t(user, 'meas_session_saved')}` : loading ? t(user, 'saving') : t(user, 'meas_save_all')}
              </button>
            </>
          )}
        </div>

        {/* Indices actuels */}
        {latest && (
          <div style={styles.indicesCard}>
            <p style={styles.cardTitle}>{t(user, 'meas_indices_title')}</p>
            <div style={styles.indicesRow}>
              <div style={styles.indexBox}>
                <p style={styles.indexLabel}>{t(user, 'meas_index_tronc')}</p>
                <p style={{ ...styles.indexValue, color: (latest.tronc ?? 0) < 0 ? '#4A7C59' : (latest.tronc ?? 0) > 0 ? '#E8715A' : '#8E8E93' }}>
                  {latest.tronc != null ? `${latest.tronc > 0 ? '+' : ''}${latest.tronc.toFixed(1)}%` : '—'}
                </p>
              </div>
              <div style={styles.indexBox}>
                <p style={styles.indexLabel}>{t(user, 'meas_index_membres')}</p>
                <p style={{ ...styles.indexValue, color: (latest.membres ?? 0) > 0 ? '#4A7C59' : (latest.membres ?? 0) < 0 ? '#E8715A' : '#8E8E93' }}>
                  {latest.membres != null ? `${latest.membres > 0 ? '+' : ''}${latest.membres.toFixed(1)}%` : '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Graphique */}
        {chartData.length > 1 && (
          <div style={styles.chartCard}>
            <p style={styles.cardTitle}>{t(user, 'meas_chart_title')}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[minY, maxY]} tick={{ fontSize: 10, fill: '#8E8E93' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <ReferenceLine y={0} stroke="#C0BBB3" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ background: 'var(--white)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow)', fontSize: '13px' }}
                  formatter={(val) => (val == null ? '—' : `${val.toFixed(1)}%`)}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="tronc" name={t(user, 'meas_index_tronc')} stroke="#E8715A" strokeWidth={3} dot={{ fill: '#E8715A', r: 3 }} connectNulls />
                <Line type="monotone" dataKey="membres" name={t(user, 'meas_index_membres')} stroke="#4A7C59" strokeWidth={3} dot={{ fill: '#4A7C59', r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <p style={styles.chartHint}>{t(user, 'meas_chart_hint')}</p>
          </div>
        )}

        {/* Historique */}
        {sessions.length > 0 ? (
          <div style={styles.histCard}>
            <p style={styles.cardTitle}>{t(user, 'meas_history')}</p>
            {sessions.map(s => (
              <div key={s.date} style={styles.histSession}>
                <p style={styles.histDate}>
                  {t(user, 'meas_session_of')} {new Date(s.date + 'T12:00:00').toLocaleDateString(locale(user), { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                <div style={styles.histEntries}>
                  {s.entries.map((e, i) => (
                    <span key={i} style={{
                      ...styles.histChip,
                      background: e.type === 'tronc' ? 'rgba(232,113,90,0.12)' : 'var(--green-pale)',
                      color: e.type === 'tronc' ? '#E8715A' : 'var(--green)',
                    }}>
                      {e.name} · {e.value} cm
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : zones.length > 0 && (
          <div style={styles.emptyHist}>
            <p style={styles.emptyIcon}>📊</p>
            <p style={styles.emptyText}>{t(user, 'meas_no_data')}</p>
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
  gear: { background: 'none', fontSize: '20px', width: 36 },
  scroll: { flex: 1, overflowY: 'auto', padding: '20px 20px 100px' },

  inputCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' },
  inputLabel: { fontSize: '16px', fontWeight: '700', marginBottom: '14px' },
  dateRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
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
  hint: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' },

  noZones: { textAlign: 'center', padding: '16px 0' },
  noZonesText: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' },
  setupBtn: {
    padding: '12px 18px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '14px',
  },

  zoneGroup: { marginBottom: '12px' },
  zoneGroupTitle: {
    fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
  },
  zoneInputRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '6px 0',
  },
  zoneInputLabel: { flex: 1, fontSize: '14px', fontWeight: '500' },
  zoneInput: {
    width: '80px', padding: '8px 10px', borderRadius: '10px',
    border: '1.5px solid var(--border)', fontSize: '16px', fontWeight: '700',
    textAlign: 'center', background: 'var(--cream)',
  },
  unit: { fontSize: '12px', color: 'var(--text-muted)', width: '24px' },

  saveBtn: {
    width: '100%', marginTop: '12px', padding: '14px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '15px',
    boxShadow: '0 4px 14px rgba(74, 124, 89, 0.3)',
  },

  cardTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '12px' },

  indicesCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' },
  indicesRow: { display: 'flex', gap: '12px' },
  indexBox: {
    flex: 1, background: 'var(--cream)', borderRadius: '14px', padding: '14px',
    textAlign: 'center',
  },
  indexLabel: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' },
  indexValue: { fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px' },

  chartCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' },
  chartHint: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', fontStyle: 'italic' },

  histCard: { background: 'var(--white)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow)' },
  histSession: { padding: '12px 0', borderBottom: '1px solid var(--border)' },
  histDate: { fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '8px' },
  histEntries: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  histChip: {
    fontSize: '12px', padding: '4px 10px', borderRadius: '12px',
    fontWeight: '600',
  },

  emptyHist: { background: 'var(--white)', borderRadius: '20px', padding: '40px 20px', textAlign: 'center', boxShadow: 'var(--shadow)' },
  emptyIcon: { fontSize: '40px', marginBottom: '8px' },
  emptyText: { fontSize: '14px', color: 'var(--text-muted)' },
}
