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
import { getCarrito } from "./api/carrito"


function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedSkinId, setSelectedSkinId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
    setCurrentPage("catalogo")
  }

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => logout())
      .finally(() => setCheckingSession(false))
  }, [])

  const openPublicacion = (skinId) => {
    setSelectedSkinId(skinId)
    setCurrentPage("publicacion")
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
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
      />



      {currentPage === "home" && <Home />}

      {currentPage === "catalogo" && (
        <Catalogo
          openPublicacion={openPublicacion}
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "publicacion" && (
        <Publicacion
          skinId={selectedSkinId}
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
          goToCarrito={() => setCurrentPage("carrito")}
          volverAlCatalogo={() => setCurrentPage("catalogo")}
        />
      )}

      {currentPage === "carrito" && (
        <Carrito
          currentUser={currentUser}
          goToLogin={() => setCurrentPage("login")}
          goToCatalogo={() => setCurrentPage("catalogo")}
        />
      )}

      {currentPage === "login" && (
        <Login
          onLoginSuccess={loadCurrentUser}
          goToRegister={() => setCurrentPage("register")}
        />
      )}

      {currentPage === "register" && (
        <Register
          onRegisterSuccess={loadCurrentUser}
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

      {currentPage === "prueba" && <Prueba />}
    </>
  )
}

export default App