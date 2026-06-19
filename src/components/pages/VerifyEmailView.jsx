import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { verifyUserEmail } from "../../Redux/authSlice"
import "../../pages/Login.css"

function VerifyEmail({ token, goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const [status, setStatus] = useState("checking")
  const [message, setMessage] = useState("Verificando email...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("El link no tiene un token válido. Pedí otro mail de verificación.")
      return
    }

    let cancelled = false

    const verify = async () => {
      try {
        const msg = await dispatch(verifyUserEmail(token)).unwrap()
        if (cancelled) return
        setStatus("ok")
        setMessage(msg || "Email verificado. Ya podés iniciar sesión.")
      } catch (error) {
        if (cancelled) return
        setStatus("error")
        setMessage(error.message)
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [dispatch, token])

  return (
    <main className="login-page">
      <section className="login-form">
        <h1>Verificar email</h1>
        <p className={status === "error" ? "login-error" : ""}>{message}</p>
        <button type="button" onClick={openLogin}>
          Ir a iniciar sesión
        </button>
      </section>
    </main>
  )
}

export default VerifyEmail
