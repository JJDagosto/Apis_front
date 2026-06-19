import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../api/client"
import { limpiarNombreSkin } from "../utils/skinFormat"
import {
  activarPublicacion,
  despublicarPublicacion,
  editarPublicacion,
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
  exterior: "",
  rareza: "",
  arma: "",
  precioMin: "",
  precioMax: "",
  intercambiable: false,
  vendible: false,
}

const catalogoSlice = createSlice({
  name: "catalogo",
  initialState: {
    items: [],
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
      state.filters[filterName] =
        state.filters[filterName] === value ? "" : value
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
      .addCase(activarPublicacion.fulfilled, (state, action) => {
        const skin = state.items.find((item) => item.id === action.payload.skinId)
        if (skin) {
          skin.active = true
          skin.estadoPublicacion = "PUBLICADA"
        }
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
} = catalogoSlice.actions

export const selectCatalogFilters = (state) => state.catalogo.filters
export const selectCatalogSearchTerm = (state) => state.catalogo.searchTerm
export const selectCatalogSortOrder = (state) => state.catalogo.sortOrder

export const selectFilteredCatalogItems = createSelector(
  [
    (state) => state.catalogo.items,
    selectCatalogFilters,
    selectCatalogSearchTerm,
    selectCatalogSortOrder,
  ],
  (items, filters, searchTerm, sortOrder) => {
    const termino = (searchTerm ?? "").trim().toLowerCase()

    const filteredItems = items.filter((skin) => {
      const cumpleBusqueda =
        termino === "" ||
        (skin.name ?? "").toLowerCase().includes(termino) ||
        (skin.catalogo?.weaponName ?? "").toLowerCase().includes(termino)

      const cumpleExterior =
        !filters.exterior || skin.catalogo?.exteriorName === filters.exterior

      const cumpleRareza =
        !filters.rareza || skin.catalogo?.rarezaName === filters.rareza

      const cumpleArma =
        !filters.arma || skin.catalogo?.weaponName === filters.arma

      const cumplePrecioMin =
        filters.precioMin === "" || skin.price >= Number(filters.precioMin)

      const cumplePrecioMax =
        filters.precioMax === "" || skin.price <= Number(filters.precioMax)

      const cumpleIntercambiable =
        !filters.intercambiable || skin.intercambiable === true

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
          return (a.price ?? 0) - (b.price ?? 0)
        case "precio_desc":
          return (b.price ?? 0) - (a.price ?? 0)
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
  (items) => items.filter((skin) => skin.intercambiable === true),
)

export default catalogoSlice.reducer
