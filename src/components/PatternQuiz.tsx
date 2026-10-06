import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { fmtMoney, progressOf } from '../utils'
import { Field, NumberInput, TextArea, TextInput } from './ui'

type P = 'ghost' | 'discounter' | 'over' | 'hider' | 'perfectionist' | 'nopressure' | 'waiter'

// Order matters: it breaks ties ("Start with [first one]").
export const PATTERNS: Record<P, { name: string; looks: string; costs: string; fear: string; action: string }> = {
  ghost: { name: 'The Ghost', looks: 'You message once, then let people go quiet.', costs: 'Most sales happen on the second or third message. You’re stopping before the sale.', fear: 'If I follow up, I’m annoying.', action: 'Follow up with 3 people who went quiet. One line: “Hey, did you still want the details?”' },
  discounter: { name: 'The Discounter', looks: 'You drop your price before anyone asks.', costs: 'Every discount comes straight out of your profit, and teaches buyers to wait.', fear: 'I’m not worth the full price.', action: 'Make your next offer at full price. No discount, no bonus, no apology.' },
  over: { name: 'The Over-Explainer', looks: 'You send long messages to justify your offer and price.', costs: 'Long messages sound unsure. Unsure sellers don’t get yeses.', fear: 'If I don’t explain everything, they’ll say no.', action: 'Send your offer to one person in 3 sentences or less: what it is, the price, and the next step.' },
  hider: { name: 'The Hider', looks: 'You post about everything except your offer.', costs: 'People can’t buy what they don’t know exists.', fear: 'If I sell, people will think I’m only after their money.', action: 'Post about your offer today. Say what it is, the price, and how to buy.' },
  perfectionist: { name: 'The Perfectionist', looks: 'You keep fixing things instead of selling.', costs: 'Every day spent fixing is a day with no sales.', fear: 'If it’s not perfect, I’ll be judged.', action: 'Send your offer to one person as it is today. Ready is better than perfect.' },
  nopressure: { name: 'The No-Pressure Seller', looks: 'You say “no worries if not” and give people an easy way out.', costs: 'You’re handing buyers the no before they’ve decided.', fear: 'If I ask clearly, I’m being pushy.', action: 'End your next sales message with a clear question: “Do you want to grab a spot?”' },
  waiter: { name: 'The Waiter', looks: 'You post and wait for people to come to you.', costs: 'Most buyers won’t reach out first, even when they want it.', fear: 'If I reach out, I’m desperate.', action: 'Message 3 people from your warm list first. Don’t wait for them.' },
}
const ORDER = Object.keys(PATTERNS) as P[]

const QUESTIONS: { q: string; a: [string, P][] }[] = [
  { q: 'Someone asked about your offer, then went quiet. What did you do?', a: [['Left it. I didn’t want to bother them.', 'ghost'], ['Sent a long message explaining it again.', 'over'], ['Offered them a deal to get them over the line.', 'discounter'], ['Said “no worries if now isn’t the right time.”', 'nopressure']] },
  { q: 'What did you post most during your sprint?', a: [['Helpful content, but I barely mentioned my offer.', 'hider'], ['Not much. It didn’t feel ready yet.', 'perfectionist'], ['My offer, but softly, like “if anyone’s interested.”', 'nopressure'], ['I posted, then waited for people to message me.', 'waiter']] },
  { q: 'When you share your price, you usually…', a: [['Add a discount or bonus before they ask.', 'discounter'], ['Explain why it costs that much.', 'over'], ['Avoid saying it until they ask.', 'hider'], ['Say it, then add “but no pressure.”', 'nopressure']] },
  { q: 'How did you go with your warm list?', a: [['I messaged people once, but didn’t follow up.', 'ghost'], ['I waited for them to reach out to me first.', 'waiter'], ['I haven’t started. I’m still fixing my message.', 'perfectionist'], ['I messaged people, but didn’t mention my offer.', 'hider']] },
  { q: 'Which thought stopped you most?', a: [['“They’re busy. I’ll leave it.”', 'ghost'], ['“It’s too expensive for them.”', 'discounter'], ['“It’s not good enough yet.”', 'perfectionist'], ['“If they want it, they’ll ask.”', 'waiter']] },
  { q: 'Someone says, “I need to think about it.” You…', a: [['Say “of course” and never check back.', 'ghost'], ['Offer them a cheaper option.', 'discounter'], ['Send more info to convince them.', 'over'], ['Tell them there’s no rush at all.', 'nopressure']] },
  { q: 'What did you spend the most time on?', a: [['Making my posts, pages or graphics look right.', 'perfectionist'], ['Creating content that teaches but doesn’t sell.', 'hider'], ['Checking my DMs, hoping someone would ask.', 'waiter'], ['Writing and rewriting my messages.', 'over']] },
]

