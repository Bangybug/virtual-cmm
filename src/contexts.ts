import { createContext } from "react"
import { SurfaceContext } from "./surface/surface-context"
import { EntitiesContext } from "./entities/entities-context"
import { UiStore } from "./entities/store/ui-store"

export const surfaceContextInstance = new SurfaceContext()
export const surfaceContext = createContext<SurfaceContext>(
  surfaceContextInstance
)

export const entitiesContext = new EntitiesContext()

export const uiStore = new UiStore()