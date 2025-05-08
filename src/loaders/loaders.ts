import { STLFileLoader } from './STLFileLoader'
import { STLLoader } from './threejs/STLLoader'

export const LOADER_URL_PROTOS = {
  stl: STLLoader,
}

export const LOADER_ARRAYBUFFER_PROTOS = {
  stl: STLFileLoader,
}
