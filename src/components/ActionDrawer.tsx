import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Info, Maximize2, Minimize2, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ACTIONS, PHASES, TIERS } from '../data/content'
import { useStore } from '../store'
import type { FieldDef, HelpDef, Profile, TierId } from '../types'
import { checkedCount, daysBetween, dueDate, fmtDate, fmtLong, fmtMoney, progressOf, todayISO } from '../utils'
import { StatusSelect } from './Board'
import NumberCalculator, { computeNumbers } from './NumberCalculator'
import PatternQuiz from './PatternQuiz'
import MaybesWorkspace from './MaybesWorkspace'
import RecoverRepeat from './RecoverRepeat'
import MeasureWorkspace from './MeasureWorkspace'
import BottleneckWorkspace from './BottleneckWorkspace'
import DoubleDownWorkspace from './DoubleDownWorkspace'
import CeoReviewWorkspace from './CeoReviewWorkspace'
import { Checkbox, Field, HelpTip, ListInput, NumberInput, ProgressBar, SaveIndicator, TextArea, TextInput, TierPicker } from './ui'

export default function ActionDrawer({ id, onClose, onNavigate, onRequestComplete, onRequestTier }: {
  id: string; onClose: () => void; onNavigate: (id: string) => void; onRequestComplete: (id: string) => void; onRequestTier: (t: TierId) => void
}) {
  const { state, setAction, setProfile } = useStore()
  const a = ACTIONS.find((x) => x.id === id)!
  const idx = ACTIONS.indexOf(a)
  const p = progressOf(state, a.id)
  const n = checkedCount(state, a)
  const allChecked = n === a.checklist.length
  const tier = state.profile.tier
  const [otherTiers, setOtherTiers] = useState(false)
  // Side panel or full screen, like Notion. Remembered per browser.
  const [expanded, setExpanded] = useState(() => { try { return localStorage.getItem('wmhq-drawer-expanded') === '1' } catch { return false } })
  const toggleExpanded = () => setExpanded((v) => { try { localStorage.setItem('wmhq-drawer-expanded', v ? '0' : '1') } catch { /* ignore */ } return !v })
  const ref = useRef<HTMLDivElement>(null)
  const phase = PHASES.find((ph) => ph.id === a.phase)!

  useEffect(() => { ref.current?.scrollTo(0, 0); ref.current?.querySelector<HTMLElement>('h2')?.focus() }, [id])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[role=dialog][aria-modal=true]:not([data-drawer])')) onClose() }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (cid: string, v: boolean) => setAction(a.id, (x) => ({
    ...x, checked: { ...x.checked, [cid]: v }, status: x.status === 'not_started' && v ? 'in_progress' : x.status,
  }))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} data-drawer role="dialog" aria-modal="true" aria-labelledby="drawer-title"
        className={`print-area animate-slidein h-full w-full overflow-y-auto bg-surface transition-[max-width] duration-200 ${expanded ? 'max-w-none' : 'max-w-2xl border-l-bold border-ink sm:rounded-l-card'}`}>
        {/* Sticky header */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur sm:px-8">
          <SaveIndicator manual />
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={toggleExpanded} className="hidden rounded-full p-2 hover:bg-bg sm:inline-flex" aria-pressed={expanded}
              aria-label={expanded ? 'Show as side panel' : 'Expand to full screen'} title={expanded ? 'Show as side panel' : 'Expand to full screen'}>
              {expanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-bg" aria-label="Close action" title="Close"><X size={22} /></button>
          </div>
        </div>

        <div className={`space-y-8 px-5 pb-10 pt-6 sm:px-8 ${expanded ? 'mx-auto max-w-3xl' : ''}`}>
          {/* 1–2. Title + outcome */}
          <header>
            <p className="pixel text-xl text-accent">PHASE {phase.number} · ACTION {String(a.number).padStart(2, '0')}</p>
            <h2 id="drawer-title" tabIndex={-1} className="text-3xl font-bold outline-none sm:text-4xl">{a.title}</h2>
            <p className="mt-2 text-lg font-semibold">{a.outcome}</p>
            {a.description && <p className="mt-2 text-muted">{a.description}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="label-caps">Aim to finish by {fmtLong(dueDate(state, a))}</span>
              <HelpTip label="Target date" text="A rough target to keep you on track. It’s not a hard deadline. You can work ahead or catch up any time." />
              <label htmlFor="drawer-status" className="sr-only">Status</label>
              <StatusSelect id="drawer-status" value={p.status} onChange={(s) => s === 'complete' ? onRequestComplete(a.id) : setAction(a.id, (x) => ({ ...x, status: s }))} />
            </div>
            {a.placeholder && (
              <p className="mt-4 flex gap-2 rounded-xl bg-highlight/60 p-3 text-sm"><Info size={18} className="shrink-0" /> Full content for this action is coming. The items below are placeholders so you can see how it will work.</p>
            )}
          </header>

          {/* 3. Why */}
          <Section title="Why this matters"><p className="whitespace-pre-line text-muted">{a.why}</p></Section>

          {a.help && <HelpBox help={a.help} values={p.fields} />}

          {/* 4. Checklist */}
          <Section title="Checklist" right={<span className="pixel text-xl">{n}/{a.checklist.length}</span>}>
            <div className="mb-2"><ProgressBar thin value={(n / a.checklist.length) * 100} label="Action checklist progress" /></div>
            <div className="divide-y divide-line">
              {a.checklist.map((c) => <Checkbox key={c.id} checked={!!p.checked[c.id]} onChange={(v) => toggle(c.id, v)} label={c.label} />)}
            </div>
            {p.status !== 'complete' && (
              <div className={`mt-4 rounded-2xl p-4 ${allChecked ? 'bg-success-soft' : 'bg-bg'}`}>
                <p className="font-semibold">{allChecked ? 'Every box is ticked. Nice work.' : 'One action at a time.'}</p>
                <p className="text-sm text-muted">{allChecked ? 'When you’re happy with it, confirm the action is done.' : 'Tick items as you go. You confirm completion yourself when you’re ready.'}</p>
                <button className="btn-primary mt-3" onClick={() => onRequestComplete(a.id)}>I have completed this action</button>
              </div>
            )}
            {p.status === 'complete' && <p className="mt-4 rounded-2xl bg-success-soft p-4 font-semibold text-success">You marked this action complete.</p>}
          </Section>

          {/* 5. Tier requirement */}
          {a.tierRequirements && (() => { const req = a.tierRequirements; return (
          <Section title={tier ? `Your ${TIERS[tier].short} requirement` : 'Tier requirement'}>
            {a.tierIntro && <p className="mb-3 text-muted">{a.tierIntro}</p>}
            {tier ? <p className="rounded-2xl border-bold border-ink bg-blush/50 p-4 text-lg font-semibold">{req[tier].replace('{end}', fmtLong(state.profile.endDate))}</p>
              : <p className="text-muted">Choose a tier to see your requirement.</p>}
            {tier && a.fields.some((f) => f.tiers?.includes(tier)) && (
              <div className="mt-4 space-y-5 rounded-2xl bg-cream/60 p-4">
                {a.fields.filter((f) => f.tiers?.includes(tier)).map((f) => <div key={f.id}>{renderField(f)}</div>)}
              </div>
            )}
            <button className="mt-3 text-sm font-semibold underline underline-offset-4" aria-expanded={otherTiers} onClick={() => setOtherTiers(!otherTiers)}>
              {otherTiers ? 'Hide other tiers' : 'View other tiers'}
            </button>
            {otherTiers && (
              <ul className="mt-3 space-y-2">
                {([1, 2, 3] as TierId[]).filter((t) => t !== tier).map((t) => (
                  <li key={t} className="rounded-xl bg-bg p-3 text-sm"><span className="font-bold">{TIERS[t].short}: {TIERS[t].name}.</span> {req[t].replace('{end}', fmtLong(state.profile.endDate))}</li>
                ))}
              </ul>
            )}
          </Section>
          ) })()}

          {/* 6. Workspace */}
          <Section title="Your workspace" sub="Type straight in. Everything saves as you go.">
            {a.calculator === 'reverse-engineer' && <div className="mb-6"><NumberCalculator actionId={a.id} /></div>}
            {a.calculator === 'pattern-quiz' && <div className="mb-6"><PatternQuiz actionId={a.id} /></div>}
            {a.calculator === 'maybes' && <div className="mb-6"><MaybesWorkspace actionId={a.id} /></div>}
            {a.calculator === 'recover' && <div className="mb-6"><RecoverRepeat actionId={a.id} /></div>}
            {a.calculator === 'measure' && <div className="mb-6"><MeasureWorkspace actionId={a.id} /></div>}
            {a.calculator === 'bottleneck' && <div className="mb-6"><BottleneckWorkspace actionId={a.id} /></div>}
            {a.calculator === 'doubledown' && <div className="mb-6"><DoubleDownWorkspace actionId={a.id} /></div>}
            {a.calculator === 'review' && <div className="mb-6"><CeoReviewWorkspace actionId={a.id} /></div>}
            <div className="space-y-5">
              {a.fields.filter((f) => !f.tiers && (!f.onlyTiers || (tier && f.onlyTiers.includes(tier))) && (!f.showIf || f.showIf.equals.includes(String(p.fields[f.showIf.field] ?? '')))).map((f) => (
                <div key={f.id}>
                  {f.group && <div className="mb-4 mt-8 border-t border-line pt-6"><h4 className="text-lg font-bold">{f.group.title}</h4>{f.group.intro && <p className="text-muted">{f.group.intro}</p>}</div>}
                  {renderField(f)}
                </div>
              ))}
            </div>
          </Section>

          {/* 7. Proof */}
          <Section title="Proof to post">
            {a.proof.length > 0 && <ul className="mb-4 list-disc space-y-1 pl-5 text-muted">{a.proof.map((x) => <li key={x}>{x}</li>)}</ul>}
            <div className="space-y-4 rounded-2xl bg-cream/60 p-4">
              <Field label="Community post link" htmlFor="pf-link"><TextInput id="pf-link" type="url" placeholder="https://" value={p.proof.link} onChange={(v) => setAction(a.id, (x) => ({ ...x, proof: { ...x.proof, link: v } }))} /></Field>
              <Field label="Written proof note" htmlFor="pf-note"><TextArea id="pf-note" value={p.proof.note} onChange={(v) => setAction(a.id, (x) => ({ ...x, proof: { ...x.proof, note: v } }))} /></Field>
              <Field label="More proof" htmlFor="pf-more" help="Add as many extra links or notes as you like, such as screenshots, DMs or results.">
                <ListInput id="pf-more" value={p.proof.more ?? []} placeholder="Another link or note" onChange={(v) => setAction(a.id, (x) => ({ ...x, proof: { ...x.proof, more: v } }))} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Checkbox label="Proof posted" checked={p.proof.posted} onChange={(v) => setAction(a.id, (x) => ({ ...x, proof: { ...x.proof, posted: v, date: v && !x.proof.date ? todayISO() : x.proof.date } }))} />
                <Field label="Date posted" htmlFor="pf-date"><TextInput id="pf-date" type="date" value={p.proof.date} onChange={(v) => setAction(a.id, (x) => ({ ...x, proof: { ...x.proof, date: v } }))} /></Field>
              </div>
            </div>
          </Section>

          {/* 8. Notes */}
          <Section title="Notes">
            <label htmlFor="act-notes" className="sr-only">Notes for this action</label>
            <TextArea id="act-notes" rows={5} placeholder="Anything you want to remember about this action." value={p.notes} onChange={(v) => setAction(a.id, (x) => ({ ...x, notes: v }))} />
          </Section>

          {/* Resources */}
          {a.resources.length > 0 && (
            <Section title="Resources">
              <ul className="space-y-1">{a.resources.map((r) => <li key={r.label}>{r.url ? <a className="inline-flex items-center gap-1 underline" href={r.url} target="_blank" rel="noreferrer">{r.label}<ExternalLink size={14} /></a> : <span className="text-muted">{r.label}</span>}</li>)}</ul>
            </Section>
          )}

          {/* 11. Prev / next */}
          <nav className="flex items-center justify-between gap-3 border-t border-line pt-6" aria-label="Action navigation">
            <button className="btn-ghost" disabled={idx === 0} onClick={() => onNavigate(ACTIONS[idx - 1].id)}><ChevronLeft size={16} />{idx > 0 ? `Action ${String(idx).padStart(2, '0')}` : 'Previous'}</button>
            <button className="btn-ghost" disabled={idx === ACTIONS.length - 1} onClick={() => onNavigate(ACTIONS[idx + 1].id)}>{idx < ACTIONS.length - 1 ? `Action ${String(idx + 2).padStart(2, '0')}` : 'Next'}<ChevronRight size={16} /></button>
          </nav>
        </div>
      </div>
    </div>
  )

  // Plain render function (not a component) so inputs keep focus while typing.
  function renderField(f: FieldDef) {
    const fid = `${a.id}-${f.id}`
    const raw = f.bind ? state.profile[f.bind] : p.fields[f.id]
    const write = (v: string | string[] | number | null) => {
      if (f.bind) setProfile({ [f.bind]: v } as Partial<Profile>)
      else setAction(a.id, (x) => ({ ...x, fields: { ...x.fields, [f.id]: v as string | string[] } }))
    }
    if (f.type === 'rhythm') {
      const nums = computeNumbers(state)
      const n = (k: string) => { const v = Number(p.fields[k]); return p.fields[k] ? v : 0 }
      const weekly = n('outreach') + n('followups')
      const need = nums.perWeekNeeded
      const minOutreach = tier === 1 ? 5 : tier === 2 ? 3 : 0
      // count: 0 → just show the weekly number pulled from Action 04
      if (f.count === 0) return (
        <div>
          <p className="text-sm font-semibold">{f.label}</p>
          <p className="mt-1.5 rounded-2xl bg-ink p-4 text-lg text-surface">
            {need == null ? 'Finish the calculator in Action 04 to pull in your weekly number.' : <>You need <span className="pixel text-2xl">{need}</span> people to see your offer each week.</>}
          </p>
        </div>
      )
      return (
        <div className="space-y-2">
          <p className="text-sm font-semibold">{f.label}</p>
          {need == null
            ? <p className="rounded-2xl bg-bg p-4 text-sm">Finish the calculator in Action 04 to see your weekly number here.</p>
            : <p className={`rounded-2xl p-4 font-semibold ${weekly >= need ? 'bg-success-soft text-success' : 'bg-highlight/70'}`}>
                {weekly >= need
                  ? <>Your rhythm hits your number: {weekly} people a week from outreach and follow-ups, and you need {need}. Content is extra.</>
                  : <>Your rhythm is below your number. Add more outreach. It’s the fastest way to close the gap. ({weekly} a week now, you need {need}.)</>}
              </p>}
          {minOutreach > 0 && p.fields.outreach !== undefined && p.fields.outreach !== '' && n('outreach') < minOutreach && (
            <p className="rounded-2xl bg-highlight/70 p-3 text-sm font-medium">{tier === 1 ? 'Tier 01 needs at least 5 people a week.' : 'Tier 02 needs at least 3 past buyers a week.'}</p>
          )}
          <p className="text-xs text-muted">Only outreach and follow-ups count toward your number, because posts don’t reach a fixed number of people. Content brings people to you, and reaching out brings them faster.</p>
        </div>
      )
    }
    if (f.type === 'duration') {
      const s0 = String(p.fields[f.range!.start] ?? ''), e0 = String(p.fields[f.range!.end] ?? '')
      if (!s0 || !e0) return null
      const days = daysBetween(s0, e0) + 1
      if (days < 1) return <p className="rounded-xl bg-highlight/70 p-3 text-sm font-medium">Your end date needs to be after your start date.</p>
      return (
        <div className="space-y-2">
          <p className="rounded-xl bg-blush/50 p-3 font-semibold">Your sprint runs for {days} {days === 1 ? 'day' : 'days'}.</p>
          {f.range!.max && days > f.range!.max && <p className="rounded-xl bg-highlight/70 p-3 text-sm font-medium">{f.range!.tooLong}</p>}
        </div>
      )
    }
    if (f.type === 'sprintsummary') {
      const v = (k: string) => String(p.fields[k] ?? '').trim()
      const list = parseWarm(p.fields.warmList).filter((r) => r.name.trim())
      const days = v('start') && v('end') ? daysBetween(v('start'), v('end')) + 1 : null
      const lines = [
        [v('type') || 'Sprint type not chosen', v('start') && v('end') ? `${fmtDate(v('start'))} to ${fmtDate(v('end'))}` : 'Dates not set', days && days > 0 ? `${days} days` : ''].filter(Boolean).join(' · '),
        `Buy now because: ${v('reason') || '…'}`,
        `Warm list: ${list.length} ${list.length === 1 ? 'name' : 'names'}`,
        ...(tier === 3 ? [`Cash target: ${p.fields.t3Target ? fmtMoney(Number(p.fields.t3Target)) : '…'}`] : []),
      ]
      return <SprintSummary title={f.label} lines={lines} />
    }
    if (f.type === 'notice') {
      const on = f.notice!.when.every((k) => p.fields[k] === 'Yes')
      return on ? <p className="rounded-2xl bg-success-soft p-4 font-semibold text-success">{f.notice!.text}</p> : null
    }
    if (f.type === 'pathmap') {
      const steps = f.pathMap!.steps[String(p.fields[f.pathMap!.by] ?? '')]
      if (!steps) return <p className="text-sm text-muted">Choose your path above and your map builds here.</p>
      return (
        <div>
          {!f.group && <p className="mb-2 text-sm font-semibold">{f.label}</p>}
          <ol className="flex flex-wrap items-stretch gap-2">
            {steps.map((st, i) => {
              const v = p.fields[st.field]
              const text = Array.isArray(v) ? v.filter(Boolean).length ? `${v.filter(Boolean).length} written` : '' : String(v ?? '').trim()
              return (
                <li key={st.label} className="flex items-center gap-2">
                  <span className={`max-w-[15rem] rounded-xl border-bold px-3 py-2 text-sm ${text ? 'border-ink bg-surface' : 'border-dashed border-ink/30 bg-bg text-muted'}`}>
                    <span className="label-caps block !text-[10px] !tracking-[0.12em]">{st.label}</span>
                    <span className="line-clamp-2">{text || 'Not filled in yet'}</span>
                  </span>
                  {i < steps.length - 1 && <span aria-hidden className="text-lg">→</span>}
                </li>
              )
            })}
          </ol>
        </div>
      )
    }
    let input
    switch (f.type) {
      case 'tier': input = <TierPicker name={fid} value={state.profile.tier} onChange={(t) => (state.profile.tier && t !== state.profile.tier ? onRequestTier(t) : setProfile({ tier: t }))} />; break
      case 'textarea': input = <TextArea id={fid} value={(raw as string) ?? ''} onChange={write} placeholder={f.placeholder} />; break
      case 'number': case 'currency':
        input = <NumberInput id={fid} currency={f.type === 'currency'} value={raw == null || raw === '' ? null : Number(raw)} onChange={(v) => f.bind ? write(v) : write(v == null ? '' : String(v))} />; break
      case 'tracklist': {
        // Each entry is saved as "[x] Name" once ticked, or "Name".
        const vals = Array.isArray(raw) ? raw : []
        const done = vals.filter((x) => x.startsWith('[x] ')).length
        const rows = vals.map((x) => ({ on: x.startsWith('[x] '), name: x.replace(/^\[x\] /, '') }))
        const save = (r: { on: boolean; name: string }[]) => write(r.map((x) => (x.on ? `[x] ${x.name}` : x.name)))
        const min = tier ? f.minItems?.[tier] : undefined
        input = (
          <div className="space-y-2">
            {rows.length > 0 && <p className="text-sm font-semibold">{rows.length} {rows.length === 1 ? 'name' : 'names'} · {done} messaged</p>}
            <ul className="space-y-1.5">
              {rows.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input type="checkbox" aria-label={`Messaged ${r.name || 'this person'}`} checked={r.on} className="h-5 w-5 shrink-0 accent-[var(--c-ink)]"
                    onChange={(e) => save(rows.map((x, j) => (j === i ? { ...x, on: e.target.checked } : x)))} />
                  <input aria-label={`Name ${i + 1}`} className={`field !py-2 ${r.on ? 'text-muted line-through' : ''}`} value={r.name}
                    onChange={(e) => save(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <button type="button" className="rounded-full p-2 text-muted hover:bg-bg hover:text-danger" aria-label={`Remove ${r.name || 'name'}`}
                    onClick={() => save(rows.filter((_, j) => j !== i))}><X size={16} /></button>
                </li>
              ))}
            </ul>
            <ListInput id={fid} value={[]} placeholder={f.placeholder} onChange={(added) => save([...rows, ...added.map((n) => ({ on: false, name: n }))])} />
            {min && rows.length < min.n && <p className="rounded-xl bg-highlight/70 p-3 text-sm font-medium">{min.text} ({rows.length} so far)</p>}
          </div>
        ); break
      }
      case 'warmtracker': {
        const rows = parseWarm(raw)
        const save = (r: WarmRow[]) => write(r.map((x) => JSON.stringify(x)))
        const upd = (i: number, patch: Partial<WarmRow>) => save(rows.map((x, j) => (j === i ? { ...x, ...patch } : x)))
        const count = (k: 'messaged' | 'replied' | 'bought') => rows.filter((r) => r[k]).length
        const min = tier ? f.minItems?.[tier] : undefined
        const ticks = [['messaged', 'Messaged'], ['replied', 'Replied'], ['bought', 'Bought']] as const
        input = (
          <div className="space-y-3">
            <p className="font-semibold" aria-live="polite">{rows.length} {rows.length === 1 ? 'name' : 'names'} · {count('messaged')} messaged · {count('replied')} replied · {count('bought')} bought</p>
            <div className="overflow-hidden rounded-2xl border-bold border-line">
              <div className="hidden grid-cols-[1fr_1.3fr_repeat(3,4.5rem)_2.5rem] gap-2 bg-bg px-3 py-2 text-sm font-semibold sm:grid">
                <span>Name</span><span>Who they are</span>{ticks.map(([, l]) => <span key={l} className="text-center">{l}</span>)}<span />
              </div>
              {rows.length === 0 && <p className="px-3 py-4 text-sm text-muted">No names yet. Add your first one below.</p>}
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-2 items-center gap-2 border-t border-line px-3 py-2 first:border-t-0 sm:grid-cols-[1fr_1.3fr_repeat(3,4.5rem)_2.5rem] sm:first:border-t">
                  <input aria-label={`Name ${i + 1}`} className="field !py-2" value={r.name} placeholder="First name" onChange={(e) => upd(i, { name: e.target.value })} />
                  <select aria-label={`Who ${r.name || 'they'} are`} className="field !py-2" value={r.who} onChange={(e) => upd(i, { who: e.target.value })}>
                    <option value="">Choose</option>{f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  {ticks.map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 text-sm sm:justify-center">
                      <input type="checkbox" className="h-5 w-5 accent-[var(--c-ink)]" checked={r[k]} onChange={(e) => upd(i, { [k]: e.target.checked })} />
                      <span className="sm:sr-only">{l}</span>
                    </label>
                  ))}
                  <button type="button" className="justify-self-end rounded-full p-2 text-muted hover:bg-bg hover:text-danger" aria-label={`Remove ${r.name || 'row'}`}
                    onClick={() => save(rows.filter((_, j) => j !== i))}><X size={16} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-ghost !px-4 !py-2" onClick={() => save([...rows, { name: '', who: '', messaged: false, replied: false, bought: false }])}>+ Add a name</button>
            {min && rows.length < min.n && <p className="rounded-xl bg-highlight/70 p-3 text-sm font-medium">{min.text} ({rows.length} so far)</p>}
          </div>
        ); break
      }
      case 'multi': {
        const vals = Array.isArray(raw) ? raw : []
        input = (
          <div className="grid gap-2 sm:grid-cols-3">
            {Array.from({ length: f.count ?? 3 }, (_, i) => (
              <input key={i} aria-label={`${f.label} ${i + 1}`} className="field" placeholder={`Topic ${i + 1}`} value={vals[i] ?? ''}
                onChange={(e) => { const next = Array.from({ length: f.count ?? 3 }, (_, j) => vals[j] ?? ''); next[i] = e.target.value; write(next) }} />
            ))}
          </div>
        ); break
      }
      case 'select': input = (
        <select id={fid} className="field" value={(raw as string) ?? ''} onChange={(e) => write(e.target.value)}>
          <option value="">Choose one</option>
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ); break
      case 'cards': input = (
        <div role="radiogroup" aria-label={f.label} className="grid gap-2 sm:grid-cols-2">
          {f.cards?.map((c) => (
            <label key={c.title} className={`relative cursor-pointer rounded-2xl border-bold p-4 ${raw === c.title ? 'border-ink bg-blush shadow-card' : 'border-line bg-surface hover:border-ink/50'}`}>
              <input type="radio" className="sr-only" name={fid} checked={raw === c.title} onChange={() => write(c.title)} />
              <span className="block font-bold">{c.title}</span>
              <span className="mt-1 block text-sm">{c.desc}</span>
              {c.best && <span className="mt-1 block text-xs text-muted">Best for {c.best}</span>}
            </label>
          ))}
        </div>
      ); break
      case 'yesno': input = (
        <div role="radiogroup" aria-label={f.label} className="flex gap-2">
          {['Yes', 'Not yet'].map((o) => (
            <label key={o} className={`relative cursor-pointer rounded-pill border-bold px-5 py-2 text-sm font-semibold ${raw === o ? (o === 'Yes' ? 'border-success bg-success-soft text-success' : 'border-ink bg-highlight') : 'border-line bg-surface hover:border-ink/50'}`}>
              <input type="radio" className="sr-only" name={fid} checked={raw === o} onChange={() => write(o)} />{o}
            </label>
          ))}
        </div>
      ); break
      case 'list': input = <ListInput id={fid} value={Array.isArray(raw) ? raw : []} onChange={write} placeholder={f.placeholder} />; break
      default: input = <TextInput id={fid} type={f.type === 'url' ? 'url' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'} value={(raw as string) ?? ''} onChange={write} placeholder={f.placeholder} />
    }
    return (
      <Field label={(() => {
        if (!f.labelFrom) return f.label
        const v = state.actions[f.labelFrom.action ?? a.id]?.fields[f.labelFrom.field]
        return typeof v === 'string' && v.trim() ? f.labelFrom.template.replace('{v}', v.trim()) : f.label
      })()} help={f.bind ? `${f.help ? f.help + ' ' : ''}Also updates your challenge setup.` : f.help} htmlFor={f.type === 'tier' ? undefined : fid}>
        {input}
        {f.type === 'yesno' && raw === 'Not yet' && f.ifNotYet && <p className="rounded-xl bg-highlight/60 p-3 text-sm font-medium">{f.ifNotYet}</p>}
        {f.copyFrom && (() => {
          const src = state.actions[f.copyFrom.action]?.fields[f.copyFrom.field]
          const text = typeof src === 'string' ? src.trim() : ''
          return text
            ? <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => write(text)}><Copy size={14} /> {f.copyFrom.label}</button>
            : <p className="text-sm text-muted">Nothing saved in {f.copyFrom.label.replace(/^Paste from /, '')} yet. You can type it here instead.</p>
        })()}
        {f.examples && (
          <details className="rounded-xl bg-bg px-3 py-2">
            <summary className="cursor-pointer text-sm font-semibold">See examples</summary>
            <ul className="mt-2 space-y-2 text-sm text-muted">{f.examples.map((e) => <li key={e.label}><span className="font-semibold text-ink">{e.label}:</span> {e.text}</li>)}</ul>
          </details>
        )}
        {f.compose && (
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => write(f.compose!.replace(/\{(\w+)\}/g, (_, k: string) => {
            const v = p.fields[k]
            return typeof v === 'string' && v.trim() ? v.trim().replace(/[.\s]+$/, '') : `[${k}]`
          }))}><Sparkles size={14} /> Build it from my answers</button>
        )}
        {f.type === 'url' && typeof raw === 'string' && /^https?:\/\//.test(raw) && <a href={raw} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm underline">Open link <ExternalLink size={13} /></a>}
      </Field>
    )
  }
}

