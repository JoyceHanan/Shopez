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
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-sky-400">📈</span>
          <span className="text-white">Shopez<span className="text-sky-400">Trade</span></span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="hover:text-sky-400 transition-colors">Market</Link>
              <Link to="/portfolio" className="hover:text-sky-400 transition-colors">Portfolio</Link>
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className="hover:text-sky-400 transition-colors">Admin</Link>
              )}
            </>
          )}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-semibold">
                  {currentUser?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-slate-300">{currentUser?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-sm px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium transition-colors">
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