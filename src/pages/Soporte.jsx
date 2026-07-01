import { useNavigate } from "react-router-dom"
import "./Info.css"

function Soporte({ goToForgot }) {
  const navigate = useNavigate()
  const openForgotPassword = goToForgot ?? (() => navigate("/olvidar-contrasena"))

  return (
    <main className="info-page">
      <h1>Soporte</h1>
      <p className="info-lead">
        Estamos para ayudarte. Revisá las preguntas frecuentes o escribinos.
      </p>

      <section className="info-card">
        <h2>Contacto</h2>
        <p>
          Escribinos a{" "}
          <a className="info-contact" href="mailto:support.skinsmarket@gmail.com">
            support.skinsmarket@gmail.com
          </a>{" "}
          y te respondemos a la brevedad. Incluí tu usuario y, si es por una compra,
          el número de orden.
        </p>
      </section>

      <section className="info-card">
        <h2>Preguntas frecuentes</h2>
        <dl className="info-faq">
          <dt>Olvidé mi contraseña, ¿qué hago?</dt>
          <dd>
            Podés recuperarla desde la pantalla de inicio de sesión
            {" "}o{" "}
            <a
              className="info-contact"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                openForgotPassword()
              }}
            >
              desde acá
            </a>
            . Te enviamos un link al email para crear una nueva.
          </dd>

          <dt>¿Por qué mi skin recién publicada no se puede comprar todavía?</dt>
          <dd>
            Por el bloqueo de Steam: una skin puede tardar hasta 7 días en habilitarse
            para entrega. Es una restricción de Steam.
          </dd>

          <dt>¿Cómo cobro lo que vendo?</dt>
          <dd>
            El monto de tus ventas queda como saldo en tu cuenta, visible en la barra superior.
          </dd>

          <dt>Mi pago figura pendiente, ¿qué significa?</dt>
          <dd>
            Mercado Pago todavía está confirmando la operación. Cuando se acredite,
            la compra se completa automáticamente.
          </dd>
        </dl>
      </section>
    </main>
  )
}

export default Soporte
