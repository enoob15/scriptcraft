import { PLATFORM_LIMITS } from './catalog'
import { GenerateScriptRequest } from './types'

export const SCRIPT_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    hook: { type: 'string' },
    body: { type: 'string' },
    callToAction: { type: 'string' },
    hashtags: {
      type: 'array',
      items: { type: 'string' },
    },
    tips: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['title', 'hook', 'body', 'callToAction', 'hashtags', 'tips'],
}

export function getScriptPrompt({
  topic,
  platform,
  style,
  duration,
  targetAudience,
  keyPoints,
  brandVoice,
  primaryGoal,
}: GenerateScriptRequest): string {
  const platformLimit = PLATFORM_LIMITS[platform]

  return `You are ScriptCraft, an elite short-form video strategist for creators, marketers, and agencies.

Produce one high-performing video script as JSON only.

Creative brief:
- Topic: ${topic}
- Platform: ${platform}
- Style: ${style}
- Duration target: ${duration} seconds
- Recommended platform duration: ${platformLimit.recommended} seconds
- Platform optimization angle: ${platformLimit.angle}
- Target audience: ${targetAudience?.trim() || 'Broad creator audience'}
- Brand voice: ${brandVoice?.trim() || 'Clear, modern, credible, and energetic'}
- Primary goal: ${primaryGoal?.trim() || 'Maximize retention and engagement'}

Requirements:
- Open with a hard hook in the first line.
- Make the body speakable out loud, not like blog copy.
- Use concise pacing markers like [beat], [cut], [show proof], [cta].
- Keep it specific to ${platform}, not generic across platforms.
- Avoid filler, cliches, and broad claims without payoff.
- The CTA must match the user goal.
- Hashtags should be relevant and ready to paste.
- Tips should help filming or editing the script successfully.
${keyPoints && keyPoints.length > 0 ? `- Must include these key points:\n${keyPoints.map((point) => `  - ${point}`).join('\n')}` : ''}

Return valid JSON that matches the supplied schema. Do not wrap it in markdown fences.`
}
