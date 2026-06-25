import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function Header() {
  const { isAuthenticated, currentUser, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-orange-500">🛍️</span>
          <span className="text-slate-800">Shop<span className="text-orange-500">ez</span></span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <Link to="/products" className="hover:text-orange-500 transition-colors font-medium">Products</Link>
          {isAuthenticated && (
            <>
              <Link to="/my-orders" className="hover:text-orange-500 transition-colors">My Orders</Link>
              {currentUser?.usertype === 'admin' && (
                <Link to="/admin" className="hover:text-orange-500 transition-colors font-semibold">Admin</Link>
              )}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/cart" className="relative text-slate-600 hover:text-orange-500 transition-colors text-xl" title="Cart">
                🛒
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                  {currentUser?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-slate-700">{currentUser?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:border-red-400 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
              <Link to="/register" className="text-sm px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-medium transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
