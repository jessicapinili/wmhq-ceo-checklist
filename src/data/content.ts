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

const ACTION_03: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'You have one clear offer, a price, and a one-liner that makes people want to buy.',
  description: 'Turn what you sell into one clear offer that is easy to say yes to. Know the result they get, what is included, why they should buy now, how to make it low risk, and what it costs.',
  why: `Your product or service is what you deliver. Your offer is how you package it and explain it. They are not the same thing, and the difference is what gets people to buy.

One product can be many offers. A candle maker can sell one candle, or a “Sleep Better Kit” with a candle, a pillow spray and a bedtime guide. A personal trainer can sell single sessions, or a “Wedding Ready in 12 Weeks” package. Same product, different offer, very different sales.

A strong offer has four things: a clear result, real value, a reason to buy now, and low risk. When all four are there, saying no feels harder than saying yes.`,
  checklist: [
    'Paste your buyer sentence from Action 02',
    'Choose the product or service you will sell',
    'Write the result they get',
    'List what is included',
    'Give them a reason to buy now',
    'Make it low risk to say yes',
    'Set your price',
    'Write your offer one-liner',
    'Complete your tier requirement',
    'Test your payment or booking link',
  ].map((label, i) => ({ id: `a03-c${i + 1}`, label })),
  tierRequirements: {
    1: 'Build one offer only, not three. Then share your one-liner with 3 people who match your buyer. Ask them, “Would you buy this? What would stop you?” Change the offer based on what they say.',
    2: 'Fix the offer you have sold before so people buy it again. Look at what past clients or customers bought, and add a reason to come back, such as a next step, a refill, a monthly option or a bundle. Share the new one-liner with 2 past buyers.',
    3: 'Sharpen the offer that already brings in the most cash. Choose one move: raise the price, add a higher-priced option, or bundle it into something bigger. Write down which move you chose and how much extra cash it could bring in over 60 days.',
  },
  help: {
    inWmhq: { line: 'Open the One Liner Builder in the WMHQ Tools hub. Enter your answers from the workspace below, and it builds your one-liner for you.', linkLabel: 'Open WMHQ Tools', url: WMHQ_TOOLS_URL },
    notInWmhq: {
      line: 'Copy this prompt into ChatGPT, Claude, or any AI you use. Fill in the brackets first.',
      prompt: `I sell [your product or service] to [paste your buyer sentence]. Interview me to build one offer they would find hard to refuse. Ask one question at a time. If my answer is vague or could apply to anyone, push back.

Find out:
1. The clear result they get
2. What is included
3. Why they should buy now
4. How to make it low risk to say yes
5. The price

Then write my offer one-liner in this format: [Offer name] helps [who] [get result] in [time] without [what they are worried about]. Give me 3 versions. Use simple words.`,
      bridge: 'AI can help you get the facts down. Inside WMHQ, you get the full training and tools for every action in this challenge.',
      joinLabel: 'Join WMHQ',
      joinUrl: JOIN_WMHQ_URL,
    },
  },
  fields: [
    // Tier-specific workspaces
    { id: 't1Feedback', label: 'Who you shared it with, and what they said', type: 'list', tiers: [1], placeholder: 'Name: would they buy? What would stop them?', help: 'Share your one-liner with 3 people who match your buyer. Add one line per person.' },
    { id: 't1Changes', label: 'What you changed based on their answers', type: 'textarea', tiers: [1] },
    { id: 't2Bought', label: 'What past clients or customers bought', type: 'textarea', tiers: [2] },
    { id: 't2ComeBack', label: 'Your reason to come back', type: 'textarea', tiers: [2], help: 'Such as a next step, a refill, a monthly option or a bundle.' },
    { id: 't2Shared', label: 'The 2 past buyers you shared it with, and what they said', type: 'list', tiers: [2], placeholder: 'Name: what they said' },
    { id: 't3Offer', label: 'The offer that brings in the most cash', type: 'text', tiers: [3] },
    { id: 't3Move', label: 'The move you chose', type: 'textarea', tiers: [3], help: 'Raise the price, add a higher-priced option, or bundle it into something bigger.' },
    { id: 't3Extra', label: 'Extra cash it could bring in over 60 days', type: 'currency', tiers: [3] },
    // Shared workspace
    { id: 'buyerSentence', label: 'Your buyer sentence', type: 'textarea', help: 'Paste it from Action 02.', copyFrom: { action: 'a02', field: 'buyerSentence', label: 'Paste from Action 02' } },
    { id: 'product', label: 'What product or service are you selling?', type: 'text', help: 'Just name it plainly, like “1:1 coaching”, “a skincare set” or “an online course”.' },
    { id: 'result', label: 'What result do they get?', type: 'textarea', help: 'What is different for them after? “Sleeps through the night”, not “better sleep”.' },
    { id: 'included', label: 'What is included?', type: 'list', placeholder: 'e.g. 4 x 60-minute sessions', help: 'List everything they get, such as sessions, items, bonuses or support.' },
    { id: 'buyNow', label: 'Why should they buy now?', type: 'textarea', help: 'A deadline, limited spots, a launch bonus, or a season like summer or Christmas.' },
    { id: 'lowRisk', label: 'How do you make it low risk?', type: 'textarea', help: 'A guarantee, a payment plan, a trial, or a smaller first step.' },
    { id: 'price', label: 'What is the price?', type: 'currency', bind: 'offerPrice' },
    { id: 'oneLiner', label: 'Your offer one-liner', type: 'textarea', placeholder: '[Offer name] helps [who] [get result] in [time] without [what they are worried about].',
      help: 'Fill in: [Offer name] helps [who] [get result] in [time] without [what they are worried about].',
      examples: [
        { label: 'Product', text: 'The Calm Pup Plan helps owners of anxious rescue dogs get a relaxed dog on walks in 4 weeks, without harsh training methods.' },
        { label: 'Service', text: 'The Tax Time Rescue helps tradies with messy receipts get their tax return lodged in 7 days, without spending their weekends sorting paperwork.' },
        { label: 'Info', text: 'The First Ten Thousand Course helps new Etsy sellers get their first 100 orders in 90 days, without paying for ads.' },
      ] },
    { id: 'payLink', label: 'Payment or booking link', type: 'url', placeholder: 'https://', help: 'Open it yourself and check it works before anyone else uses it.', copyFrom: { action: 'a01', field: 'payLink', label: 'Paste from Action 01' } },
  ],
  proof: [
    'Your offer one-liner',
    'Your price',
    'Your tier requirement: the feedback you got, the past buyers you shared it with, or the move you chose and the extra cash it could bring in',
    'A screenshot showing your payment or booking link works',
  ],
  resources: [],
}

