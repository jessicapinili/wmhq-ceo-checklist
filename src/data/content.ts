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
  { id: 'sell', number: '03', name: 'Sell', days: [31, 45], intro: 'Make the offer, see what stops you, have the conversations, and close the loop.' },
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
  [9, 'sell', 'Run a Focused Sales Sprint', 'Pick a window, give people a reason to decide now, and tell people the offer is open.', 34],
  [10, 'sell', 'Catch the Sabotage', 'Spot the fear and patterns that stopped the sale, using what actually happened.', 38],
  [11, 'sell', 'Run the Sales Conversations', 'Move each buyer to a clear decision, without discounting, over-explaining or letting them go quiet.', 42],
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

const ACTION_06: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'You have one clear way for the right person to raise their hand, and it leads straight to your offer.',
  description: 'Give the right buyer one reason to raise their hand. Create one free or low-cost way in that solves a small problem and makes them want your offer next.',
  why: `Most people won't buy the first time they see you. They need a small, easy first step. That step is your way in. It could be a free call, a sample, a checklist or a quiz.

A good way in does two jobs. It gives them a quick win, and it makes them want more, which is your offer. If it solves everything for free, they won't need to buy. If it has nothing to do with your offer, you'll attract people who will never buy.

One way in is enough. Build it now, but don't promote it yet. In Action 07 you will build what happens after someone takes it.`,
  checklist: [
    'Choose your type of way in',
    'Name it',
    'Write the one problem it solves',
    'Write how it leads to your offer',
    'Write who it is not for',
    'Choose how people get it',
    'Complete your tier requirement',
    'Make it ready to deliver (but don’t promote it yet)',
  ].map((label, i) => ({ id: `a06-c${i + 1}`, label })),
  tierRequirements: {
    1: 'Keep it simple and fast. Choose a DM keyword or a free call as your way in, not a big free guide. You need conversations, not an email list. It should take you less than 2 hours to set up.',
    2: 'Make a way back in for past buyers. Examples include early access, a returning client offer, a refill or top-up reminder, or a free check-in call. Write down which 3 past buyers you will offer it to first.',
    3: 'Make a way in that attracts your best buyers, not freebie hunters. It should only appeal to people who can afford your main offer. Add one filter question, like their budget, business stage or timeline, so you know who is ready before you talk to them.',
  },
  help: {
    inWmhq: { line: 'Open the Lead Magnet Builder in the WMHQ Tools hub. Enter your buyer and offer, and it helps you build a way in that leads to the sale.', linkLabel: 'Open WMHQ Tools', url: WMHQ_TOOLS_URL },
    notInWmhq: {
      line: 'Copy this prompt into ChatGPT, Claude, or any AI you use. Fill in the brackets first.',
      prompt: `My buyer is: [paste buyer sentence from Action 02].
My offer is: [paste one-liner from Action 03].

Help me create one free way in that makes this buyer want my offer next. Choose the best type from these five: Diagnose (quiz or scorecard), Shortcut (template or checklist), Teach (mini training), Experience (challenge, trial, sample or free call), or Curate (toolkit or calculator).

Give me 3 ideas, each using a different type. For each idea, tell me:
1. The type and the name
2. The one small problem it solves
3. Why it makes them want my offer, without solving everything my offer solves

No generic ideas. Simple words.`,
      bridge: 'AI can help you get the facts down. Inside WMHQ, you get the full training and tools for every action in this challenge.',
      joinLabel: 'Join WMHQ',
      joinUrl: JOIN_WMHQ_URL,
    },
  },
  fields: [
    // Tier-specific workspaces
    { id: 't1Simple', label: 'Is your way in a DM keyword or a free call that takes under 2 hours to set up?', type: 'yesno', tiers: [1], ifNotYet: 'Swap it for a DM keyword or a free call. You need conversations, not an email list.' },
    { id: 't2Buyers', label: 'The 3 past buyers you will offer it to first', type: 'list', tiers: [2], placeholder: 'Name' },
    { id: 't3Filter', label: 'Your filter question', type: 'text', tiers: [3], placeholder: 'e.g. What is your budget for this?', help: 'Like their budget, business stage or timeline, so you know who is ready before you talk to them.' },
    // Shared workspace
    { id: 'type', label: 'What type of way in is it?', type: 'cards', help: 'Choose the one that fits how you sell and where your buyer gets stuck.',
      cards: [
        { title: 'Diagnose', desc: 'Quiz or scorecard. Shows them what is wrong and where they are stuck.', best: 'coaches, service providers and product brands.' },
        { title: 'Shortcut', desc: 'Template or checklist. Saves them time on one task.', best: 'service providers, product businesses and done-for-you services.' },
        { title: 'Teach', desc: 'Mini training or masterclass. Explains one thing they get wrong.', best: 'coaches, consultants and higher-priced offers.' },
        { title: 'Experience', desc: 'Challenge, trial, sample or free call. Lets them try a small taste of working with you.', best: 'memberships, coaches, communities and product samples.' },
        { title: 'Curate', desc: 'Toolkit or calculator. Gives them the right tools or numbers in one place.', best: 'product, service, ops-heavy or tech niches.' },
      ] },
    { id: 'name', label: 'What is it called?', type: 'text', help: 'Say what they get. “The 5-Minute Skin Check” is better than “My Free Gift”.' },
    { id: 'problem', label: 'What one problem does it solve?', type: 'textarea', help: 'Pick one small problem from your buyer’s struggles in Action 02. Just one.' },
    { id: 'leadsTo', label: 'How does it lead to your offer?', type: 'textarea', placeholder: 'Once they have this, they will want my offer because…', help: 'Finish this sentence: “Once they have this, they will want my offer because…”' },
    { id: 'notFor', label: 'Who is it not for?', type: 'textarea', help: 'Who would take it but never buy? Name them, so you don’t write it for them.' },
    { id: 'how', label: 'How do people get it?', type: 'select', options: ['Send a DM keyword', 'Fill in a form', 'Book a call', 'Click a link', 'In person'] },
    { id: 'howWords', label: 'The exact words people will see', type: 'text', placeholder: 'DM me CALM and I’ll send you the 3-step plan.', help: 'Example: “DM me CALM and I’ll send you the 3-step plan.”' },
    { id: 'link', label: 'Link to your way in', type: 'url', placeholder: 'https://',
      help: 'Your landing page, form, booking page, or where the free thing lives. Using a DM keyword with no page? Leave this blank.' },
    { id: 'readyMade', label: 'Is the free thing made or ready to send?', type: 'yesno', ifNotYet: 'Finish this before Action 07. Don’t promote it yet.',
      group: { title: 'Is it ready to deliver?' } },
    { id: 'readyScript', label: 'Do you know what you will say or send when someone asks for it?', type: 'yesno', ifNotYet: 'Finish this before Action 07. Don’t promote it yet.' },
  ],
  proof: [
    'The name of your way in and its type',
    'The one problem it solves',
    'How people get it: the exact words they will see',
    'Your tier requirement: why it is quick to set up, the 3 past buyers you will offer it to, or your filter question',
  ],
  resources: [],
}

