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

function clamp(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.round(n)
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
        supabase.from('items').select('*').order('date', { ascending: false }).limit(5000),
      ])
      if (eb) alert(eb.message)
      if (ei) alert(ei.message)
      if (!mounted) return
      setBlocks((b ?? []) as any)
      setItems((it ?? []) as any)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const totalPlan = clamp(items.reduce((s, x) => s + (x.plan_sek ?? 0), 0))
  const totalActual = clamp(items.reduce((s, x) => s + (x.actual_sek ?? 0), 0))
  const remaining = clamp(totalPlan - totalActual)

  const pct = totalPlan > 0 ? Math.max(0, Math.min(1, totalActual / totalPlan)) : 0

  // Per block
  const byBlock = blocks
    .map((bl) => {
      const rows = items.filter((i) => i.block_id === bl.id)
      const plan = clamp(rows.reduce((s, x) => s + (x.plan_sek ?? 0), 0))
      const actual = clamp(rows.reduce((s, x) => s + (x.actual_sek ?? 0), 0))
      return { id: bl.id, name: bl.name, plan, actual, remaining: clamp(plan - actual) }
    })
    .sort((a, b) => b.plan - a.plan)

  // Per month
  const monthMap = new Map<string, { plan: number; actual: number }>()
  for (const it of items) {
    if (!it.date) continue
    const mk = monthKey(it.date)
    const cur = monthMap.get(mk) ?? { plan: 0, actual: 0 }
    cur.plan += it.plan_sek ?? 0
    cur.actual += it.actual_sek ?? 0
    monthMap.set(mk, cur)
  }
  const months = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12) // senaste 12 månader

  const recent = items.slice(0, 8)

  if (loading) return <div className="card">Laddar…</div>

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Topbar */}
      <div className="card">
        <div className="row space">
          <div>
            <div className="h1">Dashboard</div>
            <div className="muted">Snabb överblick (Plan / Utfall / Kvar) + block och månader.</div>
          </div>
          <div className="row">
            <Link className="btn primary" to="/data">
              + Ny post
            </Link>
            <Link className="btn" to="/settings">
              Hantera block
            </Link>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 14 }}>
          <div className="row space">
            <div className="muted small">Budget-progress</div>
            <div className="muted small">{Math.round(pct * 100)}%</div>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(36,48,68,.9)',
              overflow: 'hidden',
              marginTop: 8,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round(pct * 100)}%`,
                background: 'linear-gradient(90deg, rgba(14,165,233,.85), rgba(34,211,238,.75))',
              }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi">
        <div className="card">
          <div className="muted small">Plan</div>
          <div className="value">{sek(totalPlan)} kr</div>
          <div className="muted small" style={{ marginTop: 6 }}>
            Totalt planerade kostnader
          </div>
        </div>

        <div className="card">
          <div className="muted small">Utfall</div>
          <div className="value">{sek(totalActual)} kr</div>
          <div className="muted small" style={{ marginTop: 6 }}>
            Inlagda utfall (kontoutdrag)
          </div>
        </div>

        <div className="card">
          <div className="muted small">Kvar</div>
          <div className="value">{sek(remaining)} kr</div>
          <div className="muted small" style={{ marginTop: 6 }}>
            Plan − Utfall
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid" style={{ gridTemplateColumns: '1.1fr .9fr', gap: 16 }}>
        {/* Months */}
        <div className="card">
          <div className="row space">
            <div>
              <div className="h2">Månadsöversikt</div>
              <div className="muted small">Summering per månad baserat på Datum.</div>
            </div>
            <Link className="btn" to="/data">
              Visa data
            </Link>
          </div>

          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Månad</th>
                  <th>Plan</th>
                  <th>Utfall</th>
                  <th>Kvar</th>
                </tr>
              </thead>
              <tbody>
                {months.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      Inga poster ännu.
                    </td>
                  </tr>
                )}
                {months.map(([mk, v]) => {
                  const p = clamp(v.plan)
                  const a = clamp(v.actual)
                  const r = clamp(p - a)
                  return (
                    <tr key={mk}>
                      <td>{mk}</td>
                      <td>{sek(p)}</td>
                      <td>{sek(a)}</td>
                      <td>{sek(r)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent */}
        <div className="card">
          <div className="row space">
            <div>
              <div className="h2">Senaste poster</div>
              <div className="muted small">Snabb koll på senaste inlagda.</div>
            </div>
            <Link className="btn primary" to="/data">
              + Lägg till
            </Link>
          </div>

          <div style={{ marginTop: 10 }}>
            {recent.length === 0 && <div className="muted">Inga poster ännu.</div>}
            {recent.map((it) => (
              <div
                key={it.id}
                className="row space"
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(36,48,68,.7)',
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.title}
                  </div>
                  <div className="muted small">
                    {(it.date ?? '') + (it.paid ? ' • betald' : '')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="muted small">Plan</div>
                  <div style={{ fontWeight: 900 }}>{sek(it.plan_sek ?? 0)} kr</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blocks */}
      <div className="card">
        <div className="row space">
          <div>
            <div className="h2">Block</div>
            <div className="muted small">Plan / Utfall / Kvar per block.</div>
          </div>
          <Link className="btn" to="/settings">
            Edit blocks
          </Link>
        </div>

        <div style={{ marginTop: 10, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Plan</th>
                <th>Utfall</th>
                <th>Kvar</th>
              </tr>
            </thead>
            <tbody>
              {byBlock.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    Inga block ännu.
                  </td>
                </tr>
              )}
              {byBlock.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 900 }}>{r.name}</td>
                  <td>{sek(r.plan)}</td>
                  <td>{sek(r.actual)}</td>
                  <td>{sek(r.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