const ACTION_04: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'You know exactly how many sales you need, and how many people need to see your offer each week to get them.',
  description: 'Work backwards from your milestone to find your numbers. Know how many sales you need, how many people need to see your offer to get those sales, and how far you are from that today.',
  why: `Most people set a goal and then just hope. Working backwards turns your goal into a weekly number you can act on. If you need 2 sales and 1 in 10 people buy, you need 20 real conversations. That is something you can do this week.

Views, likes and followers do not count here. Only people who are looking at your offer count. That means they landed on your sales page, sent you a DM about it, booked a call, or made an enquiry.`,
  checklist: [
    'Check your tier and price (pulled from Actions 01 and 03)',
    'Set your sales target',
    'Choose how people buy from you',
    'Set your conversion rate (or use the starting guess)',
    'Enter how many people see your offer now',
    'Read your gap',
    'Write your weekly number',
  ].map((label, i) => ({ id: `a04-c${i + 1}`, label })),
  tierRequirements: {
    1: 'Your target is 1 sale. Use the starting guess for your conversion rate. Your job is to find out how many conversations you need, and to book the first 3 in your calendar this week.',
    2: 'Set how many repeat sales you want in 60 days, at least 3. Count how many past clients or customers you can contact. If that number is lower than what the calculator says you need, write down where you will find more people who buy.',
    3: 'Use your real conversion rate, not a guess. Find it in your sales page analytics, or work it out from your last 60 days by dividing your sales by the number of people who saw your offer. Then write the one lever you will pull first: more traffic, a better conversion rate, or a higher price.',
  },
  help: {
    inWmhq: { line: 'For deeper planning beyond this challenge, use the Conversion Calculator in the WMHQ Tools hub. It lets you test different prices, rates and time frames.', linkLabel: 'Open WMHQ Tools', url: WMHQ_TOOLS_URL },
    notInWmhq: { line: 'The calculator below has everything you need for this action.' },
  },
  calculator: 'reverse-engineer',
  fields: [
    { id: 't1Booked', label: 'Your first 3 conversations, booked this week', type: 'list', tiers: [1], placeholder: 'Who and when, e.g. Sarah, Tuesday 2pm' },
    { id: 't2Contacts', label: 'How many past clients or customers can you contact?', type: 'number', tiers: [2], help: 'Compare this with “people need to see it” in your numbers below.' },
    { id: 't2MorePeople', label: 'If that’s not enough, where will you find more people who buy?', type: 'textarea', tiers: [2] },
    { id: 't3Lever', label: 'The one lever you will pull first', type: 'textarea', tiers: [3], help: 'More traffic, a better conversion rate, or a higher price. Say which one, and why.' },
    { id: 'weekly', label: 'Your weekly number, and how you will hit it', type: 'textarea', placeholder: 'I will have 5 sales conversations a week by messaging past clients and replying to every comment.',
      help: 'For example: “I will have 5 sales conversations a week by messaging past clients and replying to every comment.”' },
  ],
  proof: [
    'Your sales target',
    'Your weekly number: how many people need to see your offer each week',
    'Your gap: how many more each week you need',
    'Your tier requirement: the 3 conversations you booked, how many past buyers you can contact, or the lever you chose',
  ],
  resources: [],
}

