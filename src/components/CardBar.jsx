import Card from "./Card";
import Linea from "./Linea";

const CardBar = ({titulo}) => {
    return (
        <div className="text-start text-light mx-5">
            <div className="d-flex justify-content-between align-items-center me-2"><h2 className="mb-3">{titulo}</h2><a className="text-light">Ver todo</a></div>  
            <Linea/>
            <div className="cardBar d-flex justify-content-start overflow-auto gap-3 mt-3">
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={1000} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i5wKJk4jxNWXCaQQnA5B5Q-8O4xnpltazNri37gGPgtlDzin7iXhN6y44tb0GUaYg5OSJ2A0QBM1-" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1I_82-aahgH_yaCW-Ej78l4uJoHH-2lBh-4mTQnIupdHrEO1QgW5MhTbIPtUHul9C1P7ni5gLAy9USZUzbrTo" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WRa7ZsLvWsCGuZxuZij-1gSCGn20wksT7Xzo6ueX6VOgUmWZQiTO5btxDrldbmNru05QLfiN5EmHmsj3hXrnE8mi375M8" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frHUVt_b6PfY1JfOSXDXJxbgjtLFqHnDqx0Qmtm_Vzdf4ICmUZlJ2C5F2TPlK7EdjN0FcPg" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-HnvD8J_WIzmkJ68B32rDH84r3iwDlqRZkMWj2dtTEdwVoN1_ZqwPrkuu61MK8ot2Xnglxl-Ds/512fx384f" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1JfwPz3cjxQ7dGzmL-DkvbiKvWDlDgF7sApjrCWoYr3igDn-xU9MDvzcYGSJwc3M1jW-gfsxbjrg5a_ot2XnshGILRs/512fx384f" />
                
            </div>
        </div>
    );
};

export default CardBar;