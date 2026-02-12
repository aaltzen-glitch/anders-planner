import React from 'react'
import { Link } from 'react-router-dom'
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
      const [{ data: b }, { data: it }] = await Promise.all([
        supabase.from('blocks').select('*').order('sort_order', { ascending: true }),
        supabase.from('items').select('*').order('date', { ascending: false })
      ])
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

  const monthMap = new Map<string, { plan: number; actual: number }>()
  for (const it of items) {
    if (!it.date) continue
    const mk = monthKey(it.date)
    const cur = monthMap.get(mk) ?? { plan: 0, actual: 0 }
    cur.plan += it.plan_sek ?? 0
    cur.actual += it.actual_sek ?? 0
    monthMap.set(mk, cur)
  }
  const months = Array.from(monthMap.entries()).sort((a,b)=>a[0].localeCompare(b[0]))

  if (loading) return <div className="card">Laddar…</div>

  return (
    <div className="grid" style={{ gap: 16 }}>

      {/* KPI */}
      <div className="card">
        <div className="h1">Översikt</div>
        <div style={{ marginTop: 12 }}>
          <div><b>Plan:</b> {sek(totalPlan)} kr</div>
          <div><b>Utfall:</b> {sek(totalActual)} kr</div>
          <div><b>Kvar:</b> {sek(remaining)} kr</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Link className="btn primary" to="/data">+ Ny post</Link>
        </div>
      </div>

      {/* Senaste poster */}
      <div className="card">
        <div className="h2">Senaste poster</div>
        <div style={{ marginTop: 10 }}>
          {items.slice(0,5).map(it => (
            <div key={it.id} style={{ padding: '8px 0', borderBottom: '1px solid #243044' }}>
              <div style={{ fontWeight: 800 }}>{it.title}</div>
              <div className="muted small">
                {it.date} • {sek(it.plan_sek ?? 0)} kr
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Månadsöversikt */}
      <div className="card">
        <div className="h2">Månadsöversikt</div>
        <div style={{ marginTop: 10 }}>
          {months.map(([mk, v]) => (
            <div key={mk} style={{ padding: '6px 0', borderBottom: '1px solid #243044' }}>
              <b>{mk}</b> – Plan: {sek(v.plan)} / Utfall: {sek(v.actual)}
            </div>
          ))}
        </div>
      </div>

      {/* Block */}
      <div className="card">
        <div className="h2">Block</div>
        <div style={{ marginTop: 10 }}>
          {blocks.map(b => {
            const rows = items.filter(i => i.block_id === b.id)
            const plan = rows.reduce((s,x)=>s+(x.plan_sek ?? 0),0)
            const actual = rows.reduce((s,x)=>s+(x.actual_sek ?? 0),0)
            return (
              <div key={b.id} style={{ padding: '6px 0', borderBottom: '1px solid #243044' }}>
                <b>{b.name}</b> – {sek(plan)} / {sek(actual)}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
