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
          <li>Te mostramos un precio sugerido para que tengas una referencia antes de publicar.</li>
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
          <li>Comparamos el valor de ambos lados para calcular si hay diferencia.</li>
          <li>Si tu oferta vale menos, se usa automáticamente tu saldo y se muestra cuánto falta cargar.</li>
          <li>Si tu oferta vale más, la diferencia queda como saldo a favor.</li>
          <li>Al confirmar, la orden queda registrada y el bot prepara el movimiento de las skins.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Pagos y saldo</h2>
        <p>
          Podés pagar una compra con tu saldo disponible o continuar por Mercado Pago para elegir
          el medio que prefieras.
        </p>
        <p>
          El saldo también sirve para intercambios. Si te falta plata para completar una operación,
          vas a ver cuánto necesitás cargar antes de confirmar.
        </p>
      </section>

      <section className="info-card">
        <h2>Reglas importantes</h2>
        <p>
          <strong>Tu enlace de intercambio:</strong> para recibir skins necesitás cargar tu Steam
          Trade URL desde Mi cuenta.
        </p>
        <p>
          <strong>Tiempos de Steam:</strong> algunas skins pueden tardar unos días en estar listas
          para enviarse. Si pasa, te vamos a mostrar el estado de la operación.
        </p>
        <p>
          <strong>Reservas:</strong> cuando alguien inicia una compra, la skin queda apartada para
          esa orden. Si el pago se cancela, vuelve a estar disponible.
        </p>
      </section>
    </main>
  )
}

export default ComoFunciona
