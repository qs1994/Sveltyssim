import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/i18n'

const GROUPS = ['biceps', 'triceps', 'jambes', 'pecs', 'dos', 'epaules']

export default function WorkoutCatalog({ user, onBack }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState('biceps')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editGroup, setEditGroup] = useState('biceps')

  useEffect(() => { fetchExos() }, [])

  const fetchExos = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .order('muscle_group', { ascending: true })
      .order('created_at', { ascending: true })
    if (data) setExercises(data)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    await supabase.from('exercises').insert({
      user_id: user.id,
      name: newName.trim(),
      muscle_group: newGroup,
    })
    setNewName('')
    setAdding(false)
    setLoading(false)
    fetchExos()
  }

  const startEdit = (e) => {
    setEditingId(e.id)
    setEditName(e.name)
    setEditGroup(e.muscle_group)
  }

  const handleEditSave = async () => {
    if (!editName.trim()) return
    await supabase.from('exercises').update({
      name: editName.trim(),
      muscle_group: editGroup,
    }).eq('id', editingId)
    setEditingId(null)
    fetchExos()
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t(user, 'catalog_confirm_delete'))) return
    await supabase.from('exercises').delete().eq('id', id)
    fetchExos()
  }

  const handlePrefill = async () => {
    const classics = t(user, 'classic_exercises')
    if (!Array.isArray(classics)) return
    setLoading(true)
    const rows = classics.map((c, i) => ({
      user_id: user.id,
      name: c.name,
      muscle_group: c.muscle_group,
      position: i,
    }))
    await supabase.from('exercises').insert(rows)
    setLoading(false)
    fetchExos()
  }

  // Grouper par groupe musculaire
  const grouped = GROUPS.map(g => ({
    group: g,
    label: t(user, `mg_${g}`),
    items: exercises.filter(e => e.muscle_group === g),
  }))

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>{t(user, 'back')}</button>
        <h2 style={styles.title}>{t(user, 'catalog_title')}</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={styles.scroll}>
        <p style={styles.subtitle}>{t(user, 'catalog_subtitle')}</p>

        {exercises.length === 0 && (
          <>
            <div style={styles.emptyCard}>
              <p style={styles.emptyIcon}>🏋️</p>
              <p style={styles.emptyText}>{t(user, 'catalog_empty')}</p>
            </div>
            <button style={styles.prefillBtn} onClick={handlePrefill} disabled={loading}>
              {t(user, 'workout_prefill')}
            </button>
          </>
        )}

        {/* Liste groupée */}
        {grouped.map(g => g.items.length > 0 && (
          <div key={g.group} style={styles.groupSection}>
            <p style={styles.groupHeader}>{g.label} <span style={styles.groupCount}>· {g.items.length}</span></p>
            {g.items.map(ex => (
              <div key={ex.id} style={styles.exoCard}>
                {editingId === ex.id ? (
                  <div style={styles.editBlock}>
                    <input
                      style={styles.input}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      autoFocus
                    />
                    <div style={styles.groupRow}>
                      {GROUPS.map(grp => (
                        <button
                          key={grp}
                          style={{
                            ...styles.groupBtn,
                            ...(editGroup === grp ? styles.groupBtnActive : {}),
                          }}
                          onClick={() => setEditGroup(grp)}
                        >
                          {t(user, `mg_${grp}`)}
                        </button>
                      ))}
                    </div>
                    <div style={styles.actionsRow}>
                      <button style={styles.confirmBtn} onClick={handleEditSave}>✅</button>
                      <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.exoRow}>
                    <span style={styles.exoName}>{ex.name}</span>
                    <button style={styles.iconBtn} onClick={() => startEdit(ex)}>✏️</button>
                    <button style={styles.iconBtn} onClick={() => handleDelete(ex.id)}>🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Ajout */}
        {adding ? (
          <div style={styles.addCard}>
            <input
              style={styles.input}
              placeholder={t(user, 'catalog_name_placeholder')}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
            <p style={styles.groupLabel}>{t(user, 'catalog_group_label')}</p>
            <div style={styles.groupRow}>
              {GROUPS.map(grp => (
                <button
                  key={grp}
                  style={{
                    ...styles.groupBtn,
                    ...(newGroup === grp ? styles.groupBtnActive : {}),
                  }}
                  onClick={() => setNewGroup(grp)}
                >
                  {t(user, `mg_${grp}`)}
                </button>
              ))}
            </div>
            <div style={styles.actionsRow}>
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
            {t(user, 'catalog_add')}
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

  groupSection: { marginBottom: '20px' },
  groupHeader: {
    fontSize: '14px', fontWeight: '700', color: 'var(--green)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
  },
  groupCount: { color: 'var(--text-muted)', fontWeight: '500' },
  exoCard: {
    background: 'var(--white)', borderRadius: '12px', padding: '10px 14px',
    marginBottom: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  exoRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  exoName: { flex: 1, fontSize: '14px', fontWeight: '500' },
  iconBtn: { background: 'none', fontSize: '17px', padding: '4px' },

  addBtn: {
    width: '100%', padding: '16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '15px',
    boxShadow: '0 4px 14px rgba(74, 124, 89, 0.3)',
  },
  addCard: { background: 'var(--white)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow)' },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', fontSize: '15px',
    background: 'var(--cream)', marginBottom: '12px',
  },
  groupLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' },
  groupRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' },
  groupBtn: {
    padding: '8px 12px', borderRadius: '10px',
    background: 'var(--cream)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px',
    border: '1.5px solid var(--border)',
  },
  groupBtnActive: { background: 'var(--green)', color: 'white', borderColor: 'var(--green)' },
  actionsRow: { display: 'flex', gap: '8px' },
  confirmBtn: {
    flex: 1, background: 'var(--green-pale)', color: 'var(--green)', fontWeight: '700',
    borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '14px',
  },
  cancelBtn: {
    flex: 1, background: 'var(--cream-dark)', color: 'var(--text-muted)', fontWeight: '700',
    borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '14px',
  },
  editBlock: {},
}
