import { useStore } from '../store'
import { TIERS } from '../data/content'
import { fmtMoney, progressOf } from '../utils'
import { Field, HelpTip, NumberInput } from './ui'

/** Starting guesses for "1 in N people buy", by how people buy. */
export const STARTING_GUESS = { page: 50, conversation: 10 } as const
const WEEKS = 8.5 // 60 days is about 8.5 weeks

type BuyMode = 'page' | 'conversation'

/**
 * Action 04 calculator. Values are saved in the action's fields like any other
 * answer; tier, price and baseline come from (and edit) the challenge profile.
 */
export default function NumberCalculator({ actionId }: { actionId: string }) {
  const { state, setAction, setProfile } = useStore()
  const { tier, offerPrice: price, baseline } = state.profile
  const f = progressOf(state, actionId).fields
  const num = (k: string) => { const v = Number(f[k]); return f[k] === '' || f[k] == null || Number.isNaN(v) ? null : v }
  const set = (k: string, v: number | string | null) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v == null ? '' : String(v) } }))

  const mode = (f.calcMode as BuyMode | undefined) || null
  const repeatSales = num('calcRepeatSales')
  const rateN = num('calcRateN') // "1 in N"
  const perWeekNow = num('calcNow')

  // Step 2: sales needed
  let salesNeeded: number | null = null
  if (tier === 1) salesNeeded = 1
  if (tier === 2) salesNeeded = repeatSales && repeatSales > 0 ? Math.ceil(repeatSales) : null
  if (tier === 3) salesNeeded = price && price > 0 ? Math.ceil(10_000 / price) : null

  // Step 5 results
  const ready = salesNeeded != null && rateN != null && rateN >= 1
  const peopleNeeded = ready ? Math.ceil(salesNeeded! * rateN!) : null
  const perWeekNeeded = peopleNeeded != null ? Math.ceil(peopleNeeded / WEEKS) : null
  const gap = perWeekNeeded != null && perWeekNow != null ? perWeekNeeded - perWeekNow : null

  // Tier 03 helper: work out the real rate from the last 60 days
  const t3Sales = num('calcT3Sales'), t3Seen = num('calcT3Seen')
  const t3Rate = t3Sales && t3Seen && t3Sales > 0 ? Math.max(1, Math.round(t3Seen / t3Sales)) : null

  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <Step n={1} title="Your starting point">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Your tier</p>
            <p className="mt-1.5 rounded-field bg-bg px-3.5 py-2.5">{tier ? `${TIERS[tier].short}: ${TIERS[tier].name}` : 'Choose a tier in Action 01'}</p>
          </div>
          <Field label="Your price" htmlFor="calc-price" help="Pulled from Action 03. Changing it here updates it everywhere.">
            <NumberInput id="calc-price" currency value={price} onChange={(v) => setProfile({ offerPrice: v })} />
          </Field>
          {tier === 3 && (
            <Field label="Your cash from the last 60 days" htmlFor="calc-base" help="Your baseline, pulled from Action 01.">
              <NumberInput id="calc-base" currency value={baseline} onChange={(v) => setProfile({ baseline: v })} />
            </Field>
          )}
        </div>
      </Step>

      {/* Step 2 */}
      <Step n={2} title="Your target">
        {!tier && <p className="text-muted">Choose your tier in Action 01 first.</p>}
        {tier === 2 && (
          <Field label="How many repeat sales do you want in 60 days?" htmlFor="calc-repeat" help="At least 3.">
            <NumberInput id="calc-repeat" value={repeatSales} onChange={(v) => set('calcRepeatSales', v)} placeholder="3" />
            {repeatSales != null && repeatSales < 3 && <p className="text-sm font-medium text-danger">Tier 02 needs at least 3 repeat sales.</p>}
          </Field>
        )}
        {tier && (
          <p className="mt-3 rounded-2xl bg-blush/50 p-4 text-lg font-semibold">
            {tier === 1 && <>You need 1 sale{price ? <> at {fmtMoney(price)}</> : null}.</>}
            {tier === 2 && (salesNeeded ? <>{salesNeeded} sales{price ? <> at {fmtMoney(price)} = {fmtMoney(salesNeeded * price)}</> : null}.</> : 'Enter how many repeat sales you want.')}
            {tier === 3 && (salesNeeded ? <>You need $10,000 more than last time{baseline != null ? <> ({fmtMoney(baseline + 10_000)} in total)</> : null}. At {fmtMoney(price)}, that is {salesNeeded} sales.</> : 'Enter your price to see how many sales you need.')}
          </p>
        )}
      </Step>

      {/* Step 3 */}
      <Step n={3} title="How do people buy from you?">
        <div role="radiogroup" aria-label="How people buy" className="grid gap-3 sm:grid-cols-2">
          {([['page', 'From a sales page or checkout', 'They land on a page and buy.'], ['conversation', 'From conversations', 'DMs, calls, emails or enquiries.']] as const).map(([id, title, sub]) => (
            <label key={id} className={`relative cursor-pointer rounded-2xl border-bold p-4 ${mode === id ? 'border-ink bg-blush shadow-card' : 'border-line bg-surface hover:border-ink/50'}`}>
              <input type="radio" name={`${actionId}-mode`} className="sr-only" checked={mode === id} onChange={() => set('calcMode', id)} />
              <span className="block font-bold">{title}</span>
              <span className="block text-sm text-muted">{sub}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 grid gap-2 rounded-2xl bg-bg p-4 text-sm sm:grid-cols-2">
          <p><span className="font-bold text-success">Counts:</span> people who land on your sales page or checkout, and DMs, calls or enquiries about your offer.</p>
          <p><span className="font-bold text-danger">Does not count:</span> views, likes, followers, story views or reach.</p>
        </div>
      </Step>

      {/* Step 4 */}
      <Step n={4} title="Your conversion rate">
        <p className="mb-3 text-muted">Conversion rate means how many people buy out of everyone who sees your offer. If 10 people ask and 1 buys, that’s 1 in 10.</p>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="calc-rate" className="text-lg font-semibold">1 in</label>
          <div className="w-28"><NumberInput id="calc-rate" value={rateN} onChange={(v) => set('calcRateN', v)} placeholder="10" /></div>
          <span className="text-muted">people buy{rateN && rateN >= 1 ? ` (${(100 / rateN).toFixed(rateN > 20 ? 1 : 0)}%)` : ''}</span>
          {mode && tier !== 3 && (
            <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => set('calcRateN', STARTING_GUESS[mode])}>
              Use the starting guess (1 in {STARTING_GUESS[mode]})
            </button>
          )}
        </div>
        {!mode && tier !== 3 && <p className="mt-2 text-sm text-muted">Pick how people buy in Step 3 to get a starting guess.</p>}
        {tier === 3 && (
          <div className="mt-4 rounded-2xl bg-cream/70 p-4">
            <p className="font-semibold">Tier 03: use your real rate, not a guess.</p>
            <p className="text-sm text-muted">Check your sales page analytics, or work it out from your last 60 days.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Sales in the last 60 days" htmlFor="calc-t3s"><NumberInput id="calc-t3s" value={t3Sales} onChange={(v) => set('calcT3Sales', v)} /></Field>
              <Field label="People who saw your offer" htmlFor="calc-t3p"><NumberInput id="calc-t3p" value={t3Seen} onChange={(v) => set('calcT3Seen', v)} /></Field>
            </div>
            {t3Rate && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p>That works out to <strong>1 in {t3Rate}</strong>.</p>
                <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => set('calcRateN', t3Rate)}>Use 1 in {t3Rate}</button>
              </div>
            )}
          </div>
        )}
      </Step>

      {/* Step 5 */}
      <Step n={5} title="Where you are now">
        <Field label="How many people see your offer each week right now?" htmlFor="calc-now" help="Sales page visits or real conversations. Not views.">
          <NumberInput id="calc-now" value={perWeekNow} onChange={(v) => set('calcNow', v)} placeholder="0" />
        </Field>
      </Step>

      {/* Results */}
      <section aria-live="polite" className="rounded-card border-bold border-ink bg-ink p-6 text-surface shadow-card">
        <p className="pixel text-xl text-blush">YOUR NUMBERS</p>
        {!ready ? (
          <p className="mt-2 text-lg opacity-90">Fill in your target and conversion rate to see your numbers.</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Big n={salesNeeded!} label="sales needed" />
              <Big n={peopleNeeded!} label="people need to see it" />
              <Big n={perWeekNeeded!} label="a week" />
              <Big n={gap == null ? '—' : Math.max(0, gap)} label="more each week" />
            </div>
            <p className="mt-5 text-lg leading-relaxed">
              To hit your milestone, you need <b>{salesNeeded}</b> {salesNeeded === 1 ? 'sale' : 'sales'}. At your rate, that means <b>{peopleNeeded}</b> people need to see your offer. That is <b>{perWeekNeeded}</b> a week.
              {perWeekNow != null && gap != null && gap > 0 && <> You have <b>{perWeekNow}</b> a week now. You need <b>{gap}</b> more each week.</>}
            </p>
            {perWeekNow == null && <p className="mt-2 opacity-80">Add how many people see your offer now (Step 5) to see your gap.</p>}
            {gap != null && gap <= 0 && (
              <p className="mt-3 rounded-xl bg-surface/10 p-3 font-semibold">You already have enough people seeing your offer. Your focus is getting more of them to buy.</p>
            )}
          </>
        )}
      </section>
      <p className="text-sm text-muted">Your numbers save to this browser only.</p>
    </div>
  )
}

function Step({ n, title, tip, children }: { n: number; title: string; tip?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-bold border-ink/15 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="pixel flex h-8 w-8 items-center justify-center rounded-full bg-ink text-lg text-surface">{n}</span>
        <h4 className="text-lg font-bold">{title}</h4>
        {tip && <HelpTip label={title} text={tip} />}
      </div>
      {children}
    </section>
  )
}

const Big = ({ n, label }: { n: number | string; label: string }) => (
  <div className="rounded-xl bg-surface/10 p-3"><p className="pixel text-4xl leading-none">{n}</p><p className="mt-1 text-sm opacity-80">{label}</p></div>
)
