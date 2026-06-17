import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function PriceTag({ value }) {
  const up = value >= 0
  return (
    <span className={`text-sm font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  )
}

function StockRow({ stock }) {
  const up = stock.changePercent >= 0
  return (
    <Link to={`/stock/${stock.symbol}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-sky-500/40 hover:bg-slate-800/60 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400 group-hover:border-sky-500/50 transition-colors">
          {stock.symbol.slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{stock.symbol}</p>
          <p className="text-xs text-slate-500 truncate max-w-32">{stock.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-white">₹{stock.currentPrice.toFixed(2)}</p>
        <PriceTag value={stock.changePercent} />
      </div>
    </Link>
  )
}

function Dashboard() {
  const [stocks, setStocks] = useState([])
  const [summary, setSummary] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => { if (!isAuthenticated) navigate('/login') }, [isAuthenticated])

  const fetchData = useCallback(async () => {
    try {
      const [stocksRes, summaryRes] = await Promise.all([
        axios.get(`/stock-api/?search=${search}`, { withCredentials: true }),
        axios.get('/stock-api/market/summary', { withCredentials: true }),
      ])
      setStocks(stocksRes.data.payload || [])
      setSummary(summaryRes.data.payload)
    } catch {
      toast.error('Failed to load market data')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  const displayStocks = tab === 'gainers' ? (summary?.topGainers || [])
    : tab === 'losers' ? (summary?.topLosers || [])
    : stocks

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Market</h1>
          <p className="text-slate-400 text-sm mt-1">Live prices · refreshes every 30s</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-400 text-sm transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Top Gainer', stock: summary.topGainers?.[0], color: 'green' },
            { label: 'Top Loser',  stock: summary.topLosers?.[0],  color: 'red'   },
            { label: 'Most Active',stock: summary.mostActive?.[0], color: 'sky'   },
          ].map(({ label, stock, color }) => stock && (
            <Link to={`/stock/${stock.symbol}`} key={label}
              className={`p-4 rounded-xl border bg-slate-900 hover:bg-slate-800/60 transition-colors border-${color}-500/20 hover:border-${color}-500/40`}>
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="font-bold text-white">{stock.symbol}</p>
              <p className="text-sm text-slate-400">{stock.name}</p>
              <p className={`text-sm font-semibold mt-1 ${color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : 'text-sky-400'}`}>
                ₹{stock.currentPrice.toFixed(2)} &nbsp;
                {stock.changePercent >= 0 ? '▲' : '▼'}{Math.abs(stock.changePercent).toFixed(2)}%
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search symbol or company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-sm"
        />
        <div className="flex gap-2">
          {['all', 'gainers', 'losers'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-sky-500 text-white' : 'border border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stock list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : displayStocks.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>No stocks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayStocks.map(stock => <StockRow key={stock.symbol} stock={stock} />)}
        </div>
      )}
    </div>
  )
}

export default Dashboard