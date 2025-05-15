import { EventDispatcher } from 'three'
import { TEntitiesEvents, TNode, TPointCollection } from './types'
import { mockNodes } from './tree/mocks'

let maxNodeId = 1

export class EntitiesContext extends EventDispatcher<TEntitiesEvents> {
  // #nodes: TNode[] = []
  #nodes = mockNodes()

  #points = new Map<string, TPointCollection>()

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
    if (i !== -1) {
      const node = this.#nodes[i]
      this.#nodes.splice(i, 1)
      this.dispatchEvent({ type: 'remove', node })
    }
  }

  openNodeDialog(node: TNode) {
    let i = this.#nodes.findIndex((n) => n.key === node.key)
    if (i !== -1) {
      this.dispatchEvent({ type: 'open', node })
    }
  }
}
