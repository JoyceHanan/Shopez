import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

function RootLayout() {
  const checkAuth = useAuthStore(state => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default RootLayout