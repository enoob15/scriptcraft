import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { BillingSnapshot, PlanId, UsageSnapshot } from './types'

type BillingSessionCookie = {
  plan: Exclude<PlanId, 'free'>
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  customerId: string
  subscriptionId: string
  email?: string
  refreshedAt: string
}

type UsageCookie = {
  month: string
  count: number
}

export const SESSION_COOKIE_NAME = 'scriptcraft_session'
export const USAGE_COOKIE_NAME = 'scriptcraft_usage'
export const FREE_MONTHLY_LIMIT = 5

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'scriptcraft-local-development-secret'
}

function toBase64Url(input: string): string {
  return Buffer.from(input).toString('base64url')
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')
}

export function encodeSignedCookie<T extends object>(value: T): string {
  const payload = toBase64Url(JSON.stringify(value))
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function decodeSignedCookie<T>(value?: string): T | null {
  if (!value) {
    return null
  }

  const [payload, signature] = value.split('.')
  if (!payload || !signature) {
    return null
  }

  const expected = sign(payload)
  const isValid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected))

  if (!isValid) {
    return null
  }

  try {
    return JSON.parse(fromBase64Url(payload)) as T
  } catch {
    return null
  }
}

export function currentUsageMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function readUsageCookie(value?: string): UsageCookie {
  const parsed = decodeSignedCookie<UsageCookie>(value)

  if (!parsed || parsed.month !== currentUsageMonth()) {
    return {
      month: currentUsageMonth(),
      count: 0,
    }
  }

  return parsed
}

export function incrementUsage(cookie: UsageCookie): UsageCookie {
  return {
    month: currentUsageMonth(),
    count: cookie.month === currentUsageMonth() ? cookie.count + 1 : 1,
  }
}

export function readBillingSession(value?: string): BillingSessionCookie | null {
  return decodeSignedCookie<BillingSessionCookie>(value)
}

export function sessionNeedsRefresh(session: BillingSessionCookie): boolean {
  const age = Date.now() - new Date(session.refreshedAt).getTime()
  return age > 1000 * 60 * 60 * 6
}

function featureAccess(plan: PlanId) {
  return {
    unlimitedScripts: plan !== 'free',
    advancedAnalytics: plan !== 'free',
    collaboration: plan === 'business',
    exports: true,
  }
}

export function usageSnapshot(plan: PlanId, usage: UsageCookie): UsageSnapshot {
  const limit = plan === 'free' ? FREE_MONTHLY_LIMIT : null
  return {
    month: usage.month,
    count: usage.count,
    limit,
    remaining: limit === null ? null : Math.max(limit - usage.count, 0),
  }
}

export function buildBillingSnapshot(
  session: BillingSessionCookie | null,
  usage: UsageCookie
): BillingSnapshot {
  const plan = session?.status === 'active' || session?.status === 'trialing' ? session.plan : 'free'
  const status = session?.status ?? 'free'

  return {
    plan,
    status,
    customerId: session?.customerId,
    subscriptionId: session?.subscriptionId,
    usage: usageSnapshot(plan, usage),
    features: featureAccess(plan),
  }
}

export function setBillingSessionCookie(
  response: NextResponse,
  session: BillingSessionCookie
): void {
  response.cookies.set(SESSION_COOKIE_NAME, encodeSignedCookie(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function clearBillingSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export function setUsageCookie(response: NextResponse, usage: UsageCookie): void {
  response.cookies.set(USAGE_COOKIE_NAME, encodeSignedCookie(usage), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 32,
  })
}

export function getCookiesFromRequest(request: NextRequest): {
  billingSession: BillingSessionCookie | null
  usage: UsageCookie
} {
  return {
    billingSession: readBillingSession(request.cookies.get(SESSION_COOKIE_NAME)?.value),
    usage: readUsageCookie(request.cookies.get(USAGE_COOKIE_NAME)?.value),
  }
}

export type { BillingSessionCookie }
