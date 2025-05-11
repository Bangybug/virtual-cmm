type TArray<T> = {
  length: number
  splice: (start: number, count: number) => void
  indexOf: (item: T, fromIndex?: number) => number
}

export function clear<T>(array: TArray<T>) {
  array.splice(0, array.length)
}

export function remove<T>(array: TArray<T>, item: T) {
  const index = array.indexOf(item)

  if (index === -1) {
    return false
  } else {
    array.splice(index, 1)
    return true
  }
}
