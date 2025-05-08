import { STLLoader } from './threejs/STLLoader'

export class STLFileLoader extends STLLoader {
  constructor(manager) {
    super(manager)
  }

  load(file, onLoad, onProgress, onError) {
    const reader = new FileReader()
    const self = this

    const handleError = (message, err) => {
      if (onError) {
        onError(message || err)
      } else {
        console.error(message || err)
      }
    }

    reader.onabort = () => {
      handleError('File reading aborted ' + file.name)
    }
    reader.onerror = () => {
      handleError('File reading error ' + file.name)
    }
    reader.onprogress = onProgress
    reader.onload = () => {
      const arrayBuffer = reader.result
      try {
        onLoad(self.parse(arrayBuffer))
      } catch (e) {
        handleError(null, e)
      }
    }

    reader.readAsArrayBuffer(file)
  }
}