function Section({ title, sub, right, children }: { title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div><h3 className="text-xl font-bold">{title}</h3>{sub && <p className="text-sm text-muted">{sub}</p>}</div>{right}
      </div>
      {children}
    </section>
  )
}

function HelpBox({ help, values }: { help: HelpDef; values: Record<string, string | string[]> }) {
  const [copied, setCopied] = useState(false)
  const pb = help.notInWmhq.promptBy
  const prompt = pb ? pb.prompts[String(values[pb.field] ?? '')] : help.notInWmhq.prompt
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt ?? ''); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked */ }
  }
  return (
    <Section title="Get help with this">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-bold border-ink bg-blush/40 p-4">
          <p className="label-caps !text-ink">In WMHQ</p>
          <p className="mt-2">{help.inWmhq.line}</p>
          <div className="mt-3 flex flex-col items-start gap-1">
            {[{ label: help.inWmhq.linkLabel, url: help.inWmhq.url }, ...(help.inWmhq.more ?? [])].map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline underline-offset-4">{l.label} →</a>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border-bold border-ink/20 bg-surface p-4">
          <p className="label-caps">Not in WMHQ yet</p>
          <p className="mt-2">{help.notInWmhq.line}</p>
          {pb && !prompt && <p className="mt-3 text-sm font-medium">{pb.chooseFirst}</p>}
          {prompt && <button className="btn-primary mt-3 !px-4 !py-2" onClick={copy}>{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy prompt</>}</button>}
        </div>
      </div>
      {prompt && (
        <details className="mt-3 rounded-2xl bg-bg p-4">
          <summary className="cursor-pointer text-sm font-semibold">See the prompt</summary>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-muted">{prompt}</pre>
        </details>
      )}
      {(help.notInWmhq.bridge || help.notInWmhq.joinUrl) && (
        <p className="mt-3 text-sm text-muted">{help.notInWmhq.bridge}{' '}
          {help.notInWmhq.joinUrl && <a href={help.notInWmhq.joinUrl} target="_blank" rel="noreferrer" className="font-bold text-ink underline underline-offset-4">{help.notInWmhq.joinLabel} →</a>}
        </p>
      )}
    </Section>
  )
}

function SprintSummary({ title, lines }: { title: string; lines: string[] }) {
  const [copied, setCopied] = useState(false)
  return (
    <section className="rounded-card border-bold border-ink bg-ink p-6 text-surface shadow-card">
      <p className="pixel text-xl text-blush">{title.toUpperCase()}</p>
      <div className="mt-2 space-y-1.5 text-lg">{lines.map((l, i) => <p key={i} className={i === 0 ? 'font-bold' : ''}>{l}</p>)}</div>
      <button type="button" className="btn mt-4 bg-surface !px-4 !py-2 text-ink" onClick={async () => {
        try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* blocked */ }
      }}>{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy summary</>}</button>
    </section>
  )
}

interface WarmRow { name: string; who: string; messaged: boolean; replied: boolean; bought: boolean }
/** Warm list rows are saved as JSON strings in the field's list. */
function parseWarm(raw: unknown): WarmRow[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x) => {
    try { const r = JSON.parse(x); if (r && typeof r === 'object') return { name: '', who: '', messaged: false, replied: false, bought: false, ...r } } catch { /* plain text */ }
    return { name: String(x).replace(/^\[x\] /, ''), who: '', messaged: String(x).startsWith('[x] '), replied: false, bought: false }
  })
}
