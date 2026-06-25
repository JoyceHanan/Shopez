import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function Cart() {
  const { isAuthenticated } = useAuthStore()
  const { items, subtotal, loading, fetchCart, updateQuantity, removeFromCart } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [isAuthenticated])

  const finalPrice = (item) =>
    parseFloat((item.price - (item.price * item.discount) / 100).toFixed(2))

  const handleQuantity = async (itemId, qty) => {
    if (qty < 1) return
    await updateQuantity(itemId, qty)
    await fetchCart()
  }

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId)
    toast.success('Item removed')
    await fetchCart()
  }

  const handleCheckout = () => {
    navigate('/checkout', { state: { mode: 'cart' } })
  }

  if (loading) return <div className="text-center py-24 text-slate-400">Loading cart…</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-slate-500 mb-6">Your cart is empty</p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-400 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item._id} className="flex gap-4 bg-white rounded-xl border border-slate-200 p-4">
                <img
                  src={item.mainImg}
                  alt={item.title}
                  className="w-24 h-24 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/96x96?text=img' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                  {item.size && <p className="text-xs text-slate-400 mt-0.5">Size: {item.size}</p>}
                  <p className="text-orange-500 font-bold mt-1">₹{finalPrice(item)}</p>
                  {item.discount > 0 && (
                    <p className="text-xs text-slate-400 line-through">₹{item.price}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1">
                      <button
                        onClick={() => handleQuantity(item._id, item.quantity - 1)}
                        className="text-slate-500 hover:text-orange-500 font-bold w-5 text-center"
                      >−</button>
                      <span className="text-sm font-semibold text-slate-700 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item._id, item.quantity + 1)}
                        className="text-slate-500 hover:text-orange-500 font-bold w-5 text-center"
                      >+</button>
                    </div>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-800">
                    ₹{(finalPrice(item) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit sticky top-20">
            <h2 className="font-bold text-slate-800 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between font-bold text-slate-800 text-base">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full mt-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart