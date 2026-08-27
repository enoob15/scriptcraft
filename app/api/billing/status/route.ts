import { NextRequest, NextResponse } from 'next/server'
import { isGeminiConfigured } from '@/app/lib/gemini'
import {
  buildBillingSnapshot,
  clearBillingSessionCookie,
  getCookiesFromRequest,
  sessionNeedsRefresh,
  setBillingSessionCookie,
} from '@/app/lib/session'
import { isStripeConfigured, retrieveSubscription } from '@/app/lib/stripe'

export async function GET(request: NextRequest) {
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

  const response = NextResponse.json({
    billing: buildBillingSnapshot(activeSession, usage),
    runtime: {
      geminiConfigured: isGeminiConfigured(),
      stripeConfigured: isStripeConfigured(),
    },
  })

  if (activeSession) {
    setBillingSessionCookie(response, activeSession)
  } else if (billingSession) {
    clearBillingSessionCookie(response)
  }

  return response
}
