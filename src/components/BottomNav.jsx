const tabs = [
  { id: 'dashboard', icon: '🏠', label: 'Accueil' },
  { id: 'weight', icon: '⚖️', label: 'Poids' },
  { id: 'addMeal', icon: '➕', label: '', cta: true },
  { id: 'fasting', icon: '⏱️', label: 'Jeûne' },
  { id: 'profile', icon: '👤', label: 'Profil' },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <div style={styles.nav}>
      {tabs.map(t => (
        <button
          key={t.id}
          style={{
            ...styles.tab,
            ...(t.cta ? styles.ctaTab : {}),
            ...(active === t.id && !t.cta ? styles.tabActive : {}),
          }}
          onClick={() => onNavigate(t.id)}
        >
          <span style={{ fontSize: t.cta ? '24px' : '20px' }}>{t.icon}</span>
          {!t.cta && (
            <span style={{ ...styles.label, ...(active === t.id ? styles.labelActive : {}) }}>
              {t.label}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

const styles = {
  nav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    background: 'var(--white)', borderTop: '1px solid var(--border)',
    padding: '8px 0 20px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
  },
  tab: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
    background: 'none', padding: '8px 12px', borderRadius: '12px', minWidth: '56px',
  },
  tabActive: { background: 'var(--green-pale)' },
  ctaTab: {
    background: 'var(--green)', borderRadius: '50%',
    width: '52px', height: '52px', marginTop: '-18px',
    boxShadow: '0 4px 16px rgba(74, 124, 89, 0.45)',
    justifyContent: 'center', padding: 0,
  },
  label: { fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)' },
  labelActive: { color: 'var(--green)', fontWeight: '700' },
}
