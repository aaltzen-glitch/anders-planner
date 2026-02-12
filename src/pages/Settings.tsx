import React from 'react'
import { supabase } from '../supabase'
import type { Block, Underproject } from '../types'

export default function SettingsPage() {
  const [blocks, setBlocks] = React.useState<Block[]>([])
  const [under, setUnder] = React.useState<Underproject[]>([])
  const [newBlock, setNewBlock] = React.useState('')
  const [newUnder, setNewUnder] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  async function load() {
    setLoading(true)
    const [{ data: b, error: eb }, { data: u, error: eu }] = await Promise.all([
      supabase.from('blocks').select('*').order('sort_order', { ascending: true }).order('name'),
      supabase.from('underprojects').select('*').order('sort_order', { ascending: true }).order('name'),
    ])
    if (eb) alert(eb.message)
    if (eu) alert(eu.message)
    setBlocks((b ?? []) as any)
    setUnder((u ?? []) as any)
    setLoading(false)
  }

  React.useEffect(() => { load() }, [])

  async function addBlock() {
    if (!newBlock.trim()) return
    const { error } = await supabase.from('blocks').insert({ name: newBlock.trim() })
    if (error) alert(error.message)
    else { setNewBlock(''); load() }
  }

  async function addUnder() {
    if (!newUnder.trim()) return
    const { error } = await supabase.from('underprojects').insert({ name: newUnder.trim() })
    if (error) alert(error.message)
    else { setNewUnder(''); load() }
  }

  async function del(table: 'blocks'|'underprojects', id: string) {
    if (!confirm('Ta bort?')) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) alert(error.message)
    else load()
  }

  if (loading) return <div className="card">Laddar…</div>

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <div className="h1">Settings</div>
        <div className="muted">Hantera block och underprojekt (dropdown-källor).</div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="h2">Blocks</div>
          <div className="row" style={{ marginTop: 10 }}>
            <input className="input" placeholder="Nytt block…" value={newBlock} onChange={e => setNewBlock(e.target.value)} />
            <button className="btn primary" onClick={addBlock}>Lägg till</button>
          </div>
          <div style={{ marginTop: 10 }}>
            {blocks.map(b => (
              <div key={b.id} className="row space" style={{ padding: '8px 0', borderBottom: '1px solid rgba(36,48,68,.7)' }}>
                <div style={{ fontWeight: 800 }}>{b.name}</div>
                <button className="btn danger" onClick={() => del('blocks', b.id)}>Ta bort</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="h2">Underprojekt</div>
          <div className="row" style={{ marginTop: 10 }}>
            <input className="input" placeholder="Nytt underprojekt…" value={newUnder} onChange={e => setNewUnder(e.target.value)} />
            <button className="btn primary" onClick={addUnder}>Lägg till</button>
          </div>
          <div style={{ marginTop: 10 }}>
            {under.map(u => (
              <div key={u.id} className="row space" style={{ padding: '8px 0', borderBottom: '1px solid rgba(36,48,68,.7)' }}>
                <div style={{ fontWeight: 800 }}>{u.name}</div>
                <button className="btn danger" onClick={() => del('underprojects', u.id)}>Ta bort</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
