import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { logout, setCurrentUserBalance } from "./authSlice"

const toggleId = (ids, id) => {
  const normalizedId = String(id)
  return ids.includes(normalizedId)
    ? ids.filter((itemId) => itemId !== normalizedId)
    : [...ids, normalizedId]
}

const selectionKey = ({ inventarioItemIds, skinIds, balance }) => (
  `${inventarioItemIds.join(",")}|${skinIds.join(",")}|${Number(balance ?? 0).toFixed(2)}`
)

const requestBody = ({ inventarioItemIds, skinIds }) => ({
  inventarioItemIds: inventarioItemIds.map(Number),
  skinIds: skinIds.map(Number),
})

export const cotizarIntercambio = createAsyncThunk(
  "intercambio/cotizarIntercambio",
  async (selection, { getState }) => {
    const response = await apiRequest(
      "/operations/exchange/quote",
      {
        method: "POST",
        body: JSON.stringify(requestBody(selection)),
      },
      getState().auth.token,
    )
    return { quote: response.data, key: selectionKey(selection) }
  },
  {
    condition: (selection, { getState }) => {
      const state = getState().intercambio
      if (state.submitting) return false
      const key = selectionKey(selection)
      return !(
        (state.quoteStatus === "loading" && state.pendingQuoteKey === key) ||
        (state.quoteStatus === "succeeded" && state.quotedSelectionKey === key)
      )
    },
  },
)

export const crearIntercambio = createAsyncThunk(
  "intercambio/crearIntercambio",
  async (selection, { dispatch, getState }) => {
    const stateBefore = getState()
    const response = await apiRequest(
      "/operations/exchange",
      {
        method: "POST",
        body: JSON.stringify(requestBody(selection)),
      },
      stateBefore.auth.token,
    )
    const amountPaid = Number(stateBefore.intercambio.quote?.montoAPagar ?? 0)
    const currentBalance = Number(stateBefore.auth.currentUser?.saldo ?? 0)
    if (amountPaid > 0) {
      dispatch(setCurrentUserBalance(Math.max(currentBalance - amountPaid, 0)))
    }
    return response.data
  },
  {
    condition: (_, { getState }) => !getState().intercambio.submitting,
  },
)

export const fetchMisOperaciones = createAsyncThunk(
  "intercambio/fetchMisOperaciones",
  async (_, { getState }) => {
    const response = await apiRequest(
      "/operations/me",
      {},
      getState().auth.token,
    )
    return response.data ?? []
  },
  {
    condition: (options, { getState }) => {
      const status = getState().intercambio.operationsStatus
      return status !== "loading" && (
        options?.force || ["idle", "failed"].includes(status)
      )
    },
  },
)

const initialState = {
  offeredInventoryItemIds: [],
  requestedSkinIds: [],
  offeredSearchTerm: "",
  requestedSearchTerm: "",
  quote: null,
  quoteStatus: "idle",
  quoteError: null,
  pendingQuoteKey: null,
  quotedSelectionKey: null,
  submitting: false,
  submitError: null,
  operation: null,
  operations: [],
  operationsStatus: "idle",
  operationsError: null,
}

const resetQuote = (state) => {
  state.quote = null
  state.quoteStatus = "idle"
  state.quoteError = null
  state.pendingQuoteKey = null
  state.quotedSelectionKey = null
}

const intercambioSlice = createSlice({
  name: "intercambio",
  initialState,
  reducers: {
    toggleOfferedInventoryItem: (state, action) => {
      state.offeredInventoryItemIds = toggleId(
        state.offeredInventoryItemIds,
        action.payload,
      )
      resetQuote(state)
    },
    toggleRequestedSkin: (state, action) => {
      state.requestedSkinIds = toggleId(state.requestedSkinIds, action.payload)
      resetQuote(state)
    },
    setOfferedSearchTerm: (state, action) => {
      state.offeredSearchTerm = action.payload ?? ""
    },
    setRequestedSearchTerm: (state, action) => {
      state.requestedSearchTerm = action.payload ?? ""
    },
    clearExchangeSelection: (state) => {
      state.offeredInventoryItemIds = []
      state.requestedSkinIds = []
      state.submitError = null
      resetQuote(state)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cotizarIntercambio.pending, (state, action) => {
        state.quoteStatus = "loading"
        state.quoteError = null
        state.pendingQuoteKey = selectionKey(action.meta.arg)
      })
      .addCase(cotizarIntercambio.fulfilled, (state, action) => {
        if (state.pendingQuoteKey !== action.payload.key) return
        state.quoteStatus = "succeeded"
        state.quote = action.payload.quote
        state.quotedSelectionKey = action.payload.key
        state.pendingQuoteKey = null
      })
      .addCase(cotizarIntercambio.rejected, (state, action) => {
        if (action.meta.condition) return
        if (state.pendingQuoteKey !== selectionKey(action.meta.arg)) return
        state.quoteStatus = "failed"
        state.quoteError = action.error.message
        state.pendingQuoteKey = null
      })
      .addCase(crearIntercambio.pending, (state) => {
        state.submitting = true
        state.submitError = null
        state.quoteError = null
      })
      .addCase(crearIntercambio.fulfilled, (state, action) => {
        state.submitting = false
        state.submitError = null
        state.operation = action.payload
        state.operations = [
          action.payload,
          ...state.operations.filter((operation) => operation.id !== action.payload.id),
        ]
        state.offeredInventoryItemIds = []
        state.requestedSkinIds = []
        resetQuote(state)
      })
      .addCase(crearIntercambio.rejected, (state, action) => {
        state.submitting = false
        state.submitError = action.error.message
        state.quoteError = action.error.message
      })
      .addCase(fetchMisOperaciones.pending, (state) => {
        state.operationsStatus = "loading"
        state.operationsError = null
      })
      .addCase(fetchMisOperaciones.fulfilled, (state, action) => {
        state.operationsStatus = "succeeded"
        state.operations = action.payload
      })
      .addCase(fetchMisOperaciones.rejected, (state, action) => {
        state.operationsStatus = "failed"
        state.operationsError = action.error.message
      })
      .addCase(logout, () => initialState)
  },
})

export const {
  toggleOfferedInventoryItem,
  toggleRequestedSkin,
  setOfferedSearchTerm,
  setRequestedSearchTerm,
  clearExchangeSelection,
} = intercambioSlice.actions

export default intercambioSlice.reducer
