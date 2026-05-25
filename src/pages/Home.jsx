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
import heroLoot from "../images/logo.png"
import glow from "../images/image.png"
import "./Home.css"

const featuredSkins = [
  { weapon: "AK-47", name: "Redline", price: "$549.99", tag: "Popular" },
  { weapon: "AWP", name: "Asiimov", price: "$1599.99", tag: "Hot" },
  { weapon: "M4A1-S", name: "Printstream", price: "$1749.99", tag: "Premium" },
]

const trustItems = [
  { icon: <FaShieldAlt />, title: "Operaciones claras", text: "Publicaciones, carrito y perfil en un flujo simple para comprar sin perder contexto." },
  { icon: <FaSteam />, title: "Pensado para Steam", text: "Inventario, trade URL y tiempos de espera explicados antes de publicar." },
  { icon: <FaChartLine />, title: "Precios visibles", text: "Filtros, ordenamiento y detalle de publicacion para comparar rapido." },
]

function Home({ goToCatalogo, goToSell, goToInfo, currentUser }) {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Marketplace de skins CS2</span>
          <h1>Compra y vende skins con menos vueltas.</h1>
          <p>
            Explora publicaciones, filtra por arma, float, rareza y precio, y guarda tus picks en el carrito antes de decidir.
          </p>

          <div className="home-actions">
            <button className="home-primary" type="button" onClick={goToCatalogo}>
              <FaShoppingBag /> Ver catalogo
            </button>
            <button className="home-secondary" type="button" onClick={goToSell}>
              <FaSteam /> {currentUser ? "Vender skin" : "Conectar para vender"}
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

      <section className="home-strip" aria-label="Accesos rapidos">
        <button type="button" onClick={goToCatalogo}>
          <FaSearch /> Buscar por nombre
        </button>
        <button type="button" onClick={goToCatalogo}>
          <FaTags /> Filtrar por precio
        </button>
        <button type="button" onClick={goToSell}>
          <FaSteam /> Publicar inventario
        </button>
        <button type="button" onClick={goToInfo}>
          <FaBolt /> Como funciona
        </button>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <span>Destacadas</span>
          <h2>Publicaciones listas para comparar</h2>
        </div>

        <div className="home-featured-grid">
          {featuredSkins.map((skin) => (
            <article className="home-skin-card" key={`${skin.weapon}-${skin.name}`}>
              <span>{skin.tag}</span>
              <h3>{skin.weapon}</h3>
              <p>{skin.name}</p>
              <strong>{skin.price}</strong>
            </article>
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
          <h2>Arranca por el catalogo y arma tu carrito.</h2>
        </div>
        <button type="button" onClick={goToCatalogo}>Explorar skins</button>
      </section>
    </main>
  )
}

export default Home
