import { useEffect, useState } from 'react'
import { TNode } from '../types'
import { entitiesContext } from '../../contexts'
import { TreeNode } from './tree-node'

export const Tree = () => {
  const [nodes, setNodes] = useState<TNode[]>(entitiesContext.nodes)

  useEffect(() => {
    const updateNodes = () => {
      setNodes([...entitiesContext.nodes])
    }

    entitiesContext.addEventListener('add', updateNodes)
    entitiesContext.addEventListener('remove', updateNodes)

    return () => {
      entitiesContext.removeEventListener('add', updateNodes)
      entitiesContext.removeEventListener('remove', updateNodes)
    }
  }, [])

  return (
    <div className="tree">
      {nodes.map((node) => (
        <TreeNode
          key={node.key}
          value={node}
          onClick={() => entitiesContext.openNodeDialog(node)}
        />
      ))}
    </div>
  )
}
