import { Check, CircleCheck, CircleHelp, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useStore } from '../store'
import { TIERS } from '../data/content'
import type { TierId } from '../types'
import { fmtTime } from '../utils'

export function ProgressBar({ value, label, thin }: { value: number; label: string; thin?: boolean }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
      className={`w-full overflow-hidden rounded-pill bg-soft/70 ${thin ? 'h-1.5' : 'h-3'}`}>
      <div className="h-full rounded-pill bg-ink transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  // Keep the latest onClose in a ref so re-renders don't re-run the focus effect.
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current?.querySelector<HTMLElement>('input, textarea, select, button:not([data-close])')
    el?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeRef.current()
      if (e.key !== 'Tab' || !ref.current) return
      // Keep keyboard focus inside the popup.
      const items = [...ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id}
        className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 sm:rounded-card ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={id} className="text-xl font-bold">{title}</h2>
          <button data-close onClick={onClose} className="rounded-full p-1.5 hover:bg-bg" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ open, title, body, confirmLabel, danger, onConfirm, onCancel }: {
  open: boolean; title: string; body: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="text-muted">{body}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}

/** Reusable hook for a confirm dialog. */
export function useConfirm() {
  const [cfg, setCfg] = useState<null | { title: string; body: ReactNode; confirmLabel: string; danger?: boolean; run: () => void }>(null)
  const ask = (c: NonNullable<typeof cfg>) => setCfg(c)
  const node = (
    <Confirm open={!!cfg} title={cfg?.title ?? ''} body={cfg?.body} confirmLabel={cfg?.confirmLabel ?? 'Confirm'} danger={cfg?.danger}
      onCancel={() => setCfg(null)} onConfirm={() => { cfg?.run(); setCfg(null) }} />
  )
  return { ask, node }
}

export function SaveIndicator({ manual }: { manual?: boolean }) {
  const { lastSaved, saveNow, saveError } = useStore()
  const [flash, setFlash] = useState(false)
  if (saveError) return <p role="alert" className="text-sm font-medium text-danger">{saveError}</p>
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted" aria-live="polite">
      <span className="inline-flex items-center gap-1.5"><CircleCheck size={16} className="text-success" /> Saved automatically</span>
      <span>Last saved {fmtTime(lastSaved)}</span>
      {manual && (
        <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => { saveNow(); setFlash(true); setTimeout(() => setFlash(false), 1500) }}>
          {flash ? <><Check size={14} /> Saved</> : 'Save'}
        </button>
      )}
    </div>
  )
}

/* ---------- Form fields ---------- */

/** Small "?" next to a label. Opens on hover, keyboard focus or tap, so it works on phones too. */
export function HelpTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!pinned) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) { setPinned(false); setOpen(false) }
    }
    document.addEventListener('mousedown', close); document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [pinned])
  const show = open || pinned
  // Fixed position, clamped to the window, so the bubble is never cut off by a panel edge.
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  useEffect(() => {
    if (!show || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const w = Math.min(256, window.innerWidth - 24)
    setPos({ left: Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12)), top: r.bottom + 6 })
  }, [show])
  // Close when anything scrolls, since a fixed bubble would otherwise drift away from its "?".
  useEffect(() => {
    if (!show) return
    const close = () => { setOpen(false); setPinned(false) }
    window.addEventListener('scroll', close, true)
    return () => window.removeEventListener('scroll', close, true)
  }, [show])
  return (
    <span ref={ref} className="relative inline-flex align-middle" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-label={`Help: ${label}`} aria-describedby={show ? id : undefined} aria-expanded={show}
        onClick={() => setPinned(!pinned)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-accent hover:text-ink">
        <CircleHelp size={17} />
      </button>
      {show && pos && (
        <span id={id} role="tooltip" style={{ left: pos.left, top: pos.top, width: Math.min(256, window.innerWidth - 24) }}
          className="fixed z-[70] rounded-xl border-bold border-ink bg-surface p-3 text-sm font-normal leading-snug text-ink shadow-card">
          {text}
        </span>
      )}
    </span>
  )
}

