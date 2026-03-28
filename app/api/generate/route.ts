import { NextRequest, NextResponse } from 'next/server'
import { GenerateScriptRequest, GeneratedScript } from '@/app/lib/types'
import { getScriptPrompt } from '@/app/lib/scriptPrompts'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateScriptRequest = await request.json()
    
    const { topic, platform, style, duration, targetAudience, keyPoints } = body
    
    // Validate required fields
    if (!topic || !platform || !style || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate the prompt
    const prompt = getScriptPrompt(topic, platform, style, duration, targetAudience, keyPoints)
    
    // For MVP, we'll use a mock response since we need to set up Gemini API properly
    // In production, this would call the Gemini API
    const mockScript: GeneratedScript = {
      id: `script_${Date.now()}`,
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} ${platform.replace('-', ' ')} Script: ${topic}`,
      hook: generateMockHook(topic, platform, style),
      body: generateMockBody(topic, platform, style, duration),
      callToAction: generateMockCTA(platform, style),
      hashtags: generateMockHashtags(topic, platform),
      estimatedDuration: duration,
      platform,
      style,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json({ script: mockScript })
    
  } catch (error) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    )
  }
}

// Mock generators for MVP (replace with real AI later)
function generateMockHook(topic: string, platform: string, style: string): string {
  const hooks = {
    tiktok: [
      `Wait, did you know that ${topic}...`,
      `This ${topic} hack will blow your mind!`,
      `POV: You just discovered ${topic}`,
      `Tell me why ${topic} without telling me why`
    ],
    'youtube-shorts': [
      `In the next 60 seconds, I'll show you everything about ${topic}`,
      `Here's what nobody tells you about ${topic}`,
      `3 things about ${topic} that changed my perspective`
    ],
    'instagram-reels': [
      `${topic}: expectation vs reality`,
      `Things I wish I knew about ${topic}`,
      `Rating ${topic} trends`
    ]
  }
  
  const platformHooks = hooks[platform as keyof typeof hooks] || hooks.tiktok
  return platformHooks[Math.floor(Math.random() * platformHooks.length)]
}

function generateMockBody(topic: string, platform: string, style: string, duration: number): string {
  return `[VISUAL CUE: Show compelling opening visual]

${generateMockHook(topic, platform, style)}

[PAUSE for 2 seconds]

Here's the thing about ${topic} - most people get it completely wrong. 

[EMPHASIS] The real secret is...

[VISUAL CUE: Show main content/demo]

Point 1: [Specific insight about ${topic}]
Point 2: [Actionable tip]
Point 3: [Surprising fact or result]

[PAUSE]

And that's how you master ${topic} in under ${duration} seconds!

[TRANSITION to call-to-action]`
}

function generateMockCTA(platform: string, style: string): string {
  const ctas = {
    educational: 'Save this for later and follow for more tips!',
    entertaining: 'Like if this made you laugh, follow for more!',
    promotional: 'Link in bio to get started today!',
    storytelling: 'Comment your story below!',
    trending: 'Duet this with your version!'
  }
  
  return ctas[style as keyof typeof ctas] || 'Follow for more content like this!'
}

function generateMockHashtags(topic: string, platform: string): string[] {
  const topicTags = topic.split(' ').map(word => `#${word.toLowerCase()}`)
  const platformTags = {
    tiktok: ['#fyp', '#viral', '#tiktoklearning'],
    'youtube-shorts': ['#shorts', '#youtubeshorts', '#quicktips'],
    'instagram-reels': ['#reels', '#instagram', '#trending']
  }
  
  const baseTags = platformTags[platform as keyof typeof platformTags] || ['#content', '#tips']
  return [...topicTags.slice(0, 3), ...baseTags, '#scriptcraft'].slice(0, 8)
}