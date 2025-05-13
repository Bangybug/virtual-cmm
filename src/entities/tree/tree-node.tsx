import { HTMLProps } from 'react'
import { TNode } from '../types'

interface TTreeNodeProps extends Pick<HTMLProps<HTMLDivElement>, 'onClick'> {
  value: TNode
}

export const TreeNode = ({ value, ...rest }: TTreeNodeProps) => {
  return (
    <div className="node" {...rest}>
      {value.label}
    </div>
  )
}
