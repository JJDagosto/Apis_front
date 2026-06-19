import { configureStore } from "@reduxjs/toolkit"
import appReducer from "./appSlice"
import authReducer from "./authSlice"
import carritoReducer from "./carritoSlice"
import catalogoReducer from "./catalogoSlice"
import publicacionesReducer from "./publicacionesSlice"
import inventarioReducer from "./inventarioSlice"
import checkoutReducer from "./checkoutSlice"
import adminReducer from "./adminSlice"
import notificacionesReducer from "./notificacionesSlice"
import intercambioReducer from "./intercambioSlice"

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    catalogo: catalogoReducer,
    carrito: carritoReducer,
    publicaciones: publicacionesReducer,
    inventario: inventarioReducer,
    checkout: checkoutReducer,
    admin: adminReducer,
    notificaciones: notificacionesReducer,
    intercambio: intercambioReducer,
  },
})
