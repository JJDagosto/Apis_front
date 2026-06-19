import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  checkoutCupon: "",
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCheckoutCupon: (state, action) => {
      state.checkoutCupon = action.payload || ""
    },
    resetAppSession: (state) => {
      state.checkoutCupon = ""
    },
  },
})

export const {
  setCheckoutCupon,
  resetAppSession,
} = appSlice.actions

export default appSlice.reducer