const ACTION_07: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'Anyone who shows interest has a clear path to buy, and nobody gets lost or forgotten.',
  description: 'Give an interested buyer a clear way to say yes. Map every step from “I’m interested” to “I’ve paid”, and decide how you will follow up with people who go quiet.',
  why: `Most sales are not lost because people say no. They are lost because nothing happens next. Someone asks a question and gets no reply. Someone clicks a link and gets stuck. Someone downloads a free guide and never hears from you again.

Your sales path fixes that. It is a simple map of what happens after someone raises their hand, all the way to payment. There are two kinds:

One-step: they see the offer, click, and buy or book. Best for lower prices, products, and people who already trust you.

Two-step: they get your free way in first, then you show them the offer. Best for higher prices, services, and people who are new to you.

Both need follow-up. Most people buy after the second or third message, not the first.`,
  checklist: [
    'Choose one-step or two-step',
    'Write what people see or get when they show interest',
    'Write how and when you show them the offer',
    'Add your payment or booking link',
    'Write what happens after they pay',
    'Write your follow-up messages',
    'Complete your tier requirement',
    'Test the full path, then promote your way in',
  ].map((label, i) => ({ id: `a07-c${i + 1}`, label })),
  tierRequirements: {
    1: 'Use a one-step path unless your offer is over $1,000. Write the exact reply you will send when someone DMs or books, and 2 follow-up messages for anyone who goes quiet.',
    2: 'Build a path for past buyers that skips the start. They already trust you, so go straight to the offer. Write the message you will send to past buyers, and 2 follow-ups.',
    3: 'Find where your current path leaks. Write down the step where most people drop off: no reply, no booking, no payment, or no follow-up. Fix that one step first, and write 3 follow-up messages.',
  },
  help: {
    inWmhq: { line: 'Open the Create A Landing Page That Converts resource in CEO Cash, inside the WMHQ Vault.', linkLabel: 'Open the WMHQ Vault', url: WMHQ_VAULT_URL },
    notInWmhq: {
      line: 'Copy this prompt into ChatGPT, Claude, or any AI you use. Fill in the brackets first.',
      promptBy: {
        field: 'path',
        chooseFirst: 'Choose one-step or two-step in your workspace first, and the matching prompt appears here.',
        prompts: {
          'One-step': `My buyer is: [buyer sentence]. My offer is: [one-liner]. People see my offer on [DM / sales page / booking page / shop].

Write: my reply when someone is interested, the message after they pay, and 2 follow-ups for people who don't buy (2 days and 5 days later). Short, human, no pressure. Each ends with one clear next step.`,
          'Two-step': `My buyer is: [buyer sentence]. My offer is: [one-liner]. My free way in is: [name from Action 06].

Write: the message they get with the free thing, a check-in message 2 days later, a message that shows my offer, and a message that answers their biggest worry. Short, human, no pressure. Each ends with one clear next step.`,
        },
      },
      bridge: 'AI can help you get the facts down. Inside WMHQ, you get the full training and tools for every action in this challenge.',
      joinLabel: 'Join WMHQ',
      joinUrl: JOIN_WMHQ_URL,
    },
  },
  fields: [
    // Tier-specific workspaces
    { id: 't2Message', label: 'The message you will send to past buyers', type: 'textarea', tiers: [2], help: 'Skip the start. They already trust you, so go straight to the offer.' },
    { id: 't3Leak', label: 'Where do most people drop off?', type: 'select', tiers: [3], options: ['No reply', 'No booking', 'No payment', 'No follow-up'] },
    { id: 't3Fix', label: 'How you will fix that one step', type: 'textarea', tiers: [3] },
    // Choose path
    { id: 'path', label: 'Which path are you using?', type: 'cards',
      help: 'Lower price, product, or people who already trust you? Choose one-step. Higher price, service, or people who are new to you? Choose two-step. Tier 01, choose one-step unless your price is over $1,000.',
      cards: [
        { title: 'One-step', desc: 'They see the offer, click, and buy or book.', best: 'lower prices, products, and people who already trust you.' },
        { title: 'Two-step', desc: 'They get your free way in first, then you show them the offer.', best: 'higher prices, services, and people who are new to you.' },
      ] },
    // One-step
    { id: 'o1Where', label: 'Where do people see your offer?', type: 'select', options: ['DM', 'Sales page', 'Booking page', 'Shop or product page', 'In person'], help: 'This is where they decide to buy.',
      showIf: { field: 'path', equals: ['One-step'] }, group: { title: 'Your one-step path' } },
    { id: 'o1Reply', label: 'What do you say or show when someone is interested?', type: 'textarea', showIf: { field: 'path', equals: ['One-step'] },
      help: 'Write your exact reply or what is on the page. Example: “It’s $89 and ships in 3 days. Here’s the link to order.”' },
    { id: 'o1Pay', label: 'How do they pay or book?', type: 'url', placeholder: 'https://', showIf: { field: 'path', equals: ['One-step'] },
      help: 'Paste your payment, checkout or booking link from Action 03.', copyFrom: { action: 'a03', field: 'payLink', label: 'Paste from Action 03' } },
    { id: 'o1After', label: 'What happens after they pay?', type: 'textarea', showIf: { field: 'path', equals: ['One-step'] },
      help: 'The confirmation, welcome message or next step they get. Nobody should pay and then hear nothing.' },
    { id: 'o1Fu1', label: 'Follow-up 1 (send 2 days later)', type: 'textarea', showIf: { field: 'path', equals: ['One-step'] },
      help: 'Be helpful, not pushy. Answer a worry, share a result, or ask a simple question.', group: { title: 'Your follow-up for people who don’t buy' } },
    { id: 'o1Fu2', label: 'Follow-up 2 (send 5 days later)', type: 'textarea', showIf: { field: 'path', equals: ['One-step'] },
      help: 'Be helpful, not pushy. Answer a worry, share a result, or ask a simple question.' },
    { id: 'o1Fu3', label: 'Follow-up 3 (send 10 days later)', type: 'textarea', onlyTiers: [3], showIf: { field: 'path', equals: ['One-step'] },
      help: 'Tier 03 only. Be helpful, not pushy.' },
    // Two-step
    { id: 't2sHow', label: 'How do people get your free way in?', type: 'text', showIf: { field: 'path', equals: ['Two-step'] },
      help: 'DM keyword, form, booking link or click.', copyFrom: { action: 'a06', field: 'howWords', label: 'Paste from Action 06' }, group: { title: 'Your two-step path' } },
    { id: 't2sWhere', label: 'Where do their details go?', type: 'select', options: ['Email list', 'DM inbox', 'Booking system', 'Spreadsheet', 'Other'], showIf: { field: 'path', equals: ['Two-step'] },
      help: 'If you can’t find them later, you can’t sell to them.' },
    { id: 't2sGet', label: 'What do they get straight away?', type: 'textarea', showIf: { field: 'path', equals: ['Two-step'] },
      help: 'Write the message they receive with the free thing. Example: “Here’s your skin check. Start with step 1 tonight.”' },
    { id: 't2sMove', label: 'How do you move them from the free thing to your offer?', type: 'textarea', placeholder: 'After they use it, I will show them my offer by…', showIf: { field: 'path', equals: ['Two-step'] },
      help: 'Finish this sentence: “After they use it, I will show them my offer by…” Example: “…sending a DM 2 days later asking how it went, then sharing the full plan.”' },
    { id: 't2sWhen', label: 'When do you show them the offer?', type: 'select', options: ['Same day', '2 days later', 'After a call', 'At the end of the free training', 'Other'], showIf: { field: 'path', equals: ['Two-step'] } },
    { id: 't2sPay', label: 'How do they pay or book?', type: 'url', placeholder: 'https://', showIf: { field: 'path', equals: ['Two-step'] },
      copyFrom: { action: 'a03', field: 'payLink', label: 'Paste from Action 03' } },
    { id: 't2sM1', label: 'Message 1 (after they get the free thing): check in and help', type: 'textarea', showIf: { field: 'path', equals: ['Two-step'] },
      help: 'Most people buy after the second or third message, not the first.', group: { title: 'Your follow-up messages' } },
    { id: 't2sM2', label: 'Message 2: show the offer', type: 'textarea', showIf: { field: 'path', equals: ['Two-step'] } },
    { id: 't2sM3', label: 'Message 3: answer their biggest worry from Action 02', type: 'textarea', showIf: { field: 'path', equals: ['Two-step'] } },
    { id: 't2sM4', label: 'Message 4: last chance or a reason to buy now', type: 'textarea', onlyTiers: [3], showIf: { field: 'path', equals: ['Two-step'] }, help: 'Tier 03 only.' },
    // Both paths
    { id: 'map', label: 'Your path map', type: 'pathmap', showIf: { field: 'path', equals: ['One-step', 'Two-step'] },
      group: { title: 'Your path map', intro: 'This builds itself from your answers above.' },
      pathMap: { by: 'path', steps: {
        'One-step': [
          { label: 'Where they see it', field: 'o1Where' }, { label: 'Your reply', field: 'o1Reply' }, { label: 'Pay or book', field: 'o1Pay' },
          { label: 'After they pay', field: 'o1After' }, { label: 'Follow-up', field: 'o1Fu1' },
        ],
        'Two-step': [
          { label: 'Way in', field: 't2sHow' }, { label: 'Details saved in', field: 't2sWhere' }, { label: 'Free thing sent', field: 't2sGet' },
          { label: 'Offer shown', field: 't2sWhen' }, { label: 'Pay or book', field: 't2sPay' }, { label: 'Follow-up', field: 't2sM1' },
        ],
      } } },
    { id: 'testLinks', label: 'Did every link work?', type: 'yesno', ifNotYet: 'Fix the step where you got stuck, then test again.',
      group: { title: 'Test the full path', intro: 'Go through it yourself, like a new client or customer would.' } },
    { id: 'testFlow', label: 'Could you get from interest to payment without getting stuck?', type: 'yesno', ifNotYet: 'Fix the step where you got stuck, then test again.' },
    { id: 'ready', label: 'Ready to promote', type: 'notice', notice: { when: ['testLinks', 'testFlow'], text: 'Your path works. You can now promote your way in.' } },
  ],
  proof: [
    'Your path: one-step or two-step, and a screenshot of your path map',
    'Your reply or the message they get when they show interest',
    'Your follow-up messages',
    'Your test result: every link works and you got to payment without getting stuck',
  ],
  resources: [],
}

