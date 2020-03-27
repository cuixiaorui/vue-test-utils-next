import { ComponentPublicInstance } from 'vue'
import { ShapeFlags } from '@vue/shared'

import { DOMWrapper } from './dom-wrapper'
import { WrapperAPI } from './types'
import { ErrorWrapper } from './error-wrapper'

export class VueWrapper implements WrapperAPI {
  rootVM: ComponentPublicInstance
  componentVM: ComponentPublicInstance
  __emitted: Record<string, unknown[]> = {}

  constructor(vm: ComponentPublicInstance, events: Record<string, unknown[]>) {
    this.rootVM = vm
    this.componentVM = this.rootVM.$refs[
      'VTU_COMPONENT'
    ] as ComponentPublicInstance
    this.__emitted = events
  }

  get __hasMultipleRoots(): boolean {
    // if the subtree is an array of children, we have multiple root nodes
    return this.componentVM.$.subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN
  }

  classes(className?) {
    return new DOMWrapper(this.vm.$el).classes(className)
  }

  attributes(key?: string) {
    return new DOMWrapper(this.vm.$el).attributes(key)
  }

  exists() {
    return true
  }

  emitted() {
    return this.__emitted
  }

  html() {
    return this.rootVM.$el.outerHTML
  }

  text() {
    return this.rootVM.$el.textContent?.trim()
  }

  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper {
    const result = this.rootVM.$el.querySelector(selector) as T
    if (result) {
      return new DOMWrapper(result)
    }

    return new ErrorWrapper({ selector })
  }

  findAll<T extends Element>(selector: string): DOMWrapper<T>[] {
    const results = (this.rootVM.$el as Element).querySelectorAll<T>(selector)
    return Array.from(results).map((x) => new DOMWrapper(x))
  }

  async setChecked(checked: boolean = true) {
    return new DOMWrapper(this.rootVM.$el).setChecked(checked)
  }

  trigger(eventString: string) {
    const rootElementWrapper = new DOMWrapper(this.rootVM.$el)
    return rootElementWrapper.trigger(eventString)
  }
}

export function createWrapper(
  vm: ComponentPublicInstance,
  events: Record<string, unknown[]>
): VueWrapper {
  return new VueWrapper(vm, events)
}
