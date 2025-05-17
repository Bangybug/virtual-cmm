import { EventDispatcher, Mesh } from 'three'
import { TEntitiesEvents, TNode, TNodeKey, TPointCollection } from './types'
import { Points } from '../cglib/builders/points'
import { mockNodes, mockPoints } from './tree/mocks'
import { createPoints, updatePoints } from '../renderables/points'

let maxNodeId = 1

export class EntitiesContext extends EventDispatcher<TEntitiesEvents> {
  // #nodes: TNode[] = []
  #nodes = mockNodes()

  #points = new Map<TNodeKey, TPointCollection>()

  #openNode?: TNode

  #mesh?: Mesh

  constructor() {
    super()

    mockPoints(this.#points)
  }

  get nodes() {
    return this.#nodes
  }

  newNode(node: TNode) {
    node.key = String(maxNodeId++)
    this.#nodes.push(node)
    this.dispatchEvent({ type: 'add', node })
  }

  removeNode(key: string) {
    let i = this.#nodes.findIndex((n) => n.key === key)
    if (this.#openNode?.key === key) {
      this.#openNode = undefined
    }
    if (i !== -1) {
      const node = this.#nodes[i]
      this.#nodes.splice(i, 1)
      this.dispatchEvent({ type: 'remove', node })
    }
  }

  openNodeDialog(node: TNode) {
    let i = this.#nodes.findIndex((n) => n.key === node.key)
    if (i !== -1) {
      this.#openNode = node
      this.dispatchEvent({ type: 'open', node })
    }
  }

  updatePoints(key: TNodeKey, points: Points) {
    let p = this.#points.get(key)
    if (!p) {
      p = { points, key, renderable: createPoints(points) }
      this.#points.set(key, p)
    } else {
      p.points = points
      updatePoints(points, p.renderable)
    }

    if (!p.renderable.parent && this.#mesh) {
      this.#mesh.parent?.add(p.renderable)
    }

    let node = this.#nodes.find((n) => n.key === key)
    if (node) {
      this.dispatchEvent({ type: 'update', node })
    }
  }

  getPoints(key: TNodeKey): TPointCollection | undefined {
    return this.#points.get(key)
  }

  get activeNode() {
    return this.#openNode
  }

  setMesh(mesh: Mesh) {
    if (this.#mesh !== mesh) {
      this.#mesh = mesh
      for (const p of this.#points.values()) {
        mesh.parent?.add(p.renderable)
      }
    }
  }
}
