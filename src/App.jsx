import './App.css'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import NavBar from './components/NavBar'

import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Prueba from './pages/Prueba'
import Publicacion from './pages/Publicacion'
import Login from './pages/Login'
import Register from './pages/Register'
import Perfil from './pages/Perfil'
import InventarioVenta from './pages/InventarioVenta'
import Carrito from './pages/Carrito'
import MisPublicaciones from './pages/MisPublicaciones'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import Checkout from './pages/Checkout'
import ComoFunciona from './pages/ComoFunciona'
import Soporte from './pages/Soporte'
import AdminDevTools from './pages/AdminDevTools'
import {
  clearSearch,
  goToCheckout,
  openPublicacion,
  openResetPassword,
  openVerifyEmail,
  resetAppSession,
  searchCatalogo,
  setCurrentPage,
} from './Redux/appSlice'
import { logout } from './Redux/authSlice'
import { fetchCarrito } from './Redux/carritoSlice'
import { fetchCatalogo } from './Redux/catalogoSlice'
import { fetchMisPublicaciones } from './Redux/publicacionesSlice'

function App() {
  const dispatch = useDispatch()
  const {
    currentPage,
    selectedSkinId,
    resetToken,
    verifyToken,
    checkoutCupon,
    searchTerm,
  } = useSelector((state) => state.app)
  const currentUser = useSelector((state) => state.auth.currentUser)
  const carrito = useSelector((state) => state.carrito.data)
  const cartItems = carrito?.items ?? []

  const navigate = (page) => dispatch(setCurrentPage(page))

  useEffect(() => {
    dispatch(fetchCatalogo())
  }, [dispatch])

  useEffect(() => {
    const path = window.location.pathname
    const token = new URLSearchParams(window.location.search).get('token')

    if (path.includes('reset-password') && token) {
      dispatch(openResetPassword(token))
      window.history.replaceState({}, '', '/')
      return
    }

    if (path.includes('verify-email') && token) {
      dispatch(openVerifyEmail(token))
      window.history.replaceState({}, '', '/')
    }
  }, [dispatch])

  useEffect(() => {
    if (!currentUser) return

    dispatch(fetchCarrito())
    dispatch(fetchMisPublicaciones())
  }, [currentUser, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(resetAppSession())
  }

  return (
    <>
      <NavBar
        setCurrentPage={navigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        cartCount={cartItems.length}
        onSearch={(term) => dispatch(searchCatalogo(term))}
      />

      {currentPage === 'home' && (
        <Home
          currentUser={currentUser}
          goToCatalogo={() => navigate('catalogo')}
          goToSell={() => navigate(currentUser ? 'inventarioVenta' : 'login')}
          goToInfo={() => navigate('comoFunciona')}
        />
      )}

      {currentPage === 'catalogo' && (
        <Catalogo
          openPublicacion={(skinId) => dispatch(openPublicacion(skinId))}
          goToLogin={() => navigate('login')}
          goToPerfil={() => navigate('perfil')}
          searchTerm={searchTerm}
          onClearSearch={() => dispatch(clearSearch())}
        />
      )}

      {currentPage === 'publicacion' && (
        <Publicacion
          skinId={selectedSkinId}
          goToLogin={() => navigate('login')}
          goToPerfil={() => navigate('perfil')}
          goToCarrito={() => navigate('carrito')}
          volverAlCatalogo={() => navigate('catalogo')}
        />
      )}

      {currentPage === 'carrito' && (
        <Carrito
          goToLogin={() => navigate('login')}
          goToCatalogo={() => navigate('catalogo')}
          goToPerfil={() => navigate('perfil')}
          goToCheckout={(cupon) => dispatch(goToCheckout(cupon))}
        />
      )}

      {currentPage === 'checkout' && (
        <Checkout
          goToLogin={() => navigate('login')}
          goToCatalogo={() => navigate('catalogo')}
          goToPerfil={() => navigate('perfil')}
          goToMisPublicaciones={() => navigate('misPublicaciones')}
          cupon={checkoutCupon}
        />
      )}

      {currentPage === 'login' && (
        <Login
          goToCatalogo={() => navigate('catalogo')}
          goToRegister={() => navigate('register')}
          goToForgot={() => navigate('olvidarContrasena')}
        />
      )}

      {currentPage === 'register' && (
        <Register goToLogin={() => navigate('login')} />
      )}

      {currentPage === 'olvidarContrasena' && (
        <ForgotPassword goToLogin={() => navigate('login')} />
      )}

      {currentPage === 'resetPassword' && (
        <ResetPassword token={resetToken} goToLogin={() => navigate('login')} />
      )}

      {currentPage === 'verifyEmail' && (
        <VerifyEmail token={verifyToken} goToLogin={() => navigate('login')} />
      )}

      {currentPage === 'perfil' && (
        <Perfil goToLogin={() => navigate('login')} />
      )}

      {currentPage === 'inventarioVenta' && (
        <InventarioVenta
          goToLogin={() => navigate('login')}
          goToPerfil={() => navigate('perfil')}
          openPublicacion={(skinId) => dispatch(openPublicacion(skinId))}
        />
      )}

      {currentPage === 'misPublicaciones' && (
        <MisPublicaciones goToLogin={() => navigate('login')} />
      )}

      {currentPage === 'adminDevTools' && (
        <AdminDevTools
          goToCatalogo={() => navigate('catalogo')}
        />
      )}

      {currentPage === 'comoFunciona' && <ComoFunciona />}

      {currentPage === 'soporte' && (
        <Soporte goToForgot={() => navigate('olvidarContrasena')} />
      )}

      {currentPage === 'prueba' && <Prueba />}
    </>
  )
}

export default App
