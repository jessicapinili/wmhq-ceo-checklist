import { Download, RotateCcw, Upload } from 'lucide-react'
import { CHALLENGE_DAYS, TIERS } from '../data/content'
import { useStore } from '../store'
import type { TierId } from '../types'
import { Field, NumberInput, PageTitle, SaveIndicator, TextArea, TextInput, TierPicker, useConfirm } from '../components/ui'
import { addDays, fmtLong } from '../utils'

export default function Settings({ onRequestTier, onImport }: { onRequestTier: (t: TierId) => void; onImport: () => void }) {
  const { state, setProfile, exportJSON, reset } = useStore()
  const p = state.profile
  const confirm = useConfirm()

  return (
    <div className="max-w-3xl">
      <PageTitle eyebrow="YOUR CHALLENGE" title="Settings"><SaveIndicator manual /></PageTitle>
      <div className="space-y-5">
        <section className="card space-y-5 p-6">
          <h2 className="text-xl font-bold">Your setup answers</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="st-name"><TextInput id="st-name" value={p.firstName} onChange={(v) => setProfile({ firstName: v })} /></Field>
            <Field label="Last name" htmlFor="st-last"><TextInput id="st-last" value={p.lastName} onChange={(v) => setProfile({ lastName: v })} /></Field>
          </div>
          <Field label="Email" htmlFor="st-email" help="Your login email. Your progress is saved to it on this device."><input id="st-email" className="field bg-bg/60 text-muted" value={p.email} readOnly /></Field>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Tier</p>
            <TierPicker name="settings-tier" value={p.tier} onChange={(t) => t !== p.tier && onRequestTier(t)} />
          </div>
          <Field label="Previous 60-day cash baseline" htmlFor="st-base"><NumberInput id="st-base" currency value={p.baseline} onChange={(v) => setProfile({ baseline: v })} /></Field>
          <Field label="Milestone" htmlFor="st-ms"><TextArea id="st-ms" value={p.milestone} onChange={(v) => setProfile({ milestone: v })} /></Field>
          {p.tier && p.milestone !== TIERS[p.tier].milestone && <button className="text-sm font-semibold underline" onClick={() => setProfile({ milestone: TIERS[p.tier!].milestone })}>Use the suggested {TIERS[p.tier].short} milestone</button>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary offer" htmlFor="st-offer"><TextInput id="st-offer" value={p.offer} onChange={(v) => setProfile({ offer: v })} /></Field>
            <Field label="Offer price" htmlFor="st-price"><NumberInput id="st-price" currency value={p.offerPrice} onChange={(v) => setProfile({ offerPrice: v })} /></Field>
            <Field label="Challenge start date" htmlFor="st-start"><TextInput id="st-start" type="date" value={p.startDate} onChange={(v) => v && setProfile({ startDate: v })} /></Field>
            <Field label="Challenge end date" htmlFor="st-end" help={p.endDate <= p.startDate ? 'The end date needs to be after the start date.' : undefined}><TextInput id="st-end" type="date" value={p.endDate} onChange={(v) => v && setProfile({ endDate: v })} /></Field>
          </div>
          {p.endDate !== addDays(p.startDate, CHALLENGE_DAYS - 1) && (
            <button className="text-sm font-semibold underline" onClick={() => setProfile({ endDate: addDays(p.startDate, CHALLENGE_DAYS - 1) })}>Set end date to 60 days ({fmtLong(addDays(p.startDate, CHALLENGE_DAYS - 1))})</button>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold">Backup</h2>
          <p className="mt-1 text-muted">Your progress is saved in this browser on this device. Export your progress regularly if you want a backup or plan to use another device.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={exportJSON}><Download size={18} /> Export progress</button>
            <button className="btn-ghost" onClick={onImport}><Upload size={18} /> Import progress</button>
          </div>
        </section>

        <section className="card border-danger/60 p-6">
          <h2 className="text-xl font-bold">Reset challenge</h2>
          <p className="mt-1 text-muted">Deletes everything saved in this browser and starts setup again. Export first if you might want it back.</p>
          <button className="btn-ghost mt-4 !border-danger/40 text-danger hover:!border-danger"
            onClick={() => confirm.ask({ title: 'Reset your challenge?', danger: true, confirmLabel: 'Delete my progress',
              body: <>This permanently deletes your checklist ticks, workspace answers, proof, notes and scorecard from this browser. <strong className="text-ink">This can’t be undone</strong> unless you have an exported file.</>,
              run: reset })}><RotateCcw size={18} /> Reset challenge</button>
        </section>
      </div>
      {confirm.node}
    </div>
  )
}
