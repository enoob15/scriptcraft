import { NextRequest, NextResponse } from 'next/server'
import { PLATFORM_LIMITS, PLATFORM_OPTIONS, STYLE_OPTIONS } from '@/app/lib/catalog'
import { generateScript } from '@/app/lib/gemini'
import {
  buildBillingSnapshot,
  clearBillingSessionCookie,
  FREE_MONTHLY_LIMIT,
  getCookiesFromRequest,
  incrementUsage,
  sessionNeedsRefresh,
  setBillingSessionCookie,
  setUsageCookie,
} from '@/app/lib/session'
import { isStripeConfigured, retrieveSubscription } from '@/app/lib/stripe'
import { GenerateScriptRequest, Platform, ScriptStyle } from '@/app/lib/types'

const validPlatforms = new Set<Platform>(PLATFORM_OPTIONS.map((platform) => platform.value))
const validStyles = new Set<ScriptStyle>(STYLE_OPTIONS.map((style) => style.value))

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function clampDuration(platform: Platform, duration: number): number {
  const bounds = PLATFORM_LIMITS[platform]
  return Math.min(bounds.max, Math.max(bounds.min, duration))
}

function validateRequest(body: unknown): GenerateScriptRequest {
  const input = (body || {}) as Partial<GenerateScriptRequest>
  const platform =
    typeof input.platform === 'string' && validPlatforms.has(input.platform as Platform)
      ? (input.platform as Platform)
      : 'tiktok'
  const style =
    typeof input.style === 'string' && validStyles.has(input.style as ScriptStyle)
      ? (input.style as ScriptStyle)
      : 'educational'
  const duration = clampDuration(platform, Number(input.duration) || PLATFORM_LIMITS[platform].recommended)

  return {
    topic: sanitizeString(input.topic),
    platform,
    style: style as ScriptStyle,
    duration,
    targetAudience: sanitizeString(input.targetAudience),
    brandVoice: sanitizeString(input.brandVoice),
    primaryGoal: sanitizeString(input.primaryGoal),
    keyPoints: Array.isArray(input.keyPoints)
      ? input.keyPoints.map((point) => sanitizeString(point)).filter(Boolean).slice(0, 5)
      : [],
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = validateRequest(await request.json())

    if (!body.topic) {
      return NextResponse.json({ error: 'A topic is required to generate a script.' }, { status: 400 })
    }

    const { billingSession, usage } = getCookiesFromRequest(request)
    let activeSession = billingSession

    if (activeSession?.subscriptionId && sessionNeedsRefresh(activeSession) && isStripeConfigured()) {
      try {
        const subscription = await retrieveSubscription(activeSession.subscriptionId)
        activeSession =
          subscription.status === 'active' || subscription.status === 'trialing'
            ? {
                ...activeSession,
                status: subscription.status,
                refreshedAt: new Date().toISOString(),
              }
            : null
      } catch {
        activeSession = null
      }
    }

    const billing = buildBillingSnapshot(activeSession, usage)

    if (billing.plan === 'free' && billing.usage.count >= FREE_MONTHLY_LIMIT) {
      const response = NextResponse.json(
        {
          error: 'Free plan limit reached. Upgrade to continue generating scripts this month.',
          billing,
        },
        { status: 429 }
      )

      if (!activeSession && billingSession) {
        clearBillingSessionCookie(response)
      }

      return response
    }

    const script = await generateScript(body)
    const updatedUsage = incrementUsage(usage)
    const response = NextResponse.json({
      script,
      billing: buildBillingSnapshot(activeSession, updatedUsage),
    })

    setUsageCookie(response, updatedUsage)

    if (activeSession) {
      setBillingSessionCookie(response, activeSession)
    } else if (billingSession) {
      clearBillingSessionCookie(response)
    }

    return response
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Script generation failed unexpectedly.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
