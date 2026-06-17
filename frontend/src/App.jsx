
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'react-hot-toast'
import RootLayout   from './components/RootLayout'
import Home         from './components/Home'
import Login        from './components/Login'
import Register     from './components/Register'
import Dashboard    from './components/Dashboard'
import StockDetails from './components/StockDetails'
import Portfolio    from './components/Portfolio'
import AdminPanel   from './components/AdminPanel'
import './App.css'
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path:"",           element: <Home /> },
      { path: 'login',         element: <Login /> },
      { path: 'register',      element: <Register /> },
      { path: 'dashboard',     element: <Dashboard /> },
      { path: 'stock/:symbol', element: <StockDetails /> },
      { path: 'portfolio',     element: <Portfolio /> },
      { path: 'admin',         element: <AdminPanel /> },
    ]
  }
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  )
}

export default App