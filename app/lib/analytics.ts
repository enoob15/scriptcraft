import { PLATFORM_LIMITS } from './catalog'
import { GenerateScriptRequest, GeneratedScript, ScriptAnalytics } from './types'

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function buildScriptAnalytics(
  request: GenerateScriptRequest,
  candidate: Pick<GeneratedScript, 'hook' | 'body' | 'callToAction' | 'hashtags'>
): ScriptAnalytics {
  const hookWords = wordCount(candidate.hook)
  const bodyWords = wordCount(candidate.body)
  const ctaWords = wordCount(candidate.callToAction)
  const estimatedReadTimeSeconds = Math.max(
    15,
    Math.round(((hookWords + bodyWords + ctaWords) / 2.4) * 0.9)
  )

  const durationDelta = Math.abs(request.duration - PLATFORM_LIMITS[request.platform].recommended)
  const hookScore = clampScore(
    92 - Math.abs(hookWords - 11) * 4 + (candidate.hook.includes('?') || candidate.hook.includes('!') ? 4 : 0)
  )
  const clarityScore = clampScore(
    88 - Math.max(bodyWords - 140, 0) * 0.5 + (candidate.body.includes('[') ? 5 : 0)
  )
  const platformFitScore = clampScore(
    94 - durationDelta * 0.6 + Math.min(candidate.hashtags.length, 6) * 2
  )
  const ctaVerbBonus = /(save|follow|comment|download|book|subscribe|share|join|click)/i.test(
    candidate.callToAction
  )
    ? 8
    : -15
  const ctaScore = clampScore(
    90 - Math.abs(ctaWords - 9) * 4 + ctaVerbBonus
  )
  const overallScore = clampScore((hookScore + clarityScore + platformFitScore + ctaScore) / 4)

  const strengths = [
    hookScore >= 80 ? 'Hook is sized for short-form retention.' : 'Hook needs a sharper curiosity gap.',
    clarityScore >= 80 ? 'Script body stays readable for on-camera delivery.' : 'Body is too dense for natural delivery.',
    platformFitScore >= 80
      ? `Structure aligns with ${request.platform} pacing norms.`
      : `Adjust pacing to better match ${request.platform} expectations.`,
  ]

  const risks = [
    candidate.hashtags.length < 4 ? 'Hashtag stack is light; consider adding a discovery layer.' : 'Hashtag mix is usable as-is.',
    estimatedReadTimeSeconds > request.duration + 10
      ? 'Read time may run long without faster delivery or cuts.'
      : 'Read time is within a practical production range.',
    request.style === 'promotional'
      ? 'Promotional scripts perform better with proof or testimonial footage.'
      : 'Test multiple opening visuals to improve retention.',
  ]

  return {
    overallScore,
    hookScore,
    clarityScore,
    platformFitScore,
    ctaScore,
    estimatedReadTimeSeconds,
    suggestedPostTime: PLATFORM_LIMITS[request.platform].postTime,
    targetOutcome:
      request.style === 'promotional'
        ? 'Drive clicks and lead capture'
        : request.style === 'storytelling'
          ? 'Increase watch time and shares'
          : 'Increase saves, comments, and repeat viewers',
    strengths,
    risks,
  }
}
