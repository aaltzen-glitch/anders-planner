import React from 'react'
import { supabase } from '../supabase'
import type { Block, Item } from '../types'

function sek(n: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n)
}
function monthKey(d: string) {
  return d.slice(0, 7)
}

export default function Dashboard() {
  const [items, setItems] = React.useState<Item[]>([])
  const [blocks, setBlocks] = React.useState<Block[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const [{ data: b, error: eb }, { data: it, error: ei }] = await Promise.all([
        supabase.from('blocks').select('*').order('sort_order', { ascending: true }).order('name'),
        supabase.from('items').select('*').order('date', { ascending: false }).limit(5000)
      ])
      if (eb) alert(eb.message)
      if (ei) alert(ei.message)
      if (!mounted) return
      setBlocks((b ?? []) as any)
      setItems((it ?? []) as any)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const totalPlan = items.reduce((s, x) => s + (x.plan_sek ?? 0), 0)
  const totalActual = items.reduce((s, x) => s + (x.actual_sek ?? 0), 0)
  const remaining = totalPlan - totalActual

  const byBlock = blocks.map(bl => {
    const rows = items.filter(i => i.block_id === bl.id)
    return {
      name: bl.name,
      plan: rows.reduce((s, x) => s + (x.plan_sek ?? 0), 0),
      actual: rows.reduce((s, x) => s + (x.actual_sek ?? 0), 0),
    }
  })

  const monthMap = new Map<string, { plan: number; actual: number }>()
  for (const it of items) {
    if (!it.date) continue
    const mk = monthKey(it.date)
    const cur = monthMap.get(mk) ?? { plan: 0, actual: 0 }
    cur.plan += it.plan_sek ?? 0
    cur.actual += it.actual_sek ?? 0
    monthMap.set(mk, cur)
  }
  const months = Array.from(monthMap.entries()).sort((a,b) => a[0].localeCompare(b[0]))

  if (loading) return <div className="card">Laddar…</div>

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <div className="h1">Dashboard</div>
        <div className="muted">Plan / Utfall / Kvar + summering per block och månad.</div>
      </div>

      <div className="kpi">
        <div className="card">
          <div className="muted small">Plan</div>
          <div className="value">{sek(totalPlan)} kr</div>
        </div>
        <div className="card">
          <div className="muted small">Utfall</div>
          <div className="value">{sek(totalActual)} kr</div>
        </div>
        <div className="card">
          <div className="muted small">Kvar</div>
          <div className="value">{sek(remaining)} kr</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr', gap: 16 }}>
        <div className="card">
          <div className="h2">Månad</div>
          <div className="muted small">Summering baserat på datum (yyyy-mm).</div>
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>Månad</th><th>Plan</th><th>Utfall</th></tr>
              </thead>
              <tbody>
                {months.length === 0 && <tr><td colSpan={3} className="muted">Inga poster ännu.</td></tr>}
                {months.map(([mk, v]) => (
                  <tr key={mk}>
                    <td>{mk}</td>
                    <td>{sek(v.plan)}</td>
                    <td>{sek(v.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="h2">Per block</div>
          <div className="muted small">Alla block du skapat.</div>
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>Block</th><th>Plan</th><th>Utfall</th></tr>
              </thead>
              <tbody>
                {byBlock.map(r => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td>{sek(r.plan)}</td>
                    <td>{sek(r.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
