import {
  FaBolt,
  FaChartLine,
  FaCheckCircle,
  FaSearch,
  FaShieldAlt,
  FaShoppingBag,
  FaSteam,
  FaTags,
} from "react-icons/fa"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import heroLoot from "../images/logo.png"
import glow from "../images/image.png"
import useCurrencyFormatter from "../hooks/useCurrencyFormatter"
import { limpiarNombreSkin } from "../utils/skinFormat"
import "./Home.css"

const trustItems = [
  { icon: <FaShieldAlt />, title: "Operaciones claras", text: "Publicaciones, carrito y perfil en un flujo simple para comprar sin perder contexto." },
  { icon: <FaSteam />, title: "Pensado para Steam", text: "Inventario, trade URL y tiempos de espera explicados antes de publicar." },
  { icon: <FaChartLine />, title: "Precios visibles", text: "Filtros, ordenamiento y detalle de publicación para comparar rápido." },
]

function Home({ goToCatalogo, goToSell, goToInfo, currentUser }) {
  const { formatPrice } = useCurrencyFormatter()
  const navigate = useNavigate()
  const catalogItems = useSelector((state) => state.catalogo.items)
  const getFeaturedPrice = (skin) =>
    Number(skin.finalPrice ?? skin.precioFinal ?? skin.price ?? 0)
  const featuredSkins = useMemo(() => (
    catalogItems
      .filter((skin) => skin.active !== false)
      .filter((skin) => !skin.estadoPublicacion || skin.estadoPublicacion === "PUBLICADA")
      .filter((skin) => Number(skin.stock ?? 1) > 0)
      .slice()
      .sort((a, b) => getFeaturedPrice(b) - getFeaturedPrice(a))
      .slice(0, 3)
      .map((skin, index) => ({
        id: skin.id,
        weapon: skin.catalogo?.weaponName ?? "CS2",
        name: limpiarNombreSkin(skin.name),
        price: formatPrice(getFeaturedPrice(skin)),
        imageUrl: skin.imageUrl ?? skin.catalogo?.imageUrl,
        tag: ["Popular", "Hot", "Premium"][index] ?? "Market",
      }))
  ), [catalogItems, formatPrice])

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Marketplace de skins CS2</span>
          <h1>Comprá y vendé skins con menos vueltas.</h1>
          <p>
            Explorá publicaciones, filtrá por arma, float, rareza y precio, y guardá tus picks en el carrito antes de decidir.
          </p>

          <div className="home-actions">
            <button className="home-primary" type="button" onClick={goToCatalogo}>
              <FaShoppingBag /> Ver skins
            </button>
            <button className="home-secondary" type="button" onClick={goToSell}>
              <FaSteam /> {currentUser ? "Ir a inventario" : "Conectar inventario"}
            </button>
          </div>

          <div className="home-stats" aria-label="Datos destacados">
            <div>
              <strong>15k+</strong>
              <span>skins catalogadas</span>
            </div>
            <div>
              <strong>CS2</strong>
              <span>inventario Steam</span>
            </div>
            <div>
              <strong>Seguridad</strong>
              <span>Las skins son validadas</span>
            </div>
          </div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <img className="home-glow" src={glow} alt="" />
          <img className="home-loot" src={heroLoot} alt="" />
          
          
        </div>
      </section>

      <section className="home-strip" aria-label="Accesos rápidos">
        <button type="button" onClick={goToCatalogo}>
          <FaSearch /> Buscar por nombre
        </button>
        <button type="button" onClick={goToCatalogo}>
          <FaTags /> Filtrar por precio
        </button>
        <button type="button" onClick={goToSell}>
          <FaSteam /> Abrir inventario
        </button>
        <button type="button" onClick={goToInfo}>
          <FaBolt /> Cómo funciona
        </button>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <span>Destacadas</span>
          <h2>Publicaciones listas para comparar</h2>
        </div>

        <div className="home-featured-grid">
          {featuredSkins.map((skin) => (
            <button
              className="home-skin-card"
              key={skin.id ?? `${skin.weapon}-${skin.name}`}
              type="button"
              onClick={() => navigate(`/publicacion/${skin.id}`)}
            >
              <span>{skin.tag}</span>
              {skin.imageUrl && <img src={skin.imageUrl} alt="" />}
              <h3>{skin.weapon}</h3>
              <p>{skin.name}</p>
              <strong>{skin.price}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section home-trust-section">
        <div className="home-section-heading">
          <span>Flujo seguro</span>
          <h2>Lo importante, siempre a mano</h2>
        </div>

        <div className="home-trust-grid">
          {trustItems.map((item) => (
            <article className="home-trust-item" key={item.title}>
              <div>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-final-cta">
        <div>
          <FaCheckCircle />
          <h2>Arrancá por las skins y armá tu carrito.</h2>
        </div>
        <button type="button" onClick={goToCatalogo}>Explorar skins</button>
      </section>
    </main>
  )
}

export default Home
