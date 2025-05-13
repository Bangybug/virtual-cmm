import { createContext } from "react"
import { SurfaceContext } from "./surface/surface-context"
import { EntitiesContext } from "./entities/entities-context"

export const surfaceContextInstance = new SurfaceContext()
export const surfaceContext = createContext<SurfaceContext>(
  surfaceContextInstance
)

export const entitiesContext = new EntitiesContext()