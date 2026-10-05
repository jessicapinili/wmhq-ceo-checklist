import type { ActionDef, PhaseId, TierId } from '../types'

export const DEFAULT_START = '2026-10-19'
export const DEFAULT_END = '2026-12-17'
export const CHALLENGE_DAYS = 60

export const TIERS: Record<TierId, { name: string; short: string; description: string; milestone: string }> = {
  1: { name: 'First Sale', short: 'Tier 01', description: 'Make one new paid sale during the challenge.', milestone: 'Make one new paid sale' },
  2: { name: 'Repeat Sales', short: 'Tier 02', description: 'Make three paid sales of the same offer during the challenge.', milestone: 'Make three paid sales of the same offer' },
  3: { name: '+$10K', short: 'Tier 03', description: 'Collect $10,000 more cash during the challenge than during the previous 60 days.', milestone: 'Collect $10,000 more than my previous 60-day baseline' },
}

export const PHASES: { id: PhaseId; number: string; name: string; days: [number, number]; intro: string }[] = [
  { id: 'plan', number: '01', name: 'Plan', days: [1, 14], intro: 'Choose your milestone, your buyer and your offer, then turn the number into weekly activity.' },
  { id: 'execute', number: '02', name: 'Execute', days: [15, 30], intro: 'Set up the minimum, create one way in and build a clear path to yes.' },
  { id: 'sell', number: '03', name: 'Sell', days: [31, 45], intro: 'Start conversations, run a focused push and follow up properly.' },
  { id: 'optimise', number: '04', name: 'Optimise', days: [46, 60], intro: 'Measure, fix the bottleneck, double down and finish strongly.' },
]

type Seed = [number, PhaseId, string, string, number]
const SEEDS: Seed[] = [
  [1, 'plan', 'Start Here', 'Choose your milestone and challenge rhythm.', 4],
  [2, 'plan', 'Lock in the Buyer', 'Choose exactly who you are selling to and what they want.', 7],
  [3, 'plan', 'Build or Fix the Offer', 'Create one clear offer that is ready to sell.', 10],
  [4, 'plan', 'Reverse-Engineer the Number', 'Turn the milestone into weekly sales activity.', 14],
  [5, 'execute', 'Set Up the Minimum', 'Make it clear what you sell and how someone can buy.', 18],
  [6, 'execute', 'Create One Way In', 'Give the right buyer one reason to raise her hand.', 22],
  [7, 'execute', 'Build the Sales Path', 'Give an interested buyer a clear way to say yes.', 26],
  [8, 'execute', 'Turn On Your Sales Engine', 'Create a repeatable rhythm that brings people towards the offer.', 30],
  [9, 'sell', 'Start Warm Conversations', 'Speak directly to the people most likely to need the offer.', 34],
  [10, 'sell', 'Run a Focused Sales Push', 'Give buyers a clear reason to make a decision now.', 38],
  [11, 'sell', 'Run the Sales Conversations', 'Move each interested buyer towards a clear decision.', 42],
  [12, 'sell', 'Follow Up and Expand', 'Recover undecided sales and create the next opportunity.', 45],
  [13, 'optimise', 'Measure', 'Find where the sales path is working and where it is leaking.', 49],
  [14, 'optimise', 'Fix the Bottleneck', 'Improve the weakest point using one controlled change.', 53],
  [15, 'optimise', 'Double Down', 'Put more energy into the activities producing results.', 57],
  [16, 'optimise', 'Final Push and CEO Review', 'Finish strongly, record the result and choose the next milestone.', 60],
]

const ACTION_01: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'Choose the right milestone and commit to the 60-day challenge.',
  why: 'Your tier determines what success means for this challenge. A clear milestone gives every action a purpose and makes it possible to measure your progress.',
  checklist: [
    'Choose your tier',
    'Record how much cash you collected in the previous 60 days',
    'Write your 60-day milestone',
    'Choose the offer you will sell',
    'Enter the price of the offer',
    'Block your CEO work time in your calendar',
    'Confirm that you have a working payment method',
    'Test your payment or booking link',
    'Post your tier and milestone in the community',
    'Confirm that you are ready to begin',
  ].map((label, i) => ({ id: `a01-c${i + 1}`, label })),
  tierRequirements: {
    1: 'I will make my first paid sale by 17 December 2026.',
    2: 'I will make three paid sales of the same offer by 17 December 2026.',
    3: 'I will collect $10,000 more cash than my previous 60-day baseline by 17 December 2026.',
  },
  fields: [
    { id: 'tier', label: 'Selected tier', type: 'tier', bind: 'tier' },
    { id: 'baseline', label: 'Previous 60-day cash baseline', type: 'currency', bind: 'baseline', help: 'Cash that actually landed in your account in the 60 days before the challenge.' },
    { id: 'milestone', label: 'Personal milestone', type: 'textarea', bind: 'milestone' },
    { id: 'offer', label: 'Primary offer', type: 'text', bind: 'offer', placeholder: 'e.g. 1:1 Brand Strategy Intensive' },
    { id: 'price', label: 'Offer price', type: 'currency', bind: 'offerPrice' },
    { id: 'payLink', label: 'Payment or booking link', type: 'url', placeholder: 'https://' },
    { id: 'workDays', label: 'Planned CEO work days', type: 'list', placeholder: 'e.g. Tuesday' },
    { id: 'workTime', label: 'Planned CEO work time', type: 'text', placeholder: 'e.g. 9:00 to 11:00am' },
    { id: 'reason', label: 'Personal reason for completing the challenge', type: 'textarea', placeholder: 'Why does this milestone matter to you right now?' },
    { id: 'postLink', label: 'Community post link', type: 'url', placeholder: 'https://' },
    { id: 'extra', label: 'Additional notes', type: 'textarea' },
  ],
  proof: ['Selected tier', 'Previous 60-day baseline', 'Personal milestone', 'Screenshot or confirmation of CEO time blocked in the calendar'],
  resources: [],
}

function placeholderFor(n: number): Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> {
  const p = String(n).padStart(2, '0')
  return {
    placeholder: true,
    outcome: `[Placeholder] Outcome for Action ${p} will be added here.`,
    why: `[Placeholder] "Why this matters" for Action ${p} will be added here.`,
    checklist: [1, 2, 3, 4].map((i) => ({ id: `a${p}-c${i}`, label: `[Placeholder] Checklist item ${i}` })),
    tierRequirements: {
      1: `[Placeholder] Tier 01 requirement for Action ${p}.`,
      2: `[Placeholder] Tier 02 requirement for Action ${p}.`,
      3: `[Placeholder] Tier 03 requirement for Action ${p}.`,
    },
    fields: [
      { id: 'answer', label: '[Placeholder] Your answer', type: 'textarea' },
      { id: 'link', label: '[Placeholder] Related link', type: 'url', placeholder: 'https://' },
    ],
    proof: [`[Placeholder] Proof requirement for Action ${p}`],
    resources: [{ label: '[Placeholder] Resources will be listed here' }],
  }
}

export const ACTIONS: ActionDef[] = SEEDS.map(([number, phase, title, summary, dueDay]) => ({
  id: `a${String(number).padStart(2, '0')}`,
  number, phase, title, summary, dueDay,
  ...(number === 1 ? ACTION_01 : placeholderFor(number)),
}))

export const actionById = (id: string) => ACTIONS.find((a) => a.id === id)
export const TOTAL_ITEMS = ACTIONS.reduce((n, a) => n + a.checklist.length, 0)
