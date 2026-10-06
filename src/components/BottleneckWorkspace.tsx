import { Check, ChevronDown, Copy } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { fmtMoney, progressOf } from '../utils'
import { computeNumbers } from './NumberCalculator'
import { Field, NumberInput, TextArea, TextInput } from './ui'

type B = 'traffic' | 'interest' | 'path' | 'conversion' | 'followup'
const CARDS: Record<B, { n: number; title: string; tag: string; signs: string; causes: string; fixes: string[]; back: string; t3?: string }> = {
  traffic: { n: 1, title: 'Not enough traffic', tag: 'Traffic',
    signs: 'Few page visits, few DMs, quiet launch, “nobody’s buying,” even though the people who do see it often buy.',
    causes: 'Posting about everything except your offer, not reaching out, your offer living in one place nobody visits, or relying only on people finding you.',
    fixes: ['Post about your offer 3 times this week, with your call to action from Action 05.', 'Message 10 new people from your warm list.', 'Ask 3 happy buyers or contacts to share or refer.', 'Put your offer link everywhere you show up: bio, email signature, pinned post, and the end of every piece of content.'],
    back: 'Actions 04, 05 and 08', t3: 'Traffic is your bottleneck and your offer converts? See the Meta Ads bonus card under Action 16.' },
  interest: { n: 2, title: 'Traffic comes, but nobody raises their hand', tag: 'Interest',
    signs: 'Visits and views, but few DMs, opt-ins, bookings or add-to-carts.',
    causes: 'Your way in isn’t clear, your call to action is weak, or your message doesn’t match your buyer.',
    fixes: ['Rewrite your call to action to say exactly what to do and what they get.', 'Make your way in easier to take, like a DM keyword instead of a form.', 'Rewrite your offer post using your buyer’s exact words from Action 02.'],
    back: 'Actions 02 and 06' },
  path: { n: 3, title: 'People raise their hand, then get stuck', tag: 'Path',
    signs: 'Enquiries or opt-ins, but they don’t book, reply or reach checkout. Abandoned carts.',
    causes: 'Too many steps, a broken link, a slow reply, or a confusing next step.',
    fixes: ['Cut one step from your path.', 'Reply to every enquiry within a few hours.', 'Test your full path again on your phone, like a new buyer.'],
    back: 'Action 07' },
  conversion: { n: 4, title: 'Conversations happen, but don’t close', tag: 'Conversion',
    signs: 'Good chats, lots of “I’ll think about it,” few sales. Or you are not asking for the sale.',
    causes: 'Not asking clearly, discounting or over-explaining, not answering their real worry, or no cost of waiting.',
    fixes: ['Ask for the sale clearly in every conversation this week.', 'Use your cost of waiting line from Action 11 in every conversation.', 'Answer your number one worry before they ask, in your post or first message.'],
    back: 'Actions 10 and 11' },
  followup: { n: 5, title: '“Not yets” are left hanging', tag: 'Follow-up',
    signs: 'A long list of maybes, people who went quiet, and no second or third message sent.',
    causes: 'Fear of being annoying, no follow-up system, or forgetting.',
    fixes: ['Send all 3 follow-ups from Action 12 to everyone on your “not yet” list.', 'Block 20 minutes a day just for follow-up.', 'Send the close-the-loop message to anyone quiet for over 7 days.'],
    back: 'Action 12' },
}
const ORDER = Object.keys(CARDS) as B[]

// Action 13 funnel: which bottleneck each step-to-step drop points to.
const DROP_TO: { label: string; b: B; from: string; to: string }[] = [
  { label: 'Saw → Raised hand', b: 'interest', from: 'saw', to: 'raised' },
  { label: 'Raised hand → Conversation', b: 'path', from: 'raised', to: 'convo' },
  { label: 'Conversation → Asked', b: 'conversion', from: 'convo', to: 'asked' },
  { label: 'Asked → Bought', b: 'conversion', from: 'asked', to: 'bought' },
]

