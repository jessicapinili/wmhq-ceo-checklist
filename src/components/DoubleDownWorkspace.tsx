import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { fmtMoney, progressOf } from '../utils'
import { Field, NumberInput, TextArea, TextInput } from './ui'

const TYPES = ['A post or piece of content', 'A message or follow-up', 'A channel (where most buyers came from)', 'Your way in (from Action 06)', 'A group of people (like past buyers or referrals)', 'Your fix from Action 14']
const WHY = ['It used my buyer’s exact words', 'It answered a worry before they asked', 'It showed a real result', 'It was personal or told my story', 'It was sent directly to the right person', 'It had a clear call to action', 'It came at the right time']
const WAYS = [
  { key: 'repeat', title: 'Repeat it.', desc: 'Do the exact same thing again.', ex: 'Send the same message to 10 more past clients.' },
  { key: 'remix', title: 'Remix it.', desc: 'Same idea, new angle or format.', ex: 'Turn the post that worked into a carousel, an email and a story.' },
  { key: 'reach', title: 'Reach more people with it.', desc: 'Put it in front of more of the right people.', ex: 'Share the post in 2 groups my buyer is in, or ask a buyer to share it.' },
]

export default function DoubleDownWorkspace({ actionId }: { actionId: string }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, actionId).fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const num = (k: string) => (str(k) !== '' ? Number(str(k)) : null)
  const set = (k: string, v: string) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const yes = (k: string) => str(k) === 'yes'

  // Suggestions from Action 13 (what worked best) and Action 14 (the fix, if it improved)
  const a13 = progressOf(state, 'a13').fields, a14 = progressOf(state, 'a14').fields
  const s = (o: Record<string, string | string[]>, k: string) => (typeof o[k] === 'string' ? (o[k] as string).trim() : '')
  const suggestions = [
    s(a13, 'bestContent') && { from: 'Action 13: best content', text: s(a13, 'bestContent') },
    s(a13, 'bestPlace') && { from: 'Action 13: where most buyers came from', text: s(a13, 'bestPlace') },
    s(a13, 'bestLine') && { from: 'Action 13: best follow-up line', text: s(a13, 'bestLine') },
    (s(a14, 'fix') || s(a14, 'fixPick')) && Number(s(a14, 'after')) > Number(s(a14, 'before')) && { from: 'Action 14: your fix (it improved)', text: s(a14, 'fix') || s(a14, 'fixPick') },
  ].filter(Boolean) as { from: string; text: string }[]

  const ways = WAYS.filter((w) => yes(`way_${w.key}`))
  const before = { sales: num('salesBefore'), replies: num('repliesBefore'), cash: num('cashBefore') }
  const after = { sales: num('salesAfter'), replies: num('repliesAfter'), cash: num('cashAfter') }
  const pairs = (['sales', 'replies', 'cash'] as const).filter((k) => before[k] != null && after[k] != null)
  // "More" when the first metric that changed (sales, then replies, then cash) went up.
  const firstDiff = pairs.find((k) => after[k] !== before[k])
  const verdict = pairs.length === 0 ? null : firstDiff && after[firstDiff]! > before[firstDiff]! ? 'more' : 'same'

  // Plain function (not a component) so the inputs keep focus while typing.
  const trio = (p: 'Before' | 'After', label = '') => (
    <div className="grid gap-3 sm:grid-cols-3">
      <Field label={`Replies${label}`} htmlFor={`dd-r${p}`}><NumberInput id={`dd-r${p}`} value={num(`replies${p}`)} onChange={(v) => set(`replies${p}`, v == null ? '' : String(v))} /></Field>
      <Field label={`Sales${label}`} htmlFor={`dd-s${p}`}><NumberInput id={`dd-s${p}`} value={num(`sales${p}`)} onChange={(v) => set(`sales${p}`, v == null ? '' : String(v))} /></Field>
      <Field label={`Cash${label}`} htmlFor={`dd-c${p}`}><NumberInput id={`dd-c${p}`} currency value={num(`cash${p}`)} onChange={(v) => set(`cash${p}`, v == null ? '' : String(v))} /></Field>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Part 1 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">PART 1</p><h4 className="text-2xl font-bold">Pick your one winner</h4></div>
        {suggestions.length > 0 && (
          <div className="rounded-2xl bg-cream/70 p-4">
            <p className="text-sm font-semibold">Suggestions from your earlier actions. Tap one to use it.</p>
            <div className="mt-2 flex flex-col gap-2">
              {suggestions.map((sg) => (
                <button key={sg.from} type="button" onClick={() => set('winner', sg.text)} className="rounded-xl border-bold border-line bg-surface p-3 text-left text-sm hover:border-ink">
                  <span className="label-caps block !text-[10px]">{sg.from}</span>{sg.text}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">What is your winner? Pick one type:</p>
          <div role="radiogroup" aria-label="Winner type" className="mt-2 grid gap-2 sm:grid-cols-2">
            {TYPES.map((t) => (
              <label key={t} className={`relative cursor-pointer rounded-xl border-bold px-3 py-2.5 text-sm ${str('type') === t ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink/50'}`}>
                <input type="radio" className="sr-only" name={`${actionId}-type`} checked={str('type') === t} onChange={() => set('type', t)} />{t}
              </label>
            ))}
          </div>
        </div>
        <Field label="Describe it" htmlFor="dd-winner" help="Be exact. Not “Instagram,” but “the reel where I showed a before and after.”">
          <TextArea id="dd-winner" rows={2} value={str('winner')} onChange={(v) => set('winner', v)} />
        </Field>
        <div><p className="mb-2 text-sm font-semibold">What did it bring in?</p>{trio('Before')}</div>
      </section>

      {/* Part 2 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">PART 2</p><h4 className="text-2xl font-bold">Why did it work?</h4><p className="text-sm text-muted">Pick any that fit.</p></div>
        <div className="grid gap-2 sm:grid-cols-2">
          {WHY.map((w, i) => (
            <label key={w} className="flex cursor-pointer items-start gap-2.5 rounded-xl border-bold border-line p-3 text-sm hover:border-ink/50">
              <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--c-ink)]" checked={yes(`why${i}`)} onChange={(e) => set(`why${i}`, e.target.checked ? 'yes' : '')} />{w}
            </label>
          ))}
        </div>
        <Field label="Other" htmlFor="dd-other"><TextInput id="dd-other" value={str('whyOther')} onChange={(v) => set('whyOther', v)} /></Field>
        <Field label="In one sentence, why did it work?" htmlFor="dd-why" help="This is the part you’ll repeat. If you don’t know why it worked, you can’t do it again on purpose.">
          <TextArea id="dd-why" rows={2} value={str('whySentence')} onChange={(v) => set('whySentence', v)} />
        </Field>
      </section>

      {/* Part 3 */}
      <section className="space-y-3">
        <div><p className="pixel text-xl text-accent">PART 3</p><h4 className="text-2xl font-bold">How will you do more of it?</h4><p className="text-sm text-muted">Pick at least one.</p></div>
        {WAYS.map((w) => {
          const on = yes(`way_${w.key}`)
          return (
            <div key={w.key} className={`rounded-2xl border-bold p-4 ${on ? 'border-ink bg-blush/40' : 'border-line'}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--c-ink)]" checked={on} onChange={(e) => set(`way_${w.key}`, e.target.checked ? 'yes' : '')} />
                <span><span className="font-bold">{w.title}</span> {w.desc}<span className="mt-1 block text-sm text-muted">Example: “{w.ex}”</span></span>
              </label>
              {on && <div className="mt-3"><Field label="What will you do?" htmlFor={`dd-${w.key}`}><TextArea id={`dd-${w.key}`} rows={2} value={str(`do_${w.key}`)} onChange={(v) => set(`do_${w.key}`, v)} /></Field></div>}
            </div>
          )
        })}
      </section>

      {/* Part 4 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">PART 4</p><h4 className="text-2xl font-bold">Stop doing one thing</h4>
          <p className="text-sm text-muted">You don’t have more time. You have to move it from what isn’t working to what is.</p></div>
        <Field label="What is one thing that took your time but didn’t bring in sales?" htmlFor="dd-stop"
          help="A platform, a type of post, a task or a habit. Examples: “Daily stories nobody replies to.” “Redesigning my graphics.” “Posting on a platform my buyers don’t use.”">
          <TextArea id="dd-stop" rows={2} value={str('stop')} onChange={(v) => set('stop', v)} />
        </Field>
        <div>
          <p className="text-sm font-semibold">I will stop it for the next 4 days</p>
          <div role="radiogroup" aria-label="I will stop it for the next 4 days" className="mt-1.5 flex gap-2">
            {['Yes', 'Not yet'].map((o) => (
              <label key={o} className={`relative cursor-pointer rounded-pill border-bold px-5 py-2 text-sm font-semibold ${str('stopYes') === o ? (o === 'Yes' ? 'border-success bg-success-soft text-success' : 'border-ink bg-highlight') : 'border-line bg-surface hover:border-ink/50'}`}>
                <input type="radio" className="sr-only" name={`${actionId}-stop`} checked={str('stopYes') === o} onChange={() => set('stopYes', o)} />{o}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Part 5 */}
      <section className="space-y-3">
        <div><p className="pixel text-xl text-accent">PART 5</p><h4 className="text-2xl font-bold">Your 4-day double down plan</h4>
          <p className="text-sm text-muted">Every day should be some version of your winner. If a day has nothing to do with it, it’s not doubling down.</p></div>
        <div className="overflow-hidden rounded-2xl border-bold border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg"><tr><th scope="col" className="w-16 px-3 py-2">Day</th><th scope="col" className="px-3 py-2">What I will do</th><th scope="col" className="w-20 px-3 py-2 text-center">Done</th></tr></thead>
            <tbody>
              {[1, 2, 3, 4].map((d) => (
                <tr key={d} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 font-semibold">Day {d}</th>
                  <td className="px-3 py-2"><input aria-label={`Day ${d}: what I will do`} className="field !py-2" value={str(`day${d}`)} onChange={(e) => set(`day${d}`, e.target.value)} /></td>
                  <td className="px-3 py-2 text-center"><input type="checkbox" aria-label={`Day ${d} done`} className="h-5 w-5 accent-[var(--c-ink)]" checked={yes(`done${d}`)} onChange={(e) => set(`done${d}`, e.target.checked ? 'yes' : '')} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Part 6 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">PART 6</p><h4 className="text-2xl font-bold">Results after 4 days</h4></div>
        {trio('After')}
        {verdict && (
          <p aria-live="polite" className={`rounded-2xl p-4 font-semibold ${verdict === 'more' ? 'bg-success-soft text-success' : 'bg-highlight/70'}`}>
            {verdict === 'more' ? 'It’s working. Keep it in your weekly rhythm from Action 08 after the challenge ends.' : 'Check Part 2. You may have repeated what you did, but not why it worked.'}
          </p>
        )}
        {(before.cash != null || after.cash != null) && <p className="text-xs text-muted">Cash before {fmtMoney(before.cash)} · after {fmtMoney(after.cash)}</p>}
      </section>

      {/* Part 7 */}
      <Summary lines={[
        `My winner: ${str('winner') || '…'}`,
        `Why it worked: ${str('whySentence') || '…'}`,
        `How I doubled down: ${ways.length ? ways.map((w) => w.key).join(' / ') : '…'}`,
        `What I stopped: ${str('stop') || '…'}`,
        `Before: ${before.sales ?? '…'} sales · After: ${after.sales ?? '…'} sales`,
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
