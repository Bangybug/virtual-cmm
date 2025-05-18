export enum EDialog {
  PointsDialog,
  CurveDialog,
}

type TDialogUiSettings = {
  left: number
  top: number
  width: number
  height: number
}

export class UiStore {
  dialogSettings = new Map<EDialog, TDialogUiSettings>()

  constructor() {
    this.loadUiSettings()

    window.addEventListener('beforeunload', () => {
      this.saveUiSettings()
    })
  }

  loadUiSettings() {
    for (const key in EDialog) {
      const keyName = EDialog[key]
      if (!keyName) {
        break
      }
      const numKey = Number(key)

      const item = window.localStorage.getItem(keyName)
      if (!item) {
        continue
      }

      const json = JSON.parse(item)
      if (json['left'] && json['top'] && json['width'] && json['height']) {
        const settings = {
          left: Number(json['left']),
          top: Number(json['top']),
          width: Number(json['width']),
          height: Number(json['height']),
        } satisfies TDialogUiSettings

        if (settings.width > window.innerWidth) {
          settings.width = window.innerWidth - 40
        }
        if (settings.height > window.innerHeight) {
          settings.width = window.innerHeight - 40
        }
        if (settings.left < 0) {
          settings.left = 0
        }
        if (settings.top < 0) {
          settings.top = 0
        }
        if (settings.left + settings.width > window.innerWidth) {
          settings.left = window.innerWidth - settings.width
        }
        if (settings.top + settings.height > window.innerHeight) {
          settings.top = window.innerHeight - settings.height
        }

        this.dialogSettings.set(numKey, settings)
      }
    }
  }

  saveUiSettings() {
    const all = this.dialogSettings.entries()
    for (const [key, value] of all) {
      window.localStorage.setItem(EDialog[key], JSON.stringify(value))
    }
  }

  updateSettings(key: EDialog, settings: TDialogUiSettings) {
    this.dialogSettings.set(key, settings)
  }

  getSettings(key: EDialog): TDialogUiSettings | undefined {
    return this.dialogSettings.get(key)
  }
}
