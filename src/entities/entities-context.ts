import { EventDispatcher, Mesh } from 'three'
import { TEntitiesEvents, TNode, TNodeKey, TPointCollection } from './types'
import { Points } from '../cglib/builders/points'
import { createPoints, updatePoints } from '../renderables/points'
import { projectStore } from '../contexts'
import { EDialog } from './store/ui-store'

let maxNodeId = 1

export class EntitiesContext extends EventDispatcher<TEntitiesEvents> {
  #nodes: TNode[] = []
  // #nodes = mockNodes()

  #points = new Map<TNodeKey, TPointCollection>()

  #openNode?: TNode

  #mesh?: Mesh

  constructor() {
    super()

    projectStore.addEventListener('save', (e) => {
      e.setProject(this.#nodes, this.#points)
    })

    projectStore.addEventListener('load', (e) => {
      for (const n of this.#nodes) {
        this.removeNode(n.key)
      }
      this.#nodes.length = 0
      maxNodeId = 1
      if (e.project.tree) {
        for (const node of e.project.tree) {
          this.#nodes.push(node)
          this.dispatchEvent({ type: 'add', node })
          maxNodeId = Math.max(Number(node.key) + 1, maxNodeId)
        }
      }
      this.#points.clear()
      if (e.project.points) {
        for (const [nodeKey, value] of Object.entries(e.project.points)) {
          const build = new Points({ reserveVertices: 10, componentCount: 3 })
          for (let i = 2; i < value.data.length; i += 3) {
            build.addPoint([value.data[i - 2], value.data[i - 1], value.data[i]])
          }
          this.updatePoints(nodeKey, build)
        }
      }
    })
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
      if (node.class === EDialog.PointsDialog) {
        const p = this.#points.get(node.key)
        p?.renderable.removeFromParent()
      }
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
