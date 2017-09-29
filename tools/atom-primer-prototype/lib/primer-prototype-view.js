'use babel'

import {CompositeDisposable, Emitter} from 'atom'

import path from 'path'
import nunjucks from 'nunjucks'
import matter from 'gray-matter'

import {OPENER_URI, OUTPUT_ID} from './constants'
import OcticonTag from './tags/octicon'

export default class PrimerPrototypeView {

  constructor() {
    // Create root element
    this.element = document.createElement('div')

    const templatePath = path.dirname(
      require.resolve('../templates/view.html')
    )

    this.env = new nunjucks.Environment([
      new nunjucks.FileSystemLoader(templatePath),
    ], {
      autoescape: false,
    })

    this.env.addExtension('Octicon', new OcticonTag())

    this.frameTemplate = 'frame.html'
    this.templateData = {
      document: {
        stylesheet: require.resolve('primer-css/build/build.css')
      }
    }

    this.element.innerHTML = this.env.render(
      'view.html',
      {OUTPUT_ID}
    )

    // get message and output elements
    this.output = this.element.querySelector(`#${OUTPUT_ID}`)

    this.subscriptions = new CompositeDisposable(
      atom.workspace.getCenter().observeActivePaneItem(item => {
        this.update(item)
      })
    )
  }

  getTitle() {
    return 'Primer Prototype'
  }

  getURI() {
    return OPENER_URI
  }

  getDefaultLocation() {
    return 'right'
  }

  getAllowedLocations() {
    return ['left', 'right']
  }

  update(item) {
    if (!atom.workspace.isTextEditor(item)) {
      this.showMessage({
        type: 'info',
        text: 'Open a file to prototype with it.',
      })
      return
    }

    if (this.item !== item) {
      if (this.onChange) {
        this.onChange.dispose()
      }
      this.item = item
      this.onChange = item.onDidStopChanging(
        this.render.bind(this)
      )
    }

    this.render()
  }

  render() {
    try {
      const text = this.item.buffer.getText()
      const {data, content} = matter(text)
      const rendered = this.env.renderString(content, data)
      this.renderFrame(rendered, data)
    } catch (error) {
      this.showMessage({
        title: 'Error',
        type: 'error',
        text: error.message,
      })
    }
  }

  renderFrame(content, data) {
    this.output.srcdoc = this.env.render(this.frameTemplate, Object.assign(
      {content},
      this.templateData,
      data,
    ))
  }

  showMessage(message) {
    this.renderFrame('', {
      message,
    })
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove()
    this.subscriptions.dispose()
  }

  getElement() {
    return this.element
  }

}
