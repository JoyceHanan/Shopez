import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#0ea5e9','#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

function Portfolio() {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('holdings')
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => { if (!isAuthenticated) navigate('/login') }, [isAuthenticated])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [portRes, histRes] = await Promise.all([
          axios.get('/portfolio-api/', { withCredentials: true }),
          axios.get('/trade-api/history?limit=20', { withCredentials: true }),
        ])
        setData(portRes.data.payload)
        setHistory(histRes.data.payload || [])
      } catch {
        toast.error('Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-800 animate-pulse" />)}
    </div>
  )

  if (!data) return null

  const pieData = data.holdings.map(h => ({ name: h.stockSymbol, value: h.currentValue || h.totalInvested }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Portfolio</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Account Value',   value: `₹${data.totalAccountValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, color: 'text-white' },
          { label: 'Cash Balance',    value: `₹${data.virtualBalance?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, color: 'text-sky-400' },
          { label: 'Invested',        value: `₹${data.totalInvested?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, color: 'text-slate-300' },
          {
            label: 'Total P&L',
            value: `₹${Math.abs(data.totalProfitLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            color: data.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400',
            sub: `${data.totalProfitLoss >= 0 ? '▲' : '▼'} ${Math.abs(data.totalProfitLossPct).toFixed(2)}%`
          },
        ].map(c => (
          <div key={c.label} className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
            {c.sub && <p className={`text-xs mt-0.5 ${c.color}`}>{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {['holdings', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-sky-500 text-white' : 'border border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'holdings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings list */}
          <div className="lg:col-span-2 space-y-3">
            {data.holdings.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-4xl mb-3">📭</p>
                <p className="mb-3">No holdings yet</p>
                <Link to="/dashboard" className="text-sky-400 hover:underline text-sm">Browse the market →</Link>
              </div>
            ) : (
              data.holdings.map(h => {
                const up = h.profitLoss >= 0
                return (
                  <Link to={`/stock/${h.stockSymbol}`} key={h.stockSymbol}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-sky-500/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                        {h.stockSymbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{h.stockSymbol}</p>
                        <p className="text-xs text-slate-500">{h.quantity} shares · avg ₹{h.averageBuyPrice?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white text-sm">₹{(h.currentValue || h.totalInvested).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      <p className={`text-xs font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
                        {up ? '▲' : '▼'} ₹{Math.abs(h.profitLoss).toFixed(2)} ({Math.abs(h.profitLossPct).toFixed(2)}%)
                      </p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          {/* Pie chart */}
          {data.holdings.length > 0 && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 h-fit">
              <h2 className="text-sm font-medium text-slate-400 mb-4">Allocation</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-400 flex-1">{d.name}</span>
                    <span className="text-slate-300">₹{Number(d.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Symbol', 'Type', 'Qty', 'Price', 'Total', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No transactions yet</td></tr>
              ) : history.map(t => (
                <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{t.stockSymbol}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{t.quantity}</td>
                  <td className="px-4 py-3 text-slate-300">₹{t.pricePerShare?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">₹{t.totalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Portfolio