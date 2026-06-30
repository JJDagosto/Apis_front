import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { DEFAULT_USD_TO_ARS } from "../utils/currency"
import { limpiarNombreSkin } from "../utils/skinFormat"
import {
  activarPublicacion,
  activarPublicacionLocal,
  cancelarPagoPendiente,
  despublicarPublicacion,
  despublicarPublicacionLocal,
  editarPublicacion,
  editarPublicacionLocal,
  pausarPublicacion,
  pausarPublicacionLocal,
} from "./publicacionesSlice"
import { publicarInventarioItem } from "./inventarioSlice"
import {
  crearSkinAdminParaUsuario,
  inactivarSkinAdmin,
} from "./adminSlice"
import { iniciarCheckout } from "./checkoutSlice"

const isVisibleCatalogItem = (skin) => {
  const status = skin.estadoPublicacion
  return skin.active !== false && (!status || status === "PUBLICADA")
}

const markOrderSkinsAsReserved = (state, order) => {
  const skinIds = new Set(
    (order?.orderDetailResponses ?? [])
      .map((detail) => detail.skinId)
      .filter(Boolean),
  )

  if (skinIds.size === 0) return

  state.items.forEach((skin) => {
    if (!skinIds.has(skin.id)) return
    skin.estadoPublicacion = "RESERVADA"
    skin.active = false
  })
}

const upsertCatalogSkin = (state, skin) => {
  if (!skin?.id) return
  const index = state.items.findIndex((item) => item.id === skin.id)
  if (index === -1) {
    state.items.push(skin)
    return
  }
  state.items[index] = { ...state.items[index], ...skin }
}

export const fetchCatalogo = createAsyncThunk(
  "catalogo/fetchCatalogo",
  async () => {
    const response = await apiRequest("/skins/get/all")
    return response.data ?? []
  },
  {
    condition: (_, { getState }) => getState().catalogo.status === "idle",
  },
)

const initialFilters = {
  exterior: [],
  rareza: [],
  arma: [],
  precioMin: "",
  precioMax: "",
  intercambiable: false,
  vendible: false,
}

const toggleFilterValue = (currentValue, value) => {
  const selectedValues = Array.isArray(currentValue)
    ? currentValue
    : currentValue
      ? [currentValue]
      : []

  return selectedValues.includes(value)
    ? selectedValues.filter((selectedValue) => selectedValue !== value)
    : [...selectedValues, value]
}

const matchesSelectedValues = (selectedValues, value) => {
  const values = Array.isArray(selectedValues)
    ? selectedValues
    : selectedValues
      ? [selectedValues]
      : []

  return values.length === 0 || values.includes(value)
}

const displayPriceToUsd = (value, currency, rate) => {
  if (value === "") return null
  const cleanValue = String(value)
    .replace(/[^\d,.-]/g, "")
    .trim()
  if (!cleanValue) return null

  const comma = cleanValue.lastIndexOf(",")
  const dot = cleanValue.lastIndexOf(".")
  const normalizedValue = comma > dot
    ? cleanValue.replace(/\./g, "").replace(",", ".")
    : cleanValue.replace(/,/g, "")
  const numericValue = Number(normalizedValue)
  if (!Number.isFinite(numericValue)) return null
  return currency === "ARS"
    ? numericValue / (Number(rate) || DEFAULT_USD_TO_ARS)
    : numericValue
}

const getSkinPrice = (skin) => Number(
  skin.estimatedTradePrice ?? skin.finalPrice ?? skin.precioFinal ?? skin.price ?? 0,
)

