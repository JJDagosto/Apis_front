import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  checkoutCupon: "",
  currency: "USD",
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCheckoutCupon: (state, action) => {
      state.checkoutCupon = action.payload || ""
    },
    setCurrency: (state, action) => {
      if (["ARS", "USD"].includes(action.payload)) {
        state.currency = action.payload
      }
    },
    resetAppSession: (state) => {
      state.checkoutCupon = ""
    },
  },
})

export const {
  setCheckoutCupon,
  setCurrency,
  resetAppSession,
} = appSlice.actions

export default appSlice.reducer
