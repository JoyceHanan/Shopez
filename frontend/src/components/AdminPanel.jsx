import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function StatCard({ label, value, icon }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
    </div>
  )
}

function AdminPanel() {
  const { isAuthenticated, currentUser } = useAuthStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [stocks, setStocks] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  // New stock form
  const [stockForm, setStockForm] = useState({ symbol: '', name: '', currentPrice: '', sector: 'Technology' })

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (currentUser?.role !== 'admin') { toast.error('Admins only'); navigate('/'); }
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, u, st, tx] = await Promise.all([
        axios.get('/admin-api/stats', { withCredentials: true }),
        axios.get('/admin-api/users', { withCredentials: true }),
        axios.get('/admin-api/stocks', { withCredentials: true }),
        axios.get('/admin-api/transactions', { withCredentials: true }),
      ])
      setStats(s.data.payload)
      setUsers(u.data.payload || [])
      setStocks(st.data.payload || [])
      setTransactions(tx.data.payload || [])
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = async (id) => {
    try {
      const res = await axios.put(`/admin-api/users/${id}/toggle`, {}, { withCredentials: true })
      toast.success(res.data.message)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u))
    } catch { toast.error('Failed to toggle user') }
  }

  const deleteStock = async (symbol) => {
    if (!confirm(`Deactivate ${symbol}?`)) return
    try {
      await axios.delete(`/admin-api/stocks/${symbol}`, { withCredentials: true })
      toast.success(`${symbol} deactivated`)
      setStocks(prev => prev.map(s => s.symbol === symbol ? { ...s, isActive: false } : s))
    } catch { toast.error('Failed to deactivate stock') }
  }

  const seedStocks = async () => {
    try {
      const res = await axios.post('/admin-api/stocks/seed', {}, { withCredentials: true })
      toast.success(res.data.message)
      fetchAll()
    } catch { toast.error('Seed failed') }
  }

  const createStock = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/admin-api/stocks', {
        ...stockForm,
        currentPrice: parseFloat(stockForm.currentPrice),
        previousClose: parseFloat(stockForm.currentPrice),
      }, { withCredentials: true })
      toast.success(`${stockForm.symbol} created`)
      setStockForm({ symbol: '', name: '', currentPrice: '', sector: 'Technology' })
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create stock') }
  }

  const TABS = ['stats', 'users', 'stocks', 'transactions']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Manage users, stocks, and transactions</p>
        </div>
        <button onClick={fetchAll} className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${tab === t ? 'bg-sky-500 text-white' : 'border border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-800 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── STATS ─────────────────────────────────────────────────── */}
          {tab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users"       value={stats?.totalUsers}        icon="👥" />
                <StatCard label="Active Stocks"     value={stats?.totalStocks}       icon="📈" />
                <StatCard label="Total Trades"      value={stats?.totalTransactions} icon="⚡" />
                <StatCard label="Trading Volume"    value={`₹${((stats?.totalTradingVolume||0)/1e5).toFixed(1)}L`} icon="💰" />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <h2 className="font-semibold text-white text-sm">Recent Transactions</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['User','Symbol','Type','Amount','Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(stats?.recentTransactions || []).map(t => (
                      <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-300 text-xs">{t.userId?.name || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-white">{t.stockSymbol}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{t.type}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">₹{t.totalAmount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ─────────────────────────────────────────────────── */}
          {tab === 'users' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Name','Email','Role','Status','Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-700 text-slate-400'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => toggleUser(u._id)}
                            className={`text-xs px-3 py-1 rounded-lg border transition-colors ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── STOCKS ────────────────────────────────────────────────── */}
          {tab === 'stocks' && (
            <div className="space-y-6">
              {/* Add stock form */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Add New Stock</h2>
                  <button onClick={seedStocks} className="text-xs px-3 py-1.5 rounded-lg border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-colors">
                    Seed Demo Stocks
                  </button>
                </div>
                <form onSubmit={createStock} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'symbol', placeholder: 'AAPL', label: 'Symbol' },
                    { key: 'name',   placeholder: 'Apple Inc.', label: 'Company Name' },
                    { key: 'currentPrice', placeholder: '189.50', label: 'Price (₹)', type: 'number' },
                    { key: 'sector', placeholder: 'Technology', label: 'Sector' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                      <input required type={f.type || 'text'} placeholder={f.placeholder}
                        value={stockForm[f.key]}
                        onChange={e => setStockForm({ ...stockForm, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  ))}
                  <div className="col-span-2 md:col-span-4">
                    <button type="submit" className="px-6 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors">
                      Add Stock
                    </button>
                  </div>
                </form>
              </div>

              {/* Stocks table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Symbol','Name','Price','Change','Sector','Status','Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {stocks.map(s => (
                      <tr key={s.symbol} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-sky-400">{s.symbol}</td>
                        <td className="px-4 py-3 text-slate-300 text-xs max-w-32 truncate">{s.name}</td>
                        <td className="px-4 py-3 text-white">₹{s.currentPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={s.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {s.changePercent >= 0 ? '▲' : '▼'}{Math.abs(s.changePercent).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{s.sector}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.isActive && (
                            <button onClick={() => deleteStock(s.symbol)}
                              className="text-xs px-3 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS ──────────────────────────────────────────── */}
          {tab === 'transactions' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['User','Symbol','Type','Qty','Price','Total','Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-500">No transactions yet</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-300 text-xs">{t.userId?.name || '—'}</td>
                      <td className="px-4 py-3 font-bold text-white">{t.stockSymbol}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{t.type}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{t.quantity}</td>
                      <td className="px-4 py-3 text-slate-300">₹{t.pricePerShare?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-300">₹{t.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminPanel