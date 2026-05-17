import { t } from '../lib/i18n'

const baseTabs = [
  { id: 'dashboard', icon: '🏠', labelKey: 'nav_home' },
  { id: 'weight', icon: '⚖️', labelKey: 'nav_weight' },
  { id: 'measurements', icon: '📏', labelKey: 'nav_meas' },
  { id: 'addMeal', icon: '➕', labelKey: '', cta: true },
  { id: 'workout', icon: '🏋️', labelKey: 'nav_workout' },
  { id: 'profile', icon: '👤', labelKey: 'nav_profile' },
]

export default function BottomNav({ active, onNavigate, user }) {
  const tabs = baseTabs.map(tab => ({
    ...tab,
    label: tab.cta ? '' : t(user, tab.labelKey),
  }))
  return (
    <div style={styles.nav}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          style={{
            ...styles.tab,
            ...(tab.cta ? styles.ctaTab : {}),
            ...(active === tab.id && !tab.cta ? styles.tabActive : {}),
          }}
          onClick={() => onNavigate(tab.id)}
        >
          <span style={{ fontSize: tab.cta ? '24px' : '20px' }}>{tab.icon}</span>
          {!tab.cta && (
            <span style={{ ...styles.label, ...(active === tab.id ? styles.labelActive : {}) }}>
              {tab.label}
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
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    background: 'none', padding: '6px 6px', borderRadius: '12px', minWidth: '48px',
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
