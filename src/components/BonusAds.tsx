import { ArrowRight, Lock, Maximize2, Minimize2, Printer, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { JOIN_WMHQ_URL } from '../data/content'
import { useStore } from '../store'
import { fmtMoney, progressOf } from '../utils'
import { Field, NumberInput, SaveIndicator, TextInput } from './ui'

/** Bonus card: not a numbered action, no due date or status, and not counted in progress. */
export const BONUS_ID = 'bonus-ads'
const ASK_JP_URL = 'https://www.jessicapinili.com/products/communities/v2/womanmasteryhq'

const READINESS = [
  'My offer has sold at least 5 times',
  'I know my real conversion rate (from Action 04)',
  'My sales path tested clean (from Action 07)',
  'My bottleneck is traffic, not conversion (from Action 14)',
  'I can spend money on ads for at least 30 days without needing it back straight away',
]

const LINKS = [
  { label: 'Meta Business Suite', url: 'https://business.facebook.com', desc: 'Your home base. Connect your Facebook page, Instagram and ad account here.' },
  { label: 'Ads Manager', url: 'https://adsmanager.facebook.com', desc: 'Where you create, run and check your ads.' },
  { label: 'Events Manager (Meta Pixel)', url: 'https://business.facebook.com/events_manager', desc: 'Set up the pixel on your sales page or checkout so Meta can see who buys.' },
  { label: 'Meta Ad Library', url: 'https://www.facebook.com/ads/library', desc: 'See what ads others in your industry are running right now. Research only, do not copy.' },
  { label: 'Meta Blueprint (free training)', url: 'https://www.facebook.com/business/learn', desc: 'Meta’s free lessons if you want to learn the basics.' },
]

const RECS = [
  { title: 'Advertise what already works.', body: 'Use your best-performing post or message from Action 15. Do not make brand new content for ads.' },
  { title: 'Send ads to the right place.', body: 'Lower price or a product: send people straight to buy. Higher price or a service: send them to your free way in from Action 06 first.' },
  { title: 'Start small.', body: 'Pick a daily budget you can keep running for 30 days without stress. Small and steady beats big and short.' },
  { title: 'Test 2 to 3 versions.', body: 'Same offer, different hooks or images. Let the numbers pick the winner.' },
  { title: 'Don’t touch it for 7 days.', body: 'Changing ads every day stops Meta from learning. Check once a week.' },
  { title: 'Watch one number.', body: 'Track cost per lead or cost per sale, not likes or reach. If one sale costs less than you make from it, keep going. If it costs more, fix the ad or the offer before spending more.' },
]

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--c-bonus-accent)]">{children}</p>
)

export function BonusCard({ onOpen }: { onOpen: () => void }) {
  const { state } = useStore()
  return (
    <article className="bonus-card rounded-2xl border-bold border-[var(--c-bonus-accent)] bg-[var(--c-bonus-bg)] p-4">
      <Eyebrow>Bonus · Tier 03</Eyebrow>
      <h3 className="mt-1.5 text-lg font-bold leading-snug text-ink">Meta Ads: After the 60</h3>
      <p className="mt-1 text-sm text-ink/80">Ready to grow beyond organic? Check if ads are right for you yet, and how to start without wasting money.</p>
      {state.profile.tier !== 3 && <p className="mt-2 rounded-xl bg-surface/70 p-2.5 text-xs font-medium text-ink">Built for Tier 03. Hit your milestone first, then come back to this.</p>}
      <button onClick={onOpen} className="mt-3 inline-flex items-center gap-1 rounded-pill text-sm font-bold text-ink underline-offset-4 hover:underline">
        Open bonus <ArrowRight size={15} /><span className="sr-only">: Meta Ads, After the 60</span>
      </button>
    </article>
  )
}