const THEME_HINT = 'Look at your buyer from Action 02. What they want, what they struggle with, and what they worry about are your themes. Each theme should lead back to your offer.'
const THEME_EXAMPLES = [
  { label: 'A dog trainer', text: '“Anxious dogs”, “Training without force”, “Life with a rescue”' },
  { label: 'A skincare brand', text: '“Sensitive skin”, “Simple routines”, “What’s really in your products”' },
  { label: 'A bookkeeper', text: '“Tax time stress”, “Knowing your numbers”, “Paying yourself properly”' },
]
const TOPIC_HINT = 'Topics are subjects you can post about again and again. If you can only post about it once, it’s a post idea, not a topic.'

const ACTION_08: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'You have a content system and a weekly rhythm that sends people to your offer, built to hit your number.',
  description: 'Create a repeatable rhythm that brings people towards the offer. Know what you talk about, how often you show up, and how many people you reach out to each week.',
  why: `Posting random content when you feel like it does not make sales. A sales engine does. It is a simple weekly rhythm with three parts: show up with content, reach out to people directly, and follow up.

Your content needs a system so you never run out of things to say, and so everything you post points back to your offer. That system has two layers:

Themes are the bigger conversations and problems you want to be known for. You have 4. Three are about your business and what your buyer struggles with. The fourth is your story.

Topics are the repeatable subjects that sit under each theme. You can post about them again and again in new ways.

Content brings people to you. Reaching out brings people to you faster. You need both.`,
  checklist: [
    'Write your 3 business themes',
    'Write your story theme',
    'Write 3 topics under each theme',
    'Pull in your weekly number from Action 04',
    'Set how many times you will post each week',
    'Set how many people you will reach out to each week',
    'Complete your tier requirement',
    'Block your engine time in your calendar',
  ].map((label, i) => ({ id: `a08-c${i + 1}`, label })),
  tierRequirements: {
    1: 'Outreach is required, not optional. Reach out to at least 5 people a week who match your buyer. Content supports this, but direct conversations will get your first sale faster.',
    2: 'Outreach is required. Message at least 3 past buyers a week until you have contacted all of them. Make sure one of your business themes speaks to people who already know you.',
    3: 'Match your rhythm to your gap from Action 04. If your gap is traffic, post and reach out more. If your gap is conversion, make one theme about the results and proof that make people buy. Write down which gap you are fixing.',
  },
  help: {
    inWmhq: {
      line: 'Watch the Creating Content Pillars lesson in the Vault, then build your themes and topics in the Visibility tool in your Personal Portal.',
      linkLabel: 'Open the WMHQ Vault', url: WMHQ_VAULT_URL,
      more: [{ label: 'Open your Personal Portal', url: WMHQ_PORTAL_URL }],
    },
    notInWmhq: {
      line: 'Follow the steps below. Start with your buyer from Action 02. Their wants, struggles and worries are where your themes come from.',
      bridge: 'AI can help you get the facts down. Inside WMHQ, you get the full training and tools for every action in this challenge.',
      joinLabel: 'Join WMHQ',
      joinUrl: JOIN_WMHQ_URL,
    },
  },
  fields: [
    // Tier-specific workspaces
    { id: 't2Theme', label: 'Which business theme speaks to people who already know you?', type: 'text', tiers: [2] },
    { id: 't3Gap', label: 'Which gap are you fixing?', type: 'select', tiers: [3], options: ['Traffic: post and reach out more', 'Conversion: one theme about results and proof'] },
    { id: 't3Notes', label: 'What you will change in your rhythm', type: 'textarea', tiers: [3] },
    // Part 1: themes
    { id: 'theme1', label: 'Business theme 1', type: 'text', help: THEME_HINT, examples: THEME_EXAMPLES,
      group: { title: 'Part 1: Your themes', intro: 'Themes are the broader conversations and problems you want your brand to become known for. Topics are the repeatable subjects that sit underneath each theme.' } },
    { id: 'theme2', label: 'Business theme 2', type: 'text', help: THEME_HINT },
    { id: 'theme3', label: 'Business theme 3', type: 'text', help: THEME_HINT },
    { id: 'theme4', label: 'Theme 4: Your story', type: 'text', placeholder: 'From burnt-out nurse to running my own clinic.',
      help: 'Why you started, what you have been through, and what you believe. This is what makes people trust you and choose you over someone else. Example: “From burnt-out nurse to running my own clinic.”' },
    // Part 2: topics
    { id: 'topics1', label: 'Topics for business theme 1', type: 'multi', count: 3, help: TOPIC_HINT, labelFrom: { field: 'theme1', template: 'Topics for “{v}”' },
      examples: [
        { label: 'For the theme “Anxious dogs”', text: 'Signs your dog is anxious · Walks that go wrong · What helps and what makes it worse' },
        { label: 'For the story theme', text: 'Why I started · Mistakes I made · What I believe about [your industry]' },
      ],
      group: { title: 'Part 2: Your topics', intro: 'Three topics under each of your 4 themes.' } },
    { id: 'topics2', label: 'Topics for business theme 2', type: 'multi', count: 3, help: TOPIC_HINT, labelFrom: { field: 'theme2', template: 'Topics for “{v}”' } },
    { id: 'topics3', label: 'Topics for business theme 3', type: 'multi', count: 3, help: TOPIC_HINT, labelFrom: { field: 'theme3', template: 'Topics for “{v}”' } },
    { id: 'topics4', label: 'Topics for your story', type: 'multi', count: 3, help: TOPIC_HINT, labelFrom: { field: 'theme4', template: 'Topics for your story: “{v}”' } },
    // Part 3: weekly rhythm
    { id: 'weeklyNumber', label: 'Your weekly number', type: 'rhythm', count: 0,
      group: { title: 'Part 3: Your weekly rhythm' } },
    { id: 'posts', label: 'How many times will you post each week?', type: 'number', help: 'Pick a number you can keep for 60 days. 3 posts every week beats 7 posts for one week.' },
    { id: 'outreach', label: 'How many people will you reach out to each week?', type: 'number', help: 'Tier 01, at least 5. Tier 02, at least 3 past buyers.' },
    { id: 'followups', label: 'How many follow-ups will you send each week?', type: 'number', help: 'Use your follow-up messages from Action 07.' },
    { id: 'rhythmCheck', label: 'Does your rhythm hit your number?', type: 'rhythm' },
    { id: 'engineDay', label: 'Engine time: which day?', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'More than one day'],
      help: 'Block it in your calendar like a client appointment.' },
    { id: 'engineTime', label: 'Engine time: what time?', type: 'time' },
  ],
  proof: [
    'Your 4 themes',
    'Your weekly rhythm: posts, outreach and follow-ups each week',
    'A screenshot of your engine time blocked in your calendar',
    'Your tier requirement: your outreach number, the theme for past buyers, or the gap you are fixing',
  ],
  resources: [],
}

