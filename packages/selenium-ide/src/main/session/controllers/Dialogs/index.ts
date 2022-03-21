import { dialog } from 'electron'

export default class DialogsController {
  async open() {
    return await dialog.showOpenDialog({ properties: ['openFile'] })
  }
  async openSave() {
    return await dialog.showSaveDialog({})
  }
}
