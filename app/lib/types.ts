export type PlanId = 'free' | 'pro' | 'business'

export type Platform =
  | 'tiktok'
  | 'youtube-shorts'
  | 'instagram-reels'
  | 'twitter'
  | 'linkedin'

export type ScriptStyle =
  | 'educational'
  | 'entertaining'
  | 'promotional'
  | 'storytelling'
  | 'trending'

export type GenerateScriptRequest = {
  topic: string
  platform: Platform
  style: ScriptStyle
  duration: number
  targetAudience?: string
  keyPoints?: string[]
  brandVoice?: string
  primaryGoal?: string
}

export type ScriptAnalytics = {
  overallScore: number
  hookScore: number
  clarityScore: number
  platformFitScore: number
  ctaScore: number
  estimatedReadTimeSeconds: number
  suggestedPostTime: string
  targetOutcome: string
  strengths: string[]
  risks: string[]
}

export type GeneratedScript = {
  id: string
  title: string
  hook: string
  body: string
  callToAction: string
  hashtags: string[]
  tips: string[]
  estimatedDuration: number
  platform: Platform
  style: ScriptStyle
  createdAt: string
  analytics: ScriptAnalytics
  source: 'gemini' | 'fallback'
}

export type WorkspaceProfile = {
  id: string
  name: string
  email: string
  company: string
  brandVoice: string
  primaryGoal: string
}

export type TeamSeat = {
  id: string
  email: string
  role: 'Creator' | 'Strategist' | 'Approver'
  status: 'pending' | 'active'
}

export type UsageSnapshot = {
  month: string
  count: number
  limit: number | null
  remaining: number | null
}

export type BillingSnapshot = {
  plan: PlanId
  status: 'free' | 'active' | 'trialing' | 'past_due' | 'canceled'
  customerId?: string
  subscriptionId?: string
  usage: UsageSnapshot
  features: {
    unlimitedScripts: boolean
    advancedAnalytics: boolean
    collaboration: boolean
    exports: boolean
  }
}

export type PricingPlan = {
  id: PlanId
  name: string
  priceLabel: string
  monthlyPrice: number
  description: string
  cta: string
  highlight?: boolean
  features: string[]
}
