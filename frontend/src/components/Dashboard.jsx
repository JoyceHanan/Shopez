import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

function Dashboard() {
  const { isAuthenticated, currentUser } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/user-api/my-orders')
      setOrders(res.data.payload)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const finalPrice = (o) =>
    parseFloat((o.price - (o.price * o.discount) / 100).toFixed(2))

  const STATUS_COLORS = {
    'order placed':     'bg-blue-50 text-blue-600',
    'shipped':          'bg-yellow-50 text-yellow-700',
    'out for delivery': 'bg-orange-50 text-orange-600',
    'delivered':        'bg-green-50 text-green-600',
    'cancelled':        'bg-red-50 text-red-500',
  }

  const totalSpent = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + finalPrice(o) * o.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Dashboard</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
            {currentUser?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{currentUser?.username}</p>
            <p className="text-sm text-slate-400">{currentUser?.email}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
              currentUser?.usertype === 'admin'
                ? 'bg-purple-100 text-purple-600'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {currentUser?.usertype}
            </span>
          </div>
        </div>
        <Link
          to="/profile"
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: orders.length, icon: '📦' },
          { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, icon: '✅' },
          { label: 'Total Spent', value: `₹${totalSpent.toFixed(2)}`, icon: '💰' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-800">Recent Orders</h2>
        <Link to="/my-orders" className="text-sm text-orange-500 hover:underline">View all →</Link>
      </div>

      {loading ? (
        <p className="text-center py-10 text-slate-400">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-3xl mb-3">🛍️</p>
          <p className="text-slate-500 mb-4">No orders yet</p>
          <Link
            to="/products"
            className="inline-block px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map(o => (
            <div key={o._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <img
                src={o.mainImg}
                alt={o.title}
                className="w-14 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/56x56?text=img' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">{o.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {o.size && `Size: ${o.size} · `}Qty: {o.quantity}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(o.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-orange-500 text-sm">₹{(finalPrice(o) * o.quantity).toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${STATUS_COLORS[o.orderStatus] || 'bg-slate-100 text-slate-500'}`}>
                  {o.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link
          to="/products"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 transition-colors group"
        >
          <span className="text-2xl">🛒</span>
          <div>
            <p className="font-medium text-slate-800 text-sm group-hover:text-orange-500 transition-colors">Browse Products</p>
            <p className="text-xs text-slate-400">Discover new arrivals</p>
          </div>
        </Link>
        <Link
          to="/cart"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 transition-colors group"
        >
          <span className="text-2xl">🛍️</span>
          <div>
            <p className="font-medium text-slate-800 text-sm group-hover:text-orange-500 transition-colors">My Cart</p>
            <p className="text-xs text-slate-400">View items in cart</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
