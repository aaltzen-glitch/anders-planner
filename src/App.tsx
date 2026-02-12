import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

function Icon({ name }: { name: string }) {
  return <span style={{ width: 18, display: 'inline-block', opacity: .9 }}>{name}</span>
}

export default function App() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState<string>('')
  const [sessionEmail, setSessionEmail] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSessionEmail(data.session?.user?.email ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSessionEmail(s?.user?.email ?? null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signInMagicLink() {
    if (!email) return
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) alert(error.message)
    else alert('Kolla din mail: du får en inloggningslänk.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return <div className="container">Laddar…</div>

  if (!sessionEmail) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin: '10vh auto' }}>
          <div className="h1">Anders Planner</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Logga in med magic link (mail). Inget lösenord behövs.
          </div>
          <div style={{ marginTop: 14 }}>
            <input className="input" placeholder="din@mail.se" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={signInMagicLink}>Skicka inloggningslänk</button>
          </div>
          <div className="muted small" style={{ marginTop: 12 }}>
            Android: Chrome → ⋮ → “Lägg till på startskärmen”.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="h2">Anders Planner</div>
        <div className="muted small" style={{ marginTop: 4, marginBottom: 14 }}>
          Inloggad: {sessionEmail}
        </div>

        <nav className="grid" style={{ gap: 6 }}>
          <NavLink to="/" end className={({ isActive }) => 'navitem ' + (isActive ? 'active' : '')}>
            <Icon name="📊" /> Dashboard
          </NavLink>
          <NavLink to="/data" className={({ isActive }) => 'navitem ' + (isActive ? 'active' : '')}>
            <Icon name="🧾" /> Data
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => 'navitem ' + (isActive ? 'active' : '')}>
            <Icon name="⚙️" /> Settings
          </NavLink>
          <NavLink to="/instructions" className={({ isActive }) => 'navitem ' + (isActive ? 'active' : '')}>
            <Icon name="📘" /> Instruktioner
          </NavLink>
        </nav>

        <div style={{ marginTop: 14 }}>
          <button className="btn" onClick={signOut}>Logga ut</button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
