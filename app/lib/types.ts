export type Platform = 'tiktok' | 'youtube-shorts' | 'instagram-reels' | 'twitter' | 'linkedin'

export type ScriptStyle = 'educational' | 'entertaining' | 'promotional' | 'storytelling' | 'trending'

export type GenerateScriptRequest = {
  topic: string
  platform: Platform
  style: ScriptStyle
  duration: number // in seconds
  targetAudience?: string
  keyPoints?: string[]
}

export type GeneratedScript = {
  id: string
  title: string
  hook: string
  body: string
  callToAction: string
  hashtags: string[]
  estimatedDuration: number
  platform: Platform
  style: ScriptStyle
  createdAt: string
}

export type ScriptTemplate = {
  platform: Platform
  style: ScriptStyle
  maxDuration: number
  structure: {
    hook: number // percentage of total time
    body: number
    cta: number
  }
  tips: string[]
}