const ACTION_05: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'Anyone who finds you can tell what you sell and how to buy it in under 10 seconds.',
  description: 'Make it clear what you sell and how someone can buy. Fix your bio, your link, and the one place people go to learn about your offer, so nobody has to guess.',
  why: `Before anyone buys, they check you out. They look at your bio, your link, or your website. If they can't tell what you sell, they leave, and you never even know they were there.

You don't need a fancy website or a big launch. You need the minimum: one clear sentence about what you sell, one link that goes to your offer, and one clear next step. That's enough to make sales.`,
  checklist: [
    'Choose the one main place people find you',
    'Update your bio with your offer one-liner',
    'Set one link that goes straight to your offer',
    'Check your offer page, menu or post is up to date',
    'Write your call to action',
    'Pin a post about your offer',
    'Complete your tier requirement',
    'Do the stranger test',
  ].map((label, i) => ({ id: `a05-c${i + 1}`, label })),
  tierRequirements: {
    1: 'Make your offer visible for the first time. Your bio, link and pinned post must all mention the offer from Action 03. Ask 1 person who doesn’t know your business to look at your profile for 10 seconds, then tell you what you sell.',
    2: 'Make it easy for past buyers to buy again. Add a clear “buy again” or “book again” option to your link or offer page, and check your pinned post shows the offer you are selling in this challenge, not an old one.',
    3: 'Clean up the clutter. Remove or hide any old offers, links or posts that pull attention away from your main offer. One main offer should be front and centre everywhere. Write down what you removed.',
  },
  help: {
    inWmhq: { line: 'Open the Revenue Events Dashboard inside WMHQ Personal Portal. It shows you how to set up your profile so it sells for you.', linkLabel: 'Open the WMHQ Personal Portal', url: WMHQ_PORTAL_URL },
    notInWmhq: {
      line: 'Copy this prompt into ChatGPT, Claude, or any AI you use. Fill in the brackets first.',
      prompt: `Here is my offer one-liner: [paste from Action 03]. My buyer is: [paste buyer sentence from Action 02]. I sell on [platform], and I want people to [DM me / book a call / buy now / enquire].

Write 3 different calls to action I can use in my bio and pinned post. Each one must tell people exactly what to do next and why they should do it now. Keep each under 15 words. No hype, simple words.`,
      bridge: 'AI can help you get the facts down. Inside WMHQ, you get the full training and tools for every action in this challenge.',
      joinLabel: 'Join WMHQ',
      joinUrl: JOIN_WMHQ_URL,
    },
  },
  fields: [
    // Tier-specific workspaces
    { id: 't1AllMention', label: 'Do your bio, link and pinned post all mention your offer from Action 03?', type: 'yesno', tiers: [1], ifNotYet: 'Update whichever one is missing it, then tick this again.' },
    { id: 't2BuyAgain', label: 'Your “buy again” or “book again” link', type: 'url', tiers: [2], placeholder: 'https://' },
    { id: 't2PinnedCurrent', label: 'Does your pinned post show the offer you are selling in this challenge?', type: 'yesno', tiers: [2], ifNotYet: 'Swap it for a post about your current offer.' },
    { id: 't3Removed', label: 'What you removed or hid', type: 'list', tiers: [3], placeholder: 'e.g. Old freebie link in bio' },
    // Shared workspace
    { id: 'mainPlace', label: 'Where do people find you most?', type: 'text', placeholder: 'e.g. Instagram', help: 'Instagram, TikTok, your website, LinkedIn, email list or a shopfront. Pick one main place.' },
    { id: 'bio', label: 'Your new bio', type: 'textarea', help: 'Use your offer one-liner from Action 03. Keep it short.', copyFrom: { action: 'a03', field: 'oneLiner', label: 'Paste from Action 03' } },
    { id: 'mainLink', label: 'Your main link', type: 'url', placeholder: 'https://', help: 'This must go straight to your offer, booking page or checkout. Not your home page.' },
    { id: 'offerPage', label: 'Your offer page, menu or post', type: 'url', placeholder: 'https://', help: 'Where can someone read about the offer and its price?' },
    { id: 'ctaType', label: 'What do you want people to do?', type: 'select', options: ['DM me', 'Book a call', 'Buy now', 'Enquire', 'Other'] },
    { id: 'cta', label: 'Your call to action', type: 'text', placeholder: 'The exact words people will see',
      help: 'Tell them what to do and what they get. Examples: “DM me SLEEP for the kit details.” “Book a free 15-minute call to see if it suits you.” “Shop the starter set below.”' },
    { id: 'pinned', label: 'Your pinned post', type: 'url', placeholder: 'https://', help: 'Paste the link to the post you pinned.' },
    { id: 'strangerSaid', label: 'What did they say you sell?', type: 'textarea',
      group: { title: 'The stranger test', intro: 'Ask someone who doesn’t know your business to look at your profile for 10 seconds.' } },
    { id: 'strangerMatch', label: 'Did it match your offer?', type: 'yesno', ifNotYet: 'Fix your bio, link or pinned post, then test again.' },
    { id: 'strangerClicks', label: 'Could they get to the buy or book page in 2 clicks or fewer?', type: 'yesno', ifNotYet: 'Fix your bio, link or pinned post, then test again.' },
  ],
  proof: [
    'A screenshot of your updated bio and link',
    'Your call to action',
    'Your pinned post',
    'Your stranger test result: what they said you sell',
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
  ...(number === 1 ? ACTION_01 : number === 2 ? ACTION_02 : number === 3 ? ACTION_03 : number === 4 ? ACTION_04 : number === 5 ? ACTION_05 : placeholderFor(number)),
}))

export const actionById = (id: string) => ACTIONS.find((a) => a.id === id)
export const TOTAL_ITEMS = ACTIONS.reduce((n, a) => n + a.checklist.length, 0)
