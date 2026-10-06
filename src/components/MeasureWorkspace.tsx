import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { challengeDay, fmtMoney, progressOf, scoreTotals } from '../utils'
import { computeNumbers } from './NumberCalculator'
import { Field, NumberInput, TextArea } from './ui'

const STEPS = [
  { key: 'saw', label: 'Saw your offer', hint: 'Sales page visits, people you messaged, or people who saw your offer post. Not views or likes.' },
  { key: 'raised', label: 'Raised their hand', hint: 'DMs, enquiries, opt-ins, bookings, or added to cart.' },
  { key: 'convo', label: 'Had a conversation or visited your checkout' },
  { key: 'asked', label: 'You asked for the sale' },
  { key: 'bought', label: 'Bought' },
] as const
const SHORT = ['Saw', 'Raised hand', 'Conversation', 'Asked', 'Bought']
const PLACES = ['Instagram', 'TikTok', 'Email', 'DMs', 'Referral', 'Past buyers', 'In person', 'Website', 'Other']

export default function MeasureWorkspace({ actionId }: { actionId: string }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, actionId).fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const num = (k: string) => (str(k) !== '' ? Number(str(k)) : null)
  const set = (k: string, v: string) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const { tier, baseline, offerPrice: price } = state.profile
  const plan = computeNumbers(state)
  const score = scoreTotals(state)

  // Part 1: plan vs actual (actual sales/cash default to the CEO Scorecard)
  const actualSales = num('actualSales') ?? score.sales
  const actualCash = num('actualCash') ?? score.cash
  const plannedSales = plan.salesNeeded
  const plannedCash = tier === 3 ? (baseline ?? 0) + 10_000 : plannedSales && price ? plannedSales * price : null
  const realRateN = num('bought') && num('saw') ? Math.round(num('saw')! / num('bought')!) : null
  // On track = at least the share of the target that matches how far through the 60 days she is.
  const day = Math.min(60, Math.max(1, challengeDay(state)))
  const onTrack = tier === 3 ? actualCash >= ((baseline ?? 0) + 10_000) * (day / 60)
    : plannedSales ? actualSales >= Math.ceil(plannedSales * (day / 60)) : null

  // Part 2: funnel
  const vals = STEPS.map((s) => num(s.key))
  const rates = vals.slice(1).map((v, i) => (v != null && vals[i] ? Math.min(100, Math.round((v / vals[i]!) * 100)) : null))
  const known = rates.map((r, i) => ({ r, i })).filter((x) => x.r != null) as { r: number; i: number }[]
  const lowest = known.length ? known.reduce((a, b) => (b.r < a.r ? b : a)) : null
  const dropLabel = lowest ? `${SHORT[lowest.i]} → ${SHORT[lowest.i + 1]}` : null
  const notAsking = vals[2] != null && vals[3] != null && vals[2]! > 0 && vals[3]! < vals[2]! * 0.6

  const pattern = (k: string) => str(k) || '…'

  return (
    <div className="space-y-8">
      {/* Part 1 */}
      <section>
        <p className="pixel text-xl text-accent">YOUR SCORECARD</p>
        <h4 className="text-2xl font-bold">Plan vs what happened.</h4>
        <div className="mt-3 overflow-x-auto rounded-2xl border-bold border-line">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="bg-bg"><tr><th className="px-3 py-2">&nbsp;</th><th className="px-3 py-2">Plan</th><th className="px-3 py-2">What happened</th></tr></thead>
            <tbody>
              <tr className="border-t border-line">
                <th className="px-3 py-2 font-semibold">Sales</th>
                <td className="px-3 py-2">{plannedSales ?? <span className="text-muted">Set in Action 04</span>}</td>
                <td className="px-3 py-2"><div className="w-28"><NumberInput id="ms-sales" value={actualSales} onChange={(v) => set('actualSales', v == null ? '' : String(v))} /></div></td>
              </tr>
              <tr className="border-t border-line">
                <th className="px-3 py-2 font-semibold">{tier === 3 ? 'Cash collected' : 'Cash'}</th>
                <td className="px-3 py-2">{plannedCash != null ? fmtMoney(plannedCash) : <span className="text-muted">Needs your price and target</span>}{tier === 3 && <span className="block text-xs text-muted">Baseline + $10K</span>}</td>
                <td className="px-3 py-2"><div className="w-32"><NumberInput id="ms-cash" currency value={actualCash} onChange={(v) => set('actualCash', v == null ? '' : String(v))} /></div></td>
              </tr>
              <tr className="border-t border-line">
                <th className="px-3 py-2 font-semibold">People seeing your offer each week</th>
                <td className="px-3 py-2">{plan.perWeekNeeded ?? <span className="text-muted">Set in Action 04</span>}</td>
                <td className="px-3 py-2"><div className="w-28"><NumberInput id="ms-week" value={num('actualWeekly')} onChange={(v) => set('actualWeekly', v == null ? '' : String(v))} /></div></td>
              </tr>
              <tr className="border-t border-line">
                <th className="px-3 py-2 font-semibold">Conversion rate</th>
                <td className="px-3 py-2">{plan.rateN ? `1 in ${plan.rateN}` : <span className="text-muted">Set in Action 04</span>}</td>
                <td className="px-3 py-2">{realRateN ? `1 in ${realRateN}` : <span className="text-muted">Fills in from your sales steps below</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Sales and cash start from your CEO Scorecard totals. Change them if they’re not right.</p>
        {onTrack != null && (plannedSales || tier === 3) && (
          <p aria-live="polite" className={`mt-3 rounded-2xl p-4 text-lg font-semibold ${onTrack ? 'bg-success-soft text-success' : 'bg-highlight/70'}`}>
            {onTrack ? 'You’re on track. Action 15 will help you do more of what’s working.' : 'You’re behind. That’s useful information. Let’s find out where.'}
          </p>
        )}
      </section>

      {/* Part 2 */}
      <section className="space-y-4">
        <div><h4 className="text-2xl font-bold">Where did people drop off?</h4><p className="text-muted">Fill in each step. Estimates are fine if you don’t have exact numbers.</p></div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.key}>
              <Field label={`${i + 1}. ${s.label}`} htmlFor={`ms-${s.key}`} help={'hint' in s ? s.hint : undefined}>
                <NumberInput id={`ms-${s.key}`} value={vals[i]} onChange={(v) => set(s.key, v == null ? '' : String(v))} />
              </Field>
            </li>
          ))}
        </ol>
        <div className="space-y-2 rounded-2xl bg-bg p-4">
          {rates.map((r, i) => (
            <div key={i} className={`rounded-xl p-2 ${lowest?.i === i ? 'bg-danger/10' : ''}`}>
              <div className="flex justify-between text-sm"><span className={lowest?.i === i ? 'font-bold text-danger' : 'font-semibold'}>{SHORT[i]} → {SHORT[i + 1]}</span><span className="font-bold">{r == null ? '—' : `${r}%`}</span></div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-pill bg-soft/70"><div className={`h-full rounded-pill ${lowest?.i === i ? 'bg-danger' : 'bg-ink'}`} style={{ width: `${r ?? 0}%` }} /></div>
            </div>
          ))}
        </div>
        {lowest && <p className="rounded-2xl bg-danger/10 p-4 font-semibold text-danger">Your biggest drop-off: {dropLabel} ({lowest.r}%). <span className="text-ink">This is where you’ll start in Action 14.</span></p>}
        {notAsking && <p className="rounded-2xl bg-highlight/70 p-4 font-semibold">You’re having conversations but not asking. Check your pattern from Action 10.</p>}
      </section>

      {/* Part 3 */}
      <section className="space-y-4">
        <div><h4 className="text-lg font-bold">What worked best</h4><p className="text-sm text-muted">Don’t skip this. You’ll use it in Action 15 to do more of what works.</p></div>
        <Field label="The post, message or content that got the most response" htmlFor="ms-best"><TextArea id="ms-best" rows={2} value={str('bestContent')} onChange={(v) => set('bestContent', v)} /></Field>
        <Field label="The place most buyers came from" htmlFor="ms-place">
          <select id="ms-place" className="field" value={str('bestPlace')} onChange={(e) => set('bestPlace', e.target.value)}>
            <option value="">Choose one</option>{PLACES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="The follow-up or line that got the best reply" htmlFor="ms-line"><TextArea id="ms-line" rows={2} value={str('bestLine')} onChange={(v) => set('bestLine', v)} /></Field>
      </section>

      {/* Part 4 */}
      <section className="space-y-4">
        <div>
          <h4 className="text-2xl font-bold">Numbers tell you where. People tell you why.</h4>
          <p className="mt-1 text-sm text-muted">Keep it short and casual. Example: “Quick question, no sales pitch. What stopped you from going ahead? It helps me make it better.”{tier === 1 && ' Tier 01, if you have no buyers yet, ask 6 non-buyers instead.'}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border-bold border-ink/15 p-4">
            <p className="font-bold">Ask 3 buyers: “What made you decide to buy?”</p>
            {[1, 2, 3].map((n) => <Field key={n} label={`Buyer ${n}`} htmlFor={`ms-b${n}`}><TextArea id={`ms-b${n}`} rows={2} value={str(`buyer${n}`)} onChange={(v) => set(`buyer${n}`, v)} /></Field>)}
          </div>
          <div className="space-y-3 rounded-2xl border-bold border-ink/15 p-4">
            <p className="font-bold">Ask 3 non-buyers: “What stopped you from going ahead?”</p>
            {(tier === 1 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3]).map((n) => (
              <Field key={n} label={n > 3 ? `Non-buyer ${n} (no buyers yet)` : `Non-buyer ${n}`} htmlFor={`ms-n${n}`}><TextArea id={`ms-n${n}`} rows={2} value={str(`non${n}`)} onChange={(v) => set(`non${n}`, v)} /></Field>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Why people bought: the pattern" htmlFor="ms-pb" help="Did more than one person say the same thing? That’s your answer."><TextArea id="ms-pb" rows={2} value={str('patternBought')} onChange={(v) => set('patternBought', v)} /></Field>
          <Field label="What stopped people: the pattern" htmlFor="ms-ps" help="Did more than one person say the same thing? That’s your answer."><TextArea id="ms-ps" rows={2} value={str('patternStopped')} onChange={(v) => set('patternStopped', v)} /></Field>
        </div>
      </section>

      {/* Part 5 */}
      <Summary lines={[
        `Milestone: ${onTrack == null ? '…' : onTrack ? 'on track' : 'behind'}`,
        `Sales: ${actualSales} of ${plannedSales ?? '…'}`,
        `Biggest drop-off: ${lowest ? `${dropLabel} (${lowest.r}%)` : '…'}`,
        `What worked best: ${pattern('bestContent')}`,
        `Why people bought: ${pattern('patternBought')}`,
        `What stopped people: ${pattern('patternStopped')}`,
      ]} />
    </div>
  )
}

function Summary({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false)
  return (
    <section className="rounded-card border-bold border-ink bg-ink p-6 text-surface shadow-card">
      <p className="pixel text-xl text-blush">YOUR SUMMARY</p>
      <div className="mt-2 space-y-1.5 text-lg">{lines.map((l) => <p key={l}>{l}</p>)}</div>
      <button type="button" className="btn mt-4 bg-surface !px-4 !py-2 text-ink" onClick={async () => {
        try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* blocked */ }
      }}>{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy summary</>}</button>
    </section>
  )
}
