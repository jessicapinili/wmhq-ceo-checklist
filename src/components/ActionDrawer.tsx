import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Info, Maximize2, Minimize2, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ACTIONS, PHASES, TIERS } from '../data/content'
import { useStore } from '../store'
import type { FieldDef, HelpDef, Profile, TierId } from '../types'
import { checkedCount, dueDate, fmtLong, progressOf, todayISO } from '../utils'
import { StatusSelect } from './Board'
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
        className={`animate-slidein h-full w-full overflow-y-auto bg-surface transition-[max-width] duration-200 ${expanded ? 'max-w-none' : 'max-w-2xl border-l-bold border-ink sm:rounded-l-card'}`}>
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur sm:px-8">
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

          {a.help && <HelpBox help={a.help} />}

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
          <Section title={tier ? `Your ${TIERS[tier].short} requirement` : 'Tier requirement'}>
            {a.tierIntro && <p className="mb-3 text-muted">{a.tierIntro}</p>}
            {tier ? <p className="rounded-2xl border-bold border-ink bg-blush/50 p-4 text-lg font-semibold">{a.tierRequirements[tier]}</p>
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
                  <li key={t} className="rounded-xl bg-bg p-3 text-sm"><span className="font-bold">{TIERS[t].short}: {TIERS[t].name}.</span> {a.tierRequirements[t]}</li>
                ))}
              </ul>
            )}
          </Section>

          {/* 6. Workspace */}
          <Section title="Your workspace" sub="Type straight in. Everything saves as you go.">
            <div className="space-y-5">
              {a.fields.filter((f) => !f.tiers).map((f) => <div key={f.id}>{renderField(f)}</div>)}
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
    let input
    switch (f.type) {
      case 'tier': input = <TierPicker name={fid} value={state.profile.tier} onChange={(t) => (state.profile.tier && t !== state.profile.tier ? onRequestTier(t) : setProfile({ tier: t }))} />; break
      case 'textarea': input = <TextArea id={fid} value={(raw as string) ?? ''} onChange={write} placeholder={f.placeholder} />; break
      case 'number': case 'currency':
        input = <NumberInput id={fid} currency={f.type === 'currency'} value={raw == null || raw === '' ? null : Number(raw)} onChange={(v) => f.bind ? write(v) : write(v == null ? '' : String(v))} />; break
      case 'list': input = <ListInput id={fid} value={Array.isArray(raw) ? raw : []} onChange={write} placeholder={f.placeholder} />; break
      default: input = <TextInput id={fid} type={f.type === 'url' ? 'url' : f.type === 'date' ? 'date' : 'text'} value={(raw as string) ?? ''} onChange={write} placeholder={f.placeholder} />
    }
    return (
      <Field label={f.label} help={f.bind ? `${f.help ? f.help + ' ' : ''}Also updates your challenge setup.` : f.help} htmlFor={f.type === 'tier' ? undefined : fid}>
        {input}
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

function HelpBox({ help }: { help: HelpDef }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(help.notInWmhq.prompt); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked */ }
  }
  return (
    <Section title="Get help with this">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-bold border-ink bg-blush/40 p-4">
          <p className="label-caps !text-ink">In WMHQ</p>
          <p className="mt-2">{help.inWmhq.line}</p>
          <a href={help.inWmhq.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 font-bold underline underline-offset-4">{help.inWmhq.linkLabel} →</a>
        </div>
        <div className="rounded-2xl border-bold border-ink/20 bg-surface p-4">
          <p className="label-caps">Not in WMHQ yet</p>
          <p className="mt-2">{help.notInWmhq.line}</p>
          <button className="btn-primary mt-3 !px-4 !py-2" onClick={copy}>{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy prompt</>}</button>
        </div>
      </div>
      <details className="mt-3 rounded-2xl bg-bg p-4">
        <summary className="cursor-pointer text-sm font-semibold">See the prompt</summary>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-muted">{help.notInWmhq.prompt}</pre>
      </details>
      <p className="mt-3 text-sm text-muted">{help.notInWmhq.bridge}{' '}
        {help.notInWmhq.joinUrl && <a href={help.notInWmhq.joinUrl} target="_blank" rel="noreferrer" className="font-bold text-ink underline underline-offset-4">{help.notInWmhq.joinLabel} →</a>}
      </p>
    </Section>
  )
}
