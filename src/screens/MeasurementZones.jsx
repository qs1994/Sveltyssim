import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/i18n'

export default function MeasurementZones({ user, onBack }) {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('tronc')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('tronc')

  useEffect(() => { fetchZones() }, [])

  const fetchZones = async () => {
    const { data } = await supabase
      .from('measurement_zones')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    if (data) setZones(data)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const nextPos = zones.length > 0 ? Math.max(...zones.map(z => z.position || 0)) + 1 : 0
    await supabase.from('measurement_zones').insert({
      user_id: user.id,
      name: newName.trim(),
      zone_type: newType,
      position: nextPos,
    })
    setNewName('')
    setNewType('tronc')
    setAdding(false)
    setLoading(false)
    fetchZones()
  }

  const startEdit = (z) => {
    setEditingId(z.id)
    setEditName(z.name)
    setEditType(z.zone_type)
  }

  const handleEditSave = async () => {
    if (!editName.trim()) return
    await supabase.from('measurement_zones').update({
      name: editName.trim(),
      zone_type: editType,
    }).eq('id', editingId)
    setEditingId(null)
    fetchZones()
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t(user, 'zones_confirm_delete'))) return
    await supabase.from('measurement_zones').delete().eq('id', id)
    fetchZones()
  }

  const handlePrefill = async () => {
    const classics = t(user, 'classic_zones')
    if (!Array.isArray(classics)) return
    setLoading(true)
    const rows = classics.map((c, i) => ({
      user_id: user.id,
      name: c.name,
      zone_type: c.zone_type,
      position: i,
    }))
    await supabase.from('measurement_zones').insert(rows)
    setLoading(false)
    fetchZones()
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>{t(user, 'back')}</button>
        <h2 style={styles.title}>{t(user, 'zones_title')}</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={styles.scroll}>
        <p style={styles.subtitle}>{t(user, 'zones_subtitle')}</p>

        {zones.length === 0 && (
          <>
            <div style={styles.emptyCard}>
              <p style={styles.emptyIcon}>📏</p>
              <p style={styles.emptyText}>{t(user, 'zones_empty')}</p>
            </div>
            <button style={styles.prefillBtn} onClick={handlePrefill} disabled={loading}>
              {t(user, 'zones_classic_set')}
            </button>
          </>
        )}

        {zones.length > 0 && (
          <div style={styles.list}>
            {zones.map(z => (
              <div key={z.id} style={styles.zoneCard}>
                {editingId === z.id ? (
                  <div style={styles.editBlock}>
                    <input
                      style={styles.input}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      autoFocus
                    />
                    <div style={styles.typeRow}>
                      {['tronc', 'membres'].map(type => (
                        <button
                          key={type}
                          style={{
                            ...styles.typeBtn,
                            ...(editType === type ? styles.typeBtnActive : {}),
                          }}
                          onClick={() => setEditType(type)}
                        >
                          {t(user, type === 'tronc' ? 'zones_type_tronc' : 'zones_type_membres')}
                        </button>
                      ))}
                    </div>
                    <div style={styles.editActions}>
                      <button style={styles.confirmBtn} onClick={handleEditSave}>✅</button>
                      <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.zoneRow}>
                    <div style={styles.zoneInfo}>
                      <p style={styles.zoneName}>{z.name}</p>
                      <p style={{ ...styles.zoneType, color: z.zone_type === 'tronc' ? 'var(--coral)' : 'var(--green)' }}>
                        {t(user, z.zone_type === 'tronc' ? 'zones_type_tronc' : 'zones_type_membres')}
                      </p>
                    </div>
                    <button style={styles.iconBtn} onClick={() => startEdit(z)}>✏️</button>
                    <button style={styles.iconBtn} onClick={() => handleDelete(z.id)}>🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {adding ? (
          <div style={styles.addCard}>
            <input
              style={styles.input}
              placeholder={t(user, 'zones_name_placeholder')}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
            <div style={styles.typeRow}>
              {['tronc', 'membres'].map(type => (
                <button
                  key={type}
                  style={{
                    ...styles.typeBtn,
                    ...(newType === type ? styles.typeBtnActive : {}),
                  }}
                  onClick={() => setNewType(type)}
                >
                  {t(user, type === 'tronc' ? 'zones_type_tronc' : 'zones_type_membres')}
                </button>
              ))}
            </div>
            <div style={styles.addActions}>
              <button style={styles.confirmBtn} onClick={handleAdd} disabled={loading || !newName.trim()}>
                {t(user, 'confirm')}
              </button>
              <button style={styles.cancelBtn} onClick={() => { setAdding(false); setNewName('') }}>
                {t(user, 'cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button style={styles.addBtn} onClick={() => setAdding(true)}>
            {t(user, 'zones_add_new')}
          </button>
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
  subtitle: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' },
  emptyCard: { background: 'var(--white)', borderRadius: '20px', padding: '30px 20px', textAlign: 'center', marginBottom: '12px', boxShadow: 'var(--shadow)' },
  emptyIcon: { fontSize: '40px', marginBottom: '8px' },
  emptyText: { fontSize: '14px', color: 'var(--text-muted)' },
  prefillBtn: {
    width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green-pale)', color: 'var(--green)', fontWeight: '700', fontSize: '15px',
    marginBottom: '16px',
  },
  list: { marginBottom: '16px' },
  zoneCard: {
    background: 'var(--white)', borderRadius: '14px', padding: '12px 16px',
    marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  zoneRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  zoneInfo: { flex: 1 },
  zoneName: { fontSize: '15px', fontWeight: '600' },
  zoneType: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' },
  iconBtn: { background: 'none', fontSize: '18px', padding: '6px' },
  addBtn: {
    width: '100%', padding: '16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '15px',
    boxShadow: '0 4px 14px rgba(74, 124, 89, 0.3)',
  },
  addCard: {
    background: 'var(--white)', borderRadius: '16px', padding: '16px',
    boxShadow: 'var(--shadow)',
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', fontSize: '15px',
    background: 'var(--cream)', marginBottom: '10px',
  },
  typeRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  typeBtn: {
    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
    background: 'var(--cream)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px',
    border: '1.5px solid var(--border)',
  },
  typeBtnActive: { background: 'var(--green)', color: 'white', borderColor: 'var(--green)' },
  editBlock: {},
  addActions: { display: 'flex', gap: '8px' },
  editActions: { display: 'flex', gap: '8px', marginTop: '8px' },
  confirmBtn: {
    flex: 1, background: 'var(--green-pale)', color: 'var(--green)', fontWeight: '700',
    borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '14px',
  },
  cancelBtn: {
    flex: 1, background: 'var(--cream-dark)', color: 'var(--text-muted)', fontWeight: '700',
    borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '14px',
  },
}
