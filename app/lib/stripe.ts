import { PlanId } from './types'
import { getAppUrl } from './site'

type StripeCheckoutSession = {
  id: string
  url: string
  mode: string
  customer: string | null
  customer_email: string | null
  payment_status: string
  metadata?: Record<string, string>
  subscription?: string | { id: string; status: string; metadata?: Record<string, string> }
}

type StripeSubscription = {
  id: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | string
  metadata?: Record<string, string>
}

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.')
  }
  return key
}

function getPriceId(plan: Exclude<PlanId, 'free'>): string {
  const priceId =
    plan === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_BUSINESS_PRICE_ID

  if (!priceId) {
    throw new Error(`Stripe price ID is missing for the ${plan} plan.`)
  }

  return priceId
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRO_PRICE_ID &&
      process.env.STRIPE_BUSINESS_PRICE_ID
  )
}

async function stripeRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST'
    params?: URLSearchParams
  }
): Promise<T> {
  const method = options.method ?? 'GET'
  const params = options.params
  const baseUrl = `https://api.stripe.com${path}`
  const url = method === 'GET' && params ? `${baseUrl}?${params.toString()}` : baseUrl

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: method === 'POST' ? params?.toString() : undefined,
    cache: 'no-store',
  })

  const payload = await response.json()

  if (!response.ok) {
    const message =
      payload?.error?.message || 'Stripe request failed. Check your billing configuration.'
    throw new Error(message)
  }

  return payload as T
}

export async function createCheckoutSession(input: {
  plan: Exclude<PlanId, 'free'>
  email?: string
}): Promise<StripeCheckoutSession> {
  const params = new URLSearchParams()
  params.set('mode', 'subscription')
  params.set('success_url', `${getAppUrl()}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`)
  params.set('cancel_url', `${getAppUrl()}/?checkout=cancelled`)
  params.set('line_items[0][price]', getPriceId(input.plan))
  params.set('line_items[0][quantity]', '1')
  params.set('allow_promotion_codes', 'true')
  params.set('billing_address_collection', 'auto')
  params.set('metadata[plan]', input.plan)
  params.set('subscription_data[metadata][plan]', input.plan)
  params.set('subscription_data[metadata][product]', 'scriptcraft')

  if (input.email) {
    params.set('customer_email', input.email)
  }

  return stripeRequest<StripeCheckoutSession>('/v1/checkout/sessions', {
    method: 'POST',
    params,
  })
}

export async function retrieveCheckoutSession(
  sessionId: string
): Promise<StripeCheckoutSession> {
  const params = new URLSearchParams()
  params.append('expand[]', 'subscription')

  return stripeRequest<StripeCheckoutSession>(`/v1/checkout/sessions/${sessionId}`, {
    method: 'GET',
    params,
  })
}

export async function retrieveSubscription(
  subscriptionId: string
): Promise<StripeSubscription> {
  return stripeRequest<StripeSubscription>(`/v1/subscriptions/${subscriptionId}`, {
    method: 'GET',
  })
}

export async function createBillingPortalSession(input: {
  customerId: string
  returnUrl?: string
}): Promise<{ url: string }> {
  const params = new URLSearchParams()
  params.set('customer', input.customerId)
  params.set('return_url', input.returnUrl || getAppUrl())

  return stripeRequest<{ url: string }>('/v1/billing_portal/sessions', {
    method: 'POST',
    params,
  })
}
