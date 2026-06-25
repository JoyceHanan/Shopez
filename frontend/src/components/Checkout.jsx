import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

const EMPTY_FORM = { name: '', email: '', mobile: '', address: '', pincode: '', paymentMethod: 'COD' }

function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, currentUser } = useAuthStore()
  const { clearCart } = useCartStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [placing, setPlacing] = useState(false)

  const state = location.state // { mode: 'single'|'cart', productId?, size?, quantity?, product? }

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!state?.mode) { navigate('/cart'); return }
    // Pre-fill from user profile
    if (currentUser) {
      setForm(f => ({
        ...f,
        name: currentUser.username || '',
        email: currentUser.email || '',
      }))
    }
  }, [isAuthenticated, state])

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPlacing(true)
    try {
      if (state.mode === 'single') {
        await axios.post('/order-api/place', {
          ...form,
          productId: state.productId,
          size: state.size,
          quantity: state.quantity,
        })
      } else {
        await axios.post('/order-api/checkout', form)
        await clearCart()
      }
      toast.success('Order placed successfully! 🎉')
      navigate('/my-orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const product = state?.product

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                { name: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '9876543210' },
                { name: 'pincode', label: 'Pincode', type: 'text', placeholder: '500001' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    required
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="House no., Street, City, State"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Payment Method</h2>
            <div className="flex gap-4">
              {['COD', 'Online'].map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m}
                    checked={form.paymentMethod === m}
                    onChange={handleChange}
                    className="accent-orange-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {m === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                  </span>
                </label>
              ))}
            </div>
            {form.paymentMethod === 'Online' && (
              <p className="text-xs text-slate-400 mt-3">
                * Online payment is simulated in this demo. No real transaction will occur.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={placing}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold transition-colors"
          >
            {placing ? 'Placing Order…' : '✅ Place Order'}
          </button>
        </form>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-slate-800 mb-4">
            {state?.mode === 'single' ? 'Product' : 'Cart Checkout'}
          </h2>
          {state?.mode === 'single' && product ? (
            <div className="flex gap-3">
              <img
                src={product.mainImg}
                alt={product.title}
                className="w-16 h-16 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/64x64?text=img' }}
              />
              <div>
                <p className="text-sm font-medium text-slate-800">{product.title}</p>
                {state.size && <p className="text-xs text-slate-400">Size: {state.size}</p>}
                <p className="text-xs text-slate-400">Qty: {state.quantity}</p>
                <p className="text-orange-500 font-bold text-sm mt-1">
                  ₹{parseFloat((product.price - (product.price * product.discount) / 100) * state.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">All items from your cart</p>
          )}
          <div className="border-t border-slate-100 mt-4 pt-4 text-xs text-slate-400 space-y-1">
            <p>🚚 Delivery in 5 business days</p>
            <p>🔄 Easy returns within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