export default function BottleneckWorkspace({ actionId }: { actionId: string }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, actionId).fields
  const a13 = progressOf(state, 'a13').fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const set = (k: string, v: string) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const n13 = (k: string) => (typeof a13[k] === 'string' && a13[k] !== '' ? Number(a13[k]) : null)
  const { tier, offerPrice: price } = state.profile
  // null = follow the auto-detected bottleneck, 'none' = she closed it
  const [open, setOpen] = useState<B | 'none' | null>(null)

  // Step 1: traffic
  const needed = computeNumbers(state).perWeekNeeded
  // Once she has touched the box, her value wins (even blank); otherwise use Action 13's.
  const actual = 'traffic' in f ? (str('traffic') !== '' ? Number(str('traffic')) : null) : n13('actualWeekly')
  const trafficKnown = needed != null && actual != null
  const trafficLow = trafficKnown && actual! < needed! * 0.7

  // Step 2: drop-off from Action 13
  const drops = DROP_TO.map((d) => { const a = n13(d.from), b = n13(d.to); return a && b != null ? { ...d, r: Math.min(100, Math.round((b / a) * 100)) } : null }).filter(Boolean) as (typeof DROP_TO[number] & { r: number })[]
  const lowest = drops.length ? drops.reduce((x, y) => (y.r < x.r ? y : x)) : null
  const matches = str('matches') // 'Yes' | 'No'

  // Which bottleneck: traffic first, then Action 13's drop-off, unless she picked another.
  const manual = str('manual') as B
  const bottleneck: B | null = trafficLow ? 'traffic'
    : matches === 'No' ? (manual && manual in CARDS ? manual : null)
    : lowest ? lowest.b : (manual && manual in CARDS ? manual : null)
  const showPicker = !trafficLow && (matches === 'No' || (trafficKnown && !lowest))
  const shown = open === 'none' ? null : open ?? bottleneck

  const fixPick = str('fixPick')
  const fix = str('fix') || fixPick
  const days = [1, 2, 3, 4]
  const mkDone = days.filter((d) => str(`mk${d}`) === 'yes').length
  const t3Cost = tier === 3 && price && str('t3More') ? Number(str('t3More')) * price : null

  return (
    <div className="space-y-8">
      {/* Step 1 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">STEP 1 · TRAFFIC CHECK</p><h4 className="text-2xl font-bold">Are enough people reaching your offer?</h4></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><p className="text-sm font-semibold">Traffic you needed each week</p><p className="mt-1.5 rounded-field bg-bg px-3.5 py-2.5">{needed ?? <span className="text-muted">Finish Action 04</span>}</p></div>
          <Field label="Traffic you actually got each week" htmlFor="bn-traffic" help="Traffic is real people reaching your offer, like page visits, DMs about the offer, enquiries, and people you message directly. Views, likes and followers are not traffic. Pulled from Action 13.">
            <NumberInput id="bn-traffic" value={actual} onChange={(v) => set('traffic', v == null ? '' : String(v))} />
          </Field>
        </div>
        {trafficKnown && (
          <p aria-live="polite" className={`rounded-2xl p-4 text-lg font-semibold ${trafficLow ? 'bg-danger/10 text-danger' : 'bg-success-soft text-success'}`}>
            {trafficLow ? 'Traffic is your bottleneck. Fix this first. Nothing after this step can work without it.' : 'Your traffic is close enough. Let’s find where people drop off after that.'}
          </p>
        )}
      </section>

      {/* Step 2 */}
      {trafficKnown && !trafficLow && (
        <section className="space-y-3">
          <p className="pixel text-xl text-accent">STEP 2</p>
          <h4 className="text-2xl font-bold">Find where people drop off</h4>
          {lowest
            ? <p className="rounded-2xl bg-blush/50 p-4 font-semibold">Your biggest drop-off after traffic: {lowest.label} ({lowest.r}%).</p>
            : <p className="rounded-2xl bg-bg p-4 text-muted">Fill in your sales steps in Action 13 to see this, or pick your bottleneck below.</p>}
          {lowest && (
            <div>
              <p className="text-sm font-semibold">Does this match what you’ve seen?</p>
              <div role="radiogroup" aria-label="Does this match what you’ve seen?" className="mt-1.5 flex flex-wrap gap-2">
                {[['Yes', 'Yes'], ['No', 'No, it’s a different step']].map(([v, l]) => (
                  <label key={v} className={`relative cursor-pointer rounded-pill border-bold px-5 py-2 text-sm font-semibold ${matches === v ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink/50'}`}>
                    <input type="radio" className="sr-only" name={`${actionId}-match`} checked={matches === v} onChange={() => set('matches', v)} />{l}
                  </label>
                ))}
              </div>
            </div>
          )}
          {showPicker && (
            <div role="radiogroup" aria-label="Choose your bottleneck" className="grid gap-2 sm:grid-cols-2">
              {ORDER.filter((b) => b !== 'traffic').map((b) => (
                <label key={b} className={`relative cursor-pointer rounded-xl border-bold px-3 py-2.5 ${manual === b ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink/50'}`}>
                  <input type="radio" className="sr-only" name={`${actionId}-manual`} checked={manual === b} onChange={() => { set('manual', b); setOpen(null) }} />
                  <span className="block font-bold">{CARDS[b].tag}</span><span className="block text-sm text-muted">{CARDS[b].title}</span>
                </label>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Step 3 */}
      <section>
        <p className="pixel text-xl text-accent">STEP 3</p>
        <h4 className="text-2xl font-bold">Your bottleneck</h4>
        {!bottleneck && <p className="mt-2 text-sm text-muted">Your bottleneck opens here once Steps 1 and 2 are done. You can read any of them now.</p>}
        <div className="mt-3 space-y-2">
          {ORDER.map((b) => {
            const c = CARDS[b]
            const isOpen = shown === b
            const isMine = bottleneck === b
            return (
              <div key={b} className={`rounded-2xl border-bold ${isMine ? 'border-ink bg-surface shadow-card' : 'border-line bg-surface'}`}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? 'none' : b)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <span><span className="pixel mr-2 text-lg text-accent">{c.n}</span><span className="font-bold">{c.title}</span> <span className="chip ml-1 bg-accent-soft">{c.tag}</span>{isMine && <span className="chip ml-1 bg-ink text-surface">Your bottleneck</span>}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="space-y-3 border-t border-line p-4">
                    <p className="text-sm"><span className="font-bold">Signs:</span> {c.signs}</p>
                    <p className="text-sm"><span className="font-bold">Likely causes:</span> {c.causes}</p>
                    {isMine ? (
                      <div>
                        <p className="text-sm font-bold">Choose one fix:</p>
                        <div role="radiogroup" aria-label="Choose one fix" className="mt-2 space-y-2">
                          {c.fixes.map((fx) => (
                            <label key={fx} className={`relative block cursor-pointer rounded-xl border-bold px-3 py-2.5 text-sm ${fixPick === fx ? 'border-ink bg-blush' : 'border-line hover:border-ink/50'}`}>
                              <input type="radio" className="sr-only" name={`${actionId}-fix`} checked={fixPick === fx} onChange={() => { set('fixPick', fx); set('fix', '') }} />{fx}
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div><p className="text-sm font-bold">Fixes:</p><ul className="mt-1 list-disc pl-5 text-sm text-muted">{c.fixes.map((fx) => <li key={fx}>{fx}</li>)}</ul></div>
                    )}
                    <p className="text-sm"><span className="font-bold">Go back to:</span> {c.back}</p>
                    {c.t3 && tier === 3 && <p className="rounded-xl bg-[var(--c-bonus-bg)] p-3 text-sm font-medium">{c.t3}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Step 4 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">STEP 4</p><h4 className="text-2xl font-bold">Your one fix</h4></div>
        <Field label="The fix I chose" htmlFor="bn-fix" help="Filled in from your pick above. Change it if you need to.">
          <TextArea id="bn-fix" rows={2} value={fix} placeholder="Pick a fix in your bottleneck card above." onChange={(v) => set('fix', v)} />
        </Field>
        <Field label="Why I chose it" htmlFor="bn-why" help="Use what non-buyers told you in Action 13."><TextArea id="bn-why" rows={2} value={str('why')} onChange={(v) => set('why', v)} /></Field>
      </section>

      {/* Step 5 */}
      <section className="space-y-3">
        <div>
          <p className="pixel text-xl text-accent">STEP 5</p><h4 className="text-2xl font-bold">Your 4-day fix plan</h4>
          <p className="mt-1 text-sm text-muted">Keep your daily marketing going while you fix the leak. If you stop showing up, your traffic drops, and you won’t know if the fix worked.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border-bold border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg">
              <tr><th scope="col" className="w-16 px-3 py-2">Day</th><th scope="col" className="px-3 py-2">My fix task</th><th scope="col" className="w-28 px-3 py-2 text-center">Daily marketing done</th></tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 font-semibold">Day {d}</th>
                  <td className="px-3 py-2"><input id={`bn-day${d}`} aria-label={`Day ${d} fix task`} className="field !py-2" value={str(`day${d}`)} placeholder="Your fix task" onChange={(e) => set(`day${d}`, e.target.value)} /></td>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" aria-label={`Day ${d} daily marketing done`} className="h-5 w-5 accent-[var(--c-ink)]" checked={str(`mk${d}`) === 'yes'} onChange={(e) => set(`mk${d}`, e.target.checked ? 'yes' : '')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm font-semibold">Daily marketing: {mkDone} of 4 days done</p>
      </section>

      {/* Step 6 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">STEP 6</p><h4 className="text-2xl font-bold">Check your number after 4 days</h4>
          <p className="mt-1 text-sm text-muted">Use the same number for both, like traffic per week, enquiries, or sales asks.</p></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Which number" htmlFor="bn-metric"><TextInput id="bn-metric" value={str('metric')} placeholder="e.g. DMs about my offer" onChange={(v) => set('metric', v)} /></Field>
          <Field label="Before" htmlFor="bn-before"><NumberInput id="bn-before" value={str('before') ? Number(str('before')) : null} onChange={(v) => set('before', v == null ? '' : String(v))} /></Field>
          <Field label="After 4 days" htmlFor="bn-after"><NumberInput id="bn-after" value={str('after') ? Number(str('after')) : null} onChange={(v) => set('after', v == null ? '' : String(v))} /></Field>
        </div>
        {str('before') && str('after') && (
          <p className={`rounded-2xl p-4 font-semibold ${Number(str('after')) > Number(str('before')) ? 'bg-success-soft text-success' : 'bg-highlight/70'}`}>
            {Number(str('after')) > Number(str('before')) ? 'It moved. Keep this fix going, and do more of it in Action 15.' : 'No change yet. Check you did the fix every day, then try the next fix on your list.'}
          </p>
        )}
      </section>

      {/* Step 7 */}
      <Summary lines={[
        `My bottleneck: ${bottleneck ? CARDS[bottleneck].tag : '…'}`,
        `My fix: ${fix || '…'}`,
        `Before: ${str('before') || '…'} · After: ${str('after') || '…'}`,
        `Daily marketing: ${mkDone} of 4 days done`,
        ...(tier === 3 ? [`Cost of this bottleneck: ${t3Cost != null ? fmtMoney(t3Cost) : '…'}`] : []),
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

/** The bottleneck name from Action 14 (same rules as the workspace), for Action 16's review. */
export function bottleneckLabel(state: import('../types').AppState): string {
  const f = progressOf(state, 'a14').fields
  const a13 = progressOf(state, 'a13').fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const n13 = (k: string) => (typeof a13[k] === 'string' && a13[k] !== '' ? Number(a13[k]) : null)
  const needed = computeNumbers(state).perWeekNeeded
  const actual = 'traffic' in f ? (str('traffic') !== '' ? Number(str('traffic')) : null) : n13('actualWeekly')
  if (needed != null && actual != null && actual < needed * 0.7) return `${CARDS.traffic.tag}: ${CARDS.traffic.title}`
  const manual = str('manual') as B
  const drops = DROP_TO.map((d) => { const a = n13(d.from), b = n13(d.to); return a && b != null ? { ...d, r: b / a } : null }).filter(Boolean) as (typeof DROP_TO[number] & { r: number })[]
  const lowest = drops.length ? drops.reduce((x, y) => (y.r < x.r ? y : x)) : null
  const b: B | null = str('matches') === 'No' ? (manual in CARDS ? manual : null) : lowest ? lowest.b : (manual in CARDS ? manual : null)
  return b ? `${CARDS[b].tag}: ${CARDS[b].title}` : ''
}
