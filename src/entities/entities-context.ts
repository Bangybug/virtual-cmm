import { EventDispatcher, Mesh, Object3D, Vector3 } from 'three'
import { ESubclass, TEntitiesEvents, TNode, TNodeKey } from './types'
import { projectStore, surfaceContextInstance } from '../contexts'
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
      e.setProject(this.#nodes, this.points.data, this.curves.data)
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
        const node = this.#nodes.find((n) => n.key === key)
        if (node) {
          this.updateNode(node)
          this.setNodeVisibility(node.key, !node.hidden)
        }
      }

      this.curves.loadCurves(e.project)
      for (const key of this.curves.data.keys()) {
        const node = this.#nodes.find((n) => n.key === key)
        if (node) {
          this.updateNode(node)
          this.setNodeVisibility(node.key, !node.hidden)
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
      switch (node.class) {
        case EDialog.PointsDialog:
          this.points.onNodeRemoved(key)
          break
        case EDialog.CurveDialog:
          this.curves.onNodeRemoved(key)
          break
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

  updateNode(node: TNode) {
    this.dispatchEvent({ type: 'update', node })
  }

  private assertPoints(pointsKey: TNodeKey) {
    const p = this.points.data.get(pointsKey)
    if (!p) {
      throw new Error(`Points node ${pointsKey} not found `)
    }
    return p
  }

  private usePointsNode(): TNode {
    if (this.#openNode?.class === EDialog.PointsDialog) {
      return this.#openNode
    }
    const newNode: TNode = {
      class: EDialog.PointsDialog,
      label: `points${maxNodeId}`,
      key: '',
    }
    this.#openNode = newNode
    this.newNode(newNode)
    this.points.createFor(newNode.key)
    return newNode
  }

  addPoint(v: Vector3) {
    const addTo = this.usePointsNode()
    this.points.addPoint(addTo.key, [v.x, v.y, v.z])
    this.updateNode(addTo)
  }

  makeCurveFromPoints(pointsKey: TNodeKey) {
    const p = this.assertPoints(pointsKey)
    const c = this.curves.getCurveNodeKey(pointsKey)
    let curveNode = c && this.nodes.find((n) => n.key === c)
    const isNewCurveNode = !curveNode
    if (!curveNode) {
      curveNode = {
        class: EDialog.CurveDialog,
        label: `curve${maxNodeId}`,
        key: '',
      }
      this.newNode(curveNode)
    }
    this.curves.updateCurveFromPoints(curveNode.key, p)
    if (isNewCurveNode) {
      this.openNodeDialog(curveNode)
    }
  }

  makeCrossSection(fromPoints: TNodeKey) {
    const result = this.points.createCrossSection(fromPoints)
    if (!result) {
      return
    }

    const newNode: TNode = {
      class: EDialog.PointsDialog,
      label: `Section${maxNodeId}`,
      subclass: ESubclass.CrossSection,
      key: '',
    }

    this.newNode(newNode)
    const data = this.points.createFor(newNode.key)
    data.crossSection = result.crossSection
    this.points.updatePoints(newNode.key, result.points)
    this.openNodeDialog(newNode)
  }

  showCrossSection(show: boolean, nodeKey: TNodeKey) {
    return this.points.showCrossSection(show, nodeKey)
  }

  setNodeVisibility(nodeKey: TNodeKey, isVisible: boolean) {
    const n = this.#nodes.find((n) => n.key === nodeKey)
    if (n) {
      if (isVisible) {
        delete n.hidden
      } else {
        n.hidden = true
      }
      let renderable: Object3D | undefined
      switch (n.class) {
        case EDialog.CurveDialog:
          renderable = this.curves.data.get(nodeKey)?.renderable
          break
        case EDialog.PointsDialog:
          renderable = this.points.data.get(nodeKey)?.renderable
          break
      }
      if (renderable) {
        renderable.visible = !n.hidden
        surfaceContextInstance.invalidate()
      }
    }
  }


}
