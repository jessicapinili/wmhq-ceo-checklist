import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { fmtMoney, progressOf } from '../utils'
import { patternFor } from './PatternQuiz'
import { Field, NumberInput, TextArea, TextInput } from './ui'

const ROOTS = ['Trust', 'Value', 'Timing', 'Self-belief'] as const

const TEACH: { title: string; body: string }[] = [
  { title: 'The brain likes what it knows.', body: 'Even when someone’s problem is painful, it feels safer than change, because they know what to expect. So when they’re close to saying yes, their brain looks for a reason to stay put. That reason sounds like “it’s too expensive” or “now isn’t a good time.”' },
  { title: 'Losing feels worse than gaining.', body: 'People feel the pain of losing money about twice as much as the joy of getting something. So your price feels big, and the result feels far away. Your job is to make the cost of not fixing the problem feel real too.' },
  { title: 'Most worries come from one of four places.', body: 'Trust: “I don’t know if you can help me.” Value: “I don’t know if it’s worth it.” Timing: “I don’t know if now is right.” Self-belief: “I don’t know if I can do it.” Every objection fits into one of these. When you know which one it is, you know what to answer.' },
  { title: 'The first worry is rarely the real one.', body: '“I need to think about it” is a cover. Underneath it is something they haven’t said out loud yet. Don’t answer the cover. Ask a calm question to find the real worry.' },
]

const SORT: { worry: string; right: string[]; why: string }[] = [
  { worry: '“I’ve tried things before and they didn’t work.”', right: ['Self-belief', 'Trust'], why: 'Either she doubts herself (“I can’t do it”) or she doubts you (“will this be different?”). Ask which one.' },
  { worry: '“It’s a lot of money.”', right: ['Value'], why: 'She can’t yet see that the result is worth more than the price. Show the cost of waiting.' },
  { worry: '“Maybe after Christmas.”', right: ['Timing'], why: 'She isn’t sure now is right. Ask what would make it a good time, and what waiting costs.' },
  { worry: '“I’ve never heard of you.”', right: ['Trust'], why: 'She doesn’t know you yet. A result, a review or a quick call builds trust.' },
]

const WORRIES: { worry: string; root: string; dont: string; tryLine: (cow: string) => string }[] = [
  { worry: 'It’s too expensive.', root: 'Value', dont: 'drop your price.', tryLine: (c) => `“Totally fair to check. It’s costing you about ${c} a month right now. Does it make sense to fix that?”` },
  { worry: 'I need to think about it.', root: 'Hidden worry', dont: 'say “no worries” and leave it.', tryLine: () => '“Of course. What’s the main thing you’re weighing up?”' },
  { worry: 'Now isn’t a good time.', root: 'Timing', dont: 'let it end there.', tryLine: (c) => `“What would make it a good time? Waiting usually means ${c}.”` },
  { worry: 'I need to ask my partner.', root: 'Value or Trust', dont: 'wait for them to come back.', tryLine: () => '“Makes sense. What do you think they’ll ask? I can help you answer it.”' },
  { worry: 'I’m not sure it will work for me.', root: 'Self-belief', dont: 'send long messages to convince them.', tryLine: () => '“What did you try before? Here’s what’s different about this.”' },
  { worry: 'I can do it myself.', root: 'Value', dont: 'argue.', tryLine: () => '“You could. How long have you been trying to do it on your own?”' },
]

