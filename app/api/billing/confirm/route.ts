import { NextRequest, NextResponse } from 'next/server'
import {
  buildBillingSnapshot,
  getCookiesFromRequest,
  setBillingSessionCookie,
} from '@/app/lib/session'
import { retrieveCheckoutSession, retrieveSubscription } from '@/app/lib/stripe'
import { PlanId } from '@/app/lib/types'

function getPlanFromMetadata(plan?: string): Exclude<PlanId, 'free'> {
  return plan === 'business' ? 'business' : 'pro'
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { sessionId?: string }
    if (!body.sessionId) {
      return NextResponse.json({ error: 'Missing checkout session ID.' }, { status: 400 })
    }

    const checkoutSession = await retrieveCheckoutSession(body.sessionId)
    const subscriptionId =
      typeof checkoutSession.subscription === 'string'
        ? checkoutSession.subscription
        : checkoutSession.subscription?.id

    if (!subscriptionId || !checkoutSession.customer) {
      return NextResponse.json(
        { error: 'Stripe did not return a subscription for this checkout.' },
        { status: 400 }
      )
    }

    const subscription =
      typeof checkoutSession.subscription === 'string'
        ? await retrieveSubscription(subscriptionId)
        : checkoutSession.subscription

    if (!subscription) {
      return NextResponse.json(
        { error: 'Stripe subscription details could not be loaded.' },
        { status: 400 }
      )
    }

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return NextResponse.json(
        { error: `Subscription is ${subscription.status}. Billing access was not activated.` },
        { status: 400 }
      )
    }

    const { usage } = getCookiesFromRequest(request)
    const sessionCookie = {
      plan: getPlanFromMetadata(
        checkoutSession.metadata?.plan || subscription.metadata?.plan
      ),
      status: subscription.status as 'active' | 'trialing',
      customerId: checkoutSession.customer,
      subscriptionId,
      email: checkoutSession.customer_email || undefined,
      refreshedAt: new Date().toISOString(),
    }

    const response = NextResponse.json({
      billing: buildBillingSnapshot(sessionCookie, usage),
    })

    setBillingSessionCookie(response, sessionCookie)
    return response
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not confirm the Stripe checkout session.',
      },
      { status: 500 }
    )
  }
}
