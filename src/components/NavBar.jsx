    import logo from "../images/logo.png";
    import { FaShoppingCart, FaSearch } from "react-icons/fa";
    import "./NavBar.css";

    
    const NavBar = ({setCurrentPage}) => {
    return (
    <nav className="navbar navbar-expand-lg d-flex justify-content-around custom-navbar">
        <a href="#"><div id="logo"><img src={logo} alt="logo" width="100"/></div></a>
        <ul className="navbar-nav">
            <li><a className="nav-link blanco" onClick={() => setCurrentPage('home')}>Inicio</a></li>
            <li><a className="nav-link blanco" onClick={() => setCurrentPage('catalogo')}>Comprar</a></li>
            <li><a className="nav-link blanco" href="#">Vender</a></li>
            <li><a className="nav-link blanco" onClick={() => setCurrentPage('prueba')}>Como funciona</a></li>
            <li><a className="nav-link blanco" href="#">Soporte</a></li>
            
        </ul>
        <div className="column d-flex justify-content-between align-items-center custom-column">
            <a href="#"><FaSearch size={20} className="blanco" /></a>
            <a href="#"><FaShoppingCart size={20} className="blanco" /></a>
            <button className="btn btn-warning " type="button">Iniciar sesion</button>
        </div>
    </nav>
    );
};

export default NavBar;