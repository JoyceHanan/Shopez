import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addToCart } = useCartStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/product-api/${id}`)
        setProduct(res.data.payload)
        if (res.data.payload.sizes?.length > 0)
          setSelectedSize(res.data.payload.sizes[0])
      } catch {
        toast.error('Product not found')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const finalPrice = product
    ? parseFloat((product.price - (product.price * product.discount) / 100).toFixed(2))
    : 0

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart')
      navigate('/login')
      return
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    setAdding(true)
    const result = await addToCart({ productId: product._id, size: selectedSize, quantity })
    if (result.success) {
      toast.success('Added to cart!')
    } else {
      toast.error(result.message)
    }
    setAdding(false)
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    navigate('/checkout', {
      state: {
        mode: 'single',
        productId: product._id,
        size: selectedSize,
        quantity,
        product,
      }
    })
  }

  if (loading) return <div className="text-center py-24 text-slate-400">Loading…</div>
  if (!product) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-orange-500 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
          <img
            src={product.mainImg}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=No+Image' }}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-orange-500 uppercase tracking-wider">
              {product.category} · {product.gender}
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">{product.title}</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{product.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-orange-500">₹{finalPrice}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">₹{product.price}</span>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedSize === s
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-slate-300 text-slate-700 hover:border-orange-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 hover:border-orange-400 font-bold"
              >
                −
              </button>
              <span className="text-base font-semibold text-slate-800 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 hover:border-orange-400 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 py-3 rounded-xl border-2 border-orange-500 text-orange-500 font-semibold hover:bg-orange-50 transition-colors disabled:opacity-60"
            >
              {adding ? 'Adding…' : '🛒 Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Delivery note */}
          <p className="text-xs text-slate-400 text-center mt-1">🚚 Estimated delivery in 5 business days</p>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
