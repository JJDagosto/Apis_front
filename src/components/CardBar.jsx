import Card from "./Card";
import Linea from "./Linea";

const CardBar = ({titulo}) => {
    return (
        <div className="text-start text-light mx-5">
            <h2 className="mb-3">{titulo}</h2>
            <Linea/>
            <div className="cardBar d-flex justify-content-start overflow-auto gap-3 mt-3">
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={10000000000000000000} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i5wKJk4jxNWXCaQQnA5B5Q-8O4xnpltazNri37gGPgtlDzin7iXhN6y44tb0GUaYg5OSJ2A0QBM1-" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1I_82-aahgH_yaCW-Ej78l4uJoHH-2lBh-4mTQnIupdHrEO1QgW5MhTbIPtUHul9C1P7ni5gLAy9USZUzbrTo" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WRa7ZsLvWsCGuZxuZij-1gSCGn20wksT7Xzo6ueX6VOgUmWZQiTO5btxDrldbmNru05QLfiN5EmHmsj3hXrnE8mi375M8" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0POjV7Q_cKDDMW6d0etkueBlcDu2kSIrujqNjsGrJH6XPQ9xAsZ5FLIDtBG5mtfhY7nl4gGNiosTzH792ntOvC1stbsDT-N7ra_mVv2F" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu4vx603vRA_Olpfu-TVJ7uK9V6xsLvSEHGaA_u13ve5WSDu2jCIrujqNjsH_InuUaQQmDJd2Fu4NshO7kIGyYeu24Affg98UxCX_iXhJ5i465bwHT-N7rXbV3WG0" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" link="#" addToCart="#" precio={0} imagen="https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XuWbwcuyMESA4Fdl-4nnpU7iQA3-kKnr8ytd6s2lfa9_Kb6VXmPGwuogsbNvSyi3zR4jsTnQztyqdS6QP1IoXpoiEeAC5Be5l9CxKaq8sIvgdE5J" />
                
            </div>
        </div>
    );
};

export default CardBar;