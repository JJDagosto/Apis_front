import './App.css'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'

import NavBar from './components/NavBar'
import NotificationCenter from './components/NotificationCenter'

import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Intercambiar from './pages/Intercambiar'
import Prueba from './pages/Prueba'
import Publicacion from './pages/Publicacion'
import Vendedor from './pages/Vendedor'
import Login from './pages/Login'
import Register from './pages/Register'
import Perfil from './pages/Perfil'
import InventarioVenta from './pages/InventarioVenta'
import Carrito from './pages/Carrito'
import MisPublicaciones from './pages/MisPublicaciones'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import SteamCallback from './pages/SteamCallback'
import Checkout from './pages/Checkout'
import ComoFunciona from './pages/ComoFunciona'
import Soporte from './pages/Soporte'
import AdminDevTools from './pages/AdminDevTools'
import { resetAppSession } from './Redux/appSlice'
import { logout } from './Redux/authSlice'
import { fetchCarrito } from './Redux/carritoSlice'
import { fetchCatalogo, setCatalogSearchTerm } from './Redux/catalogoSlice'
import { fetchMisPublicaciones } from './Redux/publicacionesSlice'

function ResetPasswordRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <ResetPassword
      token={searchParams.get('token')}
      goToLogin={() => navigate('/login')}
    />
  )
}

function VerifyEmailRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <VerifyEmail
      token={searchParams.get('token')}
      goToLogin={() => navigate('/login')}
    />
  )
}

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { checkoutCupon } = useSelector((state) => state.app)
  const currentUser = useSelector((state) => state.auth.currentUser)
  const carrito = useSelector((state) => state.carrito.data)
  const cartItems = carrito?.items ?? []

  useEffect(() => {
    dispatch(fetchCatalogo())
  }, [dispatch])

  useEffect(() => {
    if (!currentUser) return

    dispatch(fetchCarrito())
    dispatch(fetchMisPublicaciones())
  }, [currentUser, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(resetAppSession())
    navigate('/')
  }

  const handleSearch = (term) => {
    dispatch(setCatalogSearchTerm(term))
    navigate('/catalogo')
  }

  return (
    <>
      <NotificationCenter />
      <NavBar
        currentUser={currentUser}
        onLogout={handleLogout}
        cartCount={cartItems.length}
        onSearch={handleSearch}
      />

      <Routes>
        <Route
          path="/"
          element={(
            <Home
              currentUser={currentUser}
              goToCatalogo={() => navigate('/catalogo')}
              goToSell={() => navigate(currentUser ? '/vender' : '/login')}
              goToInfo={() => navigate('/como-funciona')}
            />
          )}
        />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/intercambiar" element={<Intercambiar />} />
        <Route path="/publicacion/:skinId" element={<Publicacion />} />
        <Route path="/vendedor/:sellerName" element={<Vendedor />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout cupon={checkoutCupon} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/steam/callback" element={<SteamCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/olvidar-contrasena" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordRoute />} />
        <Route path="/verify-email" element={<VerifyEmailRoute />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/vender" element={<InventarioVenta />} />
        <Route path="/mis-publicaciones" element={<MisPublicaciones />} />
        <Route path="/admin" element={<AdminDevTools />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/soporte" element={<Soporte />} />
        <Route path="/prueba" element={<Prueba />} />

        <Route path="/olvidarContrasena" element={<Navigate to="/olvidar-contrasena" replace />} />
        <Route path="/inventarioVenta" element={<Navigate to="/vender" replace />} />
        <Route path="/misPublicaciones" element={<Navigate to="/mis-publicaciones" replace />} />
        <Route path="/comoFunciona" element={<Navigate to="/como-funciona" replace />} />
        <Route path="/adminDevTools" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