export default function PatternQuiz({ actionId }: { actionId: string }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, actionId).fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const set = (k: string, v: string) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const [manualOpen, setManualOpen] = useState(false)

  // Scoring
  const answered = QUESTIONS.filter((_, i) => str(`q${i + 1}`)).length
  const scores = Object.fromEntries(ORDER.map((p) => [p, 0])) as Record<P, number>
  QUESTIONS.forEach((_, i) => { const v = str(`q${i + 1}`) as P; if (v in scores) scores[v]++ })
  const top = Math.max(...Object.values(scores))
  const winners = answered === QUESTIONS.length ? ORDER.filter((p) => scores[p] === top) : []
  const manual = str('manualPattern') as P
  const pattern: P | null = (manual && manual in PATTERNS ? manual : winners[0]) ?? null
  const info = pattern ? PATTERNS[pattern] : null

  // Cost + action
  const price = state.profile.offerPrice
  const lostSales = Number(str('costSales')) || 0
  const cost = price && lostSales ? lostSales * price : null
  const action = str('action') || info?.action || ''
  const deadline = str('deadline')
  const overdue = str('done') === 'Not yet' && deadline && new Date(deadline) < new Date()

  return (
    <div className="space-y-6">
      {/* Part 1: quiz */}
      <section className="rounded-card border-bold border-ink bg-cream/50 p-5 sm:p-6">
        <p className="pixel text-xl text-accent">SALES PATTERN QUIZ</p>
        <h4 className="text-2xl font-bold">What’s stopping your sales?</h4>
        <p className="mt-1 text-muted">Answer based on what you actually did during your sprint, not what you planned to do. Pick the answer closest to the truth.</p>
        <ol className="mt-5 space-y-6">
          {QUESTIONS.map((qq, i) => {
            const key = `q${i + 1}`
            return (
              <li key={key}>
                <p className="font-bold"><span className="pixel mr-2 text-lg text-accent">{i + 1}</span>{qq.q}</p>
                <div role="radiogroup" aria-label={qq.q} className="mt-2 grid gap-2 sm:grid-cols-2">
                  {qq.a.map(([text, p]) => (
                    <label key={text} className={`relative cursor-pointer rounded-xl border-bold px-3 py-2.5 text-sm ${str(key) === p ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink/50'}`}>
                      <input type="radio" className="sr-only" name={`${actionId}-${key}`} checked={str(key) === p} onChange={() => set(key, p)} />{text}
                    </label>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>
        <p className="mt-4 text-sm text-muted">{answered} of {QUESTIONS.length} answered</p>
      </section>

      {/* Part 2: result */}
      <section aria-live="polite">
        <h4 className="mb-3 text-lg font-bold">Your result</h4>
        {!info && <p className="rounded-2xl bg-bg p-4 text-muted">Answer all 7 questions to see your pattern.</p>}
        {info && (
          <div className="rounded-card border-bold border-ink bg-surface p-5 shadow-card">
            {!manual && winners.length > 1 && <p className="mb-3 rounded-xl bg-highlight/70 p-3 text-sm font-semibold">You have two patterns: {winners.map((w) => PATTERNS[w].name).join(' and ')}. Start with {PATTERNS[winners[0]].name}.</p>}
            <p className="label-caps">Your pattern</p>
            <p className="text-3xl font-bold">{info.name}</p>
            <dl className="mt-4 space-y-3">
              <div><dt className="text-sm font-bold">What it looks like</dt><dd className="text-muted">{info.looks}</dd></div>
              <div><dt className="text-sm font-bold">What it costs</dt><dd className="text-muted">{info.costs}</dd></div>
              <div><dt className="text-sm font-bold">The fear under it</dt><dd className="text-muted">{info.fear}</dd></div>
              <div className="rounded-xl bg-blush/50 p-3"><dt className="text-sm font-bold">Your 24-hour action</dt><dd className="font-semibold">{info.action}</dd></div>
            </dl>
          </div>
        )}
        <button type="button" className="mt-3 text-sm font-semibold underline underline-offset-4" aria-expanded={manualOpen} onClick={() => setManualOpen(!manualOpen)}>
          Not you? Choose your pattern yourself
        </button>
        {manualOpen && (
          <div role="radiogroup" aria-label="Choose your pattern" className="mt-3 grid gap-2 sm:grid-cols-2">
            {ORDER.map((p) => (
              <label key={p} className={`relative cursor-pointer rounded-xl border-bold px-3 py-2.5 ${manual === p ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink/50'}`}>
                <input type="radio" className="sr-only" name={`${actionId}-manual`} checked={manual === p} onChange={() => set('manualPattern', p)} />
                <span className="block font-bold">{PATTERNS[p].name}</span><span className="block text-sm text-muted">{PATTERNS[p].looks}</span>
              </label>
            ))}
            {manual && <button type="button" className="text-left text-sm font-semibold underline" onClick={() => set('manualPattern', '')}>Use my quiz result instead</button>}
          </div>
        )}
      </section>

      {/* Part 3: cost */}
      <section className="space-y-4">
        <h4 className="text-lg font-bold">Cost check</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="How many times did this pattern show up in your sprint?" htmlFor="pq-times"><NumberInput id="pq-times" value={str('costTimes') ? Number(str('costTimes')) : null} onChange={(v) => set('costTimes', v == null ? '' : String(v))} /></Field>
          <Field label="Roughly how many sales could that have cost you?" htmlFor="pq-sales"><NumberInput id="pq-sales" value={str('costSales') ? Number(str('costSales')) : null} onChange={(v) => set('costSales', v == null ? '' : String(v))} /></Field>
        </div>
        {cost != null && <p className="rounded-2xl bg-blush/50 p-4 text-lg font-semibold">That’s about {fmtMoney(cost)} in possible sales.</p>}
        {lostSales > 0 && !price && <p className="text-sm text-muted">Add your price in Action 03 to see what that cost in dollars.</p>}
      </section>

      {/* Part 4: break it */}
      <section className="space-y-4">
        <h4 className="text-lg font-bold">Break the pattern</h4>
        <Field label="Your 24-hour action" htmlFor="pq-action" help="Filled in from your result. Change it if you need to.">
          <TextArea id="pq-action" value={action} onChange={(v) => set('action', v)} />
        </Field>
        <Field label="I will do it by" htmlFor="pq-deadline"><TextInput id="pq-deadline" type="datetime-local" value={deadline} onChange={(v) => set('deadline', v)} /></Field>
        <div>
          <p className="text-sm font-semibold">Done?</p>
          <div role="radiogroup" aria-label="Done?" className="mt-1.5 flex gap-2">
            {['Yes', 'Not yet'].map((o) => (
              <label key={o} className={`relative cursor-pointer rounded-pill border-bold px-5 py-2 text-sm font-semibold ${str('done') === o ? (o === 'Yes' ? 'border-success bg-success-soft text-success' : 'border-ink bg-highlight') : 'border-line bg-surface hover:border-ink/50'}`}>
                <input type="radio" className="sr-only" name={`${actionId}-done`} checked={str('done') === o} onChange={() => set('done', o)} />{o}
              </label>
            ))}
          </div>
          {overdue && <p className="mt-2 rounded-xl bg-highlight/70 p-3 text-sm font-medium">The pattern is running right now. Do the smallest version of it today.</p>}
        </div>
      </section>

      {/* Part 5 */}
      <Field label="When I did it, what actually happened?" htmlFor="pq-happened" help="Did they reply? Did they buy? Was it as bad as you thought?">
        <TextArea id="pq-happened" value={str('happened')} onChange={(v) => set('happened', v)} />
      </Field>

      {/* Part 6 */}
      <Summary lines={[
        `My pattern: ${info?.name ?? '…'}`,
        `It cost me about: ${cost != null ? fmtMoney(cost) : '…'}`,
        `I broke it by: ${action || '…'}`,
        `What happened: ${str('happened') || '…'}`,
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
