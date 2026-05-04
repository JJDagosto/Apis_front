import Card from "./Card";
import Linea from "./Linea";

const CardBar = ({titulo}) => {
    return (
        <div className="text-start text-light mx-5">
            <h2 className="mb-3">{titulo}</h2>
            <Linea/>
            <div className="cardBar d-flex justify-content-start overflow-auto gap-3 mt-3">
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" precio={0} imagen="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHwQxb9MbF1os3rGcf7-IK0YmKx4kmtXrYug&s" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" precio={0} imagen="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHwQxb9MbF1os3rGcf7-IK0YmKx4kmtXrYug&s" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" precio={0} imagen="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHwQxb9MbF1os3rGcf7-IK0YmKx4kmtXrYug&s" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" precio={0} imagen="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHwQxb9MbF1os3rGcf7-IK0YmKx4kmtXrYug&s" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" precio={0} imagen="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHwQxb9MbF1os3rGcf7-IK0YmKx4kmtXrYug&s" />
                <Card arma="Karambit" nombreSkin="Doppler Phase 4" estado="Factory New" precio={0} imagen="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHwQxb9MbF1os3rGcf7-IK0YmKx4kmtXrYug&s" />
                
            </div>
        </div>
    );
};

export default CardBar;