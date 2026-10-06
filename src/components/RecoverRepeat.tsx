import { Check, Copy, X } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { fmtMoney, progressOf, scoreTotals } from '../utils'
import { Field, NumberInput, TextArea } from './ui'

type Biz = 'Product' | 'Service' | 'Info'
const BIZ: { id: Biz; desc: string }[] = [
  { id: 'Product', desc: 'Physical or digital items people buy.' },
  { id: 'Service', desc: 'Work you do for or with your clients.' },
  { id: 'Info', desc: 'Courses, programs or memberships.' },
]

const NOT_YET_HINT: Record<Biz, string> = {
  Product: 'People who left items in their cart, asked about price, or browsed and didn’t buy.',
  Service: 'People who enquired, booked a call, or said “not yet.”',
  Info: 'People who took your free way in but didn’t buy.',
}
const MESSAGES: { title: string; when: string; samples: Record<Biz, string>; hint?: string; extra?: Partial<Record<Biz, string>> }[] = [
  { title: 'The check-in', when: '2 to 3 days after', samples: {
    Product: 'Hey, I noticed you were looking at the [product]. Any questions I can help with?',
    Service: 'Hey, just checking in. Did you still want to chat about [offer]?',
    Info: 'Did you get a chance to use [free way in]? How did you go?' } },
  { title: 'The proof', when: '3 to 5 days later', hint: 'No results yet? Share what’s included, or answer their biggest worry from Action 11.', samples: {
    Product: 'Thought you’d like to see this. [Customer] said [review].',
    Service: 'Thought you’d like to see this. [Client] just [result].',
    Info: 'One of my students just [result] after finishing [course].' } },
  { title: 'Close the loop', when: '5 to 7 days later', hint: 'This one often gets the most replies. People respond when they feel the door closing.',
    samples: { Product: 'I’ll stop following up so I’m not filling your inbox. If you want it later, just reply here.', Service: 'I’ll stop following up so I’m not filling your inbox. If you want it later, just reply here.', Info: 'I’ll stop following up so I’m not filling your inbox. If you want it later, just reply here.' },
    extra: { Product: 'Just a heads up, [product] is almost sold out. (Only if true.)' } },
]
const PROOF_ASK: Record<Biz, string> = {
  Product: 'Loving your [product]? Would you mind leaving a quick review or sending a photo?',
  Service: 'I’m so glad it’s helping. Would you answer 3 quick questions so I can share your result?',
  Info: 'Congrats on finishing! Would you answer 3 quick questions about what changed?',
}
const NEXT_IDEAS: Record<Biz, string> = {
  Product: 'A refill or reorder, a bundle, a bigger size, or a gift for someone else.',
  Service: 'A rebooking, an ongoing or monthly plan, or the next package up.',
  Info: 'The next course or level, a group program, a membership, or 1:1 support.',
}
const REFERRAL: Record<Biz, string> = {
  Product: 'Know someone who’d love this? Here’s a [discount or gift] for them.',
  Service: 'Do you know anyone else dealing with [problem]? I’d love to help them too.',
  Info: 'Know someone who needs this? Send them my way.',
}

interface Row { name: string; ticks: boolean[] }
const parseRows = (raw: unknown, n: number): Row[] => (Array.isArray(raw) ? raw : []).map((x) => {
  try { const r = JSON.parse(x); return { name: r.name ?? '', ticks: Array.from({ length: n }, (_, i) => !!r.ticks?.[i]) } } catch { return { name: String(x), ticks: Array(n).fill(false) } }
})

