import "../../pages/Info.css"

function ComoFunciona() {
  return (
    <main className="info-page">
      <h1>Cómo funciona</h1>
      <p className="info-lead">
        SkinsMarket permite comprar, vender e intercambiar skins de CS2 usando inicio de sesión
        con Steam, publicaciones reales del market y pagos con Mercado Pago.
      </p>

      <section className="info-card">
        <h2>Comprar en el Market</h2>
        <ul className="info-steps">
          <li>Entrás al Market y buscás skins publicadas por otros usuarios.</li>
          <li>Podés acumular filtros por arma, float, rareza y precio para comparar mejor.</li>
          <li>Agregás las skins al carrito y validás un cupón si tenés uno disponible.</li>
          <li>El sistema crea una orden y reserva esas publicaciones para evitar dobles compras.</li>
          <li>Pagás con saldo disponible o con Mercado Pago en el checkout seguro.</li>
          <li>Cuando el pago se aprueba, la orden queda confirmada y el vendedor recibe la notificación.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Publicar una skin</h2>
        <ul className="info-steps">
          <li>Iniciás sesión con Steam y sincronizás tu inventario público de CS2.</li>
          <li>El sistema reconoce cada skin contra el catálogo y calcula un precio sugerido desde Steam Community Market con un margen del 8%.</li>
          <li>Antes de publicar podés modificar el precio y agregar un descuento adicional.</li>
          <li>Al confirmar, la publicación queda vendible en el Market y la skin no se puede usar en intercambio mientras esté publicada.</li>
          <li>Desde Mis publicaciones podés ver estado, pagos pendientes, reservas, ventas y operaciones relacionadas.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Intercambiar skins</h2>
        <ul className="info-steps">
          <li>Elegís una o más skins de tu inventario para enviar.</li>
          <li>Elegís una o más skins del Market para recibir.</li>
          <li>El sistema cotiza ambas partes con precios del mercado de Steam menos el 8% configurado.</li>
          <li>Si tu oferta vale menos, se usa automáticamente tu saldo y se muestra cuánto falta cargar.</li>
          <li>Si tu oferta vale más, la diferencia queda como saldo a favor.</li>
          <li>Al confirmar, la orden queda registrada y el bot prepara el movimiento de las skins.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Pagos y saldo</h2>
        <p>
          Mercado Pago se abre fuera de la aplicación para que el usuario elija tarjeta, dinero
          disponible u otro medio habilitado. En el entorno de prueba se usan cuentas sandbox y
          credenciales TEST, por eso no se debe pagar con una cuenta real.
        </p>
        <p>
          El saldo sirve para completar diferencias de intercambio. Si no alcanza, la plataforma
          muestra el faltante y permite cargar fondos desde Mercado Pago.
        </p>
      </section>

      <section className="info-card">
        <h2>Reglas importantes</h2>
        <p>
          <strong>Steam Trade URL:</strong> Steam OpenID nos da el identificador de la cuenta,
          pero no entrega la Trade URL. Por eso se carga manualmente desde Mi cuenta.
        </p>
        <p>
          <strong>Bloqueo de Steam:</strong> algunas skins pueden quedar bloqueadas hasta 7 días
          por reglas de Steam. La publicación puede quedar reservada hasta que sea entregable.
        </p>
        <p>
          <strong>Publicada, reservada o vendida:</strong> una skin publicada está disponible,
          una reservada ya pertenece a una orden en proceso, y una vendida ya no puede volver a
          comprarse ni pagarse por segunda vez.
        </p>
      </section>
    </main>
  )
}

export default ComoFunciona
