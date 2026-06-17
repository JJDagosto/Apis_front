import { createSlice, nanoid } from "@reduxjs/toolkit"

const notificacionesSlice = createSlice({
  name: "notificaciones",
  initialState: {
    items: [],
  },
  reducers: {
    mostrarNotificacion: {
      reducer: (state, action) => {
        state.items.push(action.payload)
      },
      prepare: (message, type = "success", duration = 4000) => ({
        payload: {
          id: nanoid(),
          message,
          type,
          duration,
        },
      }),
    },
    cerrarNotificacion: (state, action) => {
      state.items = state.items.filter(
        (notification) => notification.id !== action.payload,
      )
    },
    limpiarNotificaciones: (state) => {
      state.items = []
    },
  },
})

export const {
  mostrarNotificacion,
  cerrarNotificacion,
  limpiarNotificaciones,
} = notificacionesSlice.actions

export default notificacionesSlice.reducer
