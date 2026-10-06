import { ArrowRight, CheckCircle2, Circle, FileCheck2, StickyNote } from 'lucide-react'
import { useState } from 'react'
import { ACTIONS, PHASES } from '../data/content'
import { useStore } from '../store'
import type { ActionDef, ActionStatus, PhaseId } from '../types'
import { challengeDay, checkedCount, dueDate, fmtDate, phaseForDay, progressOf, todayISO } from '../utils'
import { ProgressBar } from './ui'

export const STATUS: Record<ActionStatus, { label: string; cls: string }> = {
  not_started: { label: 'Not started', cls: 'bg-bg text-muted' },
  in_progress: { label: 'In progress', cls: 'bg-accent-soft text-ink' },
  review: { label: 'Ready for review', cls: 'bg-highlight text-ink' },
  complete: { label: 'Complete', cls: 'bg-success-soft text-success' },
}

export type Filter = 'all' | 'current' | 'incomplete' | 'completed'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All actions' }, { id: 'current', label: 'Current' }, { id: 'incomplete', label: 'Incomplete' }, { id: 'completed', label: 'Completed' },
]

export function StatusSelect({ id, value, onChange }: { id: string; value: ActionStatus; onChange: (s: ActionStatus) => void }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as ActionStatus)}
      className={`rounded-md border-0 px-2 py-1 text-xs font-semibold ${STATUS[value].cls} cursor-pointer`}>
      {(Object.keys(STATUS) as ActionStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
    </select>
  )
}

export default function Board({ onOpen, onRequestComplete, compact }: { onOpen: (id: string) => void; onRequestComplete: (id: string) => void; compact?: boolean }) {
  const { state, update, setAction } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const datePhase = phaseForDay(challengeDay(state))
  const mobilePhase = state.currentPhase

  const matches = (a: ActionDef) => {
    const st = progressOf(state, a.id).status
    if (filter === 'completed') return st === 'complete'
    if (filter === 'incomplete') return st !== 'complete'
    if (filter === 'current') return st !== 'complete' && (a.phase === datePhase || dueDate(state, a) < todayISO())
    return true
  }

  const setStatus = (id: string, s: ActionStatus) => s === 'complete' ? onRequestComplete(id) : setAction(id, (p) => ({ ...p, status: s }))
  const setPhase = (ph: PhaseId) => update((s) => ({ ...s, currentPhase: ph }))

  return (
    <section aria-label="Checklist board">
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter actions">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
            className={`rounded-pill border-bold px-4 py-1.5 text-sm font-semibold ${filter === f.id ? 'border-ink bg-ink text-surface' : 'border-ink/20 bg-surface hover:border-ink'}`}>{f.label}</button>
        ))}
      </div>

      {/* Mobile phase selector */}
      <div className="mb-4 grid grid-cols-4 gap-1 rounded-pill border-bold border-ink bg-surface p-1 lg:hidden" role="tablist" aria-label="Phase">
        {PHASES.map((ph) => (
          <button key={ph.id} role="tab" aria-selected={mobilePhase === ph.id} onClick={() => setPhase(ph.id)}
            className={`rounded-pill py-2 text-sm font-semibold ${mobilePhase === ph.id ? 'bg-ink text-surface' : ''}`}>{ph.name}</button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
        {PHASES.map((ph) => {
          const list = ACTIONS.filter((a) => a.phase === ph.id && matches(a))
          const active = list.filter((a) => progressOf(state, a.id).status !== 'complete')
          const done = list.filter((a) => progressOf(state, a.id).status === 'complete')
          const phaseDone = ACTIONS.filter((a) => a.phase === ph.id && progressOf(state, a.id).status === 'complete').length
          return (
            <div key={ph.id} className={`${mobilePhase === ph.id ? '' : 'hidden'} min-w-0 rounded-card bg-cream/70 p-3 lg:block`}>
              <header className="mb-3 flex items-baseline justify-between px-1">
                <div>
                  <p className="pixel text-lg leading-none text-accent">PHASE {ph.number}</p>
                  <h2 className="text-2xl font-bold">{ph.name}</h2>
                  <p className="label-caps mt-0.5 !tracking-[0.12em]">Days {ph.days[0]} to {ph.days[1]}</p>
                </div>
                <span className="pixel rounded-md bg-accent-soft px-2 text-lg">{phaseDone}/4</span>
              </header>
              <div className="space-y-3">
                {active.map((a) => <Card key={a.id} a={a} onOpen={onOpen} setStatus={setStatus} compact={compact} />)}
                {done.length > 0 && <p className="label-caps px-1 pt-2">Completed</p>}
                {done.map((a) => <Card key={a.id} a={a} onOpen={onOpen} setStatus={setStatus} compact={compact} />)}
                {list.length === 0 && <p className="rounded-xl border-2 border-dashed border-ink/15 p-4 text-center text-sm text-muted">No actions match this view.</p>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Card({ a, onOpen, setStatus, compact }: { a: ActionDef; onOpen: (id: string) => void; setStatus: (id: string, s: ActionStatus) => void; compact?: boolean }) {
  const { state } = useStore()
  const p = progressOf(state, a.id)
  const n = checkedCount(state, a)
  const total = a.checklist.length
  const done = p.status === 'complete'
  const due = dueDate(state, a)
  const overdue = !done && due < todayISO()
  const attached = state.notes.filter((x) => x.actionId === a.id).length
  const hasNotes = p.notes.trim().length > 0 || attached > 0
  return (
    <article className={`rounded-2xl border-bold bg-surface p-4 transition-shadow hover:shadow-card ${done ? 'border-success/40' : 'border-ink'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="pixel text-lg leading-none text-accent">ACTION {String(a.number).padStart(2, '0')}</span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${overdue ? 'text-danger' : 'text-accent'}`}>{overdue ? 'Overdue · ' : 'Due '}{fmtDate(due)}</span>
      </div>
      <h3 className={`mt-1.5 text-lg font-bold leading-snug ${done ? 'text-muted' : ''}`}>
        {done && <CheckCircle2 size={18} className="mr-1 inline -translate-y-0.5 text-success" aria-label="Complete" />}{a.title}
      </h3>
      {!compact && <p className="mt-1 text-sm text-muted">{a.summary}</p>}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1"><ProgressBar thin value={(n / total) * 100} label={`${a.title} checklist progress`} /></div>
        <span className="text-xs font-semibold tabular-nums">{n}/{total}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor={`st-${a.id}`} className="sr-only">Status for {a.title}</label>
        <StatusSelect id={`st-${a.id}`} value={p.status} onChange={(s) => setStatus(a.id, s)} />
        <span className={`chip ${p.proof.posted ? 'bg-success-soft text-success' : 'bg-bg text-muted'}`} title="Proof status">
          {p.proof.posted ? <FileCheck2 size={13} /> : <Circle size={11} />}{p.proof.posted ? 'Proof posted' : 'No proof yet'}
        </span>
        {hasNotes && <span className="chip bg-highlight/70" title="Has notes"><StickyNote size={13} />Notes</span>}
      </div>
      <button onClick={() => onOpen(a.id)} className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline">
        Open action <ArrowRight size={15} /><span className="sr-only">: {a.title}</span>
      </button>
    </article>
  )
}
