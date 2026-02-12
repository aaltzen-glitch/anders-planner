import React from 'react'
import { supabase } from '../supabase'
import type { Block, Underproject, Item } from '../types'
import { STATUS, PRIO } from '../types'

function sek(n: number | null | undefined) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n ?? 0)
}

type Draft = Partial<Item> & { title: string }

export default function DataPage() {
  const [items, setItems] = React.useState<Item[]>([])
  const [blocks, setBlocks] = React.useState<Block[]>([])
  const [under, setUnder] = React.useState<Underproject[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [draft, setDraft] = React.useState<Draft>({ title: '', paid: false })
  const [filterBlock, setFilterBlock] = React.useState<string>('')

  async function load() {
    setLoading(true)
    const [{ data: b, error: eb }, { data: u, error: eu }, { data: it, error: ei }] = await Promise.all([
      supabase.from('blocks').select('*').order('sort_order', { ascending: true }).order('name'),
      supabase.from('underprojects').select('*').order('sort_order', { ascending: true }).order('name'),
      supabase.from('items').select('*').order('date', { ascending: false }).limit(2000),
    ])
    if (eb) alert(eb.message)
    if (eu) alert(eu.message)
    if (ei) alert(ei.message)
    setBlocks((b ?? []) as any)
    setUnder((u ?? []) as any)
    setItems((it ?? []) as any)
    setLoading(false)
  }

  React.useEffect(() => { load() }, [])

  async function addItem() {
    if (!draft.title?.trim()) return alert('Skriv en titel/post.')
    setSaving(true)
    const payload = {
      date: draft.date ?? null,
      title: draft.title.trim(),
      description: draft.description ?? null,
      plan_sek: draft.plan_sek ?? null,
      actual_sek: draft.actual_sek ?? null,
      paid: !!draft.paid,
      status: draft.status ?? null,
      prio: draft.prio ?? null,
      block_id: draft.block_id ?? null,
      underproject_id: draft.underproject_id ?? null,
    }
    const { error } = await supabase.from('items').insert(payload)
    setSaving(false)
    if (error) return alert(error.message)
    setDraft({ title: '', paid: false })
    await load()
  }

  async function togglePaid(item: Item) {
    const { error } = await supabase.from('items').update({ paid: !item.paid }).eq('id', item.id)
    if (error) alert(error.message)
    else setItems(prev => prev.map(x => x.id === item.id ? { ...x, paid: !x.paid } : x))
  }

  async function del(item: Item) {
    if (!confirm('Ta bort posten?')) return
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (error) alert(error.message)
    else setItems(prev => prev.filter(x => x.id !== item.id))
  }

  const visible = filterBlock ? items.filter(i => i.block_id === filterBlock) : items

  if (loading) return <div className="card">Laddar…</div>

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="row space">
        <div>
          <div className="h1">Data</div>
          <div className="muted">Lägg till poster och kostnader. Synkar mellan enheter.</div>
        </div>
        <div className="row">
          <select value={filterBlock} onChange={e => setFilterBlock(e.target.value)}>
            <option value="">Alla block</option>
            {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="h2">Ny post</div>
        <div className="grid" style={{ gridTemplateColumns: '160px 1fr 1fr', gap: 12, marginTop: 10 }}>
          <div>
            <div className="muted small">Datum</div>
            <input className="input" type="date" value={draft.date ?? ''} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div className="muted small">Post</div>
            <input className="input" placeholder="t.ex. Generator" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
          </div>

          <div>
            <div className="muted small">Block</div>
            <select value={draft.block_id ?? ''} onChange={e => setDraft(d => ({ ...d, block_id: e.target.value || null }))}>
              <option value="">(ingen)</option>
              {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <div className="muted small">Underprojekt</div>
            <select value={draft.underproject_id ?? ''} onChange={e => setDraft(d => ({ ...d, underproject_id: e.target.value || null }))}>
              <option value="">(ingen)</option>
              {under.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="row" style={{ alignItems: 'end' }}>
            <label className="badge info" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={!!draft.paid} onChange={e => setDraft(d => ({ ...d, paid: e.target.checked }))} />
              Betald
            </label>
          </div>

          <div>
            <div className="muted small">Plan (SEK)</div>
            <input className="input" type="number" value={draft.plan_sek ?? ''} onChange={e => setDraft(d => ({ ...d, plan_sek: e.target.value === '' ? null : Number(e.target.value) }))} />
          </div>
          <div>
            <div className="muted small">Utfall (SEK)</div>
            <input className="input" type="number" value={draft.actual_sek ?? ''} onChange={e => setDraft(d => ({ ...d, actual_sek: e.target.value === '' ? null : Number(e.target.value) }))} />
          </div>
          <div></div>

          <div>
            <div className="muted small">Status</div>
            <select value={draft.status ?? ''} onChange={e => setDraft(d => ({ ...d, status: e.target.value || null }))}>
              <option value="">(tom)</option>
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div className="muted small">Prio</div>
            <select value={draft.prio ?? ''} onChange={e => setDraft(d => ({ ...d, prio: e.target.value || null }))}>
              <option value="">(tom)</option>
              {PRIO.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="row" style={{ justifyContent: 'end', alignItems: 'end' }}>
            <button className="btn primary" disabled={saving} onClick={addItem}>
              {saving ? 'Sparar…' : 'Spara'}
            </button>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div className="muted small">Beskrivning / anteckning</div>
            <textarea className="input" rows={2} value={draft.description ?? ''} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="h2">Poster</div>
        <div className="muted small" style={{ marginTop: 6 }}>Klicka “Betald” för att toggla. Radera vid behov.</div>
        <div style={{ marginTop: 10, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Post</th>
                <th>Block</th>
                <th>Under</th>
                <th>Plan</th>
                <th>Utfall</th>
                <th>Betald</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan={8} className="muted">Inga poster.</td></tr>}
              {visible.map(it => (
                <tr key={it.id}>
                  <td>{it.date ?? ''}</td>
                  <td>
                    <div style={{ fontWeight: 800 }}>{it.title}</div>
                    {it.description && <div className="muted small">{it.description}</div>}
                  </td>
                  <td>{blocks.find(b => b.id === it.block_id)?.name ?? ''}</td>
                  <td>{under.find(u => u.id === it.underproject_id)?.name ?? ''}</td>
                  <td>{sek(it.plan_sek)}</td>
                  <td>{sek(it.actual_sek)}</td>
                  <td>
                    <button className={'btn ' + (it.paid ? 'primary' : '')} onClick={() => togglePaid(it)}>
                      {it.paid ? '☑' : '☐'}
                    </button>
                  </td>
                  <td className="row" style={{ justifyContent: 'end' }}>
                    <button className="btn danger" onClick={() => del(it)}>Ta bort</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
