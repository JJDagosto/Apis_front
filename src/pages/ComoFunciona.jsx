import "./Info.css"

function ComoFunciona() {
  return (
    <main className="info-page">
      <h1>Como funciona</h1>
      <p className="info-lead">
        SkinsMarket conecta compradores y vendedores de skins de CS2 usando tu inventario real de Steam.
      </p>

      <section className="info-card">
        <h2>Comprar una skin</h2>
        <ul className="info-steps">
          <li>Explora el catalogo y usa los filtros (rareza, float, precio) o el buscador.</li>
          <li>Agrega las skins que quieras al carrito.</li>
          <li>Desde el carrito, aplica un cupon si tenes y continua la compra.</li>
          <li>Paga con Mercado Pago de forma segura. El monto lo calcula el sistema sobre tu orden.</li>
          <li>Una vez aprobado el pago, la skin queda asignada a tu cuenta.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Vender una skin</h2>
        <ul className="info-steps">
          <li>Configura tu SteamID64 y tu inventario en publico desde tu perfil.</li>
          <li>Entra a <strong>Vender</strong> y sincroniza tu inventario de Steam.</li>
          <li>Elegi una skin publicable y poné el precio de venta.</li>
          <li>Gestiona tus publicaciones desde <strong>Mis publicaciones</strong>: editar, pausar o reactivar.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Cosas importantes a tener en cuenta</h2>
        <p>
          <strong>Bloqueo de Steam:</strong> por normativas de Steam, una skin recien publicada puede
          tardar hasta 7 dias en poder entregarse. Esta espera es de Steam, no nuestra.
        </p>
        <p>
          <strong>Intercambiable / Vendible:</strong> cada publicacion puede ofrecerse para venta,
          para intercambio o ambas. Lo configuras al publicar y lo podes cambiar despues.
        </p>
        <p>
          <strong>Saldo:</strong> el dinero a favor de tus ventas o ajustes queda como saldo en tu
          cuenta, visible arriba a la derecha.
        </p>
      </section>
    </main>
  )
}

export default ComoFunciona