const catalogoSlice = createSlice({
  name: "catalogo",
  initialState: {
    items: [],
    currentItem: null,
    detail: null,
    filters: { ...initialFilters },
    sortOrder: "",
    searchTerm: "",
    status: "idle",
    loading: true,
    error: null,
  },
  reducers: {
    setCatalogFilter: (state, action) => {
      const { filterName, value } = action.payload
      state.filters[filterName] = toggleFilterValue(state.filters[filterName], value)
    },
    setCatalogPriceFilter: (state, action) => {
      const { filterName, value } = action.payload
      state.filters[filterName] = value
    },
    toggleCatalogBoolFilter: (state, action) => {
      const filterName = action.payload
      state.filters[filterName] = !state.filters[filterName]
    },
    setCatalogSort: (state, action) => {
      state.sortOrder = action.payload || ""
    },
    setCatalogSearchTerm: (state, action) => {
      state.searchTerm = action.payload || ""
    },
    clearCatalogSearch: (state) => {
      state.searchTerm = ""
    },
    resetCatalogFilters: (state) => {
      state.filters = { ...initialFilters }
      state.sortOrder = ""
      state.searchTerm = ""
    },
    setCurrentItem: (state, action) => {
      const skinId = action.payload
      state.currentItem = state.items.find((item) => String(item.id) === String(skinId)) ?? null
    },
    clearCurrentItem: (state) => {
      state.currentItem = null
      state.detail = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogo.pending, (state) => {
        state.status = "loading"
        state.loading = true
        state.error = null
      })
      .addCase(fetchCatalogo.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCatalogo.rejected, (state, action) => {
        state.status = "failed"
        state.loading = false
        state.error = action.error.message
      })
      .addCase(editarPublicacion.fulfilled, (state, action) => {
        const index = state.items.findIndex((skin) => skin.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(despublicarPublicacion.fulfilled, (state, action) => {
        const skin = state.items.find((item) => item.id === action.payload.skinId)
        if (skin) {
          skin.active = false
          skin.estadoPublicacion = "PAUSADA"
        }
      })
      .addCase(pausarPublicacion.fulfilled, (state, action) => {
        const skin = state.items.find((item) => item.id === action.payload.skinId)
        if (skin) {
          skin.active = false
          skin.estadoPublicacion = "PAUSADA"
        }
      })
      .addCase(activarPublicacion.fulfilled, (state, action) => {
        const activatedSkin = action.payload.skin
          ? {
            ...action.payload.skin,
            active: true,
            estadoPublicacion: "PUBLICADA",
          }
          : null
        const skin = state.items.find((item) => item.id === action.payload.skinId)
        if (skin) {
          skin.active = true
          skin.estadoPublicacion = "PUBLICADA"
        } else {
          upsertCatalogSkin(state, activatedSkin)
        }
      })
      .addCase(editarPublicacionLocal, (state, action) => {
        const { skinId, changes } = action.payload
        const skin = state.items.find((item) => item.id === skinId)
        if (skin) {
          Object.assign(skin, changes)
        }
      })
      .addCase(pausarPublicacionLocal, (state, action) => {
        const skin = state.items.find((item) => item.id === action.payload.id)
        if (skin) {
          skin.active = false
          skin.estadoPublicacion = "PAUSADA"
        }
      })
      .addCase(activarPublicacionLocal, (state, action) => {
        upsertCatalogSkin(state, {
          ...action.payload,
          active: true,
          estadoPublicacion: "PUBLICADA",
          vendible: true,
        })
      })
      .addCase(despublicarPublicacionLocal, (state, action) => {
        state.items = state.items.filter((skin) => skin.id !== action.payload.id)
      })
      .addCase(publicarInventarioItem.fulfilled, (state, action) => {
        state.items.push(action.payload.skin)
      })
      .addCase(crearSkinAdminParaUsuario.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(inactivarSkinAdmin.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (skin) => skin.id !== action.payload.skinId,
        )
      })
      .addCase(iniciarCheckout.fulfilled, (state, action) => {
        markOrderSkinsAsReserved(state, action.payload.data?.order)
      })
      .addCase(cancelarPagoPendiente.fulfilled, (state, action) => {
        const skinIds = new Set(
          (action.payload.orderDetailResponses ?? [])
            .map((detail) => detail.skinId)
            .filter(Boolean),
        )

        state.items.forEach((skin) => {
          if (!skinIds.has(skin.id)) return
          skin.estadoPublicacion = "PUBLICADA"
          skin.active = true
        })
      })
  },
})

export const {
  setCatalogFilter,
  setCatalogPriceFilter,
  toggleCatalogBoolFilter,
  setCatalogSort,
  setCatalogSearchTerm,
  clearCatalogSearch,
  resetCatalogFilters,
  setCurrentItem,
  clearCurrentItem,
} = catalogoSlice.actions

export const selectCatalogFilters = (state) => state.catalogo.filters
export const selectCatalogSearchTerm = (state) => state.catalogo.searchTerm
export const selectCatalogSortOrder = (state) => state.catalogo.sortOrder
export const selectCurrentCatalogItem = (state) => state.catalogo.currentItem

export const selectFilteredCatalogItems = createSelector(
  [
    (state) => state.catalogo.items,
    selectCatalogFilters,
    selectCatalogSearchTerm,
    selectCatalogSortOrder,
    (state) => state.app.currency,
    (state) => Number(state.auth.currentUser?.usdToArs ?? DEFAULT_USD_TO_ARS),
  ],
  (items, filters, searchTerm, sortOrder, currency, rate) => {
    const termino = (searchTerm ?? "").trim().toLowerCase()
    const precioMinUsd = displayPriceToUsd(filters.precioMin, currency, rate)
    const precioMaxUsd = displayPriceToUsd(filters.precioMax, currency, rate)

    const filteredItems = items.filter((skin) => {
      const skinPrice = getSkinPrice(skin)
      const cumpleBusqueda =
        termino === "" ||
        (skin.name ?? "").toLowerCase().includes(termino) ||
        (skin.catalogo?.weaponName ?? "").toLowerCase().includes(termino)

      const cumpleExterior =
        matchesSelectedValues(filters.exterior, skin.catalogo?.exteriorName)

      const cumpleRareza =
        matchesSelectedValues(filters.rareza, skin.catalogo?.rarezaName)

      const cumpleArma =
        matchesSelectedValues(filters.arma, skin.catalogo?.weaponName)

      const cumplePrecioMin =
        precioMinUsd === null || skinPrice >= precioMinUsd

      const cumplePrecioMax =
        precioMaxUsd === null || skinPrice <= precioMaxUsd

      const cumpleIntercambiable =
        !filters.intercambiable ||
        (skin.intercambiable === true && skin.vendible !== true)

      const cumpleVendible = !filters.vendible || skin.vendible === true

      return isVisibleCatalogItem(skin) && (
        cumpleBusqueda &&
        cumpleExterior &&
        cumpleRareza &&
        cumpleArma &&
        cumplePrecioMin &&
        cumplePrecioMax &&
        cumpleIntercambiable &&
        cumpleVendible
      )
    })

    return filteredItems.slice().sort((a, b) => {
      switch (sortOrder) {
        case "precio_asc":
          return getSkinPrice(a) - getSkinPrice(b)
        case "precio_desc":
          return getSkinPrice(b) - getSkinPrice(a)
        case "nombre_az":
          return limpiarNombreSkin(a.name).localeCompare(limpiarNombreSkin(b.name))
        case "nombre_za":
          return limpiarNombreSkin(b.name).localeCompare(limpiarNombreSkin(a.name))
        default:
          return 0
      }
    })
  },
)

export const selectExchangeCatalogItems = createSelector(
  [selectFilteredCatalogItems],
  (items) => items.filter((skin) =>
    skin.intercambiable === true || skin.vendible === true),
)

export default catalogoSlice.reducer