export default function RecoverRepeat({ actionId }: { actionId: string }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, actionId).fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const set = (k: string, v: string | string[]) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const num = (k: string) => (str(k) ? Number(str(k)) : null)
  const { tier, baseline } = state.profile
  const biz = (str('biz') as Biz) || null

  // Part 1: sales check
  const sales = num('sales') ?? 0
  const cash = num('cash') ?? 0
  const openNotYets = num('openNotYets') ?? 0
  const cashTarget = (baseline ?? 0) + 10_000
  const target = tier === 1 ? 1 : tier === 2 ? 3 : null
  const progress = tier === 3 ? cash / cashTarget : target ? sales / target : 0
  const touched = str('sales') !== '' || str('cash') !== '' || str('openNotYets') !== ''
  const status = !tier || !touched ? null
    : progress >= 1 ? 'hit'
    : progress >= 0.6 || (openNotYets > 0 && (tier !== 3 ? (target! - sales) <= openNotYets : false)) ? 'close' : 'far'
  const scorecard = scoreTotals(state)

  const notYets = parseRows(f.notYets, 3)
  const buyers = parseRows(f.buyers, 4)
  const count = (rows: Row[], i: number) => rows.filter((r) => r.ticks[i]).length

  return (
    <div className="space-y-8">
      {/* Part 1 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">SALES CHECK</p><h4 className="text-2xl font-bold">Where are you right now?</h4></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Sales so far" htmlFor="rr-sales"><NumberInput id="rr-sales" value={num('sales')} onChange={(v) => set('sales', v == null ? '' : String(v))} /></Field>
          {tier === 3 && <Field label="Cash collected so far" htmlFor="rr-cash" help={`Your target is ${fmtMoney(cashTarget)}: your baseline from Action 01 plus $10,000.`}><NumberInput id="rr-cash" currency value={num('cash')} onChange={(v) => set('cash', v == null ? '' : String(v))} /></Field>}
          <Field label="“Not yets” still open" htmlFor="rr-open"><NumberInput id="rr-open" value={num('openNotYets')} onChange={(v) => set('openNotYets', v == null ? '' : String(v))} /></Field>
        </div>
        {(scorecard.sales > 0 || scorecard.cash > 0) && (
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, sales: String(scorecard.sales), ...(tier === 3 ? { cash: String(scorecard.cash) } : {}) } }))}>
            Use my CEO Scorecard totals ({scorecard.sales} sales{tier === 3 ? `, ${fmtMoney(scorecard.cash)}` : ''})
          </button>
        )}
        {status && (
          <p aria-live="polite" className={`rounded-2xl p-4 text-lg font-semibold ${status === 'hit' ? 'bg-success-soft text-success' : status === 'close' ? 'bg-blush/60' : 'bg-highlight/70'}`}>
            {status === 'hit' && 'You’ve hit it. Now make it repeatable. Focus on Repeat.'}
            {status === 'close' && 'You’re close. Your next sale is probably in your “not yet” list. Start with Recover.'}
            {status === 'far' && 'Don’t slow down. Follow up with everyone, and go back to your warm list from Action 09.'}
          </p>
        )}
      </section>

      {/* Part 2 */}
      <section>
        <h4 className="text-lg font-bold">Choose your business type</h4>
        <p className="text-sm text-muted">Pick what you are selling in this challenge. This changes the examples below to fit your business.</p>
        <div role="radiogroup" aria-label="Business type" className="mt-3 grid gap-2 sm:grid-cols-3">
          {BIZ.map((b) => (
            <label key={b.id} className={`relative cursor-pointer rounded-2xl border-bold p-4 ${biz === b.id ? 'border-ink bg-blush shadow-card' : 'border-line bg-surface hover:border-ink/50'}`}>
              <input type="radio" className="sr-only" name={`${actionId}-biz`} checked={biz === b.id} onChange={() => set('biz', b.id)} />
              <span className="block font-bold">{b.id}</span><span className="block text-sm text-muted">{b.desc}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Part 3 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">RECOVER</p><h4 className="text-2xl font-bold">Silence is not a no.</h4></div>
        <div>
          <p className="font-semibold">Your “not yet” list</p>
          <p className="mb-2 text-sm text-muted">{biz ? NOT_YET_HINT[biz] : 'Everyone who said “not yet” or went quiet.'} First names or initials only.</p>
          <TickTable rows={notYets} cols={['Follow-up 1', 'Follow-up 2', 'Follow-up 3']} onChange={(r) => set('notYets', r.map((x) => JSON.stringify(x)))} />
        </div>
        <p className="font-semibold">Your 3 follow-up messages</p>
        {MESSAGES.map((m, i) => {
          const key = `msg${i + 1}`
          const sample = biz ? m.samples[biz] : null
          return (
            <div key={m.title} className="rounded-2xl border-bold border-ink/15 bg-surface p-4">
              <p className="font-bold"><span className="pixel mr-2 text-lg text-accent">{i + 1}</span>{m.title} <span className="font-normal text-muted">({m.when})</span></p>
              {sample ? <p className="mt-2 rounded-xl bg-bg p-3 text-sm"><span className="font-semibold">Sample:</span> “{sample}”</p> : <p className="mt-2 text-sm text-muted">Choose your business type above to see a sample.</p>}
              {biz && m.extra?.[biz] && <p className="mt-1 rounded-xl bg-bg p-3 text-sm"><span className="font-semibold">Product extra:</span> “{m.extra[biz]}”</p>}
              {m.hint && <p className="mt-2 text-sm text-muted">{m.hint}</p>}
              <div className="mt-3 space-y-2">
                <Field label="Your message" htmlFor={`rr-${key}`}><TextArea id={`rr-${key}`} rows={2} value={str(key)} onChange={(v) => set(key, v)} /></Field>
                {sample && !str(key) && <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => set(key, sample)}>Start from the sample</button>}
              </div>
            </div>
          )
        })}
      </section>

      {/* Part 4 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">REPEAT</p><h4 className="text-2xl font-bold">Your next sale starts with your last one.</h4></div>
        <div>
          <p className="font-semibold">Your buyers list</p>
          <p className="mb-2 text-sm text-muted">First names or initials only.</p>
          <TickTable rows={buyers} cols={['Review asked', 'Review received', 'Next purchase offered', 'Referral asked']} onChange={(r) => set('buyers', r.map((x) => JSON.stringify(x)))} />
        </div>

        <div className="rounded-2xl border-bold border-ink/15 bg-surface p-4">
          <p className="font-bold">Ask for proof</p>
          {biz ? <p className="mt-2 rounded-xl bg-bg p-3 text-sm"><span className="font-semibold">Sample:</span> “{PROOF_ASK[biz]}”</p> : <p className="mt-2 text-sm text-muted">Choose your business type to see a sample.</p>}
          {(biz === 'Service' || biz === 'Info') && (
            <ol className="mt-2 list-decimal pl-5 text-sm"><li>What was going on before?</li><li>What changed after?</li><li>Who would you recommend this to?</li></ol>
          )}
          <div className="mt-3 space-y-2">
            <Field label="Your message" htmlFor="rr-proof"><TextArea id="rr-proof" rows={2} value={str('proofMsg')} onChange={(v) => set('proofMsg', v)} /></Field>
            {biz && !str('proofMsg') && <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => set('proofMsg', PROOF_ASK[biz])}>Start from the sample</button>}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border-bold border-ink/15 bg-surface p-4">
          <p className="font-bold">Their next purchase</p>
          {biz && <p className="text-sm text-muted"><span className="font-semibold text-ink">Ideas for {biz.toLowerCase()} businesses:</span> {NEXT_IDEAS[biz]}</p>}
          <Field label="What could they buy next?" htmlFor="rr-next"><TextArea id="rr-next" rows={2} value={str('nextBuy')} onChange={(v) => set('nextBuy', v)} /></Field>
          <Field label="Your message" htmlFor="rr-nextmsg" help="The best time to offer the next purchase is right when they get their result, not months later.">
            <TextArea id="rr-nextmsg" rows={2} value={str('nextMsg')} onChange={(v) => set('nextMsg', v)} />
          </Field>
        </div>

        <div className="rounded-2xl border-bold border-ink/15 bg-surface p-4">
          <p className="font-bold">Ask for a referral</p>
          {biz ? <p className="mt-2 rounded-xl bg-bg p-3 text-sm"><span className="font-semibold">Sample:</span> “{REFERRAL[biz]}”</p> : <p className="mt-2 text-sm text-muted">Choose your business type to see a sample.</p>}
          <div className="mt-3 space-y-2">
            <Field label="Your message" htmlFor="rr-ref"><TextArea id="rr-ref" rows={2} value={str('refMsg')} onChange={(v) => set('refMsg', v)} /></Field>
            {biz && !str('refMsg') && <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => set('refMsg', REFERRAL[biz])}>Start from the sample</button>}
          </div>
        </div>
      </section>

      {/* Part 5 */}
      <Summary lines={[
        `Sales so far: ${str('sales') || '0'}`,
        `Followed up: ${notYets.filter((r) => r.ticks.some(Boolean)).length} people`,
        `Buyers: ${buyers.filter((r) => r.name.trim()).length}`,
        `Reviews or testimonials received: ${count(buyers, 1)}`,
        `Next purchases offered: ${count(buyers, 2)}`,
        `Referrals asked: ${count(buyers, 3)}`,
      ]} />
    </div>
  )
}

function TickTable({ rows, cols, onChange }: { rows: Row[]; cols: string[]; onChange: (r: Row[]) => void }) {
  const upd = (i: number, r: Row) => onChange(rows.map((x, j) => (j === i ? r : x)))
  // Column template lives in a CSS variable so it only applies from the sm breakpoint up.
  const grid = { '--tt-cols': `minmax(8rem,1fr) repeat(${cols.length}, minmax(4.5rem, 6rem)) 2.5rem` } as React.CSSProperties
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" aria-live="polite">{rows.length} {rows.length === 1 ? 'name' : 'names'}{cols.map((c, i) => ` · ${rows.filter((r) => r.ticks[i]).length} ${c.toLowerCase()}`).join('')}</p>
      <div className="overflow-hidden rounded-2xl border-bold border-line">
        <div className="hidden gap-2 bg-bg px-3 py-2 text-xs font-semibold sm:grid sm:[grid-template-columns:var(--tt-cols)]" style={grid}>
          <span>Name</span>{cols.map((c) => <span key={c} className="text-center">{c}</span>)}<span />
        </div>
        {rows.length === 0 && <p className="px-3 py-4 text-sm text-muted">No names yet. Add your first one below.</p>}
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2 first:border-t-0 sm:grid sm:first:border-t sm:[grid-template-columns:var(--tt-cols)]" style={grid}>
            <input aria-label={`Name ${i + 1}`} className="field !py-2 basis-full sm:basis-auto" value={r.name} placeholder="First name or initials" onChange={(e) => upd(i, { ...r, name: e.target.value })} />
            {cols.map((c, k) => (
              <label key={c} className="flex items-center gap-1.5 text-sm sm:justify-center">
                <input type="checkbox" className="h-5 w-5 accent-[var(--c-ink)]" checked={r.ticks[k]} onChange={(e) => upd(i, { ...r, ticks: r.ticks.map((t, j) => (j === k ? e.target.checked : t)) })} />
                <span className="sm:sr-only">{c}</span>
              </label>
            ))}
            <button type="button" className="ml-auto rounded-full p-2 text-muted hover:bg-bg hover:text-danger sm:ml-0" aria-label={`Remove ${r.name || 'row'}`} onClick={() => onChange(rows.filter((_, j) => j !== i))}><X size={16} /></button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost !px-4 !py-2" onClick={() => onChange([...rows, { name: '', ticks: cols.map(() => false) }])}>+ Add a name</button>
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
