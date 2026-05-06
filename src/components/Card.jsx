import "./Card.css"
import "./Global.css"
import { FaShoppingCart, FaSearch } from "react-icons/fa";


const Card = ({arma, nombreSkin, estado,  precio, imagen, link, addToCart}) => {
    return (
    <>
        <a href="link" className="card align-items-center flex-shrink-0" >
            <div className="contenedorImagen m-3"><img src={imagen} className="card-img-top" alt="..." /></div>
            <div className="card-body d-flex flex-column align-items-start w-100 mx-5">
                <div id="infoText" className="d-flex flex-column align-items-start align-content-start w-100">
                    <h6 className="card-title " >{arma}</h6>
                    <span className="m-0" id="nombre">{nombreSkin}</span>
                    <span className="text1 m-0">{estado}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                    <span className="" id="precio">${precio.toFixed(2)}</span>
                    <a href="{addToCart}" className="btn d-flex align-items-center justify-content-center" id="cart"><FaShoppingCart /></a>
                </div>

            </div>
        </a> 

    </>
    );
};

export default Card