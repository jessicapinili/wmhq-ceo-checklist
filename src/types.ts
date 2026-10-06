export type TierId = 1 | 2 | 3
export type PhaseId = 'plan' | 'execute' | 'sell' | 'optimise'
export type ActionStatus = 'not_started' | 'in_progress' | 'review' | 'complete'

export type FieldType = 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'url' | 'list' | 'tier' | 'select' | 'yesno' | 'cards' | 'pathmap' | 'notice' | 'time' | 'multi' | 'rhythm' | 'tracklist' | 'warmtracker' | 'duration' | 'sprintsummary'

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
  /** Choices for a 'cards' field: big clickable cards with a short description. */
  cards?: { title: string; desc: string; best?: string }[]
  /** Choices for a 'select' field. */
  options?: string[]
  /** For a 'yesno' field: message shown when she picks "Not yet". */
  ifNotYet?: string
  /** Only show when another answer in this action equals one of these values. */
  showIf?: { field: string; equals: string[] }
  /** Shared-workspace field shown only for these tiers (unlike `tiers`, it stays in the workspace). */
  onlyTiers?: TierId[]
  /** 'pathmap': steps that auto-build a path from other answers, keyed by the value of `by`. */
  pathMap?: { by: string; steps: Record<string, { label: string; field: string }[]> }
  /** 'notice': message shown only when every listed field is "Yes". */
  notice?: { when: string[]; text: string }
  /** 'duration': the two date fields to count days between, plus optional warning above `max` days. */
  range?: { start: string; end: string; max?: number; tooLong?: string }
  /** Minimum list length to show a warning under, for these tiers, e.g. { 1: 15 }. */
  minItems?: Partial<Record<TierId, { n: number; text: string }>>
  /** 'multi': number of short inputs (saved as a list). */
  count?: number
  /** Label that uses another answer, e.g. { field: 'theme1', template: 'Topics for “{v}”' }; falls back to `label`. */
  labelFrom?: { action?: string; field: string; template: string }
  /** Small heading shown above this field to start a new group. */
  group?: { title: string; intro?: string }
}

/** "Get help with this" box: WMHQ members get a Vault link, everyone else an AI prompt. */
export interface HelpDef {
  inWmhq: { line: string; linkLabel: string; url: string; more?: { label: string; url: string }[] }
  notInWmhq: { line: string; prompt?: string; promptBy?: { field: string; prompts: Record<string, string>; chooseFirst: string }; bridge?: string; joinLabel?: string; joinUrl?: string }
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
  /** Built-in interactive tool shown at the top of the workspace. */
  calculator?: 'reverse-engineer' | 'pattern-quiz' | 'maybes'
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
