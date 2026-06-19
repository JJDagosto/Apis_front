import "../../pages/Info.css"

function ComoFunciona() {
  return (
    <main className="info-page">
      <h1>Cómo funciona</h1>
      <p className="info-lead">
        SkinsMarket conecta compradores y vendedores de skins de CS2 usando tu inventario real de Steam.
      </p>

      <section className="info-card">
        <h2>Comprar una skin</h2>
        <ul className="info-steps">
          <li>Explorá el catálogo y usá los filtros (rareza, float, precio) o el buscador.</li>
          <li>Agregá las skins que quieras al carrito.</li>
          <li>Desde el carrito, aplicá un cupón si tenés y continuá la compra.</li>
          <li>Pagá con Mercado Pago de forma segura. El monto lo calcula el sistema sobre tu orden.</li>
          <li>Una vez aprobado el pago, la skin queda asignada a tu cuenta.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Vender una skin</h2>
        <ul className="info-steps">
          <li>Configurá tu SteamID64 y tu inventario en público desde tu perfil.</li>
          <li>Entrá a <strong>Vender</strong> y sincronizá tu inventario de Steam.</li>
          <li>Elegí una skin publicable y poné el precio de venta.</li>
          <li>Gestioná tus publicaciones desde <strong>Mis publicaciones</strong>: editar, pausar o reactivar.</li>
        </ul>
      </section>

      <section className="info-card">
        <h2>Cosas importantes a tener en cuenta</h2>
        <p>
          <strong>Bloqueo de Steam:</strong> por normativas de Steam, una skin recién publicada puede
          tardar hasta 7 días en poder entregarse. Esta espera es de Steam, no nuestra.
        </p>
        <p>
          <strong>Intercambiable / Vendible:</strong> cada publicación puede ofrecerse para venta,
          para intercambio o ambas. Lo configurás al publicar y lo podés cambiar después.
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
