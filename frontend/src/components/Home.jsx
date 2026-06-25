import { Link } from 'react-router'
import { useAuthStore } from '../store/authStore'

const FEATURES = [
  { icon: '👗', title: 'Trendy Fashion', desc: 'Explore the latest styles for Men, Women, and Kids across all categories.' },
  { icon: '💸', title: 'Best Prices', desc: 'Enjoy huge discounts and deals on top clothing brands every day.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Get your orders delivered in 5 days with real-time tracking.' },
  { icon: '🔒', title: 'Secure Shopping', desc: 'Shop with confidence — your payments and data are always protected.' },
]

const CATEGORIES = [
  { label: 'Shirts', icon: '👔', gender: 'Men' },
  { label: 'Dresses', icon: '👗', gender: 'Women' },
  { label: 'Jeans', icon: '👖', gender: 'Men' },
  { label: 'Footwear', icon: '👟', gender: 'Unisex' },
  { label: 'Hoodies', icon: '🧥', gender: 'Unisex' },
  { label: 'Bags', icon: '👜', gender: 'Women' },
]

function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            New Collection Available
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Style That Speaks,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Prices That Please
            </span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
            Discover the latest fashion trends for every occasion. From casual wear to
            formal attire — find your perfect style at Shopez.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-lg transition-all shadow-lg shadow-orange-200"
            >
              Shop Now →
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-8 py-3 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-lg transition-all"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {CATEGORIES.map(c => (
              <Link
                key={c.label}
                to={`/products?category=${c.label}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <span className="text-sm font-medium text-slate-700">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Why Choose Shopez?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-orange-200 transition-colors group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-orange-500 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-200">
            <h2 className="text-2xl font-bold mb-3">Ready to Shop?</h2>
            <p className="text-orange-100 mb-6">Create your free account and start exploring thousands of products.</p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
