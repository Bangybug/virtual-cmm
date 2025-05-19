import { EventDispatcher, Mesh, Vector3 } from 'three'
import { TEntitiesEvents, TNode, TNodeKey } from './types'
import { projectStore } from '../contexts'
import { EDialog } from './store/ui-store'
import { PointsContext } from './points/points-context'
import { TPointCollection } from './points/types'
import { CurvesContext } from './curves/curves-context'

let maxNodeId = 1

export class EntitiesContext extends EventDispatcher<TEntitiesEvents> {
  #nodes: TNode[] = []
  // #nodes = mockNodes()

  #openNode?: TNode

  #mesh?: Mesh

  readonly points = new PointsContext()
  readonly curves = new CurvesContext()

  constructor() {
    super()

    projectStore.addEventListener('save', (e) => {
      e.setProject(this.#nodes, this.points.data)
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

      this.points.loadPoints(e.project)
      for (const key of this.points.data.keys()) {
        const node = this.#nodes.find(n => n.key === key)
        if (node) {
          this.dispatchEvent({ type: 'update', node })
        }
      }
    })

    projectStore.loadProject()
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
        this.points.onNodeRemoved(key)
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

  getPoints(key: TNodeKey): TPointCollection | undefined {
    return this.points.data.get(key)
  }

  get activeNode() {
    return this.#openNode
  }

  setMesh(mesh: Mesh) {
    if (this.#mesh !== mesh) {
      this.#mesh = mesh
      this.points.setMesh(mesh)
      this.curves.setMesh(mesh)
    }
  }

  private usePointsNode(): TNode {
    if (this.#openNode?.class === EDialog.PointsDialog) {
      return this.#openNode
    }
    const newNode: TNode = {
      class: EDialog.PointsDialog,
      label: `points${maxNodeId}`,
      key: ''
    }
    this.#openNode = newNode
    this.newNode(newNode)
    this.points.createFor(newNode.key)
    return newNode
  }

  addPoint(v: Vector3) {
    const addTo = this.usePointsNode()
    this.points.addPoint(addTo.key, [v.x, v.y, v.z])
    this.dispatchEvent({ type: 'update', node: addTo })
  }
}
