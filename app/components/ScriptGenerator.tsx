'use client'

import { useState } from 'react'
import { Platform, ScriptStyle, GenerateScriptRequest, GeneratedScript } from '@/app/lib/types'
import { PLATFORM_LIMITS } from '@/app/lib/scriptPrompts'
import { PlayIcon, ClockIcon, HashtagIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export default function ScriptGenerator() {
  const [formData, setFormData] = useState<GenerateScriptRequest>({
    topic: '',
    platform: 'tiktok',
    style: 'educational',
    duration: 60,
    targetAudience: '',
    keyPoints: []
  })
  
  const [script, setScript] = useState<GeneratedScript | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyPointInput, setKeyPointInput] = useState('')

  const platforms: { value: Platform; label: string; icon: string }[] = [
    { value: 'tiktok', label: 'TikTok', icon: '📱' },
    { value: 'youtube-shorts', label: 'YouTube Shorts', icon: '📺' },
    { value: 'instagram-reels', label: 'Instagram Reels', icon: '📸' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  ]

  const styles: { value: ScriptStyle; label: string; description: string }[] = [
    { value: 'educational', label: 'Educational', description: 'Teach something valuable' },
    { value: 'entertaining', label: 'Entertaining', description: 'Fun and engaging' },
    { value: 'promotional', label: 'Promotional', description: 'Sell a product or service' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrative with emotion' },
    { value: 'trending', label: 'Trending', description: 'Use current trends' },
  ]

  const addKeyPoint = () => {
    if (keyPointInput.trim() && (formData.keyPoints?.length || 0) < 5) {
      setFormData(prev => ({
        ...prev,
        keyPoints: [...(prev.keyPoints || []), keyPointInput.trim()]
      }))
      setKeyPointInput('')
    }
  }

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: (prev.keyPoints || []).filter((_, i) => i !== index)
    }))
  }

  const generateScript = async () => {
    setLoading(true)
    setError('')
    setScript(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate script')
      }

      const data = await response.json()
      setScript(data.script)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const limits = PLATFORM_LIMITS[formData.platform]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Generator Form */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <PlayIcon className="w-6 h-6 text-primary-600" />
            Script Generator
          </h2>

          <div className="space-y-4">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium mb-2">Video Topic</label>
              <input
                type="text"
                placeholder="e.g., How to code in Python, Morning routine, Product launch"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value as Platform }))}
              >
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.icon} {platform.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.style}
                onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value as ScriptStyle }))}
              >
                {styles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label} - {style.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration: {formData.duration} seconds
              </label>
              <input
                type="range"
                min={limits.min}
                max={limits.max}
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{limits.min}s</span>
                <span>Recommended: {limits.recommended}s</span>
                <span>{limits.max}s</span>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-2">Target Audience (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Beginner developers, Small business owners, Gen Z"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>

            {/* Key Points */}
            <div>
              <label className="block text-sm font-medium mb-2">Key Points to Include (Optional)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a key point..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={keyPointInput}
                  onChange={(e) => setKeyPointInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyPoint()}
                />
                <button
                  type="button"
                  onClick={addKeyPoint}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  disabled={!keyPointInput.trim() || (formData.keyPoints?.length || 0) >= 5}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keyPoints?.map((point, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {point}
                    <button
                      onClick={() => removeKeyPoint(index)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={generateScript}
              disabled={loading || !formData.topic.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Script'}
            </button>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Generated Script */}
        {script && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Generated Script</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                {script.estimatedDuration}s
              </div>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <div className="relative">
                  <p className="p-3 bg-gray-50 rounded-lg">{script.title}</p>
                  <button
                    onClick={() => copyToClipboard(script.title)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hook */}
              <div>
                <label className="block text-sm font-semibold mb-1">Hook (Opening)</label>
                <div className="relative">
                  <p className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">{script.hook}</p>
                  <button
                    onClick={() => copyToClipboard(script.hook)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-semibold mb-1">Script Body</label>
                <div className="relative">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg whitespace-pre-wrap font-mono text-sm">
                    {script.body}
                  </div>
                  <button
                    onClick={() => copyToClipboard(script.body)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div>
                <label className="block text-sm font-semibold mb-1">Call to Action</label>
                <div className="relative">
                  <p className="p-3 bg-green-50 border border-green-200 rounded-lg">{script.callToAction}</p>
                  <button
                    onClick={() => copyToClipboard(script.callToAction)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                  <HashtagIcon className="w-4 h-4" />
                  Hashtags
                </label>
                <div className="relative">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {script.hashtags.map((tag, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(script.hashtags.join(' '))}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Full Script Copy */}
              <button
                onClick={() => {
                  const fullScript = `${script.title}\n\n${script.hook}\n\n${script.body}\n\n${script.callToAction}\n\n${script.hashtags.join(' ')}`
                  copyToClipboard(fullScript)
                }}
                className="w-full btn-secondary"
              >
                Copy Complete Script
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}