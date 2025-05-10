import { PropsWithChildren, RefObject, useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { BufferGeometry, Matrix4, Mesh } from 'three'
import { useFileLoader } from '../hooks/use-file-loader'
import { LOADER_ARRAYBUFFER_PROTOS, LOADER_URL_PROTOS } from '../loaders/loaders'

export type TOnLoadProps<T = Mesh> = { mesh: T; props: IModelProps<T> }

export type TSupportedModels = 'stl'

export interface IModelProps<T = Mesh> {
  fileType: TSupportedModels
  url?: string
  file?: File
  meshRef?: RefObject<T | null>
  matrix?: Matrix4
  onLoad?: (props: TOnLoadProps<T>) => void
  isHidden?: boolean
}

export const getSupportedModelFormat = (
  file?: File,
  url?: string
): TSupportedModels | undefined => {
  let ext = ''
  if (file) {
    const i = file.name.lastIndexOf('.')
    if (i !== -1) {
      ext = file.name.substring(i + 1).toLowerCase()
    }
  }
  if (url) {
    const i = url.lastIndexOf('.')
    if (i !== -1) {
      ext = url.substring(i + 1).toLowerCase()
    }
  }

  if (
    ext === 'stl'
  ) {
    return ext
  }

  return undefined
}

export function MeshFile<T = Mesh>(props: PropsWithChildren<IModelProps<T>>) {
  const { url, file, fileType, onLoad } = props
  const isAvailable = url || file

  const loader = url
    ? LOADER_URL_PROTOS[fileType]
    : LOADER_ARRAYBUFFER_PROTOS[fileType]

  const geom = (url
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useLoader(loader as any, url)
    : file
      ? useFileLoader(loader, file)
      : undefined) as BufferGeometry | undefined

  geom?.computeBoundingBox()

  const ref = props.meshRef || useRef<T | undefined>(null)

  useEffect(() => {
    if (ref.current && isAvailable) {
      onLoad?.({ mesh: ref.current, props })
    }
  }, [props.url, props.file])

  if (!isAvailable) {
    return null
  }

  const innerProps = {
    ...props,
    geometry: geom,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: ref as any,
    castShadow: false,
  }

  return (
    <mesh {...innerProps} visible={!props.isHidden}>
      {props.children}
    </mesh>)

}