export function BonusDrawer({ onClose }: { onClose: () => void }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, BONUS_ID).fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const set = (k: string, v: string) => setAction(BONUS_ID, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const ticked = READINESS.filter((_, i) => str(`ready${i + 1}`) === 'yes').length
  const ready = ticked === READINESS.length
  const daily = str('daily') ? Number(str('daily')) : null
  const price = state.profile.offerPrice
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(() => { try { return localStorage.getItem('wmhq-drawer-expanded') === '1' } catch { return false } })

  useEffect(() => { ref.current?.querySelector<HTMLElement>('h2')?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Locked sections are greyed out and removed from keyboard and screen-reader focus.
  const lockProps = ready ? {} : { inert: '' as unknown as boolean, 'aria-disabled': true }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="bonus-title"
        className={`print-area animate-slidein h-full w-full overflow-y-auto bg-surface ${expanded ? 'max-w-none' : 'max-w-2xl border-l-bold border-ink sm:rounded-l-card'}`}>
        <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur sm:px-8">
          <SaveIndicator manual />
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => window.print()} className="rounded-full p-2 hover:bg-bg" aria-label="Print this bonus" title="Print"><Printer size={20} /></button>
            <button onClick={() => setExpanded((v) => { try { localStorage.setItem('wmhq-drawer-expanded', v ? '0' : '1') } catch { /* ignore */ } return !v })}
              className="hidden rounded-full p-2 hover:bg-bg sm:inline-flex" aria-pressed={expanded} aria-label={expanded ? 'Show as side panel' : 'Expand to full screen'}>
              {expanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-bg" aria-label="Close bonus"><X size={22} /></button>
          </div>
        </div>

        <div className={`space-y-8 px-5 pb-10 pt-6 sm:px-8 ${expanded ? 'mx-auto max-w-3xl' : ''}`}>
          {/* 1 */}
          <header className="bonus-card rounded-2xl bg-[var(--c-bonus-bg)] p-5">
            <Eyebrow>Bonus · Tier 03</Eyebrow>
            <h2 id="bonus-title" tabIndex={-1} className="mt-1 text-3xl font-bold text-ink outline-none sm:text-4xl">Meta Ads: After the 60</h2>
            <p className="mt-2 text-lg font-semibold text-ink">You know if ads are right for you yet, and how to start small without losing money.</p>
            {state.profile.tier !== 3 && <p className="mt-3 rounded-xl bg-surface/70 p-3 text-sm font-medium">Built for Tier 03. Hit your milestone first, then come back to this.</p>}
          </header>

          {/* 2 */}
          <section>
            <h3 className="text-xl font-bold">Why this matters</h3>
            <p className="mt-2 text-muted">Ads do not fix a business. They make more of what is already happening. If your offer sells and your sales path works, ads send more people through it. If something is broken, ads just pay to send more people into the problem. That is why this comes after the challenge, not during it. Two weeks is not enough time to set up ads, learn from them, and see real results. This is your plan for the next 60 days.</p>
          </section>

          {/* 3 */}
          <section>
            <Eyebrow>Readiness check</Eyebrow>
            <h3 className="text-xl font-bold">Are ads right for you yet?</h3>
            <div className="mt-3 divide-y divide-line">
              {READINESS.map((r, i) => {
                const id = `bonus-r${i + 1}`
                const on = str(`ready${i + 1}`) === 'yes'
                return (
                  <label key={r} htmlFor={id} className="flex cursor-pointer items-start gap-3 py-2.5">
                    <input id={id} type="checkbox" className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--c-ink)]" checked={on} onChange={(e) => set(`ready${i + 1}`, e.target.checked ? 'yes' : '')} />
                    <span className={on ? 'font-medium' : ''}>{r}</span>
                  </label>
                )
              })}
            </div>
            <div aria-live="polite" className="mt-4">
              {ready
                ? <div className="rounded-2xl bg-ink p-5 text-surface"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blush">Ready</p><p className="mt-1 text-lg font-semibold">You're ready. Start small, test, then grow.</p></div>
                : <div className="rounded-2xl bg-blush/70 p-5"><p className="text-lg font-semibold">Not yet. Fix your bottleneck first. Ads will make a problem bigger, not smaller.</p><p className="mt-1 text-sm text-muted">{ticked} of {READINESS.length} ticked.</p></div>}
            </div>
          </section>

          {/* 4 to 6: locked until ready */}
          <div className="relative">
            {!ready && <p className="no-print mb-3 flex items-center gap-2 rounded-xl bg-bg p-3 text-sm font-semibold"><Lock size={16} /> Tick all 5 to unlock the next three sections.</p>}
            <div {...lockProps} className={`space-y-8 ${ready ? '' : 'pointer-events-none select-none opacity-40 grayscale'}`}>
              {/* 4 */}
              <section>
                <h3 className="text-xl font-bold">Set up your accounts</h3>
                <ul className="mt-3 space-y-3">
                  {LINKS.map((l) => (
                    <li key={l.url} className="rounded-2xl border-bold border-line p-4">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn-underline inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4">{l.label} <ArrowRight size={15} /></a>
                      <p className="mt-1 text-sm text-muted">{l.desc}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 5 */}
              <section>
                <h3 className="text-xl font-bold">Our recommendations</h3>
                <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                  {RECS.map((r, i) => (
                    <li key={r.title} className="rounded-2xl bg-cream/70 p-4">
                      <p className="font-bold"><span className="mr-2 text-[var(--c-bonus-accent)]">{i + 1}.</span>{r.title}</p>
                      <p className="mt-1 text-sm text-muted">{r.body}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {/* 6 */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold">Your ads plan</h3>
                <Field label="What will you advertise?" htmlFor="bonus-what" help="Your best post or message from Action 15.">
                  <TextInput id="bonus-what" value={str('what')} onChange={(v) => set('what', v)} />
                </Field>
                <Field label="Where will the ad send people?" htmlFor="bonus-where">
                  <select id="bonus-where" className="field" value={str('where')} onChange={(e) => set('where', e.target.value)}>
                    <option value="">Choose one</option><option>Straight to buy or book</option><option>Free way in first</option>
                  </select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Daily budget" htmlFor="bonus-daily"><NumberInput id="bonus-daily" currency value={daily} onChange={(v) => set('daily', v == null ? '' : String(v))} /></Field>
                  <Field label="Start date" htmlFor="bonus-start"><TextInput id="bonus-start" type="date" value={str('start')} onChange={(v) => set('start', v)} /></Field>
                </div>
                {daily != null && daily > 0 && <p className="rounded-2xl bg-[var(--c-bonus-bg)] p-4 font-semibold">30-day test budget: {fmtMoney(daily * 30)}</p>}
                <Field label="The number you will watch" htmlFor="bonus-metric">
                  <select id="bonus-metric" className="field" value={str('metric')} onChange={(e) => set('metric', e.target.value)}>
                    <option value="">Choose one</option><option>Cost per lead</option><option>Cost per sale</option>
                  </select>
                </Field>
                <div>
                  <p className="text-sm font-semibold">Your break-even</p>
                  <p className="mt-1.5 rounded-2xl bg-[var(--c-bonus-bg)] p-4 font-semibold">
                    {price ? <>One sale must cost less than {fmtMoney(price)} for ads to pay for themselves.</> : 'Add your offer price in Action 03 to see your break-even.'}
                  </p>
                </div>
                <p className="text-sm text-muted">Your plan saves to this browser only.</p>
              </section>
            </div>
          </div>

          {/* 7 */}
          <section>
            <h3 className="text-xl font-bold">Get help with this</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-bold border-ink bg-blush/40 p-4">
                <p className="label-caps !text-ink">In WMHQ</p>
                <p className="mt-2">Bring your ads plan to Ask JP before you spend a dollar.</p>
                <a href={ASK_JP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 !px-4 !py-2">Submit to Ask JP</a>
              </div>
              <div className="rounded-2xl border-bold border-ink/20 bg-surface p-4">
                <p className="label-caps">Not in WMHQ yet</p>
                <p className="mt-2">Ads make good offers better and weak offers more expensive. Inside WMHQ, you get support to make sure your offer and path are ready before you spend.</p>
                <a href={JOIN_WMHQ_URL} target="_blank" rel="noopener noreferrer" className="btn-underline mt-3 inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4">Join WMHQ <ArrowRight size={15} /></a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
