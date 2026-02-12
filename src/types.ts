export type Block = { id: string; name: string; sort_order: number | null }
export type Underproject = { id: string; name: string; sort_order: number | null }

export type Item = {
  id: string
  date: string | null
  title: string
  description: string | null
  plan_sek: number | null
  actual_sek: number | null
  paid: boolean
  status: string | null
  prio: string | null
  block_id: string | null
  underproject_id: string | null
  created_at: string
  updated_at: string
}

export const STATUS = ['Planned','Ordered','In Progress','Completed','On Hold'] as const
export const PRIO = ['High','Medium','Low'] as const
