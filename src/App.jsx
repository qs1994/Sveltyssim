import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './screens/Auth'
import Dashboard from './screens/Dashboard'
import AddMeal from './screens/AddMeal'
import WeightScreen from './screens/WeightScreen'
import Profile from './screens/Profile'
import BottomNav from './components/BottomNav'
import FastingScreen from './screens/FastingScreen'
import FoodDatabase from './screens/FoodDatabase'

const DEFAULT_GOALS = { calories: 2000, carbs: 250, proteins: 150, target_weight: null }

export default function App() {
  const [session, setSession] = useState(null)
  const [screen, setScreen] = useState('dashboard')
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchGoals(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchGoals(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchGoals = async (userId) => {
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).single()
    if (data) setGoals(data)
  }

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green)' }}>Sveltyssim</p>
      </div>
    </div>
  )

  if (!session) return <Auth />

  const showNav = ['dashboard', 'weight', 'profile', 'fasting', 'foodDatabase'].includes(screen)

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {screen === 'dashboard' && (
        <Dashboard user={session.user} goals={goals} onNavigate={setScreen} />
      )}
      {screen === 'addMeal' && (
        <AddMeal user={session.user} onBack={() => setScreen('dashboard')} onSaved={() => setScreen('dashboard')} />
      )}
      {screen === 'weight' && (
        <WeightScreen user={session.user} goals={goals} onBack={() => setScreen('dashboard')} />
      )}
      {screen === 'profile' && (
        <Profile
          user={session.user} goals={goals}
          onBack={() => setScreen('dashboard')}
          onGoalsUpdated={(g) => setGoals(prev => ({ ...prev, ...g }))}
        />
      )}
      {screen === 'fasting' && (
        <FastingScreen user={session.user} />
      )}
      {screen === 'foodDatabase' && (
        <FoodDatabase onClose={() => setScreen('dashboard')} />
      )}
