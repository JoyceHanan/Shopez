import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const MOCK_CHART = (price) =>
  Array.from({ length: 20 }, (_, i) => ({
    time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
    price: parseFloat((price + (Math.random() - 0.5) * price * 0.03).toFixed(2))
  }))

function StockDetails() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tradeType, setTradeType] = useState('BUY')
  const [quantity, setQuantity] = useState(1)
  const [trading, setTrading] = useState(false)
  const [chartData, setChartData] = useState([])

  useEffect(() => { if (!isAuthenticated) navigate('/login') }, [isAuthenticated])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/stock-api/${symbol}`, { withCredentials: true })
        setStock(res.data.payload)
        setChartData(MOCK_CHART(res.data.payload.currentPrice))
      } catch {
        toast.error('Stock not found')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [symbol])

  const handleTrade = async () => {
    if (quantity < 1) { toast.error('Quantity must be at least 1'); return }
    setTrading(true)
    try {
      const res = await axios.post('/trade-api/', { stockSymbol: symbol, type: tradeType, quantity },
        { withCredentials: true })
      toast.success(res.data.message)
      toast.success(`New balance: ₹${res.data.newBalance?.toLocaleString('en-IN')}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed')
    } finally {
      setTrading(false)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="h-8 w-48 rounded bg-slate-800 animate-pulse" />
      <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
    </div>
  )

  if (!stock) return null

  const up = stock.changePercent >= 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-sky-400 transition-colors mb-6 flex items-center gap-1">
        ← Back to Market
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: chart + stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{stock.symbol}</h1>
                    <p className="text-sm text-slate-400">{stock.name}</p>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">{stock.sector}</span>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-white">₹{stock.currentPrice.toFixed(2)}</p>
              <span className={`text-lg font-semibold mb-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
                {up ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
            <h2 className="text-sm font-medium text-slate-400 mb-4">Intraday Price (simulated)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                  formatter={v => [`₹${v}`, 'Price']}
                />
                <Line type="monotone" dataKey="price" stroke={up ? '#22c55e' : '#ef4444'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Day High',  value: `₹${stock.dayHigh?.toFixed(2)}` },
              { label: 'Day Low',   value: `₹${stock.dayLow?.toFixed(2)}` },
              { label: 'Volume',    value: (stock.volume / 1e6).toFixed(1) + 'M' },
              { label: 'Prev Close',value: `₹${stock.previousClose?.toFixed(2)}` },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-xl border border-slate-800 bg-slate-900">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="font-semibold text-white">{s.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: trade panel */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 h-fit">
          <h2 className="font-bold text-white mb-5">Place Order</h2>

          {/* Buy/Sell toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-5">
            {['BUY', 'SELL'].map(t => (
              <button key={t} onClick={() => setTradeType(t)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${tradeType === t
                  ? t === 'BUY' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  : 'text-slate-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Quantity</label>
              <input type="number" min="1" value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-800 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Price per share</span>
                <span className="text-white">₹{stock.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-slate-700 pt-1.5">
                <span className="text-slate-300">Total</span>
                <span className="text-sky-400">₹{(stock.currentPrice * quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button onClick={handleTrade} disabled={trading}
              className={`w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition-colors ${tradeType === 'BUY' ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}>
              {trading ? 'Processing…' : `${tradeType} ${stock.symbol}`}
            </button>
          </div>

          <p className="text-xs text-slate-600 text-center mt-4">Virtual balance — no real money</p>
        </div>
      </div>
    </div>
  )
}

export default StockDetails