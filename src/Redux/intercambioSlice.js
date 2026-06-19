import { createSlice } from "@reduxjs/toolkit"

const toggleId = (ids, id) => {
  const normalizedId = String(id)
  return ids.includes(normalizedId)
    ? ids.filter((itemId) => itemId !== normalizedId)
    : [...ids, normalizedId]
}

const intercambioSlice = createSlice({
  name: "intercambio",
  initialState: {
    offeredInventoryItemIds: [],
    requestedSkinIds: [],
  },
  reducers: {
    toggleOfferedInventoryItem: (state, action) => {
      state.offeredInventoryItemIds = toggleId(
        state.offeredInventoryItemIds,
        action.payload,
      )
    },
    toggleRequestedSkin: (state, action) => {
      state.requestedSkinIds = toggleId(state.requestedSkinIds, action.payload)
    },
    clearExchangeSelection: (state) => {
      state.offeredInventoryItemIds = []
      state.requestedSkinIds = []
    },
  },
})

export const {
  toggleOfferedInventoryItem,
  toggleRequestedSkin,
  clearExchangeSelection,
} = intercambioSlice.actions

export default intercambioSlice.reducer
