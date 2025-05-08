/* eslint-disable @typescript-eslint/no-explicit-any */
import { Extensions } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import { Loader, Object3D } from 'three'

interface IFileLoader<T> extends Loader<T, File> {
  load(
    data: File,
    onLoad?: (result: T) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): unknown
}

type LoaderResult<T> = T extends any[] ? IFileLoader<T[number]> : IFileLoader<T>

function loadingFn<T>(
  extensions?: Extensions<any>,
  onProgress?: (event: ProgressEvent<EventTarget>) => void
) {
  return function (Proto: new () => LoaderResult<T>, ...input: File[]) {
    // Construct new loader and run extensions
    const loader = new Proto()
    if (extensions) {
      extensions(loader)
    }
    // Go through the urls and load them
    return Promise.all(
      input.map(
        inputElement =>
          new Promise((res, reject) =>
            loader.load(
              inputElement,
              (data: any) => {
                res(data)
              },
              onProgress,
              error =>
                reject(
                  `Could not load ${inputElement.name}: ${typeof error === 'string' ? error : error.message
                  }`
                )
            )
          )
      )
    )
  }
}

interface IGLTFLike {
  scene: Object3D
}

export function useFileLoader<T, U extends File | File[]>(
  Proto: new () => LoaderResult<T>,
  input: U,
  extensions?: Extensions<any>,
  onProgress?: (event: ProgressEvent<EventTarget>) => void
) {
  // Use suspense to load async assets
  const keys = (Array.isArray(input) ? input : [input]) as File[]
  const results = suspend(loadingFn<T>(extensions, onProgress), [
    Proto,
    ...keys,
  ])
  // Return the object/s
  return (Array.isArray(input) ? results : results[0]) as U extends any[] ? LoaderResult<T>[] : LoaderResult<T>
}