export function Field({ label, help, error, children, htmlFor }: { label: string; help?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center">
        <label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label>
        {help && <HelpTip text={help} label={label} />}
      </div>
      {children}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}

export function TextInput({ id, value, onChange, type = 'text', placeholder }: { id?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input id={id} type={type} className="field" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export function TextArea({ id, value, onChange, placeholder, rows = 3 }: { id?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea id={id} rows={rows} className="field resize-y" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export function NumberInput({ id, value, onChange, currency, placeholder }: { id?: string; value: number | null; onChange: (v: number | null) => void; currency?: boolean; placeholder?: string }) {
  return (
    <div className="relative">
      {currency && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>}
      <input id={id} type="number" inputMode="decimal" min={0} step="any" className={`field ${currency ? 'pl-7' : ''}`} placeholder={placeholder}
        value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
    </div>
  )
}

export function ListInput({ id, value, onChange, placeholder }: { id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('')
  const add = () => { if (draft.trim()) { onChange([...value, draft.trim()]); setDraft('') } }
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((v, i) => (
            <li key={i} className="flex items-center gap-2">
              <input aria-label={`Item ${i + 1}`} className="field !py-2" value={v} onChange={(e) => onChange(value.map((x, j) => j === i ? e.target.value : x))} />
              <button className="rounded-full p-2 text-muted hover:bg-bg hover:text-danger" aria-label={`Remove ${v || 'item'}`} onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input id={id} className="field !py-2" value={draft} placeholder={placeholder ?? 'Add an item'} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        <button className="btn-ghost !px-3" onClick={add} aria-label="Add item"><Plus size={16} /> Add</button>
      </div>
    </div>
  )
}

export function TierPicker({ value, onChange, name }: { value: TierId | null; onChange: (t: TierId) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label="Milestone tier" className="grid gap-3 sm:grid-cols-3">
      {([1, 2, 3] as TierId[]).map((t) => {
        const on = value === t
        return (
          <label key={t} className={`relative cursor-pointer rounded-card border-bold p-4 transition-all ${on ? 'border-ink bg-blush shadow-card' : 'border-line bg-surface hover:border-ink/50'}`}>
            <input type="radio" name={name} className="sr-only" checked={on} onChange={() => onChange(t)} />
            <span className="pixel block text-lg text-accent">{TIERS[t].short.toUpperCase()}</span>
            <span className="block text-lg font-bold">{TIERS[t].name}</span>
            <span className="mt-1 block text-sm text-muted">{TIERS[t].description}</span>
          </label>
        )
      })}
    </div>
  )
}

export function Checkbox({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: ReactNode }) {
  const id = useId()
  const [pop, setPop] = useState(false)
  return (
    <div className={`flex items-start gap-3 rounded-xl px-2 py-2.5 ${pop && checked ? 'animate-glow' : ''}`}>
      <input id={id} type="checkbox" className="peer sr-only" checked={checked}
        onChange={(e) => { onChange(e.target.checked); setPop(true); setTimeout(() => setPop(false), 1100) }} />
      <label htmlFor={id} aria-hidden className={`mt-0.5 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-bold border-ink transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-[var(--c-focus)] ${checked ? 'bg-ink text-surface' : 'bg-surface'} ${pop && checked ? 'animate-pop' : ''}`}>
        {checked && <Check size={18} strokeWidth={3} />}
      </label>
      <label htmlFor={id} className="cursor-pointer">
        <span className={`block text-base font-medium transition-colors ${checked ? 'text-muted line-through decoration-2' : ''}`}>{label}</span>
        {sub}
      </label>
    </div>
  )
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-card border-bold border-dashed border-ink/25 px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blush">{icon}</div>
      <p className="text-lg font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="pixel text-xl text-accent">{eyebrow}</p>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      </div>
      {children}
    </header>
  )
}
