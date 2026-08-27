import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/app/lib/stripe'
import { PlanId } from '@/app/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { plan?: PlanId; email?: string }

    if (body.plan !== 'pro' && body.plan !== 'business') {
      return NextResponse.json({ error: 'Select a paid plan before checkout.' }, { status: 400 })
    }

    const session = await createCheckoutSession({
      plan: body.plan,
      email: typeof body.email === 'string' ? body.email.trim() : undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to start Stripe checkout.',
      },
      { status: 500 }
    )
  }
}
