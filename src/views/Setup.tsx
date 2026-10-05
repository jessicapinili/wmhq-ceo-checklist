import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { CHALLENGE_DAYS, TIERS } from '../data/content'
import { useStore } from '../store'
import type { Profile } from '../types'
import { Field, NumberInput, ProgressBar, TextArea, TextInput, TierPicker } from '../components/ui'
import { addDays, fmtLong } from '../utils'

const STEPS = ['Your details', 'Your tier', 'Your baseline', 'Your milestone', 'Your offer', 'Offer price', 'Start date', 'End date'] as const

/** Onboarding wizard. Also reused (as `editing`) from Settings to edit answers later. */
export default function Setup({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore()
  const [p, setP] = useState<Profile>(state.profile)
  const [step, setStep] = useState(0)
  const [welcome, setWelcome] = useState(false)
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }))

  const valid = [
    p.firstName.trim().length > 0 && p.lastName.trim().length > 0,
    p.tier !== null,
    p.baseline !== null,
    p.milestone.trim().length > 0,
    p.offer.trim().length > 0,
    p.offerPrice !== null,
    !!p.startDate,
    !!p.endDate && p.endDate > p.startDate,
  ][step]

  const next = () => {
    if (!valid) return
    if (step === 1 && p.tier && (!p.milestone || Object.values(TIERS).some((t) => t.milestone === p.milestone))) set({ milestone: TIERS[p.tier].milestone })
    if (step === 6) set({ endDate: addDays(p.startDate, CHALLENGE_DAYS - 1) })
    if (step < STEPS.length - 1) return setStep(step + 1)
    update((s) => ({ ...s, profile: { ...p, firstName: p.firstName.trim(), lastName: p.lastName.trim() }, setupComplete: true }))
    setWelcome(true)
  }

  if (welcome) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush"><Sparkles /></div>
          <h1 className="text-3xl font-bold sm:text-4xl">Welcome, {p.firstName.trim()}.</h1>
          <p className="mt-3 text-xl">Your next milestone is <span className="marker font-semibold">{p.milestone}</span>.</p>
          <p className="mt-4 text-muted">Ready when you are. One action at a time.</p>
          <button className="btn-primary mt-8" onClick={onDone}>Go to my dashboard <ArrowRight size={18} /></button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <p className="pixel text-xl text-accent">STEP {String(step + 1).padStart(2, '0')} OF {String(STEPS.length).padStart(2, '0')}</p>
      <div className="mb-6 mt-2"><ProgressBar thin value={((step + 1) / STEPS.length) * 100} label="Setup progress" /></div>
      <form onSubmit={(e) => { e.preventDefault(); next() }} className="space-y-5">
        {step === 0 && <>
          <H>Let's set up your challenge.</H>
          <p className="text-muted">Check your details. Your progress is saved to this email.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="s-name"><TextInput id="s-name" value={p.firstName} onChange={(v) => set({ firstName: v })} placeholder="First name" /></Field>
            <Field label="Last name" htmlFor="s-last"><TextInput id="s-last" value={p.lastName} onChange={(v) => set({ lastName: v })} placeholder="Last name" /></Field>
          </div>
          <Field label="Email" htmlFor="s-email" help="This is the email you used to sign up to the WMHQ CEO Checklist Challenge. To use a different one, log out and log in again.">
            <input id="s-email" className="field bg-bg/60 text-muted" value={p.email} readOnly />
          </Field>
        </>}
        {step === 1 && <>
          <H>Choose your tier.</H>
          <p className="text-muted">Pick the milestone that would genuinely move your business forward in the next 60 days. You can change it later in Settings.</p>
          <TierPicker name="setup-tier" value={p.tier} onChange={(t) => set({ tier: t })} />
        </>}
        {step === 2 && <>
          <H>What did you collect in the previous 60 days?</H>
          <Field label="Previous 60-day cash baseline" htmlFor="s-base" help="Cash that actually landed in your account, not invoices or pending payments. Enter 0 if you haven't made a sale yet.">
            <NumberInput id="s-base" currency value={p.baseline} onChange={(v) => set({ baseline: v })} placeholder="0" />
          </Field>
        </>}
        {step === 3 && <>
          <H>Confirm your milestone.</H>
          <p className="text-muted">We've suggested one based on your tier. Make it yours, adding a number or offer if it helps.</p>
          <Field label="Your 60-day milestone" htmlFor="s-ms"><TextArea id="s-ms" value={p.milestone} onChange={(v) => set({ milestone: v })} /></Field>
          {p.tier && p.milestone !== TIERS[p.tier].milestone && (
            <button type="button" className="text-sm font-semibold underline" onClick={() => set({ milestone: TIERS[p.tier!].milestone })}>Use the suggested milestone</button>
          )}
        </>}
        {step === 4 && <>
          <H>Which offer will you sell?</H>
          <Field label="Primary offer" htmlFor="s-offer" help="One offer. You can start selling at any point."><TextInput id="s-offer" value={p.offer} onChange={(v) => set({ offer: v })} placeholder="e.g. 1:1 Brand Strategy Intensive" /></Field>
        </>}
        {step === 5 && <>
          <H>What does it cost?</H>
          <Field label="Offer price" htmlFor="s-price"><NumberInput id="s-price" currency value={p.offerPrice} onChange={(v) => set({ offerPrice: v })} placeholder="0" /></Field>
        </>}
        {step === 6 && <>
          <H>When does your challenge start?</H>
          <Field label="Challenge start date" htmlFor="s-start" help="The group challenge starts Monday 19 October 2026."><TextInput id="s-start" type="date" value={p.startDate} onChange={(v) => set({ startDate: v })} /></Field>
        </>}
        {step === 7 && <>
          <H>Confirm your end date.</H>
          <p className="text-muted">60 days from {fmtLong(p.startDate)} is {fmtLong(addDays(p.startDate, CHALLENGE_DAYS - 1))}.</p>
          <Field label="Challenge end date" htmlFor="s-end"><TextInput id="s-end" type="date" value={p.endDate} onChange={(v) => set({ endDate: v })} /></Field>
          {!valid && <p className="text-sm text-danger">The end date needs to be after the start date.</p>}
        </>}
        <div className="flex items-center justify-between pt-4">
          {step > 0 ? <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button> : <span />}
          <button type="submit" className="btn-primary" disabled={!valid}>{step === STEPS.length - 1 ? 'Save and begin' : 'Continue'} <ArrowRight size={16} /></button>
        </div>
      </form>
    </Shell>
  )
}

const H = ({ children }: { children: React.ReactNode }) => <h1 className="text-2xl font-bold sm:text-3xl">{children}</h1>

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-10">
      <p className="pixel mb-6 text-center text-3xl leading-none sm:text-5xl">THE WMHQ CEO<br />CHECKLIST CHALLENGE</p>
      <main className="card w-full max-w-2xl p-6 sm:p-10">{children}</main>
    </div>
  )
}
