import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import axios from 'axios'

const GENDERS = ['All', 'Men', 'Women', 'Unisex', 'Kids']

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const category = searchParams.get('category') || ''
  const gender   = searchParams.get('gender') || ''
  const search   = searchParams.get('search') || ''
  const page     = parseInt(searchParams.get('page') || '1')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (category) params.category = category
      if (gender && gender !== 'All') params.gender = gender
      if (search) params.search = search
      const res = await axios.get('/product-api/', { params })
      setProducts(res.data.payload)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/product-api/meta/categories')
      setCategories(['All', ...res.data.payload])
    } catch {
      setCategories(['All'])
    }
  }

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchProducts() }, [category, gender, search, page])

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val && val !== 'All') next.set(key, val)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const finalPrice = (p) => parseFloat((p.price - (p.price * p.discount) / 100).toFixed(2))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Products</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Search */}
        <input
          type="text"
          defaultValue={search}
          placeholder="Search products…"
          onKeyDown={(e) => { if (e.key === 'Enter') setFilter('search', e.target.value) }}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {/* Category */}
        <select
          value={category || 'All'}
          onChange={e => setFilter('category', e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Gender */}
        <div className="flex gap-1">
          {GENDERS.map(g => (
            <button
              key={g}
              onClick={() => setFilter('gender', g)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                (gender || 'All') === g
                  ? 'bg-orange-500 text-white'
                  : 'border border-slate-300 text-slate-600 hover:border-orange-400'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500 ml-auto">{total} items</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-24 text-slate-400">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-slate-400">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(p => (
            <Link
              key={p._id}
              to={`/products/${p._id}`}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all group"
            >
              <div className="aspect-square overflow-hidden bg-slate-100">
                <img
                  src={p.mainImg}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image' }}
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.category} · {p.gender}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-base font-bold text-orange-500">₹{finalPrice(p)}</span>
                  {p.discount > 0 && (
                    <>
                      <span className="text-xs text-slate-400 line-through">₹{p.price}</span>
                      <span className="text-xs text-green-600 font-medium">{p.discount}% off</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => { const next = new URLSearchParams(searchParams); next.set('page', n); setSearchParams(next) }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                n === page ? 'bg-orange-500 text-white' : 'border border-slate-300 text-slate-600 hover:border-orange-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
