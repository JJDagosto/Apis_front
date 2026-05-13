import './App.css'
import { useEffect, useState } from 'react'

import NavBar from './components/NavBar'

import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Prueba from './pages/Prueba'

function App() {

  const [currentPage, setCurrentPage] = useState("home");


  



  return (
    <>
      <NavBar setCurrentPage={setCurrentPage} />

      {
        currentPage === "home" &&
        <Home />
      }

      {
        currentPage === "catalogo" &&
        <Catalogo />
      }
      {
        currentPage === "prueba" &&
        <Prueba />
      }
    </>
  )
}

export default App