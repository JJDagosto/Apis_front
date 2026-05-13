import Card from "./Card";
import Linea from "./Linea";
import './PriceMinMax.css';

const PriceMinMax = ({titulo}) => {
    return (
        <div className="text-start text-light body">
            <h6>Precio</h6>
          <div className="d-flex flex-row gap-2">
            <div>
                <span>Min.</span>
                <input type="number" placeholder="$0.00" />
            </div>
            <div>
                <span>Max.</span>
                <input type="number" placeholder="$0.00" />
            </div>
          </div>
        </div>
    );
};

export default PriceMinMax;