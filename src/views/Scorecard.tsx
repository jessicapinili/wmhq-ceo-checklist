import { BarChart3, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import type { ScoreEntry } from '../types'
import { EmptyState, Field, Modal, NumberInput, PageTitle, ProgressBar, SaveIndicator, TextArea, TextInput, useConfirm } from '../components/ui'
import { fmtDate, fmtMoney, milestoneProgress, pct, scoreTotals, tierLabel, todayISO, uid } from '../utils'

const blank = (): ScoreEntry => ({ id: uid(), date: todayISO(), published: null, conversations: null, offers: null, sales: null, cash: null, notes: '', bottleneck: '' })

export default function Scorecard() {
  const { state, update } = useStore()
  const [editing, setEditing] = useState<ScoreEntry | null>(null)
  const confirm = useConfirm()
  const t = scoreTotals(state)
  const ms = milestoneProgress(state)
  const entries = [...state.scorecard].sort((a, b) => b.date.localeCompare(a.date))
  const latestBottleneck = entries.find((e) => e.bottleneck.trim())?.bottleneck

  const save = (e: ScoreEntry) => {
    update((s) => ({ ...s, scorecard: s.scorecard.some((x) => x.id === e.id) ? s.scorecard.map((x) => x.id === e.id ? e : x) : [...s.scorecard, e] }))
    setEditing(null)
  }

  return (
    <div>
      <PageTitle eyebrow="TRACK THE NUMBERS" title="CEO Scorecard">
        <button className="btn-primary" onClick={() => setEditing(blank())}><Plus size={18} /> Add entry</button>
      </PageTitle>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile big={String(t.conversations)} small="Conversations" />
        <Tile big={String(t.offers)} small="Offers made" />
        <Tile big={String(t.sales)} small="Sales" />
        <Tile big={fmtMoney(t.cash)} small="Cash collected" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-bold">Simple metrics</h2>
          <dl className="mt-3 divide-y divide-line">
            <Row k="Conversation-to-offer rate" v={pct(t.convToOffer)} />
            <Row k="Offer-to-sale close rate" v={pct(t.closeRate)} />
            <Row k="Average cash per sale" v={t.avgSale == null ? '—' : fmtMoney(t.avgSale)} />
            <Row k="Content or invitations published" v={String(t.published)} />
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-bold">Progress towards your milestone</h2>
          <p className="text-sm text-muted">{tierLabel(state.profile.tier)}</p>
          <p className="pixel mt-3 text-4xl">{ms.pct}%</p>
          <ProgressBar value={ms.pct} label="Milestone progress" />
          <p className="mt-2 text-sm">{ms.label}{state.profile.tier === 3 && ms.salesTarget ? ` · about ${ms.salesTarget} sale${ms.salesTarget === 1 ? '' : 's'} needed at your offer price` : ''}</p>
          {state.profile.tier === 2 && <p className="mt-1 text-xs text-muted">Count sales of the same offer only.</p>}
          {latestBottleneck && <p className="mt-3 rounded-xl bg-highlight/60 p-3 text-sm"><span className="font-semibold">Current bottleneck:</span> {latestBottleneck}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Entries</h2>
        <SaveIndicator />
      </div>
      <div className="mt-3 space-y-3">
        {entries.length === 0 && (
          <EmptyState icon={<BarChart3 />} title="No entries yet" body="Add your first entry whenever you publish, start conversations or make a sale. Small, honest numbers are perfect."
            action={<button className="btn-pink" onClick={() => setEditing(blank())}>Add your first entry</button>} />
        )}
        {entries.map((e) => (
          <article key={e.id} className="rounded-2xl border-bold border-ink bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">{fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              <div className="flex gap-1">
                <button className="rounded-full p-2 hover:bg-bg" aria-label={`Edit entry for ${e.date}`} onClick={() => setEditing(e)}><Pencil size={16} /></button>
                <button className="rounded-full p-2 hover:bg-bg hover:text-danger" aria-label={`Delete entry for ${e.date}`}
                  onClick={() => confirm.ask({ title: 'Delete this entry?', body: 'This scorecard entry will be removed. This can’t be undone.', confirmLabel: 'Delete entry', danger: true, run: () => update((s) => ({ ...s, scorecard: s.scorecard.filter((x) => x.id !== e.id) })) })}><Trash2 size={16} /></button>
              </div>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-5">
              <Mini k="Published" v={e.published} /><Mini k="Conversations" v={e.conversations} /><Mini k="Offers" v={e.offers} /><Mini k="Sales" v={e.sales} /><Mini k="Cash" v={e.cash == null ? null : fmtMoney(e.cash)} />
            </dl>
            {e.bottleneck && <p className="mt-2 text-sm"><span className="font-semibold">Bottleneck:</span> {e.bottleneck}</p>}
            {e.notes && <p className="mt-1 text-sm text-muted">{e.notes}</p>}
          </article>
        ))}
      </div>

      {editing && <EntryForm entry={editing} onCancel={() => setEditing(null)} onSave={save} />}
      {confirm.node}
    </div>
  )
}

function EntryForm({ entry, onSave, onCancel }: { entry: ScoreEntry; onSave: (e: ScoreEntry) => void; onCancel: () => void }) {
  const [e, setE] = useState(entry)
  const set = (p: Partial<ScoreEntry>) => setE((x) => ({ ...x, ...p }))
  return (
    <Modal open onClose={onCancel} title="Scorecard entry" wide>
      <form className="space-y-4" onSubmit={(ev) => { ev.preventDefault(); onSave(e) }}>
        <Field label="Date" htmlFor="sc-date"><TextInput id="sc-date" type="date" value={e.date} onChange={(v) => set({ date: v })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Content or invitations published" htmlFor="sc-pub"><NumberInput id="sc-pub" value={e.published} onChange={(v) => set({ published: v })} /></Field>
          <Field label="Conversations started" htmlFor="sc-conv"><NumberInput id="sc-conv" value={e.conversations} onChange={(v) => set({ conversations: v })} /></Field>
          <Field label="Offers made" htmlFor="sc-off"><NumberInput id="sc-off" value={e.offers} onChange={(v) => set({ offers: v })} /></Field>
          <Field label="Sales made" htmlFor="sc-sales"><NumberInput id="sc-sales" value={e.sales} onChange={(v) => set({ sales: v })} /></Field>
        </div>
        <Field label="Cash collected" htmlFor="sc-cash" help="Money that actually landed in your account."><NumberInput id="sc-cash" currency value={e.cash} onChange={(v) => set({ cash: v })} /></Field>
        <Field label="Current bottleneck" htmlFor="sc-bn"><TextInput id="sc-bn" value={e.bottleneck} onChange={(v) => set({ bottleneck: v })} placeholder="e.g. Not enough conversations" /></Field>
        <Field label="Notes" htmlFor="sc-notes"><TextArea id="sc-notes" value={e.notes} onChange={(v) => set({ notes: v })} /></Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary">Save entry</button>
        </div>
      </form>
    </Modal>
  )
}

const Tile = ({ big, small }: { big: string; small: string }) => (
  <div className="card p-4"><p className="pixel text-4xl leading-none">{big}</p><p className="mt-1 text-sm text-muted">{small}</p></div>
)
const Row = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between gap-4 py-2"><dt className="text-muted">{k}</dt><dd className="font-bold">{v}</dd></div>
const Mini = ({ k, v }: { k: string; v: string | number | null }) => <div><dt className="text-xs text-muted">{k}</dt><dd className="font-semibold">{v ?? '—'}</dd></div>