const ACTION_09: Omit<ActionDef, 'id' | 'number' | 'phase' | 'title' | 'summary' | 'dueDay'> = {
  placeholder: false,
  outcome: 'You have a short, focused sales sprint with a start date, an end date, and a real reason for people to buy now.',
  description: 'Give buyers a clear reason to make a decision now. Pick a short sprint window, tell people your offer is open, and message the people most likely to buy.',
  why: `When an offer is always available, people put off deciding. A focused sprint gives them a reason to decide now, and gives you a set time to sell hard, then rest.

A sprint is not a big launch. You don't need a webinar, ads or a team. It's a set number of days where your offer is the main thing you talk about, with a real reason to act before it closes.

The reason must be true. Fake deadlines break trust. Real reasons work better anyway, such as limited spots, a bonus that ends, a price going up, or a season.`,
  checklist: [
    'Choose your sprint type',
    'Set your sprint dates',
    'Write your reason to buy now',
    'Build your warm list',
    'Plan what you will post and send each day',
    'Complete your tier requirement',
    'Open your sprint',
    'Close your sprint on the end date',
  ].map((label, i) => ({ id: `a09-c${i + 1}`, label })),
  tierRequirements: {
    1: 'Keep it to 7 days. Your warm list needs at least 15 names: people who match your buyer, people who have engaged with your content, and people you already know. Message every single one during the sprint.',
    2: 'Open the sprint to past buyers first, with 2 days of early access before anyone else. Every past buyer on your list gets a personal message, not a group post.',
    3: 'Set a cash target for this sprint only, as a share of your $10K. Plan one moment in the sprint that drives the most sales, like a live session, a bonus deadline or doors closing. Track your cash daily during the sprint.',
  },
  help: {
    inWmhq: { line: 'Open Launch Campaigns in your Personal Portal. It walks you through planning and running your sprint step by step.', linkLabel: 'Open your Personal Portal', url: WMHQ_PORTAL_URL },
    notInWmhq: {
      line: 'Copy this prompt into ChatGPT, Claude, or any AI you use. Fill in the brackets first.',
      prompt: `My offer is: [one-liner from Action 03]. My buyer is: [buyer sentence from Action 02]. My price is [price]. I want to run a short sales sprint.

Interview me one question at a time to plan it. Push back if my answers are vague or if a deadline sounds made up.

Help me decide:
1. My sprint type: limited spots, bonus deadline, price going up, doors closing, founding offer, or seasonal. Pick the one that is true for me.
2. My start and end dates (5 to 10 days)
3. My reason to buy now, finishing: "Buy before [end date] because..."
4. Who should be on my warm list. Give me 5 types of people I should message, based on my buyer.

Then write my sprint plan:
Before: 1 post and 1 message to tell people something is coming
Open: 1 post and 1 message to announce the offer
Middle: 1 post and 1 message that shares a result or answers a worry
Close: 1 post and 1 message for the last day

Short, human, no hype, no fake urgency. Each ends with one clear next step.`,
      bridge: 'AI can help you get the facts down. Inside WMHQ, you get the full training and tools for every action in this challenge.',
      joinLabel: 'Join WMHQ',
      joinUrl: JOIN_WMHQ_URL,
    },
  },
  fields: [
    // Tier-specific workspaces
    { id: 't1Seven', label: 'Is your sprint 7 days or less?', type: 'yesno', tiers: [1], ifNotYet: 'Shorten it to 7 days. A short sprint keeps you focused.' },
    { id: 't2Early', label: 'When does early access for past buyers start?', type: 'date', tiers: [2], help: '2 days before your sprint opens to everyone else.' },
    { id: 't2Personal', label: 'Will every past buyer get a personal message, not a group post?', type: 'yesno', tiers: [2], ifNotYet: 'Write each past buyer a short personal message. It makes them feel remembered.' },
    { id: 't3Target', label: 'Cash target for this sprint', type: 'currency', tiers: [3], help: 'A share of your $10K, for this sprint only.' },
    { id: 't3Moment', label: 'Your biggest sales moment', type: 'textarea', tiers: [3], help: 'Like a live session, a bonus deadline or doors closing.' },
    { id: 't3Daily', label: 'Daily cash tracker', type: 'list', tiers: [3], placeholder: 'e.g. Day 1: $1,200' },
    // Block 1
    { id: 'type', label: 'Your sprint type', type: 'cards', help: 'Pick the one that is true for you. Never make up a deadline.',
      group: { title: 'Block 1: Your sprint type' },
      cards: [
        { title: 'Limited spots', desc: 'Only a set number of people can buy.' },
        { title: 'Bonus deadline', desc: 'Buy before the end date and get something extra.' },
        { title: 'Price going up', desc: 'The price rises after the end date.' },
        { title: 'Doors closing', desc: 'The offer closes after the end date.' },
        { title: 'Founding offer', desc: 'The first buyers get a special price or extra.' },
        { title: 'Seasonal', desc: 'Tied to a real time, like Christmas, summer or back to school.' },
      ] },
    // Block 2
    { id: 'start', label: 'Start date', type: 'date', group: { title: 'Block 2: Your sprint window' } },
    { id: 'end', label: 'End date', type: 'date' },
    { id: 'window', label: 'Sprint length', type: 'duration', range: { start: 'start', end: 'end', max: 14, tooLong: 'Shorter is stronger. Try 5 to 10 days.' } },
    // Block 3
    { id: 'reason', label: 'Finish this sentence: “Buy before [end date] because…”', type: 'textarea', placeholder: 'Buy before 30 November because only 5 spots are open before Christmas.',
      help: 'Example: “Buy before 30 November because only 5 spots are open before Christmas.”', group: { title: 'Block 3: Your reason to buy now' } },
    // Block 4
    { id: 'warmList', label: 'Your warm list', type: 'warmtracker',
      help: 'Start with people who have bought before, asked about your offer, or engaged with your content. Only add first names or initials. This saves to your browser.',
      options: ['Past buyer', 'Warm contact', 'Engaged follower'],
      minItems: { 1: { n: 15, text: 'Tier 01 needs at least 15 names.' } },
      group: { title: 'Block 4: Your warm list tracker', intro: 'Messaging past buyers and warm contacts is part of the sprint, not a separate step.' } },
    // Block 5
    { id: 'beforePost', label: 'What I will post', type: 'textarea', group: { title: 'Block 5: Your sprint plan', intro: 'Before (1 to 2 days): tell people something is coming.' } },
    { id: 'beforeSend', label: 'What I will send', type: 'textarea' },
    { id: 'openPost', label: 'What I will post', type: 'textarea', group: { title: 'Open (day 1)', intro: 'Announce the offer and the reason to buy now.' } },
    { id: 'openSend', label: 'What I will send', type: 'textarea' },
    { id: 'middlePost', label: 'What I will post', type: 'textarea', group: { title: 'Middle', intro: 'Share a result, answer a worry, show what’s included.' } },
    { id: 'middleSend', label: 'What I will send', type: 'textarea' },
    { id: 'closePost', label: 'What I will post', type: 'textarea', group: { title: 'Close (last day)', intro: 'Last call, and say clearly when it ends.' } },
    { id: 'closeSend', label: 'What I will send', type: 'textarea' },
    // Block 6
    { id: 'summary', label: 'Your sprint summary', type: 'sprintsummary', group: { title: 'Block 6: Your sprint summary' } },
    { id: 'bridge', label: 'Next', type: 'notice', notice: { when: [], text: 'Your sprint is open. Watch what you avoid this week. You’ll use it in Action 10.' } },
  ],
  proof: [
    'Post your sprint summary in the community before your sprint opens',
    'Your open post or message',
    'How many people on your warm list you messaged',
    'Your tier requirement: your 7-day dates, your early access for past buyers, or your cash target and daily tracker',
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
  ...(number === 1 ? ACTION_01 : number === 2 ? ACTION_02 : number === 3 ? ACTION_03 : number === 4 ? ACTION_04 : number === 5 ? ACTION_05 : number === 6 ? ACTION_06 : number === 7 ? ACTION_07 : number === 8 ? ACTION_08 : number === 9 ? ACTION_09 : placeholderFor(number)),
}))

export const actionById = (id: string) => ACTIONS.find((a) => a.id === id)
export const TOTAL_ITEMS = ACTIONS.reduce((n, a) => n + a.checklist.length, 0)
