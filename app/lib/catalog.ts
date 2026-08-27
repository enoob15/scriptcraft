import { PlanId, Platform, PricingPlan, ScriptStyle } from './types'

export const PLATFORM_LIMITS: Record<
  Platform,
  { min: number; max: number; recommended: number; angle: string; postTime: string }
> = {
  tiktok: {
    min: 15,
    max: 180,
    recommended: 45,
    angle: 'pattern interrupt, speed, relatability',
    postTime: 'Weekdays at 6-9 PM local time',
  },
  'youtube-shorts': {
    min: 15,
    max: 60,
    recommended: 40,
    angle: 'search intent, retention loops, satisfying payoffs',
    postTime: 'Weekdays at 12-3 PM local time',
  },
  'instagram-reels': {
    min: 15,
    max: 90,
    recommended: 30,
    angle: 'visual polish, aspirational framing, trend remixing',
    postTime: 'Weekdays at 11 AM-1 PM local time',
  },
  twitter: {
    min: 15,
    max: 140,
    recommended: 45,
    angle: 'opinion-led framing, concise authority, punchy delivery',
    postTime: 'Weekdays at 8-10 AM local time',
  },
  linkedin: {
    min: 30,
    max: 300,
    recommended: 90,
    angle: 'authority, business value, credibility-building',
    postTime: 'Tuesday-Thursday at 8-10 AM local time',
  },
}

export const PLATFORM_OPTIONS: Array<{
  value: Platform
  label: string
  subtitle: string
}> = [
  { value: 'tiktok', label: 'TikTok', subtitle: 'Fast hooks and trend-driven storytelling' },
  { value: 'youtube-shorts', label: 'YouTube Shorts', subtitle: 'Retention-focused quick education' },
  { value: 'instagram-reels', label: 'Instagram Reels', subtitle: 'Visual-first brand storytelling' },
  { value: 'twitter', label: 'Twitter/X', subtitle: 'Compact authority and hot takes' },
  { value: 'linkedin', label: 'LinkedIn', subtitle: 'Professional narratives that convert' },
]

export const STYLE_OPTIONS: Array<{
  value: ScriptStyle
  label: string
  description: string
}> = [
  { value: 'educational', label: 'Educational', description: 'Teach a tactic, framework, or insight.' },
  { value: 'entertaining', label: 'Entertaining', description: 'Lean into surprise, humor, or contrast.' },
  { value: 'promotional', label: 'Promotional', description: 'Sell the outcome, not the feature list.' },
  { value: 'storytelling', label: 'Storytelling', description: 'Build tension, reveal, and payoff.' },
  { value: 'trending', label: 'Trending', description: 'Package the message inside a viral format.' },
]

export const PLAN_CATALOG: Record<PlanId, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    priceLabel: '$0',
    description: 'For solo creators validating an idea.',
    cta: 'Start Free',
    features: [
      '5 scripts per month',
      'Platform-specific script generation',
      'Plain text and HTML exports',
      'Local workspace history',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9,
    priceLabel: '$9',
    description: 'For creators publishing daily and optimizing every post.',
    cta: 'Upgrade to Pro',
    highlight: true,
    features: [
      'Unlimited script generation',
      'Advanced script analytics',
      'Stripe-managed subscription billing',
      'Priority Gemini generation flow',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    monthlyPrice: 29,
    priceLabel: '$29',
    description: 'For agencies and in-house teams shipping at scale.',
    cta: 'Upgrade to Business',
    features: [
      'Unlimited scripts and exports',
      'Shared team seat workspace',
      'Business analytics dashboard',
      'Customer portal and billing controls',
    ],
  },
}

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'business']
