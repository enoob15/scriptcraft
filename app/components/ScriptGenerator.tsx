'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PLAN_CATALOG, PLATFORM_LIMITS, PLATFORM_OPTIONS, STYLE_OPTIONS } from '@/app/lib/catalog'
import {
  BillingSnapshot,
  GenerateScriptRequest,
  GeneratedScript,
  PlanId,
  TeamSeat,
  WorkspaceProfile,
} from '@/app/lib/types'

const PROFILE_STORAGE_KEY = 'scriptcraft.workspace'
const HISTORY_STORAGE_KEY = 'scriptcraft.history'
const TEAM_STORAGE_KEY = 'scriptcraft.team'

const defaultBilling: BillingSnapshot = {
  plan: 'free',
  status: 'free',
  usage: {
    month: new Date().toISOString().slice(0, 7),
    count: 0,
    limit: 5,
    remaining: 5,
  },
  features: {
    unlimitedScripts: false,
    advancedAnalytics: false,
    collaboration: false,
    exports: true,
  },
}

function createDefaultProfile(): WorkspaceProfile {
  return {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'local-workspace',
    name: '',
    email: '',
    company: '',
    brandVoice: 'Smart, direct, clear, and creator-friendly.',
    primaryGoal: 'Drive saves, shares, and qualified inbound interest.',
  }
}

function defaultForm(profile: WorkspaceProfile): GenerateScriptRequest {
  return {
    topic: '',
    platform: 'tiktok',
    style: 'educational',
    duration: PLATFORM_LIMITS.tiktok.recommended,
    targetAudience: '',
    keyPoints: [],
    brandVoice: profile.brandVoice,
    primaryGoal: profile.primaryGoal,
  }
}

function persist<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildPlainText(script: GeneratedScript): string {
  return [
    script.title,
    '',
    'Hook',
    script.hook,
    '',
    'Body',
    script.body,
    '',
    'CTA',
    script.callToAction,
    '',
    'Hashtags',
    script.hashtags.join(' '),
    '',
    'Filming Tips',
    ...script.tips.map((tip, index) => `${index + 1}. ${tip}`),
  ].join('\n')
}

function buildHtmlExport(script: GeneratedScript): string {
  const hashtagMarkup = script.hashtags
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('')
  const tipsMarkup = script.tips
    .map((tip) => `<li>${escapeHtml(tip)}</li>`)
    .join('')

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    `  <title>${escapeHtml(script.title)}</title>`,
    '  <style>',
    '    body { font-family: Arial, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; color: #172033; }',
    '    h1, h2 { color: #0e2a47; }',
    '    .block { margin-bottom: 24px; padding: 20px; border: 1px solid #dce3ec; border-radius: 16px; background: #f8fafc; }',
    '    .tags span { display: inline-block; margin: 0 8px 8px 0; padding: 6px 10px; border-radius: 999px; background: #ddeaf8; }',
    '  </style>',
    '</head>',
    '<body>',
    `  <h1>${escapeHtml(script.title)}</h1>`,
    `  <div class="block"><h2>Hook</h2><p>${escapeHtml(script.hook)}</p></div>`,
    `  <div class="block"><h2>Body</h2><pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(script.body)}</pre></div>`,
    `  <div class="block"><h2>Call To Action</h2><p>${escapeHtml(script.callToAction)}</p></div>`,
    `  <div class="block tags"><h2>Hashtags</h2><p>${hashtagMarkup}</p></div>`,
    `  <div class="block"><h2>Filming Tips</h2><ol>${tipsMarkup}</ol></div>`,
    '</body>',
    '</html>',
  ].join('\n')
}

