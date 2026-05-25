import './App.css'
import { useEffect, useState } from 'react'

import NavBar from './components/NavBar'

import { getCurrentUser, logout } from './api/auth'
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
import { getCarrito } from './api/carrito'
import { getMisPublicaciones } from './api/skins'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedSkinId, setSelectedSkinId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [resetToken, setResetToken] = useState(null)
  const [verifyToken, setVerifyToken] = useState(null)
  const [checkoutCupon, setCheckoutCupon] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [myPublications, setMyPublications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const cartCount = cartItems.length

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
    setCurrentPage('catalogo')
  }

  const refreshCart = async () => {
    if (!currentUser) {
      setCartItems([])
      return
    }

    try {
      const carrito = await getCarrito()
      setCartItems(carrito?.items ?? [])
    } catch {
      setCartItems([])
    }
  }

  const refreshMyPublications = async () => {
    if (!currentUser) {
      setMyPublications([])
      return
    }

    try {
      const publicaciones = await getMisPublicaciones()
      setMyPublications(publicaciones ?? [])
    } catch {
      setMyPublications([])
    }
  }

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => logout())
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    const path = window.location.pathname
    const token = new URLSearchParams(window.location.search).get('token')

    if (path.includes('reset-password') && token) {
      setResetToken(token)
      setCurrentPage('resetPassword')
      window.history.replaceState({}, '', '/')
      return
    }

    if (path.includes('verify-email') && token) {
      setVerifyToken(token)
      setCurrentPage('verifyEmail')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  useEffect(() => {
    if (checkingSession) return

    if (currentUser) {
      refreshCart()
      refreshMyPublications()
    } else {
      setCartItems([])
      setMyPublications([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentPage, checkingSession])

  const handleSearch = (term) => {
    setSearchTerm(term || '')
    setCurrentPage('catalogo')
  }

  const openPublicacion = (skinId) => {
    setSelectedSkinId(skinId)
    setCurrentPage('publicacion')
  }

  const goToCheckout = (cupon) => {
    setCheckoutCupon(cupon || '')
    setCurrentPage('checkout')
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setCartItems([])
    setMyPublications([])
    setCurrentPage('home')
  }

return (
    <>
      <NavBar
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        cartCount={cartCount}
        onSearch={handleSearch}
      />

      {currentPage === 'home' && (
        <Home
          currentUser={currentUser}
          goToCatalogo={() => setCurrentPage('catalogo')}
          goToSell={() => setCurrentPage(currentUser ? 'inventarioVenta' : 'login')}
          goToInfo={() => setCurrentPage('comoFunciona')}
        />
      )}

      {currentPage === 'catalogo' && (
        <Catalogo
          openPublicacion={openPublicacion}
          currentUser={currentUser}
          goToLogin={() => setCurrentPage('login')}
          onCartChange={refreshCart}
          cartItems={cartItems}
          myPublications={myPublications}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm('')}
        />
      )}

      {currentPage === 'publicacion' && (
        <Publicacion
          skinId={selectedSkinId}
          currentUser={currentUser}
          goToLogin={() => setCurrentPage('login')}
          goToCarrito={() => setCurrentPage('carrito')}
          volverAlCatalogo={() => setCurrentPage('catalogo')}
          onCartChange={refreshCart}
          cartItems={cartItems}
          myPublications={myPublications}
          onMyPublicationsChange={refreshMyPublications}
        />
      )}

      {currentPage === 'carrito' && (
        <Carrito
          currentUser={currentUser}
          goToLogin={() => setCurrentPage('login')}
          goToCatalogo={() => setCurrentPage('catalogo')}
          goToCheckout={goToCheckout}
          onCartChange={refreshCart}
        />
      )}

      {currentPage === 'checkout' && (
        <Checkout
          currentUser={currentUser}
          goToLogin={() => setCurrentPage('login')}
          goToCatalogo={() => setCurrentPage('catalogo')}
          cupon={checkoutCupon}
        />
      )}

      {currentPage === 'login' && (
        <Login
          onLoginSuccess={loadCurrentUser}
          goToRegister={() => setCurrentPage('register')}
          goToForgot={() => setCurrentPage('olvidarContrasena')}
        />
      )}

      {currentPage === 'register' && (
        <Register goToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'olvidarContrasena' && (
        <ForgotPassword goToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'resetPassword' && (
        <ResetPassword token={resetToken} goToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'verifyEmail' && (
        <VerifyEmail token={verifyToken} goToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'perfil' && (
        <Perfil
          currentUser={currentUser}
          onProfileUpdated={setCurrentUser}
          goToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'inventarioVenta' && (
        <InventarioVenta
          currentUser={currentUser}
          goToLogin={() => setCurrentPage('login')}
          openPublicacion={openPublicacion}
          myPublications={myPublications}
          onMyPublicationsChange={refreshMyPublications}
        />
      )}

      {currentPage === 'misPublicaciones' && (
        <MisPublicaciones
          currentUser={currentUser}
          goToLogin={() => setCurrentPage('login')}
          onPublicationsChange={refreshMyPublications}
        />
      )}

      {currentPage === 'adminDevTools' && (
        <AdminDevTools
          currentUser={currentUser}
          goToCatalogo={() => setCurrentPage('catalogo')}
        />
      )}

      {currentPage === 'comoFunciona' && <ComoFunciona />}

      {currentPage === 'soporte' && (
        <Soporte goToForgot={() => setCurrentPage('olvidarContrasena')} />
      )}

      {currentPage === 'prueba' && <Prueba />}
    </>
  )
}

export default App
