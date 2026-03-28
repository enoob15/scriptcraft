import { VideoCameraIcon, SparklesIcon, ChartBarIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import ScriptGenerator from './components/ScriptGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VideoCameraIcon className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">ScriptCraft</h1>
            </div>
            <div className="text-sm text-gray-600">
              AI-Powered Video Script Generator
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Viral Video Scripts
              <span className="text-primary-600"> in Seconds</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Generate engaging, platform-optimized scripts for TikTok, YouTube Shorts, 
              Instagram Reels, and more using advanced AI. Go from idea to script in under 30 seconds.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <SparklesIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Optimized Content</h3>
              <p className="text-gray-600">Scripts tailored for each platform's algorithm and audience behavior</p>
            </div>
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Performance-Focused</h3>
              <p className="text-gray-600">Proven hooks, structures, and CTAs that drive engagement</p>
            </div>
            <div className="text-center">
              <RocketLaunchIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Launch Ready</h3>
              <p className="text-gray-600">Complete scripts with hashtags, filming tips, and timing cues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Generator */}
      <section className="pb-12">
        <ScriptGenerator />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <VideoCameraIcon className="w-6 h-6" />
            <span className="text-lg font-semibold">ScriptCraft</span>
          </div>
          <p className="text-gray-400 mb-4">
            Built by Alice AI • Powered by advanced language models
          </p>
          <div className="text-sm text-gray-500">
            © 2026 ScriptCraft. Made with 💝 for content creators everywhere.
          </div>
        </div>
      </footer>
    </div>
  )
}