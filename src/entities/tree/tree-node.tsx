import { HTMLProps, useEffect, useState } from 'react'
import { IEntitiesEvent, TNode } from '../types'
import { entitiesContext } from '../../contexts'
import { useRefState } from '../../hooks/use-ref-state'

interface TTreeNodeProps extends Pick<HTMLProps<HTMLDivElement>, 'onClick'> {
  value: TNode
}

export const TreeNode = ({ value, ...rest }: TTreeNodeProps) => {
  const [selected, setSelected] = useRefState(false)
  const [label, setLabel] = useState(value.label)

  useEffect(() => {
    const select = (event: IEntitiesEvent) => {
      if (event.node.key === value.key) {
        setSelected(true)
      } else if (selected.current) {
        setSelected(false)
      }
    }
    entitiesContext.addEventListener('open', select)

    const update = (event: IEntitiesEvent) => {
      if (event.node.key === value.key) {
        setLabel(event.node.label)
      }
    }
    entitiesContext.addEventListener('update', update)

    return () => {
      entitiesContext.removeEventListener('open', select)
      entitiesContext.removeEventListener('update', update)
    }
  }, [])

  return (
    <div
      className={['node', selected.current ? 'selected' : ''].join(' ')}
      {...rest}
    >
      {label}
    </div>
  )
}
