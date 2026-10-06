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
  /** Only shown (inside the tier requirement) for these tiers. */
  tiers?: TierId[]
  /** Template like "I help {who} get {want}" — adds a button that fills this field from other answers. */
  compose?: string
  /** Adds a button that copies an answer from an earlier action, e.g. { action: 'a02', field: 'buyerSentence' }. */
  copyFrom?: { action: string; field: string; label: string }
  /** Worked examples shown in a small "See examples" dropdown under the field. */
  examples?: { label: string; text: string }[]
}

/** "Get help with this" box: WMHQ members get a Vault link, everyone else an AI prompt. */
export interface HelpDef {
  inWmhq: { line: string; linkLabel: string; url: string }
  notInWmhq: { line: string; prompt: string; bridge: string; joinLabel: string; joinUrl: string }
}

export interface ActionDef {
  id: string
  number: number
  phase: PhaseId
  title: string
  summary: string
  outcome: string
  description?: string
  why: string
  tierIntro?: string
  help?: HelpDef
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

export interface Proof { link: string; note: string; posted: boolean; date: string; more: string[] }

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
