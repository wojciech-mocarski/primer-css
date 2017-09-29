'use babel'

import nunjucks from 'nunjucks'
import octicons from 'octicons'

export default class OcticonTag {
  get tags() { return ['octicon'] }

  parse(parser, nodes, lexer) {
    const token = parser.nextToken()
    const args = parser.parseSignature(null, true)
    parser.advanceAfterBlockEnd(token.value)
    return new nodes.CallExtension(this, 'run', args)
  }

  run(context, ...args) {
    args = Array.from(args)
    const name = (args.length > 1) ? args.shift() : args[0].name
    const attrs = args.shift()
    delete attrs.name
    if (!name) {
      throw new Error('Octicon tag requires a name= parameter')
    } else if (name in octicons) {
      const output = octicons[name].toSVG(attrs)
      return new nunjucks.runtime.SafeString(output)
    } else {
      throw new Error(`No such octicon: "${name}"`)
    }
  }
}
