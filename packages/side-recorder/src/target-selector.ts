// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

type TargetSelectorCallback = (e: TargetSelector['e'], win: Window) => void

export default class TargetSelector {
  constructor(callback: TargetSelectorCallback, cleanupCallback?: () => void) {
    this.callback = callback
    this.cleanupCallback = cleanupCallback

    // Instead, we simply assign global content window to this.win
    this.win = window
    const doc = this.win.document
    const div = doc.createElement('div')
    div.setAttribute('style', 'display: none;')
    doc.body.insertBefore(div, doc.body.firstChild)
    this.div = div
    this.e = null
    this.r = null
    if (window === window.top) {
      this.showBanner(doc)
      // @ts-expect-error
      doc.body.insertBefore(this.banner, div)
    }
    doc.addEventListener('mousemove', this, true)
    doc.addEventListener('click', this, true)
    doc.addEventListener('mouseout', this, true)
  }
  // @ts-expect-error
  banner: HTMLDivElement
  callback: TargetSelectorCallback
  cleanupCallback?: () => void
  div: HTMLDivElement
  e: HTMLElement | null
  // @ts-expect-error
  header: HTMLDivElement | null
  r: null | DOMRect
  win: Window

  cleanup() {
    try {
      if (this.div) {
        if (this.div.parentNode) {
          this.div.parentNode.removeChild(this.div)
        }
        // @ts-expect-error
        this.div = null
      }
      if (this.header) {
        if (this.header.parentNode) {
          this.header.parentNode.removeChild(this.header)
        }
        this.header = null
      }
      if (this.win) {
        const doc = this.win.document
        doc.removeEventListener('mousemove', this, true)
        doc.removeEventListener('click', this, true)
        doc.removeEventListener('mouseout', this, true)
      }
    } catch (e) {
      if (e != "TypeError: can't access dead object") {
        throw e
      }
    }
    // @ts-expect-error
    this.win = null
    if (this.cleanupCallback) {
      this.cleanupCallback()
    }
  }

  handleEvent(evt: MouseEvent) {
    switch (evt.type) {
      case 'mousemove':
        this.highlight(
          // @ts-expect-error
          evt.target.ownerDocument,
          evt.clientX,
          evt.clientY
        )
        break
      case 'click':
        if (evt.button == 0 && this.e && this.callback) {
          this.callback(this.e, this.win as Window)
        } //Right click would cancel the select
        evt.preventDefault()
        evt.stopPropagation()
        this.cleanup()
        break
      case 'mouseout':
        this.removeHighlight()
        this.e = null
        break
    }
  }

  highlight(doc: Document, x: number, y: number) {
    if (doc) {
      const e = doc.elementFromPoint(x, y)
      if (e && e.tagName === 'IFRAME') {
        this.removeHighlight()
        this.e = null
      } else if (e && e != this.e) {
        this.highlightElement(e as HTMLElement)
      }
    }
  }

  highlightElement(element: HTMLElement) {
    if (element && element != this.e && element !== this.banner) {
      this.e = element
    } else {
      return
    }
    const r = element.getBoundingClientRect()
    const or = this.r
    if (r.left >= 0 && r.top >= 0 && r.width > 0 && r.height > 0) {
      if (
        or &&
        r.top == or.top &&
        r.left == or.left &&
        r.width == or.width &&
        r.height == or.height
      ) {
        return
      }
      this.r = r
      const style =
        'pointer-events: none; position: absolute; background-color: rgb(78, 171, 230); opacity: 0.4; border: 1px solid #0e0e0e; z-index: 1000000;'
      const pos = `top:${r.top + this.win.scrollY}px; left:${
        r.left + this.win.scrollX
      }px; width:${r.width}px; height:${r.height}px;`
      this.div.setAttribute('style', style + pos)
    } else if (or) {
      this.div.setAttribute('style', 'display: none;')
    }
  }

  removeHighlight() {
    this.div.setAttribute('style', 'display: none;')
  }

  showBanner(doc: Document) {
    this.banner = doc.createElement('div')
    this.banner.setAttribute(
      'style',
      'position: fixed;top: 0;left: 0;bottom: 0;right: 0;background: trasparent;z-index: 10000;'
    )
    const header = doc.createElement('div')
    header.setAttribute(
      'style',
      "pointer-events: none;display: flex;align-items: center;justify-content: center;flex-direction: row;position: fixed;top: 20%;left: 50%;transform: translateX(-50%);background: #f7f7f7;color: #114990;font-size: 22px;font-weight: 200;z-index: 10001;font-family: system, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;box-shadow: 0 7px 10px 0 rgba(0,0,0,0.1);border: 1px black solid; border-radius: 50px;padding: 10px;"
    )
    const span = doc.createElement('span')
    span.setAttribute(
      'style',
      'border-left: 1px solid #c6c6c6;padding: 3px 10px;'
    )
    span.innerText = 'Select an element'
    header.appendChild(span)
    setTimeout(() => {
      // this has to happen after a timeout, since adding it sync will add the event
      // before the window is focused which will case mousemove to fire before the
      // user actually moves the mouse
      this.banner.addEventListener(
        'mousemove',
        () => {
          setTimeout(() => {
            this.banner.style.visibility = 'hidden'
          }, 300)
        },
        false
      )
    }, 300)
    this.banner.appendChild(header)
  }
}
