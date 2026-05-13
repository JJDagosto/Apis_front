import CardBar from '../components/CardBar'
import Card from '../components/Card.jsx'
import './Catalogo.css'
import PriceMinMax from '../components/PriceMinMax.jsx'

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
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={1000} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i5wKJk4jxNWXCaQQnA5B5Q-8O4xnpltazNri37gGPgtlDzin7iXhN6y44tb0GUaYg5OSJ2A0QBM1-" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1I_82-aahgH_yaCW-Ej78l4uJoHH-2lBh-4mTQnIupdHrEO1QgW5MhTbIPtUHul9C1P7ni5gLAy9USZUzbrTo" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WRa7ZsLvWsCGuZxuZij-1gSCGn20wksT7Xzo6ueX6VOgUmWZQiTO5btxDrldbmNru05QLfiN5EmHmsj3hXrnE8mi375M8" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frHUVt_b6PfY1JfOSXDXJxbgjtLFqHnDqx0Qmtm_Vzdf4ICmUZlJ2C5F2TPlK7EdjN0FcPg" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-HnvD8J_WIzmkJ68B32rDH84r3iwDlqRZkMWj2dtTEdwVoN1_ZqwPrkuu61MK8ot2Xnglxl-Ds/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-DkvbiKvWDlDgF7sApjrCWoYr3igDn-xU9MDvzcYGSJwc3M1jW-gfsxbjrg5a_ot2XnshGILRs/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={1000} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i5wKJk4jxNWXCaQQnA5B5Q-8O4xnpltazNri37gGPgtlDzin7iXhN6y44tb0GUaYg5OSJ2A0QBM1-" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1I_82-aahgH_yaCW-Ej78l4uJoHH-2lBh-4mTQnIupdHrEO1QgW5MhTbIPtUHul9C1P7ni5gLAy9USZUzbrTo" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WRa7ZsLvWsCGuZxuZij-1gSCGn20wksT7Xzo6ueX6VOgUmWZQiTO5btxDrldbmNru05QLfiN5EmHmsj3hXrnE8mi375M8" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frHUVt_b6PfY1JfOSXDXJxbgjtLFqHnDqx0Qmtm_Vzdf4ICmUZlJ2C5F2TPlK7EdjN0FcPg" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-HnvD8J_WIzmkJ68B32rDH84r3iwDlqRZkMWj2dtTEdwVoN1_ZqwPrkuu61MK8ot2Xnglxl-Ds/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-DkvbiKvWDlDgF7sApjrCWoYr3igDn-xU9MDvzcYGSJwc3M1jW-gfsxbjrg5a_ot2XnshGILRs/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={1000} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i5wKJk4jxNWXCaQQnA5B5Q-8O4xnpltazNri37gGPgtlDzin7iXhN6y44tb0GUaYg5OSJ2A0QBM1-" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1I_82-aahgH_yaCW-Ej78l4uJoHH-2lBh-4mTQnIupdHrEO1QgW5MhTbIPtUHul9C1P7ni5gLAy9USZUzbrTo" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WRa7ZsLvWsCGuZxuZij-1gSCGn20wksT7Xzo6ueX6VOgUmWZQiTO5btxDrldbmNru05QLfiN5EmHmsj3hXrnE8mi375M8" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frHUVt_b6PfY1JfOSXDXJxbgjtLFqHnDqx0Qmtm_Vzdf4ICmUZlJ2C5F2TPlK7EdjN0FcPg" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-HnvD8J_WIzmkJ68B32rDH84r3iwDlqRZkMWj2dtTEdwVoN1_ZqwPrkuu61MK8ot2Xnglxl-Ds/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-DkvbiKvWDlDgF7sApjrCWoYr3igDn-xU9MDvzcYGSJwc3M1jW-gfsxbjrg5a_ot2XnshGILRs/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={1000} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i5wKJk4jxNWXCaQQnA5B5Q-8O4xnpltazNri37gGPgtlDzin7iXhN6y44tb0GUaYg5OSJ2A0QBM1-" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1I_82-aahgH_yaCW-Ej78l4uJoHH-2lBh-4mTQnIupdHrEO1QgW5MhTbIPtUHul9C1P7ni5gLAy9USZUzbrTo" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WRa7ZsLvWsCGuZxuZij-1gSCGn20wksT7Xzo6ueX6VOgUmWZQiTO5btxDrldbmNru05QLfiN5EmHmsj3hXrnE8mi375M8" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frHUVt_b6PfY1JfOSXDXJxbgjtLFqHnDqx0Qmtm_Vzdf4ICmUZlJ2C5F2TPlK7EdjN0FcPg" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-HnvD8J_WIzmkJ68B32rDH84r3iwDlqRZkMWj2dtTEdwVoN1_ZqwPrkuu61MK8ot2Xnglxl-Ds/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-DkvbiKvWDlDgF7sApjrCWoYr3igDn-xU9MDvzcYGSJwc3M1jW-gfsxbjrg5a_ot2XnshGILRs/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-DkvbiKvWDlDgF7sApjrCWoYr3igDn-xU9MDvzcYGSJwc3M1jW-gfsxbjrg5a_ot2XnshGILRs/512fx384f" />

          </div>
      </div>
    
  </div>
</div>
</body>
  )
}

export default Catalogo
