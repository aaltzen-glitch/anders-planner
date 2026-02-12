export default function Instructions() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="h1">Instruktioner</div>
        <div className="muted">Hur du använder appen (synkar via Supabase).</div>
      </div>

      <div className="card">
        <div className="h2">Block & Underprojekt</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Gå till <b>Settings</b> och lägg till/ta bort <b>Blocks</b> och <b>Underprojekt</b>.
          De syns direkt i dropdown i <b>Data</b>.
        </div>
      </div>

      <div className="card">
        <div className="h2">Data</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Lägg till nya poster med datum, plan/utfall, betald-status, prio och status.
          Dashboard summerar per månad och per block.
        </div>
      </div>

      <div className="card">
        <div className="h2">Android “app”</div>
        <div className="muted" style={{ marginTop: 6 }}>
          När du har publicerat sidan: öppna i Chrome → ⋮ → “Lägg till på startskärmen”.
        </div>
      </div>
    </div>
  )
}
