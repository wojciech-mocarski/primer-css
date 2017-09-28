'use babel'

import PrimerPrototypeView from './primer-prototype-view'
import {CompositeDisposable, Disposable} from 'atom'

import {OPENER_URI, TOGGLE} from './constants'

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === OPENER_URI) {
          return new PrimerPrototypeView()
        }
      }),

      atom.commands.add('atom-workspace', {
        [TOGGLE]: () => this.toggle()
      }),

      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof PrimerPrototypeView) {
            item.destroy()
          }
        })
      })
    )
  },

  update(item) {
    this.view.update(item)
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  serialize() {
  },

  toggle() {
    atom.workspace.toggle(OPENER_URI)
  },

}
