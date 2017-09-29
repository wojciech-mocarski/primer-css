'use babel'

const nunjucks = require('nunjucks')
const octicons = require('octicons')

const debug = (...args) => {
  // console.warn(...args)
}

const parseArgs = (parser, nodes, lexer) => {
  const open = parser.nextToken()
  debug('OPEN', JSON.stringify(open))
  let name, args, kwargs, token
  while (true) {
    token = parser.peekToken()
    debug('  * token:', JSON.stringify(token))
    if (!token) {
      throw new Error('unexpected EOF in OcticonTag')
    } else if (token.type === lexer.TOKEN_BLOCK_END) {
      parser.nextToken()
      debug('CLOSE')
      break
    } else if (!args) {
      args = new nodes.NodeList(token.lineno, token.colno)
      kwargs = new nodes.KeywordArgs(token.lineno, token.colno)
    }
    const key = parser.parsePrimary(true)
    if (parser.skipValue(lexer.TOKEN_OPERATOR, '=')) {
      debug('    + key:', JSON.stringify(key))
      if (key.value === 'symbol') {
        name = parser.parseExpression()
        debug('    + name:', JSON.stringify(name))
      } else {
        const pair = new nodes.Pair(
          key.lineno,
          key.colno,
          key,
          parser.parseExpression()
        )
        debug('    + val:', JSON.stringify(pair.value))
        kwargs.addChild(pair)
      }
    } else if (name) {
      throw new Error('expected key=value, but got key')
    } else {
      name = key
      debug('    + name:', JSON.stringify(name))
    }
  }
  if (name) {
    args.addChild(name)
    if (kwargs.children.length) {
      args.addChild(kwargs)
    }
  } else {
    const pairs = kwargs.children.length
    throw new Error(`OcticonTag expected name, got ${pairs} kwargs`)
  }
  return args
}

module.exports = class OcticonTag {
  get tags() { return ['octicon'] }

  parse(parser, nodes, lexer) {
    const args = parseArgs(parser, nodes, lexer)
    return new nodes.CallExtension(this, 'run', args)
  }

  run(context, name, kwargs) {
    debug('run():', name, kwargs)
    const attrs = {fill: 'currentColor'}
    if (kwargs) {
      Object.assign(attrs, kwargs)
      delete attrs.__keywords
    }
    if (!name) {
      throw new Error('Octicon tag requires a name parameter')
    } else if (name in octicons) {
      const output = octicons[name].toSVG(attrs)
      return new nunjucks.runtime.SafeString(output)
    } else {
      throw new Error(`No such octicon: "${name}"`)
    }
  }
}
