import { Platform, ScriptStyle } from './types'

export const getScriptPrompt = (
  topic: string,
  platform: Platform,
  style: ScriptStyle,
  duration: number,
  targetAudience?: string,
  keyPoints?: string[]
): string => {
  const platformSpecs = {
    'tiktok': {
      format: 'vertical video',
      attention: 'first 3 seconds are crucial',
      pace: 'fast-paced, energetic',
      features: 'trending sounds, effects, hashtags'
    },
    'youtube-shorts': {
      format: 'vertical short-form',
      attention: 'hook within 5 seconds',
      pace: 'engaging, informative',
      features: 'clear audio, good lighting'
    },
    'instagram-reels': {
      format: 'vertical Reel',
      attention: 'visually appealing first frame',
      pace: 'trendy, aesthetic',
      features: 'music, trending audio'
    },
    'twitter': {
      format: 'video tweet',
      attention: 'immediate value',
      pace: 'concise, punchy',
      features: 'captions, accessible'
    },
    'linkedin': {
      format: 'professional video',
      attention: 'value proposition upfront',
      pace: 'authoritative, educational',
      features: 'professional tone'
    }
  }

  const styleInstructions = {
    'educational': 'Focus on teaching something valuable. Use clear explanations and actionable insights.',
    'entertaining': 'Prioritize humor, surprise, or emotional engagement. Keep it light and fun.',
    'promotional': 'Highlight benefits and value. Include a strong call-to-action.',
    'storytelling': 'Use narrative structure with conflict, resolution, and emotional arc.',
    'trending': 'Incorporate current trends, memes, or viral formats appropriately.'
  }

  const spec = platformSpecs[platform]
  const styleInstruction = styleInstructions[style]

  return `Create a ${duration}-second video script for ${platform} about "${topic}".

PLATFORM REQUIREMENTS:
- Format: ${spec.format}
- Attention: ${spec.attention}  
- Pace: ${spec.pace}
- Key features: ${spec.features}

STYLE: ${styleInstruction}

${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}

${keyPoints && keyPoints.length > 0 ? `MUST INCLUDE THESE POINTS:\n${keyPoints.map(p => `- ${p}`).join('\n')}` : ''}

STRUCTURE YOUR RESPONSE AS JSON:
{
  "title": "Catchy title for the video",
  "hook": "Opening line/visual that grabs attention immediately",
  "body": "Main content with clear pacing markers like [PAUSE], [EMPHASIS], [VISUAL CUE]",
  "callToAction": "Strong, specific CTA",
  "hashtags": ["array", "of", "relevant", "hashtags"],
  "tips": ["array", "of", "filming/editing", "tips", "for", "this", "script"]
}

Make the script feel natural when spoken aloud. Include timing cues and visual directions where helpful. Ensure it fits the ${duration}-second duration when read at normal pace.`
}

export const PLATFORM_LIMITS = {
  'tiktok': { min: 15, max: 180, recommended: 60 },
  'youtube-shorts': { min: 15, max: 60, recommended: 45 },
  'instagram-reels': { min: 15, max: 90, recommended: 30 },
  'twitter': { min: 15, max: 140, recommended: 60 },
  'linkedin': { min: 30, max: 300, recommended: 120 }
}