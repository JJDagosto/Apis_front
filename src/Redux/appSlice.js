import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentPage: "home",
  selectedSkinId: null,
  resetToken: null,
  verifyToken: null,
  checkoutCupon: "",
  searchTerm: "",
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    openPublicacion: (state, action) => {
      state.selectedSkinId = action.payload
      state.currentPage = "publicacion"
    },
    searchCatalogo: (state, action) => {
      state.searchTerm = action.payload || ""
      state.currentPage = "catalogo"
    },
    clearSearch: (state) => {
      state.searchTerm = ""
    },
    goToCheckout: (state, action) => {
      state.checkoutCupon = action.payload || ""
      state.currentPage = "checkout"
    },
    openResetPassword: (state, action) => {
      state.resetToken = action.payload
      state.currentPage = "resetPassword"
    },
    openVerifyEmail: (state, action) => {
      state.verifyToken = action.payload
      state.currentPage = "verifyEmail"
    },
    resetAppSession: (state) => {
      state.currentPage = "home"
      state.selectedSkinId = null
      state.checkoutCupon = ""
      state.searchTerm = ""
    },
  },
})

export const {
  setCurrentPage,
  openPublicacion,
  searchCatalogo,
  clearSearch,
  goToCheckout,
  openResetPassword,
  openVerifyEmail,
  resetAppSession,
} = appSlice.actions

export default appSlice.reducer
