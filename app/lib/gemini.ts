import { randomUUID } from 'crypto'
import { buildScriptAnalytics } from './analytics'
import { GenerateScriptRequest, GeneratedScript } from './types'
import { getScriptPrompt, SCRIPT_RESPONSE_JSON_SCHEMA } from './scriptPrompts'

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

function cleanJsonText(text: string): string {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
}

function normalizeHashtags(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => String(value).trim())
    .filter(Boolean)
    .map((value) => (value.startsWith('#') ? value : `#${value.replace(/\s+/g, '')}`))
    .slice(0, 8)
}

function normalizeTips(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return []
  }

  return values.map((value) => String(value).trim()).filter(Boolean).slice(0, 5)
}

function buildScriptObject(
  request: GenerateScriptRequest,
  payload: Partial<{
    title: string
    hook: string
    body: string
    callToAction: string
    hashtags: string[]
    tips: string[]
  }>,
  source: 'gemini' | 'fallback'
): GeneratedScript {
  const normalizedHashtags = normalizeHashtags(payload.hashtags)
  const normalizedTips = normalizeTips(payload.tips)

  const candidate = {
    title: payload.title?.trim() || `${request.platform} ${request.style} script for ${request.topic}`,
    hook:
      payload.hook?.trim() ||
      `Stop scrolling. ${request.topic} is easier to win at than most people think.`,
    body:
      payload.body?.trim() ||
      `[show proof] Start with the result people want.\n[beat] Explain the mistake most creators make.\n[cut] Deliver three concrete takeaways about ${request.topic}.\n[cta] Tie the lesson back to an action viewers can take today.`,
    callToAction:
      payload.callToAction?.trim() || 'Save this, send it to your content partner, and follow for the next breakdown.',
    hashtags:
      normalizedHashtags.length > 0
        ? normalizedHashtags
        : ['#scriptcraft', '#contentstrategy', '#videomarketing'],
  }

  const script: GeneratedScript = {
    id: randomUUID(),
    title: candidate.title,
    hook: candidate.hook,
    body: candidate.body,
    callToAction: candidate.callToAction,
    hashtags: candidate.hashtags,
    tips:
      normalizedTips.length > 0
        ? normalizedTips
        : [
            'Use on-screen captions for the first line.',
            'Cut every 1-2 sentences to maintain pace.',
            'Support claims with B-roll or screenshots.',
          ],
    estimatedDuration: request.duration,
    platform: request.platform,
    style: request.style,
    createdAt: new Date().toISOString(),
    analytics: buildScriptAnalytics(request, {
      hook: candidate.hook,
      body: candidate.body,
      callToAction: candidate.callToAction,
      hashtags: candidate.hashtags,
    }),
    source,
  }

  return script
}

function fallbackScript(request: GenerateScriptRequest): GeneratedScript {
  return buildScriptObject(
    request,
    {
      title: `${request.platform === 'linkedin' ? 'Authority' : 'Viral'} angle: ${request.topic}`,
      hook: `Everyone talks about ${request.topic}, but almost nobody explains the move that actually gets results.`,
      body: `[hook visual] Open with the before-and-after result.\n[beat] “If you're creating for ${request.platform}, here is the framework.”\n[cut] Point one: define the audience pain in plain language.\n[cut] Point two: show the exact step most people skip.\n[cut] Point three: show the payoff or proof.\n[beat] Wrap with one sentence the viewer can repeat and use today.`,
      callToAction:
        request.primaryGoal?.trim() || 'Comment "script" if you want the framework, then save this for your next recording session.',
      hashtags: ['#scriptcraft', `#${request.platform.replace(/-/g, '')}`, '#contentcreator', '#videostrategy'],
      tips: [
        'Lead with motion in the first second.',
        'Match every key point with a visual proof shot.',
        'End with a tight CTA screen instead of a long outro.',
      ],
    },
    'fallback'
  )
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

export async function generateScript(request: GenerateScriptRequest): Promise<GeneratedScript> {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackScript(request)
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      cache: 'no-store',
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: getScriptPrompt(request) }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          response_mime_type: 'application/json',
          response_json_schema: SCRIPT_RESPONSE_JSON_SCHEMA,
        },
      }),
    }
  )

  const payload = (await response.json()) as GeminiResponse

  if (!response.ok) {
    throw new Error(payload.error?.message || 'Gemini generation failed.')
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''

  if (!text.trim()) {
    throw new Error('Gemini returned an empty response.')
  }

  const parsed = JSON.parse(cleanJsonText(text)) as {
    title?: string
    hook?: string
    body?: string
    callToAction?: string
    hashtags?: string[]
    tips?: string[]
  }

  return buildScriptObject(request, parsed, 'gemini')
}
