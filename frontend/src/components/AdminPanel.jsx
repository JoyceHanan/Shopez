import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const TABS = ['Dashboard', 'Products', 'Orders', 'Users', 'Settings']

const EMPTY_PRODUCT = {
  title: '', description: '', mainImg: '', category: '',
  gender: 'Unisex', price: '', discount: 0, sizes: ''
}

const STATUS_OPTIONS = ['order placed', 'shipped', 'out for delivery', 'delivered', 'cancelled']

function AdminPanel() {
  const { isAuthenticated, currentUser } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Dashboard')

  // Dashboard
  const [stats, setStats] = useState(null)
  // Products
  const [products, setProducts] = useState([])
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  // Orders
  const [orders, setOrders] = useState([])
  // Users
  const [users, setUsers] = useState([])
  // Settings
  const [banner, setBanner] = useState('')
  const [categories, setCategories] = useState('')

  useEffect(() => {
    if (!isAuthenticated || currentUser?.usertype !== 'admin') {
      navigate('/')
      return
    }
    loadTab(tab)
  }, [isAuthenticated, currentUser, tab])

  const loadTab = async (t) => {
    try {
      if (t === 'Dashboard') {
        const res = await axios.get('/admin-api/stats')
        setStats(res.data.payload)
      } else if (t === 'Products') {
        const res = await axios.get('/product-api/')
        setProducts(res.data.payload)
      } else if (t === 'Orders') {
        const res = await axios.get('/admin-api/orders')
        setOrders(res.data.payload)
      } else if (t === 'Users') {
        const res = await axios.get('/admin-api/users')
        setUsers(res.data.payload)
      } else if (t === 'Settings') {
        const [b, c] = await Promise.all([
          axios.get('/admin-api/banner'),
          axios.get('/admin-api/categories'),
        ])
        setBanner(b.data.payload || '')
        setCategories((c.data.payload || []).join(', '))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load data')
    }
  }

  // ── Products ────────────────────────────────────────────────────────────────
  const handleProductSave = async (e) => {
    e.preventDefault()
    const body = {
      ...productForm,
      price: parseFloat(productForm.price),
      discount: parseFloat(productForm.discount) || 0,
      sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    try {
      if (editingProduct) {
        await axios.put(`/product-api/${editingProduct}`, body)
        toast.success('Product updated')
      } else {
        await axios.post('/product-api/', body)
        toast.success('Product created')
      }
      setShowProductForm(false)
      setProductForm(EMPTY_PRODUCT)
      setEditingProduct(null)
      loadTab('Products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Remove this product?')) return
    try {
      await axios.delete(`/product-api/${id}`)
      toast.success('Product removed')
      loadTab('Products')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const startEdit = (p) => {
    setProductForm({
      title: p.title, description: p.description, mainImg: p.mainImg,
      category: p.category, gender: p.gender, price: p.price,
      discount: p.discount, sizes: (p.sizes || []).join(', ')
    })
    setEditingProduct(p._id)
    setShowProductForm(true)
  }

  const handleSeedProducts = async () => {
    try {
      await axios.post('/product-api/admin/seed')
      toast.success('Demo products seeded!')
      loadTab('Products')
    } catch {
      toast.error('Seed failed')
    }
  }

  // ── Orders ──────────────────────────────────────────────────────────────────
  const handleOrderStatus = async (id, orderStatus) => {
    try {
      await axios.put(`/admin-api/orders/${id}/status`, { orderStatus })
      toast.success('Status updated')
      loadTab('Orders')
    } catch {
      toast.error('Failed to update status')
    }
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  const handleToggleUser = async (id) => {
    try {
      const res = await axios.put(`/admin-api/users/${id}/toggle`)
      toast.success(res.data.message)
      loadTab('Users')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  // ── Settings ─────────────────────────────────────────────────────────────────
  const handleSaveBanner = async () => {
    try {
      await axios.put('/admin-api/banner', { banner })
      toast.success('Banner updated')
    } catch { toast.error('Failed') }
  }

  const handleSaveCategories = async () => {
    const arr = categories.split(',').map(c => c.trim()).filter(Boolean)
    try {
      await axios.put('/admin-api/categories', { categories: arr })
      toast.success('Categories updated')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t
                ? 'bg-orange-500 text-white'
                : 'text-slate-600 hover:text-orange-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {tab === 'Dashboard' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
              { label: 'Products', value: stats.totalProducts, icon: '👗' },
              { label: 'Orders', value: stats.totalOrders, icon: '📦' },
              { label: 'Revenue', value: `₹${stats.totalRevenue?.toLocaleString('en-IN')}`, icon: '💰' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-slate-800 mb-3">Recent Orders</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders?.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[150px]">{o.title}</td>
                    <td className="px-4 py-3 text-slate-500">{o.userId?.username || o.name}</td>
                    <td className="px-4 py-3 text-orange-500 font-semibold">
                      ₹{parseFloat((o.price - (o.price * o.discount) / 100) * o.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{o.orderStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Products ── */}
      {tab === 'Products' && (
        <div>
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm(EMPTY_PRODUCT) }}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors"
            >
              + Add Product
            </button>
            <button
              onClick={handleSeedProducts}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:border-orange-400 transition-colors"
            >
              Seed Demo Products
            </button>
          </div>

          {/* Product Form */}
          {showProductForm && (
            <div className="bg-white rounded-xl border border-orange-200 p-6 mb-6">
              <h2 className="font-semibold text-slate-800 mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <form onSubmit={handleProductSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'title', label: 'Title', type: 'text' },
                  { name: 'category', label: 'Category', type: 'text' },
                  { name: 'mainImg', label: 'Main Image URL', type: 'url' },
                  { name: 'price', label: 'Price (₹)', type: 'number' },
                  { name: 'discount', label: 'Discount (%)', type: 'number' },
                  { name: 'sizes', label: 'Sizes (comma-separated)', type: 'text' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={productForm[f.name]}
                      onChange={e => setProductForm(p => ({ ...p, [f.name]: e.target.value }))}
                      required={['title', 'mainImg', 'price', 'category'].includes(f.name)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select
                    value={productForm.gender}
                    onChange={e => setProductForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {['Men', 'Women', 'Unisex', 'Kids'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                    required
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400">
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowProductForm(false)} className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:border-slate-400">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <img
                  src={p.mainImg}
                  alt={p.title}
                  className="w-full h-36 object-cover bg-slate-100"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x144?text=img' }}
                />
                <div className="p-3">
                  <p className="font-medium text-slate-800 text-sm truncate">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.category} · {p.gender}</p>
                  <p className="text-orange-500 font-bold text-sm mt-1">₹{p.price} {p.discount > 0 && <span className="text-green-600 text-xs">−{p.discount}%</span>}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => startEdit(p)} className="flex-1 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-600 hover:border-orange-400">Edit</button>
                    <button onClick={() => handleDeleteProduct(p._id)} className="flex-1 py-1.5 text-xs rounded-lg border border-red-200 text-red-400 hover:bg-red-50">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Orders ── */}
      {tab === 'Orders' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700 max-w-[160px] truncate">{o.title}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <p>{o.userId?.username || o.name}</p>
                    <p className="text-xs text-slate-400">{o.userId?.email || o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-orange-500 font-semibold">
                    ₹{parseFloat((o.price - (o.price * o.discount) / 100) * o.quantity).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{o.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.orderStatus}
                      onChange={e => handleOrderStatus(o._id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-12 text-slate-400">No orders yet</p>}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'Users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{u.username}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.usertype === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                      {u.usertype}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.usertype !== 'admin' && (
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                          u.isActive
                            ? 'border-red-200 text-red-400 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
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

      {/* ── Settings ── */}
      {tab === 'Settings' && (
        <div className="max-w-xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-3">Banner Image URL</h2>
            <input
              type="url"
              value={banner}
              onChange={e => setBanner(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {banner && (
              <img src={banner} alt="Banner preview" className="mt-3 rounded-lg w-full h-32 object-cover" onError={() => {}} />
            )}
            <button
              onClick={handleSaveBanner}
              className="mt-3 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400"
            >
              Save Banner
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-3">Categories</h2>
            <p className="text-xs text-slate-400 mb-2">Comma-separated list of categories</p>
            <input
              type="text"
              value={categories}
              onChange={e => setCategories(e.target.value)}
              placeholder="Shirts, Jeans, Dresses, Footwear"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleSaveCategories}
              className="mt-3 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400"
            >
              Save Categories
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
