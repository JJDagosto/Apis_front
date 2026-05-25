import Card from '../components/Card.jsx'
import { useEffect, useState } from 'react'

function Prueba() {
  const [skins, setSkins] = useState([])

  useEffect(() => {
    const URL = 'http://localhost:4003'
    fetch(`${URL}/skins/get/all`)
      .then((response) => response.json())
      .then((data) => { setSkins(data.data) })
      .catch(() => { console.error('error') })
  }, [])

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
