import { ipcRenderer } from 'electron'
import { ApiPromiseHandler, DefaultRouteShape, ThenArg } from '@seleniumhq/side-api'

const doAPI = <HANDLER extends ApiPromiseHandler>(
  path: string,
  ...args: Parameters<HANDLER>
): Promise<ThenArg<ReturnType<HANDLER>>> =>
  new Promise<ThenArg<ReturnType<HANDLER>>>((resolve) => {
    ipcRenderer.once(`${path}.complete`, (_event, result) => {
      console.debug('Reply from server', path, 'with results', result)
      resolve(result as ThenArg<ReturnType<HANDLER>>)
    })
    console.debug('Emitting to server', path, 'with args', args)
    ipcRenderer.send(path, ...args)
  })

const Handler =
  <HANDLER extends ApiPromiseHandler = DefaultRouteShape>() =>
  (path: string) => {
    return async (
      ...args: Parameters<HANDLER>
    ): Promise<ThenArg<ReturnType<HANDLER>>> => {
      console.debug(path, 'api called', ...(args as any))
      const result = await doAPI<HANDLER>(path, ...args)
      console.debug(path, 'api complete', result)
      return result
    }
  }

export default Handler
