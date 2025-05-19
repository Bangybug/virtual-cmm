import { Mesh } from "three"
import { TNodeKey } from "../types"
import { TNurbsCurve } from "./types"

export class CurvesContext {
  #curves = new Map<TNodeKey, TNurbsCurve>()
  #mesh?: Mesh

  get data() {
    return this.#curves
  }

  setMesh(mesh: Mesh) {
    if (this.#mesh !== mesh) {
      this.#mesh = mesh
      for (const p of this.#curves.values()) {
        mesh.parent?.add(p.renderable)
      }
    }
  }
}