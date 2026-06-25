import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'react-hot-toast'
import RootLayout  from './components/RootLayout'
import Home        from './components/Home'
import Login       from './components/Login'
import Register    from './components/Register'
import Products    from './components/Products'
import ProductDetail from './components/ProductDetail'
import Cart        from './components/Cart'
import Checkout    from './components/Checkout'
import MyOrders    from './components/MyOrders'
import AdminPanel  from './components/AdminPanel'
import './App.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '',              element: <Home /> },
      { path: 'login',         element: <Login /> },
      { path: 'register',      element: <Register /> },
      { path: 'products',      element: <Products /> },
      { path: 'products/:id',  element: <ProductDetail /> },
      { path: 'cart',          element: <Cart /> },
      { path: 'checkout',      element: <Checkout /> },
      { path: 'my-orders',     element: <MyOrders /> },
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
