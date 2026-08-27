import { Suspense } from 'react'
import ScriptGenerator from './components/ScriptGenerator'
import { PLAN_CATALOG, PLAN_ORDER } from './lib/catalog'

const valueProps = [
  {
    title: 'Platform-Optimized Output',
    description: 'Generate hooks, pacing, and CTA structures tuned for TikTok, Shorts, Reels, X, and LinkedIn.',
  },
  {
    title: 'Revenue Infrastructure',
    description: 'Hosted Stripe checkout, billing portal routing, and tiered SaaS packaging are wired into the product flow.',
  },
  {
    title: 'Creator Ops Workspace',
    description: 'Keep profile context, script history, exports, and business-team seat preparation inside one workspace.',
  },
]

const productionChecklist = [
  'Bootstrap-powered responsive layout with navbar, pricing cards, modal, forms, and grid sections',
  'Gemini REST integration with structured JSON output and production fallback behavior',
  'Stripe checkout, checkout confirmation, billing status, and customer portal endpoints',
  'Security-focused Next.js headers and domain-ready metadata for scriptcraft.boone51.com',
]

export default function Home() {
  return (
    <main className="pb-5">
      <section className="top-shell">
        <div className="container">
          <nav className="navbar navbar-expand-lg py-4">
            <a className="navbar-brand fw-semibold fs-3" href="#">
              ScriptCraft
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#scriptcraftNav"
              aria-controls="scriptcraftNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="scriptcraftNav">
              <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
                <a className="nav-link" href="#workspace">
                  Workspace
                </a>
                <a className="nav-link" href="#pricing">
                  Pricing
                </a>
                <a className="nav-link" href="#production">
                  Production
                </a>
                <a className="btn btn-dark rounded-pill px-4" href="#workspace">
                  Launch Studio
                </a>
              </div>
            </div>
          </nav>

          <div className="hero-stage py-5 py-lg-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <span className="badge rounded-pill text-bg-light border px-3 py-2 mb-4">
                  Stop staring at blank pages. Start creating viral content.
                </span>
                <h1 className="display-2 fw-semibold mb-4">
                  AI video scripts built for creators, marketers, and agencies that need output fast.
                </h1>
                <p className="lead text-secondary mb-4">
                  ScriptCraft turns a rough topic into a publishable short-form script, wrapped in a SaaS-ready experience with pricing, billing, exports, and deployment-oriented production config.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <a className="btn btn-primary btn-lg px-4" href="#workspace">
                    Generate Your First Script
                  </a>
                  <a className="btn btn-outline-dark btn-lg px-4" href="#pricing">
                    View Pricing
                  </a>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="hero-stack">
                  <div className="hero-stack-card">
                    <div className="small text-uppercase text-secondary mb-2">Positioning</div>
                    <h2 className="h4">Compete with Jasper and Copy.ai for short-form video creation.</h2>
                  </div>
                  <div className="hero-stack-card">
                    <div className="small text-uppercase text-secondary mb-2">Target Buyer</div>
                    <p className="mb-0">Content creators, marketers, consultants, and agencies producing platform-native social video.</p>
                  </div>
                  <div className="hero-stack-card">
                    <div className="small text-uppercase text-secondary mb-2">USP</div>
                    <p className="mb-0">Platform-optimized hooks, structure, CTA logic, and creator ops in one workspace.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mt-4">
              {valueProps.map((item) => (
                <div className="col-md-4" key={item.title}>
                  <div className="value-card h-100">
                    <div className="small text-uppercase text-secondary mb-2">Why It Matters</div>
                    <h2 className="h4 mb-2">{item.title}</h2>
                    <p className="mb-0 text-secondary">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <Suspense
          fallback={
            <div className="container">
              <div className="empty-state rounded-4 p-5 text-center">
                <h2 className="h4 mb-2">Loading workspace...</h2>
                <p className="text-secondary mb-0">Preparing the ScriptCraft studio.</p>
              </div>
            </div>
          }
        >
          <ScriptGenerator />
        </Suspense>
      </section>

      <section className="py-5" id="pricing">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill text-bg-light border px-3 py-2 mb-3">Pricing</span>
            <h2 className="display-6 fw-semibold mb-3">Bootstrap-styled pricing for a real SaaS funnel</h2>
            <p className="lead text-secondary mb-0">
              Start free, scale to Pro, and unlock collaboration in Business without changing products.
            </p>
          </div>
          <div className="row g-4">
            {PLAN_ORDER.map((planId) => {
              const plan = PLAN_CATALOG[planId]
              return (
                <div className="col-lg-4" key={plan.id}>
                  <div className={`pricing-card h-100 ${plan.highlight ? 'pricing-card-featured' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <div className="small text-uppercase text-secondary mb-2">{plan.name}</div>
                        <h3 className="display-5 mb-0">{plan.priceLabel}</h3>
                        <div className="text-secondary">per month</div>
                      </div>
                      {plan.highlight && <span className="badge rounded-pill text-bg-primary">Most Popular</span>}
                    </div>
                    <p className="text-secondary">{plan.description}</p>
                    <ul className="list-group list-group-flush mb-4">
                      {plan.features.map((feature) => (
                        <li className="list-group-item px-0" key={feature}>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline-dark'} w-100`} href="#workspace">
                      {plan.cta}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-5" id="production">
        <div className="container">
          <div className="production-strip p-4 p-lg-5">
            <div className="row g-4 align-items-center">
              <div className="col-lg-6">
                <span className="badge rounded-pill text-bg-light border px-3 py-2 mb-3">
                  Production Handoff
                </span>
                <h2 className="display-6 fw-semibold mb-3">
                  Prepared for domain launch on scriptcraft.boone51.com, without deploying directly.
                </h2>
                <p className="text-secondary mb-0">
                  The product is reworked for professional review and handoff. Deployment still follows the required chain: Codex to Alice to Neo to Production.
                </p>
              </div>
              <div className="col-lg-6">
                <ul className="list-group">
                  {productionChecklist.map((item) => (
                    <li className="list-group-item" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-5">
        <div className="container">
          <div className="footer-shell p-4 p-lg-5">
            <div className="row g-3 align-items-center">
              <div className="col-lg-7">
                <h2 className="h3 mb-2">ScriptCraft</h2>
                <p className="text-secondary mb-0">
                  AI video script generation for TikTok, Shorts, Reels, X, and LinkedIn with SaaS-ready billing and exports.
                </p>
              </div>
              <div className="col-lg-5 text-lg-end">
                <div className="small text-secondary">Mother&apos;s Cupboard handoff protocol active</div>
                <div className="fw-semibold">Codex → Alice → Neo → Production</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
