import { PHASES, TIERS } from '../data/content'
import type { TierId } from '../types'
import { PageTitle } from '../components/ui'
import { useStore } from '../store'
import { fmtDate } from '../utils'

export default function Info() {
  const { profile } = useStore().state
  return (
    <div className="max-w-3xl">
      <PageTitle eyebrow="HOW IT WORKS" title="Challenge Information" />
      <div className="space-y-5">
        <Block title="Challenge dates">
          <p>Your challenge runs for 60 days, from <strong>{fmtDate(profile.startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> to <strong>{fmtDate(profile.endDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>. You can change your dates in Settings.</p>
          <p className="mt-2 text-muted">Every action has a rough target date, counted from your start date, to keep you on track. It’s a guide, not a hard deadline. You can start selling at any point.</p>
        </Block>
        <Block title="The three tiers">
          <ul className="space-y-3">
            {([1, 2, 3] as TierId[]).map((t) => (
              <li key={t} className="rounded-2xl bg-bg p-4"><p className="pixel text-lg text-accent">{TIERS[t].short.toUpperCase()}</p><p className="font-bold">{TIERS[t].name}</p><p className="text-muted">{TIERS[t].description}</p></li>
            ))}
          </ul>
          <p className="mt-3 text-muted">Everyone follows the same 16 actions. Your tier changes what success means and the specific requirement inside each action. You can change tiers in Settings without losing checklist progress.</p>
        </Block>
        <Block title="What counts as cash collected">
          <p>Cash collected is money that has actually landed in your account during the challenge. Unpaid invoices, pending payments, pledges and refunds do not count. For Tier 03, your target is the cash you collected in the 30 days before your start date, plus $10,000.</p>
        </Block>
        <Block title="The four phases">
          <ol className="space-y-3">
            {PHASES.map((p) => <li key={p.id}><span className="pixel mr-2 text-lg text-accent">{p.number}</span><strong>{p.name}</strong> <span className="text-muted">(days {p.days[0]} to {p.days[1]})</span><p className="text-muted">{p.intro}</p></li>)}
          </ol>
        </Block>
        <Block title="How proof works">
          <p>Each action lists the proof to post in the community. Post it, then paste the link, add a short written note, tick “Proof posted” and record the date. Proof keeps you accountable and lets us celebrate real progress.</p>
        </Block>
        <Block title="How browser saving works">
          <p className="rounded-2xl bg-highlight/60 p-4 font-semibold">Your progress is saved in this browser on this device. Export your progress regularly if you want a backup or plan to use another device.</p>
          <p className="mt-3 text-muted">Everything saves automatically as you type and tick. Clearing your browser data or using a private window will remove saved progress, so keep an export. Use <strong>Settings → Export progress</strong> to download a backup file and <strong>Import progress</strong> to restore it.</p>
        </Block>
      </div>
    </div>
  )
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="card p-6"><h2 className="mb-3 text-xl font-bold">{title}</h2>{children}</section>
)
