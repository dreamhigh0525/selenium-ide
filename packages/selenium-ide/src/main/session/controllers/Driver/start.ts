import { resolveDriverName } from '@seleniumhq/get-driver'
import { ChildProcess, spawn } from 'child_process'
import * as fs from 'fs-extra'
import { BrowserInfo, Session } from 'main/types'
import * as path from 'path'
import * as os from 'os'
import { COLOR_MAGENTA, COLOR_YELLOW, vdebuglog } from 'main/util'

const successMessage = 'was started successfully.'
export interface DriverStartSuccess {
  driver: ChildProcess
  success: true
}
export interface DriverStartFailure {
  error: string
  success: false
}

const WebdriverDebugLog = vdebuglog('webdriver', COLOR_MAGENTA)
const WebdriverDebugLogErr = vdebuglog('webdriver-error', COLOR_YELLOW)

/**
 * This module is just an async function that does the following:
 *   1. Grab driver from the node_modules, as fetched by electron-driver
 *   2. Spawn a process of it and waits for `driver was started successfully.`
 *   3. Return successfully if this occurs, or promote the failure if it doesn't work
 *   4. When Electron is quitting, close the child driver process
 */

const getDriver = ({ browser, version }: BrowserInfo) =>
  (browser === 'electron'
    ? path.resolve(
        path.join(
          __dirname,
          '..',
          'node_modules',
          'electron-chromedriver',
          'bin',
          'chromedriver' + (os.platform() === 'win32' ? '.exe' : '')
        )
      )
    : path.resolve(
        path.join(
          __dirname,
          '..',
          'files',
          resolveDriverName({
            browser,
            platform: os.platform(),
            version,
          })
        )
      )
  ).replace('app.asar', 'app.asar.unpacked')

export type StartDriver = (
  session: Session
) => (info: BrowserInfo) => Promise<DriverStartSuccess | DriverStartFailure>
const startDriver: StartDriver = () => (info) =>
  new Promise((resolve, reject) => {
    let initialized = false
    const args = ['--verbose']
    const driverPath = getDriver(info)
    if (fs.existsSync(driverPath)) {
      const driver = spawn(driverPath.replace(/\s/g, '\ '), args, {
        env: {},
        shell: false,
      })
      driver.stdout.on('data', (out: string) => {
        const outStr = `${out}`
        WebdriverDebugLog(outStr)
        const fullyStarted = outStr.includes(successMessage)
        if (fullyStarted) {
          initialized = true
          console.log('Driver has initialized!')
          resolve({ success: true, driver: driver })
        }
      })
      driver.stderr.on('data', (err: string) => {
        const errStr = `${err}`
        WebdriverDebugLogErr(errStr)
        if (!initialized) {
          resolve({ success: false, error: errStr })
        }
      })
      driver.on('close', (code: number) => {
        if (code) {
          console.warn('driver has exited with code', code)
          if (!initialized) {
            reject(code)
          }
        }
      })
    } else {
      resolve({
        success: false,
        error: `Missing executable at path ${driverPath}`,
      })
    }
  })

export default startDriver
