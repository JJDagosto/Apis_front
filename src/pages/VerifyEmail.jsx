import { useEffect, useState } from "react"
import { verifyEmail } from "../api/auth"
import "./Login.css"

function VerifyEmail({ token, goToLogin }) {
  const [status, setStatus] = useState("checking")
  const [message, setMessage] = useState("Verificando email...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("El link no tiene un token valido. Pedi otro mail de verificacion.")
      return
    }

    let cancelled = false

    const verify = async () => {
      try {
        const msg = await verifyEmail(token)
        if (cancelled) return
        setStatus("ok")
        setMessage(msg || "Email verificado. Ya podes iniciar sesion.")
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
  }, [token])

  return (
    <main className="login-page">
      <section className="login-form">
        <h1>Verificar email</h1>
        <p className={status === "error" ? "login-error" : ""}>{message}</p>
        <button type="button" onClick={goToLogin}>
          Ir a iniciar sesion
        </button>
      </section>
    </main>
  )
}

export default VerifyEmail
