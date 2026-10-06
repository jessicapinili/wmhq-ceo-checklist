import { ACTIONS, PHASES, TIERS, TOTAL_ITEMS } from './data/content'
import type { ActionDef, ActionProgress, AppState, PhaseId } from './types'

const DAY = 86_400_000
const parse = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
export const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const todayISO = () => toISO(new Date())
export const addDays = (iso: string, n: number) => { const d = parse(iso); d.setDate(d.getDate() + n); return toISO(d) }
export const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / DAY)

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  iso ? parse(iso).toLocaleDateString('en-AU', opts) : '—'
export const fmtLong = (iso: string) => fmtDate(iso, { day: 'numeric', month: 'long', year: 'numeric' })
export const fmtMoney = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '—' : n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 })
export const fmtTime = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }) : '—'
export const uid = () => Math.random().toString(36).slice(2, 10)

export const dueDate = (state: AppState, a: ActionDef) => addDays(state.profile.startDate, a.dueDay - 1)

/** Day number of the challenge (can be <1 before start or >60 after end). */
export const challengeDay = (state: AppState) => daysBetween(state.profile.startDate, todayISO()) + 1

export const phaseForDay = (day: number): PhaseId =>
  (PHASES.find((p) => day >= p.days[0] && day <= p.days[1]) ?? (day < 1 ? PHASES[0] : PHASES[3])).id

export const emptyProgress = (): ActionProgress => ({ checked: {}, fields: {}, notes: '', proof: { link: '', note: '', posted: false, date: '', more: [] }, status: 'not_started' })
export const progressOf = (state: AppState, id: string) => state.actions[id] ?? emptyProgress()
export const checkedCount = (state: AppState, a: ActionDef) => a.checklist.filter((c) => progressOf(state, a.id).checked[c.id]).length

export function overallStats(state: AppState) {
  const items = ACTIONS.reduce((n, a) => n + checkedCount(state, a), 0)
  const actionsDone = ACTIONS.filter((a) => progressOf(state, a.id).status === 'complete').length
  return { items, totalItems: TOTAL_ITEMS, pct: Math.round((items / TOTAL_ITEMS) * 100), actionsDone }
}

export function scoreTotals(state: AppState) {
  const sum = (k: 'published' | 'conversations' | 'offers' | 'sales' | 'cash') => state.scorecard.reduce((n, e) => n + (e[k] ?? 0), 0)
  const t = { published: sum('published'), conversations: sum('conversations'), offers: sum('offers'), sales: sum('sales'), cash: sum('cash') }
  return {
    ...t,
    convToOffer: t.conversations ? t.offers / t.conversations : null,
    closeRate: t.offers ? t.sales / t.offers : null,
    avgSale: t.sales ? t.cash / t.sales : null,
  }
}

/** Milestone target + progress for the selected tier. */
export function milestoneProgress(state: AppState) {
  const { tier, baseline, offerPrice } = state.profile
  const t = scoreTotals(state)
  if (tier === 1) return { label: `${Math.min(t.sales, 1)} of 1 sale`, pct: Math.min(100, t.sales * 100), salesTarget: 1 }
  if (tier === 2) return { label: `${Math.min(t.sales, 3)} of 3 sales`, pct: Math.min(100, Math.round((t.sales / 3) * 100)), salesTarget: 3 }
  if (tier === 3) {
    const target = (baseline ?? 0) + 10_000
    return {
      label: `${fmtMoney(t.cash)} of ${fmtMoney(target)}`,
      pct: Math.min(100, Math.round((t.cash / target) * 100)),
      salesTarget: offerPrice ? Math.ceil(target / offerPrice) : null,
    }
  }
  return { label: 'Choose a tier', pct: 0, salesTarget: null as number | null }
}

export const tierLabel = (tier: AppState['profile']['tier']) => tier ? `${TIERS[tier].short}: ${TIERS[tier].name}` : 'No tier chosen'
export const pct = (n: number | null) => n == null ? '—' : `${Math.round(n * 100)}%`
