import CardBar from '../components/CardBar'
import Card from '../components/Card.jsx'
import PriceMinMax from '../components/PriceMinMax.jsx'
import { useEffect, useState } from 'react'
import PruebaDumb from '../components/PruebaDumb.jsx'


function Prueba({id, title}) {

    

    const [skins, setSkins] = useState([])
    console.log(skins)


    useEffect(()=>{
    const URL= 'http://localhost:4003' //api
    fetch(`${URL}/skins/get/all`)
    .then((response)=>response.json())
    .then((data) => {setSkins(data.data)})
    .catch((error)=>(console.error('error')))
  },[])




  return (
    <>
    {skins.map((skin)=>(
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
