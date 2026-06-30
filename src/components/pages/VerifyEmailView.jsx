import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { verifyUserEmail } from "../../Redux/authSlice"
import "../../pages/Login.css"

function VerifyEmail({ token, goToLogin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const openLogin = goToLogin ?? (() => navigate("/login"))
  const { error, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!token) {
      return
    }

    dispatch(verifyUserEmail(token))
  }, [dispatch, token])

  return (
    <main className="login-page">
      <section className="login-form">
        <h1>Verificar email</h1>
        <p className={error || !token ? "login-error" : ""}>
          {!token ? "El link no tiene un token valido. Pedi otro mail de verificacion." : (error || message)}
        </p>
        <button type="button" onClick={openLogin}>
          Ir a iniciar sesión
        </button>
      </section>
    </main>
  )
}

export default VerifyEmail
