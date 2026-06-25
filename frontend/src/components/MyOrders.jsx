import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const STATUS_COLORS = {
  'order placed':    'bg-blue-50 text-blue-600 border-blue-200',
  'shipped':         'bg-yellow-50 text-yellow-700 border-yellow-200',
  'out for delivery':'bg-orange-50 text-orange-600 border-orange-200',
  'delivered':       'bg-green-50 text-green-600 border-green-200',
  'cancelled':       'bg-red-50 text-red-500 border-red-200',
}

const STATUS_ICON = {
  'order placed': '📦',
  'shipped': '🚛',
  'out for delivery': '🏃',
  'delivered': '✅',
  'cancelled': '❌',
}

function MyOrders() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/order-api/my-orders')
      setOrders(res.data.payload)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await axios.put(`/order-api/${orderId}/cancel`)
      toast.success('Order cancelled')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order')
    }
  }

  const finalPrice = (o) =>
    parseFloat((o.price - (o.price * o.discount) / 100).toFixed(2))

  if (loading) return <div className="text-center py-24 text-slate-400">Loading orders…</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-slate-500 mb-6">You haven&apos;t placed any orders yet</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-400 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start gap-4">
                <img
                  src={order.mainImg}
                  alt={order.title}
                  className="w-20 h-20 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=img' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 truncate">{order.title}</p>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[order.orderStatus] || 'bg-slate-50 text-slate-500 border-slate-200'}`}
                    >
                      {STATUS_ICON[order.orderStatus]} {order.orderStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                    {order.size && <p>Size: {order.size}</p>}
                    <p>Qty: {order.quantity}</p>
                    <p>
                      <span className="font-semibold text-orange-500">
                        ₹{(finalPrice(order) * order.quantity).toFixed(2)}
                      </span>
                      {order.discount > 0 && (
                        <span className="ml-1 text-slate-400 line-through">₹{order.price * order.quantity}</span>
                      )}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span>📅 Ordered: {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {order.deliveryDate && <span>🚚 Expected: {order.deliveryDate}</span>}
                    <span>💳 {order.paymentMethod}</span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    📍 {order.address}, {order.pincode}
                  </div>
                </div>
              </div>

              {!['delivered', 'cancelled'].includes(order.orderStatus) && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