function download(name: string, content: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function buildHistorySummary(history: GeneratedScript[]) {
  if (history.length === 0) {
    return {
      averageScore: 0,
      bestPlatform: 'No scripts yet',
      bestScore: 0,
    }
  }

  const averageScore = Math.round(
    history.reduce((sum, item) => sum + item.analytics.overallScore, 0) / history.length
  )
  const platformScores = history.reduce<Record<string, number[]>>((acc, item) => {
    acc[item.platform] = [...(acc[item.platform] || []), item.analytics.overallScore]
    return acc
  }, {})
  const bestPlatform = Object.entries(platformScores)
    .map(([platform, scores]) => ({
      platform,
      score: scores.reduce((sum, value) => sum + value, 0) / scores.length,
    }))
    .sort((left, right) => right.score - left.score)[0]?.platform

  return {
    averageScore,
    bestPlatform: bestPlatform || 'No scripts yet',
    bestScore: Math.max(...history.map((item) => item.analytics.overallScore)),
  }
}

export default function ScriptGenerator() {
  const searchParams = useSearchParams()
  const [hydrated, setHydrated] = useState(false)
  const [profile, setProfile] = useState<WorkspaceProfile>(createDefaultProfile)
  const [formData, setFormData] = useState<GenerateScriptRequest>(() =>
    defaultForm(createDefaultProfile())
  )
  const [history, setHistory] = useState<GeneratedScript[]>([])
  const [team, setTeam] = useState<TeamSeat[]>([])
  const [script, setScript] = useState<GeneratedScript | null>(null)
  const [billing, setBilling] = useState<BillingSnapshot>(defaultBilling)
  const [runtimeFlags, setRuntimeFlags] = useState({
    geminiConfigured: false,
    stripeConfigured: false,
  })
  const [keyPointInput, setKeyPointInput] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamSeat['role']>('Creator')
  const [loading, setLoading] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const historySummary = useMemo(() => buildHistorySummary(history), [history])

  useEffect(() => {
    const storedProfile = readStored(PROFILE_STORAGE_KEY, createDefaultProfile())
    const storedHistory = readStored<GeneratedScript[]>(HISTORY_STORAGE_KEY, [])
    const storedTeam = readStored<TeamSeat[]>(TEAM_STORAGE_KEY, [])

    setProfile(storedProfile)
    setFormData((current) => ({
      ...defaultForm(storedProfile),
      ...current,
      brandVoice: storedProfile.brandVoice,
      primaryGoal: storedProfile.primaryGoal,
    }))
    setHistory(storedHistory)
    setTeam(storedTeam)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    persist(PROFILE_STORAGE_KEY, profile)
  }, [hydrated, profile])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    persist(HISTORY_STORAGE_KEY, history)
  }, [history, hydrated])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    persist(TEAM_STORAGE_KEY, team)
  }, [hydrated, team])

  useEffect(() => {
    async function loadBillingStatus() {
      const response = await fetch('/api/billing/status', { cache: 'no-store' })
      const payload = await response.json()

      if (response.ok) {
        setBilling(payload.billing)
        setRuntimeFlags(payload.runtime)
      }
    }

    loadBillingStatus().catch(() => undefined)
  }, [])

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')

    if (checkoutStatus !== 'success' || !sessionId) {
      if (checkoutStatus === 'cancelled') {
        setNotice('Stripe checkout was cancelled. Your workspace is still active on the current plan.')
      }
      return
    }

    async function confirmCheckout() {
      setBillingLoading(true)
      try {
        const response = await fetch('/api/billing/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error || 'Checkout confirmation failed.')
        }

        setBilling(payload.billing)
        const activePlanName =
          PLAN_CATALOG[(payload.billing.plan as PlanId) || 'pro']?.name || 'Paid plan'
        setNotice(`Billing updated. ${activePlanName} is now active.`)
        window.history.replaceState({}, '', '/#workspace')
      } catch (confirmError) {
        setError(
          confirmError instanceof Error
            ? confirmError.message
            : 'Stripe checkout could not be confirmed.'
        )
      } finally {
        setBillingLoading(false)
      }
    }

    confirmCheckout().catch(() => undefined)
  }, [searchParams])

  const handlePlatformChange = (platform: GenerateScriptRequest['platform']) => {
    setFormData((current) => ({
      ...current,
      platform,
      duration: PLATFORM_LIMITS[platform].recommended,
    }))
  }

  const addKeyPoint = () => {
    const nextPoint = keyPointInput.trim()
    if (!nextPoint || (formData.keyPoints?.length || 0) >= 5) {
      return
    }

    setFormData((current) => ({
      ...current,
      keyPoints: [...(current.keyPoints || []), nextPoint],
    }))
    setKeyPointInput('')
  }

  const removeKeyPoint = (index: number) => {
    setFormData((current) => ({
      ...current,
      keyPoints: (current.keyPoints || []).filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          brandVoice: profile.brandVoice,
          primaryGoal: profile.primaryGoal,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setBilling(payload.billing || billing)
          setShowUpgradeModal(true)
        }
        throw new Error(payload.error || 'Script generation failed.')
      }

      setScript(payload.script)
      setBilling(payload.billing)
      setHistory((current) => [payload.script, ...current].slice(0, 24))
      setNotice(
        payload.script.source === 'gemini'
          ? 'Gemini generated a production script.'
          : 'Gemini API key is missing, so ScriptCraft used the fallback studio generator.'
      )
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Script generation failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (plan: Exclude<PlanId, 'free'>) => {
    setBillingLoading(true)
    setError('')

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: profile.email }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Stripe checkout could not be started.')
      }

      window.location.href = payload.url
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Stripe checkout could not be started.'
      )
    } finally {
      setBillingLoading(false)
    }
  }

  const handlePortal = async () => {
    setBillingLoading(true)
    setError('')

    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const payload = await response.json()

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Billing portal is unavailable.')
      }

      window.location.href = payload.url
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Billing portal failed.')
    } finally {
      setBillingLoading(false)
    }
  }

  const handleInvite = () => {
    const email = inviteEmail.trim()
    if (!email) {
      return
    }

    if (billing.plan !== 'business') {
      setShowUpgradeModal(true)
      return
    }

    setTeam((current) => [
      {
        id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `team-${current.length + 1}`,
        email,
        role: inviteRole,
        status: 'pending',
      },
      ...current,
    ])
    setInviteEmail('')
    setNotice(`Team seat prepared for ${email}.`)
  }

  const limits = PLATFORM_LIMITS[formData.platform]

  return (
    <>
      <div className="container pb-5" id="workspace">
        <div className="row g-4 align-items-start">
          <div className="col-12">
            <div className="hero-panel p-4 p-lg-5">
              <div className="row g-4 align-items-center">
                <div className="col-lg-7">
                  <span className="badge rounded-pill text-bg-light mb-3 px-3 py-2">
                    Revenue-ready short-form script studio
                  </span>
                  <h2 className="display-6 fw-semibold mb-3">
                    Professional script generation, billing, and creator ops in one Bootstrap workspace.
                  </h2>
                  <p className="lead text-secondary mb-0">
                    Move from idea to publishable script, export polished deliverables, and upgrade into a Stripe-backed subscription flow without leaving the page.
                  </p>
                </div>
                <div className="col-lg-5">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="metric-card h-100">
                        <div className="small text-uppercase text-secondary mb-2">Current Plan</div>
                        <div className="h3 mb-1">{PLAN_CATALOG[billing.plan].name}</div>
                        <div className="text-secondary">
                          {billing.plan === 'free'
                            ? `${billing.usage.remaining} free scripts left`
                            : 'Unlimited generation enabled'}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="metric-card h-100">
                        <div className="small text-uppercase text-secondary mb-2">Workspace Score</div>
                        <div className="h3 mb-1">{historySummary.averageScore || '--'}</div>
                        <div className="text-secondary">Average pre-publish script score</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="metric-card h-100">
                        <div className="small text-uppercase text-secondary mb-2">Top Platform</div>
                        <div className="h5 mb-1 text-capitalize">{historySummary.bestPlatform}</div>
                        <div className="text-secondary">Highest scoring content lane</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="metric-card h-100">
                        <div className="small text-uppercase text-secondary mb-2">Runtime Readiness</div>
                        <div className="text-secondary">
                          Gemini: {runtimeFlags.geminiConfigured ? 'Live' : 'Fallback'}
                        </div>
                        <div className="text-secondary">
                          Stripe: {runtimeFlags.stripeConfigured ? 'Live' : 'Needs keys'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h3 className="h4 mb-1">Workspace Profile</h3>
                    <p className="text-secondary mb-0">Used to personalize every script and checkout.</p>
                  </div>
                  <span className={`badge rounded-pill ${billing.plan === 'business' ? 'text-bg-success' : billing.plan === 'pro' ? 'text-bg-primary' : 'text-bg-secondary'}`}>
                    {PLAN_CATALOG[billing.plan].name}
                  </span>
                </div>

                <div className="vstack gap-3">
                  <div>
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      value={profile.name}
                      onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Alice Creative"
                    />
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={profile.email}
                      onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                      placeholder="alice@boone51.com"
                    />
                  </div>

                  <div>
                    <label className="form-label">Company / Brand</label>
                    <input
                      className="form-control"
                      value={profile.company}
                      onChange={(event) => setProfile((current) => ({ ...current, company: event.target.value }))}
                      placeholder="Boone51 Studios"
                    />
                  </div>

                  <div>
                    <label className="form-label">Brand Voice</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={profile.brandVoice}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, brandVoice: event.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label">Primary CTA Goal</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={profile.primaryGoal}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, primaryGoal: event.target.value }))
                      }
                    />
                  </div>

                  <div className="border rounded-4 p-3 bg-body-tertiary">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold">Usage this month</span>
                      <span className="text-secondary">
                        {billing.usage.limit === null
                          ? `${billing.usage.count} generated`
                          : `${billing.usage.count}/${billing.usage.limit}`}
                      </span>
                    </div>
                    <div className="progress" role="progressbar" aria-valuenow={billing.usage.count} aria-valuemin={0} aria-valuemax={billing.usage.limit || 100}>
                      <div
                        className={`progress-bar ${billing.plan === 'free' ? 'bg-warning' : 'bg-success'}`}
                        style={{
                          width: `${
                            billing.usage.limit
                              ? Math.min((billing.usage.count / billing.usage.limit) * 100, 100)
                              : Math.min(billing.usage.count * 5, 100)
                          }%`,
                        }}
                      />
                    </div>
                    <div className="small text-secondary mt-2">
                      {billing.plan === 'free'
                        ? 'Upgrade to remove the monthly limit and unlock advanced analytics.'
                        : 'Paid plans validate through Stripe and refresh automatically.'}
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    {billing.plan === 'free' ? (
                      <>
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={() => handleCheckout('pro')}
                          disabled={billingLoading}
                        >
                          Upgrade to Pro
                        </button>
                        <button
                          className="btn btn-outline-dark"
                          onClick={() => handleCheckout('business')}
                          disabled={billingLoading}
                        >
                          Upgrade to Business
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-outline-primary" onClick={handlePortal} disabled={billingLoading}>
                        Manage Billing in Stripe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                  <div>
                    <h3 className="h4 mb-1">Script Generator</h3>
                    <p className="text-secondary mb-0">
                      Choose the channel, style, and outcome. ScriptCraft handles pacing, hooks, and CTAs.
                    </p>
                  </div>
                  <span className="badge rounded-pill text-bg-dark px-3 py-2">
                    {runtimeFlags.geminiConfigured ? 'Gemini live' : 'Fallback mode until GEMINI_API_KEY is set'}
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Video Topic</label>
                    <input
                      className="form-control form-control-lg"
                      value={formData.topic}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, topic: event.target.value }))
                      }
                      placeholder="Launch a new offer, explain a B2B trend, break down a viral tactic..."
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Platform</label>
                    <select
                      className="form-select"
                      value={formData.platform}
                      onChange={(event) => handlePlatformChange(event.target.value as GenerateScriptRequest['platform'])}
                    >
                      {PLATFORM_OPTIONS.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      {PLATFORM_OPTIONS.find((platform) => platform.value === formData.platform)?.subtitle}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Script Style</label>
                    <select
                      className="form-select"
                      value={formData.style}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          style: event.target.value as GenerateScriptRequest['style'],
                        }))
                      }
                    >
                      {STYLE_OPTIONS.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      {STYLE_OPTIONS.find((style) => style.value === formData.style)?.description}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Target Duration: <strong>{formData.duration}s</strong>
                    </label>
                    <input
                      className="form-range"
                      type="range"
                      min={limits.min}
                      max={limits.max}
                      value={formData.duration}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          duration: Number(event.target.value),
                        }))
                      }
                    />
                    <div className="d-flex justify-content-between small text-secondary">
                      <span>{limits.min}s</span>
                      <span>Recommended {limits.recommended}s</span>
                      <span>{limits.max}s</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Target Audience</label>
                    <input
                      className="form-control"
                      value={formData.targetAudience}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          targetAudience: event.target.value,
                        }))
                      }
                      placeholder="B2B founders, fitness creators, agency clients..."
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Key Points</label>
                    <div className="input-group">
                      <input
                        className="form-control"
                        value={keyPointInput}
                        onChange={(event) => setKeyPointInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            addKeyPoint()
                          }
                        }}
                        placeholder="One insight, example, or proof point per chip"
                      />
                      <button className="btn btn-outline-secondary" type="button" onClick={addKeyPoint}>
                        Add
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {(formData.keyPoints || []).map((point, index) => (
                        <button
                          type="button"
                          key={`${point}-${index}`}
                          className="btn btn-sm btn-outline-dark rounded-pill"
                          onClick={() => removeKeyPoint(index)}
                        >
                          {point} ×
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 d-grid">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleGenerate}
                      disabled={loading || !formData.topic.trim()}
                    >
                      {loading ? 'Generating Script...' : 'Generate Script'}
                    </button>
                  </div>
                </div>

                {error && <div className="alert alert-danger mt-4 mb-0">{error}</div>}
                {notice && <div className="alert alert-info mt-4 mb-0">{notice}</div>}
                {billingLoading && <div className="alert alert-secondary mt-4 mb-0">Updating billing session...</div>}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <h3 className="h4 mb-1">Latest Script Output</h3>
                    <p className="text-secondary mb-0">
                      Export plain text, formatted HTML, or print to PDF for client delivery.
                    </p>
                  </div>
                  {script && (
                    <span className={`badge rounded-pill ${script.source === 'gemini' ? 'text-bg-success' : 'text-bg-warning'}`}>
                      {script.source === 'gemini' ? 'Gemini' : 'Fallback'}
                    </span>
                  )}
                </div>

                {!script ? (
                  <div className="empty-state rounded-4 p-5 text-center">
                    <h4 className="mb-2">No script generated yet</h4>
                    <p className="text-secondary mb-0">
                      Fill out the brief, generate a script, then use this panel for exports and analytics review.
                    </p>
                  </div>
                ) : (
                  <div className="vstack gap-4">
                    <div>
                      <div className="small text-uppercase text-secondary mb-2">Title</div>
                      <div className="output-card">{script.title}</div>
                    </div>
                    <div>
                      <div className="small text-uppercase text-secondary mb-2">Hook</div>
                      <div className="output-card bg-hook">{script.hook}</div>
                    </div>
                    <div>
                      <div className="small text-uppercase text-secondary mb-2">Body</div>
                      <pre className="output-card bg-body-script mb-0">{script.body}</pre>
                    </div>
                    <div>
                      <div className="small text-uppercase text-secondary mb-2">Call To Action</div>
                      <div className="output-card bg-cta">{script.callToAction}</div>
                    </div>
                    <div>
                      <div className="small text-uppercase text-secondary mb-2">Hashtags</div>
                      <div className="d-flex flex-wrap gap-2">
                        {script.hashtags.map((tag) => (
                          <span key={tag} className="badge rounded-pill text-bg-light border">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="small text-uppercase text-secondary mb-2">Filming Tips</div>
                      <ul className="list-group">
                        {script.tips.map((tip, index) => (
                          <li key={`${tip}-${index}`} className="list-group-item">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() =>
                          navigator.clipboard.writeText(buildPlainText(script)).then(() => {
                            setNotice('Full script copied to clipboard.')
                          })
                        }
                      >
                        Copy Full Script
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                          download(`${slugify(script.title) || 'scriptcraft-script'}.txt`, buildPlainText(script), 'text/plain')
                        }
                      >
                        Export Text
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                          download(`${slugify(script.title) || 'scriptcraft-script'}.html`, buildHtmlExport(script), 'text/html')
                        }
                      >
                        Export Formatted
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => {
                          const exportWindow = window.open('', '_blank', 'width=900,height=800')
                          if (!exportWindow) {
                            return
                          }
                          exportWindow.document.write(buildHtmlExport(script))
                          exportWindow.document.close()
                          exportWindow.focus()
                          exportWindow.print()
                        }}
                      >
                        Print / PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h3 className="h4 mb-3">Performance Analytics</h3>
                {script ? (
                  <div className="vstack gap-3">
                    <div className="analytics-meter">
                      <div className="d-flex justify-content-between">
                        <span>Overall</span>
                        <strong>{script.analytics.overallScore}</strong>
                      </div>
                      <div className="progress mt-2"><div className="progress-bar bg-success" style={{ width: `${script.analytics.overallScore}%` }} /></div>
                    </div>
                    <div className="analytics-meter">
                      <div className="d-flex justify-content-between">
                        <span>Hook</span>
                        <strong>{script.analytics.hookScore}</strong>
                      </div>
                      <div className="progress mt-2"><div className="progress-bar bg-primary" style={{ width: `${script.analytics.hookScore}%` }} /></div>
                    </div>
                    <div className="analytics-meter">
                      <div className="d-flex justify-content-between">
                        <span>Clarity</span>
                        <strong>{script.analytics.clarityScore}</strong>
                      </div>
                      <div className="progress mt-2"><div className="progress-bar bg-info" style={{ width: `${script.analytics.clarityScore}%` }} /></div>
                    </div>
                    <div className="analytics-meter">
                      <div className="d-flex justify-content-between">
                        <span>Platform Fit</span>
                        <strong>{script.analytics.platformFitScore}</strong>
                      </div>
                      <div className="progress mt-2"><div className="progress-bar bg-warning" style={{ width: `${script.analytics.platformFitScore}%` }} /></div>
                    </div>
                    <div className="analytics-meter">
                      <div className="d-flex justify-content-between">
                        <span>CTA</span>
                        <strong>{script.analytics.ctaScore}</strong>
                      </div>
                      <div className="progress mt-2"><div className="progress-bar bg-dark" style={{ width: `${script.analytics.ctaScore}%` }} /></div>
                    </div>
                    <div className="small text-secondary">
                      Estimated read time: {script.analytics.estimatedReadTimeSeconds}s
                    </div>
                    <div className="small text-secondary">
                      Suggested post time: {script.analytics.suggestedPostTime}
                    </div>
                    <div className="small text-secondary">
                      Target outcome: {script.analytics.targetOutcome}
                    </div>
                    <div>
                      <div className="fw-semibold mb-2">Strengths</div>
                      <ul className="small text-secondary ps-3 mb-0">
                        {script.analytics.strengths.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="fw-semibold mb-2">Risks</div>
                      <ul className="small text-secondary ps-3 mb-0">
                        {script.analytics.risks.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-secondary mb-0">
                    Generate a script to see retention, clarity, platform-fit, and CTA scoring before you publish.
                  </p>
                )}
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h4 mb-0">Team Workspace</h3>
                  <span className={`badge rounded-pill ${billing.plan === 'business' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                    {billing.plan === 'business' ? 'Business active' : 'Business only'}
                  </span>
                </div>

                <p className="text-secondary">
                  Prepare collaborator seats for creators, strategists, and approvers. Business plan is required for team workflows.
                </p>

                <div className="input-group mb-2">
                  <input
                    className="form-control"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="invite@client.com"
                  />
                  <select
                    className="form-select"
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as TeamSeat['role'])}
                  >
                    <option value="Creator">Creator</option>
                    <option value="Strategist">Strategist</option>
                    <option value="Approver">Approver</option>
                  </select>
                </div>
                <div className="d-grid">
                  <button className="btn btn-outline-dark" onClick={handleInvite}>
                    Add Team Seat
                  </button>
                </div>

                <div className="list-group mt-3">
                  {team.length === 0 ? (
                    <div className="list-group-item text-secondary">
                      No seats staged yet.
                    </div>
                  ) : (
                    team.map((member) => (
                      <div key={member.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{member.email}</div>
                          <div className="small text-secondary">{member.role}</div>
                        </div>
                        <span className={`badge rounded-pill ${member.status === 'active' ? 'text-bg-success' : 'text-bg-warning'}`}>
                          {member.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                  <div>
                    <h3 className="h4 mb-1">Script History</h3>
                    <p className="text-secondary mb-0">
                      Local workspace history keeps the latest 24 scripts with analytics snapshots.
                    </p>
                  </div>
                  <span className="badge rounded-pill text-bg-light border">
                    {history.length} saved locally
                  </span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="metric-card h-100">
                      <div className="small text-uppercase text-secondary mb-2">Average Score</div>
                      <div className="h3 mb-0">{historySummary.averageScore || '--'}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric-card h-100">
                      <div className="small text-uppercase text-secondary mb-2">Best Score</div>
                      <div className="h3 mb-0">{historySummary.bestScore || '--'}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric-card h-100">
                      <div className="small text-uppercase text-secondary mb-2">Winning Platform</div>
                      <div className="h5 mb-0 text-capitalize">{historySummary.bestPlatform}</div>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  {history.length === 0 ? (
                    <div className="col-12">
                      <div className="empty-state rounded-4 p-4 text-center">
                        <p className="text-secondary mb-0">
                          Generated scripts will appear here with one-click reload back into the workspace.
                        </p>
                      </div>
                    </div>
                  ) : (
                    history.map((item) => (
                      <div className="col-md-6 col-xl-4" key={item.id}>
                        <div className="history-card h-100">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge rounded-pill text-bg-light border text-capitalize">
                              {item.platform}
                            </span>
                            <span className="small text-secondary">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="h6">{item.title}</h4>
                          <p className="text-secondary small">{item.hook}</p>
                          <div className="d-flex justify-content-between small mb-3">
                            <span>Score {item.analytics.overallScore}</span>
                            <span>{item.estimatedDuration}s</span>
                          </div>
                          <div className="d-grid gap-2">
                            <button className="btn btn-sm btn-outline-dark" onClick={() => setScript(item)}>
                              Load Into Output
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                navigator.clipboard.writeText(buildPlainText(item)).then(() => {
                                  setNotice(`Copied ${item.title} to clipboard.`)
                                })
                              }
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-body p-4 p-lg-5">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="small text-uppercase text-secondary mb-2">Upgrade Required</div>
                      <h3 className="h4 mb-0">Free plan limit reached</h3>
                    </div>
                    <button className="btn-close" aria-label="Close" onClick={() => setShowUpgradeModal(false)} />
                  </div>
                  <p className="text-secondary">
                    Upgrade to remove the 5-script monthly cap and unlock advanced analytics, billing controls, and team workflows.
                  </p>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="plan-tile h-100">
                        <div className="fw-semibold mb-2">Pro</div>
                        <div className="display-6 mb-2">$9</div>
                        <div className="text-secondary small">Unlimited scripts for solo creators.</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="plan-tile h-100">
                        <div className="fw-semibold mb-2">Business</div>
                        <div className="display-6 mb-2">$29</div>
                        <div className="text-secondary small">Unlimited scripts plus team seats and business analytics.</div>
                      </div>
                    </div>
                  </div>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary btn-lg" onClick={() => handleCheckout('pro')}>
                      Upgrade to Pro
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => handleCheckout('business')}>
                      Upgrade to Business
                    </button>
                    <button className="btn btn-link text-decoration-none" onClick={() => setShowUpgradeModal(false)}>
                      Stay on Free
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show modal-backdrop-custom" />
        </>
      )}
    </>
  )
}
