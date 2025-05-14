import { HTMLProps, useEffect } from 'react'
import { IEntitiesEvent, TNode } from '../types'
import { entitiesContext } from '../../contexts'
import { useRefState } from '../../hooks/use-ref-state'

interface TTreeNodeProps extends Pick<HTMLProps<HTMLDivElement>, 'onClick'> {
  value: TNode
}

export const TreeNode = ({ value, ...rest }: TTreeNodeProps) => {
  const [selected, setSelected] = useRefState(false)

  useEffect(() => {
    const select = (event: IEntitiesEvent) => {
      if (event.node.key === value.key) {
        setSelected(true)
      } else if (selected.current) {
        setSelected(false)
      }
    }
    entitiesContext.addEventListener('open', select)

    return () => {
      entitiesContext.removeEventListener('open', select)
    }
  }, [])

  return (
    <div
      className={['node', selected.current ? 'selected' : ''].join(' ')}
      {...rest}
    >
      {value.label}
    </div>
  )
}