export default function MaybesWorkspace({ actionId }: { actionId: string }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, actionId).fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const set = (k: string, v: string) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const pattern = patternFor(progressOf(state, 'a10').fields)

  // Cost of waiting
  const a02 = progressOf(state, 'a02').fields
  const problemFrom02 = typeof a02.struggle === 'string' ? a02.struggle : ''
  const problem = str('problem') || problemFrom02
  const money = str('costMoney') ? Number(str('costMoney')) : null
  const hours = str('costTime') ? Number(str('costTime')) : null
  const monthly = [money ? fmtMoney(money) : '', hours ? `${hours} hours` : ''].filter(Boolean).join(' and ')
  const threeMonths = [money ? fmtMoney(money * 3) : '', hours ? `${hours * 3} hours` : ''].filter(Boolean).join(' and ')
  const price = state.profile.offerPrice
  const autoLine = monthly
    ? `Right now this is costing you about ${monthly} every month. Waiting 3 more months means ${threeMonths}.${price ? ` My offer is ${fmtMoney(price)}.` : ''}`
    : ''
  const line = str('line') || autoLine
  const cowShort = monthly || '[cost of waiting]'

  const topWorry = str('topWorry')

  return (
    <div className="space-y-8">
      {/* Part 1 */}
      <p className="rounded-2xl bg-blush/60 p-4">
        {pattern
          ? <><span className="font-bold">Your pattern: {pattern.name}.</span> When a buyer pushes back, this is when it will show up. Watch for this: {pattern.looks.charAt(0).toLowerCase() + pattern.looks.slice(1)}</>
          : <>Take the quiz in Action 10 first, and your pattern reminder will show here.</>}
      </p>

      {/* Part 2 */}
      <section>
        <p className="pixel text-xl text-accent">THE PSYCHOLOGY</p>
        <h4 className="text-2xl font-bold">A worry is not a no.</h4>
        <p className="mt-1 text-muted">When someone pushes back, they’re not rejecting you. Their brain is trying to keep them safe. Understand what’s really going on, and you’ll stop taking it personally.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TEACH.map((t, i) => (
            <div key={t.title} className="rounded-2xl border-bold border-ink/15 bg-surface p-4">
              <p className="font-bold"><span className="pixel mr-2 text-lg text-accent">{i + 1}</span>{t.title}</p>
              <p className="mt-1 text-sm text-muted">{t.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-cream/70 p-4">
          <p className="font-bold">Quick check: match the worry to where it comes from.</p>
          <ol className="mt-3 space-y-4">
            {SORT.map((s, i) => {
              const pick = str(`sort${i + 1}`)
              const correct = pick && s.right.includes(pick)
              return (
                <li key={s.worry}>
                  <p className="font-semibold">{s.worry}</p>
                  <div role="radiogroup" aria-label={s.worry} className="mt-1.5 flex flex-wrap gap-2">
                    {ROOTS.map((r) => (
                      <label key={r} className={`relative cursor-pointer rounded-pill border-bold px-4 py-1.5 text-sm font-semibold ${pick === r ? (s.right.includes(r) ? 'border-success bg-success-soft text-success' : 'border-ink bg-highlight') : 'border-line bg-surface hover:border-ink/50'}`}>
                        <input type="radio" className="sr-only" name={`${actionId}-sort${i}`} checked={pick === r} onChange={() => set(`sort${i + 1}`, r)} />{r}
                      </label>
                    ))}
                  </div>
                  {pick && <p className="mt-1.5 text-sm" aria-live="polite"><span className="font-bold">{correct ? 'Yes. ' : `It’s ${s.right.join(' or ')}. `}</span>{s.why}</p>}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Part 3 */}
      <section className="space-y-4">
        <div>
          <p className="pixel text-xl text-accent">COST OF WAITING</p>
          <h4 className="text-2xl font-bold">What does “not yet” cost them?</h4>
          <p className="mt-1 text-muted">This answers the “losing feels worse” part of the brain. Show them what they’re already losing by waiting.</p>
        </div>
        <Field label="What problem does your offer fix?" htmlFor="mw-problem" help="Pulled from Action 02. Change it if you need to.">
          <TextArea id="mw-problem" value={problem} onChange={(v) => set('problem', v)} />
        </Field>
        <div>
          <p className="flex items-center text-sm font-semibold">What does that problem cost them each month?</p>
          <p className="mb-2 text-sm text-muted">Fill in any that apply. Be real, not dramatic. Examples: “A bookkeeping mess costs about $400 a month in late fees and 6 hours of stress.” “An anxious dog means skipping walks, and $80 a month in daycare.”</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Money" htmlFor="mw-money"><NumberInput id="mw-money" currency value={money} onChange={(v) => set('costMoney', v == null ? '' : String(v))} /></Field>
            <Field label="Time (hours)" htmlFor="mw-time"><NumberInput id="mw-time" value={hours} onChange={(v) => set('costTime', v == null ? '' : String(v))} /></Field>
            <Field label="Stress or health" htmlFor="mw-stress"><TextInput id="mw-stress" value={str('costStress')} onChange={(v) => set('costStress', v)} /></Field>
            <Field label="Missed chances" htmlFor="mw-missed"><TextInput id="mw-missed" value={str('costMissed')} onChange={(v) => set('costMissed', v)} /></Field>
          </div>
        </div>
        {threeMonths && <p className="rounded-2xl bg-blush/50 p-4 text-lg font-semibold">Waiting 3 months costs about {threeMonths}.</p>}
        <Field label="Your cost of waiting line" htmlFor="mw-line" help="Say this calmly, once. It’s not pressure. It’s the truth they haven’t added up yet.">
          <TextArea id="mw-line" value={line} placeholder="Fill in the money or time above and your line builds itself." onChange={(v) => set('line', v)} />
        </Field>
      </section>

      {/* Part 4 */}
      <section>
        <h4 className="text-lg font-bold">Your answers to common worries</h4>
        <p className="text-sm text-muted">Keep every answer under 3 sentences. Long answers sound unsure.</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {WORRIES.map((w, i) => (
            <div key={w.worry} className="rounded-2xl border-bold border-ink/15 bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg font-bold">“{w.worry}”</p>
                <span className="chip bg-accent-soft">{w.root}</span>
              </div>
              <p className="mt-2 text-sm"><span className="font-bold text-danger">Don’t:</span> {w.dont}</p>
              <p className="mt-1 text-sm"><span className="font-bold text-success">Try:</span> {w.tryLine(cowShort)}</p>
              <div className="mt-3">
                <Field label="Your answer" htmlFor={`mw-w${i}`}><TextArea id={`mw-w${i}`} rows={2} value={str(`worry${i + 1}`)} onChange={(v) => set(`worry${i + 1}`, v)} /></Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Part 5 */}
      <section className="space-y-4">
        <div>
          <h4 className="text-lg font-bold">Answer it before they ask</h4>
          <p className="text-muted">Your number one worry. When buyers get their answer early, they never need to raise it.</p>
        </div>
        <Field label="Which worry do you expect to hear most?" htmlFor="mw-top">
          <select id="mw-top" className="field" value={topWorry} onChange={(e) => set('topWorry', e.target.value)}>
            <option value="">Choose one</option>
            {WORRIES.map((w) => <option key={w.worry} value={w.worry}>{w.worry}</option>)}
          </select>
        </Field>
        <Field label="How will you answer it before they ask?" htmlFor="mw-how" help="Answer it in a post, on your sales page, or in your first message. Example: “If price is the worry, share what it costs to keep doing it alone.”">
          <TextArea id="mw-how" value={str('topHow')} onChange={(v) => set('topHow', v)} />
        </Field>
      </section>

      {/* Part 6 */}
      <Summary lines={[
        `My pattern to watch: ${pattern?.name ?? '…'}`,
        `Cost of waiting: ${line || '…'}`,
        `Worry I’ll answer first: ${topWorry ? `“${topWorry}”` : '…'}`,
        `How: ${str('topHow') || '…'}`,
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
