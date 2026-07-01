import Card from '../components/Card.jsx'
import { useSelector } from 'react-redux'

function Prueba() {
  const skins = useSelector((state) => state.catalogo.items)

  return (
    <>
      {skins.map((skin) => (
        <Card key={skin.id}
          nombreSkin={skin.name}
          id={skin.id}
          arma={skin.catalogo.weaponName}
          estado={skin.exterior}
          precio={skin.price}
          imagen={skin.imageUrl}
        />
      ))}
    </>
  )
}

export default Prueba
