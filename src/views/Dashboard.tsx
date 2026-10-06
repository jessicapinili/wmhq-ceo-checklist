import { ArrowRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { ACTIONS } from '../data/content'
import { useStore } from '../store'
import Board from '../components/Board'
import { ProgressBar } from '../components/ui'
import { challengeDay, checkedCount, daysBetween, fmtDate, fmtMoney, milestoneProgress, overallStats, progressOf, scoreTotals, tierLabel, todayISO } from '../utils'

export function useNextAction() {
  const { state } = useStore()
  return ACTIONS.find((a) => progressOf(state, a.id).status !== 'complete') ?? null
}

export function daysLabel(start: string, end: string) {
  const today = todayISO()
  if (today < start) { const d = daysBetween(today, start); return { big: String(d), small: d === 1 ? 'day until we start' : 'days until we start' } }
  if (today > end) return { big: '0', small: 'days left. Challenge complete.' }
  const d = daysBetween(today, end) + 1
  return { big: String(d), small: d === 1 ? 'day remaining' : 'days remaining' }
}

export default function Dashboard({ onOpen, onRequestComplete }: { onOpen: (id: string) => void; onRequestComplete: (id: string) => void }) {
  const { state } = useStore()
  const { profile } = state
  const stats = overallStats(state)
  const totals = scoreTotals(state)
  const ms = milestoneProgress(state)
  const next = useNextAction()
  const days = daysLabel(profile.startDate, profile.endDate)
  const day = challengeDay(state)

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="label-caps inline-block rounded-md bg-blush px-2.5 py-1 !text-ink">{tierLabel(profile.tier)}</span>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Welcome back, {profile.firstName || 'CEO'}.</h1>
            <p className="mt-2 text-lg">Your milestone: <span className="marker font-semibold">{profile.milestone || 'Not set yet'}</span></p>
            <p className="mt-1 text-muted">{fmtDate(profile.startDate, { day: 'numeric', month: 'long' })} to {fmtDate(profile.endDate, { day: 'numeric', month: 'long', year: 'numeric' })}{day >= 1 && day <= 60 ? ` · Day ${day} of 60` : ''}</p>
            <div className="mt-6">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">You’re {stats.pct}% through the checklist.</p>
                <p className="text-sm text-muted">{stats.actionsDone}/16 actions · {stats.items}/{stats.totalItems} items</p>
              </div>
              <ProgressBar value={stats.pct} label="Overall checklist progress" />
            </div>
            {next && (
              <button className="btn-primary mt-6" onClick={() => onOpen(next.id)}>
                Continue checklist <ArrowRight size={18} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 self-start">
            <Stat big={days.big} small={days.small} />
            <Stat big={fmtMoney(totals.cash)} small="cash collected" />
            <Stat big={`${stats.pct}%`} small="checklist complete" />
            <Stat big={`${ms.pct}%`} small={`to milestone · ${ms.label}`} />
          </div>
        </div>
        {next && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-bold border-ink bg-cream px-6 py-4 sm:px-8">
            <div>
              <p className="label-caps">Your next move</p>
              <p className="text-lg font-bold">Action {String(next.number).padStart(2, '0')}: {next.title} <span className="font-normal text-muted">· {checkedCount(state, next)}/{next.checklist.length} done</span></p>
            </div>
            <button className="btn-pink" onClick={() => onOpen(next.id)}>Open action</button>
          </div>
        )}
        {!next && <p className="border-t-bold border-ink bg-success-soft px-8 py-4 font-semibold text-success">All 16 actions are complete. Time for your CEO review.</p>}
      </section>
      <ReadFirst />
      <Board onOpen={onOpen} onRequestComplete={onRequestComplete} compact />
    </div>
  )
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-2xl bg-bg p-4">
      <p className="pixel text-4xl leading-none">{big}</p>
      <p className="mt-1 text-sm text-muted">{small}</p>
    </div>
  )
}

/** "Read this before you start" accordion. Open until she closes it once; remembered per browser. */
function ReadFirst() {
  const KEY = 'wmhq-readfirst-closed'
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(KEY) !== '1' } catch { return true } })
  const toggle = () => setOpen((o) => { try { localStorage.setItem(KEY, o ? '1' : '0') } catch { /* ignore */ } return !o })
  return (
    <section className="rounded-card border-bold border-ink bg-surface">
      <h2>
        <button type="button" onClick={toggle} aria-expanded={open} aria-controls="read-first"
          className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left text-lg font-bold sm:px-8">
          Read this before you start
          <ChevronDown size={20} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h2>
      {open && (
        <div id="read-first" className="max-w-3xl space-y-3 px-6 pb-6 text-muted sm:px-8">
          <p>If you follow this challenge, you will build a real process to hit your next revenue milestone. Every action here is a proven practice. Nothing is filler.</p>
          <p className="font-semibold text-ink">But it only works if you do the work.</p>
          <p>Opening the checklist every few days and hoping for the best won’t get you there. Neither will rushing through an action just to tick it off, or skipping the parts that feel uncomfortable. The uncomfortable parts are usually the ones that make the sale.</p>
          <p>This challenge doesn’t make you money. What you do with it does. Show up, do each action properly, and sell the whole way through.</p>
        </div>
      )}
    </section>
  )
}
