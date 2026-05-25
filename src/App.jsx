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
import { getCarrito } from "./api/carrito"


function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedSkinId, setSelectedSkinId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [resetToken, setResetToken] = useState(null)    // token del link del mail
  const [verifyToken, setVerifyToken] = useState(null)  // token del link de verificacion
  const [checkoutCupon, setCheckoutCupon] = useState("") // cupon que viaja del carrito al checkout
  const [cartCount, setCartCount] = useState(0)          // cantidad total de items para el badge
  const [searchTerm, setSearchTerm] = useState("")        // termino de busqueda de la lupita

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
    setCurrentPage("catalogo")
  }

  // Recalcula el contador del carrito (suma de cantidades).
  // Cierra sobre currentUser del render actual; los hijos reciben la version mas reciente como prop.
  const refreshCart = async () => {
    if (!currentUser) {
      setCartCount(0)
      return
    }
    try {
      const carrito = await getCarrito()
      const total = (carrito?.items ?? []).reduce(
        (sum, item) => sum + (item.cantidad ?? 0),
        0
      )
      setCartCount(total)
    } catch {
      setCartCount(0)
    }
  }

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => logout())
      .finally(() => setCheckingSession(false))
  }, [])

  // Deteccion de links de mail: reset y verificacion.
  useEffect(() => {
    const path = window.location.pathname
    const token = new URLSearchParams(window.location.search).get("token")

    if (path.includes("reset-password") && token) {
      setResetToken(token)
      setCurrentPage("resetPassword")
      window.history.replaceState({}, "", "/")
      return
    }

    if (path.includes("verify-email") && token) {
      setVerifyToken(token)
      setCurrentPage("verifyEmail")
      window.history.replaceState({}, "", "/")
    }
  }, [])

  // Refresca el carrito al loguearse y al cambiar de pagina (cubre el caso post-pago,
  // donde el carrito queda vacio al crearse la orden).
  useEffect(() => {
    if (currentUser) refreshCart()
    else setCartCount(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentPage])

  // La lupita del navbar setea el termino y manda al catalogo.
  const handleSearch = (term) => {
    setSearchTerm(term || "")
    setCurrentPage("catalogo")
  }

  const openPublicacion = (skinId) => {
    setSelectedSkinId(skinId)
    setCurrentPage("publicacion")
  }

  const goToCheckout = (cupon) => {
    setCheckoutCupon(cupon || "")
    setCurrentPage("checkout")
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setCartCount(0)
    setCurrentPage("home")
  }

  if (checkingSession) {
    return <p className="catalog-message">Cargando sesion...</p>
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



      {currentPage === "home" && <Home />}

      {currentPage === "catalogo" && (
        <Catalogo
          openPublicacion={openPublicacion}
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
          onCartChange={refreshCart}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm("")}
        />
      )}

      {currentPage === "publicacion" && (
        <Publicacion
          skinId={selectedSkinId}
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
          goToCarrito={() => setCurrentPage("carrito")}
          volverAlCatalogo={() => setCurrentPage("catalogo")}
          onCartChange={refreshCart}
        />
      )}

      {currentPage === "carrito" && (
        <Carrito
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
          goToCatalogo={() => setCurrentPage("catalogo")}
          goToCheckout={goToCheckout}
          onCartChange={refreshCart}
        />
      )}

      {currentPage === "checkout" && (
        <Checkout
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
          goToCatalogo={() => setCurrentPage("catalogo")}
          cupon={checkoutCupon}
        />
      )}

      {currentPage === "login" && (
        <Login
          onLoginSuccess={loadCurrentUser}
          goToRegister={() => setCurrentPage("register")}
          goToForgot={() => setCurrentPage("olvidarContrasena")}
        />
      )}

      {currentPage === "register" && (
        <Register
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "olvidarContrasena" && (
        <ForgotPassword goToLogin={() => setCurrentPage("login")} />
      )}

      {currentPage === "resetPassword" && (
        <ResetPassword
          token={resetToken}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "verifyEmail" && (
        <VerifyEmail
          token={verifyToken}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "perfil" && (
        <Perfil
          currentUser={currentUser}
          onProfileUpdated={setCurrentUser}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "inventarioVenta" && (
        <InventarioVenta
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "misPublicaciones" && (
        <MisPublicaciones
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "adminDevTools" && (
        <AdminDevTools
          currentUser={currentUser}
          goToCatalogo={() => setCurrentPage("catalogo")}
        />
      )}

      {currentPage === "comoFunciona" && <ComoFunciona />}

      {currentPage === "soporte" && (
        <Soporte goToForgot={() => setCurrentPage("olvidarContrasena")} />
      )}

      {currentPage === "prueba" && <Prueba />}
    </>
  )
}

export default App
