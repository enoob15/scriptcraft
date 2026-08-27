import { NextRequest, NextResponse } from 'next/server'
import { getCookiesFromRequest } from '@/app/lib/session'
import { createBillingPortalSession } from '@/app/lib/stripe'
import { getAppUrl } from '@/app/lib/site'

export async function POST(request: NextRequest) {
  try {
    const { billingSession } = getCookiesFromRequest(request)

    if (!billingSession?.customerId) {
      return NextResponse.json(
        { error: 'Billing portal is only available for active paid customers.' },
        { status: 401 }
      )
    }

    const session = await createBillingPortalSession({
      customerId: billingSession.customerId,
      returnUrl: `${getAppUrl()}/#workspace`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to open the Stripe billing portal.',
      },
      { status: 500 }
    )
  }
}
