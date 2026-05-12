import './App.css'
import { useState } from 'react'

import NavBar from './components/NavBar'

import Home from './pages/Home'
import Catalogo from './pages/Catalogo'

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
    </>
  )
}

export default App