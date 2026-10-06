import { Check, Copy, Download, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { JOIN_WMHQ_URL, WMHQ_PORTAL_URL } from '../data/content'
import { useStore } from '../store'
import { fmtMoney, progressOf, scoreTotals } from '../utils'
import { bottleneckLabel } from './BottleneckWorkspace'
import { patternFor } from './PatternQuiz'
import { Field, NumberInput, TextArea, TextInput } from './ui'

const SUPPORT = ['More strategy', 'Mindset and pattern work', 'Accountability', '1:1 support', 'I’ve got it']
const MILESTONE = ['Yes', 'Not yet', 'Went past it']

export default function CeoReviewWorkspace({ actionId }: { actionId: string }) {
  const { state, setAction } = useStore()
  const f = progressOf(state, actionId).fields
  const str = (k: string) => (typeof f[k] === 'string' ? (f[k] as string) : '')
  const has = (k: string) => typeof f[k] === 'string'
  const num = (k: string) => (str(k) !== '' ? Number(str(k)) : null)
  const set = (k: string, v: string | string[]) => setAction(actionId, (x) => ({ ...x, fields: { ...x.fields, [k]: v } }))
  const from = (id: string, k: string) => { const v = progressOf(state, id).fields[k]; return typeof v === 'string' ? v.trim() : '' }

  // Pulled from earlier actions, but editable here (her edit wins once she types).
  const score = scoreTotals(state)
  const pulled = (k: string, fallback: string) => (has(k) ? str(k) : fallback)
  const oneLiner = pulled('oneLiner', from('a03', 'oneLiner'))
  const worked = pulled('worked', from('a15', 'winner'))
  const lostMost = pulled('lostMost', bottleneckLabel(state))
  const sales = has('sales') ? num('sales') : score.sales || null
  const cash = has('cash') ? num('cash') : score.cash || null
  const pattern = patternFor(progressOf(state, 'a10').fields)
  const winner15 = from('a15', 'winner')

  const people = Array.from({ length: 5 }, (_, i) => str(`person${i + 1}`))
  const links: { label: string; url: string }[] = (Array.isArray(f.links) ? f.links : []).map((x) => { try { return JSON.parse(x) } catch { return { label: '', url: String(x) } } })
  const saveLinks = (l: typeof links) => set('links', l.map((x) => JSON.stringify(x)))
  const support = (Array.isArray(f.support) ? f.support : []) as string[]

  const area = (k: string, label: string, help?: string, value?: string) => (
    <Field label={label} htmlFor={`cr-${k}`} help={help}><TextArea id={`cr-${k}`} rows={2} value={value ?? str(k)} onChange={(v) => set(k, v)} /></Field>
  )

  return (
    <div className="space-y-10">
      {/* Part 1 */}
      <section className="space-y-4">
        <div><p className="pixel text-xl text-accent">FINAL PUSH</p><h4 className="text-2xl font-bold">One last push before you review.</h4></div>
        <div>
          <p className="text-sm font-semibold">Who are 5 people you can message in the next 3 days?</p>
          <p className="mb-2 text-sm text-muted">Your “not yet” list, past buyers, or your warmest contacts.</p>
          <div className="grid gap-2 sm:grid-cols-5">
            {people.map((p, i) => <input key={i} aria-label={`Person ${i + 1}`} className="field !py-2" placeholder={`Person ${i + 1}`} value={p} onChange={(e) => set(`person${i + 1}`, e.target.value)} />)}
          </div>
        </div>
        <div className="space-y-2">
          {area('send', 'What will you send them?', 'Use your winner from Action 15.')}
          {winner15 && !str('send') && <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => set('send', winner15)}><Copy size={14} /> Start from your Action 15 winner</button>}
        </div>
        {area('reason', 'What is your reason to buy now?', 'The challenge ending is real. Example: “I’m closing spots for this round on [date].”')}
        <div>
          <p className="mb-2 text-sm font-semibold">How did your final push go?</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[['pushSent', 'Messages sent'], ['pushReplies', 'Replies'], ['pushSales', 'Sales']].map(([k, l]) => (
              <Field key={k} label={l} htmlFor={`cr-${k}`}><NumberInput id={`cr-${k}`} value={num(k)} onChange={(v) => set(k, v == null ? '' : String(v))} /></Field>
            ))}
          </div>
        </div>
      </section>

      {/* Part 2 */}
      <section className="space-y-8">
        <div>
          <p className="pixel text-xl text-accent">CEO REVIEW</p>
          <h4 className="text-2xl font-bold">Look back like a CEO.</h4>
          <p className="mt-1 text-muted">Answer honestly. This is for you. You can add links to anything you built or posted.</p>
        </div>

        <div className="space-y-4">
          <h5 className="text-lg font-bold">Your results</h5>
          <div>
            <p className="text-sm font-semibold">Did you hit your milestone?</p>
            <div role="radiogroup" aria-label="Did you hit your milestone?" className="mt-1.5 flex flex-wrap gap-2">
              {MILESTONE.map((o) => (
                <label key={o} className={`relative cursor-pointer rounded-pill border-bold px-5 py-2 text-sm font-semibold ${str('milestone') === o ? (o === 'Not yet' ? 'border-ink bg-highlight' : 'border-success bg-success-soft text-success') : 'border-line bg-surface hover:border-ink/50'}`}>
                  <input type="radio" className="sr-only" name={`${actionId}-ms`} checked={str('milestone') === o} onChange={() => set('milestone', o)} />{o}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="How many sales did you make in 60 days?" htmlFor="cr-sales" help="Starts from your CEO Scorecard. Change it if it’s not right."><NumberInput id="cr-sales" value={sales} onChange={(v) => set('sales', v == null ? '' : String(v))} /></Field>
            <Field label="How much cash did you collect in 60 days?" htmlFor="cr-cash" help="Starts from your CEO Scorecard. Change it if it’s not right."><NumberInput id="cr-cash" currency value={cash} onChange={(v) => set('cash', v == null ? '' : String(v))} /></Field>
          </div>
          {area('proud', 'What result are you most proud of?')}
          <Field label="Add a link (optional)" htmlFor="cr-proudLink" help="A screenshot, post, review or sale."><TextInput id="cr-proudLink" type="url" placeholder="https://" value={str('proudLink')} onChange={(v) => set('proudLink', v)} /></Field>
        </div>

        <div className="space-y-4">
          <h5 className="text-lg font-bold">What you built</h5>
          {area('oneLiner', 'Your offer one-liner today', 'Pulled from Action 03. Change it if it has grown.', oneLiner)}
          <div>
            <p className="text-sm font-semibold">Links to what you built</p>
            <p className="mb-2 text-sm text-muted">Add as many as you like. Examples: offer or sales page, way in, booking or checkout link, best post, testimonial.</p>
            <ul className="space-y-2">
              {links.map((l, i) => (
                <li key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                  <input aria-label={`Link ${i + 1} label`} className="field !py-2" placeholder="Label, e.g. Sales page" value={l.label} onChange={(e) => saveLinks(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <input aria-label={`Link ${i + 1} address`} type="url" className="field !py-2" placeholder="https://" value={l.url} onChange={(e) => saveLinks(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                  <button type="button" className="justify-self-end rounded-full p-2 text-muted hover:bg-bg hover:text-danger" aria-label={`Remove ${l.label || 'link'}`} onClick={() => saveLinks(links.filter((_, j) => j !== i))}><X size={16} /></button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-ghost mt-2 !px-4 !py-2" onClick={() => saveLinks([...links, { label: '', url: '' }])}><Plus size={16} /> Add a link</button>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-lg font-bold">What worked and what didn’t</h5>
          {area('worked', 'What worked best?', 'Pulled from Action 15. Change it if you need to.', worked)}
          {area('didnt', 'What didn’t work, and why?')}
          {area('lostMost', 'Where did you lose the most sales?', 'Pulled from Action 14. Change it if you need to.', lostMost)}
          {area('differently', 'What would you do differently if you started again tomorrow?')}
        </div>

        <div className="space-y-4">
          <h5 className="text-lg font-bold">Who you became</h5>
          {area('easier', 'What sales action feels easier now than it did on day 1?')}
          {area('pattern', `Your sabotage pattern from Action 10${pattern ? `: ${pattern.name}` : ''}. Did it show up less? What changed?`)}
          {area('learned', 'What did you learn about yourself as a business owner?')}
        </div>

        <div className="space-y-4">
          <h5 className="text-lg font-bold">Your CEO decisions</h5>
          <div className="grid gap-3 lg:grid-cols-3">
            {area('keep', 'Keep: What will you keep doing after the challenge?')}
            {area('stop', 'Stop: What will you stop doing?')}
            {area('start', 'Start: What will you start doing in the next 60 days?')}
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-lg font-bold">Your next 60 days</h5>
          {area('next', 'Your next milestone', 'First sale done? Aim for repeat sales. Selling consistently? Aim for +$10K. Already there? Set your next cash goal.')}
          {area('oneThing', 'The one thing that will make the biggest difference')}
          <div>
            <p className="text-sm font-semibold">What support do you need to get there?</p>
            <p className="mb-2 text-sm text-muted">Pick any that fit.</p>
            <div className="flex flex-wrap gap-2">
              {SUPPORT.map((o) => {
                const on = support.includes(o)
                return (
                  <label key={o} className={`flex cursor-pointer items-center gap-2 rounded-pill border-bold px-4 py-2 text-sm font-semibold ${on ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink/50'}`}>
                    <input type="checkbox" className="h-4 w-4 accent-[var(--c-ink)]" checked={on} onChange={(e) => set('support', e.target.checked ? [...support, o] : support.filter((x) => x !== o))} />{o}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Part 3 */}
      <CeoSummary lines={[
        `60 days: ${sales ?? 0} sales · ${fmtMoney(cash ?? 0)} collected`,
        `Milestone: ${str('milestone') || '…'}`,
        `Proudest result: ${str('proud') || '…'}`,
        `Keep: ${str('keep') || '…'} · Stop: ${str('stop') || '…'} · Start: ${str('start') || '…'}`,
        `Next milestone: ${str('next') || '…'}`,
      ]} />

      {/* Part 4 */}
      <section className="no-print space-y-3">
        <h4 className="text-2xl font-bold">What’s next</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-bold border-ink/20 bg-surface p-4">
            <p className="label-caps">Not in WMHQ yet</p>
            <p className="mt-2 font-semibold">Keep going inside WMHQ.</p>
            <p className="mt-1 text-sm text-muted">You’ve built the system. WMHQ is where you keep it running, with the strategy, the subconscious work and the support to hit your next milestone.</p>
            <a href={JOIN_WMHQ_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex font-bold underline decoration-2 underline-offset-4">Join WMHQ →</a>
          </div>
          <div className="rounded-2xl border-bold border-ink bg-blush/40 p-4">
            <p className="label-caps !text-ink">Already in WMHQ</p>
            <p className="mt-2 font-semibold">Take your next milestone into WMHQ.</p>
            <p className="mt-1 text-sm text-muted">Bring your CEO Review to the next call, and use your Personal Portal to plan your next 60 days.</p>
            <a href={WMHQ_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex font-bold underline decoration-2 underline-offset-4">Open your Personal Portal →</a>
          </div>
        </div>
      </section>
    </div>
  )
}


function CeoSummary({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false)
  return (
    <section className="rounded-card border-bold border-ink bg-ink p-6 text-surface shadow-card">
      <p className="pixel text-xl text-blush">YOUR CEO SUMMARY</p>
      <div className="mt-2 space-y-1.5 text-lg">{lines.map((l) => <p key={l}>{l}</p>)}</div>
      <div className="no-print mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn bg-surface !px-4 !py-2 text-ink" onClick={() => window.print()}><Download size={16} /> Save as PDF</button>
        <button type="button" className="btn border-bold border-surface/40 !px-4 !py-2 text-surface" onClick={async () => {
          try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* blocked */ }
        }}>{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy summary</>}</button>
      </div>
      <p className="no-print mt-2 text-xs opacity-70">Save as PDF opens your print window. Choose “Save as PDF” as the printer.</p>
    </section>
  )
}
