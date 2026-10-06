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

// Links used in the "Get help with this" boxes.
export const WMHQ_VAULT_URL = 'https://www.jessicapinili.com/login'
export const JOIN_WMHQ_URL = 'https://womanmasteryhq.com/joinmembership'
export const WMHQ_PORTAL_URL = 'https://womanmasteryhqportal.com'
export const WMHQ_TOOLS_URL = 'https://tools.womanmasteryhqportal.com/'

const ACTION_02: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'You know exactly who you are selling to, and you can describe them in their own words.',
  description: 'Get clear on exactly who you want to sell to. Know what they want, what they are struggling with, what they are worried about, and what they have already tried to fix it.',
  why: 'If you try to sell to everyone, your message lands with no one. When you know exactly who they are, what they want, and what scares them, your posts, DMs and offers start to sound like you are reading their mind. That is what makes someone buy. Every other action in this challenge is built on this one.',
  checklist: [
    'Pick one type of person to sell to',
    'Write what they want most right now',
    'Write what they are struggling with right now',
    'Write what they are worried about',
    'Write what they have already tried that did not work',
    'Complete your tier requirement',
    'Write your buyer sentence',
    'Read it back and ask: would they say “that’s me”?',
  ].map((label, i) => ({ id: `a02-c${i + 1}`, label })),
  tierIntro: 'This is where the tiers really show. Each tier gets its buyer from a different source.',
  tierRequirements: {
    1: 'You have no buyers yet, so you need to talk to real people, not guess. Have 3 conversations by DM, call or voice note with women who fit your buyer. No audience yet? Message people you already know, or join a group where your client or customer hangs out. Ask the 4 questions below and write down her exact words.',
    2: 'Your best future buyer has already bought from you. List every past buyer. Choose the 3 you would most love to sell to again. Message 2 of them and ask what made them buy and what they need help with now.',
    3: 'Your buyer is already in your numbers. List your top 5 clients by cash collected. Write down what they have in common: where they were stuck, what they wanted, and why they said yes fast. That pattern is your buyer.',
  },
  help: {
    inWmhq: { line: 'Open the Buyer Avatar Worksheet in CEO Influence. It walks you through this step by step.', linkLabel: 'Open the WMHQ Vault', url: WMHQ_VAULT_URL },
    notInWmhq: {
      line: 'Copy this prompt into ChatGPT, Claude, or any AI you use. Fill in the brackets first.',
      prompt: `I sell [your product or service] to [who you think buys it]. Interview me to find my exact buyer. Ask one question at a time. If my answer is vague or could apply to anyone, push back and make me be more specific.

Find out:
1. Who exactly they are
2. What they want most right now
3. What they struggle with right now
4. What they are worried about
5. What they have already tried that did not work

No generic answers. Then write: I help [who] get [what they want] without [what they are worried about], even if they have already tried [what did not work]. Use simple words.`,
      bridge: 'AI can help you get the facts down. Inside WMHQ, you get the full training and tools for every action in this challenge.',
      joinLabel: 'Join WMHQ',
      joinUrl: JOIN_WMHQ_URL,
    },
  },
  fields: [
    // Tier-specific workspaces (shown inside "Your tier requirement")
    { id: 't1Conversations', label: 'Your 3 conversations', type: 'list', tiers: [1], placeholder: 'Who you spoke to, and what she said word for word', help: 'Add one line per conversation.' },
    { id: 't2PastBuyers', label: 'Every past buyer', type: 'list', tiers: [2], placeholder: 'Name' },
    { id: 't2Top3', label: 'The 3 you would most love to sell to again', type: 'textarea', tiers: [2] },
    { id: 't2Answers', label: 'What 2 of them told you', type: 'textarea', tiers: [2], help: 'What made them buy, and what they need help with now.' },
    { id: 't3TopClients', label: 'Your top 5 clients by cash collected', type: 'list', tiers: [3], placeholder: 'Client and amount, e.g. Sarah, $4,500' },
    { id: 't3Pattern', label: 'What they have in common', type: 'textarea', tiers: [3], help: 'Where they were stuck, what they wanted, and why they said yes fast.' },
    // Shared buyer questions
    { id: 'who', label: 'Who is the one type of client or customer you are selling to?', type: 'textarea', help: 'Be specific. “Dog owners” is too wide. “Owners of anxious rescue dogs” is clear. “Busy people” is too wide. “Nurses who work night shift” is clear.' },
    { id: 'want', label: 'What do they want most right now?', type: 'textarea', help: 'Write it how they would say it, not how you would.' },
    { id: 'struggle', label: 'What are they struggling with right now?', type: 'textarea', help: 'What goes wrong for them in a normal week?' },
    { id: 'worried', label: 'What are they worried about?', type: 'textarea', help: 'This is the fear that stops them from buying, like wasting money, it not working for them, or looking silly.' },
    { id: 'tried', label: 'What have they already tried that did not work?', type: 'textarea', help: 'Cheaper versions, free videos, doing it alone, a competitor.' },
    { id: 'quote', label: 'What did they say, word for word?', type: 'textarea', help: 'Paste one real thing a client or customer said, from a DM, review, email or call.' },
    { id: 'buyerSentence', label: 'Your buyer sentence', type: 'textarea', placeholder: 'I help [who] get [what they want] without [what they are worried about], even if they have already tried [what did not work].',
      help: 'Fill in: I help [who] get [what they want] without [what they are worried about], even if they have already tried [what did not work].',
      compose: 'I help {who} get {want} without {worried}, even if they have already tried {tried}.' },
  ],
  proof: [
    'Your buyer sentence',
    'The one type of person you are selling to',
    'One thing a real buyer said, word for word (remove names)',
    'Your tier requirement: how many conversations, past buyers or top clients you used',
  ],
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
  ...(number === 1 ? ACTION_01 : number === 2 ? ACTION_02 : placeholderFor(number)),
}))

export const actionById = (id: string) => ACTIONS.find((a) => a.id === id)
export const TOTAL_ITEMS = ACTIONS.reduce((n, a) => n + a.checklist.length, 0)
