import CardBar from '../components/CardBar'
import Card from '../components/Card.jsx'
import './Catalogo.css'
import PriceMinMax from '../components/PriceMinMax.jsx'
import Prueba from './Prueba.jsx'

function Catalogo() {

  return (
    <body className='catalogo'>
      
      <div className='mt-3 d-flex justify-content-end align-items-center gap-2 me-5'>
        <span>Ordenar por </span>
        <select name="ordenar" id="ordenar">
          <option value="relevancia">relevancia</option>
          <option value="precio-asc">precio: de menor a mayor</option>
          <option value="precio-desc">precio: de mayor a menor</option>
          <option value="nombre-asc">nombre: A-Z</option>
          <option value="nombre-desc">nombre: Z-A</option>
        </select>
        <span> ⌄ </span>
      </div>
      
    <div className="container-fluid" width="100%">
      <div className="row">
        <div className="col-sm-3 d-flex flex-column align-items-start">
          <h6>Float</h6>
          <ul>
            <li>Factory New</li>
            <li>Minimal Wear</li>
            <li>Field-Tested</li>
            <li>Well-Worn</li>
            <li>Battle-Scarred</li>
          </ul>
          <hl/>
          <h6>Rarity</h6>
          <ul>  
            <li>Consumer Grade</li>
            <li>Industrial Grade</li>
            <li>Mil-Spec Grade</li>
            <li>Restricted</li>
            <li>Classified</li>
            <li>Covert</li>
            <li>Contraband</li>
          </ul>
          <hl/>
          <h6>Type</h6>
          <ul>
            <li>Rifle</li>
            <li>SMG</li>
            <li>Heavy</li>
            <li>Pistol</li>
            <li>Knife</li>
            <li>Gloves</li>
          </ul>
          <hl/>
          <PriceMinMax/>
         </div>
        <div className="col-sm-9">
          <div className='d-flex overflow-auto gap-3 flex-wrap justify-content-start'>
                <Prueba/>

          </div>
      </div>
    
  </div>
</div>
</body>
  )
}

export default Catalogo
