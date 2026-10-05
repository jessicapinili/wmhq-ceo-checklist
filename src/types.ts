export type TierId = 1 | 2 | 3
export type PhaseId = 'plan' | 'execute' | 'sell' | 'optimise'
export type ActionStatus = 'not_started' | 'in_progress' | 'review' | 'complete'

export type FieldType = 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'url' | 'list' | 'tier'

/** Profile keys a workspace field can be bound to, so editing in either place stays in sync. */
export type ProfileKey = 'tier' | 'baseline' | 'milestone' | 'offer' | 'offerPrice'

export interface FieldDef {
  id: string
  label: string
  type: FieldType
  help?: string
  placeholder?: string
  bind?: ProfileKey
}

export interface ActionDef {
  id: string
  number: number
  phase: PhaseId
  title: string
  summary: string
  outcome: string
  why: string
  dueDay: number // day of challenge (1–60)
  checklist: { id: string; label: string }[]
  tierRequirements: Record<TierId, string>
  fields: FieldDef[]
  proof: string[]
  resources: { label: string; url?: string }[]
  placeholder: boolean
}

export interface Profile {
  firstName: string
  lastName: string
  email: string
  tier: TierId | null
  baseline: number | null
  milestone: string
  offer: string
  offerPrice: number | null
  startDate: string // YYYY-MM-DD
  endDate: string
}

export interface Proof { link: string; note: string; posted: boolean; date: string }

export interface ActionProgress {
  checked: Record<string, boolean>
  fields: Record<string, string | string[]>
  notes: string
  proof: Proof
  status: ActionStatus
}

export interface ScoreEntry {
  id: string
  date: string
  published: number | null
  conversations: number | null
  offers: number | null
  sales: number | null
  cash: number | null
  notes: string
  bottleneck: string
}

export interface Note {
  id: string
  title: string
  body: string
  phase: PhaseId | ''
  actionId: string
  createdAt: string
  updatedAt: string
}

export interface AppState {
  version: 1
  setupComplete: boolean
  profile: Profile
  actions: Record<string, ActionProgress>
  currentPhase: PhaseId
  scorecard: ScoreEntry[]
  notes: Note[]
  lastUpdated: string | null
}

export type View = 'dashboard' | 'checklist' | 'scorecard' | 'notes' | 'info' | 'settings'
