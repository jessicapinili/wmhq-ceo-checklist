import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_END, DEFAULT_START } from './data/content'
import type { ActionProgress, AppState, Profile } from './types'
import type { Member } from './session'
import { emptyProgress } from './utils'

// Progress is kept per signed-in email so two members sharing a browser never see each other's work.
export const storageKey = (email: string) => `wmhq-ceo-checklist:v1:${email}`

export const defaultState = (m?: Member): AppState => ({
  version: 1,
  setupComplete: false,
  profile: { firstName: m?.firstName ?? '', lastName: m?.lastName ?? '', email: m?.email ?? '', tier: null, baseline: null, milestone: '', offer: '', offerPrice: null, startDate: DEFAULT_START, endDate: DEFAULT_END },
  actions: {},
  currentPhase: 'plan',
  scorecard: [],
  notes: [],
  lastUpdated: null,
})

/** Merge unknown JSON onto defaults so older / partial files still load safely. */
export function normalise(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') throw new Error('This file does not contain challenge progress.')
  const r = raw as Partial<AppState>
  if (r.version !== 1 || !r.profile) throw new Error('This file is not a CEO Checklist export.')
  const d = defaultState()
  const actions: Record<string, ActionProgress> = {}
  for (const [k, v] of Object.entries(r.actions ?? {})) {
    const e = emptyProgress()
    actions[k] = { ...e, ...v, proof: { ...e.proof, ...(v?.proof ?? {}) } }
  }
  return {
    ...d, ...r,
    profile: { ...d.profile, ...r.profile },
    actions,
    scorecard: Array.isArray(r.scorecard) ? r.scorecard : [],
    notes: Array.isArray(r.notes) ? r.notes : [],
  }
}

function load(m: Member): AppState {
  try {
    const s = localStorage.getItem(storageKey(m.email))
    if (!s) return defaultState(m)
    const saved = normalise(JSON.parse(s))
    return { ...saved, profile: { ...saved.profile, email: m.email } }
  } catch { return defaultState(m) }
}

interface Store {
  state: AppState
  update: (fn: (s: AppState) => AppState) => void
  setProfile: (p: Partial<Profile>) => void
  setAction: (id: string, fn: (p: ActionProgress) => ActionProgress) => void
  saveNow: () => void
  lastSaved: string | null
  saveError: string | null
  exportJSON: () => void
  importJSON: (file: File) => Promise<void>
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children, member }: { children: ReactNode; member: Member }) {
  const KEY = storageKey(member.email)
  const [state, setState] = useState<AppState>(() => load(member))
  const [lastSaved, setLastSaved] = useState<string | null>(state.lastUpdated)
  const [saveError, setSaveError] = useState<string | null>(null)
  const first = useRef(true)

  const persist = useCallback((s: AppState) => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); setLastSaved(new Date().toISOString()); setSaveError(null) }
    catch { setSaveError('Your browser blocked saving. Export your progress to keep a copy.') }
  }, [KEY])

  // Every change is written straight to localStorage.
  useEffect(() => { if (first.current) { first.current = false; return } persist(state) }, [state, persist])

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => ({ ...fn(s), lastUpdated: new Date().toISOString() })), [])
  const setProfile = useCallback((p: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...p } })), [update])
  const setAction = useCallback((id: string, fn: (p: ActionProgress) => ActionProgress) =>
    update((s) => ({ ...s, actions: { ...s.actions, [id]: fn(s.actions[id] ?? emptyProgress()) } })), [update])

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    const name = state.profile.firstName ? state.profile.firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' : ''
    a.download = `ceo-checklist-${name}${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }, [state])

  const importJSON = useCallback(async (file: File) => {
    const text = await file.text()
    let parsed: unknown
    try { parsed = JSON.parse(text) } catch { throw new Error('That file could not be read. Choose a .json file exported from this dashboard.') }
    const next = normalise(parsed)
    // Imported progress always belongs to whoever is signed in now.
    setState({ ...next, profile: { ...next.profile, email: member.email }, lastUpdated: new Date().toISOString() })
  }, [member.email])

  const reset = useCallback(() => { localStorage.removeItem(KEY); first.current = true; setState(defaultState(member)); setLastSaved(null) }, [KEY, member])

  return (
    <Ctx.Provider value={{ state, update, setProfile, setAction, saveNow: () => persist(state), lastSaved, saveError, exportJSON, importJSON, reset }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => { const c = useContext(Ctx); if (!c) throw new Error('StoreProvider missing'); return c }
