import { createContext } from "react"
import { SurfaceContext } from "./surface-context"

export const surfaceContextInstance = new SurfaceContext()
export const surfaceContext = createContext<SurfaceContext>(
  surfaceContextInstance
)
