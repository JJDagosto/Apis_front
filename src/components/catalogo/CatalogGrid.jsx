import Card from "../Card.jsx"
import { limpiarNombreSkin } from "../../utils/skinFormat"

function CatalogGrid({
  skins,
  loading,
  error,
  addingSkinId,
  getCartItemBySkinId,
  isOwnPublication,
  onCartClick,
}) {
  return (
    <div className="d-flex overflow-auto gap-3 flex-wrap justify-content-start">
      {loading && <p className="catalog-message">Cargando catálogo...</p>}

      {!loading && error && <p className="catalog-message">{error}</p>}

      {!loading && !error && skins.length === 0 && (
        <p className="catalog-message">No se encontraron resultados.</p>
      )}

      {!loading &&
        !error &&
        skins.map((skin) => (
          <Card
            key={skin.id}
            nombreSkin={limpiarNombreSkin(skin.name)}
            id={skin.id}
            arma={skin.catalogo?.weaponName}
            estado={skin.catalogo?.exteriorName ?? skin.exterior}
            precio={skin.finalPrice ?? skin.precioFinal ?? skin.price}
            precioOriginal={skin.price}
            descuento={skin.discount}
            imagen={skin.imageUrl}
            to={`/publicacion/${skin.id}`}
            addToCart={() => onCartClick(skin.id)}
            addingToCart={addingSkinId === skin.id}
            inCart={Boolean(getCartItemBySkinId(skin.id))}
            isOwnPublication={isOwnPublication(skin.id)}
          />
        ))}
    </div>
  )
}

export default CatalogGrid
