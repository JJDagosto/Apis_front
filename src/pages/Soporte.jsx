import "./Info.css"

function Soporte({ goToForgot }) {
  return (
    <main className="info-page">
      <h1>Soporte</h1>
      <p className="info-lead">
        Estamos para ayudarte. Revisa las preguntas frecuentes o escribinos.
      </p>

      <section className="info-card">
        <h2>Contacto</h2>
        <p>
          Escribinos a{" "}
          <a className="info-contact" href="mailto:soporte@skinsmarket.com">
            soporte@skinsmarket.com
          </a>{" "}
          y te respondemos a la brevedad. Incluí tu usuario y, si es por una compra,
          el numero de orden.
        </p>
      </section>

      <section className="info-card">
        <h2>Preguntas frecuentes</h2>
        <dl className="info-faq">
          <dt>Olvide mi contraseña, que hago?</dt>
          <dd>
            Podes recuperarla desde la pantalla de inicio de sesion
            {goToForgot ? (
              <>
                {" "}o{" "}
                <a
                  className="info-contact"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    goToForgot()
                  }}
                >
                  desde aca
                </a>
              </>
            ) : null}
            . Te enviamos un link al email para crear una nueva.
          </dd>

          <dt>Por que mi skin recien publicada no se puede comprar todavia?</dt>
          <dd>
            Por el bloqueo de Steam: una skin puede tardar hasta 7 dias en habilitarse
            para entrega. Es una restriccion de Steam.
          </dd>

          <dt>Como cobro lo que vendo?</dt>
          <dd>
            El monto de tus ventas queda como saldo en tu cuenta, visible en la barra superior.
          </dd>

          <dt>Mi pago figura pendiente, que significa?</dt>
          <dd>
            Mercado Pago todavia esta confirmando la operacion. Cuando se acredite,
            la compra se completa automaticamente.
          </dd>
        </dl>
      </section>
    </main>
  )
}

export default Soporte
