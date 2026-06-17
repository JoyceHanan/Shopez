import { Link } from 'react-router'
import { useAuthStore } from '../store/authStore'

const FEATURES = [
  { icon: '📊', title: 'Live Market Data', desc: 'Real-time price updates across major stocks with detailed analytics.' },
  { icon: '💼', title: 'Portfolio Tracking', desc: 'Monitor your holdings, P&L, and account value at a glance.' },
  { icon: '⚡', title: 'Instant Trades', desc: 'Execute buy and sell orders instantly with your virtual balance.' },
  { icon: '🔒', title: 'Secure Auth', desc: 'JWT-based authentication with refresh token rotation.' },
]

const STATS = [
  { value: '10+', label: 'Stocks Available' },
  { value: '$1,00,000', label: 'Starting Balance' },
  { value: '100%', label: 'Virtual & Safe' },
]

function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Virtual Trading Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Trade Smarter,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              Risk Nothing
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Practice stock trading with ₹1,00,000 virtual balance. Explore real market data,
            build your portfolio, and sharpen your investment skills — all without real money.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-lg transition-all shadow-lg shadow-sky-500/20">
                Go to Market →
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-lg transition-all shadow-lg shadow-sky-500/20">
                  Start Trading Free
                </Link>
                <Link to="/login" className="px-8 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-lg transition-all">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-sky-400">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Everything you need to trade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900 hover:border-sky-500/40 transition-colors group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-sky-400 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to start?</h2>
            <p className="text-slate-400 mb-6">Create your free account and get ₹1,00,000 to trade with immediately.</p>
            <Link to="/register" className="inline-block px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all">
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home