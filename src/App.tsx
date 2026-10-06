import { BarChart3, BookOpen, ChartPie, Download, LogOut, ShieldCheck, Info as InfoIcon, LayoutDashboard, ListChecks, Menu, NotebookPen, Settings as SettingsIcon, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import ActionDrawer from './components/ActionDrawer'
import Board from './components/Board'
import { Modal, PageTitle, ProgressBar, SaveIndicator, useConfirm } from './components/ui'
import { ACTIONS, PHASES, TIERS } from './data/content'
import { useStore } from './store'
import { useMember } from './session'
import type { TierId, View } from './types'
import { checkedCount, fmtDate, fmtMoney, milestoneProgress, overallStats, progressOf, scoreTotals, tierLabel } from './utils'
import Dashboard, { daysLabel, useNextAction } from './views/Dashboard'
import Info from './views/Info'
import Notes from './views/Notes'
import Scorecard from './views/Scorecard'
import Settings from './views/Settings'
import Setup from './views/Setup'

const NAV: { id: View; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'checklist', label: 'My Checklist', icon: <ListChecks size={20} /> },
  { id: 'scorecard', label: 'CEO Scorecard', icon: <BarChart3 size={20} /> },
  { id: 'notes', label: 'My Notes', icon: <NotebookPen size={20} /> },
  { id: 'info', label: 'Challenge Information', icon: <InfoIcon size={20} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
]

export default function App() {
  const { state, setProfile, setAction, importJSON, exportJSON } = useStore()
  const [view, setView] = useState<View>('dashboard')
  const [openId, setOpenId] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const member = useMember()
  const confirm = useConfirm()
  // Keeps the setup screen mounted for its welcome message after setup saves.
  const [onboarding, setOnboarding] = useState(!state.setupComplete)
  useEffect(() => { if (!state.setupComplete) setOnboarding(true) }, [state.setupComplete])

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const requestComplete = (id: string) => {
    const a = ACTIONS.find((x) => x.id === id)!
    const n = checkedCount(state, a)
    confirm.ask({
      title: `Complete Action ${String(a.number).padStart(2, '0')}?`,
      body: <>
        <p className="font-semibold text-ink">“I have completed this action.”</p>
        {n < a.checklist.length && <p className="mt-2">You’ve ticked {n} of {a.checklist.length} items. You can still mark it complete if you’ve done the work another way.</p>}
      </>,
      confirmLabel: 'Yes, mark complete',
      run: () => { setAction(id, (p) => ({ ...p, status: 'complete' })); flash(`Action ${String(a.number).padStart(2, '0')} complete. Your next move is ready.`) },
    })
  }

  const requestTier = (t: TierId) => {
    confirm.ask({
      title: `Switch to ${TIERS[t].short}: ${TIERS[t].name}?`,
      body: <>
        <p>Your checklist ticks, answers, notes and scorecard stay exactly as they are.</p>
        <p className="mt-2">Your milestone wording, tier requirements, sales targets and dashboard label will update to {TIERS[t].name}. You can edit the milestone afterwards.</p>
      </>,
      confirmLabel: 'Switch tier',
      run: () => {
        setProfile({ tier: t, milestone: TIERS[t].milestone })
        flash(`You’re now on ${TIERS[t].short}: ${TIERS[t].name}.`)
      },
    })
  }

  const startImport = () => { setImportError(null); fileRef.current?.click() }
  const onFile = (f: File | undefined) => {
    if (!f) return
    const run = async () => {
      try { await importJSON(f); setOnboarding(false); setView('dashboard'); flash('Progress restored from your file.') }
      catch (e) { setImportError((e as Error).message) }
      finally { if (fileRef.current) fileRef.current.value = '' }
    }
    if (!state.setupComplete) return void run()
    confirm.ask({ title: 'Replace your current progress?', body: <>Importing <strong className="text-ink">{f.name}</strong> will replace everything currently saved in this browser.</>, confirmLabel: 'Import and replace', danger: true, run })
  }

  const go = (v: View) => { setView(v); setMenu(false); window.scrollTo(0, 0) }

  const shared = (
    <>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" aria-hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
      {confirm.node}
      <Modal open={!!importError} onClose={() => setImportError(null)} title="That file didn’t import"><p className="text-muted">{importError}</p></Modal>
      {toast && <div role="status" className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-pill bg-ink px-5 py-3 text-sm font-semibold text-surface shadow-lift lg:bottom-8">{toast}</div>}
    </>
  )

  if (onboarding) {
    return (
      <>
        <Setup onDone={() => { setOnboarding(false); go('dashboard') }} />
        <div className="-mt-6 bg-cream pb-10 text-center">
          <button className="text-sm font-semibold underline underline-offset-4" onClick={startImport}>Already have a backup? Import progress</button>
        </div>
        {shared}
      </>
    )
  }

  return (
    <div className="min-h-screen lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-surface focus:p-3">Skip to content</a>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-bold border-ink bg-bg px-4 py-3 lg:hidden">
        <Logo small />
        <button className="rounded-full border-bold border-ink bg-surface p-2" onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={20} /></button>
      </header>

      {/* Sidebar (desktop) / drawer (mobile) */}
      <aside className={`${menu ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0`}>
        <div className="flex h-full w-72 flex-col overflow-y-auto border-r-bold border-ink bg-surface p-5 lg:w-full">
          <div className="flex items-start justify-between">
            <Logo />
            <button className="rounded-full p-1.5 lg:hidden" onClick={() => setMenu(false)} aria-label="Close menu"><X size={20} /></button>
          </div>
          <p className="label-caps mt-4 !tracking-[0.12em]">{fmtDate(state.profile.startDate, { day: 'numeric', month: 'long' })} to {fmtDate(state.profile.endDate, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-bg p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-bold text-surface" aria-hidden>{(state.profile.firstName[0] ?? '?').toUpperCase()}</div>
            <div className="min-w-0"><p className="truncate font-bold">{state.profile.firstName} {state.profile.lastName}</p><p className="truncate text-xs text-muted">{tierLabel(state.profile.tier)}</p></div>
          </div>
          <nav className="mt-5 flex-1" aria-label="Main">
            <ul className="space-y-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <button onClick={() => go(n.id)} aria-current={view === n.id ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold ${view === n.id ? 'bg-blush' : 'hover:bg-bg'}`}>{n.icon}{n.label}</button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <button className="flex items-center gap-2 font-semibold hover:underline" onClick={exportJSON}><Download size={16} /> Export progress</button>
            <button className="flex items-center gap-2 font-semibold hover:underline" onClick={startImport}><Upload size={16} /> Import progress</button>
            {member.admin && <a className="flex items-center gap-2 font-semibold hover:underline" href="/admin/"><ShieldCheck size={16} /> Admin: member access</a>}
            <p className="truncate pt-2 text-xs text-muted" title={member.email}>Logged in as {member.email}</p>
            <a className="flex items-center gap-2 font-semibold hover:underline" href="/api/logout"><LogOut size={16} /> Log out</a>
          </div>
        </div>
        <button className="flex-1 bg-ink/40 lg:hidden" aria-label="Close menu" onClick={() => setMenu(false)} tabIndex={-1} />
      </aside>

      <main id="main" className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-8">
        {view === 'dashboard' && <Dashboard onOpen={setOpenId} onRequestComplete={requestComplete} />}
        {view === 'checklist' && (
          <>
            <PageTitle eyebrow="16 ACTIONS · 4 PHASES" title="My Checklist"><SaveIndicator /></PageTitle>
            <Board onOpen={setOpenId} onRequestComplete={requestComplete} />
          </>
        )}
        {view === 'scorecard' && <Scorecard />}
        {view === 'notes' && <Notes onOpenAction={setOpenId} />}
        {view === 'info' && <Info />}
        {view === 'settings' && <Settings onRequestTier={requestTier} onImport={startImport} />}
      </main>

      {/* Right progress panel (wide screens) */}
      <aside className="hidden w-72 shrink-0 border-l-bold border-ink bg-cream min-[1800px]:block" aria-label="Progress summary">
        <div className="sticky top-0 p-5"><ProgressPanel onOpen={setOpenId} /></div>
      </aside>

      {/* Sticky mobile progress */}
      <button onClick={() => setSheet(true)} className="fixed inset-x-3 bottom-3 z-30 flex items-center gap-3 rounded-pill border-bold border-ink bg-surface px-5 py-3 shadow-card lg:hidden" aria-label="Show my progress">
        <ChartPie size={20} />
        <span className="flex-1"><ProgressBar thin value={overallStats(state).pct} label="Overall progress" /></span>
        <span className="pixel text-xl">{overallStats(state).pct}%</span>
      </button>
      <Modal open={sheet} onClose={() => setSheet(false)} title="My progress"><ProgressPanel onOpen={(id) => { setSheet(false); setOpenId(id) }} /></Modal>

      {openId && <ActionDrawer id={openId} onClose={() => setOpenId(null)} onNavigate={setOpenId} onRequestComplete={requestComplete} onRequestTier={requestTier} />}
      {shared}
    </div>
  )
}

function Logo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border-bold border-ink bg-blush" aria-label="WMHQ logo placeholder" role="img"><span className="pixel text-lg">WM</span></div>
      <div className="leading-tight"><p className="pixel text-xl leading-none">WMHQ</p><p className={`font-bold ${small ? 'text-sm' : 'text-sm'}`}>CEO Checklist Challenge</p></div>
    </div>
  )
}

function ProgressPanel({ onOpen }: { onOpen: (id: string) => void }) {
  const { state } = useStore()
  const s = overallStats(state)
  const t = scoreTotals(state)
  const ms = milestoneProgress(state)
  const next = useNextAction()
  const days = daysLabel(state.profile.startDate, state.profile.endDate)
  return (
    <div className="space-y-5">
      <div>
        <p className="label-caps">Checklist</p>
        <p className="pixel text-5xl leading-none">{s.pct}%</p>
        <ProgressBar value={s.pct} label="Checklist progress" />
        <p className="mt-1.5 text-sm text-muted">{s.actionsDone}/16 actions · {s.items}/{s.totalItems} items</p>
      </div>
      <div>
        <p className="label-caps">By phase</p>
        <ul className="mt-2 space-y-2">
          {PHASES.map((ph) => {
            const acts = ACTIONS.filter((a) => a.phase === ph.id)
            const done = acts.reduce((n, a) => n + checkedCount(state, a), 0)
            const total = acts.reduce((n, a) => n + a.checklist.length, 0)
            return <li key={ph.id}><div className="flex justify-between text-sm"><span className="font-semibold">{ph.number} {ph.name}</span><span>{acts.filter((a) => progressOf(state, a.id).status === 'complete').length}/4</span></div><ProgressBar thin value={(done / total) * 100} label={`${ph.name} progress`} /></li>
          })}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface p-3"><p className="pixel text-3xl leading-none">{days.big}</p><p className="text-xs text-muted">{days.small}</p></div>
        <div className="rounded-xl bg-surface p-3"><p className="pixel text-3xl leading-none">{fmtMoney(t.cash)}</p><p className="text-xs text-muted">cash collected</p></div>
      </div>
      <div>
        <p className="label-caps">Milestone</p>
        <p className="text-sm font-semibold">{state.profile.milestone}</p>
        <div className="mt-1.5"><ProgressBar thin value={ms.pct} label="Milestone progress" /></div>
        <p className="mt-1 text-xs text-muted">{ms.label}</p>
      </div>
      {next && (
        <div className="rounded-2xl border-bold border-ink bg-surface p-4">
          <p className="label-caps">Your next move</p>
          <p className="mt-1 font-bold">{String(next.number).padStart(2, '0')} {next.title}</p>
          <button className="btn-primary mt-3 w-full" onClick={() => onOpen(next.id)}><BookOpen size={16} /> Open action</button>
        </div>
      )}
      <SaveIndicator />
    </div>
  )
}
