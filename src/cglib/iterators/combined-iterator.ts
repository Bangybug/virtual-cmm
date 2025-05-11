export const CombinedIterator = <T>(iterables: Iterable<T>[]) => {
  return {
    [Symbol.iterator](): Iterator<T> {
      let iterableIndex = 0
      let currentIterator = iterables[iterableIndex][Symbol.iterator]()

      return {
        next(): IteratorResult<T> {
          let currentEntry = currentIterator.next()

          while (currentEntry.done) {
            if (++iterableIndex === iterables.length) {
              return { value: null, done: true }
            }
            currentIterator = iterables[iterableIndex][Symbol.iterator]()
            currentEntry = currentIterator.next()
          }

          return currentEntry
        },
      }
    },
  }
}
