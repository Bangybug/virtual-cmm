import { createContext } from "react"
import { SurfaceContext } from "./surface/surface-context"
import { EntitiesContext } from "./entities/entities-context"
import { UiStore } from "./entities/store/ui-store"
import { ProjectStore } from "./entities/store/project-store"

export const surfaceContextInstance = new SurfaceContext()
export const surfaceContext = createContext<SurfaceContext>(
  surfaceContextInstance
)


export const projectStore = new ProjectStore()

export const uiStore = new UiStore()

export const entitiesContext = new EntitiesContext()
