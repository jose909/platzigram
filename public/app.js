(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var COMMENT_TAG = '!--'
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function belOnload () {
      load(el)
    }, function belOnunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        typeof node === 'function' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"global/document":4,"hyperx":7,"on-load":29}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
/* global HTMLElement */

'use strict'

module.exports = function emptyElement (element) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError('Expected an element')
  }

  var node
  while ((node = element.lastChild)) element.removeChild(node)
  return element
}

},{}],4:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":2}],5:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],7:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else cur[1][key] = concat(cur[1][key], parts[i][1])
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else cur[1][key] = concat(cur[1][key], parts[i][2])
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":6}],8:[function(require,module,exports){
'use strict';

exports = module.exports = require('./lib/parser')['default'];
exports['default'] = exports;

},{"./lib/parser":9}],9:[function(require,module,exports){
"use strict";

exports["default"] = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = [],
        peg$c1 = function(elements) {
                return {
                    type    : 'messageFormatPattern',
                    elements: elements
                };
            },
        peg$c2 = peg$FAILED,
        peg$c3 = function(text) {
                var string = '',
                    i, j, outerLen, inner, innerLen;

                for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
                    inner = text[i];

                    for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
                        string += inner[j];
                    }
                }

                return string;
            },
        peg$c4 = function(messageText) {
                return {
                    type : 'messageTextElement',
                    value: messageText
                };
            },
        peg$c5 = /^[^ \t\n\r,.+={}#]/,
        peg$c6 = { type: "class", value: "[^ \\t\\n\\r,.+={}#]", description: "[^ \\t\\n\\r,.+={}#]" },
        peg$c7 = "{",
        peg$c8 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c9 = null,
        peg$c10 = ",",
        peg$c11 = { type: "literal", value: ",", description: "\",\"" },
        peg$c12 = "}",
        peg$c13 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c14 = function(id, format) {
                return {
                    type  : 'argumentElement',
                    id    : id,
                    format: format && format[2]
                };
            },
        peg$c15 = "number",
        peg$c16 = { type: "literal", value: "number", description: "\"number\"" },
        peg$c17 = "date",
        peg$c18 = { type: "literal", value: "date", description: "\"date\"" },
        peg$c19 = "time",
        peg$c20 = { type: "literal", value: "time", description: "\"time\"" },
        peg$c21 = function(type, style) {
                return {
                    type : type + 'Format',
                    style: style && style[2]
                };
            },
        peg$c22 = "plural",
        peg$c23 = { type: "literal", value: "plural", description: "\"plural\"" },
        peg$c24 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: false,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options
                };
            },
        peg$c25 = "selectordinal",
        peg$c26 = { type: "literal", value: "selectordinal", description: "\"selectordinal\"" },
        peg$c27 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: true,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options
                }
            },
        peg$c28 = "select",
        peg$c29 = { type: "literal", value: "select", description: "\"select\"" },
        peg$c30 = function(options) {
                return {
                    type   : 'selectFormat',
                    options: options
                };
            },
        peg$c31 = "=",
        peg$c32 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c33 = function(selector, pattern) {
                return {
                    type    : 'optionalFormatPattern',
                    selector: selector,
                    value   : pattern
                };
            },
        peg$c34 = "offset:",
        peg$c35 = { type: "literal", value: "offset:", description: "\"offset:\"" },
        peg$c36 = function(number) {
                return number;
            },
        peg$c37 = function(offset, options) {
                return {
                    type   : 'pluralFormat',
                    offset : offset,
                    options: options
                };
            },
        peg$c38 = { type: "other", description: "whitespace" },
        peg$c39 = /^[ \t\n\r]/,
        peg$c40 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
        peg$c41 = { type: "other", description: "optionalWhitespace" },
        peg$c42 = /^[0-9]/,
        peg$c43 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c44 = /^[0-9a-f]/i,
        peg$c45 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c46 = "0",
        peg$c47 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c48 = /^[1-9]/,
        peg$c49 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c50 = function(digits) {
            return parseInt(digits, 10);
        },
        peg$c51 = /^[^{}\\\0-\x1F \t\n\r]/,
        peg$c52 = { type: "class", value: "[^{}\\\\\\0-\\x1F \\t\\n\\r]", description: "[^{}\\\\\\0-\\x1F \\t\\n\\r]" },
        peg$c53 = "\\\\",
        peg$c54 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c55 = function() { return '\\'; },
        peg$c56 = "\\#",
        peg$c57 = { type: "literal", value: "\\#", description: "\"\\\\#\"" },
        peg$c58 = function() { return '\\#'; },
        peg$c59 = "\\{",
        peg$c60 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
        peg$c61 = function() { return '\u007B'; },
        peg$c62 = "\\}",
        peg$c63 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c64 = function() { return '\u007D'; },
        peg$c65 = "\\u",
        peg$c66 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c67 = function(digits) {
                return String.fromCharCode(parseInt(digits, 16));
            },
        peg$c68 = function(chars) { return chars.join(''); },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsemessageFormatPattern();

      return s0;
    }

    function peg$parsemessageFormatPattern() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsemessageFormatElement();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsemessageFormatElement();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c1(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemessageFormatElement() {
      var s0;

      s0 = peg$parsemessageTextElement();
      if (s0 === peg$FAILED) {
        s0 = peg$parseargumentElement();
      }

      return s0;
    }

    function peg$parsemessageText() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsechars();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c2;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c3(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsemessageTextElement() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsemessageText();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c4(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseargument() {
      var s0, s1, s2;

      s0 = peg$parsenumber();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (peg$c5.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (peg$c5.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseargumentElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseargument();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c10;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c11); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseelementFormat();
                  if (s8 !== peg$FAILED) {
                    s6 = [s6, s7, s8];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c2;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c2;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c2;
              }
              if (s5 === peg$FAILED) {
                s5 = peg$c9;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s7 = peg$c12;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c13); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c14(s3, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseelementFormat() {
      var s0;

      s0 = peg$parsesimpleFormat();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepluralFormat();
        if (s0 === peg$FAILED) {
          s0 = peg$parseselectOrdinalFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseselectFormat();
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c15) {
        s1 = peg$c15;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c16); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c17) {
          s1 = peg$c17;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c18); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c19) {
            s1 = peg$c19;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c10;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsechars();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c2;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c9;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c21(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c24(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselectOrdinalFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 13) === peg$c25) {
        s1 = peg$c25;
        peg$currPos += 13;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c27(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselectFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c28) {
        s1 = peg$c28;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseoptionalFormatPattern();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseoptionalFormatPattern();
                }
              } else {
                s5 = peg$c2;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c30(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselector() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c31;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$parsechars();
      }

      return s0;
    }

    function peg$parseoptionalFormatPattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseselector();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c7;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c12;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c13); }
                    }
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c33(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseoffset() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c34) {
        s1 = peg$c34;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c35); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenumber();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c36(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralStyle() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseoffset();
      if (s1 === peg$FAILED) {
        s1 = peg$c9;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseoptionalFormatPattern();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseoptionalFormatPattern();
            }
          } else {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c37(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c39.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c39.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
          }
        }
      } else {
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsews();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsews();
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c42.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c44.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c46;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (peg$c48.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsedigit();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsedigit();
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s2 = input.substring(s1, peg$currPos);
        }
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c50(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      if (peg$c51.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c53) {
          s1 = peg$c53;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c55();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c56) {
            s1 = peg$c56;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c57); }
          }
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c58();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c59) {
              s1 = peg$c59;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c61();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c62) {
                s1 = peg$c62;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c63); }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c64();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c65) {
                  s1 = peg$c65;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c66); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  s3 = peg$currPos;
                  s4 = peg$parsehexDigit();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsehexDigit();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsehexDigit();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsehexDigit();
                        if (s7 !== peg$FAILED) {
                          s4 = [s4, s5, s6, s7];
                          s3 = s4;
                        } else {
                          peg$currPos = s3;
                          s3 = peg$c2;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c2;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c2;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c2;
                  }
                  if (s3 !== peg$FAILED) {
                    s3 = input.substring(s2, peg$currPos);
                  }
                  s2 = s3;
                  if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c67(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechar();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c68(s1);
      }
      s0 = s1;

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();


},{}],10:[function(require,module,exports){
/* jshint node:true */

'use strict';

var IntlMessageFormat = require('./lib/main')['default'];

// Add all locale data to `IntlMessageFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlMessageFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlMessageFormat;
exports['default'] = exports;

},{"./lib/locales":2,"./lib/main":15}],11:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports["default"] = Compiler;

function Compiler(locales, formats, pluralFn) {
    this.locales  = locales;
    this.formats  = formats;
    this.pluralFn = pluralFn;
}

Compiler.prototype.compile = function (ast) {
    this.pluralStack        = [];
    this.currentPlural      = null;
    this.pluralNumberFormat = null;

    return this.compileMessage(ast);
};

Compiler.prototype.compileMessage = function (ast) {
    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new Error('Message AST is not of type: "messageFormatPattern"');
    }

    var elements = ast.elements,
        pattern  = [];

    var i, len, element;

    for (i = 0, len = elements.length; i < len; i += 1) {
        element = elements[i];

        switch (element.type) {
            case 'messageTextElement':
                pattern.push(this.compileMessageText(element));
                break;

            case 'argumentElement':
                pattern.push(this.compileArgument(element));
                break;

            default:
                throw new Error('Message element does not have a valid type');
        }
    }

    return pattern;
};

Compiler.prototype.compileMessageText = function (element) {
    // When this `element` is part of plural sub-pattern and its value contains
    // an unescaped '#', use a `PluralOffsetString` helper to properly output
    // the number with the correct offset in the string.
    if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
        // Create a cache a NumberFormat instance that can be reused for any
        // PluralOffsetString instance in this message.
        if (!this.pluralNumberFormat) {
            this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
        }

        return new PluralOffsetString(
                this.currentPlural.id,
                this.currentPlural.format.offset,
                this.pluralNumberFormat,
                element.value);
    }

    // Unescape the escaped '#'s in the message text.
    return element.value.replace(/\\#/g, '#');
};

Compiler.prototype.compileArgument = function (element) {
    var format = element.format;

    if (!format) {
        return new StringFormat(element.id);
    }

    var formats  = this.formats,
        locales  = this.locales,
        pluralFn = this.pluralFn,
        options;

    switch (format.type) {
        case 'numberFormat':
            options = formats.number[format.style];
            return {
                id    : element.id,
                format: new Intl.NumberFormat(locales, options).format
            };

        case 'dateFormat':
            options = formats.date[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'timeFormat':
            options = formats.time[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'pluralFormat':
            options = this.compileOptions(element);
            return new PluralFormat(
                element.id, format.ordinal, format.offset, options, pluralFn
            );

        case 'selectFormat':
            options = this.compileOptions(element);
            return new SelectFormat(element.id, options);

        default:
            throw new Error('Message element does not have a valid format type');
    }
};

Compiler.prototype.compileOptions = function (element) {
    var format      = element.format,
        options     = format.options,
        optionsHash = {};

    // Save the current plural element, if any, then set it to a new value when
    // compiling the options sub-patterns. This conforms the spec's algorithm
    // for handling `"#"` syntax in message text.
    this.pluralStack.push(this.currentPlural);
    this.currentPlural = format.type === 'pluralFormat' ? element : null;

    var i, len, option;

    for (i = 0, len = options.length; i < len; i += 1) {
        option = options[i];

        // Compile the sub-pattern and save it under the options's selector.
        optionsHash[option.selector] = this.compileMessage(option.value);
    }

    // Pop the plural stack to put back the original current plural value.
    this.currentPlural = this.pluralStack.pop();

    return optionsHash;
};

// -- Compiler Helper Classes --------------------------------------------------

function StringFormat(id) {
    this.id = id;
}

StringFormat.prototype.format = function (value) {
    if (!value && typeof value !== 'number') {
        return '';
    }

    return typeof value === 'string' ? value : String(value);
};

function PluralFormat(id, useOrdinal, offset, options, pluralFn) {
    this.id         = id;
    this.useOrdinal = useOrdinal;
    this.offset     = offset;
    this.options    = options;
    this.pluralFn   = pluralFn;
}

PluralFormat.prototype.getOption = function (value) {
    var options = this.options;

    var option = options['=' + value] ||
            options[this.pluralFn(value - this.offset, this.useOrdinal)];

    return option || options.other;
};

function PluralOffsetString(id, offset, numberFormat, string) {
    this.id           = id;
    this.offset       = offset;
    this.numberFormat = numberFormat;
    this.string       = string;
}

PluralOffsetString.prototype.format = function (value) {
    var number = this.numberFormat.format(value - this.offset);

    return this.string
            .replace(/(^|[^\\])#/g, '$1' + number)
            .replace(/\\#/g, '#');
};

function SelectFormat(id, options) {
    this.id      = id;
    this.options = options;
}

SelectFormat.prototype.getOption = function (value) {
    var options = this.options;
    return options[value] || options.other;
};


},{}],12:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils"), src$es5$$ = require("./es5"), src$compiler$$ = require("./compiler"), intl$messageformat$parser$$ = require("intl-messageformat-parser");
exports["default"] = MessageFormat;

// -- MessageFormat --------------------------------------------------------

function MessageFormat(message, locales, formats) {
    // Parse string messages into an AST.
    var ast = typeof message === 'string' ?
            MessageFormat.__parse(message) : message;

    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new TypeError('A message must be provided as a String or AST.');
    }

    // Creates a new object with the specified `formats` merged with the default
    // formats.
    formats = this._mergeFormats(MessageFormat.formats, formats);

    // Defined first because it's used to build the format pattern.
    src$es5$$.defineProperty(this, '_locale',  {value: this._resolveLocale(locales)});

    // Compile the `ast` to a pattern that is highly optimized for repeated
    // `format()` invocations. **Note:** This passes the `locales` set provided
    // to the constructor instead of just the resolved locale.
    var pluralFn = this._findPluralRuleFunction(this._locale);
    var pattern  = this._compilePattern(ast, locales, formats, pluralFn);

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var messageFormat = this;
    this.format = function (values) {
      try {
        return messageFormat._format(pattern, values);
      } catch (e) {
        if (e.variableId) {
          throw new Error(
            'The intl string context variable \'' + e.variableId + '\'' +
            ' was not provided to the string \'' + message + '\''
          );
        } else {
          throw e;
        }
      }
    };
}

// Default format options used as the prototype of the `formats` provided to the
// constructor. These are used when constructing the internal Intl.NumberFormat
// and Intl.DateTimeFormat instances.
src$es5$$.defineProperty(MessageFormat, 'formats', {
    enumerable: true,

    value: {
        number: {
            'currency': {
                style: 'currency'
            },

            'percent': {
                style: 'percent'
            }
        },

        date: {
            'short': {
                month: 'numeric',
                day  : 'numeric',
                year : '2-digit'
            },

            'medium': {
                month: 'short',
                day  : 'numeric',
                year : 'numeric'
            },

            'long': {
                month: 'long',
                day  : 'numeric',
                year : 'numeric'
            },

            'full': {
                weekday: 'long',
                month  : 'long',
                day    : 'numeric',
                year   : 'numeric'
            }
        },

        time: {
            'short': {
                hour  : 'numeric',
                minute: 'numeric'
            },

            'medium':  {
                hour  : 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },

            'long': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            },

            'full': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            }
        }
    }
});

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(MessageFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(MessageFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlMessageFormat is missing a ' +
            '`locale` property'
        );
    }

    MessageFormat.__localeData__[data.locale.toLowerCase()] = data;
}});

// Defines `__parse()` static method as an exposed private.
src$es5$$.defineProperty(MessageFormat, '__parse', {value: intl$messageformat$parser$$["default"].parse});

// Define public `defaultLocale` property which defaults to English, but can be
// set by the developer.
src$es5$$.defineProperty(MessageFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

MessageFormat.prototype.resolvedOptions = function () {
    // TODO: Provide anything else?
    return {
        locale: this._locale
    };
};

MessageFormat.prototype._compilePattern = function (ast, locales, formats, pluralFn) {
    var compiler = new src$compiler$$["default"](locales, formats, pluralFn);
    return compiler.compile(ast);
};

MessageFormat.prototype._findPluralRuleFunction = function (locale) {
    var localeData = MessageFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find a `pluralRuleFunction` to return.
    while (data) {
        if (data.pluralRuleFunction) {
            return data.pluralRuleFunction;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlMessageFormat is missing a ' +
        '`pluralRuleFunction` for :' + locale
    );
};

MessageFormat.prototype._format = function (pattern, values) {
    var result = '',
        i, len, part, id, value, err;

    for (i = 0, len = pattern.length; i < len; i += 1) {
        part = pattern[i];

        // Exist early for string parts.
        if (typeof part === 'string') {
            result += part;
            continue;
        }

        id = part.id;

        // Enforce that all required values are provided by the caller.
        if (!(values && src$utils$$.hop.call(values, id))) {
          err = new Error('A value must be provided for: ' + id);
          err.variableId = id;
          throw err;
        }

        value = values[id];

        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (part.options) {
            result += this._format(part.getOption(value), values);
        } else {
            result += part.format(value);
        }
    }

    return result;
};

MessageFormat.prototype._mergeFormats = function (defaults, formats) {
    var mergedFormats = {},
        type, mergedType;

    for (type in defaults) {
        if (!src$utils$$.hop.call(defaults, type)) { continue; }

        mergedFormats[type] = mergedType = src$es5$$.objCreate(defaults[type]);

        if (formats && src$utils$$.hop.call(formats, type)) {
            src$utils$$.extend(mergedType, formats[type]);
        }
    }

    return mergedFormats;
};

MessageFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(MessageFormat.defaultLocale);

    var localeData = MessageFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlMessageFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};


},{"./compiler":11,"./es5":14,"./utils":16,"intl-messageformat-parser":8}],13:[function(require,module,exports){
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"}};


},{}],14:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils");

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!src$utils$$.hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (src$utils$$.hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

exports.defineProperty = defineProperty, exports.objCreate = objCreate;


},{"./utils":16}],15:[function(require,module,exports){
/* jslint esnext: true */

"use strict";
var src$core$$ = require("./core"), src$en$$ = require("./en");

src$core$$["default"].__addLocaleData(src$en$$["default"]);
src$core$$["default"].defaultLocale = 'en';

exports["default"] = src$core$$["default"];


},{"./core":12,"./en":13}],16:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports.extend = extend;
var hop = Object.prototype.hasOwnProperty;

function extend(obj) {
    var sources = Array.prototype.slice.call(arguments, 1),
        i, len, source, key;

    for (i = 0, len = sources.length; i < len; i += 1) {
        source = sources[i];
        if (!source) { continue; }

        for (key in source) {
            if (hop.call(source, key)) {
                obj[key] = source[key];
            }
        }
    }

    return obj;
}
exports.hop = hop;


},{}],17:[function(require,module,exports){
IntlRelativeFormat.__addLocaleData({"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"fields":{"year":{"displayName":"year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"one":"in {0} year","other":"in {0} years"},"past":{"one":"{0} year ago","other":"{0} years ago"}}},"month":{"displayName":"month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"one":"in {0} month","other":"in {0} months"},"past":{"one":"{0} month ago","other":"{0} months ago"}}},"day":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"hour":{"displayName":"hour","relativeTime":{"future":{"one":"in {0} hour","other":"in {0} hours"},"past":{"one":"{0} hour ago","other":"{0} hours ago"}}},"minute":{"displayName":"minute","relativeTime":{"future":{"one":"in {0} minute","other":"in {0} minutes"},"past":{"one":"{0} minute ago","other":"{0} minutes ago"}}},"second":{"displayName":"second","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} second","other":"in {0} seconds"},"past":{"one":"{0} second ago","other":"{0} seconds ago"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"en-001","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-150","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AI","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AS","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AT","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BB","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BI","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CA","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CH","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CX","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DE","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DK","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-Dsrt","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"fields":{"year":{"displayName":"Year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"other":"+{0} y"},"past":{"other":"-{0} y"}}},"month":{"displayName":"Month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"other":"+{0} m"},"past":{"other":"-{0} m"}}},"day":{"displayName":"Day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"other":"+{0} d"},"past":{"other":"-{0} d"}}},"hour":{"displayName":"Hour","relativeTime":{"future":{"other":"+{0} h"},"past":{"other":"-{0} h"}}},"minute":{"displayName":"Minute","relativeTime":{"future":{"other":"+{0} min"},"past":{"other":"-{0} min"}}},"second":{"displayName":"Second","relative":{"0":"now"},"relativeTime":{"future":{"other":"+{0} s"},"past":{"other":"-{0} s"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"en-ER","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FI","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FJ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GB","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GD","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GH","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GI","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GU","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-HK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IL","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IN","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IO","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-JE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-JM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KI","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KN","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-LC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-LR","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-LS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MH","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MO","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MP","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MT","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NA","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NF","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NL","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NR","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PH","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PN","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PR","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-RW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SB","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SD","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SE","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SH","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SI","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SL","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SX","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-Shaw","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"fields":{"year":{"displayName":"Year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"other":"+{0} y"},"past":{"other":"-{0} y"}}},"month":{"displayName":"Month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"other":"+{0} m"},"past":{"other":"-{0} m"}}},"day":{"displayName":"Day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"other":"+{0} d"},"past":{"other":"-{0} d"}}},"hour":{"displayName":"Hour","relativeTime":{"future":{"other":"+{0} h"},"past":{"other":"-{0} h"}}},"minute":{"displayName":"Minute","relativeTime":{"future":{"other":"+{0} min"},"past":{"other":"-{0} min"}}},"second":{"displayName":"Second","relative":{"0":"now"},"relativeTime":{"future":{"other":"+{0} s"},"past":{"other":"-{0} s"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"en-TC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TO","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TT","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TV","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-UG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-UM","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-US","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VI","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-WS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-ZA","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-ZM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-ZW","parentLocale":"en-001"});

},{}],18:[function(require,module,exports){
IntlRelativeFormat.__addLocaleData({"locale":"es","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"anteayer","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-419","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-AR","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-BO","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-CL","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-CO","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-CR","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-CU","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-DO","parentLocale":"es-419","fields":{"year":{"displayName":"Año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"Mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"Día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"anteayer","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"Minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"Segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-EA","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-EC","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-GQ","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-GT","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-HN","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-IC","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-MX","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el año próximo","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el mes próximo","-1":"el mes pasado"},"relativeTime":{"future":{"one":"en {0} mes","other":"en {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-NI","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-PA","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-PE","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-PH","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-PR","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-PY","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antes de ayer","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-SV","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-US","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-UY","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-VE","parentLocale":"es-419"});

},{}],19:[function(require,module,exports){
/* jshint node:true */

'use strict';

var IntlRelativeFormat = require('./lib/main')['default'];

// Add all locale data to `IntlRelativeFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlRelativeFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlRelativeFormat;
exports['default'] = exports;

},{"./lib/locales":2,"./lib/main":24}],20:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var intl$messageformat$$ = require("intl-messageformat"), src$diff$$ = require("./diff"), src$es5$$ = require("./es5");
exports["default"] = RelativeFormat;

// -----------------------------------------------------------------------------

var FIELDS = ['second', 'minute', 'hour', 'day', 'month', 'year'];
var STYLES = ['best fit', 'numeric'];

// -- RelativeFormat -----------------------------------------------------------

function RelativeFormat(locales, options) {
    options = options || {};

    // Make a copy of `locales` if it's an array, so that it doesn't change
    // since it's used lazily.
    if (src$es5$$.isArray(locales)) {
        locales = locales.concat();
    }

    src$es5$$.defineProperty(this, '_locale', {value: this._resolveLocale(locales)});
    src$es5$$.defineProperty(this, '_options', {value: {
        style: this._resolveStyle(options.style),
        units: this._isValidUnits(options.units) && options.units
    }});

    src$es5$$.defineProperty(this, '_locales', {value: locales});
    src$es5$$.defineProperty(this, '_fields', {value: this._findFields(this._locale)});
    src$es5$$.defineProperty(this, '_messages', {value: src$es5$$.objCreate(null)});

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var relativeFormat = this;
    this.format = function format(date, options) {
        return relativeFormat._format(date, options);
    };
}

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(RelativeFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(RelativeFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlRelativeFormat is missing a ' +
            '`locale` property value'
        );
    }

    RelativeFormat.__localeData__[data.locale.toLowerCase()] = data;

    // Add data to IntlMessageFormat.
    intl$messageformat$$["default"].__addLocaleData(data);
}});

// Define public `defaultLocale` property which can be set by the developer, or
// it will be set when the first RelativeFormat instance is created by
// leveraging the resolved locale from `Intl`.
src$es5$$.defineProperty(RelativeFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

// Define public `thresholds` property which can be set by the developer, and
// defaults to relative time thresholds from moment.js.
src$es5$$.defineProperty(RelativeFormat, 'thresholds', {
    enumerable: true,

    value: {
        second: 45,  // seconds to minute
        minute: 45,  // minutes to hour
        hour  : 22,  // hours to day
        day   : 26,  // days to month
        month : 11   // months to year
    }
});

RelativeFormat.prototype.resolvedOptions = function () {
    return {
        locale: this._locale,
        style : this._options.style,
        units : this._options.units
    };
};

RelativeFormat.prototype._compileMessage = function (units) {
    // `this._locales` is the original set of locales the user specified to the
    // constructor, while `this._locale` is the resolved root locale.
    var locales        = this._locales;
    var resolvedLocale = this._locale;

    var field        = this._fields[units];
    var relativeTime = field.relativeTime;
    var future       = '';
    var past         = '';
    var i;

    for (i in relativeTime.future) {
        if (relativeTime.future.hasOwnProperty(i)) {
            future += ' ' + i + ' {' +
                relativeTime.future[i].replace('{0}', '#') + '}';
        }
    }

    for (i in relativeTime.past) {
        if (relativeTime.past.hasOwnProperty(i)) {
            past += ' ' + i + ' {' +
                relativeTime.past[i].replace('{0}', '#') + '}';
        }
    }

    var message = '{when, select, future {{0, plural, ' + future + '}}' +
                                 'past {{0, plural, ' + past + '}}}';

    // Create the synthetic IntlMessageFormat instance using the original
    // locales value specified by the user when constructing the the parent
    // IntlRelativeFormat instance.
    return new intl$messageformat$$["default"](message, locales);
};

RelativeFormat.prototype._getMessage = function (units) {
    var messages = this._messages;

    // Create a new synthetic message based on the locale data from CLDR.
    if (!messages[units]) {
        messages[units] = this._compileMessage(units);
    }

    return messages[units];
};

RelativeFormat.prototype._getRelativeUnits = function (diff, units) {
    var field = this._fields[units];

    if (field.relative) {
        return field.relative[diff];
    }
};

RelativeFormat.prototype._findFields = function (locale) {
    var localeData = RelativeFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find `fields` to return.
    while (data) {
        if (data.fields) {
            return data.fields;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlRelativeFormat is missing `fields` for :' +
        locale
    );
};

RelativeFormat.prototype._format = function (date, options) {
    var now = options && options.now !== undefined ? options.now : src$es5$$.dateNow();

    if (date === undefined) {
        date = now;
    }

    // Determine if the `date` and optional `now` values are valid, and throw a
    // similar error to what `Intl.DateTimeFormat#format()` would throw.
    if (!isFinite(now)) {
        throw new RangeError(
            'The `now` option provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    if (!isFinite(date)) {
        throw new RangeError(
            'The date value provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    var diffReport  = src$diff$$["default"](now, date);
    var units       = this._options.units || this._selectUnits(diffReport);
    var diffInUnits = diffReport[units];

    if (this._options.style !== 'numeric') {
        var relativeUnits = this._getRelativeUnits(diffInUnits, units);
        if (relativeUnits) {
            return relativeUnits;
        }
    }

    return this._getMessage(units).format({
        '0' : Math.abs(diffInUnits),
        when: diffInUnits < 0 ? 'past' : 'future'
    });
};

RelativeFormat.prototype._isValidUnits = function (units) {
    if (!units || src$es5$$.arrIndexOf.call(FIELDS, units) >= 0) {
        return true;
    }

    if (typeof units === 'string') {
        var suggestion = /s$/.test(units) && units.substr(0, units.length - 1);
        if (suggestion && src$es5$$.arrIndexOf.call(FIELDS, suggestion) >= 0) {
            throw new Error(
                '"' + units + '" is not a valid IntlRelativeFormat `units` ' +
                'value, did you mean: ' + suggestion
            );
        }
    }

    throw new Error(
        '"' + units + '" is not a valid IntlRelativeFormat `units` value, it ' +
        'must be one of: "' + FIELDS.join('", "') + '"'
    );
};

RelativeFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(RelativeFormat.defaultLocale);

    var localeData = RelativeFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlRelativeFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};

RelativeFormat.prototype._resolveStyle = function (style) {
    // Default to "best fit" style.
    if (!style) {
        return STYLES[0];
    }

    if (src$es5$$.arrIndexOf.call(STYLES, style) >= 0) {
        return style;
    }

    throw new Error(
        '"' + style + '" is not a valid IntlRelativeFormat `style` value, it ' +
        'must be one of: "' + STYLES.join('", "') + '"'
    );
};

RelativeFormat.prototype._selectUnits = function (diffReport) {
    var i, l, units;

    for (i = 0, l = FIELDS.length; i < l; i += 1) {
        units = FIELDS[i];

        if (Math.abs(diffReport[units]) < RelativeFormat.thresholds[units]) {
            break;
        }
    }

    return units;
};


},{"./diff":21,"./es5":23,"intl-messageformat":10}],21:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";

var round = Math.round;

function daysToYears(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    return days * 400 / 146097;
}

exports["default"] = function (from, to) {
    // Convert to ms timestamps.
    from = +from;
    to   = +to;

    var millisecond = round(to - from),
        second      = round(millisecond / 1000),
        minute      = round(second / 60),
        hour        = round(minute / 60),
        day         = round(hour / 24),
        week        = round(day / 7);

    var rawYears = daysToYears(day),
        month    = round(rawYears * 12),
        year     = round(rawYears);

    return {
        millisecond: millisecond,
        second     : second,
        minute     : minute,
        hour       : hour,
        day        : day,
        week       : week,
        month      : month,
        year       : year
    };
};


},{}],22:[function(require,module,exports){
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"fields":{"year":{"displayName":"year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"one":"in {0} year","other":"in {0} years"},"past":{"one":"{0} year ago","other":"{0} years ago"}}},"month":{"displayName":"month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"one":"in {0} month","other":"in {0} months"},"past":{"one":"{0} month ago","other":"{0} months ago"}}},"day":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"hour":{"displayName":"hour","relativeTime":{"future":{"one":"in {0} hour","other":"in {0} hours"},"past":{"one":"{0} hour ago","other":"{0} hours ago"}}},"minute":{"displayName":"minute","relativeTime":{"future":{"one":"in {0} minute","other":"in {0} minutes"},"past":{"one":"{0} minute ago","other":"{0} minutes ago"}}},"second":{"displayName":"second","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} second","other":"in {0} seconds"},"past":{"one":"{0} second ago","other":"{0} seconds ago"}}}}};


},{}],23:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var hop = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

var arrIndexOf = Array.prototype.indexOf || function (search, fromIndex) {
    /*jshint validthis:true */
    var arr = this;
    if (!arr.length) {
        return -1;
    }

    for (var i = fromIndex || 0, max = arr.length; i < max; i++) {
        if (arr[i] === search) {
            return i;
        }
    }

    return -1;
};

var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

var dateNow = Date.now || function () {
    return new Date().getTime();
};
exports.defineProperty = defineProperty, exports.objCreate = objCreate, exports.arrIndexOf = arrIndexOf, exports.isArray = isArray, exports.dateNow = dateNow;


},{}],24:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./core":20,"./en":22,"dup":15}],25:[function(require,module,exports){
(function (global){
// Expose `IntlPolyfill` as global to add locale data into runtime later on.
global.IntlPolyfill = require('./lib/core.js');

// Require all locale data for `Intl`. This module will be
// ignored when bundling for the browser with Browserify/Webpack.
require('./locale-data/complete.js');

// hack to export the polyfill as global Intl if needed
if (!global.Intl) {
    global.Intl = global.IntlPolyfill;
    global.IntlPolyfill.__applyLocaleSensitivePrototypes();
}

// providing an idiomatic api for the nodejs version of this module
module.exports = global.IntlPolyfill;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./lib/core.js":26,"./locale-data/complete.js":2}],26:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

var jsx = function () {
  var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
  return function createRawReactElement(type, props, key, children) {
    var defaultProps = type && type.defaultProps;
    var childrenLength = arguments.length - 3;

    if (!props && childrenLength !== 0) {
      props = {};
    }

    if (props && defaultProps) {
      for (var propName in defaultProps) {
        if (props[propName] === void 0) {
          props[propName] = defaultProps[propName];
        }
      }
    } else if (!props) {
      props = defaultProps || {};
    }

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 3];
      }

      props.children = childArray;
    }

    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key === undefined ? null : '' + key,
      ref: null,
      props: props,
      _owner: null
    };
  };
}();

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            return step("next", value);
          }, function (err) {
            return step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineEnumerableProperties = function (obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }

  return obj;
};

var defaults = function (obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
};

var defineProperty$1 = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var _instanceof = function (left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
};

var interopRequireDefault = function (obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
};

var interopRequireWildcard = function (obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj.default = obj;
    return newObj;
  }
};

var newArrowCheck = function (innerThis, boundThis) {
  if (innerThis !== boundThis) {
    throw new TypeError("Cannot instantiate an arrow function");
  }
};

var objectDestructuringEmpty = function (obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var selfGlobal = typeof global === "undefined" ? self : global;

var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var slicedToArrayLoose = function (arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];

    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);

      if (i && _arr.length === i) break;
    }

    return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
};

var taggedTemplateLiteral = function (strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
};

var taggedTemplateLiteralLoose = function (strings, raw) {
  strings.raw = raw;
  return strings;
};

var temporalRef = function (val, name, undef) {
  if (val === undef) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  } else {
    return val;
  }
};

var temporalUndefined = {};

var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};



var babelHelpers$1 = Object.freeze({
  jsx: jsx,
  asyncToGenerator: asyncToGenerator,
  classCallCheck: classCallCheck,
  createClass: createClass,
  defineEnumerableProperties: defineEnumerableProperties,
  defaults: defaults,
  defineProperty: defineProperty$1,
  get: get,
  inherits: inherits,
  interopRequireDefault: interopRequireDefault,
  interopRequireWildcard: interopRequireWildcard,
  newArrowCheck: newArrowCheck,
  objectDestructuringEmpty: objectDestructuringEmpty,
  objectWithoutProperties: objectWithoutProperties,
  possibleConstructorReturn: possibleConstructorReturn,
  selfGlobal: selfGlobal,
  set: set,
  slicedToArray: slicedToArray,
  slicedToArrayLoose: slicedToArrayLoose,
  taggedTemplateLiteral: taggedTemplateLiteral,
  taggedTemplateLiteralLoose: taggedTemplateLiteralLoose,
  temporalRef: temporalRef,
  temporalUndefined: temporalUndefined,
  toArray: toArray,
  toConsumableArray: toConsumableArray,
  typeof: _typeof,
  extends: _extends,
  instanceof: _instanceof
});

var realDefineProp = function () {
    var sentinel = function sentinel() {};
    try {
        Object.defineProperty(sentinel, 'a', {
            get: function get() {
                return 1;
            }
        });
        Object.defineProperty(sentinel, 'prototype', { writable: false });
        return sentinel.a === 1 && sentinel.prototype instanceof Object;
    } catch (e) {
        return false;
    }
}();

// Need a workaround for getters in ES3
var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

// We use this a lot (and need it for proto-less objects)
var hop = Object.prototype.hasOwnProperty;

// Naive defineProperty for compatibility
var defineProperty = realDefineProp ? Object.defineProperty : function (obj, name, desc) {
    if ('get' in desc && obj.__defineGetter__) obj.__defineGetter__(name, desc.get);else if (!hop.call(obj, name) || 'value' in desc) obj[name] = desc.value;
};

// Array.prototype.indexOf, as good as we need it to be
var arrIndexOf = Array.prototype.indexOf || function (search) {
    /*jshint validthis:true */
    var t = this;
    if (!t.length) return -1;

    for (var i = arguments[1] || 0, max = t.length; i < max; i++) {
        if (t[i] === search) return i;
    }

    return -1;
};

// Create an object with the specified prototype (2nd arg required for Record)
var objCreate = Object.create || function (proto, props) {
    var obj = void 0;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (var k in props) {
        if (hop.call(props, k)) defineProperty(obj, k, props[k]);
    }

    return obj;
};

// Snapshot some (hopefully still) native built-ins
var arrSlice = Array.prototype.slice;
var arrConcat = Array.prototype.concat;
var arrPush = Array.prototype.push;
var arrJoin = Array.prototype.join;
var arrShift = Array.prototype.shift;

// Naive Function.prototype.bind for compatibility
var fnBind = Function.prototype.bind || function (thisObj) {
    var fn = this,
        args = arrSlice.call(arguments, 1);

    // All our (presently) bound functions have either 1 or 0 arguments. By returning
    // different function signatures, we can pass some tests in ES3 environments
    if (fn.length === 1) {
        return function () {
            return fn.apply(thisObj, arrConcat.call(args, arrSlice.call(arguments)));
        };
    }
    return function () {
        return fn.apply(thisObj, arrConcat.call(args, arrSlice.call(arguments)));
    };
};

// Object housing internal properties for constructors
var internals = objCreate(null);

// Keep internal properties internal
var secret = Math.random();

// Helper functions
// ================

/**
 * A function to deal with the inaccuracy of calculating log10 in pre-ES6
 * JavaScript environments. Math.log(num) / Math.LN10 was responsible for
 * causing issue #62.
 */
function log10Floor(n) {
    // ES6 provides the more accurate Math.log10
    if (typeof Math.log10 === 'function') return Math.floor(Math.log10(n));

    var x = Math.round(Math.log(n) * Math.LOG10E);
    return x - (Number('1e' + x) > n);
}

/**
 * A map that doesn't contain Object in its prototype chain
 */
function Record(obj) {
    // Copy only own properties over unless this object is already a Record instance
    for (var k in obj) {
        if (obj instanceof Record || hop.call(obj, k)) defineProperty(this, k, { value: obj[k], enumerable: true, writable: true, configurable: true });
    }
}
Record.prototype = objCreate(null);

/**
 * An ordered list
 */
function List() {
    defineProperty(this, 'length', { writable: true, value: 0 });

    if (arguments.length) arrPush.apply(this, arrSlice.call(arguments));
}
List.prototype = objCreate(null);

/**
 * Constructs a regular expression to restore tainted RegExp properties
 */
function createRegExpRestore() {
    if (internals.disableRegExpRestore) {
        return function () {/* no-op */};
    }

    var regExpCache = {
        lastMatch: RegExp.lastMatch || '',
        leftContext: RegExp.leftContext,
        multiline: RegExp.multiline,
        input: RegExp.input
    },
        has = false;

    // Create a snapshot of all the 'captured' properties
    for (var i = 1; i <= 9; i++) {
        has = (regExpCache['$' + i] = RegExp['$' + i]) || has;
    }return function () {
        // Now we've snapshotted some properties, escape the lastMatch string
        var esc = /[.?*+^$[\]\\(){}|-]/g,
            lm = regExpCache.lastMatch.replace(esc, '\\$&'),
            reg = new List();

        // If any of the captured strings were non-empty, iterate over them all
        if (has) {
            for (var _i = 1; _i <= 9; _i++) {
                var m = regExpCache['$' + _i];

                // If it's empty, add an empty capturing group
                if (!m) lm = '()' + lm;

                // Else find the string in lm and escape & wrap it to capture it
                else {
                        m = m.replace(esc, '\\$&');
                        lm = lm.replace(m, '(' + m + ')');
                    }

                // Push it to the reg and chop lm to make sure further groups come after
                arrPush.call(reg, lm.slice(0, lm.indexOf('(') + 1));
                lm = lm.slice(lm.indexOf('(') + 1);
            }
        }

        var exprStr = arrJoin.call(reg, '') + lm;

        // Shorten the regex by replacing each part of the expression with a match
        // for a string of that exact length.  This is safe for the type of
        // expressions generated above, because the expression matches the whole
        // match string, so we know each group and each segment between capturing
        // groups can be matched by its length alone.
        exprStr = exprStr.replace(/(\\\(|\\\)|[^()])+/g, function (match) {
            return '[\\s\\S]{' + match.replace('\\', '').length + '}';
        });

        // Create the regular expression that will reconstruct the RegExp properties
        var expr = new RegExp(exprStr, regExpCache.multiline ? 'gm' : 'g');

        // Set the lastIndex of the generated expression to ensure that the match
        // is found in the correct index.
        expr.lastIndex = regExpCache.leftContext.length;

        expr.exec(regExpCache.input);
    };
}

/**
 * Mimics ES5's abstract ToObject() function
 */
function toObject(arg) {
    if (arg === null) throw new TypeError('Cannot convert null or undefined to object');

    if ((typeof arg === 'undefined' ? 'undefined' : babelHelpers$1['typeof'](arg)) === 'object') return arg;
    return Object(arg);
}

function toNumber(arg) {
    if (typeof arg === 'number') return arg;
    return Number(arg);
}

function toInteger(arg) {
    var number = toNumber(arg);
    if (isNaN(number)) return 0;
    if (number === +0 || number === -0 || number === +Infinity || number === -Infinity) return number;
    if (number < 0) return Math.floor(Math.abs(number)) * -1;
    return Math.floor(Math.abs(number));
}

function toLength(arg) {
    var len = toInteger(arg);
    if (len <= 0) return 0;
    if (len === Infinity) return Math.pow(2, 53) - 1;
    return Math.min(len, Math.pow(2, 53) - 1);
}

/**
 * Returns "internal" properties for an object
 */
function getInternalProperties(obj) {
    if (hop.call(obj, '__getInternalProperties')) return obj.__getInternalProperties(secret);

    return objCreate(null);
}

/**
* Defines regular expressions for various operations related to the BCP 47 syntax,
* as defined at http://tools.ietf.org/html/bcp47#section-2.1
*/

// extlang       = 3ALPHA              ; selected ISO 639 codes
//                 *2("-" 3ALPHA)      ; permanently reserved
var extlang = '[a-z]{3}(?:-[a-z]{3}){0,2}';

// language      = 2*3ALPHA            ; shortest ISO 639 code
//                 ["-" extlang]       ; sometimes followed by
//                                     ; extended language subtags
//               / 4ALPHA              ; or reserved for future use
//               / 5*8ALPHA            ; or registered language subtag
var language = '(?:[a-z]{2,3}(?:-' + extlang + ')?|[a-z]{4}|[a-z]{5,8})';

// script        = 4ALPHA              ; ISO 15924 code
var script = '[a-z]{4}';

// region        = 2ALPHA              ; ISO 3166-1 code
//               / 3DIGIT              ; UN M.49 code
var region = '(?:[a-z]{2}|\\d{3})';

// variant       = 5*8alphanum         ; registered variants
//               / (DIGIT 3alphanum)
var variant = '(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3})';

//                                     ; Single alphanumerics
//                                     ; "x" reserved for private use
// singleton     = DIGIT               ; 0 - 9
//               / %x41-57             ; A - W
//               / %x59-5A             ; Y - Z
//               / %x61-77             ; a - w
//               / %x79-7A             ; y - z
var singleton = '[0-9a-wy-z]';

// extension     = singleton 1*("-" (2*8alphanum))
var extension = singleton + '(?:-[a-z0-9]{2,8})+';

// privateuse    = "x" 1*("-" (1*8alphanum))
var privateuse = 'x(?:-[a-z0-9]{1,8})+';

// irregular     = "en-GB-oed"         ; irregular tags do not match
//               / "i-ami"             ; the 'langtag' production and
//               / "i-bnn"             ; would not otherwise be
//               / "i-default"         ; considered 'well-formed'
//               / "i-enochian"        ; These tags are all valid,
//               / "i-hak"             ; but most are deprecated
//               / "i-klingon"         ; in favor of more modern
//               / "i-lux"             ; subtags or subtag
//               / "i-mingo"           ; combination
//               / "i-navajo"
//               / "i-pwn"
//               / "i-tao"
//               / "i-tay"
//               / "i-tsu"
//               / "sgn-BE-FR"
//               / "sgn-BE-NL"
//               / "sgn-CH-DE"
var irregular = '(?:en-GB-oed' + '|i-(?:ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu)' + '|sgn-(?:BE-FR|BE-NL|CH-DE))';

// regular       = "art-lojban"        ; these tags match the 'langtag'
//               / "cel-gaulish"       ; production, but their subtags
//               / "no-bok"            ; are not extended language
//               / "no-nyn"            ; or variant subtags: their meaning
//               / "zh-guoyu"          ; is defined by their registration
//               / "zh-hakka"          ; and all of these are deprecated
//               / "zh-min"            ; in favor of a more modern
//               / "zh-min-nan"        ; subtag or sequence of subtags
//               / "zh-xiang"
var regular = '(?:art-lojban|cel-gaulish|no-bok|no-nyn' + '|zh-(?:guoyu|hakka|min|min-nan|xiang))';

// grandfathered = irregular           ; non-redundant tags registered
//               / regular             ; during the RFC 3066 era
var grandfathered = '(?:' + irregular + '|' + regular + ')';

// langtag       = language
//                 ["-" script]
//                 ["-" region]
//                 *("-" variant)
//                 *("-" extension)
//                 ["-" privateuse]
var langtag = language + '(?:-' + script + ')?(?:-' + region + ')?(?:-' + variant + ')*(?:-' + extension + ')*(?:-' + privateuse + ')?';

// Language-Tag  = langtag             ; normal language tags
//               / privateuse          ; private use tag
//               / grandfathered       ; grandfathered tags
var expBCP47Syntax = RegExp('^(?:' + langtag + '|' + privateuse + '|' + grandfathered + ')$', 'i');

// Match duplicate variants in a language tag
var expVariantDupes = RegExp('^(?!x).*?-(' + variant + ')-(?:\\w{4,8}-(?!x-))*\\1\\b', 'i');

// Match duplicate singletons in a language tag (except in private use)
var expSingletonDupes = RegExp('^(?!x).*?-(' + singleton + ')-(?:\\w+-(?!x-))*\\1\\b', 'i');

// Match all extension sequences
var expExtSequences = RegExp('-' + extension, 'ig');

// Default locale is the first-added locale data for us
var defaultLocale = void 0;
function setDefaultLocale(locale) {
    defaultLocale = locale;
}

// IANA Subtag Registry redundant tag and subtag maps
var redundantTags = {
    tags: {
        "art-lojban": "jbo",
        "i-ami": "ami",
        "i-bnn": "bnn",
        "i-hak": "hak",
        "i-klingon": "tlh",
        "i-lux": "lb",
        "i-navajo": "nv",
        "i-pwn": "pwn",
        "i-tao": "tao",
        "i-tay": "tay",
        "i-tsu": "tsu",
        "no-bok": "nb",
        "no-nyn": "nn",
        "sgn-BE-FR": "sfb",
        "sgn-BE-NL": "vgt",
        "sgn-CH-DE": "sgg",
        "zh-guoyu": "cmn",
        "zh-hakka": "hak",
        "zh-min-nan": "nan",
        "zh-xiang": "hsn",
        "sgn-BR": "bzs",
        "sgn-CO": "csn",
        "sgn-DE": "gsg",
        "sgn-DK": "dsl",
        "sgn-ES": "ssp",
        "sgn-FR": "fsl",
        "sgn-GB": "bfi",
        "sgn-GR": "gss",
        "sgn-IE": "isg",
        "sgn-IT": "ise",
        "sgn-JP": "jsl",
        "sgn-MX": "mfs",
        "sgn-NI": "ncs",
        "sgn-NL": "dse",
        "sgn-NO": "nsl",
        "sgn-PT": "psr",
        "sgn-SE": "swl",
        "sgn-US": "ase",
        "sgn-ZA": "sfs",
        "zh-cmn": "cmn",
        "zh-cmn-Hans": "cmn-Hans",
        "zh-cmn-Hant": "cmn-Hant",
        "zh-gan": "gan",
        "zh-wuu": "wuu",
        "zh-yue": "yue"
    },
    subtags: {
        BU: "MM",
        DD: "DE",
        FX: "FR",
        TP: "TL",
        YD: "YE",
        ZR: "CD",
        heploc: "alalc97",
        'in': "id",
        iw: "he",
        ji: "yi",
        jw: "jv",
        mo: "ro",
        ayx: "nun",
        bjd: "drl",
        ccq: "rki",
        cjr: "mom",
        cka: "cmr",
        cmk: "xch",
        drh: "khk",
        drw: "prs",
        gav: "dev",
        hrr: "jal",
        ibi: "opa",
        kgh: "kml",
        lcq: "ppr",
        mst: "mry",
        myt: "mry",
        sca: "hle",
        tie: "ras",
        tkk: "twm",
        tlw: "weo",
        tnf: "prs",
        ybd: "rki",
        yma: "lrr"
    },
    extLang: {
        aao: ["aao", "ar"],
        abh: ["abh", "ar"],
        abv: ["abv", "ar"],
        acm: ["acm", "ar"],
        acq: ["acq", "ar"],
        acw: ["acw", "ar"],
        acx: ["acx", "ar"],
        acy: ["acy", "ar"],
        adf: ["adf", "ar"],
        ads: ["ads", "sgn"],
        aeb: ["aeb", "ar"],
        aec: ["aec", "ar"],
        aed: ["aed", "sgn"],
        aen: ["aen", "sgn"],
        afb: ["afb", "ar"],
        afg: ["afg", "sgn"],
        ajp: ["ajp", "ar"],
        apc: ["apc", "ar"],
        apd: ["apd", "ar"],
        arb: ["arb", "ar"],
        arq: ["arq", "ar"],
        ars: ["ars", "ar"],
        ary: ["ary", "ar"],
        arz: ["arz", "ar"],
        ase: ["ase", "sgn"],
        asf: ["asf", "sgn"],
        asp: ["asp", "sgn"],
        asq: ["asq", "sgn"],
        asw: ["asw", "sgn"],
        auz: ["auz", "ar"],
        avl: ["avl", "ar"],
        ayh: ["ayh", "ar"],
        ayl: ["ayl", "ar"],
        ayn: ["ayn", "ar"],
        ayp: ["ayp", "ar"],
        bbz: ["bbz", "ar"],
        bfi: ["bfi", "sgn"],
        bfk: ["bfk", "sgn"],
        bjn: ["bjn", "ms"],
        bog: ["bog", "sgn"],
        bqn: ["bqn", "sgn"],
        bqy: ["bqy", "sgn"],
        btj: ["btj", "ms"],
        bve: ["bve", "ms"],
        bvl: ["bvl", "sgn"],
        bvu: ["bvu", "ms"],
        bzs: ["bzs", "sgn"],
        cdo: ["cdo", "zh"],
        cds: ["cds", "sgn"],
        cjy: ["cjy", "zh"],
        cmn: ["cmn", "zh"],
        coa: ["coa", "ms"],
        cpx: ["cpx", "zh"],
        csc: ["csc", "sgn"],
        csd: ["csd", "sgn"],
        cse: ["cse", "sgn"],
        csf: ["csf", "sgn"],
        csg: ["csg", "sgn"],
        csl: ["csl", "sgn"],
        csn: ["csn", "sgn"],
        csq: ["csq", "sgn"],
        csr: ["csr", "sgn"],
        czh: ["czh", "zh"],
        czo: ["czo", "zh"],
        doq: ["doq", "sgn"],
        dse: ["dse", "sgn"],
        dsl: ["dsl", "sgn"],
        dup: ["dup", "ms"],
        ecs: ["ecs", "sgn"],
        esl: ["esl", "sgn"],
        esn: ["esn", "sgn"],
        eso: ["eso", "sgn"],
        eth: ["eth", "sgn"],
        fcs: ["fcs", "sgn"],
        fse: ["fse", "sgn"],
        fsl: ["fsl", "sgn"],
        fss: ["fss", "sgn"],
        gan: ["gan", "zh"],
        gds: ["gds", "sgn"],
        gom: ["gom", "kok"],
        gse: ["gse", "sgn"],
        gsg: ["gsg", "sgn"],
        gsm: ["gsm", "sgn"],
        gss: ["gss", "sgn"],
        gus: ["gus", "sgn"],
        hab: ["hab", "sgn"],
        haf: ["haf", "sgn"],
        hak: ["hak", "zh"],
        hds: ["hds", "sgn"],
        hji: ["hji", "ms"],
        hks: ["hks", "sgn"],
        hos: ["hos", "sgn"],
        hps: ["hps", "sgn"],
        hsh: ["hsh", "sgn"],
        hsl: ["hsl", "sgn"],
        hsn: ["hsn", "zh"],
        icl: ["icl", "sgn"],
        ils: ["ils", "sgn"],
        inl: ["inl", "sgn"],
        ins: ["ins", "sgn"],
        ise: ["ise", "sgn"],
        isg: ["isg", "sgn"],
        isr: ["isr", "sgn"],
        jak: ["jak", "ms"],
        jax: ["jax", "ms"],
        jcs: ["jcs", "sgn"],
        jhs: ["jhs", "sgn"],
        jls: ["jls", "sgn"],
        jos: ["jos", "sgn"],
        jsl: ["jsl", "sgn"],
        jus: ["jus", "sgn"],
        kgi: ["kgi", "sgn"],
        knn: ["knn", "kok"],
        kvb: ["kvb", "ms"],
        kvk: ["kvk", "sgn"],
        kvr: ["kvr", "ms"],
        kxd: ["kxd", "ms"],
        lbs: ["lbs", "sgn"],
        lce: ["lce", "ms"],
        lcf: ["lcf", "ms"],
        liw: ["liw", "ms"],
        lls: ["lls", "sgn"],
        lsg: ["lsg", "sgn"],
        lsl: ["lsl", "sgn"],
        lso: ["lso", "sgn"],
        lsp: ["lsp", "sgn"],
        lst: ["lst", "sgn"],
        lsy: ["lsy", "sgn"],
        ltg: ["ltg", "lv"],
        lvs: ["lvs", "lv"],
        lzh: ["lzh", "zh"],
        max: ["max", "ms"],
        mdl: ["mdl", "sgn"],
        meo: ["meo", "ms"],
        mfa: ["mfa", "ms"],
        mfb: ["mfb", "ms"],
        mfs: ["mfs", "sgn"],
        min: ["min", "ms"],
        mnp: ["mnp", "zh"],
        mqg: ["mqg", "ms"],
        mre: ["mre", "sgn"],
        msd: ["msd", "sgn"],
        msi: ["msi", "ms"],
        msr: ["msr", "sgn"],
        mui: ["mui", "ms"],
        mzc: ["mzc", "sgn"],
        mzg: ["mzg", "sgn"],
        mzy: ["mzy", "sgn"],
        nan: ["nan", "zh"],
        nbs: ["nbs", "sgn"],
        ncs: ["ncs", "sgn"],
        nsi: ["nsi", "sgn"],
        nsl: ["nsl", "sgn"],
        nsp: ["nsp", "sgn"],
        nsr: ["nsr", "sgn"],
        nzs: ["nzs", "sgn"],
        okl: ["okl", "sgn"],
        orn: ["orn", "ms"],
        ors: ["ors", "ms"],
        pel: ["pel", "ms"],
        pga: ["pga", "ar"],
        pks: ["pks", "sgn"],
        prl: ["prl", "sgn"],
        prz: ["prz", "sgn"],
        psc: ["psc", "sgn"],
        psd: ["psd", "sgn"],
        pse: ["pse", "ms"],
        psg: ["psg", "sgn"],
        psl: ["psl", "sgn"],
        pso: ["pso", "sgn"],
        psp: ["psp", "sgn"],
        psr: ["psr", "sgn"],
        pys: ["pys", "sgn"],
        rms: ["rms", "sgn"],
        rsi: ["rsi", "sgn"],
        rsl: ["rsl", "sgn"],
        sdl: ["sdl", "sgn"],
        sfb: ["sfb", "sgn"],
        sfs: ["sfs", "sgn"],
        sgg: ["sgg", "sgn"],
        sgx: ["sgx", "sgn"],
        shu: ["shu", "ar"],
        slf: ["slf", "sgn"],
        sls: ["sls", "sgn"],
        sqk: ["sqk", "sgn"],
        sqs: ["sqs", "sgn"],
        ssh: ["ssh", "ar"],
        ssp: ["ssp", "sgn"],
        ssr: ["ssr", "sgn"],
        svk: ["svk", "sgn"],
        swc: ["swc", "sw"],
        swh: ["swh", "sw"],
        swl: ["swl", "sgn"],
        syy: ["syy", "sgn"],
        tmw: ["tmw", "ms"],
        tse: ["tse", "sgn"],
        tsm: ["tsm", "sgn"],
        tsq: ["tsq", "sgn"],
        tss: ["tss", "sgn"],
        tsy: ["tsy", "sgn"],
        tza: ["tza", "sgn"],
        ugn: ["ugn", "sgn"],
        ugy: ["ugy", "sgn"],
        ukl: ["ukl", "sgn"],
        uks: ["uks", "sgn"],
        urk: ["urk", "ms"],
        uzn: ["uzn", "uz"],
        uzs: ["uzs", "uz"],
        vgt: ["vgt", "sgn"],
        vkk: ["vkk", "ms"],
        vkt: ["vkt", "ms"],
        vsi: ["vsi", "sgn"],
        vsl: ["vsl", "sgn"],
        vsv: ["vsv", "sgn"],
        wuu: ["wuu", "zh"],
        xki: ["xki", "sgn"],
        xml: ["xml", "sgn"],
        xmm: ["xmm", "ms"],
        xms: ["xms", "sgn"],
        yds: ["yds", "sgn"],
        ysl: ["ysl", "sgn"],
        yue: ["yue", "zh"],
        zib: ["zib", "sgn"],
        zlm: ["zlm", "ms"],
        zmi: ["zmi", "ms"],
        zsl: ["zsl", "sgn"],
        zsm: ["zsm", "ms"]
    }
};

/**
 * Convert only a-z to uppercase as per section 6.1 of the spec
 */
function toLatinUpperCase(str) {
    var i = str.length;

    while (i--) {
        var ch = str.charAt(i);

        if (ch >= "a" && ch <= "z") str = str.slice(0, i) + ch.toUpperCase() + str.slice(i + 1);
    }

    return str;
}

/**
 * The IsStructurallyValidLanguageTag abstract operation verifies that the locale
 * argument (which must be a String value)
 *
 * - represents a well-formed BCP 47 language tag as specified in RFC 5646 section
 *   2.1, or successor,
 * - does not include duplicate variant subtags, and
 * - does not include duplicate singleton subtags.
 *
 * The abstract operation returns true if locale can be generated from the ABNF
 * grammar in section 2.1 of the RFC, starting with Language-Tag, and does not
 * contain duplicate variant or singleton subtags (other than as a private use
 * subtag). It returns false otherwise. Terminal value characters in the grammar are
 * interpreted as the Unicode equivalents of the ASCII octet values given.
 */
function /* 6.2.2 */IsStructurallyValidLanguageTag(locale) {
    // represents a well-formed BCP 47 language tag as specified in RFC 5646
    if (!expBCP47Syntax.test(locale)) return false;

    // does not include duplicate variant subtags, and
    if (expVariantDupes.test(locale)) return false;

    // does not include duplicate singleton subtags.
    if (expSingletonDupes.test(locale)) return false;

    return true;
}

/**
 * The CanonicalizeLanguageTag abstract operation returns the canonical and case-
 * regularized form of the locale argument (which must be a String value that is
 * a structurally valid BCP 47 language tag as verified by the
 * IsStructurallyValidLanguageTag abstract operation). It takes the steps
 * specified in RFC 5646 section 4.5, or successor, to bring the language tag
 * into canonical form, and to regularize the case of the subtags, but does not
 * take the steps to bring a language tag into “extlang form” and to reorder
 * variant subtags.

 * The specifications for extensions to BCP 47 language tags, such as RFC 6067,
 * may include canonicalization rules for the extension subtag sequences they
 * define that go beyond the canonicalization rules of RFC 5646 section 4.5.
 * Implementations are allowed, but not required, to apply these additional rules.
 */
function /* 6.2.3 */CanonicalizeLanguageTag(locale) {
    var match = void 0,
        parts = void 0;

    // A language tag is in 'canonical form' when the tag is well-formed
    // according to the rules in Sections 2.1 and 2.2

    // Section 2.1 says all subtags use lowercase...
    locale = locale.toLowerCase();

    // ...with 2 exceptions: 'two-letter and four-letter subtags that neither
    // appear at the start of the tag nor occur after singletons.  Such two-letter
    // subtags are all uppercase (as in the tags "en-CA-x-ca" or "sgn-BE-FR") and
    // four-letter subtags are titlecase (as in the tag "az-Latn-x-latn").
    parts = locale.split('-');
    for (var i = 1, max = parts.length; i < max; i++) {
        // Two-letter subtags are all uppercase
        if (parts[i].length === 2) parts[i] = parts[i].toUpperCase();

        // Four-letter subtags are titlecase
        else if (parts[i].length === 4) parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);

            // Is it a singleton?
            else if (parts[i].length === 1 && parts[i] !== 'x') break;
    }
    locale = arrJoin.call(parts, '-');

    // The steps laid out in RFC 5646 section 4.5 are as follows:

    // 1.  Extension sequences are ordered into case-insensitive ASCII order
    //     by singleton subtag.
    if ((match = locale.match(expExtSequences)) && match.length > 1) {
        // The built-in sort() sorts by ASCII order, so use that
        match.sort();

        // Replace all extensions with the joined, sorted array
        locale = locale.replace(RegExp('(?:' + expExtSequences.source + ')+', 'i'), arrJoin.call(match, ''));
    }

    // 2.  Redundant or grandfathered tags are replaced by their 'Preferred-
    //     Value', if there is one.
    if (hop.call(redundantTags.tags, locale)) locale = redundantTags.tags[locale];

    // 3.  Subtags are replaced by their 'Preferred-Value', if there is one.
    //     For extlangs, the original primary language subtag is also
    //     replaced if there is a primary language subtag in the 'Preferred-
    //     Value'.
    parts = locale.split('-');

    for (var _i = 1, _max = parts.length; _i < _max; _i++) {
        if (hop.call(redundantTags.subtags, parts[_i])) parts[_i] = redundantTags.subtags[parts[_i]];else if (hop.call(redundantTags.extLang, parts[_i])) {
            parts[_i] = redundantTags.extLang[parts[_i]][0];

            // For extlang tags, the prefix needs to be removed if it is redundant
            if (_i === 1 && redundantTags.extLang[parts[1]][1] === parts[0]) {
                parts = arrSlice.call(parts, _i++);
                _max -= 1;
            }
        }
    }

    return arrJoin.call(parts, '-');
}

/**
 * The DefaultLocale abstract operation returns a String value representing the
 * structurally valid (6.2.2) and canonicalized (6.2.3) BCP 47 language tag for the
 * host environment’s current locale.
 */
function /* 6.2.4 */DefaultLocale() {
    return defaultLocale;
}

// Sect 6.3 Currency Codes
// =======================

var expCurrencyCode = /^[A-Z]{3}$/;

/**
 * The IsWellFormedCurrencyCode abstract operation verifies that the currency argument
 * (after conversion to a String value) represents a well-formed 3-letter ISO currency
 * code. The following steps are taken:
 */
function /* 6.3.1 */IsWellFormedCurrencyCode(currency) {
    // 1. Let `c` be ToString(currency)
    var c = String(currency);

    // 2. Let `normalized` be the result of mapping c to upper case as described
    //    in 6.1.
    var normalized = toLatinUpperCase(c);

    // 3. If the string length of normalized is not 3, return false.
    // 4. If normalized contains any character that is not in the range "A" to "Z"
    //    (U+0041 to U+005A), return false.
    if (expCurrencyCode.test(normalized) === false) return false;

    // 5. Return true
    return true;
}

var expUnicodeExSeq = /-u(?:-[0-9a-z]{2,8})+/gi; // See `extension` below

function /* 9.2.1 */CanonicalizeLocaleList(locales) {
    // The abstract operation CanonicalizeLocaleList takes the following steps:

    // 1. If locales is undefined, then a. Return a new empty List
    if (locales === undefined) return new List();

    // 2. Let seen be a new empty List.
    var seen = new List();

    // 3. If locales is a String value, then
    //    a. Let locales be a new array created as if by the expression new
    //    Array(locales) where Array is the standard built-in constructor with
    //    that name and locales is the value of locales.
    locales = typeof locales === 'string' ? [locales] : locales;

    // 4. Let O be ToObject(locales).
    var O = toObject(locales);

    // 5. Let lenValue be the result of calling the [[Get]] internal method of
    //    O with the argument "length".
    // 6. Let len be ToUint32(lenValue).
    var len = toLength(O.length);

    // 7. Let k be 0.
    var k = 0;

    // 8. Repeat, while k < len
    while (k < len) {
        // a. Let Pk be ToString(k).
        var Pk = String(k);

        // b. Let kPresent be the result of calling the [[HasProperty]] internal
        //    method of O with argument Pk.
        var kPresent = Pk in O;

        // c. If kPresent is true, then
        if (kPresent) {
            // i. Let kValue be the result of calling the [[Get]] internal
            //     method of O with argument Pk.
            var kValue = O[Pk];

            // ii. If the type of kValue is not String or Object, then throw a
            //     TypeError exception.
            if (kValue === null || typeof kValue !== 'string' && (typeof kValue === "undefined" ? "undefined" : babelHelpers$1["typeof"](kValue)) !== 'object') throw new TypeError('String or Object type expected');

            // iii. Let tag be ToString(kValue).
            var tag = String(kValue);

            // iv. If the result of calling the abstract operation
            //     IsStructurallyValidLanguageTag (defined in 6.2.2), passing tag as
            //     the argument, is false, then throw a RangeError exception.
            if (!IsStructurallyValidLanguageTag(tag)) throw new RangeError("'" + tag + "' is not a structurally valid language tag");

            // v. Let tag be the result of calling the abstract operation
            //    CanonicalizeLanguageTag (defined in 6.2.3), passing tag as the
            //    argument.
            tag = CanonicalizeLanguageTag(tag);

            // vi. If tag is not an element of seen, then append tag as the last
            //     element of seen.
            if (arrIndexOf.call(seen, tag) === -1) arrPush.call(seen, tag);
        }

        // d. Increase k by 1.
        k++;
    }

    // 9. Return seen.
    return seen;
}

/**
 * The BestAvailableLocale abstract operation compares the provided argument
 * locale, which must be a String value with a structurally valid and
 * canonicalized BCP 47 language tag, against the locales in availableLocales and
 * returns either the longest non-empty prefix of locale that is an element of
 * availableLocales, or undefined if there is no such element. It uses the
 * fallback mechanism of RFC 4647, section 3.4. The following steps are taken:
 */
function /* 9.2.2 */BestAvailableLocale(availableLocales, locale) {
    // 1. Let candidate be locale
    var candidate = locale;

    // 2. Repeat
    while (candidate) {
        // a. If availableLocales contains an element equal to candidate, then return
        // candidate.
        if (arrIndexOf.call(availableLocales, candidate) > -1) return candidate;

        // b. Let pos be the character index of the last occurrence of "-"
        // (U+002D) within candidate. If that character does not occur, return
        // undefined.
        var pos = candidate.lastIndexOf('-');

        if (pos < 0) return;

        // c. If pos ≥ 2 and the character "-" occurs at index pos-2 of candidate,
        //    then decrease pos by 2.
        if (pos >= 2 && candidate.charAt(pos - 2) === '-') pos -= 2;

        // d. Let candidate be the substring of candidate from position 0, inclusive,
        //    to position pos, exclusive.
        candidate = candidate.substring(0, pos);
    }
}

/**
 * The LookupMatcher abstract operation compares requestedLocales, which must be
 * a List as returned by CanonicalizeLocaleList, against the locales in
 * availableLocales and determines the best available language to meet the
 * request. The following steps are taken:
 */
function /* 9.2.3 */LookupMatcher(availableLocales, requestedLocales) {
    // 1. Let i be 0.
    var i = 0;

    // 2. Let len be the number of elements in requestedLocales.
    var len = requestedLocales.length;

    // 3. Let availableLocale be undefined.
    var availableLocale = void 0;

    var locale = void 0,
        noExtensionsLocale = void 0;

    // 4. Repeat while i < len and availableLocale is undefined:
    while (i < len && !availableLocale) {
        // a. Let locale be the element of requestedLocales at 0-origined list
        //    position i.
        locale = requestedLocales[i];

        // b. Let noExtensionsLocale be the String value that is locale with all
        //    Unicode locale extension sequences removed.
        noExtensionsLocale = String(locale).replace(expUnicodeExSeq, '');

        // c. Let availableLocale be the result of calling the
        //    BestAvailableLocale abstract operation (defined in 9.2.2) with
        //    arguments availableLocales and noExtensionsLocale.
        availableLocale = BestAvailableLocale(availableLocales, noExtensionsLocale);

        // d. Increase i by 1.
        i++;
    }

    // 5. Let result be a new Record.
    var result = new Record();

    // 6. If availableLocale is not undefined, then
    if (availableLocale !== undefined) {
        // a. Set result.[[locale]] to availableLocale.
        result['[[locale]]'] = availableLocale;

        // b. If locale and noExtensionsLocale are not the same String value, then
        if (String(locale) !== String(noExtensionsLocale)) {
            // i. Let extension be the String value consisting of the first
            //    substring of locale that is a Unicode locale extension sequence.
            var extension = locale.match(expUnicodeExSeq)[0];

            // ii. Let extensionIndex be the character position of the initial
            //     "-" of the first Unicode locale extension sequence within locale.
            var extensionIndex = locale.indexOf('-u-');

            // iii. Set result.[[extension]] to extension.
            result['[[extension]]'] = extension;

            // iv. Set result.[[extensionIndex]] to extensionIndex.
            result['[[extensionIndex]]'] = extensionIndex;
        }
    }
    // 7. Else
    else
        // a. Set result.[[locale]] to the value returned by the DefaultLocale abstract
        //    operation (defined in 6.2.4).
        result['[[locale]]'] = DefaultLocale();

    // 8. Return result
    return result;
}

/**
 * The BestFitMatcher abstract operation compares requestedLocales, which must be
 * a List as returned by CanonicalizeLocaleList, against the locales in
 * availableLocales and determines the best available language to meet the
 * request. The algorithm is implementation dependent, but should produce results
 * that a typical user of the requested locales would perceive as at least as
 * good as those produced by the LookupMatcher abstract operation. Options
 * specified through Unicode locale extension sequences must be ignored by the
 * algorithm. Information about such subsequences is returned separately.
 * The abstract operation returns a record with a [[locale]] field, whose value
 * is the language tag of the selected locale, which must be an element of
 * availableLocales. If the language tag of the request locale that led to the
 * selected locale contained a Unicode locale extension sequence, then the
 * returned record also contains an [[extension]] field whose value is the first
 * Unicode locale extension sequence, and an [[extensionIndex]] field whose value
 * is the index of the first Unicode locale extension sequence within the request
 * locale language tag.
 */
function /* 9.2.4 */BestFitMatcher(availableLocales, requestedLocales) {
    return LookupMatcher(availableLocales, requestedLocales);
}

/**
 * The ResolveLocale abstract operation compares a BCP 47 language priority list
 * requestedLocales against the locales in availableLocales and determines the
 * best available language to meet the request. availableLocales and
 * requestedLocales must be provided as List values, options as a Record.
 */
function /* 9.2.5 */ResolveLocale(availableLocales, requestedLocales, options, relevantExtensionKeys, localeData) {
    if (availableLocales.length === 0) {
        throw new ReferenceError('No locale data has been provided for this object yet.');
    }

    // The following steps are taken:
    // 1. Let matcher be the value of options.[[localeMatcher]].
    var matcher = options['[[localeMatcher]]'];

    var r = void 0;

    // 2. If matcher is "lookup", then
    if (matcher === 'lookup')
        // a. Let r be the result of calling the LookupMatcher abstract operation
        //    (defined in 9.2.3) with arguments availableLocales and
        //    requestedLocales.
        r = LookupMatcher(availableLocales, requestedLocales);

        // 3. Else
    else
        // a. Let r be the result of calling the BestFitMatcher abstract
        //    operation (defined in 9.2.4) with arguments availableLocales and
        //    requestedLocales.
        r = BestFitMatcher(availableLocales, requestedLocales);

    // 4. Let foundLocale be the value of r.[[locale]].
    var foundLocale = r['[[locale]]'];

    var extensionSubtags = void 0,
        extensionSubtagsLength = void 0;

    // 5. If r has an [[extension]] field, then
    if (hop.call(r, '[[extension]]')) {
        // a. Let extension be the value of r.[[extension]].
        var extension = r['[[extension]]'];
        // b. Let split be the standard built-in function object defined in ES5,
        //    15.5.4.14.
        var split = String.prototype.split;
        // c. Let extensionSubtags be the result of calling the [[Call]] internal
        //    method of split with extension as the this value and an argument
        //    list containing the single item "-".
        extensionSubtags = split.call(extension, '-');
        // d. Let extensionSubtagsLength be the result of calling the [[Get]]
        //    internal method of extensionSubtags with argument "length".
        extensionSubtagsLength = extensionSubtags.length;
    }

    // 6. Let result be a new Record.
    var result = new Record();

    // 7. Set result.[[dataLocale]] to foundLocale.
    result['[[dataLocale]]'] = foundLocale;

    // 8. Let supportedExtension be "-u".
    var supportedExtension = '-u';
    // 9. Let i be 0.
    var i = 0;
    // 10. Let len be the result of calling the [[Get]] internal method of
    //     relevantExtensionKeys with argument "length".
    var len = relevantExtensionKeys.length;

    // 11 Repeat while i < len:
    while (i < len) {
        // a. Let key be the result of calling the [[Get]] internal method of
        //    relevantExtensionKeys with argument ToString(i).
        var key = relevantExtensionKeys[i];
        // b. Let foundLocaleData be the result of calling the [[Get]] internal
        //    method of localeData with the argument foundLocale.
        var foundLocaleData = localeData[foundLocale];
        // c. Let keyLocaleData be the result of calling the [[Get]] internal
        //    method of foundLocaleData with the argument key.
        var keyLocaleData = foundLocaleData[key];
        // d. Let value be the result of calling the [[Get]] internal method of
        //    keyLocaleData with argument "0".
        var value = keyLocaleData['0'];
        // e. Let supportedExtensionAddition be "".
        var supportedExtensionAddition = '';
        // f. Let indexOf be the standard built-in function object defined in
        //    ES5, 15.4.4.14.
        var indexOf = arrIndexOf;

        // g. If extensionSubtags is not undefined, then
        if (extensionSubtags !== undefined) {
            // i. Let keyPos be the result of calling the [[Call]] internal
            //    method of indexOf with extensionSubtags as the this value and
            // an argument list containing the single item key.
            var keyPos = indexOf.call(extensionSubtags, key);

            // ii. If keyPos ≠ -1, then
            if (keyPos !== -1) {
                // 1. If keyPos + 1 < extensionSubtagsLength and the length of the
                //    result of calling the [[Get]] internal method of
                //    extensionSubtags with argument ToString(keyPos +1) is greater
                //    than 2, then
                if (keyPos + 1 < extensionSubtagsLength && extensionSubtags[keyPos + 1].length > 2) {
                    // a. Let requestedValue be the result of calling the [[Get]]
                    //    internal method of extensionSubtags with argument
                    //    ToString(keyPos + 1).
                    var requestedValue = extensionSubtags[keyPos + 1];
                    // b. Let valuePos be the result of calling the [[Call]]
                    //    internal method of indexOf with keyLocaleData as the
                    //    this value and an argument list containing the single
                    //    item requestedValue.
                    var valuePos = indexOf.call(keyLocaleData, requestedValue);

                    // c. If valuePos ≠ -1, then
                    if (valuePos !== -1) {
                        // i. Let value be requestedValue.
                        value = requestedValue,
                        // ii. Let supportedExtensionAddition be the
                        //     concatenation of "-", key, "-", and value.
                        supportedExtensionAddition = '-' + key + '-' + value;
                    }
                }
                // 2. Else
                else {
                        // a. Let valuePos be the result of calling the [[Call]]
                        // internal method of indexOf with keyLocaleData as the this
                        // value and an argument list containing the single item
                        // "true".
                        var _valuePos = indexOf(keyLocaleData, 'true');

                        // b. If valuePos ≠ -1, then
                        if (_valuePos !== -1)
                            // i. Let value be "true".
                            value = 'true';
                    }
            }
        }
        // h. If options has a field [[<key>]], then
        if (hop.call(options, '[[' + key + ']]')) {
            // i. Let optionsValue be the value of options.[[<key>]].
            var optionsValue = options['[[' + key + ']]'];

            // ii. If the result of calling the [[Call]] internal method of indexOf
            //     with keyLocaleData as the this value and an argument list
            //     containing the single item optionsValue is not -1, then
            if (indexOf.call(keyLocaleData, optionsValue) !== -1) {
                // 1. If optionsValue is not equal to value, then
                if (optionsValue !== value) {
                    // a. Let value be optionsValue.
                    value = optionsValue;
                    // b. Let supportedExtensionAddition be "".
                    supportedExtensionAddition = '';
                }
            }
        }
        // i. Set result.[[<key>]] to value.
        result['[[' + key + ']]'] = value;

        // j. Append supportedExtensionAddition to supportedExtension.
        supportedExtension += supportedExtensionAddition;

        // k. Increase i by 1.
        i++;
    }
    // 12. If the length of supportedExtension is greater than 2, then
    if (supportedExtension.length > 2) {
        // a.
        var privateIndex = foundLocale.indexOf("-x-");
        // b.
        if (privateIndex === -1) {
            // i.
            foundLocale = foundLocale + supportedExtension;
        }
        // c.
        else {
                // i.
                var preExtension = foundLocale.substring(0, privateIndex);
                // ii.
                var postExtension = foundLocale.substring(privateIndex);
                // iii.
                foundLocale = preExtension + supportedExtension + postExtension;
            }
        // d. asserting - skipping
        // e.
        foundLocale = CanonicalizeLanguageTag(foundLocale);
    }
    // 13. Set result.[[locale]] to foundLocale.
    result['[[locale]]'] = foundLocale;

    // 14. Return result.
    return result;
}

/**
 * The LookupSupportedLocales abstract operation returns the subset of the
 * provided BCP 47 language priority list requestedLocales for which
 * availableLocales has a matching locale when using the BCP 47 Lookup algorithm.
 * Locales appear in the same order in the returned list as in requestedLocales.
 * The following steps are taken:
 */
function /* 9.2.6 */LookupSupportedLocales(availableLocales, requestedLocales) {
    // 1. Let len be the number of elements in requestedLocales.
    var len = requestedLocales.length;
    // 2. Let subset be a new empty List.
    var subset = new List();
    // 3. Let k be 0.
    var k = 0;

    // 4. Repeat while k < len
    while (k < len) {
        // a. Let locale be the element of requestedLocales at 0-origined list
        //    position k.
        var locale = requestedLocales[k];
        // b. Let noExtensionsLocale be the String value that is locale with all
        //    Unicode locale extension sequences removed.
        var noExtensionsLocale = String(locale).replace(expUnicodeExSeq, '');
        // c. Let availableLocale be the result of calling the
        //    BestAvailableLocale abstract operation (defined in 9.2.2) with
        //    arguments availableLocales and noExtensionsLocale.
        var availableLocale = BestAvailableLocale(availableLocales, noExtensionsLocale);

        // d. If availableLocale is not undefined, then append locale to the end of
        //    subset.
        if (availableLocale !== undefined) arrPush.call(subset, locale);

        // e. Increment k by 1.
        k++;
    }

    // 5. Let subsetArray be a new Array object whose elements are the same
    //    values in the same order as the elements of subset.
    var subsetArray = arrSlice.call(subset);

    // 6. Return subsetArray.
    return subsetArray;
}

/**
 * The BestFitSupportedLocales abstract operation returns the subset of the
 * provided BCP 47 language priority list requestedLocales for which
 * availableLocales has a matching locale when using the Best Fit Matcher
 * algorithm. Locales appear in the same order in the returned list as in
 * requestedLocales. The steps taken are implementation dependent.
 */
function /*9.2.7 */BestFitSupportedLocales(availableLocales, requestedLocales) {
    // ###TODO: implement this function as described by the specification###
    return LookupSupportedLocales(availableLocales, requestedLocales);
}

/**
 * The SupportedLocales abstract operation returns the subset of the provided BCP
 * 47 language priority list requestedLocales for which availableLocales has a
 * matching locale. Two algorithms are available to match the locales: the Lookup
 * algorithm described in RFC 4647 section 3.4, and an implementation dependent
 * best-fit algorithm. Locales appear in the same order in the returned list as
 * in requestedLocales. The following steps are taken:
 */
function /*9.2.8 */SupportedLocales(availableLocales, requestedLocales, options) {
    var matcher = void 0,
        subset = void 0;

    // 1. If options is not undefined, then
    if (options !== undefined) {
        // a. Let options be ToObject(options).
        options = new Record(toObject(options));
        // b. Let matcher be the result of calling the [[Get]] internal method of
        //    options with argument "localeMatcher".
        matcher = options.localeMatcher;

        // c. If matcher is not undefined, then
        if (matcher !== undefined) {
            // i. Let matcher be ToString(matcher).
            matcher = String(matcher);

            // ii. If matcher is not "lookup" or "best fit", then throw a RangeError
            //     exception.
            if (matcher !== 'lookup' && matcher !== 'best fit') throw new RangeError('matcher should be "lookup" or "best fit"');
        }
    }
    // 2. If matcher is undefined or "best fit", then
    if (matcher === undefined || matcher === 'best fit')
        // a. Let subset be the result of calling the BestFitSupportedLocales
        //    abstract operation (defined in 9.2.7) with arguments
        //    availableLocales and requestedLocales.
        subset = BestFitSupportedLocales(availableLocales, requestedLocales);
        // 3. Else
    else
        // a. Let subset be the result of calling the LookupSupportedLocales
        //    abstract operation (defined in 9.2.6) with arguments
        //    availableLocales and requestedLocales.
        subset = LookupSupportedLocales(availableLocales, requestedLocales);

    // 4. For each named own property name P of subset,
    for (var P in subset) {
        if (!hop.call(subset, P)) continue;

        // a. Let desc be the result of calling the [[GetOwnProperty]] internal
        //    method of subset with P.
        // b. Set desc.[[Writable]] to false.
        // c. Set desc.[[Configurable]] to false.
        // d. Call the [[DefineOwnProperty]] internal method of subset with P, desc,
        //    and true as arguments.
        defineProperty(subset, P, {
            writable: false, configurable: false, value: subset[P]
        });
    }
    // "Freeze" the array so no new elements can be added
    defineProperty(subset, 'length', { writable: false });

    // 5. Return subset
    return subset;
}

/**
 * The GetOption abstract operation extracts the value of the property named
 * property from the provided options object, converts it to the required type,
 * checks whether it is one of a List of allowed values, and fills in a fallback
 * value if necessary.
 */
function /*9.2.9 */GetOption(options, property, type, values, fallback) {
    // 1. Let value be the result of calling the [[Get]] internal method of
    //    options with argument property.
    var value = options[property];

    // 2. If value is not undefined, then
    if (value !== undefined) {
        // a. Assert: type is "boolean" or "string".
        // b. If type is "boolean", then let value be ToBoolean(value).
        // c. If type is "string", then let value be ToString(value).
        value = type === 'boolean' ? Boolean(value) : type === 'string' ? String(value) : value;

        // d. If values is not undefined, then
        if (values !== undefined) {
            // i. If values does not contain an element equal to value, then throw a
            //    RangeError exception.
            if (arrIndexOf.call(values, value) === -1) throw new RangeError("'" + value + "' is not an allowed value for `" + property + '`');
        }

        // e. Return value.
        return value;
    }
    // Else return fallback.
    return fallback;
}

/**
 * The GetNumberOption abstract operation extracts a property value from the
 * provided options object, converts it to a Number value, checks whether it is
 * in the allowed range, and fills in a fallback value if necessary.
 */
function /* 9.2.10 */GetNumberOption(options, property, minimum, maximum, fallback) {
    // 1. Let value be the result of calling the [[Get]] internal method of
    //    options with argument property.
    var value = options[property];

    // 2. If value is not undefined, then
    if (value !== undefined) {
        // a. Let value be ToNumber(value).
        value = Number(value);

        // b. If value is NaN or less than minimum or greater than maximum, throw a
        //    RangeError exception.
        if (isNaN(value) || value < minimum || value > maximum) throw new RangeError('Value is not a number or outside accepted range');

        // c. Return floor(value).
        return Math.floor(value);
    }
    // 3. Else return fallback.
    return fallback;
}

// 8 The Intl Object
var Intl = {};

// 8.2 Function Properties of the Intl Object

// 8.2.1
// @spec[tc39/ecma402/master/spec/intl.html]
// @clause[sec-intl.getcanonicallocales]
function getCanonicalLocales(locales) {
    // 1. Let ll be ? CanonicalizeLocaleList(locales).
    var ll = CanonicalizeLocaleList(locales);
    // 2. Return CreateArrayFromList(ll).
    {
        var result = [];

        var len = ll.length;
        var k = 0;

        while (k < len) {
            result[k] = ll[k];
            k++;
        }
        return result;
    }
}

Object.defineProperty(Intl, 'getCanonicalLocales', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: getCanonicalLocales
});

// Currency minor units output from get-4217 grunt task, formatted
var currencyMinorUnits = {
    BHD: 3, BYR: 0, XOF: 0, BIF: 0, XAF: 0, CLF: 4, CLP: 0, KMF: 0, DJF: 0,
    XPF: 0, GNF: 0, ISK: 0, IQD: 3, JPY: 0, JOD: 3, KRW: 0, KWD: 3, LYD: 3,
    OMR: 3, PYG: 0, RWF: 0, TND: 3, UGX: 0, UYI: 0, VUV: 0, VND: 0
};

// Define the NumberFormat constructor internally so it cannot be tainted
function NumberFormatConstructor() {
    var locales = arguments[0];
    var options = arguments[1];

    if (!this || this === Intl) {
        return new Intl.NumberFormat(locales, options);
    }

    return InitializeNumberFormat(toObject(this), locales, options);
}

defineProperty(Intl, 'NumberFormat', {
    configurable: true,
    writable: true,
    value: NumberFormatConstructor
});

// Must explicitly set prototypes as unwritable
defineProperty(Intl.NumberFormat, 'prototype', {
    writable: false
});

/**
 * The abstract operation InitializeNumberFormat accepts the arguments
 * numberFormat (which must be an object), locales, and options. It initializes
 * numberFormat as a NumberFormat object.
 */
function /*11.1.1.1 */InitializeNumberFormat(numberFormat, locales, options) {
    // This will be a internal properties object if we're not already initialized
    var internal = getInternalProperties(numberFormat);

    // Create an object whose props can be used to restore the values of RegExp props
    var regexpRestore = createRegExpRestore();

    // 1. If numberFormat has an [[initializedIntlObject]] internal property with
    // value true, throw a TypeError exception.
    if (internal['[[initializedIntlObject]]'] === true) throw new TypeError('`this` object has already been initialized as an Intl object');

    // Need this to access the `internal` object
    defineProperty(numberFormat, '__getInternalProperties', {
        value: function value() {
            // NOTE: Non-standard, for internal use only
            if (arguments[0] === secret) return internal;
        }
    });

    // 2. Set the [[initializedIntlObject]] internal property of numberFormat to true.
    internal['[[initializedIntlObject]]'] = true;

    // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
    //    abstract operation (defined in 9.2.1) with argument locales.
    var requestedLocales = CanonicalizeLocaleList(locales);

    // 4. If options is undefined, then
    if (options === undefined)
        // a. Let options be the result of creating a new object as if by the
        // expression new Object() where Object is the standard built-in constructor
        // with that name.
        options = {};

        // 5. Else
    else
        // a. Let options be ToObject(options).
        options = toObject(options);

    // 6. Let opt be a new Record.
    var opt = new Record(),


    // 7. Let matcher be the result of calling the GetOption abstract operation
    //    (defined in 9.2.9) with the arguments options, "localeMatcher", "string",
    //    a List containing the two String values "lookup" and "best fit", and
    //    "best fit".
    matcher = GetOption(options, 'localeMatcher', 'string', new List('lookup', 'best fit'), 'best fit');

    // 8. Set opt.[[localeMatcher]] to matcher.
    opt['[[localeMatcher]]'] = matcher;

    // 9. Let NumberFormat be the standard built-in object that is the initial value
    //    of Intl.NumberFormat.
    // 10. Let localeData be the value of the [[localeData]] internal property of
    //     NumberFormat.
    var localeData = internals.NumberFormat['[[localeData]]'];

    // 11. Let r be the result of calling the ResolveLocale abstract operation
    //     (defined in 9.2.5) with the [[availableLocales]] internal property of
    //     NumberFormat, requestedLocales, opt, the [[relevantExtensionKeys]]
    //     internal property of NumberFormat, and localeData.
    var r = ResolveLocale(internals.NumberFormat['[[availableLocales]]'], requestedLocales, opt, internals.NumberFormat['[[relevantExtensionKeys]]'], localeData);

    // 12. Set the [[locale]] internal property of numberFormat to the value of
    //     r.[[locale]].
    internal['[[locale]]'] = r['[[locale]]'];

    // 13. Set the [[numberingSystem]] internal property of numberFormat to the value
    //     of r.[[nu]].
    internal['[[numberingSystem]]'] = r['[[nu]]'];

    // The specification doesn't tell us to do this, but it's helpful later on
    internal['[[dataLocale]]'] = r['[[dataLocale]]'];

    // 14. Let dataLocale be the value of r.[[dataLocale]].
    var dataLocale = r['[[dataLocale]]'];

    // 15. Let s be the result of calling the GetOption abstract operation with the
    //     arguments options, "style", "string", a List containing the three String
    //     values "decimal", "percent", and "currency", and "decimal".
    var s = GetOption(options, 'style', 'string', new List('decimal', 'percent', 'currency'), 'decimal');

    // 16. Set the [[style]] internal property of numberFormat to s.
    internal['[[style]]'] = s;

    // 17. Let c be the result of calling the GetOption abstract operation with the
    //     arguments options, "currency", "string", undefined, and undefined.
    var c = GetOption(options, 'currency', 'string');

    // 18. If c is not undefined and the result of calling the
    //     IsWellFormedCurrencyCode abstract operation (defined in 6.3.1) with
    //     argument c is false, then throw a RangeError exception.
    if (c !== undefined && !IsWellFormedCurrencyCode(c)) throw new RangeError("'" + c + "' is not a valid currency code");

    // 19. If s is "currency" and c is undefined, throw a TypeError exception.
    if (s === 'currency' && c === undefined) throw new TypeError('Currency code is required when style is currency');

    var cDigits = void 0;

    // 20. If s is "currency", then
    if (s === 'currency') {
        // a. Let c be the result of converting c to upper case as specified in 6.1.
        c = c.toUpperCase();

        // b. Set the [[currency]] internal property of numberFormat to c.
        internal['[[currency]]'] = c;

        // c. Let cDigits be the result of calling the CurrencyDigits abstract
        //    operation (defined below) with argument c.
        cDigits = CurrencyDigits(c);
    }

    // 21. Let cd be the result of calling the GetOption abstract operation with the
    //     arguments options, "currencyDisplay", "string", a List containing the
    //     three String values "code", "symbol", and "name", and "symbol".
    var cd = GetOption(options, 'currencyDisplay', 'string', new List('code', 'symbol', 'name'), 'symbol');

    // 22. If s is "currency", then set the [[currencyDisplay]] internal property of
    //     numberFormat to cd.
    if (s === 'currency') internal['[[currencyDisplay]]'] = cd;

    // 23. Let mnid be the result of calling the GetNumberOption abstract operation
    //     (defined in 9.2.10) with arguments options, "minimumIntegerDigits", 1, 21,
    //     and 1.
    var mnid = GetNumberOption(options, 'minimumIntegerDigits', 1, 21, 1);

    // 24. Set the [[minimumIntegerDigits]] internal property of numberFormat to mnid.
    internal['[[minimumIntegerDigits]]'] = mnid;

    // 25. If s is "currency", then let mnfdDefault be cDigits; else let mnfdDefault
    //     be 0.
    var mnfdDefault = s === 'currency' ? cDigits : 0;

    // 26. Let mnfd be the result of calling the GetNumberOption abstract operation
    //     with arguments options, "minimumFractionDigits", 0, 20, and mnfdDefault.
    var mnfd = GetNumberOption(options, 'minimumFractionDigits', 0, 20, mnfdDefault);

    // 27. Set the [[minimumFractionDigits]] internal property of numberFormat to mnfd.
    internal['[[minimumFractionDigits]]'] = mnfd;

    // 28. If s is "currency", then let mxfdDefault be max(mnfd, cDigits); else if s
    //     is "percent", then let mxfdDefault be max(mnfd, 0); else let mxfdDefault
    //     be max(mnfd, 3).
    var mxfdDefault = s === 'currency' ? Math.max(mnfd, cDigits) : s === 'percent' ? Math.max(mnfd, 0) : Math.max(mnfd, 3);

    // 29. Let mxfd be the result of calling the GetNumberOption abstract operation
    //     with arguments options, "maximumFractionDigits", mnfd, 20, and mxfdDefault.
    var mxfd = GetNumberOption(options, 'maximumFractionDigits', mnfd, 20, mxfdDefault);

    // 30. Set the [[maximumFractionDigits]] internal property of numberFormat to mxfd.
    internal['[[maximumFractionDigits]]'] = mxfd;

    // 31. Let mnsd be the result of calling the [[Get]] internal method of options
    //     with argument "minimumSignificantDigits".
    var mnsd = options.minimumSignificantDigits;

    // 32. Let mxsd be the result of calling the [[Get]] internal method of options
    //     with argument "maximumSignificantDigits".
    var mxsd = options.maximumSignificantDigits;

    // 33. If mnsd is not undefined or mxsd is not undefined, then:
    if (mnsd !== undefined || mxsd !== undefined) {
        // a. Let mnsd be the result of calling the GetNumberOption abstract
        //    operation with arguments options, "minimumSignificantDigits", 1, 21,
        //    and 1.
        mnsd = GetNumberOption(options, 'minimumSignificantDigits', 1, 21, 1);

        // b. Let mxsd be the result of calling the GetNumberOption abstract
        //     operation with arguments options, "maximumSignificantDigits", mnsd,
        //     21, and 21.
        mxsd = GetNumberOption(options, 'maximumSignificantDigits', mnsd, 21, 21);

        // c. Set the [[minimumSignificantDigits]] internal property of numberFormat
        //    to mnsd, and the [[maximumSignificantDigits]] internal property of
        //    numberFormat to mxsd.
        internal['[[minimumSignificantDigits]]'] = mnsd;
        internal['[[maximumSignificantDigits]]'] = mxsd;
    }
    // 34. Let g be the result of calling the GetOption abstract operation with the
    //     arguments options, "useGrouping", "boolean", undefined, and true.
    var g = GetOption(options, 'useGrouping', 'boolean', undefined, true);

    // 35. Set the [[useGrouping]] internal property of numberFormat to g.
    internal['[[useGrouping]]'] = g;

    // 36. Let dataLocaleData be the result of calling the [[Get]] internal method of
    //     localeData with argument dataLocale.
    var dataLocaleData = localeData[dataLocale];

    // 37. Let patterns be the result of calling the [[Get]] internal method of
    //     dataLocaleData with argument "patterns".
    var patterns = dataLocaleData.patterns;

    // 38. Assert: patterns is an object (see 11.2.3)

    // 39. Let stylePatterns be the result of calling the [[Get]] internal method of
    //     patterns with argument s.
    var stylePatterns = patterns[s];

    // 40. Set the [[positivePattern]] internal property of numberFormat to the
    //     result of calling the [[Get]] internal method of stylePatterns with the
    //     argument "positivePattern".
    internal['[[positivePattern]]'] = stylePatterns.positivePattern;

    // 41. Set the [[negativePattern]] internal property of numberFormat to the
    //     result of calling the [[Get]] internal method of stylePatterns with the
    //     argument "negativePattern".
    internal['[[negativePattern]]'] = stylePatterns.negativePattern;

    // 42. Set the [[boundFormat]] internal property of numberFormat to undefined.
    internal['[[boundFormat]]'] = undefined;

    // 43. Set the [[initializedNumberFormat]] internal property of numberFormat to
    //     true.
    internal['[[initializedNumberFormat]]'] = true;

    // In ES3, we need to pre-bind the format() function
    if (es3) numberFormat.format = GetFormatNumber.call(numberFormat);

    // Restore the RegExp properties
    regexpRestore();

    // Return the newly initialised object
    return numberFormat;
}

function CurrencyDigits(currency) {
    // When the CurrencyDigits abstract operation is called with an argument currency
    // (which must be an upper case String value), the following steps are taken:

    // 1. If the ISO 4217 currency and funds code list contains currency as an
    // alphabetic code, then return the minor unit value corresponding to the
    // currency from the list; else return 2.
    return currencyMinorUnits[currency] !== undefined ? currencyMinorUnits[currency] : 2;
}

/* 11.2.3 */internals.NumberFormat = {
    '[[availableLocales]]': [],
    '[[relevantExtensionKeys]]': ['nu'],
    '[[localeData]]': {}
};

/**
 * When the supportedLocalesOf method of Intl.NumberFormat is called, the
 * following steps are taken:
 */
/* 11.2.2 */
defineProperty(Intl.NumberFormat, 'supportedLocalesOf', {
    configurable: true,
    writable: true,
    value: fnBind.call(function (locales) {
        // Bound functions only have the `this` value altered if being used as a constructor,
        // this lets us imitate a native function that has no constructor
        if (!hop.call(this, '[[availableLocales]]')) throw new TypeError('supportedLocalesOf() is not a constructor');

        // Create an object whose props can be used to restore the values of RegExp props
        var regexpRestore = createRegExpRestore(),


        // 1. If options is not provided, then let options be undefined.
        options = arguments[1],


        // 2. Let availableLocales be the value of the [[availableLocales]] internal
        //    property of the standard built-in object that is the initial value of
        //    Intl.NumberFormat.

        availableLocales = this['[[availableLocales]]'],


        // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
        //    abstract operation (defined in 9.2.1) with argument locales.
        requestedLocales = CanonicalizeLocaleList(locales);

        // Restore the RegExp properties
        regexpRestore();

        // 4. Return the result of calling the SupportedLocales abstract operation
        //    (defined in 9.2.8) with arguments availableLocales, requestedLocales,
        //    and options.
        return SupportedLocales(availableLocales, requestedLocales, options);
    }, internals.NumberFormat)
});

/**
 * This named accessor property returns a function that formats a number
 * according to the effective locale and the formatting options of this
 * NumberFormat object.
 */
/* 11.3.2 */defineProperty(Intl.NumberFormat.prototype, 'format', {
    configurable: true,
    get: GetFormatNumber
});

function GetFormatNumber() {
    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

    // Satisfy test 11.3_b
    if (!internal || !internal['[[initializedNumberFormat]]']) throw new TypeError('`this` value for format() is not an initialized Intl.NumberFormat object.');

    // The value of the [[Get]] attribute is a function that takes the following
    // steps:

    // 1. If the [[boundFormat]] internal property of this NumberFormat object
    //    is undefined, then:
    if (internal['[[boundFormat]]'] === undefined) {
        // a. Let F be a Function object, with internal properties set as
        //    specified for built-in functions in ES5, 15, or successor, and the
        //    length property set to 1, that takes the argument value and
        //    performs the following steps:
        var F = function F(value) {
            // i. If value is not provided, then let value be undefined.
            // ii. Let x be ToNumber(value).
            // iii. Return the result of calling the FormatNumber abstract
            //      operation (defined below) with arguments this and x.
            return FormatNumber(this, /* x = */Number(value));
        };

        // b. Let bind be the standard built-in function object defined in ES5,
        //    15.3.4.5.
        // c. Let bf be the result of calling the [[Call]] internal method of
        //    bind with F as the this value and an argument list containing
        //    the single item this.
        var bf = fnBind.call(F, this);

        // d. Set the [[boundFormat]] internal property of this NumberFormat
        //    object to bf.
        internal['[[boundFormat]]'] = bf;
    }
    // Return the value of the [[boundFormat]] internal property of this
    // NumberFormat object.
    return internal['[[boundFormat]]'];
}

function formatToParts() {
    var value = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);
    if (!internal || !internal['[[initializedNumberFormat]]']) throw new TypeError('`this` value for formatToParts() is not an initialized Intl.NumberFormat object.');

    var x = Number(value);
    return FormatNumberToParts(this, x);
}

Object.defineProperty(Intl.NumberFormat.prototype, 'formatToParts', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: formatToParts
});

/*
 * @spec[stasm/ecma402/number-format-to-parts/spec/numberformat.html]
 * @clause[sec-formatnumbertoparts]
 */
function FormatNumberToParts(numberFormat, x) {
    // 1. Let parts be ? PartitionNumberPattern(numberFormat, x).
    var parts = PartitionNumberPattern(numberFormat, x);
    // 2. Let result be ArrayCreate(0).
    var result = [];
    // 3. Let n be 0.
    var n = 0;
    // 4. For each part in parts, do:
    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        // a. Let O be ObjectCreate(%ObjectPrototype%).
        var O = {};
        // a. Perform ? CreateDataPropertyOrThrow(O, "type", part.[[type]]).
        O.type = part['[[type]]'];
        // a. Perform ? CreateDataPropertyOrThrow(O, "value", part.[[value]]).
        O.value = part['[[value]]'];
        // a. Perform ? CreateDataPropertyOrThrow(result, ? ToString(n), O).
        result[n] = O;
        // a. Increment n by 1.
        n += 1;
    }
    // 5. Return result.
    return result;
}

/*
 * @spec[stasm/ecma402/number-format-to-parts/spec/numberformat.html]
 * @clause[sec-partitionnumberpattern]
 */
function PartitionNumberPattern(numberFormat, x) {

    var internal = getInternalProperties(numberFormat),
        locale = internal['[[dataLocale]]'],
        nums = internal['[[numberingSystem]]'],
        data = internals.NumberFormat['[[localeData]]'][locale],
        ild = data.symbols[nums] || data.symbols.latn,
        pattern = void 0;

    // 1. If x is not NaN and x < 0, then:
    if (!isNaN(x) && x < 0) {
        // a. Let x be -x.
        x = -x;
        // a. Let pattern be the value of numberFormat.[[negativePattern]].
        pattern = internal['[[negativePattern]]'];
    }
    // 2. Else,
    else {
            // a. Let pattern be the value of numberFormat.[[positivePattern]].
            pattern = internal['[[positivePattern]]'];
        }
    // 3. Let result be a new empty List.
    var result = new List();
    // 4. Let beginIndex be Call(%StringProto_indexOf%, pattern, "{", 0).
    var beginIndex = pattern.indexOf('{', 0);
    // 5. Let endIndex be 0.
    var endIndex = 0;
    // 6. Let nextIndex be 0.
    var nextIndex = 0;
    // 7. Let length be the number of code units in pattern.
    var length = pattern.length;
    // 8. Repeat while beginIndex is an integer index into pattern:
    while (beginIndex > -1 && beginIndex < length) {
        // a. Set endIndex to Call(%StringProto_indexOf%, pattern, "}", beginIndex)
        endIndex = pattern.indexOf('}', beginIndex);
        // a. If endIndex = -1, throw new Error exception.
        if (endIndex === -1) throw new Error();
        // a. If beginIndex is greater than nextIndex, then:
        if (beginIndex > nextIndex) {
            // i. Let literal be a substring of pattern from position nextIndex, inclusive, to position beginIndex, exclusive.
            var literal = pattern.substring(nextIndex, beginIndex);
            // ii. Add new part record { [[type]]: "literal", [[value]]: literal } as a new element of the list result.
            arrPush.call(result, { '[[type]]': 'literal', '[[value]]': literal });
        }
        // a. Let p be the substring of pattern from position beginIndex, exclusive, to position endIndex, exclusive.
        var p = pattern.substring(beginIndex + 1, endIndex);
        // a. If p is equal "number", then:
        if (p === "number") {
            // i. If x is NaN,
            if (isNaN(x)) {
                // 1. Let n be an ILD String value indicating the NaN value.
                var n = ild.nan;
                // 2. Add new part record { [[type]]: "nan", [[value]]: n } as a new element of the list result.
                arrPush.call(result, { '[[type]]': 'nan', '[[value]]': n });
            }
            // ii. Else if isFinite(x) is false,
            else if (!isFinite(x)) {
                    // 1. Let n be an ILD String value indicating infinity.
                    var _n = ild.infinity;
                    // 2. Add new part record { [[type]]: "infinity", [[value]]: n } as a new element of the list result.
                    arrPush.call(result, { '[[type]]': 'infinity', '[[value]]': _n });
                }
                // iii. Else,
                else {
                        // 1. If the value of numberFormat.[[style]] is "percent" and isFinite(x), let x be 100 × x.
                        if (internal['[[style]]'] === 'percent' && isFinite(x)) x *= 100;

                        var _n2 = void 0;
                        // 2. If the numberFormat.[[minimumSignificantDigits]] and numberFormat.[[maximumSignificantDigits]] are present, then
                        if (hop.call(internal, '[[minimumSignificantDigits]]') && hop.call(internal, '[[maximumSignificantDigits]]')) {
                            // a. Let n be ToRawPrecision(x, numberFormat.[[minimumSignificantDigits]], numberFormat.[[maximumSignificantDigits]]).
                            _n2 = ToRawPrecision(x, internal['[[minimumSignificantDigits]]'], internal['[[maximumSignificantDigits]]']);
                        }
                        // 3. Else,
                        else {
                                // a. Let n be ToRawFixed(x, numberFormat.[[minimumIntegerDigits]], numberFormat.[[minimumFractionDigits]], numberFormat.[[maximumFractionDigits]]).
                                _n2 = ToRawFixed(x, internal['[[minimumIntegerDigits]]'], internal['[[minimumFractionDigits]]'], internal['[[maximumFractionDigits]]']);
                            }
                        // 4. If the value of the numberFormat.[[numberingSystem]] matches one of the values in the "Numbering System" column of Table 2 below, then
                        if (numSys[nums]) {
                            (function () {
                                // a. Let digits be an array whose 10 String valued elements are the UTF-16 string representations of the 10 digits specified in the "Digits" column of the matching row in Table 2.
                                var digits = numSys[nums];
                                // a. Replace each digit in n with the value of digits[digit].
                                _n2 = String(_n2).replace(/\d/g, function (digit) {
                                    return digits[digit];
                                });
                            })();
                        }
                        // 5. Else use an implementation dependent algorithm to map n to the appropriate representation of n in the given numbering system.
                        else _n2 = String(_n2); // ###TODO###

                        var integer = void 0;
                        var fraction = void 0;
                        // 6. Let decimalSepIndex be Call(%StringProto_indexOf%, n, ".", 0).
                        var decimalSepIndex = _n2.indexOf('.', 0);
                        // 7. If decimalSepIndex > 0, then:
                        if (decimalSepIndex > 0) {
                            // a. Let integer be the substring of n from position 0, inclusive, to position decimalSepIndex, exclusive.
                            integer = _n2.substring(0, decimalSepIndex);
                            // a. Let fraction be the substring of n from position decimalSepIndex, exclusive, to the end of n.
                            fraction = _n2.substring(decimalSepIndex + 1, decimalSepIndex.length);
                        }
                        // 8. Else:
                        else {
                                // a. Let integer be n.
                                integer = _n2;
                                // a. Let fraction be undefined.
                                fraction = undefined;
                            }
                        // 9. If the value of the numberFormat.[[useGrouping]] is true,
                        if (internal['[[useGrouping]]'] === true) {
                            // a. Let groupSepSymbol be the ILND String representing the grouping separator.
                            var groupSepSymbol = ild.group;
                            // a. Let groups be a List whose elements are, in left to right order, the substrings defined by ILND set of locations within the integer.
                            var groups = [];
                            // ----> implementation:
                            // Primary group represents the group closest to the decimal
                            var pgSize = data.patterns.primaryGroupSize || 3;
                            // Secondary group is every other group
                            var sgSize = data.patterns.secondaryGroupSize || pgSize;
                            // Group only if necessary
                            if (integer.length > pgSize) {
                                // Index of the primary grouping separator
                                var end = integer.length - pgSize;
                                // Starting index for our loop
                                var idx = end % sgSize;
                                var start = integer.slice(0, idx);
                                if (start.length) arrPush.call(groups, start);
                                // Loop to separate into secondary grouping digits
                                while (idx < end) {
                                    arrPush.call(groups, integer.slice(idx, idx + sgSize));
                                    idx += sgSize;
                                }
                                // Add the primary grouping digits
                                arrPush.call(groups, integer.slice(end));
                            } else {
                                arrPush.call(groups, integer);
                            }
                            // a. Assert: The number of elements in groups List is greater than 0.
                            if (groups.length === 0) throw new Error();
                            // a. Repeat, while groups List is not empty:
                            while (groups.length) {
                                // i. Remove the first element from groups and let integerGroup be the value of that element.
                                var integerGroup = arrShift.call(groups);
                                // ii. Add new part record { [[type]]: "integer", [[value]]: integerGroup } as a new element of the list result.
                                arrPush.call(result, { '[[type]]': 'integer', '[[value]]': integerGroup });
                                // iii. If groups List is not empty, then:
                                if (groups.length) {
                                    // 1. Add new part record { [[type]]: "group", [[value]]: groupSepSymbol } as a new element of the list result.
                                    arrPush.call(result, { '[[type]]': 'group', '[[value]]': groupSepSymbol });
                                }
                            }
                        }
                        // 10. Else,
                        else {
                                // a. Add new part record { [[type]]: "integer", [[value]]: integer } as a new element of the list result.
                                arrPush.call(result, { '[[type]]': 'integer', '[[value]]': integer });
                            }
                        // 11. If fraction is not undefined, then:
                        if (fraction !== undefined) {
                            // a. Let decimalSepSymbol be the ILND String representing the decimal separator.
                            var decimalSepSymbol = ild.decimal;
                            // a. Add new part record { [[type]]: "decimal", [[value]]: decimalSepSymbol } as a new element of the list result.
                            arrPush.call(result, { '[[type]]': 'decimal', '[[value]]': decimalSepSymbol });
                            // a. Add new part record { [[type]]: "fraction", [[value]]: fraction } as a new element of the list result.
                            arrPush.call(result, { '[[type]]': 'fraction', '[[value]]': fraction });
                        }
                    }
        }
        // a. Else if p is equal "plusSign", then:
        else if (p === "plusSign") {
                // i. Let plusSignSymbol be the ILND String representing the plus sign.
                var plusSignSymbol = ild.plusSign;
                // ii. Add new part record { [[type]]: "plusSign", [[value]]: plusSignSymbol } as a new element of the list result.
                arrPush.call(result, { '[[type]]': 'plusSign', '[[value]]': plusSignSymbol });
            }
            // a. Else if p is equal "minusSign", then:
            else if (p === "minusSign") {
                    // i. Let minusSignSymbol be the ILND String representing the minus sign.
                    var minusSignSymbol = ild.minusSign;
                    // ii. Add new part record { [[type]]: "minusSign", [[value]]: minusSignSymbol } as a new element of the list result.
                    arrPush.call(result, { '[[type]]': 'minusSign', '[[value]]': minusSignSymbol });
                }
                // a. Else if p is equal "percentSign" and numberFormat.[[style]] is "percent", then:
                else if (p === "percentSign" && internal['[[style]]'] === "percent") {
                        // i. Let percentSignSymbol be the ILND String representing the percent sign.
                        var percentSignSymbol = ild.percentSign;
                        // ii. Add new part record { [[type]]: "percentSign", [[value]]: percentSignSymbol } as a new element of the list result.
                        arrPush.call(result, { '[[type]]': 'literal', '[[value]]': percentSignSymbol });
                    }
                    // a. Else if p is equal "currency" and numberFormat.[[style]] is "currency", then:
                    else if (p === "currency" && internal['[[style]]'] === "currency") {
                            // i. Let currency be the value of numberFormat.[[currency]].
                            var currency = internal['[[currency]]'];

                            var cd = void 0;

                            // ii. If numberFormat.[[currencyDisplay]] is "code", then
                            if (internal['[[currencyDisplay]]'] === "code") {
                                // 1. Let cd be currency.
                                cd = currency;
                            }
                            // iii. Else if numberFormat.[[currencyDisplay]] is "symbol", then
                            else if (internal['[[currencyDisplay]]'] === "symbol") {
                                    // 1. Let cd be an ILD string representing currency in short form. If the implementation does not have such a representation of currency, use currency itself.
                                    cd = data.currencies[currency] || currency;
                                }
                                // iv. Else if numberFormat.[[currencyDisplay]] is "name", then
                                else if (internal['[[currencyDisplay]]'] === "name") {
                                        // 1. Let cd be an ILD string representing currency in long form. If the implementation does not have such a representation of currency, then use currency itself.
                                        cd = currency;
                                    }
                            // v. Add new part record { [[type]]: "currency", [[value]]: cd } as a new element of the list result.
                            arrPush.call(result, { '[[type]]': 'currency', '[[value]]': cd });
                        }
                        // a. Else,
                        else {
                                // i. Let literal be the substring of pattern from position beginIndex, inclusive, to position endIndex, inclusive.
                                var _literal = pattern.substring(beginIndex, endIndex);
                                // ii. Add new part record { [[type]]: "literal", [[value]]: literal } as a new element of the list result.
                                arrPush.call(result, { '[[type]]': 'literal', '[[value]]': _literal });
                            }
        // a. Set nextIndex to endIndex + 1.
        nextIndex = endIndex + 1;
        // a. Set beginIndex to Call(%StringProto_indexOf%, pattern, "{", nextIndex)
        beginIndex = pattern.indexOf('{', nextIndex);
    }
    // 9. If nextIndex is less than length, then:
    if (nextIndex < length) {
        // a. Let literal be the substring of pattern from position nextIndex, inclusive, to position length, exclusive.
        var _literal2 = pattern.substring(nextIndex, length);
        // a. Add new part record { [[type]]: "literal", [[value]]: literal } as a new element of the list result.
        arrPush.call(result, { '[[type]]': 'literal', '[[value]]': _literal2 });
    }
    // 10. Return result.
    return result;
}

/*
 * @spec[stasm/ecma402/number-format-to-parts/spec/numberformat.html]
 * @clause[sec-formatnumber]
 */
function FormatNumber(numberFormat, x) {
    // 1. Let parts be ? PartitionNumberPattern(numberFormat, x).
    var parts = PartitionNumberPattern(numberFormat, x);
    // 2. Let result be an empty String.
    var result = '';
    // 3. For each part in parts, do:
    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        // a. Set result to a String value produced by concatenating result and part.[[value]].
        result += part['[[value]]'];
    }
    // 4. Return result.
    return result;
}

/**
 * When the ToRawPrecision abstract operation is called with arguments x (which
 * must be a finite non-negative number), minPrecision, and maxPrecision (both
 * must be integers between 1 and 21) the following steps are taken:
 */
function ToRawPrecision(x, minPrecision, maxPrecision) {
    // 1. Let p be maxPrecision.
    var p = maxPrecision;

    var m = void 0,
        e = void 0;

    // 2. If x = 0, then
    if (x === 0) {
        // a. Let m be the String consisting of p occurrences of the character "0".
        m = arrJoin.call(Array(p + 1), '0');
        // b. Let e be 0.
        e = 0;
    }
    // 3. Else
    else {
            // a. Let e and n be integers such that 10ᵖ⁻¹ ≤ n < 10ᵖ and for which the
            //    exact mathematical value of n × 10ᵉ⁻ᵖ⁺¹ – x is as close to zero as
            //    possible. If there are two such sets of e and n, pick the e and n for
            //    which n × 10ᵉ⁻ᵖ⁺¹ is larger.
            e = log10Floor(Math.abs(x));

            // Easier to get to m from here
            var f = Math.round(Math.exp(Math.abs(e - p + 1) * Math.LN10));

            // b. Let m be the String consisting of the digits of the decimal
            //    representation of n (in order, with no leading zeroes)
            m = String(Math.round(e - p + 1 < 0 ? x * f : x / f));
        }

    // 4. If e ≥ p, then
    if (e >= p)
        // a. Return the concatenation of m and e-p+1 occurrences of the character "0".
        return m + arrJoin.call(Array(e - p + 1 + 1), '0');

        // 5. If e = p-1, then
    else if (e === p - 1)
            // a. Return m.
            return m;

            // 6. If e ≥ 0, then
        else if (e >= 0)
                // a. Let m be the concatenation of the first e+1 characters of m, the character
                //    ".", and the remaining p–(e+1) characters of m.
                m = m.slice(0, e + 1) + '.' + m.slice(e + 1);

                // 7. If e < 0, then
            else if (e < 0)
                    // a. Let m be the concatenation of the String "0.", –(e+1) occurrences of the
                    //    character "0", and the string m.
                    m = '0.' + arrJoin.call(Array(-(e + 1) + 1), '0') + m;

    // 8. If m contains the character ".", and maxPrecision > minPrecision, then
    if (m.indexOf(".") >= 0 && maxPrecision > minPrecision) {
        // a. Let cut be maxPrecision – minPrecision.
        var cut = maxPrecision - minPrecision;

        // b. Repeat while cut > 0 and the last character of m is "0":
        while (cut > 0 && m.charAt(m.length - 1) === '0') {
            //  i. Remove the last character from m.
            m = m.slice(0, -1);

            //  ii. Decrease cut by 1.
            cut--;
        }

        // c. If the last character of m is ".", then
        if (m.charAt(m.length - 1) === '.')
            //    i. Remove the last character from m.
            m = m.slice(0, -1);
    }
    // 9. Return m.
    return m;
}

/**
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * @clause[sec-torawfixed]
 * When the ToRawFixed abstract operation is called with arguments x (which must
 * be a finite non-negative number), minInteger (which must be an integer between
 * 1 and 21), minFraction, and maxFraction (which must be integers between 0 and
 * 20) the following steps are taken:
 */
function ToRawFixed(x, minInteger, minFraction, maxFraction) {
    // 1. Let f be maxFraction.
    var f = maxFraction;
    // 2. Let n be an integer for which the exact mathematical value of n ÷ 10f – x is as close to zero as possible. If there are two such n, pick the larger n.
    var n = Math.pow(10, f) * x; // diverging...
    // 3. If n = 0, let m be the String "0". Otherwise, let m be the String consisting of the digits of the decimal representation of n (in order, with no leading zeroes).
    var m = n === 0 ? "0" : n.toFixed(0); // divering...

    {
        // this diversion is needed to take into consideration big numbers, e.g.:
        // 1.2344501e+37 -> 12344501000000000000000000000000000000
        var idx = void 0;
        var exp = (idx = m.indexOf('e')) > -1 ? m.slice(idx + 1) : 0;
        if (exp) {
            m = m.slice(0, idx).replace('.', '');
            m += arrJoin.call(Array(exp - (m.length - 1) + 1), '0');
        }
    }

    var int = void 0;
    // 4. If f ≠ 0, then
    if (f !== 0) {
        // a. Let k be the number of characters in m.
        var k = m.length;
        // a. If k ≤ f, then
        if (k <= f) {
            // i. Let z be the String consisting of f+1–k occurrences of the character "0".
            var z = arrJoin.call(Array(f + 1 - k + 1), '0');
            // ii. Let m be the concatenation of Strings z and m.
            m = z + m;
            // iii. Let k be f+1.
            k = f + 1;
        }
        // a. Let a be the first k–f characters of m, and let b be the remaining f characters of m.
        var a = m.substring(0, k - f),
            b = m.substring(k - f, m.length);
        // a. Let m be the concatenation of the three Strings a, ".", and b.
        m = a + "." + b;
        // a. Let int be the number of characters in a.
        int = a.length;
    }
    // 5. Else, let int be the number of characters in m.
    else int = m.length;
    // 6. Let cut be maxFraction – minFraction.
    var cut = maxFraction - minFraction;
    // 7. Repeat while cut > 0 and the last character of m is "0":
    while (cut > 0 && m.slice(-1) === "0") {
        // a. Remove the last character from m.
        m = m.slice(0, -1);
        // a. Decrease cut by 1.
        cut--;
    }
    // 8. If the last character of m is ".", then
    if (m.slice(-1) === ".") {
        // a. Remove the last character from m.
        m = m.slice(0, -1);
    }
    // 9. If int < minInteger, then
    if (int < minInteger) {
        // a. Let z be the String consisting of minInteger–int occurrences of the character "0".
        var _z = arrJoin.call(Array(minInteger - int + 1), '0');
        // a. Let m be the concatenation of Strings z and m.
        m = _z + m;
    }
    // 10. Return m.
    return m;
}

// Sect 11.3.2 Table 2, Numbering systems
// ======================================
var numSys = {
    arab: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
    arabext: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
    bali: ["᭐", "᭑", "᭒", "᭓", "᭔", "᭕", "᭖", "᭗", "᭘", "᭙"],
    beng: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
    deva: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
    fullwide: ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"],
    gujr: ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"],
    guru: ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"],
    hanidec: ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
    khmr: ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"],
    knda: ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"],
    laoo: ["໐", "໑", "໒", "໓", "໔", "໕", "໖", "໗", "໘", "໙"],
    latn: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    limb: ["᥆", "᥇", "᥈", "᥉", "᥊", "᥋", "᥌", "᥍", "᥎", "᥏"],
    mlym: ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"],
    mong: ["᠐", "᠑", "᠒", "᠓", "᠔", "᠕", "᠖", "᠗", "᠘", "᠙"],
    mymr: ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"],
    orya: ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"],
    tamldec: ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"],
    telu: ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"],
    thai: ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"],
    tibt: ["༠", "༡", "༢", "༣", "༤", "༥", "༦", "༧", "༨", "༩"]
};

/**
 * This function provides access to the locale and formatting options computed
 * during initialization of the object.
 *
 * The function returns a new object whose properties and attributes are set as
 * if constructed by an object literal assigning to each of the following
 * properties the value of the corresponding internal property of this
 * NumberFormat object (see 11.4): locale, numberingSystem, style, currency,
 * currencyDisplay, minimumIntegerDigits, minimumFractionDigits,
 * maximumFractionDigits, minimumSignificantDigits, maximumSignificantDigits, and
 * useGrouping. Properties whose corresponding internal properties are not present
 * are not assigned.
 */
/* 11.3.3 */defineProperty(Intl.NumberFormat.prototype, 'resolvedOptions', {
    configurable: true,
    writable: true,
    value: function value() {
        var prop = void 0,
            descs = new Record(),
            props = ['locale', 'numberingSystem', 'style', 'currency', 'currencyDisplay', 'minimumIntegerDigits', 'minimumFractionDigits', 'maximumFractionDigits', 'minimumSignificantDigits', 'maximumSignificantDigits', 'useGrouping'],
            internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

        // Satisfy test 11.3_b
        if (!internal || !internal['[[initializedNumberFormat]]']) throw new TypeError('`this` value for resolvedOptions() is not an initialized Intl.NumberFormat object.');

        for (var i = 0, max = props.length; i < max; i++) {
            if (hop.call(internal, prop = '[[' + props[i] + ']]')) descs[props[i]] = { value: internal[prop], writable: true, configurable: true, enumerable: true };
        }

        return objCreate({}, descs);
    }
});

/* jslint esnext: true */

// Match these datetime components in a CLDR pattern, except those in single quotes
var expDTComponents = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
// trim patterns after transformations
var expPatternTrimmer = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
// Skip over patterns with these datetime components because we don't have data
// to back them up:
// timezone, weekday, amoung others
var unwantedDTCs = /[rqQASjJgwWIQq]/; // xXVO were removed from this list in favor of computing matches with timeZoneName values but printing as empty string

var dtKeys = ["era", "year", "month", "day", "weekday", "quarter"];
var tmKeys = ["hour", "minute", "second", "hour12", "timeZoneName"];

function isDateFormatOnly(obj) {
    for (var i = 0; i < tmKeys.length; i += 1) {
        if (obj.hasOwnProperty(tmKeys[i])) {
            return false;
        }
    }
    return true;
}

function isTimeFormatOnly(obj) {
    for (var i = 0; i < dtKeys.length; i += 1) {
        if (obj.hasOwnProperty(dtKeys[i])) {
            return false;
        }
    }
    return true;
}

function joinDateAndTimeFormats(dateFormatObj, timeFormatObj) {
    var o = { _: {} };
    for (var i = 0; i < dtKeys.length; i += 1) {
        if (dateFormatObj[dtKeys[i]]) {
            o[dtKeys[i]] = dateFormatObj[dtKeys[i]];
        }
        if (dateFormatObj._[dtKeys[i]]) {
            o._[dtKeys[i]] = dateFormatObj._[dtKeys[i]];
        }
    }
    for (var j = 0; j < tmKeys.length; j += 1) {
        if (timeFormatObj[tmKeys[j]]) {
            o[tmKeys[j]] = timeFormatObj[tmKeys[j]];
        }
        if (timeFormatObj._[tmKeys[j]]) {
            o._[tmKeys[j]] = timeFormatObj._[tmKeys[j]];
        }
    }
    return o;
}

function computeFinalPatterns(formatObj) {
    // From http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns:
    //  'In patterns, two single quotes represents a literal single quote, either
    //   inside or outside single quotes. Text within single quotes is not
    //   interpreted in any way (except for two adjacent single quotes).'
    formatObj.pattern12 = formatObj.extendedPattern.replace(/'([^']*)'/g, function ($0, literal) {
        return literal ? literal : "'";
    });

    // pattern 12 is always the default. we can produce the 24 by removing {ampm}
    formatObj.pattern = formatObj.pattern12.replace('{ampm}', '').replace(expPatternTrimmer, '');
    return formatObj;
}

function expDTComponentsMeta($0, formatObj) {
    switch ($0.charAt(0)) {
        // --- Era
        case 'G':
            formatObj.era = ['short', 'short', 'short', 'long', 'narrow'][$0.length - 1];
            return '{era}';

        // --- Year
        case 'y':
        case 'Y':
        case 'u':
        case 'U':
        case 'r':
            formatObj.year = $0.length === 2 ? '2-digit' : 'numeric';
            return '{year}';

        // --- Quarter (not supported in this polyfill)
        case 'Q':
        case 'q':
            formatObj.quarter = ['numeric', '2-digit', 'short', 'long', 'narrow'][$0.length - 1];
            return '{quarter}';

        // --- Month
        case 'M':
        case 'L':
            formatObj.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][$0.length - 1];
            return '{month}';

        // --- Week (not supported in this polyfill)
        case 'w':
            // week of the year
            formatObj.week = $0.length === 2 ? '2-digit' : 'numeric';
            return '{weekday}';
        case 'W':
            // week of the month
            formatObj.week = 'numeric';
            return '{weekday}';

        // --- Day
        case 'd':
            // day of the month
            formatObj.day = $0.length === 2 ? '2-digit' : 'numeric';
            return '{day}';
        case 'D': // day of the year
        case 'F': // day of the week
        case 'g':
            // 1..n: Modified Julian day
            formatObj.day = 'numeric';
            return '{day}';

        // --- Week Day
        case 'E':
            // day of the week
            formatObj.weekday = ['short', 'short', 'short', 'long', 'narrow', 'short'][$0.length - 1];
            return '{weekday}';
        case 'e':
            // local day of the week
            formatObj.weekday = ['numeric', '2-digit', 'short', 'long', 'narrow', 'short'][$0.length - 1];
            return '{weekday}';
        case 'c':
            // stand alone local day of the week
            formatObj.weekday = ['numeric', undefined, 'short', 'long', 'narrow', 'short'][$0.length - 1];
            return '{weekday}';

        // --- Period
        case 'a': // AM, PM
        case 'b': // am, pm, noon, midnight
        case 'B':
            // flexible day periods
            formatObj.hour12 = true;
            return '{ampm}';

        // --- Hour
        case 'h':
        case 'H':
            formatObj.hour = $0.length === 2 ? '2-digit' : 'numeric';
            return '{hour}';
        case 'k':
        case 'K':
            formatObj.hour12 = true; // 12-hour-cycle time formats (using h or K)
            formatObj.hour = $0.length === 2 ? '2-digit' : 'numeric';
            return '{hour}';

        // --- Minute
        case 'm':
            formatObj.minute = $0.length === 2 ? '2-digit' : 'numeric';
            return '{minute}';

        // --- Second
        case 's':
            formatObj.second = $0.length === 2 ? '2-digit' : 'numeric';
            return '{second}';
        case 'S':
        case 'A':
            formatObj.second = 'numeric';
            return '{second}';

        // --- Timezone
        case 'z': // 1..3, 4: specific non-location format
        case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
        case 'O': // 1, 4: miliseconds in day short, long
        case 'v': // 1, 4: generic non-location format
        case 'V': // 1, 2, 3, 4: time zone ID or city
        case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
        case 'x':
            // 1, 2, 3, 4: The ISO8601 varios formats
            // this polyfill only supports much, for now, we are just doing something dummy
            formatObj.timeZoneName = $0.length < 4 ? 'short' : 'long';
            return '{timeZoneName}';
    }
}

/**
 * Converts the CLDR availableFormats into the objects and patterns required by
 * the ECMAScript Internationalization API specification.
 */
function createDateTimeFormat(skeleton, pattern) {
    // we ignore certain patterns that are unsupported to avoid this expensive op.
    if (unwantedDTCs.test(pattern)) return undefined;

    var formatObj = {
        originalPattern: pattern,
        _: {}
    };

    // Replace the pattern string with the one required by the specification, whilst
    // at the same time evaluating it for the subsets and formats
    formatObj.extendedPattern = pattern.replace(expDTComponents, function ($0) {
        // See which symbol we're dealing with
        return expDTComponentsMeta($0, formatObj._);
    });

    // Match the skeleton string with the one required by the specification
    // this implementation is based on the Date Field Symbol Table:
    // http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
    // Note: we are adding extra data to the formatObject even though this polyfill
    //       might not support it.
    skeleton.replace(expDTComponents, function ($0) {
        // See which symbol we're dealing with
        return expDTComponentsMeta($0, formatObj);
    });

    return computeFinalPatterns(formatObj);
}

/**
 * Processes DateTime formats from CLDR to an easier-to-parse format.
 * the result of this operation should be cached the first time a particular
 * calendar is analyzed.
 *
 * The specification requires we support at least the following subsets of
 * date/time components:
 *
 *   - 'weekday', 'year', 'month', 'day', 'hour', 'minute', 'second'
 *   - 'weekday', 'year', 'month', 'day'
 *   - 'year', 'month', 'day'
 *   - 'year', 'month'
 *   - 'month', 'day'
 *   - 'hour', 'minute', 'second'
 *   - 'hour', 'minute'
 *
 * We need to cherry pick at least these subsets from the CLDR data and convert
 * them into the pattern objects used in the ECMA-402 API.
 */
function createDateTimeFormats(formats) {
    var availableFormats = formats.availableFormats;
    var timeFormats = formats.timeFormats;
    var dateFormats = formats.dateFormats;
    var result = [];
    var skeleton = void 0,
        pattern = void 0,
        computed = void 0,
        i = void 0,
        j = void 0;
    var timeRelatedFormats = [];
    var dateRelatedFormats = [];

    // Map available (custom) formats into a pattern for createDateTimeFormats
    for (skeleton in availableFormats) {
        if (availableFormats.hasOwnProperty(skeleton)) {
            pattern = availableFormats[skeleton];
            computed = createDateTimeFormat(skeleton, pattern);
            if (computed) {
                result.push(computed);
                // in some cases, the format is only displaying date specific props
                // or time specific props, in which case we need to also produce the
                // combined formats.
                if (isDateFormatOnly(computed)) {
                    dateRelatedFormats.push(computed);
                } else if (isTimeFormatOnly(computed)) {
                    timeRelatedFormats.push(computed);
                }
            }
        }
    }

    // Map time formats into a pattern for createDateTimeFormats
    for (skeleton in timeFormats) {
        if (timeFormats.hasOwnProperty(skeleton)) {
            pattern = timeFormats[skeleton];
            computed = createDateTimeFormat(skeleton, pattern);
            if (computed) {
                result.push(computed);
                timeRelatedFormats.push(computed);
            }
        }
    }

    // Map date formats into a pattern for createDateTimeFormats
    for (skeleton in dateFormats) {
        if (dateFormats.hasOwnProperty(skeleton)) {
            pattern = dateFormats[skeleton];
            computed = createDateTimeFormat(skeleton, pattern);
            if (computed) {
                result.push(computed);
                dateRelatedFormats.push(computed);
            }
        }
    }

    // combine custom time and custom date formats when they are orthogonals to complete the
    // formats supported by CLDR.
    // This Algo is based on section "Missing Skeleton Fields" from:
    // http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
    for (i = 0; i < timeRelatedFormats.length; i += 1) {
        for (j = 0; j < dateRelatedFormats.length; j += 1) {
            if (dateRelatedFormats[j].month === 'long') {
                pattern = dateRelatedFormats[j].weekday ? formats.full : formats.long;
            } else if (dateRelatedFormats[j].month === 'short') {
                pattern = formats.medium;
            } else {
                pattern = formats.short;
            }
            computed = joinDateAndTimeFormats(dateRelatedFormats[j], timeRelatedFormats[i]);
            computed.originalPattern = pattern;
            computed.extendedPattern = pattern.replace('{0}', timeRelatedFormats[i].extendedPattern).replace('{1}', dateRelatedFormats[j].extendedPattern).replace(/^[,\s]+|[,\s]+$/gi, '');
            result.push(computeFinalPatterns(computed));
        }
    }

    return result;
}

// this represents the exceptions of the rule that are not covered by CLDR availableFormats
// for single property configurations, they play no role when using multiple properties, and
// those that are not in this table, are not exceptions or are not covered by the data we
// provide.
var validSyntheticProps = {
    second: {
        numeric: 's',
        '2-digit': 'ss'
    },
    minute: {
        numeric: 'm',
        '2-digit': 'mm'
    },
    year: {
        numeric: 'y',
        '2-digit': 'yy'
    },
    day: {
        numeric: 'd',
        '2-digit': 'dd'
    },
    month: {
        numeric: 'L',
        '2-digit': 'LL',
        narrow: 'LLLLL',
        short: 'LLL',
        long: 'LLLL'
    },
    weekday: {
        narrow: 'ccccc',
        short: 'ccc',
        long: 'cccc'
    }
};

function generateSyntheticFormat(propName, propValue) {
    if (validSyntheticProps[propName] && validSyntheticProps[propName][propValue]) {
        var _ref2;

        return _ref2 = {
            originalPattern: validSyntheticProps[propName][propValue],
            _: defineProperty$1({}, propName, propValue),
            extendedPattern: "{" + propName + "}"
        }, defineProperty$1(_ref2, propName, propValue), defineProperty$1(_ref2, "pattern12", "{" + propName + "}"), defineProperty$1(_ref2, "pattern", "{" + propName + "}"), _ref2;
    }
}

// An object map of date component keys, saves using a regex later
var dateWidths = objCreate(null, { narrow: {}, short: {}, long: {} });

/**
 * Returns a string for a date component, resolved using multiple inheritance as specified
 * as specified in the Unicode Technical Standard 35.
 */
function resolveDateString(data, ca, component, width, key) {
    // From http://www.unicode.org/reports/tr35/tr35.html#Multiple_Inheritance:
    // 'In clearly specified instances, resources may inherit from within the same locale.
    //  For example, ... the Buddhist calendar inherits from the Gregorian calendar.'
    var obj = data[ca] && data[ca][component] ? data[ca][component] : data.gregory[component],


    // "sideways" inheritance resolves strings when a key doesn't exist
    alts = {
        narrow: ['short', 'long'],
        short: ['long', 'narrow'],
        long: ['short', 'narrow']
    },


    //
    resolved = hop.call(obj, width) ? obj[width] : hop.call(obj, alts[width][0]) ? obj[alts[width][0]] : obj[alts[width][1]];

    // `key` wouldn't be specified for components 'dayPeriods'
    return key !== null ? resolved[key] : resolved;
}

// Define the DateTimeFormat constructor internally so it cannot be tainted
function DateTimeFormatConstructor() {
    var locales = arguments[0];
    var options = arguments[1];

    if (!this || this === Intl) {
        return new Intl.DateTimeFormat(locales, options);
    }
    return InitializeDateTimeFormat(toObject(this), locales, options);
}

defineProperty(Intl, 'DateTimeFormat', {
    configurable: true,
    writable: true,
    value: DateTimeFormatConstructor
});

// Must explicitly set prototypes as unwritable
defineProperty(DateTimeFormatConstructor, 'prototype', {
    writable: false
});

/**
 * The abstract operation InitializeDateTimeFormat accepts the arguments dateTimeFormat
 * (which must be an object), locales, and options. It initializes dateTimeFormat as a
 * DateTimeFormat object.
 */
function /* 12.1.1.1 */InitializeDateTimeFormat(dateTimeFormat, locales, options) {
    // This will be a internal properties object if we're not already initialized
    var internal = getInternalProperties(dateTimeFormat);

    // Create an object whose props can be used to restore the values of RegExp props
    var regexpRestore = createRegExpRestore();

    // 1. If dateTimeFormat has an [[initializedIntlObject]] internal property with
    //    value true, throw a TypeError exception.
    if (internal['[[initializedIntlObject]]'] === true) throw new TypeError('`this` object has already been initialized as an Intl object');

    // Need this to access the `internal` object
    defineProperty(dateTimeFormat, '__getInternalProperties', {
        value: function value() {
            // NOTE: Non-standard, for internal use only
            if (arguments[0] === secret) return internal;
        }
    });

    // 2. Set the [[initializedIntlObject]] internal property of numberFormat to true.
    internal['[[initializedIntlObject]]'] = true;

    // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
    //    abstract operation (defined in 9.2.1) with argument locales.
    var requestedLocales = CanonicalizeLocaleList(locales);

    // 4. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined below) with arguments options, "any", and "date".
    options = ToDateTimeOptions(options, 'any', 'date');

    // 5. Let opt be a new Record.
    var opt = new Record();

    // 6. Let matcher be the result of calling the GetOption abstract operation
    //    (defined in 9.2.9) with arguments options, "localeMatcher", "string", a List
    //    containing the two String values "lookup" and "best fit", and "best fit".
    var matcher = GetOption(options, 'localeMatcher', 'string', new List('lookup', 'best fit'), 'best fit');

    // 7. Set opt.[[localeMatcher]] to matcher.
    opt['[[localeMatcher]]'] = matcher;

    // 8. Let DateTimeFormat be the standard built-in object that is the initial
    //    value of Intl.DateTimeFormat.
    var DateTimeFormat = internals.DateTimeFormat; // This is what we *really* need

    // 9. Let localeData be the value of the [[localeData]] internal property of
    //    DateTimeFormat.
    var localeData = DateTimeFormat['[[localeData]]'];

    // 10. Let r be the result of calling the ResolveLocale abstract operation
    //     (defined in 9.2.5) with the [[availableLocales]] internal property of
    //      DateTimeFormat, requestedLocales, opt, the [[relevantExtensionKeys]]
    //      internal property of DateTimeFormat, and localeData.
    var r = ResolveLocale(DateTimeFormat['[[availableLocales]]'], requestedLocales, opt, DateTimeFormat['[[relevantExtensionKeys]]'], localeData);

    // 11. Set the [[locale]] internal property of dateTimeFormat to the value of
    //     r.[[locale]].
    internal['[[locale]]'] = r['[[locale]]'];

    // 12. Set the [[calendar]] internal property of dateTimeFormat to the value of
    //     r.[[ca]].
    internal['[[calendar]]'] = r['[[ca]]'];

    // 13. Set the [[numberingSystem]] internal property of dateTimeFormat to the value of
    //     r.[[nu]].
    internal['[[numberingSystem]]'] = r['[[nu]]'];

    // The specification doesn't tell us to do this, but it's helpful later on
    internal['[[dataLocale]]'] = r['[[dataLocale]]'];

    // 14. Let dataLocale be the value of r.[[dataLocale]].
    var dataLocale = r['[[dataLocale]]'];

    // 15. Let tz be the result of calling the [[Get]] internal method of options with
    //     argument "timeZone".
    var tz = options.timeZone;

    // 16. If tz is not undefined, then
    if (tz !== undefined) {
        // a. Let tz be ToString(tz).
        // b. Convert tz to upper case as described in 6.1.
        //    NOTE: If an implementation accepts additional time zone values, as permitted
        //          under certain conditions by the Conformance clause, different casing
        //          rules apply.
        tz = toLatinUpperCase(tz);

        // c. If tz is not "UTC", then throw a RangeError exception.
        // ###TODO: accept more time zones###
        if (tz !== 'UTC') throw new RangeError('timeZone is not supported.');
    }

    // 17. Set the [[timeZone]] internal property of dateTimeFormat to tz.
    internal['[[timeZone]]'] = tz;

    // 18. Let opt be a new Record.
    opt = new Record();

    // 19. For each row of Table 3, except the header row, do:
    for (var prop in dateTimeComponents) {
        if (!hop.call(dateTimeComponents, prop)) continue;

        // 20. Let prop be the name given in the Property column of the row.
        // 21. Let value be the result of calling the GetOption abstract operation,
        //     passing as argument options, the name given in the Property column of the
        //     row, "string", a List containing the strings given in the Values column of
        //     the row, and undefined.
        var value = GetOption(options, prop, 'string', dateTimeComponents[prop]);

        // 22. Set opt.[[<prop>]] to value.
        opt['[[' + prop + ']]'] = value;
    }

    // Assigned a value below
    var bestFormat = void 0;

    // 23. Let dataLocaleData be the result of calling the [[Get]] internal method of
    //     localeData with argument dataLocale.
    var dataLocaleData = localeData[dataLocale];

    // 24. Let formats be the result of calling the [[Get]] internal method of
    //     dataLocaleData with argument "formats".
    //     Note: we process the CLDR formats into the spec'd structure
    var formats = ToDateTimeFormats(dataLocaleData.formats);

    // 25. Let matcher be the result of calling the GetOption abstract operation with
    //     arguments options, "formatMatcher", "string", a List containing the two String
    //     values "basic" and "best fit", and "best fit".
    matcher = GetOption(options, 'formatMatcher', 'string', new List('basic', 'best fit'), 'best fit');

    // Optimization: caching the processed formats as a one time operation by
    // replacing the initial structure from localeData
    dataLocaleData.formats = formats;

    // 26. If matcher is "basic", then
    if (matcher === 'basic') {
        // 27. Let bestFormat be the result of calling the BasicFormatMatcher abstract
        //     operation (defined below) with opt and formats.
        bestFormat = BasicFormatMatcher(opt, formats);

        // 28. Else
    } else {
        {
            // diverging
            var _hr = GetOption(options, 'hour12', 'boolean' /*, undefined, undefined*/);
            opt.hour12 = _hr === undefined ? dataLocaleData.hour12 : _hr;
        }
        // 29. Let bestFormat be the result of calling the BestFitFormatMatcher
        //     abstract operation (defined below) with opt and formats.
        bestFormat = BestFitFormatMatcher(opt, formats);
    }

    // 30. For each row in Table 3, except the header row, do
    for (var _prop in dateTimeComponents) {
        if (!hop.call(dateTimeComponents, _prop)) continue;

        // a. Let prop be the name given in the Property column of the row.
        // b. Let pDesc be the result of calling the [[GetOwnProperty]] internal method of
        //    bestFormat with argument prop.
        // c. If pDesc is not undefined, then
        if (hop.call(bestFormat, _prop)) {
            // i. Let p be the result of calling the [[Get]] internal method of bestFormat
            //    with argument prop.
            var p = bestFormat[_prop];
            {
                // diverging
                p = bestFormat._ && hop.call(bestFormat._, _prop) ? bestFormat._[_prop] : p;
            }

            // ii. Set the [[<prop>]] internal property of dateTimeFormat to p.
            internal['[[' + _prop + ']]'] = p;
        }
    }

    var pattern = void 0; // Assigned a value below

    // 31. Let hr12 be the result of calling the GetOption abstract operation with
    //     arguments options, "hour12", "boolean", undefined, and undefined.
    var hr12 = GetOption(options, 'hour12', 'boolean' /*, undefined, undefined*/);

    // 32. If dateTimeFormat has an internal property [[hour]], then
    if (internal['[[hour]]']) {
        // a. If hr12 is undefined, then let hr12 be the result of calling the [[Get]]
        //    internal method of dataLocaleData with argument "hour12".
        hr12 = hr12 === undefined ? dataLocaleData.hour12 : hr12;

        // b. Set the [[hour12]] internal property of dateTimeFormat to hr12.
        internal['[[hour12]]'] = hr12;

        // c. If hr12 is true, then
        if (hr12 === true) {
            // i. Let hourNo0 be the result of calling the [[Get]] internal method of
            //    dataLocaleData with argument "hourNo0".
            var hourNo0 = dataLocaleData.hourNo0;

            // ii. Set the [[hourNo0]] internal property of dateTimeFormat to hourNo0.
            internal['[[hourNo0]]'] = hourNo0;

            // iii. Let pattern be the result of calling the [[Get]] internal method of
            //      bestFormat with argument "pattern12".
            pattern = bestFormat.pattern12;
        }

        // d. Else
        else
            // i. Let pattern be the result of calling the [[Get]] internal method of
            //    bestFormat with argument "pattern".
            pattern = bestFormat.pattern;
    }

    // 33. Else
    else
        // a. Let pattern be the result of calling the [[Get]] internal method of
        //    bestFormat with argument "pattern".
        pattern = bestFormat.pattern;

    // 34. Set the [[pattern]] internal property of dateTimeFormat to pattern.
    internal['[[pattern]]'] = pattern;

    // 35. Set the [[boundFormat]] internal property of dateTimeFormat to undefined.
    internal['[[boundFormat]]'] = undefined;

    // 36. Set the [[initializedDateTimeFormat]] internal property of dateTimeFormat to
    //     true.
    internal['[[initializedDateTimeFormat]]'] = true;

    // In ES3, we need to pre-bind the format() function
    if (es3) dateTimeFormat.format = GetFormatDateTime.call(dateTimeFormat);

    // Restore the RegExp properties
    regexpRestore();

    // Return the newly initialised object
    return dateTimeFormat;
}

/**
 * Several DateTimeFormat algorithms use values from the following table, which provides
 * property names and allowable values for the components of date and time formats:
 */
var dateTimeComponents = {
    weekday: ["narrow", "short", "long"],
    era: ["narrow", "short", "long"],
    year: ["2-digit", "numeric"],
    month: ["2-digit", "numeric", "narrow", "short", "long"],
    day: ["2-digit", "numeric"],
    hour: ["2-digit", "numeric"],
    minute: ["2-digit", "numeric"],
    second: ["2-digit", "numeric"],
    timeZoneName: ["short", "long"]
};

/**
 * When the ToDateTimeOptions abstract operation is called with arguments options,
 * required, and defaults, the following steps are taken:
 */
function ToDateTimeFormats(formats) {
    if (Object.prototype.toString.call(formats) === '[object Array]') {
        return formats;
    }
    return createDateTimeFormats(formats);
}

/**
 * When the ToDateTimeOptions abstract operation is called with arguments options,
 * required, and defaults, the following steps are taken:
 */
function ToDateTimeOptions(options, required, defaults) {
    // 1. If options is undefined, then let options be null, else let options be
    //    ToObject(options).
    if (options === undefined) options = null;else {
        // (#12) options needs to be a Record, but it also needs to inherit properties
        var opt2 = toObject(options);
        options = new Record();

        for (var k in opt2) {
            options[k] = opt2[k];
        }
    }

    // 2. Let create be the standard built-in function object defined in ES5, 15.2.3.5.
    var create = objCreate;

    // 3. Let options be the result of calling the [[Call]] internal method of create with
    //    undefined as the this value and an argument list containing the single item
    //    options.
    options = create(options);

    // 4. Let needDefaults be true.
    var needDefaults = true;

    // 5. If required is "date" or "any", then
    if (required === 'date' || required === 'any') {
        // a. For each of the property names "weekday", "year", "month", "day":
        // i. If the result of calling the [[Get]] internal method of options with the
        //    property name is not undefined, then let needDefaults be false.
        if (options.weekday !== undefined || options.year !== undefined || options.month !== undefined || options.day !== undefined) needDefaults = false;
    }

    // 6. If required is "time" or "any", then
    if (required === 'time' || required === 'any') {
        // a. For each of the property names "hour", "minute", "second":
        // i. If the result of calling the [[Get]] internal method of options with the
        //    property name is not undefined, then let needDefaults be false.
        if (options.hour !== undefined || options.minute !== undefined || options.second !== undefined) needDefaults = false;
    }

    // 7. If needDefaults is true and defaults is either "date" or "all", then
    if (needDefaults && (defaults === 'date' || defaults === 'all'))
        // a. For each of the property names "year", "month", "day":
        // i. Call the [[DefineOwnProperty]] internal method of options with the
        //    property name, Property Descriptor {[[Value]]: "numeric", [[Writable]]:
        //    true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        options.year = options.month = options.day = 'numeric';

    // 8. If needDefaults is true and defaults is either "time" or "all", then
    if (needDefaults && (defaults === 'time' || defaults === 'all'))
        // a. For each of the property names "hour", "minute", "second":
        // i. Call the [[DefineOwnProperty]] internal method of options with the
        //    property name, Property Descriptor {[[Value]]: "numeric", [[Writable]]:
        //    true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        options.hour = options.minute = options.second = 'numeric';

    // 9. Return options.
    return options;
}

/**
 * When the BasicFormatMatcher abstract operation is called with two arguments options and
 * formats, the following steps are taken:
 */
function BasicFormatMatcher(options, formats) {
    // 1. Let removalPenalty be 120.
    var removalPenalty = 120;

    // 2. Let additionPenalty be 20.
    var additionPenalty = 20;

    // 3. Let longLessPenalty be 8.
    var longLessPenalty = 8;

    // 4. Let longMorePenalty be 6.
    var longMorePenalty = 6;

    // 5. Let shortLessPenalty be 6.
    var shortLessPenalty = 6;

    // 6. Let shortMorePenalty be 3.
    var shortMorePenalty = 3;

    // 7. Let bestScore be -Infinity.
    var bestScore = -Infinity;

    // 8. Let bestFormat be undefined.
    var bestFormat = void 0;

    // 9. Let i be 0.
    var i = 0;

    // 10. Assert: formats is an Array object.

    // 11. Let len be the result of calling the [[Get]] internal method of formats with argument "length".
    var len = formats.length;

    // 12. Repeat while i < len:
    while (i < len) {
        // a. Let format be the result of calling the [[Get]] internal method of formats with argument ToString(i).
        var format = formats[i];

        // b. Let score be 0.
        var score = 0;

        // c. For each property shown in Table 3:
        for (var property in dateTimeComponents) {
            if (!hop.call(dateTimeComponents, property)) continue;

            // i. Let optionsProp be options.[[<property>]].
            var optionsProp = options['[[' + property + ']]'];

            // ii. Let formatPropDesc be the result of calling the [[GetOwnProperty]] internal method of format
            //     with argument property.
            // iii. If formatPropDesc is not undefined, then
            //     1. Let formatProp be the result of calling the [[Get]] internal method of format with argument property.
            var formatProp = hop.call(format, property) ? format[property] : undefined;

            // iv. If optionsProp is undefined and formatProp is not undefined, then decrease score by
            //     additionPenalty.
            if (optionsProp === undefined && formatProp !== undefined) score -= additionPenalty;

            // v. Else if optionsProp is not undefined and formatProp is undefined, then decrease score by
            //    removalPenalty.
            else if (optionsProp !== undefined && formatProp === undefined) score -= removalPenalty;

                // vi. Else
                else {
                        // 1. Let values be the array ["2-digit", "numeric", "narrow", "short",
                        //    "long"].
                        var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];

                        // 2. Let optionsPropIndex be the index of optionsProp within values.
                        var optionsPropIndex = arrIndexOf.call(values, optionsProp);

                        // 3. Let formatPropIndex be the index of formatProp within values.
                        var formatPropIndex = arrIndexOf.call(values, formatProp);

                        // 4. Let delta be max(min(formatPropIndex - optionsPropIndex, 2), -2).
                        var delta = Math.max(Math.min(formatPropIndex - optionsPropIndex, 2), -2);

                        // 5. If delta = 2, decrease score by longMorePenalty.
                        if (delta === 2) score -= longMorePenalty;

                        // 6. Else if delta = 1, decrease score by shortMorePenalty.
                        else if (delta === 1) score -= shortMorePenalty;

                            // 7. Else if delta = -1, decrease score by shortLessPenalty.
                            else if (delta === -1) score -= shortLessPenalty;

                                // 8. Else if delta = -2, decrease score by longLessPenalty.
                                else if (delta === -2) score -= longLessPenalty;
                    }
        }

        // d. If score > bestScore, then
        if (score > bestScore) {
            // i. Let bestScore be score.
            bestScore = score;

            // ii. Let bestFormat be format.
            bestFormat = format;
        }

        // e. Increase i by 1.
        i++;
    }

    // 13. Return bestFormat.
    return bestFormat;
}

/**
 * When the BestFitFormatMatcher abstract operation is called with two arguments options
 * and formats, it performs implementation dependent steps, which should return a set of
 * component representations that a typical user of the selected locale would perceive as
 * at least as good as the one returned by BasicFormatMatcher.
 *
 * This polyfill defines the algorithm to be the same as BasicFormatMatcher,
 * with the addition of bonus points awarded where the requested format is of
 * the same data type as the potentially matching format.
 *
 * This algo relies on the concept of closest distance matching described here:
 * http://unicode.org/reports/tr35/tr35-dates.html#Matching_Skeletons
 * Typically a “best match” is found using a closest distance match, such as:
 *
 * Symbols requesting a best choice for the locale are replaced.
 *      j → one of {H, k, h, K}; C → one of {a, b, B}
 * -> Covered by cldr.js matching process
 *
 * For fields with symbols representing the same type (year, month, day, etc):
 *     Most symbols have a small distance from each other.
 *         M ≅ L; E ≅ c; a ≅ b ≅ B; H ≅ k ≅ h ≅ K; ...
 *     -> Covered by cldr.js matching process
 *
 *     Width differences among fields, other than those marking text vs numeric, are given small distance from each other.
 *         MMM ≅ MMMM
 *         MM ≅ M
 *     Numeric and text fields are given a larger distance from each other.
 *         MMM ≈ MM
 *     Symbols representing substantial differences (week of year vs week of month) are given much larger a distances from each other.
 *         d ≋ D; ...
 *     Missing or extra fields cause a match to fail. (But see Missing Skeleton Fields).
 *
 *
 * For example,
 *
 *     { month: 'numeric', day: 'numeric' }
 *
 * should match
 *
 *     { month: '2-digit', day: '2-digit' }
 *
 * rather than
 *
 *     { month: 'short', day: 'numeric' }
 *
 * This makes sense because a user requesting a formatted date with numeric parts would
 * not expect to see the returned format containing narrow, short or long part names
 */
function BestFitFormatMatcher(options, formats) {
    /** Diverging: this block implements the hack for single property configuration, eg.:
     *
     *      `new Intl.DateTimeFormat('en', {day: 'numeric'})`
     *
     * should produce a single digit with the day of the month. This is needed because
     * CLDR `availableFormats` data structure doesn't cover these cases.
     */
    {
        var optionsPropNames = [];
        for (var property in dateTimeComponents) {
            if (!hop.call(dateTimeComponents, property)) continue;

            if (options['[[' + property + ']]'] !== undefined) {
                optionsPropNames.push(property);
            }
        }
        if (optionsPropNames.length === 1) {
            var _bestFormat = generateSyntheticFormat(optionsPropNames[0], options['[[' + optionsPropNames[0] + ']]']);
            if (_bestFormat) {
                return _bestFormat;
            }
        }
    }

    // 1. Let removalPenalty be 120.
    var removalPenalty = 120;

    // 2. Let additionPenalty be 20.
    var additionPenalty = 20;

    // 3. Let longLessPenalty be 8.
    var longLessPenalty = 8;

    // 4. Let longMorePenalty be 6.
    var longMorePenalty = 6;

    // 5. Let shortLessPenalty be 6.
    var shortLessPenalty = 6;

    // 6. Let shortMorePenalty be 3.
    var shortMorePenalty = 3;

    var patternPenalty = 2;

    var hour12Penalty = 1;

    // 7. Let bestScore be -Infinity.
    var bestScore = -Infinity;

    // 8. Let bestFormat be undefined.
    var bestFormat = void 0;

    // 9. Let i be 0.
    var i = 0;

    // 10. Assert: formats is an Array object.

    // 11. Let len be the result of calling the [[Get]] internal method of formats with argument "length".
    var len = formats.length;

    // 12. Repeat while i < len:
    while (i < len) {
        // a. Let format be the result of calling the [[Get]] internal method of formats with argument ToString(i).
        var format = formats[i];

        // b. Let score be 0.
        var score = 0;

        // c. For each property shown in Table 3:
        for (var _property in dateTimeComponents) {
            if (!hop.call(dateTimeComponents, _property)) continue;

            // i. Let optionsProp be options.[[<property>]].
            var optionsProp = options['[[' + _property + ']]'];

            // ii. Let formatPropDesc be the result of calling the [[GetOwnProperty]] internal method of format
            //     with argument property.
            // iii. If formatPropDesc is not undefined, then
            //     1. Let formatProp be the result of calling the [[Get]] internal method of format with argument property.
            var formatProp = hop.call(format, _property) ? format[_property] : undefined;

            // Diverging: using the default properties produced by the pattern/skeleton
            // to match it with user options, and apply a penalty
            var patternProp = hop.call(format._, _property) ? format._[_property] : undefined;
            if (optionsProp !== patternProp) {
                score -= patternPenalty;
            }

            // iv. If optionsProp is undefined and formatProp is not undefined, then decrease score by
            //     additionPenalty.
            if (optionsProp === undefined && formatProp !== undefined) score -= additionPenalty;

            // v. Else if optionsProp is not undefined and formatProp is undefined, then decrease score by
            //    removalPenalty.
            else if (optionsProp !== undefined && formatProp === undefined) score -= removalPenalty;

                // vi. Else
                else {
                        // 1. Let values be the array ["2-digit", "numeric", "narrow", "short",
                        //    "long"].
                        var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];

                        // 2. Let optionsPropIndex be the index of optionsProp within values.
                        var optionsPropIndex = arrIndexOf.call(values, optionsProp);

                        // 3. Let formatPropIndex be the index of formatProp within values.
                        var formatPropIndex = arrIndexOf.call(values, formatProp);

                        // 4. Let delta be max(min(formatPropIndex - optionsPropIndex, 2), -2).
                        var delta = Math.max(Math.min(formatPropIndex - optionsPropIndex, 2), -2);

                        {
                            // diverging from spec
                            // When the bestFit argument is true, subtract additional penalty where data types are not the same
                            if (formatPropIndex <= 1 && optionsPropIndex >= 2 || formatPropIndex >= 2 && optionsPropIndex <= 1) {
                                // 5. If delta = 2, decrease score by longMorePenalty.
                                if (delta > 0) score -= longMorePenalty;else if (delta < 0) score -= longLessPenalty;
                            } else {
                                // 5. If delta = 2, decrease score by longMorePenalty.
                                if (delta > 1) score -= shortMorePenalty;else if (delta < -1) score -= shortLessPenalty;
                            }
                        }
                    }
        }

        {
            // diverging to also take into consideration differences between 12 or 24 hours
            // which is special for the best fit only.
            if (format._.hour12 !== options.hour12) {
                score -= hour12Penalty;
            }
        }

        // d. If score > bestScore, then
        if (score > bestScore) {
            // i. Let bestScore be score.
            bestScore = score;
            // ii. Let bestFormat be format.
            bestFormat = format;
        }

        // e. Increase i by 1.
        i++;
    }

    // 13. Return bestFormat.
    return bestFormat;
}

/* 12.2.3 */internals.DateTimeFormat = {
    '[[availableLocales]]': [],
    '[[relevantExtensionKeys]]': ['ca', 'nu'],
    '[[localeData]]': {}
};

/**
 * When the supportedLocalesOf method of Intl.DateTimeFormat is called, the
 * following steps are taken:
 */
/* 12.2.2 */
defineProperty(Intl.DateTimeFormat, 'supportedLocalesOf', {
    configurable: true,
    writable: true,
    value: fnBind.call(function (locales) {
        // Bound functions only have the `this` value altered if being used as a constructor,
        // this lets us imitate a native function that has no constructor
        if (!hop.call(this, '[[availableLocales]]')) throw new TypeError('supportedLocalesOf() is not a constructor');

        // Create an object whose props can be used to restore the values of RegExp props
        var regexpRestore = createRegExpRestore(),


        // 1. If options is not provided, then let options be undefined.
        options = arguments[1],


        // 2. Let availableLocales be the value of the [[availableLocales]] internal
        //    property of the standard built-in object that is the initial value of
        //    Intl.NumberFormat.

        availableLocales = this['[[availableLocales]]'],


        // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
        //    abstract operation (defined in 9.2.1) with argument locales.
        requestedLocales = CanonicalizeLocaleList(locales);

        // Restore the RegExp properties
        regexpRestore();

        // 4. Return the result of calling the SupportedLocales abstract operation
        //    (defined in 9.2.8) with arguments availableLocales, requestedLocales,
        //    and options.
        return SupportedLocales(availableLocales, requestedLocales, options);
    }, internals.NumberFormat)
});

/**
 * This named accessor property returns a function that formats a number
 * according to the effective locale and the formatting options of this
 * DateTimeFormat object.
 */
/* 12.3.2 */defineProperty(Intl.DateTimeFormat.prototype, 'format', {
    configurable: true,
    get: GetFormatDateTime
});

function GetFormatDateTime() {
    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

    // Satisfy test 12.3_b
    if (!internal || !internal['[[initializedDateTimeFormat]]']) throw new TypeError('`this` value for format() is not an initialized Intl.DateTimeFormat object.');

    // The value of the [[Get]] attribute is a function that takes the following
    // steps:

    // 1. If the [[boundFormat]] internal property of this DateTimeFormat object
    //    is undefined, then:
    if (internal['[[boundFormat]]'] === undefined) {
        // a. Let F be a Function object, with internal properties set as
        //    specified for built-in functions in ES5, 15, or successor, and the
        //    length property set to 0, that takes the argument date and
        //    performs the following steps:
        var F = function F() {
            var date = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            //   i. If date is not provided or is undefined, then let x be the
            //      result as if by the expression Date.now() where Date.now is
            //      the standard built-in function defined in ES5, 15.9.4.4.
            //  ii. Else let x be ToNumber(date).
            // iii. Return the result of calling the FormatDateTime abstract
            //      operation (defined below) with arguments this and x.
            var x = date === undefined ? Date.now() : toNumber(date);
            return FormatDateTime(this, x);
        };
        // b. Let bind be the standard built-in function object defined in ES5,
        //    15.3.4.5.
        // c. Let bf be the result of calling the [[Call]] internal method of
        //    bind with F as the this value and an argument list containing
        //    the single item this.
        var bf = fnBind.call(F, this);
        // d. Set the [[boundFormat]] internal property of this NumberFormat
        //    object to bf.
        internal['[[boundFormat]]'] = bf;
    }
    // Return the value of the [[boundFormat]] internal property of this
    // NumberFormat object.
    return internal['[[boundFormat]]'];
}

function formatToParts$1() {
    var date = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

    if (!internal || !internal['[[initializedDateTimeFormat]]']) throw new TypeError('`this` value for formatToParts() is not an initialized Intl.DateTimeFormat object.');

    var x = date === undefined ? Date.now() : toNumber(date);
    return FormatToPartsDateTime(this, x);
}

Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatToParts', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: formatToParts$1
});

function CreateDateTimeParts(dateTimeFormat, x) {
    // 1. If x is not a finite Number, then throw a RangeError exception.
    if (!isFinite(x)) throw new RangeError('Invalid valid date passed to format');

    var internal = dateTimeFormat.__getInternalProperties(secret);

    // Creating restore point for properties on the RegExp object... please wait
    /* let regexpRestore = */createRegExpRestore(); // ###TODO: review this

    // 2. Let locale be the value of the [[locale]] internal property of dateTimeFormat.
    var locale = internal['[[locale]]'];

    // 3. Let nf be the result of creating a new NumberFormat object as if by the
    // expression new Intl.NumberFormat([locale], {useGrouping: false}) where
    // Intl.NumberFormat is the standard built-in constructor defined in 11.1.3.
    var nf = new Intl.NumberFormat([locale], { useGrouping: false });

    // 4. Let nf2 be the result of creating a new NumberFormat object as if by the
    // expression new Intl.NumberFormat([locale], {minimumIntegerDigits: 2, useGrouping:
    // false}) where Intl.NumberFormat is the standard built-in constructor defined in
    // 11.1.3.
    var nf2 = new Intl.NumberFormat([locale], { minimumIntegerDigits: 2, useGrouping: false });

    // 5. Let tm be the result of calling the ToLocalTime abstract operation (defined
    // below) with x, the value of the [[calendar]] internal property of dateTimeFormat,
    // and the value of the [[timeZone]] internal property of dateTimeFormat.
    var tm = ToLocalTime(x, internal['[[calendar]]'], internal['[[timeZone]]']);

    // 6. Let result be the value of the [[pattern]] internal property of dateTimeFormat.
    var pattern = internal['[[pattern]]'];

    // 7.
    var result = new List();

    // 8.
    var index = 0;

    // 9.
    var beginIndex = pattern.indexOf('{');

    // 10.
    var endIndex = 0;

    // Need the locale minus any extensions
    var dataLocale = internal['[[dataLocale]]'];

    // Need the calendar data from CLDR
    var localeData = internals.DateTimeFormat['[[localeData]]'][dataLocale].calendars;
    var ca = internal['[[calendar]]'];

    // 11.
    while (beginIndex !== -1) {
        var fv = void 0;
        // a.
        endIndex = pattern.indexOf('}', beginIndex);
        // b.
        if (endIndex === -1) {
            throw new Error('Unclosed pattern');
        }
        // c.
        if (beginIndex > index) {
            arrPush.call(result, {
                type: 'literal',
                value: pattern.substring(index, beginIndex)
            });
        }
        // d.
        var p = pattern.substring(beginIndex + 1, endIndex);
        // e.
        if (dateTimeComponents.hasOwnProperty(p)) {
            //   i. Let f be the value of the [[<p>]] internal property of dateTimeFormat.
            var f = internal['[[' + p + ']]'];
            //  ii. Let v be the value of tm.[[<p>]].
            var v = tm['[[' + p + ']]'];
            // iii. If p is "year" and v ≤ 0, then let v be 1 - v.
            if (p === 'year' && v <= 0) {
                v = 1 - v;
            }
            //  iv. If p is "month", then increase v by 1.
            else if (p === 'month') {
                    v++;
                }
                //   v. If p is "hour" and the value of the [[hour12]] internal property of
                //      dateTimeFormat is true, then
                else if (p === 'hour' && internal['[[hour12]]'] === true) {
                        // 1. Let v be v modulo 12.
                        v = v % 12;
                        // 2. If v is 0 and the value of the [[hourNo0]] internal property of
                        //    dateTimeFormat is true, then let v be 12.
                        if (v === 0 && internal['[[hourNo0]]'] === true) {
                            v = 12;
                        }
                    }

            //  vi. If f is "numeric", then
            if (f === 'numeric') {
                // 1. Let fv be the result of calling the FormatNumber abstract operation
                //    (defined in 11.3.2) with arguments nf and v.
                fv = FormatNumber(nf, v);
            }
            // vii. Else if f is "2-digit", then
            else if (f === '2-digit') {
                    // 1. Let fv be the result of calling the FormatNumber abstract operation
                    //    with arguments nf2 and v.
                    fv = FormatNumber(nf2, v);
                    // 2. If the length of fv is greater than 2, let fv be the substring of fv
                    //    containing the last two characters.
                    if (fv.length > 2) {
                        fv = fv.slice(-2);
                    }
                }
                // viii. Else if f is "narrow", "short", or "long", then let fv be a String
                //     value representing f in the desired form; the String value depends upon
                //     the implementation and the effective locale and calendar of
                //     dateTimeFormat. If p is "month", then the String value may also depend
                //     on whether dateTimeFormat has a [[day]] internal property. If p is
                //     "timeZoneName", then the String value may also depend on the value of
                //     the [[inDST]] field of tm.
                else if (f in dateWidths) {
                        switch (p) {
                            case 'month':
                                fv = resolveDateString(localeData, ca, 'months', f, tm['[[' + p + ']]']);
                                break;

                            case 'weekday':
                                try {
                                    fv = resolveDateString(localeData, ca, 'days', f, tm['[[' + p + ']]']);
                                    // fv = resolveDateString(ca.days, f)[tm['[['+ p +']]']];
                                } catch (e) {
                                    throw new Error('Could not find weekday data for locale ' + locale);
                                }
                                break;

                            case 'timeZoneName':
                                fv = ''; // ###TODO
                                break;

                            case 'era':
                                try {
                                    fv = resolveDateString(localeData, ca, 'eras', f, tm['[[' + p + ']]']);
                                } catch (e) {
                                    throw new Error('Could not find era data for locale ' + locale);
                                }
                                break;

                            default:
                                fv = tm['[[' + p + ']]'];
                        }
                    }
            // ix
            arrPush.call(result, {
                type: p,
                value: fv
            });
            // f.
        } else if (p === 'ampm') {
            // i.
            var _v = tm['[[hour]]'];
            // ii./iii.
            fv = resolveDateString(localeData, ca, 'dayPeriods', _v > 11 ? 'pm' : 'am', null);
            // iv.
            arrPush.call(result, {
                type: 'dayPeriod',
                value: fv
            });
            // g.
        } else {
            arrPush.call(result, {
                type: 'literal',
                value: pattern.substring(beginIndex, endIndex + 1)
            });
        }
        // h.
        index = endIndex + 1;
        // i.
        beginIndex = pattern.indexOf('{', index);
    }
    // 12.
    if (endIndex < pattern.length - 1) {
        arrPush.call(result, {
            type: 'literal',
            value: pattern.substr(endIndex + 1)
        });
    }
    // 13.
    return result;
}

/**
 * When the FormatDateTime abstract operation is called with arguments dateTimeFormat
 * (which must be an object initialized as a DateTimeFormat) and x (which must be a Number
 * value), it returns a String value representing x (interpreted as a time value as
 * specified in ES5, 15.9.1.1) according to the effective locale and the formatting
 * options of dateTimeFormat.
 */
function FormatDateTime(dateTimeFormat, x) {
    var parts = CreateDateTimeParts(dateTimeFormat, x);
    var result = '';

    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        result += part.value;
    }
    return result;
}

function FormatToPartsDateTime(dateTimeFormat, x) {
    var parts = CreateDateTimeParts(dateTimeFormat, x);
    var result = [];
    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        result.push({
            type: part.type,
            value: part.value
        });
    }
    return result;
}

/**
 * When the ToLocalTime abstract operation is called with arguments date, calendar, and
 * timeZone, the following steps are taken:
 */
function ToLocalTime(date, calendar, timeZone) {
    // 1. Apply calendrical calculations on date for the given calendar and time zone to
    //    produce weekday, era, year, month, day, hour, minute, second, and inDST values.
    //    The calculations should use best available information about the specified
    //    calendar and time zone. If the calendar is "gregory", then the calculations must
    //    match the algorithms specified in ES5, 15.9.1, except that calculations are not
    //    bound by the restrictions on the use of best available information on time zones
    //    for local time zone adjustment and daylight saving time adjustment imposed by
    //    ES5, 15.9.1.7 and 15.9.1.8.
    // ###TODO###
    var d = new Date(date),
        m = 'get' + (timeZone || '');

    // 2. Return a Record with fields [[weekday]], [[era]], [[year]], [[month]], [[day]],
    //    [[hour]], [[minute]], [[second]], and [[inDST]], each with the corresponding
    //    calculated value.
    return new Record({
        '[[weekday]]': d[m + 'Day'](),
        '[[era]]': +(d[m + 'FullYear']() >= 0),
        '[[year]]': d[m + 'FullYear'](),
        '[[month]]': d[m + 'Month'](),
        '[[day]]': d[m + 'Date'](),
        '[[hour]]': d[m + 'Hours'](),
        '[[minute]]': d[m + 'Minutes'](),
        '[[second]]': d[m + 'Seconds'](),
        '[[inDST]]': false // ###TODO###
    });
}

/**
 * The function returns a new object whose properties and attributes are set as if
 * constructed by an object literal assigning to each of the following properties the
 * value of the corresponding internal property of this DateTimeFormat object (see 12.4):
 * locale, calendar, numberingSystem, timeZone, hour12, weekday, era, year, month, day,
 * hour, minute, second, and timeZoneName. Properties whose corresponding internal
 * properties are not present are not assigned.
 */
/* 12.3.3 */defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
    writable: true,
    configurable: true,
    value: function value() {
        var prop = void 0,
            descs = new Record(),
            props = ['locale', 'calendar', 'numberingSystem', 'timeZone', 'hour12', 'weekday', 'era', 'year', 'month', 'day', 'hour', 'minute', 'second', 'timeZoneName'],
            internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

        // Satisfy test 12.3_b
        if (!internal || !internal['[[initializedDateTimeFormat]]']) throw new TypeError('`this` value for resolvedOptions() is not an initialized Intl.DateTimeFormat object.');

        for (var i = 0, max = props.length; i < max; i++) {
            if (hop.call(internal, prop = '[[' + props[i] + ']]')) descs[props[i]] = { value: internal[prop], writable: true, configurable: true, enumerable: true };
        }

        return objCreate({}, descs);
    }
});

var ls = Intl.__localeSensitiveProtos = {
    Number: {},
    Date: {}
};

/**
 * When the toLocaleString method is called with optional arguments locales and options,
 * the following steps are taken:
 */
/* 13.2.1 */ls.Number.toLocaleString = function () {
    // Satisfy test 13.2.1_1
    if (Object.prototype.toString.call(this) !== '[object Number]') throw new TypeError('`this` value must be a number for Number.prototype.toLocaleString()');

    // 1. Let x be this Number value (as defined in ES5, 15.7.4).
    // 2. If locales is not provided, then let locales be undefined.
    // 3. If options is not provided, then let options be undefined.
    // 4. Let numberFormat be the result of creating a new object as if by the
    //    expression new Intl.NumberFormat(locales, options) where
    //    Intl.NumberFormat is the standard built-in constructor defined in 11.1.3.
    // 5. Return the result of calling the FormatNumber abstract operation
    //    (defined in 11.3.2) with arguments numberFormat and x.
    return FormatNumber(new NumberFormatConstructor(arguments[0], arguments[1]), this);
};

/**
 * When the toLocaleString method is called with optional arguments locales and options,
 * the following steps are taken:
 */
/* 13.3.1 */ls.Date.toLocaleString = function () {
    // Satisfy test 13.3.0_1
    if (Object.prototype.toString.call(this) !== '[object Date]') throw new TypeError('`this` value must be a Date instance for Date.prototype.toLocaleString()');

    // 1. Let x be this time value (as defined in ES5, 15.9.5).
    var x = +this;

    // 2. If x is NaN, then return "Invalid Date".
    if (isNaN(x)) return 'Invalid Date';

    // 3. If locales is not provided, then let locales be undefined.
    var locales = arguments[0];

    // 4. If options is not provided, then let options be undefined.
    var options = arguments[1];

    // 5. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined in 12.1.1) with arguments options, "any", and "all".
    options = ToDateTimeOptions(options, 'any', 'all');

    // 6. Let dateTimeFormat be the result of creating a new object as if by the
    //    expression new Intl.DateTimeFormat(locales, options) where
    //    Intl.DateTimeFormat is the standard built-in constructor defined in 12.1.3.
    var dateTimeFormat = new DateTimeFormatConstructor(locales, options);

    // 7. Return the result of calling the FormatDateTime abstract operation (defined
    //    in 12.3.2) with arguments dateTimeFormat and x.
    return FormatDateTime(dateTimeFormat, x);
};

/**
 * When the toLocaleDateString method is called with optional arguments locales and
 * options, the following steps are taken:
 */
/* 13.3.2 */ls.Date.toLocaleDateString = function () {
    // Satisfy test 13.3.0_1
    if (Object.prototype.toString.call(this) !== '[object Date]') throw new TypeError('`this` value must be a Date instance for Date.prototype.toLocaleDateString()');

    // 1. Let x be this time value (as defined in ES5, 15.9.5).
    var x = +this;

    // 2. If x is NaN, then return "Invalid Date".
    if (isNaN(x)) return 'Invalid Date';

    // 3. If locales is not provided, then let locales be undefined.
    var locales = arguments[0],


    // 4. If options is not provided, then let options be undefined.
    options = arguments[1];

    // 5. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined in 12.1.1) with arguments options, "date", and "date".
    options = ToDateTimeOptions(options, 'date', 'date');

    // 6. Let dateTimeFormat be the result of creating a new object as if by the
    //    expression new Intl.DateTimeFormat(locales, options) where
    //    Intl.DateTimeFormat is the standard built-in constructor defined in 12.1.3.
    var dateTimeFormat = new DateTimeFormatConstructor(locales, options);

    // 7. Return the result of calling the FormatDateTime abstract operation (defined
    //    in 12.3.2) with arguments dateTimeFormat and x.
    return FormatDateTime(dateTimeFormat, x);
};

/**
 * When the toLocaleTimeString method is called with optional arguments locales and
 * options, the following steps are taken:
 */
/* 13.3.3 */ls.Date.toLocaleTimeString = function () {
    // Satisfy test 13.3.0_1
    if (Object.prototype.toString.call(this) !== '[object Date]') throw new TypeError('`this` value must be a Date instance for Date.prototype.toLocaleTimeString()');

    // 1. Let x be this time value (as defined in ES5, 15.9.5).
    var x = +this;

    // 2. If x is NaN, then return "Invalid Date".
    if (isNaN(x)) return 'Invalid Date';

    // 3. If locales is not provided, then let locales be undefined.
    var locales = arguments[0];

    // 4. If options is not provided, then let options be undefined.
    var options = arguments[1];

    // 5. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined in 12.1.1) with arguments options, "time", and "time".
    options = ToDateTimeOptions(options, 'time', 'time');

    // 6. Let dateTimeFormat be the result of creating a new object as if by the
    //    expression new Intl.DateTimeFormat(locales, options) where
    //    Intl.DateTimeFormat is the standard built-in constructor defined in 12.1.3.
    var dateTimeFormat = new DateTimeFormatConstructor(locales, options);

    // 7. Return the result of calling the FormatDateTime abstract operation (defined
    //    in 12.3.2) with arguments dateTimeFormat and x.
    return FormatDateTime(dateTimeFormat, x);
};

defineProperty(Intl, '__applyLocaleSensitivePrototypes', {
    writable: true,
    configurable: true,
    value: function value() {
        defineProperty(Number.prototype, 'toLocaleString', { writable: true, configurable: true, value: ls.Number.toLocaleString });
        // Need this here for IE 8, to avoid the _DontEnum_ bug
        defineProperty(Date.prototype, 'toLocaleString', { writable: true, configurable: true, value: ls.Date.toLocaleString });

        for (var k in ls.Date) {
            if (hop.call(ls.Date, k)) defineProperty(Date.prototype, k, { writable: true, configurable: true, value: ls.Date[k] });
        }
    }
});

/**
 * Can't really ship a single script with data for hundreds of locales, so we provide
 * this __addLocaleData method as a means for the developer to add the data on an
 * as-needed basis
 */
defineProperty(Intl, '__addLocaleData', {
    value: function value(data) {
        if (!IsStructurallyValidLanguageTag(data.locale)) throw new Error("Object passed doesn't identify itself with a valid language tag");

        addLocaleData(data, data.locale);
    }
});

function addLocaleData(data, tag) {
    // Both NumberFormat and DateTimeFormat require number data, so throw if it isn't present
    if (!data.number) throw new Error("Object passed doesn't contain locale data for Intl.NumberFormat");

    var locale = void 0,
        locales = [tag],
        parts = tag.split('-');

    // Create fallbacks for locale data with scripts, e.g. Latn, Hans, Vaii, etc
    if (parts.length > 2 && parts[1].length === 4) arrPush.call(locales, parts[0] + '-' + parts[2]);

    while (locale = arrShift.call(locales)) {
        // Add to NumberFormat internal properties as per 11.2.3
        arrPush.call(internals.NumberFormat['[[availableLocales]]'], locale);
        internals.NumberFormat['[[localeData]]'][locale] = data.number;

        // ...and DateTimeFormat internal properties as per 12.2.3
        if (data.date) {
            data.date.nu = data.number.nu;
            arrPush.call(internals.DateTimeFormat['[[availableLocales]]'], locale);
            internals.DateTimeFormat['[[localeData]]'][locale] = data.date;
        }
    }

    // If this is the first set of locale data added, make it the default
    if (defaultLocale === undefined) setDefaultLocale(tag);
}

defineProperty(Intl, '__disableRegExpRestore', {
    value: function value() {
        internals.disableRegExpRestore = true;
    }
});

module.exports = Intl;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],27:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],28:[function(require,module,exports){
'use strict';

var range; // Create a range object for efficently rendering strings to elements.
var NS_XHTML = 'http://www.w3.org/1999/xhtml';

var doc = typeof document === 'undefined' ? undefined : document;

var testEl = doc ?
    doc.body || doc.createElement('div') :
    {};

// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
var actualHasAttributeNS;

if (testEl.hasAttributeNS) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttributeNS(namespaceURI, name);
    };
} else if (testEl.hasAttribute) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttribute(name);
    };
} else {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.getAttributeNode(namespaceURI, name) != null;
    };
}

var hasAttributeNS = actualHasAttributeNS;


function toElement(str) {
    if (!range && doc.createRange) {
        range = doc.createRange();
        range.selectNode(doc.body);
    }

    var fragment;
    if (range && range.createContextualFragment) {
        fragment = range.createContextualFragment(str);
    } else {
        fragment = doc.createElement('body');
        fragment.innerHTML = str;
    }
    return fragment.childNodes[0];
}

/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 *
 * @param {Element} a
 * @param {Element} b The target element
 * @return {boolean}
 */
function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;

    if (fromNodeName === toNodeName) {
        return true;
    }

    if (toEl.actualize &&
        fromNodeName.charCodeAt(0) < 91 && /* from tag name is upper case */
        toNodeName.charCodeAt(0) > 90 /* target tag name is lower case */) {
        // If the target element is a virtual DOM node then we may need to normalize the tag name
        // before comparing. Normal HTML elements that are in the "http://www.w3.org/1999/xhtml"
        // are converted to upper case
        return fromNodeName === toNodeName.toUpperCase();
    } else {
        return false;
    }
}

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {Element}
 */
function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ?
        doc.createElement(name) :
        doc.createElementNS(namespaceURI, name);
}

/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}

function morphAttrs(fromNode, toNode) {
    var attrs = toNode.attributes;
    var i;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        attrName = attr.name;
        attrNamespaceURI = attr.namespaceURI;
        attrValue = attr.value;

        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            }
        } else {
            fromValue = fromNode.getAttribute(attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttribute(attrName, attrValue);
            }
        }
    }

    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    attrs = fromNode.attributes;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        if (attr.specified !== false) {
            attrName = attr.name;
            attrNamespaceURI = attr.namespaceURI;

            if (attrNamespaceURI) {
                attrName = attr.localName || attrName;

                if (!hasAttributeNS(toNode, attrNamespaceURI, attrName)) {
                    fromNode.removeAttributeNS(attrNamespaceURI, attrName);
                }
            } else {
                if (!hasAttributeNS(toNode, null, attrName)) {
                    fromNode.removeAttribute(attrName);
                }
            }
        }
    }
}

function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
        fromEl[name] = toEl[name];
        if (fromEl[name]) {
            fromEl.setAttribute(name, '');
        } else {
            fromEl.removeAttribute(name, '');
        }
    }
}

var specialElHandlers = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');

        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!hasAttributeNS(toEl, null, 'value')) {
            fromEl.removeAttribute('value');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue) {
            fromEl.value = newValue;
        }

        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                return;
            }

            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function(fromEl, toEl) {
        if (!hasAttributeNS(toEl, null, 'multiple')) {
            var selectedIndex = -1;
            var i = 0;
            var curChild = toEl.firstChild;
            while(curChild) {
                var nodeName = curChild.nodeName;
                if (nodeName && nodeName.toUpperCase() === 'OPTION') {
                    if (hasAttributeNS(curChild, null, 'selected')) {
                        selectedIndex = i;
                        break;
                    }
                    i++;
                }
                curChild = curChild.nextSibling;
            }

            fromEl.selectedIndex = i;
        }
    }
};

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

function noop() {}

function defaultGetNodeKey(node) {
    return node.id;
}

function morphdomFactory(morphAttrs) {

    return function morphdom(fromNode, toNode, options) {
        if (!options) {
            options = {};
        }

        if (typeof toNode === 'string') {
            if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
                var toNodeHtml = toNode;
                toNode = doc.createElement('html');
                toNode.innerHTML = toNodeHtml;
            } else {
                toNode = toElement(toNode);
            }
        }

        var getNodeKey = options.getNodeKey || defaultGetNodeKey;
        var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
        var onNodeAdded = options.onNodeAdded || noop;
        var onBeforeElUpdated = options.onBeforeElUpdated || noop;
        var onElUpdated = options.onElUpdated || noop;
        var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
        var onNodeDiscarded = options.onNodeDiscarded || noop;
        var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
        var childrenOnly = options.childrenOnly === true;

        // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
        var fromNodesLookup = {};
        var keyedRemovalList;

        function addKeyedRemoval(key) {
            if (keyedRemovalList) {
                keyedRemovalList.push(key);
            } else {
                keyedRemovalList = [key];
            }
        }

        function walkDiscardedChildNodes(node, skipKeyedNodes) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {

                    var key = undefined;

                    if (skipKeyedNodes && (key = getNodeKey(curChild))) {
                        // If we are skipping keyed nodes then we add the key
                        // to a list so that it can be handled at the very end.
                        addKeyedRemoval(key);
                    } else {
                        // Only report the node as discarded if it is not keyed. We do this because
                        // at the end we loop through all keyed elements that were unmatched
                        // and then discard them in one final pass.
                        onNodeDiscarded(curChild);
                        if (curChild.firstChild) {
                            walkDiscardedChildNodes(curChild, skipKeyedNodes);
                        }
                    }

                    curChild = curChild.nextSibling;
                }
            }
        }

        /**
         * Removes a DOM node out of the original DOM
         *
         * @param  {Node} node The node to remove
         * @param  {Node} parentNode The nodes parent
         * @param  {Boolean} skipKeyedNodes If true then elements with keys will be skipped and not discarded.
         * @return {undefined}
         */
        function removeNode(node, parentNode, skipKeyedNodes) {
            if (onBeforeNodeDiscarded(node) === false) {
                return;
            }

            if (parentNode) {
                parentNode.removeChild(node);
            }

            onNodeDiscarded(node);
            walkDiscardedChildNodes(node, skipKeyedNodes);
        }

        // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
        // function indexTree(root) {
        //     var treeWalker = document.createTreeWalker(
        //         root,
        //         NodeFilter.SHOW_ELEMENT);
        //
        //     var el;
        //     while((el = treeWalker.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
        //
        // function indexTree(node) {
        //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
        //     var el;
        //     while((el = nodeIterator.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        function indexTree(node) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {
                    var key = getNodeKey(curChild);
                    if (key) {
                        fromNodesLookup[key] = curChild;
                    }

                    // Walk recursively
                    indexTree(curChild);

                    curChild = curChild.nextSibling;
                }
            }
        }

        indexTree(fromNode);

        function handleNodeAdded(el) {
            onNodeAdded(el);

            var curChild = el.firstChild;
            while (curChild) {
                var nextSibling = curChild.nextSibling;

                var key = getNodeKey(curChild);
                if (key) {
                    var unmatchedFromEl = fromNodesLookup[key];
                    if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
                        curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
                        morphEl(unmatchedFromEl, curChild);
                    }
                }

                handleNodeAdded(curChild);
                curChild = nextSibling;
            }
        }

        function morphEl(fromEl, toEl, childrenOnly) {
            var toElKey = getNodeKey(toEl);
            var curFromNodeKey;

            if (toElKey) {
                // If an element with an ID is being morphed then it is will be in the final
                // DOM so clear it out of the saved elements collection
                delete fromNodesLookup[toElKey];
            }

            if (toNode.isSameNode && toNode.isSameNode(fromNode)) {
                return;
            }

            if (!childrenOnly) {
                if (onBeforeElUpdated(fromEl, toEl) === false) {
                    return;
                }

                morphAttrs(fromEl, toEl);
                onElUpdated(fromEl);

                if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
                    return;
                }
            }

            if (fromEl.nodeName !== 'TEXTAREA') {
                var curToNodeChild = toEl.firstChild;
                var curFromNodeChild = fromEl.firstChild;
                var curToNodeKey;

                var fromNextSibling;
                var toNextSibling;
                var matchingFromEl;

                outer: while (curToNodeChild) {
                    toNextSibling = curToNodeChild.nextSibling;
                    curToNodeKey = getNodeKey(curToNodeChild);

                    while (curFromNodeChild) {
                        fromNextSibling = curFromNodeChild.nextSibling;

                        if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        curFromNodeKey = getNodeKey(curFromNodeChild);

                        var curFromNodeType = curFromNodeChild.nodeType;

                        var isCompatible = undefined;

                        if (curFromNodeType === curToNodeChild.nodeType) {
                            if (curFromNodeType === ELEMENT_NODE) {
                                // Both nodes being compared are Element nodes

                                if (curToNodeKey) {
                                    // The target node has a key so we want to match it up with the correct element
                                    // in the original DOM tree
                                    if (curToNodeKey !== curFromNodeKey) {
                                        // The current element in the original DOM tree does not have a matching key so
                                        // let's check our lookup to see if there is a matching element in the original
                                        // DOM tree
                                        if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
                                            if (curFromNodeChild.nextSibling === matchingFromEl) {
                                                // Special case for single element removals. To avoid removing the original
                                                // DOM node out of the tree (since that can break CSS transitions, etc.),
                                                // we will instead discard the current node and wait until the next
                                                // iteration to properly match up the keyed target element with its matching
                                                // element in the original tree
                                                isCompatible = false;
                                            } else {
                                                // We found a matching keyed element somewhere in the original DOM tree.
                                                // Let's moving the original DOM node into the current position and morph
                                                // it.

                                                // NOTE: We use insertBefore instead of replaceChild because we want to go through
                                                // the `removeNode()` function for the node that is being discarded so that
                                                // all lifecycle hooks are correctly invoked
                                                fromEl.insertBefore(matchingFromEl, curFromNodeChild);

                                                fromNextSibling = curFromNodeChild.nextSibling;

                                                if (curFromNodeKey) {
                                                    // Since the node is keyed it might be matched up later so we defer
                                                    // the actual removal to later
                                                    addKeyedRemoval(curFromNodeKey);
                                                } else {
                                                    // NOTE: we skip nested keyed nodes from being removed since there is
                                                    //       still a chance they will be matched up later
                                                    removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                                                }

                                                curFromNodeChild = matchingFromEl;
                                            }
                                        } else {
                                            // The nodes are not compatible since the "to" node has a key and there
                                            // is no matching keyed node in the source tree
                                            isCompatible = false;
                                        }
                                    }
                                } else if (curFromNodeKey) {
                                    // The original has a key
                                    isCompatible = false;
                                }

                                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                                if (isCompatible) {
                                    // We found compatible DOM elements so transform
                                    // the current "from" node to match the current
                                    // target DOM node.
                                    morphEl(curFromNodeChild, curToNodeChild);
                                }

                            } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                                // Both nodes being compared are Text or Comment nodes
                                isCompatible = true;
                                // Simply update nodeValue on the original node to
                                // change the text value
                                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                                    curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                                }

                            }
                        }

                        if (isCompatible) {
                            // Advance both the "to" child and the "from" child since we found a match
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        // No compatible match so remove the old node from the DOM and continue trying to find a
                        // match in the original DOM. However, we only do this if the from node is not keyed
                        // since it is possible that a keyed node might match up with a node somewhere else in the
                        // target tree and we don't want to discard it just yet since it still might find a
                        // home in the final DOM tree. After everything is done we will remove any keyed nodes
                        // that didn't find a home
                        if (curFromNodeKey) {
                            // Since the node is keyed it might be matched up later so we defer
                            // the actual removal to later
                            addKeyedRemoval(curFromNodeKey);
                        } else {
                            // NOTE: we skip nested keyed nodes from being removed since there is
                            //       still a chance they will be matched up later
                            removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                        }

                        curFromNodeChild = fromNextSibling;
                    }

                    // If we got this far then we did not find a candidate match for
                    // our "to node" and we exhausted all of the children "from"
                    // nodes. Therefore, we will just append the current "to" node
                    // to the end
                    if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
                        fromEl.appendChild(matchingFromEl);
                        morphEl(matchingFromEl, curToNodeChild);
                    } else {
                        var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
                        if (onBeforeNodeAddedResult !== false) {
                            if (onBeforeNodeAddedResult) {
                                curToNodeChild = onBeforeNodeAddedResult;
                            }

                            if (curToNodeChild.actualize) {
                                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
                            }
                            fromEl.appendChild(curToNodeChild);
                            handleNodeAdded(curToNodeChild);
                        }
                    }

                    curToNodeChild = toNextSibling;
                    curFromNodeChild = fromNextSibling;
                }

                // We have processed all of the "to nodes". If curFromNodeChild is
                // non-null then we still have some from nodes left over that need
                // to be removed
                while (curFromNodeChild) {
                    fromNextSibling = curFromNodeChild.nextSibling;
                    if ((curFromNodeKey = getNodeKey(curFromNodeChild))) {
                        // Since the node is keyed it might be matched up later so we defer
                        // the actual removal to later
                        addKeyedRemoval(curFromNodeKey);
                    } else {
                        // NOTE: we skip nested keyed nodes from being removed since there is
                        //       still a chance they will be matched up later
                        removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                    }
                    curFromNodeChild = fromNextSibling;
                }
            }

            var specialElHandler = specialElHandlers[fromEl.nodeName];
            if (specialElHandler) {
                specialElHandler(fromEl, toEl);
            }
        } // END: morphEl(...)

        var morphedNode = fromNode;
        var morphedNodeType = morphedNode.nodeType;
        var toNodeType = toNode.nodeType;

        if (!childrenOnly) {
            // Handle the case where we are given two DOM nodes that are not
            // compatible (e.g. <div> --> <span> or <div> --> TEXT)
            if (morphedNodeType === ELEMENT_NODE) {
                if (toNodeType === ELEMENT_NODE) {
                    if (!compareNodeNames(fromNode, toNode)) {
                        onNodeDiscarded(fromNode);
                        morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
                    }
                } else {
                    // Going from an element node to a text node
                    morphedNode = toNode;
                }
            } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
                if (toNodeType === morphedNodeType) {
                    if (morphedNode.nodeValue !== toNode.nodeValue) {
                        morphedNode.nodeValue = toNode.nodeValue;
                    }

                    return morphedNode;
                } else {
                    // Text node to something else
                    morphedNode = toNode;
                }
            }
        }

        if (morphedNode === toNode) {
            // The "to node" was not compatible with the "from node" so we had to
            // toss out the "from node" and use the "to node"
            onNodeDiscarded(fromNode);
        } else {
            morphEl(morphedNode, toNode, childrenOnly);

            // We now need to loop over any keyed nodes that might need to be
            // removed. We only do the removal if we know that the keyed node
            // never found a match. When a keyed node is matched up we remove
            // it out of fromNodesLookup and we use fromNodesLookup to determine
            // if a keyed node has been matched up or not
            if (keyedRemovalList) {
                for (var i=0, len=keyedRemovalList.length; i<len; i++) {
                    var elToRemove = fromNodesLookup[keyedRemovalList[i]];
                    if (elToRemove) {
                        removeNode(elToRemove, elToRemove.parentNode, false);
                    }
                }
            }
        }

        if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
            if (morphedNode.actualize) {
                morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
            }
            // If we had to swap out the from node with a new node because the old
            // node was not compatible with the target node then we need to
            // replace the old DOM node in the original DOM tree. This is only
            // possible if the original DOM node was part of a DOM tree which
            // we know is the case if it has a parent node.
            fromNode.parentNode.replaceChild(morphedNode, fromNode);
        }

        return morphedNode;
    };
}

var morphdom = morphdomFactory(morphAttrs);

module.exports = morphdom;

},{}],29:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":4,"global/window":5}],30:[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path));
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {string}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */
  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */
  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    // use shadow dom when available
    var el = e.path ? e.path[0] : e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":32,"path-to-regexp":31}],31:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":27}],32:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],33:[function(require,module,exports){

var orig = document.title;

exports = module.exports = set;

function set(str) {
  var i = 1;
  var args = arguments;
  document.title = str.replace(/%[os]/g, function(_){
    switch (_) {
      case '%o':
        return orig;
      case '%s':
        return args[i++];
    }
  });
}

exports.reset = function(){
  set(orig);
};

},{}],34:[function(require,module,exports){
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements
var defaultEvents = require('./update-events.js') // default events to be copied when dom elements update

module.exports = bel

// TODO move this + defaultEvents to a new module once we receive more feedback
module.exports.update = function (fromNode, toNode, opts) {
  if (!opts) opts = {}
  if (opts.events !== false) {
    if (!opts.onBeforeElUpdated) opts.onBeforeElUpdated = copier
  }

  return morphdom(fromNode, toNode, opts)

  // morphdom only copies attributes. we decided we also wanted to copy events
  // that can be set via attributes
  function copier (f, t) {
    // copy events:
    var events = opts.events || defaultEvents
    for (var i = 0; i < events.length; i++) {
      var ev = events[i]
      if (t[ev]) { // if new element has a whitelisted attribute
        f[ev] = t[ev] // update existing element
      } else if (f[ev]) { // if existing element has it and new one doesnt
        f[ev] = undefined // remove it from existing element
      }
    }
    var oldValue = f.value
    var newValue = t.value
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') || f.nodeName === 'SELECT') {
      if (!newValue && !t.hasAttribute('value')) {
        t.value = f.value
      } else if (newValue !== oldValue) {
        f.value = newValue
      }
    } else if (f.nodeName === 'TEXTAREA') {
      if (t.getAttribute('value') === null) f.value = t.value
    }
  }
}

},{"./update-events.js":35,"bel":1,"morphdom":28}],35:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],36:[function(require,module,exports){
var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/', function (ctx, next) {
  title('Platzigram');
  var main = document.getElementById('main-container');

  var pictures = [{
    user: {
      username: 'Jose Rosales',
      avatar: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.0-9/10171745_10152117693756888_1635202168_n.jpg?oh=887935b2d746373ec3df853ecf5e2c1b&oe=5A32016B'
    },
    url: 'office.jpg',
    likes: 10,
    liked: false,
    createdAt: new Date()
  }, {
    user: {
      username: 'Jose Rosales',
      avatar: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.0-9/10171745_10152117693756888_1635202168_n.jpg?oh=887935b2d746373ec3df853ecf5e2c1b&oe=5A32016B'
    },
    url: 'office.jpg',
    likes: 2,
    liked: true,
    createdAt: new Date().setDate(new Date().getDate() - 10)
  }, {
    user: {
      username: 'Jose Rosales',
      avatar: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.0-9/10171745_10152117693756888_1635202168_n.jpg?oh=887935b2d746373ec3df853ecf5e2c1b&oe=5A32016B'
    },
    url: 'office.jpg',
    likes: 29,
    liked: false,
    createdAt: new Date().setDate(new Date().getDate() - 20)
  }];

  empty(main).appendChild(template(pictures));
});

},{"./template":37,"empty-element":3,"page":30,"title":33}],37:[function(require,module,exports){
var yo = require('yo-yo');
var layout = require('../layout');
var picture = require('../picture-card');

module.exports = function (pictures) {
  var el = yo`<div class="container timeline">
    <div class="row">
      <div class="col s12 m10 offset-m1 l6 offset-l3">
        ${pictures.map(function (pic) {
    return picture(pic);
  })}
      </div>
    </div>
  </div>`;

  return layout(el);
};

},{"../layout":40,"../picture-card":41,"yo-yo":34}],38:[function(require,module,exports){
var page = require('page');

require('./homepage');
require('./signup');
require('./signin');

page();

},{"./homepage":36,"./signin":42,"./signup":44,"page":30}],39:[function(require,module,exports){
var yo = require('yo-yo');

module.exports = function landing(box) {
  return yo`<div class="container landing">
    <div class="row">
      <div class="col s10 push-s1">
        <div class="row">
          <div class="col m5 hide-on-small-only">
            <img class="iphone" src="iphone.png" />
          </div>
          ${box}
        </div>
      </div>
    </div>
  </div>`;
};

},{"yo-yo":34}],40:[function(require,module,exports){
var yo = require('yo-yo');

module.exports = function layout(content) {
  return yo`<div>
	<nav class="header">
    <div class="nav-wrapper">
      <div class="container">
        <div class="row">
          <div class="col s12 m6 offset-m1">
            <a href="#" class="brand-logo platzigram">Platzigram</a>
          </div>
          <div class="col s2 m1 push-s10 push-m5">
            <a href="#" class="btn btn-large btn-flat dropdown-button" data-activates="drop-user">
              <i class="fa fa-user" aria-hidden="true"></i>
            </a>
            <ul id="drop-user" class="dropdown-content">
                <li><a href="#">Salir</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div class="content">
      ${content}
    </div>
  </div>`;
};

},{"yo-yo":34}],41:[function(require,module,exports){
var yo = require('yo-yo');

if (!window.Intl) {
  window.Intl = require('intl');
}
var IntlRelativeFormat = window.IntlRelativeFormat = require('intl-relativeformat');

require('intl-relativeformat/dist/locale-data/en.js');
require('intl-relativeformat/dist/locale-data/es.js');

var rf = new IntlRelativeFormat('es');

module.exports = function pictureCard(pic) {
  var el;

  function render(picture) {
    return yo`<div class="card ${picture.liked ? 'liked' : ''}">
      <div class="card-image">
        <img class="activator" src="${picture.url}">
      </div>
      <div class="card-content">
        <a href="/user/${picture.user.username}" class="card-title">
          <img src="${picture.user.avatar}" class="avatar" />
          <span class="username">${picture.user.username}</span>
        </a>
        <small class="right time">${rf.format(picture.createdAt)}</small>
        <p>
          <a class="left" href="#" onclick=${like.bind(null, true)}><i class="fa fa-heart-o" aria-hidden="true"></i></a>
          <a class="left" href="#" onclick=${like.bind(null, false)}><i class="fa fa-heart" aria-hidden="true"></i></a>
          <span class="left likes">${picture.likes} me gusta</span>
        </p>
      </div>
    </div>`;
  }

  function like(liked) {
    pic.liked = liked;
    pic.likes += liked ? 1 : -1;
    var newEl = render(pic);
    yo.update(el, newEl);
    return false;
  }

  el = render(pic);
  return el;
};

},{"intl":25,"intl-relativeformat":19,"intl-relativeformat/dist/locale-data/en.js":17,"intl-relativeformat/dist/locale-data/es.js":18,"yo-yo":34}],42:[function(require,module,exports){
var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/signin', function (ctx, next) {
  title('Platzigram - Signin');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});

},{"./template":43,"empty-element":3,"page":30,"title":33}],43:[function(require,module,exports){
var yo = require('yo-yo');
var landing = require('../landing');

var signinForm = yo`<div class="col s12 m7">
  <div class="row">
    <div class="signup-box">
      <h1 class="platzigram">Platzigram</h1>
      <form class="signup-form">
        <div class="section">
          <a class="btn btn-fb hide-on-small-only">Iniciar sesión con Facebook</a>
          <a class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i> Iniciar sesión</a>
        </div>
        <div class="divider"></div>
        <div class="section">
          <input type="text" name="username" placeholder="Nombre de usuario" />
          <input type="password" name="password" placeholder="Contraseña" />
          <button class="btn waves-effect waves-light btn-signup" type="submit">Inicia sesión</button>
        </div>
      </form>
    </div>
  </div>
  <div class="row">
    <div class="login-box">
      ¿No tienes una cuenta? <a href="/signup">Regístrate</a>
    </div>
  </div>
</div>`;

module.exports = landing(signinForm);

},{"../landing":39,"yo-yo":34}],44:[function(require,module,exports){
var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/signup', function (ctx, next) {
  title('Platzigram - Signup');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});

},{"./template":45,"empty-element":3,"page":30,"title":33}],45:[function(require,module,exports){
var yo = require('yo-yo');
var landing = require('../landing');

var signupForm = yo`<div class="col s12 m7">
  <div class="row">
    <div class="signup-box">
      <h1 class="platzigram">Platzigram</h1>
      <form class="signup-form">
        <h2>Regístrate para ver fotos de tus amigos estudiando en Platzi</h2>
        <div class="section">
          <a class="btn btn-fb hide-on-small-only">Iniciar sesión con Facebook</a>
          <a class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i> Iniciar sesión</a>
        </div>
        <div class="divider"></div>
        <div class="section">
          <input type="email" name="email" placeholder="Correo electrónico" />
          <input type="text" name="name" placeholder="Nombre completo" />
          <input type="text" name="username" placeholder="Nombre de usuario" />
          <input type="password" name="password" placeholder="Contraseña" />
          <button class="btn waves-effect waves-light btn-signup" type="submit">Regístrate</button>
        </div>
      </form>
    </div>
  </div>
  <div class="row">
    <div class="login-box">
      ¿Tienes una cuenta? <a href="/signin">Entrar</a>
    </div>
  </div>
</div>`;

module.exports = landing(signupForm);

},{"../landing":39,"yo-yo":34}]},{},[38])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmVsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9lbXB0eS1lbGVtZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyc2NyaXB0LWF0dHJpYnV0ZS10by1wcm9wZXJ0eS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcngvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0LXBhcnNlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLW1lc3NhZ2Vmb3JtYXQtcGFyc2VyL2xpYi9wYXJzZXIuanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ludGwtbWVzc2FnZWZvcm1hdC9saWIvY29tcGlsZXIuanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2xpYi9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2ludGwtbWVzc2FnZWZvcm1hdC9saWIvZW4uanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2xpYi9lczUuanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2xpYi9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2ludGwtbWVzc2FnZWZvcm1hdC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvaW50bC1yZWxhdGl2ZWZvcm1hdC9kaXN0L2xvY2FsZS1kYXRhL2VuLmpzIiwibm9kZV9tb2R1bGVzL2ludGwtcmVsYXRpdmVmb3JtYXQvZGlzdC9sb2NhbGUtZGF0YS9lcy5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLXJlbGF0aXZlZm9ybWF0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ludGwtcmVsYXRpdmVmb3JtYXQvbGliL2NvcmUuanMiLCJub2RlX21vZHVsZXMvaW50bC1yZWxhdGl2ZWZvcm1hdC9saWIvZGlmZi5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLXJlbGF0aXZlZm9ybWF0L2xpYi9lbi5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLXJlbGF0aXZlZm9ybWF0L2xpYi9lczUuanMiLCJub2RlX21vZHVsZXMvaW50bC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsL2xpYi9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbW9ycGhkb20vZGlzdC9tb3JwaGRvbS5qcyIsIm5vZGVfbW9kdWxlcy9vbi1sb2FkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhZ2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFnZS9ub2RlX21vZHVsZXMvcGF0aC10by1yZWdleHAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpdGxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3lvLXlvL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3lvLXlvL3VwZGF0ZS1ldmVudHMuanMiLCJzcmNcXGhvbWVwYWdlXFxpbmRleC5qcyIsInNyY1xcaG9tZXBhZ2VcXHRlbXBsYXRlLmpzIiwic3JjXFxpbmRleC5qcyIsInNyY1xcbGFuZGluZ1xcaW5kZXguanMiLCJzcmNcXGxheW91dFxcaW5kZXguanMiLCJzcmNcXHBpY3R1cmUtY2FyZFxcaW5kZXguanMiLCJzcmNcXHNpZ25pblxcaW5kZXguanMiLCJzcmNcXHNpZ25pblxcdGVtcGxhdGUuanMiLCJzcmNcXHNpZ251cFxcaW5kZXguanMiLCJzcmNcXHNpZ251cFxcdGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5MENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzl2SUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzltQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBLElBQUksT0FBTyxRQUFYLEFBQVcsQUFBUTtBQUNuQixJQUFJLFFBQVEsUUFBWixBQUFZLEFBQVE7QUFDcEIsSUFBSSxXQUFXLFFBQWYsQUFBZSxBQUFRO0FBQ3ZCLElBQUksUUFBUSxRQUFaLEFBQVksQUFBUTs7QUFFcEIsS0FBQSxBQUFLLEtBQUssVUFBQSxBQUFVLEtBQVYsQUFBZSxNQUFNLEFBQzdCO1FBQUEsQUFBTSxBQUNOO01BQUksT0FBTyxTQUFBLEFBQVMsZUFBcEIsQUFBVyxBQUF3QixBQUVuQzs7TUFBSTs7Z0JBRU0sQUFDTSxBQUNWO2NBSEosQUFDUSxBQUNKLEFBQ1EsQUFFVjs7U0FMRixBQUtPLEFBQ0w7V0FORixBQU1TLEFBQ1A7V0FQRixBQU9TLEFBQ1A7ZUFBVyxJQVRBLEFBQ2IsQUFDRSxBQU9XLEFBQUk7OztnQkFHVCxBQUNNLEFBQ1Y7Y0FISixBQUNRLEFBQ0osQUFDUSxBQUVWOztTQUxGLEFBS08sQUFDTDtXQU5GLEFBTVMsQUFDUDtXQVBGLEFBT1MsQUFDUDtlQUFXLElBQUEsQUFBSSxPQUFKLEFBQVcsUUFBUSxJQUFBLEFBQUksT0FBSixBQUFXLFlBbkI5QixBQVdiLEFBQ0UsQUFPVyxBQUEwQzs7O2dCQUcvQyxBQUNNLEFBQ1Y7Y0FISixBQUNRLEFBQ0osQUFDUSxBQUVWOztTQUxGLEFBS08sQUFDTDtXQU5GLEFBTVMsQUFDUDtXQVBGLEFBT1MsQUFDUDtlQUFXLElBQUEsQUFBSSxPQUFKLEFBQVcsUUFBUSxJQUFBLEFBQUksT0FBSixBQUFXLFlBN0I3QyxBQUFlLEFBcUJiLEFBQ0UsQUFPVyxBQUEwQyxBQUl6RDs7O1FBQUEsQUFBTSxNQUFOLEFBQVksWUFBWSxTQXJDMUIsQUFxQ0UsQUFBd0IsQUFBUyxBQUNsQzs7OztBQzNDRCxJQUFJLEtBQUssUUFBVCxBQUFTLEFBQVE7QUFDakIsSUFBSSxTQUFTLFFBQWIsQUFBYSxBQUFRO0FBQ3JCLElBQUksVUFBVSxRQUFkLEFBQWMsQUFBUTs7QUFFdEIsT0FBQSxBQUFPLFVBQVUsVUFBQSxBQUFVLFVBQVUsQUFDbkM7TUFBSSxLQUFLLEFBQUc7OzttQkFHSixBQUFTLElBQUksVUFBQSxBQUFVLEtBQUssQUFDNUI7V0FBTyxRQUpmLEFBR1EsQUFDQSxBQUFPLEFBQVEsQUFDaEIsQUFBRSxBQUtUOzs7Ozs7U0FBTyxPQVhULEFBV0UsQUFBTyxBQUFPLEFBQ2Y7Ozs7QUNoQkQsSUFBSSxPQUFPLFFBQVgsQUFBVyxBQUFROztBQUVuQixRQUFBLEFBQVE7QUFDUixRQUFBLEFBQVE7QUFDUixRQUFBLEFBQVE7O0FBRVI7OztBQ05BLElBQUksS0FBSyxRQUFULEFBQVMsQUFBUTs7QUFFakIsT0FBQSxBQUFPLFVBQVUsU0FBQSxBQUFTLFFBQVQsQUFBaUIsS0FBSyxBQUNyQztTQUFPLEFBQUc7Ozs7Ozs7WUFEWixBQUNFLEFBT1UsQUFBSSxBQUtmOzs7Ozs7OztBQ2ZELElBQUksS0FBSyxRQUFULEFBQVMsQUFBUTs7QUFFakIsT0FBQSxBQUFPLFVBQVUsU0FBQSxBQUFTLE9BQVQsQUFBZ0IsU0FBUyxBQUN4QztTQUFPLEFBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQURaLEFBQ0UsQUFxQk0sQUFBUSxBQUdmOzs7Ozs7QUMzQkQsSUFBSSxLQUFLLFFBQVQsQUFBUyxBQUFROztBQUVqQixJQUFJLENBQUMsT0FBTCxBQUFZLE1BQUssQUFDZjtTQUFBLEFBQU8sT0FBTyxRQUFkLEFBQWMsQUFBUSxBQUN2Qjs7QUFDRCxJQUFJLHFCQUFxQixPQUFBLEFBQU8scUJBQXFCLFFBQXJELEFBQXFELEFBQVE7O0FBRTdELFFBQUEsQUFBUTtBQUNSLFFBQUEsQUFBUTs7QUFFUixJQUFJLEtBQUssSUFBQSxBQUFJLG1CQUFiLEFBQVMsQUFBdUI7O0FBRWhDLE9BQUEsQUFBTyxVQUFVLFNBQUEsQUFBUyxZQUFULEFBQXFCLEtBQUssQUFDekM7TUFBQSxBQUFJLEFBRUo7O1dBQUEsQUFBUyxPQUFULEFBQWdCLFNBQVMsQUFDdkI7V0FBTyxBQUFHLHNCQUFtQixRQUFBLEFBQVEsUUFBUixBQUFnQixVQUFVLEFBQUc7O3NDQUV4QixRQUFRLEFBQUk7Ozt5QkFHekIsUUFBQSxBQUFRLEtBQUssQUFBUztzQkFDekIsUUFBQSxBQUFRLEtBQUssQUFBTzttQ0FDUCxRQUFBLEFBQVEsS0FBSyxBQUFTOztvQ0FFckIsR0FBQSxBQUFHLE9BQU8sUUFBVixBQUFrQixBQUFXOzs2Q0FFcEIsS0FBQSxBQUFLLEtBQUwsQUFBVSxNQUFWLEFBQWdCLEFBQU07NkNBQ3RCLEtBQUEsQUFBSyxLQUFMLEFBQVUsTUFBVixBQUFnQixBQUFPO3FDQUMvQixRQWJqQyxBQWF5QyxBQUFNLEFBSWhELEFBRUQ7Ozs7OztXQUFBLEFBQVMsS0FBVCxBQUFjLE9BQU8sQUFDbkI7UUFBQSxBQUFJLFFBQUosQUFBWSxBQUNaO1FBQUEsQUFBSSxTQUFTLFFBQUEsQUFBUSxJQUFJLENBQXpCLEFBQTBCLEFBQzFCO1FBQUksUUFBUSxPQUFaLEFBQVksQUFBTyxBQUNuQjtPQUFBLEFBQUcsT0FBSCxBQUFVLElBQVYsQUFBYyxBQUNkO1dBQUEsQUFBTyxBQUNSLEFBRUQ7OztPQUFLLE9BQUwsQUFBSyxBQUFPLEFBQ1o7U0FoQ0YsQUFnQ0UsQUFBTyxBQUNSOzs7O0FDN0NELElBQUksT0FBTyxRQUFYLEFBQVcsQUFBUTtBQUNuQixJQUFJLFFBQVEsUUFBWixBQUFZLEFBQVE7QUFDcEIsSUFBSSxXQUFXLFFBQWYsQUFBZSxBQUFRO0FBQ3ZCLElBQUksUUFBUSxRQUFaLEFBQVksQUFBUTs7QUFFcEIsS0FBQSxBQUFLLFdBQVcsVUFBQSxBQUFVLEtBQVYsQUFBZSxNQUFNLEFBQ25DO1FBQUEsQUFBTSxBQUNOO01BQUksT0FBTyxTQUFBLEFBQVMsZUFBcEIsQUFBVyxBQUF3QixBQUNuQztRQUFBLEFBQU0sTUFBTixBQUFZLFlBSGQsQUFHRSxBQUF3QixBQUN6Qjs7OztBQ1RELElBQUksS0FBSyxRQUFULEFBQVMsQUFBUTtBQUNqQixJQUFJLFVBQVUsUUFBZCxBQUFjLEFBQVE7O0FBRXRCLElBQUksYUFBSixBQUFpQixBQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJwQixPQUFBLEFBQU8sVUFBVSxRQUFqQixBQUFpQixBQUFROzs7QUM1QnpCLElBQUksT0FBTyxRQUFYLEFBQVcsQUFBUTtBQUNuQixJQUFJLFFBQVEsUUFBWixBQUFZLEFBQVE7QUFDcEIsSUFBSSxXQUFXLFFBQWYsQUFBZSxBQUFRO0FBQ3ZCLElBQUksUUFBUSxRQUFaLEFBQVksQUFBUTs7QUFFcEIsS0FBQSxBQUFLLFdBQVcsVUFBQSxBQUFVLEtBQVYsQUFBZSxNQUFNLEFBQ25DO1FBQUEsQUFBTSxBQUNOO01BQUksT0FBTyxTQUFBLEFBQVMsZUFBcEIsQUFBVyxBQUF3QixBQUNuQztRQUFBLEFBQU0sTUFBTixBQUFZLFlBSGQsQUFHRSxBQUF3QixBQUN6Qjs7OztBQ1RELElBQUksS0FBSyxRQUFULEFBQVMsQUFBUTtBQUNqQixJQUFJLFVBQVUsUUFBZCxBQUFjLEFBQVE7O0FBRXRCLElBQUksYUFBSixBQUFpQixBQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJwQixPQUFBLEFBQU8sVUFBVSxRQUFqQixBQUFpQixBQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpXG52YXIgaHlwZXJ4ID0gcmVxdWlyZSgnaHlwZXJ4JylcbnZhciBvbmxvYWQgPSByZXF1aXJlKCdvbi1sb2FkJylcblxudmFyIFNWR05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xudmFyIFhMSU5LTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaydcblxudmFyIEJPT0xfUFJPUFMgPSB7XG4gIGF1dG9mb2N1czogMSxcbiAgY2hlY2tlZDogMSxcbiAgZGVmYXVsdGNoZWNrZWQ6IDEsXG4gIGRpc2FibGVkOiAxLFxuICBmb3Jtbm92YWxpZGF0ZTogMSxcbiAgaW5kZXRlcm1pbmF0ZTogMSxcbiAgcmVhZG9ubHk6IDEsXG4gIHJlcXVpcmVkOiAxLFxuICBzZWxlY3RlZDogMSxcbiAgd2lsbHZhbGlkYXRlOiAxXG59XG52YXIgQ09NTUVOVF9UQUcgPSAnIS0tJ1xudmFyIFNWR19UQUdTID0gW1xuICAnc3ZnJyxcbiAgJ2FsdEdseXBoJywgJ2FsdEdseXBoRGVmJywgJ2FsdEdseXBoSXRlbScsICdhbmltYXRlJywgJ2FuaW1hdGVDb2xvcicsXG4gICdhbmltYXRlTW90aW9uJywgJ2FuaW1hdGVUcmFuc2Zvcm0nLCAnY2lyY2xlJywgJ2NsaXBQYXRoJywgJ2NvbG9yLXByb2ZpbGUnLFxuICAnY3Vyc29yJywgJ2RlZnMnLCAnZGVzYycsICdlbGxpcHNlJywgJ2ZlQmxlbmQnLCAnZmVDb2xvck1hdHJpeCcsXG4gICdmZUNvbXBvbmVudFRyYW5zZmVyJywgJ2ZlQ29tcG9zaXRlJywgJ2ZlQ29udm9sdmVNYXRyaXgnLCAnZmVEaWZmdXNlTGlnaHRpbmcnLFxuICAnZmVEaXNwbGFjZW1lbnRNYXAnLCAnZmVEaXN0YW50TGlnaHQnLCAnZmVGbG9vZCcsICdmZUZ1bmNBJywgJ2ZlRnVuY0InLFxuICAnZmVGdW5jRycsICdmZUZ1bmNSJywgJ2ZlR2F1c3NpYW5CbHVyJywgJ2ZlSW1hZ2UnLCAnZmVNZXJnZScsICdmZU1lcmdlTm9kZScsXG4gICdmZU1vcnBob2xvZ3knLCAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsXG4gICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLCAnZmVUdXJidWxlbmNlJywgJ2ZpbHRlcicsICdmb250JywgJ2ZvbnQtZmFjZScsXG4gICdmb250LWZhY2UtZm9ybWF0JywgJ2ZvbnQtZmFjZS1uYW1lJywgJ2ZvbnQtZmFjZS1zcmMnLCAnZm9udC1mYWNlLXVyaScsXG4gICdmb3JlaWduT2JqZWN0JywgJ2cnLCAnZ2x5cGgnLCAnZ2x5cGhSZWYnLCAnaGtlcm4nLCAnaW1hZ2UnLCAnbGluZScsXG4gICdsaW5lYXJHcmFkaWVudCcsICdtYXJrZXInLCAnbWFzaycsICdtZXRhZGF0YScsICdtaXNzaW5nLWdseXBoJywgJ21wYXRoJyxcbiAgJ3BhdGgnLCAncGF0dGVybicsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JhZGlhbEdyYWRpZW50JywgJ3JlY3QnLFxuICAnc2V0JywgJ3N0b3AnLCAnc3dpdGNoJywgJ3N5bWJvbCcsICd0ZXh0JywgJ3RleHRQYXRoJywgJ3RpdGxlJywgJ3RyZWYnLFxuICAndHNwYW4nLCAndXNlJywgJ3ZpZXcnLCAndmtlcm4nXG5dXG5cbmZ1bmN0aW9uIGJlbENyZWF0ZUVsZW1lbnQgKHRhZywgcHJvcHMsIGNoaWxkcmVuKSB7XG4gIHZhciBlbFxuXG4gIC8vIElmIGFuIHN2ZyB0YWcsIGl0IG5lZWRzIGEgbmFtZXNwYWNlXG4gIGlmIChTVkdfVEFHUy5pbmRleE9mKHRhZykgIT09IC0xKSB7XG4gICAgcHJvcHMubmFtZXNwYWNlID0gU1ZHTlNcbiAgfVxuXG4gIC8vIElmIHdlIGFyZSB1c2luZyBhIG5hbWVzcGFjZVxuICB2YXIgbnMgPSBmYWxzZVxuICBpZiAocHJvcHMubmFtZXNwYWNlKSB7XG4gICAgbnMgPSBwcm9wcy5uYW1lc3BhY2VcbiAgICBkZWxldGUgcHJvcHMubmFtZXNwYWNlXG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIGVsZW1lbnRcbiAgaWYgKG5zKSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHRhZylcbiAgfSBlbHNlIGlmICh0YWcgPT09IENPTU1FTlRfVEFHKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQocHJvcHMuY29tbWVudClcbiAgfSBlbHNlIHtcbiAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKVxuICB9XG5cbiAgLy8gSWYgYWRkaW5nIG9ubG9hZCBldmVudHNcbiAgaWYgKHByb3BzLm9ubG9hZCB8fCBwcm9wcy5vbnVubG9hZCkge1xuICAgIHZhciBsb2FkID0gcHJvcHMub25sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgdmFyIHVubG9hZCA9IHByb3BzLm9udW5sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgb25sb2FkKGVsLCBmdW5jdGlvbiBiZWxPbmxvYWQgKCkge1xuICAgICAgbG9hZChlbClcbiAgICB9LCBmdW5jdGlvbiBiZWxPbnVubG9hZCAoKSB7XG4gICAgICB1bmxvYWQoZWwpXG4gICAgfSxcbiAgICAvLyBXZSBoYXZlIHRvIHVzZSBub24tc3RhbmRhcmQgYGNhbGxlcmAgdG8gZmluZCB3aG8gaW52b2tlcyBgYmVsQ3JlYXRlRWxlbWVudGBcbiAgICBiZWxDcmVhdGVFbGVtZW50LmNhbGxlci5jYWxsZXIuY2FsbGVyKVxuICAgIGRlbGV0ZSBwcm9wcy5vbmxvYWRcbiAgICBkZWxldGUgcHJvcHMub251bmxvYWRcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgcHJvcGVydGllc1xuICBmb3IgKHZhciBwIGluIHByb3BzKSB7XG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICB2YXIga2V5ID0gcC50b0xvd2VyQ2FzZSgpXG4gICAgICB2YXIgdmFsID0gcHJvcHNbcF1cbiAgICAgIC8vIE5vcm1hbGl6ZSBjbGFzc05hbWVcbiAgICAgIGlmIChrZXkgPT09ICdjbGFzc25hbWUnKSB7XG4gICAgICAgIGtleSA9ICdjbGFzcydcbiAgICAgICAgcCA9ICdjbGFzcydcbiAgICAgIH1cbiAgICAgIC8vIFRoZSBmb3IgYXR0cmlidXRlIGdldHMgdHJhbnNmb3JtZWQgdG8gaHRtbEZvciwgYnV0IHdlIGp1c3Qgc2V0IGFzIGZvclxuICAgICAgaWYgKHAgPT09ICdodG1sRm9yJykge1xuICAgICAgICBwID0gJ2ZvcidcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgaXMgYm9vbGVhbiwgc2V0IGl0c2VsZiB0byB0aGUga2V5XG4gICAgICBpZiAoQk9PTF9QUk9QU1trZXldKSB7XG4gICAgICAgIGlmICh2YWwgPT09ICd0cnVlJykgdmFsID0ga2V5XG4gICAgICAgIGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykgY29udGludWVcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgcHJlZmVycyBiZWluZyBzZXQgZGlyZWN0bHkgdnMgc2V0QXR0cmlidXRlXG4gICAgICBpZiAoa2V5LnNsaWNlKDAsIDIpID09PSAnb24nKSB7XG4gICAgICAgIGVsW3BdID0gdmFsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBpZiAocCA9PT0gJ3hsaW5rOmhyZWYnKSB7XG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhYTElOS05TLCBwLCB2YWwpXG4gICAgICAgICAgfSBlbHNlIGlmICgvXnhtbG5zKCR8OikvaS50ZXN0KHApKSB7XG4gICAgICAgICAgICAvLyBza2lwIHhtbG5zIGRlZmluaXRpb25zXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIHAsIHZhbClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwuc2V0QXR0cmlidXRlKHAsIHZhbClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZENoaWxkIChjaGlsZHMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2hpbGRzKSkgcmV0dXJuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBub2RlID0gY2hpbGRzW2ldXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlKSkge1xuICAgICAgICBhcHBlbmRDaGlsZChub2RlKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdudW1iZXInIHx8XG4gICAgICAgIHR5cGVvZiBub2RlID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgdHlwZW9mIG5vZGUgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgbm9kZSBpbnN0YW5jZW9mIERhdGUgfHxcbiAgICAgICAgbm9kZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBub2RlID0gbm9kZS50b1N0cmluZygpXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGVsLmxhc3RDaGlsZCAmJiBlbC5sYXN0Q2hpbGQubm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcbiAgICAgICAgICBlbC5sYXN0Q2hpbGQubm9kZVZhbHVlICs9IG5vZGVcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuICAgICAgfVxuXG4gICAgICBpZiAobm9kZSAmJiBub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGFwcGVuZENoaWxkKGNoaWxkcmVuKVxuXG4gIHJldHVybiBlbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGh5cGVyeChiZWxDcmVhdGVFbGVtZW50LCB7Y29tbWVudHM6IHRydWV9KVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVFbGVtZW50ID0gYmVsQ3JlYXRlRWxlbWVudFxuIiwiIiwiLyogZ2xvYmFsIEhUTUxFbGVtZW50ICovXG5cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVtcHR5RWxlbWVudCAoZWxlbWVudCkge1xuICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYW4gZWxlbWVudCcpXG4gIH1cblxuICB2YXIgbm9kZVxuICB3aGlsZSAoKG5vZGUgPSBlbGVtZW50Lmxhc3RDaGlsZCkpIGVsZW1lbnQucmVtb3ZlQ2hpbGQobm9kZSlcbiAgcmV0dXJuIGVsZW1lbnRcbn1cbiIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbnZhciBkb2NjeTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkb2NjeSA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG4iLCJ2YXIgd2luO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIHdpbiA9IHNlbGY7XG59IGVsc2Uge1xuICAgIHdpbiA9IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbjtcbiIsIm1vZHVsZS5leHBvcnRzID0gYXR0cmlidXRlVG9Qcm9wZXJ0eVxuXG52YXIgdHJhbnNmb3JtID0ge1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2Zvcic6ICdodG1sRm9yJyxcbiAgJ2h0dHAtZXF1aXYnOiAnaHR0cEVxdWl2J1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVUb1Byb3BlcnR5IChoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGFnTmFtZSwgYXR0cnMsIGNoaWxkcmVuKSB7XG4gICAgZm9yICh2YXIgYXR0ciBpbiBhdHRycykge1xuICAgICAgaWYgKGF0dHIgaW4gdHJhbnNmb3JtKSB7XG4gICAgICAgIGF0dHJzW3RyYW5zZm9ybVthdHRyXV0gPSBhdHRyc1thdHRyXVxuICAgICAgICBkZWxldGUgYXR0cnNbYXR0cl1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGgodGFnTmFtZSwgYXR0cnMsIGNoaWxkcmVuKVxuICB9XG59XG4iLCJ2YXIgYXR0clRvUHJvcCA9IHJlcXVpcmUoJ2h5cGVyc2NyaXB0LWF0dHJpYnV0ZS10by1wcm9wZXJ0eScpXG5cbnZhciBWQVIgPSAwLCBURVhUID0gMSwgT1BFTiA9IDIsIENMT1NFID0gMywgQVRUUiA9IDRcbnZhciBBVFRSX0tFWSA9IDUsIEFUVFJfS0VZX1cgPSA2XG52YXIgQVRUUl9WQUxVRV9XID0gNywgQVRUUl9WQUxVRSA9IDhcbnZhciBBVFRSX1ZBTFVFX1NRID0gOSwgQVRUUl9WQUxVRV9EUSA9IDEwXG52YXIgQVRUUl9FUSA9IDExLCBBVFRSX0JSRUFLID0gMTJcbnZhciBDT01NRU5UID0gMTNcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fVxuICB2YXIgY29uY2F0ID0gb3B0cy5jb25jYXQgfHwgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gU3RyaW5nKGEpICsgU3RyaW5nKGIpXG4gIH1cbiAgaWYgKG9wdHMuYXR0clRvUHJvcCAhPT0gZmFsc2UpIHtcbiAgICBoID0gYXR0clRvUHJvcChoKVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChzdHJpbmdzKSB7XG4gICAgdmFyIHN0YXRlID0gVEVYVCwgcmVnID0gJydcbiAgICB2YXIgYXJnbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHZhciBwYXJ0cyA9IFtdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpIDwgYXJnbGVuIC0gMSkge1xuICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2krMV1cbiAgICAgICAgdmFyIHAgPSBwYXJzZShzdHJpbmdzW2ldKVxuICAgICAgICB2YXIgeHN0YXRlID0gc3RhdGVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSkgeHN0YXRlID0gQVRUUl9WQUxVRVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFJfVkFMVUVfVykgeHN0YXRlID0gQVRUUl9WQUxVRVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSKSB4c3RhdGUgPSBBVFRSX0tFWVxuICAgICAgICBwLnB1c2goWyBWQVIsIHhzdGF0ZSwgYXJnIF0pXG4gICAgICAgIHBhcnRzLnB1c2guYXBwbHkocGFydHMsIHApXG4gICAgICB9IGVsc2UgcGFydHMucHVzaC5hcHBseShwYXJ0cywgcGFyc2Uoc3RyaW5nc1tpXSkpXG4gICAgfVxuXG4gICAgdmFyIHRyZWUgPSBbbnVsbCx7fSxbXV1cbiAgICB2YXIgc3RhY2sgPSBbW3RyZWUsLTFdXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXIgPSBzdGFja1tzdGFjay5sZW5ndGgtMV1bMF1cbiAgICAgIHZhciBwID0gcGFydHNbaV0sIHMgPSBwWzBdXG4gICAgICBpZiAocyA9PT0gT1BFTiAmJiAvXlxcLy8udGVzdChwWzFdKSkge1xuICAgICAgICB2YXIgaXggPSBzdGFja1tzdGFjay5sZW5ndGgtMV1bMV1cbiAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBzdGFjay5wb3AoKVxuICAgICAgICAgIHN0YWNrW3N0YWNrLmxlbmd0aC0xXVswXVsyXVtpeF0gPSBoKFxuICAgICAgICAgICAgY3VyWzBdLCBjdXJbMV0sIGN1clsyXS5sZW5ndGggPyBjdXJbMl0gOiB1bmRlZmluZWRcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gT1BFTikge1xuICAgICAgICB2YXIgYyA9IFtwWzFdLHt9LFtdXVxuICAgICAgICBjdXJbMl0ucHVzaChjKVxuICAgICAgICBzdGFjay5wdXNoKFtjLGN1clsyXS5sZW5ndGgtMV0pXG4gICAgICB9IGVsc2UgaWYgKHMgPT09IEFUVFJfS0VZIHx8IChzID09PSBWQVIgJiYgcFsxXSA9PT0gQVRUUl9LRVkpKSB7XG4gICAgICAgIHZhciBrZXkgPSAnJ1xuICAgICAgICB2YXIgY29weUtleVxuICAgICAgICBmb3IgKDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHBhcnRzW2ldWzBdID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgICAga2V5ID0gY29uY2F0KGtleSwgcGFydHNbaV1bMV0pXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJ0c1tpXVswXSA9PT0gVkFSICYmIHBhcnRzW2ldWzFdID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJ0c1tpXVsyXSA9PT0gJ29iamVjdCcgJiYgIWtleSkge1xuICAgICAgICAgICAgICBmb3IgKGNvcHlLZXkgaW4gcGFydHNbaV1bMl0pIHtcbiAgICAgICAgICAgICAgICBpZiAocGFydHNbaV1bMl0uaGFzT3duUHJvcGVydHkoY29weUtleSkgJiYgIWN1clsxXVtjb3B5S2V5XSkge1xuICAgICAgICAgICAgICAgICAgY3VyWzFdW2NvcHlLZXldID0gcGFydHNbaV1bMl1bY29weUtleV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGtleSA9IGNvbmNhdChrZXksIHBhcnRzW2ldWzJdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBicmVha1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0c1tpXVswXSA9PT0gQVRUUl9FUSkgaSsrXG4gICAgICAgIHZhciBqID0gaVxuICAgICAgICBmb3IgKDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHBhcnRzW2ldWzBdID09PSBBVFRSX1ZBTFVFIHx8IHBhcnRzW2ldWzBdID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgICAgaWYgKCFjdXJbMV1ba2V5XSkgY3VyWzFdW2tleV0gPSBzdHJmbihwYXJ0c1tpXVsxXSlcbiAgICAgICAgICAgIGVsc2UgY3VyWzFdW2tleV0gPSBjb25jYXQoY3VyWzFdW2tleV0sIHBhcnRzW2ldWzFdKVxuICAgICAgICAgIH0gZWxzZSBpZiAocGFydHNbaV1bMF0gPT09IFZBUlxuICAgICAgICAgICYmIChwYXJ0c1tpXVsxXSA9PT0gQVRUUl9WQUxVRSB8fCBwYXJ0c1tpXVsxXSA9PT0gQVRUUl9LRVkpKSB7XG4gICAgICAgICAgICBpZiAoIWN1clsxXVtrZXldKSBjdXJbMV1ba2V5XSA9IHN0cmZuKHBhcnRzW2ldWzJdKVxuICAgICAgICAgICAgZWxzZSBjdXJbMV1ba2V5XSA9IGNvbmNhdChjdXJbMV1ba2V5XSwgcGFydHNbaV1bMl0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoICYmICFjdXJbMV1ba2V5XSAmJiBpID09PSBqXG4gICAgICAgICAgICAmJiAocGFydHNbaV1bMF0gPT09IENMT1NFIHx8IHBhcnRzW2ldWzBdID09PSBBVFRSX0JSRUFLKSkge1xuICAgICAgICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9pbmZyYXN0cnVjdHVyZS5odG1sI2Jvb2xlYW4tYXR0cmlidXRlc1xuICAgICAgICAgICAgICAvLyBlbXB0eSBzdHJpbmcgaXMgZmFsc3ksIG5vdCB3ZWxsIGJlaGF2ZWQgdmFsdWUgaW4gYnJvd3NlclxuICAgICAgICAgICAgICBjdXJbMV1ba2V5XSA9IGtleS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzID09PSBBVFRSX0tFWSkge1xuICAgICAgICBjdXJbMV1bcFsxXV0gPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFZBUiAmJiBwWzFdID09PSBBVFRSX0tFWSkge1xuICAgICAgICBjdXJbMV1bcFsyXV0gPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKHMgPT09IENMT1NFKSB7XG4gICAgICAgIGlmIChzZWxmQ2xvc2luZyhjdXJbMF0pICYmIHN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBpeCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVsxXVxuICAgICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoLTFdWzBdWzJdW2l4XSA9IGgoXG4gICAgICAgICAgICBjdXJbMF0sIGN1clsxXSwgY3VyWzJdLmxlbmd0aCA/IGN1clsyXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzID09PSBWQVIgJiYgcFsxXSA9PT0gVEVYVCkge1xuICAgICAgICBpZiAocFsyXSA9PT0gdW5kZWZpbmVkIHx8IHBbMl0gPT09IG51bGwpIHBbMl0gPSAnJ1xuICAgICAgICBlbHNlIGlmICghcFsyXSkgcFsyXSA9IGNvbmNhdCgnJywgcFsyXSlcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocFsyXVswXSkpIHtcbiAgICAgICAgICBjdXJbMl0ucHVzaC5hcHBseShjdXJbMl0sIHBbMl0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3VyWzJdLnB1c2gocFsyXSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzID09PSBURVhUKSB7XG4gICAgICAgIGN1clsyXS5wdXNoKHBbMV0pXG4gICAgICB9IGVsc2UgaWYgKHMgPT09IEFUVFJfRVEgfHwgcyA9PT0gQVRUUl9CUkVBSykge1xuICAgICAgICAvLyBuby1vcFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmhhbmRsZWQ6ICcgKyBzKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0cmVlWzJdLmxlbmd0aCA+IDEgJiYgL15cXHMqJC8udGVzdCh0cmVlWzJdWzBdKSkge1xuICAgICAgdHJlZVsyXS5zaGlmdCgpXG4gICAgfVxuXG4gICAgaWYgKHRyZWVbMl0ubGVuZ3RoID4gMlxuICAgIHx8ICh0cmVlWzJdLmxlbmd0aCA9PT0gMiAmJiAvXFxTLy50ZXN0KHRyZWVbMl1bMV0pKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnbXVsdGlwbGUgcm9vdCBlbGVtZW50cyBtdXN0IGJlIHdyYXBwZWQgaW4gYW4gZW5jbG9zaW5nIHRhZydcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHJlZVsyXVswXSkgJiYgdHlwZW9mIHRyZWVbMl1bMF1bMF0gPT09ICdzdHJpbmcnXG4gICAgJiYgQXJyYXkuaXNBcnJheSh0cmVlWzJdWzBdWzJdKSkge1xuICAgICAgdHJlZVsyXVswXSA9IGgodHJlZVsyXVswXVswXSwgdHJlZVsyXVswXVsxXSwgdHJlZVsyXVswXVsyXSlcbiAgICB9XG4gICAgcmV0dXJuIHRyZWVbMl1bMF1cblxuICAgIGZ1bmN0aW9uIHBhcnNlIChzdHIpIHtcbiAgICAgIHZhciByZXMgPSBbXVxuICAgICAgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cpIHN0YXRlID0gQVRUUlxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSBzdHIuY2hhckF0KGkpXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gVEVYVCAmJiBjID09PSAnPCcpIHtcbiAgICAgICAgICBpZiAocmVnLmxlbmd0aCkgcmVzLnB1c2goW1RFWFQsIHJlZ10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IE9QRU5cbiAgICAgICAgfSBlbHNlIGlmIChjID09PSAnPicgJiYgIXF1b3Qoc3RhdGUpICYmIHN0YXRlICE9PSBDT01NRU5UKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBPUEVOKSB7XG4gICAgICAgICAgICByZXMucHVzaChbT1BFTixyZWddKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy5wdXNoKFtDTE9TRV0pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IFRFWFRcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQ09NTUVOVCAmJiAvLSQvLnRlc3QocmVnKSAmJiBjID09PSAnLScpIHtcbiAgICAgICAgICBpZiAob3B0cy5jb21tZW50cykge1xuICAgICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnLnN1YnN0cigwLCByZWcubGVuZ3RoIC0gMSldLFtDTE9TRV0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBURVhUXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4gJiYgL14hLS0kLy50ZXN0KHJlZykpIHtcbiAgICAgICAgICBpZiAob3B0cy5jb21tZW50cykge1xuICAgICAgICAgICAgcmVzLnB1c2goW09QRU4sIHJlZ10sW0FUVFJfS0VZLCdjb21tZW50J10sW0FUVFJfRVFdKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZWcgPSBjXG4gICAgICAgICAgc3RhdGUgPSBDT01NRU5UXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRFWFQgfHwgc3RhdGUgPT09IENPTU1FTlQpIHtcbiAgICAgICAgICByZWcgKz0gY1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBPUEVOICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbT1BFTiwgcmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBPUEVOKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUiAmJiAvW15cXHNcIic9L10vLnRlc3QoYykpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfS0VZXG4gICAgICAgICAgcmVnID0gY1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICBpZiAocmVnLmxlbmd0aCkgcmVzLnB1c2goW0FUVFJfS0VZLHJlZ10pXG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfQlJFQUtdKVxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfS0VZLHJlZ10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfS0VZX1dcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkgJiYgYyA9PT0gJz0nKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfS0VZLHJlZ10sW0FUVFJfRVFdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1dcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICByZWcgKz0gY1xuICAgICAgICB9IGVsc2UgaWYgKChzdGF0ZSA9PT0gQVRUUl9LRVlfVyB8fCBzdGF0ZSA9PT0gQVRUUikgJiYgYyA9PT0gJz0nKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfRVFdKVxuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRV9XXG4gICAgICAgIH0gZWxzZSBpZiAoKHN0YXRlID09PSBBVFRSX0tFWV9XIHx8IHN0YXRlID09PSBBVFRSKSAmJiAhL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICBpZiAoL1tcXHctXS8udGVzdChjKSkge1xuICAgICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlcbiAgICAgICAgICB9IGVsc2Ugc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfVyAmJiBjID09PSAnXCInKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX0RRXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfVyAmJiBjID09PSBcIidcIikge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRV9TUVxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRICYmIGMgPT09ICdcIicpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddLFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRICYmIGMgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSxbQVRUUl9CUkVBS10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmICEvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgICAgaS0tXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10sW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgfHwgc3RhdGUgPT09IEFUVFJfVkFMVUVfU1FcbiAgICAgICAgfHwgc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEpIHtcbiAgICAgICAgICByZWcgKz0gY1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUgPT09IFRFWFQgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbVEVYVCxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfU1EgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfS0VZLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RyZm4gKHgpIHtcbiAgICBpZiAodHlwZW9mIHggPT09ICdmdW5jdGlvbicpIHJldHVybiB4XG4gICAgZWxzZSBpZiAodHlwZW9mIHggPT09ICdzdHJpbmcnKSByZXR1cm4geFxuICAgIGVsc2UgaWYgKHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnKSByZXR1cm4geFxuICAgIGVsc2UgcmV0dXJuIGNvbmNhdCgnJywgeClcbiAgfVxufVxuXG5mdW5jdGlvbiBxdW90IChzdGF0ZSkge1xuICByZXR1cm4gc3RhdGUgPT09IEFUVFJfVkFMVUVfU1EgfHwgc3RhdGUgPT09IEFUVFJfVkFMVUVfRFFcbn1cblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbmZ1bmN0aW9uIGhhcyAob2JqLCBrZXkpIHsgcmV0dXJuIGhhc093bi5jYWxsKG9iaiwga2V5KSB9XG5cbnZhciBjbG9zZVJFID0gUmVnRXhwKCdeKCcgKyBbXG4gICdhcmVhJywgJ2Jhc2UnLCAnYmFzZWZvbnQnLCAnYmdzb3VuZCcsICdicicsICdjb2wnLCAnY29tbWFuZCcsICdlbWJlZCcsXG4gICdmcmFtZScsICdocicsICdpbWcnLCAnaW5wdXQnLCAnaXNpbmRleCcsICdrZXlnZW4nLCAnbGluaycsICdtZXRhJywgJ3BhcmFtJyxcbiAgJ3NvdXJjZScsICd0cmFjaycsICd3YnInLCAnIS0tJyxcbiAgLy8gU1ZHIFRBR1NcbiAgJ2FuaW1hdGUnLCAnYW5pbWF0ZVRyYW5zZm9ybScsICdjaXJjbGUnLCAnY3Vyc29yJywgJ2Rlc2MnLCAnZWxsaXBzZScsXG4gICdmZUJsZW5kJywgJ2ZlQ29sb3JNYXRyaXgnLCAnZmVDb21wb3NpdGUnLFxuICAnZmVDb252b2x2ZU1hdHJpeCcsICdmZURpZmZ1c2VMaWdodGluZycsICdmZURpc3BsYWNlbWVudE1hcCcsXG4gICdmZURpc3RhbnRMaWdodCcsICdmZUZsb29kJywgJ2ZlRnVuY0EnLCAnZmVGdW5jQicsICdmZUZ1bmNHJywgJ2ZlRnVuY1InLFxuICAnZmVHYXVzc2lhbkJsdXInLCAnZmVJbWFnZScsICdmZU1lcmdlTm9kZScsICdmZU1vcnBob2xvZ3knLFxuICAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLFxuICAnZmVUdXJidWxlbmNlJywgJ2ZvbnQtZmFjZS1mb3JtYXQnLCAnZm9udC1mYWNlLW5hbWUnLCAnZm9udC1mYWNlLXVyaScsXG4gICdnbHlwaCcsICdnbHlwaFJlZicsICdoa2VybicsICdpbWFnZScsICdsaW5lJywgJ21pc3NpbmctZ2x5cGgnLCAnbXBhdGgnLFxuICAncGF0aCcsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JlY3QnLCAnc2V0JywgJ3N0b3AnLCAndHJlZicsICd1c2UnLCAndmlldycsXG4gICd2a2Vybidcbl0uam9pbignfCcpICsgJykoPzpbXFwuI11bYS16QS1aMC05XFx1MDA3Ri1cXHVGRkZGXzotXSspKiQnKVxuZnVuY3Rpb24gc2VsZkNsb3NpbmcgKHRhZykgeyByZXR1cm4gY2xvc2VSRS50ZXN0KHRhZykgfVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9wYXJzZXInKVsnZGVmYXVsdCddO1xuZXhwb3J0c1snZGVmYXVsdCddID0gZXhwb3J0cztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IChmdW5jdGlvbigpIHtcbiAgLypcbiAgICogR2VuZXJhdGVkIGJ5IFBFRy5qcyAwLjguMC5cbiAgICpcbiAgICogaHR0cDovL3BlZ2pzLm1hamRhLmN6L1xuICAgKi9cblxuICBmdW5jdGlvbiBwZWckc3ViY2xhc3MoY2hpbGQsIHBhcmVudCkge1xuICAgIGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfVxuICAgIGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gU3ludGF4RXJyb3IobWVzc2FnZSwgZXhwZWN0ZWQsIGZvdW5kLCBvZmZzZXQsIGxpbmUsIGNvbHVtbikge1xuICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlO1xuICAgIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcbiAgICB0aGlzLmZvdW5kICAgID0gZm91bmQ7XG4gICAgdGhpcy5vZmZzZXQgICA9IG9mZnNldDtcbiAgICB0aGlzLmxpbmUgICAgID0gbGluZTtcbiAgICB0aGlzLmNvbHVtbiAgID0gY29sdW1uO1xuXG4gICAgdGhpcy5uYW1lICAgICA9IFwiU3ludGF4RXJyb3JcIjtcbiAgfVxuXG4gIHBlZyRzdWJjbGFzcyhTeW50YXhFcnJvciwgRXJyb3IpO1xuXG4gIGZ1bmN0aW9uIHBhcnNlKGlucHV0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHt9LFxuXG4gICAgICAgIHBlZyRGQUlMRUQgPSB7fSxcblxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb25zID0geyBzdGFydDogcGVnJHBhcnNlc3RhcnQgfSxcbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uICA9IHBlZyRwYXJzZXN0YXJ0LFxuXG4gICAgICAgIHBlZyRjMCA9IFtdLFxuICAgICAgICBwZWckYzEgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgICAgOiAnbWVzc2FnZUZvcm1hdFBhdHRlcm4nLFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50czogZWxlbWVudHNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgcGVnJGMyID0gcGVnJEZBSUxFRCxcbiAgICAgICAgcGVnJGMzID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBzdHJpbmcgPSAnJyxcbiAgICAgICAgICAgICAgICAgICAgaSwgaiwgb3V0ZXJMZW4sIGlubmVyLCBpbm5lckxlbjtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIG91dGVyTGVuID0gdGV4dC5sZW5ndGg7IGkgPCBvdXRlckxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlubmVyID0gdGV4dFtpXTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBpbm5lckxlbiA9IGlubmVyLmxlbmd0aDsgaiA8IGlubmVyTGVuOyBqICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBpbm5lcltqXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzQgPSBmdW5jdGlvbihtZXNzYWdlVGV4dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgOiAnbWVzc2FnZVRleHRFbGVtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG1lc3NhZ2VUZXh0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjNSA9IC9eW14gXFx0XFxuXFxyLC4rPXt9I10vLFxuICAgICAgICBwZWckYzYgPSB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiW14gXFxcXHRcXFxcblxcXFxyLC4rPXt9I11cIiwgZGVzY3JpcHRpb246IFwiW14gXFxcXHRcXFxcblxcXFxyLC4rPXt9I11cIiB9LFxuICAgICAgICBwZWckYzcgPSBcIntcIixcbiAgICAgICAgcGVnJGM4ID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwie1wiLCBkZXNjcmlwdGlvbjogXCJcXFwie1xcXCJcIiB9LFxuICAgICAgICBwZWckYzkgPSBudWxsLFxuICAgICAgICBwZWckYzEwID0gXCIsXCIsXG4gICAgICAgIHBlZyRjMTEgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCIsXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCIsXFxcIlwiIH0sXG4gICAgICAgIHBlZyRjMTIgPSBcIn1cIixcbiAgICAgICAgcGVnJGMxMyA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIn1cIiwgZGVzY3JpcHRpb246IFwiXFxcIn1cXFwiXCIgfSxcbiAgICAgICAgcGVnJGMxNCA9IGZ1bmN0aW9uKGlkLCBmb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlICA6ICdhcmd1bWVudEVsZW1lbnQnLFxuICAgICAgICAgICAgICAgICAgICBpZCAgICA6IGlkLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IGZvcm1hdCAmJiBmb3JtYXRbMl1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgcGVnJGMxNSA9IFwibnVtYmVyXCIsXG4gICAgICAgIHBlZyRjMTYgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJudW1iZXJcIiwgZGVzY3JpcHRpb246IFwiXFxcIm51bWJlclxcXCJcIiB9LFxuICAgICAgICBwZWckYzE3ID0gXCJkYXRlXCIsXG4gICAgICAgIHBlZyRjMTggPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJkYXRlXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJkYXRlXFxcIlwiIH0sXG4gICAgICAgIHBlZyRjMTkgPSBcInRpbWVcIixcbiAgICAgICAgcGVnJGMyMCA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcInRpbWVcIiwgZGVzY3JpcHRpb246IFwiXFxcInRpbWVcXFwiXCIgfSxcbiAgICAgICAgcGVnJGMyMSA9IGZ1bmN0aW9uKHR5cGUsIHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA6IHR5cGUgKyAnRm9ybWF0JyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHN0eWxlICYmIHN0eWxlWzJdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMjIgPSBcInBsdXJhbFwiLFxuICAgICAgICBwZWckYzIzID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwicGx1cmFsXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJwbHVyYWxcXFwiXCIgfSxcbiAgICAgICAgcGVnJGMyNCA9IGZ1bmN0aW9uKHBsdXJhbFN0eWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSAgIDogcGx1cmFsU3R5bGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgb3JkaW5hbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA6IHBsdXJhbFN0eWxlLm9mZnNldCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBwbHVyYWxTdHlsZS5vcHRpb25zXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMjUgPSBcInNlbGVjdG9yZGluYWxcIixcbiAgICAgICAgcGVnJGMyNiA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcInNlbGVjdG9yZGluYWxcIiwgZGVzY3JpcHRpb246IFwiXFxcInNlbGVjdG9yZGluYWxcXFwiXCIgfSxcbiAgICAgICAgcGVnJGMyNyA9IGZ1bmN0aW9uKHBsdXJhbFN0eWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSAgIDogcGx1cmFsU3R5bGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgb3JkaW5hbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IDogcGx1cmFsU3R5bGUub2Zmc2V0IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHBsdXJhbFN0eWxlLm9wdGlvbnNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzI4ID0gXCJzZWxlY3RcIixcbiAgICAgICAgcGVnJGMyOSA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcInNlbGVjdFwiLCBkZXNjcmlwdGlvbjogXCJcXFwic2VsZWN0XFxcIlwiIH0sXG4gICAgICAgIHBlZyRjMzAgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSAgIDogJ3NlbGVjdEZvcm1hdCcsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgcGVnJGMzMSA9IFwiPVwiLFxuICAgICAgICBwZWckYzMyID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiPVwiLCBkZXNjcmlwdGlvbjogXCJcXFwiPVxcXCJcIiB9LFxuICAgICAgICBwZWckYzMzID0gZnVuY3Rpb24oc2VsZWN0b3IsIHBhdHRlcm4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlICAgIDogJ29wdGlvbmFsRm9ybWF0UGF0dGVybicsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgICA6IHBhdHRlcm5cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgcGVnJGMzNCA9IFwib2Zmc2V0OlwiLFxuICAgICAgICBwZWckYzM1ID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwib2Zmc2V0OlwiLCBkZXNjcmlwdGlvbjogXCJcXFwib2Zmc2V0OlxcXCJcIiB9LFxuICAgICAgICBwZWckYzM2ID0gZnVuY3Rpb24obnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMzcgPSBmdW5jdGlvbihvZmZzZXQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlICAgOiAncGx1cmFsRm9ybWF0JyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IDogb2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMzggPSB7IHR5cGU6IFwib3RoZXJcIiwgZGVzY3JpcHRpb246IFwid2hpdGVzcGFjZVwiIH0sXG4gICAgICAgIHBlZyRjMzkgPSAvXlsgXFx0XFxuXFxyXS8sXG4gICAgICAgIHBlZyRjNDAgPSB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiWyBcXFxcdFxcXFxuXFxcXHJdXCIsIGRlc2NyaXB0aW9uOiBcIlsgXFxcXHRcXFxcblxcXFxyXVwiIH0sXG4gICAgICAgIHBlZyRjNDEgPSB7IHR5cGU6IFwib3RoZXJcIiwgZGVzY3JpcHRpb246IFwib3B0aW9uYWxXaGl0ZXNwYWNlXCIgfSxcbiAgICAgICAgcGVnJGM0MiA9IC9eWzAtOV0vLFxuICAgICAgICBwZWckYzQzID0geyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIlswLTldXCIsIGRlc2NyaXB0aW9uOiBcIlswLTldXCIgfSxcbiAgICAgICAgcGVnJGM0NCA9IC9eWzAtOWEtZl0vaSxcbiAgICAgICAgcGVnJGM0NSA9IHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCJbMC05YS1mXWlcIiwgZGVzY3JpcHRpb246IFwiWzAtOWEtZl1pXCIgfSxcbiAgICAgICAgcGVnJGM0NiA9IFwiMFwiLFxuICAgICAgICBwZWckYzQ3ID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiMFwiLCBkZXNjcmlwdGlvbjogXCJcXFwiMFxcXCJcIiB9LFxuICAgICAgICBwZWckYzQ4ID0gL15bMS05XS8sXG4gICAgICAgIHBlZyRjNDkgPSB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiWzEtOV1cIiwgZGVzY3JpcHRpb246IFwiWzEtOV1cIiB9LFxuICAgICAgICBwZWckYzUwID0gZnVuY3Rpb24oZGlnaXRzKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoZGlnaXRzLCAxMCk7XG4gICAgICAgIH0sXG4gICAgICAgIHBlZyRjNTEgPSAvXltee31cXFxcXFwwLVxceDFGfyBcXHRcXG5cXHJdLyxcbiAgICAgICAgcGVnJGM1MiA9IHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCJbXnt9XFxcXFxcXFxcXFxcMC1cXFxceDFGfyBcXFxcdFxcXFxuXFxcXHJdXCIsIGRlc2NyaXB0aW9uOiBcIltee31cXFxcXFxcXFxcXFwwLVxcXFx4MUZ/IFxcXFx0XFxcXG5cXFxccl1cIiB9LFxuICAgICAgICBwZWckYzUzID0gXCJcXFxcXFxcXFwiLFxuICAgICAgICBwZWckYzU0ID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiXFxcXFxcXFxcIiwgZGVzY3JpcHRpb246IFwiXFxcIlxcXFxcXFxcXFxcXFxcXFxcXFwiXCIgfSxcbiAgICAgICAgcGVnJGM1NSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gJ1xcXFwnOyB9LFxuICAgICAgICBwZWckYzU2ID0gXCJcXFxcI1wiLFxuICAgICAgICBwZWckYzU3ID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiXFxcXCNcIiwgZGVzY3JpcHRpb246IFwiXFxcIlxcXFxcXFxcI1xcXCJcIiB9LFxuICAgICAgICBwZWckYzU4ID0gZnVuY3Rpb24oKSB7IHJldHVybiAnXFxcXCMnOyB9LFxuICAgICAgICBwZWckYzU5ID0gXCJcXFxce1wiLFxuICAgICAgICBwZWckYzYwID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiXFxcXHtcIiwgZGVzY3JpcHRpb246IFwiXFxcIlxcXFxcXFxce1xcXCJcIiB9LFxuICAgICAgICBwZWckYzYxID0gZnVuY3Rpb24oKSB7IHJldHVybiAnXFx1MDA3Qic7IH0sXG4gICAgICAgIHBlZyRjNjIgPSBcIlxcXFx9XCIsXG4gICAgICAgIHBlZyRjNjMgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJcXFxcfVwiLCBkZXNjcmlwdGlvbjogXCJcXFwiXFxcXFxcXFx9XFxcIlwiIH0sXG4gICAgICAgIHBlZyRjNjQgPSBmdW5jdGlvbigpIHsgcmV0dXJuICdcXHUwMDdEJzsgfSxcbiAgICAgICAgcGVnJGM2NSA9IFwiXFxcXHVcIixcbiAgICAgICAgcGVnJGM2NiA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIlxcXFx1XCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJcXFxcXFxcXHVcXFwiXCIgfSxcbiAgICAgICAgcGVnJGM2NyA9IGZ1bmN0aW9uKGRpZ2l0cykge1xuICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KGRpZ2l0cywgMTYpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjNjggPSBmdW5jdGlvbihjaGFycykgeyByZXR1cm4gY2hhcnMuam9pbignJyk7IH0sXG5cbiAgICAgICAgcGVnJGN1cnJQb3MgICAgICAgICAgPSAwLFxuICAgICAgICBwZWckcmVwb3J0ZWRQb3MgICAgICA9IDAsXG4gICAgICAgIHBlZyRjYWNoZWRQb3MgICAgICAgID0gMCxcbiAgICAgICAgcGVnJGNhY2hlZFBvc0RldGFpbHMgPSB7IGxpbmU6IDEsIGNvbHVtbjogMSwgc2VlbkNSOiBmYWxzZSB9LFxuICAgICAgICBwZWckbWF4RmFpbFBvcyAgICAgICA9IDAsXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgID0gW10sXG4gICAgICAgIHBlZyRzaWxlbnRGYWlscyAgICAgID0gMCxcblxuICAgICAgICBwZWckcmVzdWx0O1xuXG4gICAgaWYgKFwic3RhcnRSdWxlXCIgaW4gb3B0aW9ucykge1xuICAgICAgaWYgKCEob3B0aW9ucy5zdGFydFJ1bGUgaW4gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9ucykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc3RhcnQgcGFyc2luZyBmcm9tIHJ1bGUgXFxcIlwiICsgb3B0aW9ucy5zdGFydFJ1bGUgKyBcIlxcXCIuXCIpO1xuICAgICAgfVxuXG4gICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gPSBwZWckc3RhcnRSdWxlRnVuY3Rpb25zW29wdGlvbnMuc3RhcnRSdWxlXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXh0KCkge1xuICAgICAgcmV0dXJuIGlucHV0LnN1YnN0cmluZyhwZWckcmVwb3J0ZWRQb3MsIHBlZyRjdXJyUG9zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvZmZzZXQoKSB7XG4gICAgICByZXR1cm4gcGVnJHJlcG9ydGVkUG9zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmUoKSB7XG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHBlZyRyZXBvcnRlZFBvcykubGluZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb2x1bW4oKSB7XG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHBlZyRyZXBvcnRlZFBvcykuY29sdW1uO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cGVjdGVkKGRlc2NyaXB0aW9uKSB7XG4gICAgICB0aHJvdyBwZWckYnVpbGRFeGNlcHRpb24oXG4gICAgICAgIG51bGwsXG4gICAgICAgIFt7IHR5cGU6IFwib3RoZXJcIiwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uIH1dLFxuICAgICAgICBwZWckcmVwb3J0ZWRQb3NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSkge1xuICAgICAgdGhyb3cgcGVnJGJ1aWxkRXhjZXB0aW9uKG1lc3NhZ2UsIG51bGwsIHBlZyRyZXBvcnRlZFBvcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHBvcykge1xuICAgICAgZnVuY3Rpb24gYWR2YW5jZShkZXRhaWxzLCBzdGFydFBvcywgZW5kUG9zKSB7XG4gICAgICAgIHZhciBwLCBjaDtcblxuICAgICAgICBmb3IgKHAgPSBzdGFydFBvczsgcCA8IGVuZFBvczsgcCsrKSB7XG4gICAgICAgICAgY2ggPSBpbnB1dC5jaGFyQXQocCk7XG4gICAgICAgICAgaWYgKGNoID09PSBcIlxcblwiKSB7XG4gICAgICAgICAgICBpZiAoIWRldGFpbHMuc2VlbkNSKSB7IGRldGFpbHMubGluZSsrOyB9XG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XG4gICAgICAgICAgICBkZXRhaWxzLnNlZW5DUiA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2ggPT09IFwiXFxyXCIgfHwgY2ggPT09IFwiXFx1MjAyOFwiIHx8IGNoID09PSBcIlxcdTIwMjlcIikge1xuICAgICAgICAgICAgZGV0YWlscy5saW5lKys7XG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XG4gICAgICAgICAgICBkZXRhaWxzLnNlZW5DUiA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uKys7XG4gICAgICAgICAgICBkZXRhaWxzLnNlZW5DUiA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGVnJGNhY2hlZFBvcyAhPT0gcG9zKSB7XG4gICAgICAgIGlmIChwZWckY2FjaGVkUG9zID4gcG9zKSB7XG4gICAgICAgICAgcGVnJGNhY2hlZFBvcyA9IDA7XG4gICAgICAgICAgcGVnJGNhY2hlZFBvc0RldGFpbHMgPSB7IGxpbmU6IDEsIGNvbHVtbjogMSwgc2VlbkNSOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGFkdmFuY2UocGVnJGNhY2hlZFBvc0RldGFpbHMsIHBlZyRjYWNoZWRQb3MsIHBvcyk7XG4gICAgICAgIHBlZyRjYWNoZWRQb3MgPSBwb3M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwZWckY2FjaGVkUG9zRGV0YWlscztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckZmFpbChleHBlY3RlZCkge1xuICAgICAgaWYgKHBlZyRjdXJyUG9zIDwgcGVnJG1heEZhaWxQb3MpIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmIChwZWckY3VyclBvcyA+IHBlZyRtYXhGYWlsUG9zKSB7XG4gICAgICAgIHBlZyRtYXhGYWlsUG9zID0gcGVnJGN1cnJQb3M7XG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgPSBbXTtcbiAgICAgIH1cblxuICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckYnVpbGRFeGNlcHRpb24obWVzc2FnZSwgZXhwZWN0ZWQsIHBvcykge1xuICAgICAgZnVuY3Rpb24gY2xlYW51cEV4cGVjdGVkKGV4cGVjdGVkKSB7XG4gICAgICAgIHZhciBpID0gMTtcblxuICAgICAgICBleHBlY3RlZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICBpZiAoYS5kZXNjcmlwdGlvbiA8IGIuZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGEuZGVzY3JpcHRpb24gPiBiLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aGlsZSAoaSA8IGV4cGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgIGlmIChleHBlY3RlZFtpIC0gMV0gPT09IGV4cGVjdGVkW2ldKSB7XG4gICAgICAgICAgICBleHBlY3RlZC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYnVpbGRNZXNzYWdlKGV4cGVjdGVkLCBmb3VuZCkge1xuICAgICAgICBmdW5jdGlvbiBzdHJpbmdFc2NhcGUocykge1xuICAgICAgICAgIGZ1bmN0aW9uIGhleChjaCkgeyByZXR1cm4gY2guY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTsgfVxuXG4gICAgICAgICAgcmV0dXJuIHNcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICAgJ1xcXFxcXFxcJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAgICAnXFxcXFwiJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHgwOC9nLCAnXFxcXGInKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAgICdcXFxcdCcpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICAgJ1xcXFxuJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXGYvZywgICAnXFxcXGYnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAgICdcXFxccicpXG4gICAgICAgICAgICAucmVwbGFjZSgvW1xceDAwLVxceDA3XFx4MEJcXHgwRVxceDBGXS9nLCBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4MCcgKyBoZXgoY2gpOyB9KVxuICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHgxMC1cXHgxRlxceDgwLVxceEZGXS9nLCAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4JyAgKyBoZXgoY2gpOyB9KVxuICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHUwMTgwLVxcdTBGRkZdL2csICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxcdTAnICsgaGV4KGNoKTsgfSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXFx1MTA4MC1cXHVGRkZGXS9nLCAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHUnICArIGhleChjaCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGV4cGVjdGVkRGVzY3MgPSBuZXcgQXJyYXkoZXhwZWN0ZWQubGVuZ3RoKSxcbiAgICAgICAgICAgIGV4cGVjdGVkRGVzYywgZm91bmREZXNjLCBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGV4cGVjdGVkRGVzY3NbaV0gPSBleHBlY3RlZFtpXS5kZXNjcmlwdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGV4cGVjdGVkRGVzYyA9IGV4cGVjdGVkLmxlbmd0aCA+IDFcbiAgICAgICAgICA/IGV4cGVjdGVkRGVzY3Muc2xpY2UoMCwgLTEpLmpvaW4oXCIsIFwiKVxuICAgICAgICAgICAgICArIFwiIG9yIFwiXG4gICAgICAgICAgICAgICsgZXhwZWN0ZWREZXNjc1tleHBlY3RlZC5sZW5ndGggLSAxXVxuICAgICAgICAgIDogZXhwZWN0ZWREZXNjc1swXTtcblxuICAgICAgICBmb3VuZERlc2MgPSBmb3VuZCA/IFwiXFxcIlwiICsgc3RyaW5nRXNjYXBlKGZvdW5kKSArIFwiXFxcIlwiIDogXCJlbmQgb2YgaW5wdXRcIjtcblxuICAgICAgICByZXR1cm4gXCJFeHBlY3RlZCBcIiArIGV4cGVjdGVkRGVzYyArIFwiIGJ1dCBcIiArIGZvdW5kRGVzYyArIFwiIGZvdW5kLlwiO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zRGV0YWlscyA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpLFxuICAgICAgICAgIGZvdW5kICAgICAgPSBwb3MgPCBpbnB1dC5sZW5ndGggPyBpbnB1dC5jaGFyQXQocG9zKSA6IG51bGw7XG5cbiAgICAgIGlmIChleHBlY3RlZCAhPT0gbnVsbCkge1xuICAgICAgICBjbGVhbnVwRXhwZWN0ZWQoZXhwZWN0ZWQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBtZXNzYWdlICE9PSBudWxsID8gbWVzc2FnZSA6IGJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpLFxuICAgICAgICBleHBlY3RlZCxcbiAgICAgICAgZm91bmQsXG4gICAgICAgIHBvcyxcbiAgICAgICAgcG9zRGV0YWlscy5saW5lLFxuICAgICAgICBwb3NEZXRhaWxzLmNvbHVtblxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VzdGFydCgpIHtcbiAgICAgIHZhciBzMDtcblxuICAgICAgczAgPSBwZWckcGFyc2VtZXNzYWdlRm9ybWF0UGF0dGVybigpO1xuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlbWVzc2FnZUZvcm1hdFBhdHRlcm4oKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMjtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIHMxID0gW107XG4gICAgICBzMiA9IHBlZyRwYXJzZW1lc3NhZ2VGb3JtYXRFbGVtZW50KCk7XG4gICAgICB3aGlsZSAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczEucHVzaChzMik7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlbWVzc2FnZUZvcm1hdEVsZW1lbnQoKTtcbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgczEgPSBwZWckYzEoczEpO1xuICAgICAgfVxuICAgICAgczAgPSBzMTtcblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZW1lc3NhZ2VGb3JtYXRFbGVtZW50KCkge1xuICAgICAgdmFyIHMwO1xuXG4gICAgICBzMCA9IHBlZyRwYXJzZW1lc3NhZ2VUZXh0RWxlbWVudCgpO1xuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMwID0gcGVnJHBhcnNlYXJndW1lbnRFbGVtZW50KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VtZXNzYWdlVGV4dCgpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgczEgPSBbXTtcbiAgICAgIHMyID0gcGVnJGN1cnJQb3M7XG4gICAgICBzMyA9IHBlZyRwYXJzZV8oKTtcbiAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzNCA9IHBlZyRwYXJzZWNoYXJzKCk7XG4gICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczMgPSBbczMsIHM0LCBzNV07XG4gICAgICAgICAgICBzMiA9IHMzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMyO1xuICAgICAgICAgICAgczIgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczI7XG4gICAgICAgICAgczIgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlZyRjdXJyUG9zID0gczI7XG4gICAgICAgIHMyID0gcGVnJGMyO1xuICAgICAgfVxuICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHdoaWxlIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMxLnB1c2goczIpO1xuICAgICAgICAgIHMyID0gcGVnJGN1cnJQb3M7XG4gICAgICAgICAgczMgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZWNoYXJzKCk7XG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHMzID0gW3MzLCBzNCwgczVdO1xuICAgICAgICAgICAgICAgIHMyID0gczM7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMjtcbiAgICAgICAgICAgICAgICBzMiA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMjtcbiAgICAgICAgICAgICAgczIgPSBwZWckYzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczI7XG4gICAgICAgICAgICBzMiA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJGMyO1xuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICBzMSA9IHBlZyRjMyhzMSk7XG4gICAgICB9XG4gICAgICBzMCA9IHMxO1xuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICAgIHMxID0gcGVnJHBhcnNld3MoKTtcbiAgICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczEgPSBpbnB1dC5zdWJzdHJpbmcoczAsIHBlZyRjdXJyUG9zKTtcbiAgICAgICAgfVxuICAgICAgICBzMCA9IHMxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlbWVzc2FnZVRleHRFbGVtZW50KCkge1xuICAgICAgdmFyIHMwLCBzMTtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIHMxID0gcGVnJHBhcnNlbWVzc2FnZVRleHQoKTtcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgczEgPSBwZWckYzQoczEpO1xuICAgICAgfVxuICAgICAgczAgPSBzMTtcblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZWFyZ3VtZW50KCkge1xuICAgICAgdmFyIHMwLCBzMSwgczI7XG5cbiAgICAgIHMwID0gcGVnJHBhcnNlbnVtYmVyKCk7XG4gICAgICBpZiAoczAgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgICAgczEgPSBbXTtcbiAgICAgICAgaWYgKHBlZyRjNS50ZXN0KGlucHV0LmNoYXJBdChwZWckY3VyclBvcykpKSB7XG4gICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHdoaWxlIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczEucHVzaChzMik7XG4gICAgICAgICAgICBpZiAocGVnJGM1LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcbiAgICAgICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xuICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgczEgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczEgPSBpbnB1dC5zdWJzdHJpbmcoczAsIHBlZyRjdXJyUG9zKTtcbiAgICAgICAgfVxuICAgICAgICBzMCA9IHMxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlYXJndW1lbnRFbGVtZW50KCkge1xuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNywgczg7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDEyMykge1xuICAgICAgICBzMSA9IHBlZyRjNztcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XG4gICAgICB9XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMzID0gcGVnJHBhcnNlYXJndW1lbnQoKTtcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgIHM1ID0gcGVnJGN1cnJQb3M7XG4gICAgICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gNDQpIHtcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMTA7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzExKTsgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VlbGVtZW50Rm9ybWF0KCk7XG4gICAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgczYgPSBbczYsIHM3LCBzOF07XG4gICAgICAgICAgICAgICAgICAgIHM1ID0gczY7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM1O1xuICAgICAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNTtcbiAgICAgICAgICAgICAgICAgIHM1ID0gcGVnJGMyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM1O1xuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGMyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGM5O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSAxMjUpIHtcbiAgICAgICAgICAgICAgICAgICAgczcgPSBwZWckYzEyO1xuICAgICAgICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgczcgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTMpOyB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICAgIHMxID0gcGVnJGMxNChzMywgczUpO1xuICAgICAgICAgICAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VlbGVtZW50Rm9ybWF0KCkge1xuICAgICAgdmFyIHMwO1xuXG4gICAgICBzMCA9IHBlZyRwYXJzZXNpbXBsZUZvcm1hdCgpO1xuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMwID0gcGVnJHBhcnNlcGx1cmFsRm9ybWF0KCk7XG4gICAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMwID0gcGVnJHBhcnNlc2VsZWN0T3JkaW5hbEZvcm1hdCgpO1xuICAgICAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczAgPSBwZWckcGFyc2VzZWxlY3RGb3JtYXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZXNpbXBsZUZvcm1hdCgpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNjtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDYpID09PSBwZWckYzE1KSB7XG4gICAgICAgIHMxID0gcGVnJGMxNTtcbiAgICAgICAgcGVnJGN1cnJQb3MgKz0gNjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzE2KTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMxID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDQpID09PSBwZWckYzE3KSB7XG4gICAgICAgICAgczEgPSBwZWckYzE3O1xuICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxOCk7IH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoczEgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCA0KSA9PT0gcGVnJGMxOSkge1xuICAgICAgICAgICAgczEgPSBwZWckYzE5O1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gNDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIwKTsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlXygpO1xuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gNDQpIHtcbiAgICAgICAgICAgIHM0ID0gcGVnJGMxMDtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICBzNiA9IHBlZyRwYXJzZWNoYXJzKCk7XG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczZdO1xuICAgICAgICAgICAgICAgIHMzID0gczQ7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcbiAgICAgICAgICAgICAgczMgPSBwZWckYzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XG4gICAgICAgICAgICBzMyA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHMzID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRjOTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgIHMxID0gcGVnJGMyMShzMSwgczMpO1xuICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZXBsdXJhbEZvcm1hdCgpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgNikgPT09IHBlZyRjMjIpIHtcbiAgICAgICAgczEgPSBwZWckYzIyO1xuICAgICAgICBwZWckY3VyclBvcyArPSA2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjMpOyB9XG4gICAgICB9XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gNDQpIHtcbiAgICAgICAgICAgIHMzID0gcGVnJGMxMDtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICBzNSA9IHBlZyRwYXJzZXBsdXJhbFN0eWxlKCk7XG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgICAgIHMxID0gcGVnJGMyNChzNSk7XG4gICAgICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZXNlbGVjdE9yZGluYWxGb3JtYXQoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNTtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDEzKSA9PT0gcGVnJGMyNSkge1xuICAgICAgICBzMSA9IHBlZyRjMjU7XG4gICAgICAgIHBlZyRjdXJyUG9zICs9IDEzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjYpOyB9XG4gICAgICB9XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gNDQpIHtcbiAgICAgICAgICAgIHMzID0gcGVnJGMxMDtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICBzNSA9IHBlZyRwYXJzZXBsdXJhbFN0eWxlKCk7XG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgICAgIHMxID0gcGVnJGMyNyhzNSk7XG4gICAgICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZXNlbGVjdEZvcm1hdCgpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNjtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDYpID09PSBwZWckYzI4KSB7XG4gICAgICAgIHMxID0gcGVnJGMyODtcbiAgICAgICAgcGVnJGN1cnJQb3MgKz0gNjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzI5KTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlXygpO1xuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQ0KSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRjMTA7XG4gICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgczUgPSBbXTtcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VvcHRpb25hbEZvcm1hdFBhdHRlcm4oKTtcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHM2ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICBzNS5wdXNoKHM2KTtcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlb3B0aW9uYWxGb3JtYXRQYXR0ZXJuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGMyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgICAgIHMxID0gcGVnJGMzMChzNSk7XG4gICAgICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZXNlbGVjdG9yKCkge1xuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzO1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgczEgPSBwZWckY3VyclBvcztcbiAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gNjEpIHtcbiAgICAgICAgczIgPSBwZWckYzMxO1xuICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczIgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMzIpOyB9XG4gICAgICB9XG4gICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczMgPSBwZWckcGFyc2VudW1iZXIoKTtcbiAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczIgPSBbczIsIHMzXTtcbiAgICAgICAgICBzMSA9IHMyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczE7XG4gICAgICAgICAgczEgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlZyRjdXJyUG9zID0gczE7XG4gICAgICAgIHMxID0gcGVnJGMyO1xuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMxID0gaW5wdXQuc3Vic3RyaW5nKHMwLCBwZWckY3VyclBvcyk7XG4gICAgICB9XG4gICAgICBzMCA9IHMxO1xuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMwID0gcGVnJHBhcnNlY2hhcnMoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZW9wdGlvbmFsRm9ybWF0UGF0dGVybigpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczcsIHM4O1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgczEgPSBwZWckcGFyc2VfKCk7XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczIgPSBwZWckcGFyc2VzZWxlY3RvcigpO1xuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gMTIzKSB7XG4gICAgICAgICAgICAgIHM0ID0gcGVnJGM3O1xuICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VtZXNzYWdlRm9ybWF0UGF0dGVybigpO1xuICAgICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSAxMjUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzOCA9IHBlZyRjMTI7XG4gICAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBzOCA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChzOCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgICAgICAgICAgIHMxID0gcGVnJGMzMyhzMiwgczYpO1xuICAgICAgICAgICAgICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VvZmZzZXQoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczM7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCA3KSA9PT0gcGVnJGMzNCkge1xuICAgICAgICBzMSA9IHBlZyRjMzQ7XG4gICAgICAgIHBlZyRjdXJyUG9zICs9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMzNSk7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczMgPSBwZWckcGFyc2VudW1iZXIoKTtcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgczEgPSBwZWckYzM2KHMzKTtcbiAgICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VwbHVyYWxTdHlsZSgpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQ7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBzMSA9IHBlZyRwYXJzZW9mZnNldCgpO1xuICAgICAgaWYgKHMxID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMxID0gcGVnJGM5O1xuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlXygpO1xuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMyA9IFtdO1xuICAgICAgICAgIHM0ID0gcGVnJHBhcnNlb3B0aW9uYWxGb3JtYXRQYXR0ZXJuKCk7XG4gICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICB3aGlsZSAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgczMucHVzaChzNCk7XG4gICAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlb3B0aW9uYWxGb3JtYXRQYXR0ZXJuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMzID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgczEgPSBwZWckYzM3KHMxLCBzMyk7XG4gICAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNld3MoKSB7XG4gICAgICB2YXIgczAsIHMxO1xuXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcbiAgICAgIHMwID0gW107XG4gICAgICBpZiAocGVnJGMzOS50ZXN0KGlucHV0LmNoYXJBdChwZWckY3VyclBvcykpKSB7XG4gICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzQwKTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHdoaWxlIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMwLnB1c2goczEpO1xuICAgICAgICAgIGlmIChwZWckYzM5LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcbiAgICAgICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM0MCk7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgfVxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XG4gICAgICBpZiAoczAgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMzgpOyB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VfKCkge1xuICAgICAgdmFyIHMwLCBzMSwgczI7XG5cbiAgICAgIHBlZyRzaWxlbnRGYWlscysrO1xuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIHMxID0gW107XG4gICAgICBzMiA9IHBlZyRwYXJzZXdzKCk7XG4gICAgICB3aGlsZSAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczEucHVzaChzMik7XG4gICAgICAgIHMyID0gcGVnJHBhcnNld3MoKTtcbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMSA9IGlucHV0LnN1YnN0cmluZyhzMCwgcGVnJGN1cnJQb3MpO1xuICAgICAgfVxuICAgICAgczAgPSBzMTtcbiAgICAgIHBlZyRzaWxlbnRGYWlscy0tO1xuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzQxKTsgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlZGlnaXQoKSB7XG4gICAgICB2YXIgczA7XG5cbiAgICAgIGlmIChwZWckYzQyLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcbiAgICAgICAgczAgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xuICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNDMpOyB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VoZXhEaWdpdCgpIHtcbiAgICAgIHZhciBzMDtcblxuICAgICAgaWYgKHBlZyRjNDQudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xuICAgICAgICBzMCA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XG4gICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM0NSk7IH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZW51bWJlcigpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0OCkge1xuICAgICAgICBzMSA9IHBlZyRjNDY7XG4gICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM0Nyk7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzMSA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMSA9IHBlZyRjdXJyUG9zO1xuICAgICAgICBzMiA9IHBlZyRjdXJyUG9zO1xuICAgICAgICBpZiAocGVnJGM0OC50ZXN0KGlucHV0LmNoYXJBdChwZWckY3VyclBvcykpKSB7XG4gICAgICAgICAgczMgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM0OSk7IH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzNCA9IFtdO1xuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlZGlnaXQoKTtcbiAgICAgICAgICB3aGlsZSAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHM0LnB1c2goczUpO1xuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VkaWdpdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHMzID0gW3MzLCBzNF07XG4gICAgICAgICAgICBzMiA9IHMzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMyO1xuICAgICAgICAgICAgczIgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczI7XG4gICAgICAgICAgczIgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczIgPSBpbnB1dC5zdWJzdHJpbmcoczEsIHBlZyRjdXJyUG9zKTtcbiAgICAgICAgfVxuICAgICAgICBzMSA9IHMyO1xuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICBzMSA9IHBlZyRjNTAoczEpO1xuICAgICAgfVxuICAgICAgczAgPSBzMTtcblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZWNoYXIoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3O1xuXG4gICAgICBpZiAocGVnJGM1MS50ZXN0KGlucHV0LmNoYXJBdChwZWckY3VyclBvcykpKSB7XG4gICAgICAgIHMwID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzUyKTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzUzKSB7XG4gICAgICAgICAgczEgPSBwZWckYzUzO1xuICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM1NCk7IH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICBzMSA9IHBlZyRjNTUoKTtcbiAgICAgICAgfVxuICAgICAgICBzMCA9IHMxO1xuICAgICAgICBpZiAoczAgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzU2KSB7XG4gICAgICAgICAgICBzMSA9IHBlZyRjNTY7XG4gICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNTcpOyB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgICAgICBzMSA9IHBlZyRjNTgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICBpZiAoczAgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGM1OSkge1xuICAgICAgICAgICAgICBzMSA9IHBlZyRjNTk7XG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2MCk7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgICAgczEgPSBwZWckYzYxKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzYyKSB7XG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzYyO1xuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2Myk7IH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjNjQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgICAgICBpZiAoczAgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzY1KSB7XG4gICAgICAgICAgICAgICAgICBzMSA9IHBlZyRjNjU7XG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNjYpOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgczIgPSBwZWckY3VyclBvcztcbiAgICAgICAgICAgICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XG4gICAgICAgICAgICAgICAgICBzNCA9IHBlZyRwYXJzZWhleERpZ2l0KCk7XG4gICAgICAgICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgczUgPSBwZWckcGFyc2VoZXhEaWdpdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzNiA9IHBlZyRwYXJzZWhleERpZ2l0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZWhleERpZ2l0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgczQgPSBbczQsIHM1LCBzNiwgczddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzMyA9IHM0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgczMgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XG4gICAgICAgICAgICAgICAgICAgICAgICBzMyA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcbiAgICAgICAgICAgICAgICAgICAgICBzMyA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcbiAgICAgICAgICAgICAgICAgICAgczMgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgczMgPSBpbnB1dC5zdWJzdHJpbmcoczIsIHBlZyRjdXJyUG9zKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHMyID0gczM7XG4gICAgICAgICAgICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICAgIHMxID0gcGVnJGM2NyhzMik7XG4gICAgICAgICAgICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlY2hhcnMoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMjtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIHMxID0gW107XG4gICAgICBzMiA9IHBlZyRwYXJzZWNoYXIoKTtcbiAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICB3aGlsZSAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMS5wdXNoKHMyKTtcbiAgICAgICAgICBzMiA9IHBlZyRwYXJzZWNoYXIoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczEgPSBwZWckYzI7XG4gICAgICB9XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgIHMxID0gcGVnJGM2OChzMSk7XG4gICAgICB9XG4gICAgICBzMCA9IHMxO1xuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgcGVnJHJlc3VsdCA9IHBlZyRzdGFydFJ1bGVGdW5jdGlvbigpO1xuXG4gICAgaWYgKHBlZyRyZXN1bHQgIT09IHBlZyRGQUlMRUQgJiYgcGVnJGN1cnJQb3MgPT09IGlucHV0Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHBlZyRyZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgIHBlZyRmYWlsKHsgdHlwZTogXCJlbmRcIiwgZGVzY3JpcHRpb246IFwiZW5kIG9mIGlucHV0XCIgfSk7XG4gICAgICB9XG5cbiAgICAgIHRocm93IHBlZyRidWlsZEV4Y2VwdGlvbihudWxsLCBwZWckbWF4RmFpbEV4cGVjdGVkLCBwZWckbWF4RmFpbFBvcyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBTeW50YXhFcnJvcjogU3ludGF4RXJyb3IsXG4gICAgcGFyc2U6ICAgICAgIHBhcnNlXG4gIH07XG59KSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZXIuanMubWFwIiwiLyoganNoaW50IG5vZGU6dHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBJbnRsTWVzc2FnZUZvcm1hdCA9IHJlcXVpcmUoJy4vbGliL21haW4nKVsnZGVmYXVsdCddO1xuXG4vLyBBZGQgYWxsIGxvY2FsZSBkYXRhIHRvIGBJbnRsTWVzc2FnZUZvcm1hdGAuIFRoaXMgbW9kdWxlIHdpbGwgYmUgaWdub3JlZCB3aGVuXG4vLyBidW5kbGluZyBmb3IgdGhlIGJyb3dzZXIgd2l0aCBCcm93c2VyaWZ5L1dlYnBhY2suXG5yZXF1aXJlKCcuL2xpYi9sb2NhbGVzJyk7XG5cbi8vIFJlLWV4cG9ydCBgSW50bE1lc3NhZ2VGb3JtYXRgIGFzIHRoZSBDb21tb25KUyBkZWZhdWx0IGV4cG9ydHMgd2l0aCBhbGwgdGhlXG4vLyBsb2NhbGUgZGF0YSByZWdpc3RlcmVkLCBhbmQgd2l0aCBFbmdsaXNoIHNldCBhcyB0aGUgZGVmYXVsdCBsb2NhbGUuIERlZmluZVxuLy8gdGhlIGBkZWZhdWx0YCBwcm9wIGZvciB1c2Ugd2l0aCBvdGhlciBjb21waWxlZCBFUzYgTW9kdWxlcy5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEludGxNZXNzYWdlRm9ybWF0O1xuZXhwb3J0c1snZGVmYXVsdCddID0gZXhwb3J0cztcbiIsIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQsIFlhaG9vISBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5Db3B5cmlnaHRzIGxpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIExpY2Vuc2UuXG5TZWUgdGhlIGFjY29tcGFueWluZyBMSUNFTlNFIGZpbGUgZm9yIHRlcm1zLlxuKi9cblxuLyoganNsaW50IGVzbmV4dDogdHJ1ZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gQ29tcGlsZXI7XG5cbmZ1bmN0aW9uIENvbXBpbGVyKGxvY2FsZXMsIGZvcm1hdHMsIHBsdXJhbEZuKSB7XG4gICAgdGhpcy5sb2NhbGVzICA9IGxvY2FsZXM7XG4gICAgdGhpcy5mb3JtYXRzICA9IGZvcm1hdHM7XG4gICAgdGhpcy5wbHVyYWxGbiA9IHBsdXJhbEZuO1xufVxuXG5Db21waWxlci5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uIChhc3QpIHtcbiAgICB0aGlzLnBsdXJhbFN0YWNrICAgICAgICA9IFtdO1xuICAgIHRoaXMuY3VycmVudFBsdXJhbCAgICAgID0gbnVsbDtcbiAgICB0aGlzLnBsdXJhbE51bWJlckZvcm1hdCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcy5jb21waWxlTWVzc2FnZShhc3QpO1xufTtcblxuQ29tcGlsZXIucHJvdG90eXBlLmNvbXBpbGVNZXNzYWdlID0gZnVuY3Rpb24gKGFzdCkge1xuICAgIGlmICghKGFzdCAmJiBhc3QudHlwZSA9PT0gJ21lc3NhZ2VGb3JtYXRQYXR0ZXJuJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXNzYWdlIEFTVCBpcyBub3Qgb2YgdHlwZTogXCJtZXNzYWdlRm9ybWF0UGF0dGVyblwiJyk7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnRzID0gYXN0LmVsZW1lbnRzLFxuICAgICAgICBwYXR0ZXJuICA9IFtdO1xuXG4gICAgdmFyIGksIGxlbiwgZWxlbWVudDtcblxuICAgIGZvciAoaSA9IDAsIGxlbiA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcblxuICAgICAgICBzd2l0Y2ggKGVsZW1lbnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbWVzc2FnZVRleHRFbGVtZW50JzpcbiAgICAgICAgICAgICAgICBwYXR0ZXJuLnB1c2godGhpcy5jb21waWxlTWVzc2FnZVRleHQoZWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdhcmd1bWVudEVsZW1lbnQnOlxuICAgICAgICAgICAgICAgIHBhdHRlcm4ucHVzaCh0aGlzLmNvbXBpbGVBcmd1bWVudChlbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXNzYWdlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHR5cGUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYXR0ZXJuO1xufTtcblxuQ29tcGlsZXIucHJvdG90eXBlLmNvbXBpbGVNZXNzYWdlVGV4dCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgLy8gV2hlbiB0aGlzIGBlbGVtZW50YCBpcyBwYXJ0IG9mIHBsdXJhbCBzdWItcGF0dGVybiBhbmQgaXRzIHZhbHVlIGNvbnRhaW5zXG4gICAgLy8gYW4gdW5lc2NhcGVkICcjJywgdXNlIGEgYFBsdXJhbE9mZnNldFN0cmluZ2AgaGVscGVyIHRvIHByb3Blcmx5IG91dHB1dFxuICAgIC8vIHRoZSBudW1iZXIgd2l0aCB0aGUgY29ycmVjdCBvZmZzZXQgaW4gdGhlIHN0cmluZy5cbiAgICBpZiAodGhpcy5jdXJyZW50UGx1cmFsICYmIC8oXnxbXlxcXFxdKSMvZy50ZXN0KGVsZW1lbnQudmFsdWUpKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIGNhY2hlIGEgTnVtYmVyRm9ybWF0IGluc3RhbmNlIHRoYXQgY2FuIGJlIHJldXNlZCBmb3IgYW55XG4gICAgICAgIC8vIFBsdXJhbE9mZnNldFN0cmluZyBpbnN0YW5jZSBpbiB0aGlzIG1lc3NhZ2UuXG4gICAgICAgIGlmICghdGhpcy5wbHVyYWxOdW1iZXJGb3JtYXQpIHtcbiAgICAgICAgICAgIHRoaXMucGx1cmFsTnVtYmVyRm9ybWF0ID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KHRoaXMubG9jYWxlcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFBsdXJhbE9mZnNldFN0cmluZyhcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQbHVyYWwuaWQsXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGx1cmFsLmZvcm1hdC5vZmZzZXQsXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVyYWxOdW1iZXJGb3JtYXQsXG4gICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gVW5lc2NhcGUgdGhlIGVzY2FwZWQgJyMncyBpbiB0aGUgbWVzc2FnZSB0ZXh0LlxuICAgIHJldHVybiBlbGVtZW50LnZhbHVlLnJlcGxhY2UoL1xcXFwjL2csICcjJyk7XG59O1xuXG5Db21waWxlci5wcm90b3R5cGUuY29tcGlsZUFyZ3VtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICB2YXIgZm9ybWF0ID0gZWxlbWVudC5mb3JtYXQ7XG5cbiAgICBpZiAoIWZvcm1hdCkge1xuICAgICAgICByZXR1cm4gbmV3IFN0cmluZ0Zvcm1hdChlbGVtZW50LmlkKTtcbiAgICB9XG5cbiAgICB2YXIgZm9ybWF0cyAgPSB0aGlzLmZvcm1hdHMsXG4gICAgICAgIGxvY2FsZXMgID0gdGhpcy5sb2NhbGVzLFxuICAgICAgICBwbHVyYWxGbiA9IHRoaXMucGx1cmFsRm4sXG4gICAgICAgIG9wdGlvbnM7XG5cbiAgICBzd2l0Y2ggKGZvcm1hdC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ251bWJlckZvcm1hdCc6XG4gICAgICAgICAgICBvcHRpb25zID0gZm9ybWF0cy5udW1iZXJbZm9ybWF0LnN0eWxlXTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQgICAgOiBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogbmV3IEludGwuTnVtYmVyRm9ybWF0KGxvY2FsZXMsIG9wdGlvbnMpLmZvcm1hdFxuICAgICAgICAgICAgfTtcblxuICAgICAgICBjYXNlICdkYXRlRm9ybWF0JzpcbiAgICAgICAgICAgIG9wdGlvbnMgPSBmb3JtYXRzLmRhdGVbZm9ybWF0LnN0eWxlXTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQgICAgOiBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobG9jYWxlcywgb3B0aW9ucykuZm9ybWF0XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGNhc2UgJ3RpbWVGb3JtYXQnOlxuICAgICAgICAgICAgb3B0aW9ucyA9IGZvcm1hdHMudGltZVtmb3JtYXQuc3R5bGVdO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZCAgICA6IGVsZW1lbnQuaWQsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChsb2NhbGVzLCBvcHRpb25zKS5mb3JtYXRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgY2FzZSAncGx1cmFsRm9ybWF0JzpcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLmNvbXBpbGVPcHRpb25zKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQbHVyYWxGb3JtYXQoXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCwgZm9ybWF0Lm9yZGluYWwsIGZvcm1hdC5vZmZzZXQsIG9wdGlvbnMsIHBsdXJhbEZuXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNhc2UgJ3NlbGVjdEZvcm1hdCc6XG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5jb21waWxlT3B0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VsZWN0Rm9ybWF0KGVsZW1lbnQuaWQsIG9wdGlvbnMpO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01lc3NhZ2UgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgZm9ybWF0IHR5cGUnKTtcbiAgICB9XG59O1xuXG5Db21waWxlci5wcm90b3R5cGUuY29tcGlsZU9wdGlvbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHZhciBmb3JtYXQgICAgICA9IGVsZW1lbnQuZm9ybWF0LFxuICAgICAgICBvcHRpb25zICAgICA9IGZvcm1hdC5vcHRpb25zLFxuICAgICAgICBvcHRpb25zSGFzaCA9IHt9O1xuXG4gICAgLy8gU2F2ZSB0aGUgY3VycmVudCBwbHVyYWwgZWxlbWVudCwgaWYgYW55LCB0aGVuIHNldCBpdCB0byBhIG5ldyB2YWx1ZSB3aGVuXG4gICAgLy8gY29tcGlsaW5nIHRoZSBvcHRpb25zIHN1Yi1wYXR0ZXJucy4gVGhpcyBjb25mb3JtcyB0aGUgc3BlYydzIGFsZ29yaXRobVxuICAgIC8vIGZvciBoYW5kbGluZyBgXCIjXCJgIHN5bnRheCBpbiBtZXNzYWdlIHRleHQuXG4gICAgdGhpcy5wbHVyYWxTdGFjay5wdXNoKHRoaXMuY3VycmVudFBsdXJhbCk7XG4gICAgdGhpcy5jdXJyZW50UGx1cmFsID0gZm9ybWF0LnR5cGUgPT09ICdwbHVyYWxGb3JtYXQnID8gZWxlbWVudCA6IG51bGw7XG5cbiAgICB2YXIgaSwgbGVuLCBvcHRpb247XG5cbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBvcHRpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbnNbaV07XG5cbiAgICAgICAgLy8gQ29tcGlsZSB0aGUgc3ViLXBhdHRlcm4gYW5kIHNhdmUgaXQgdW5kZXIgdGhlIG9wdGlvbnMncyBzZWxlY3Rvci5cbiAgICAgICAgb3B0aW9uc0hhc2hbb3B0aW9uLnNlbGVjdG9yXSA9IHRoaXMuY29tcGlsZU1lc3NhZ2Uob3B0aW9uLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyBQb3AgdGhlIHBsdXJhbCBzdGFjayB0byBwdXQgYmFjayB0aGUgb3JpZ2luYWwgY3VycmVudCBwbHVyYWwgdmFsdWUuXG4gICAgdGhpcy5jdXJyZW50UGx1cmFsID0gdGhpcy5wbHVyYWxTdGFjay5wb3AoKTtcblxuICAgIHJldHVybiBvcHRpb25zSGFzaDtcbn07XG5cbi8vIC0tIENvbXBpbGVyIEhlbHBlciBDbGFzc2VzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIFN0cmluZ0Zvcm1hdChpZCkge1xuICAgIHRoaXMuaWQgPSBpZDtcbn1cblxuU3RyaW5nRm9ybWF0LnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpO1xufTtcblxuZnVuY3Rpb24gUGx1cmFsRm9ybWF0KGlkLCB1c2VPcmRpbmFsLCBvZmZzZXQsIG9wdGlvbnMsIHBsdXJhbEZuKSB7XG4gICAgdGhpcy5pZCAgICAgICAgID0gaWQ7XG4gICAgdGhpcy51c2VPcmRpbmFsID0gdXNlT3JkaW5hbDtcbiAgICB0aGlzLm9mZnNldCAgICAgPSBvZmZzZXQ7XG4gICAgdGhpcy5vcHRpb25zICAgID0gb3B0aW9ucztcbiAgICB0aGlzLnBsdXJhbEZuICAgPSBwbHVyYWxGbjtcbn1cblxuUGx1cmFsRm9ybWF0LnByb3RvdHlwZS5nZXRPcHRpb24gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIHZhciBvcHRpb24gPSBvcHRpb25zWyc9JyArIHZhbHVlXSB8fFxuICAgICAgICAgICAgb3B0aW9uc1t0aGlzLnBsdXJhbEZuKHZhbHVlIC0gdGhpcy5vZmZzZXQsIHRoaXMudXNlT3JkaW5hbCldO1xuXG4gICAgcmV0dXJuIG9wdGlvbiB8fCBvcHRpb25zLm90aGVyO1xufTtcblxuZnVuY3Rpb24gUGx1cmFsT2Zmc2V0U3RyaW5nKGlkLCBvZmZzZXQsIG51bWJlckZvcm1hdCwgc3RyaW5nKSB7XG4gICAgdGhpcy5pZCAgICAgICAgICAgPSBpZDtcbiAgICB0aGlzLm9mZnNldCAgICAgICA9IG9mZnNldDtcbiAgICB0aGlzLm51bWJlckZvcm1hdCA9IG51bWJlckZvcm1hdDtcbiAgICB0aGlzLnN0cmluZyAgICAgICA9IHN0cmluZztcbn1cblxuUGx1cmFsT2Zmc2V0U3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbnVtYmVyID0gdGhpcy5udW1iZXJGb3JtYXQuZm9ybWF0KHZhbHVlIC0gdGhpcy5vZmZzZXQpO1xuXG4gICAgcmV0dXJuIHRoaXMuc3RyaW5nXG4gICAgICAgICAgICAucmVwbGFjZSgvKF58W15cXFxcXSkjL2csICckMScgKyBudW1iZXIpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXCMvZywgJyMnKTtcbn07XG5cbmZ1bmN0aW9uIFNlbGVjdEZvcm1hdChpZCwgb3B0aW9ucykge1xuICAgIHRoaXMuaWQgICAgICA9IGlkO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG59XG5cblNlbGVjdEZvcm1hdC5wcm90b3R5cGUuZ2V0T3B0aW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgcmV0dXJuIG9wdGlvbnNbdmFsdWVdIHx8IG9wdGlvbnMub3RoZXI7XG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21waWxlci5qcy5tYXAiLCIvKlxuQ29weXJpZ2h0IChjKSAyMDE0LCBZYWhvbyEgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBMaWNlbnNlLlxuU2VlIHRoZSBhY2NvbXBhbnlpbmcgTElDRU5TRSBmaWxlIGZvciB0ZXJtcy5cbiovXG5cbi8qIGpzbGludCBlc25leHQ6IHRydWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgc3JjJHV0aWxzJCQgPSByZXF1aXJlKFwiLi91dGlsc1wiKSwgc3JjJGVzNSQkID0gcmVxdWlyZShcIi4vZXM1XCIpLCBzcmMkY29tcGlsZXIkJCA9IHJlcXVpcmUoXCIuL2NvbXBpbGVyXCIpLCBpbnRsJG1lc3NhZ2Vmb3JtYXQkcGFyc2VyJCQgPSByZXF1aXJlKFwiaW50bC1tZXNzYWdlZm9ybWF0LXBhcnNlclwiKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gTWVzc2FnZUZvcm1hdDtcblxuLy8gLS0gTWVzc2FnZUZvcm1hdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBNZXNzYWdlRm9ybWF0KG1lc3NhZ2UsIGxvY2FsZXMsIGZvcm1hdHMpIHtcbiAgICAvLyBQYXJzZSBzdHJpbmcgbWVzc2FnZXMgaW50byBhbiBBU1QuXG4gICAgdmFyIGFzdCA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICBNZXNzYWdlRm9ybWF0Ll9fcGFyc2UobWVzc2FnZSkgOiBtZXNzYWdlO1xuXG4gICAgaWYgKCEoYXN0ICYmIGFzdC50eXBlID09PSAnbWVzc2FnZUZvcm1hdFBhdHRlcm4nKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIG1lc3NhZ2UgbXVzdCBiZSBwcm92aWRlZCBhcyBhIFN0cmluZyBvciBBU1QuJyk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlcyBhIG5ldyBvYmplY3Qgd2l0aCB0aGUgc3BlY2lmaWVkIGBmb3JtYXRzYCBtZXJnZWQgd2l0aCB0aGUgZGVmYXVsdFxuICAgIC8vIGZvcm1hdHMuXG4gICAgZm9ybWF0cyA9IHRoaXMuX21lcmdlRm9ybWF0cyhNZXNzYWdlRm9ybWF0LmZvcm1hdHMsIGZvcm1hdHMpO1xuXG4gICAgLy8gRGVmaW5lZCBmaXJzdCBiZWNhdXNlIGl0J3MgdXNlZCB0byBidWlsZCB0aGUgZm9ybWF0IHBhdHRlcm4uXG4gICAgc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KHRoaXMsICdfbG9jYWxlJywgIHt2YWx1ZTogdGhpcy5fcmVzb2x2ZUxvY2FsZShsb2NhbGVzKX0pO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgYGFzdGAgdG8gYSBwYXR0ZXJuIHRoYXQgaXMgaGlnaGx5IG9wdGltaXplZCBmb3IgcmVwZWF0ZWRcbiAgICAvLyBgZm9ybWF0KClgIGludm9jYXRpb25zLiAqKk5vdGU6KiogVGhpcyBwYXNzZXMgdGhlIGBsb2NhbGVzYCBzZXQgcHJvdmlkZWRcbiAgICAvLyB0byB0aGUgY29uc3RydWN0b3IgaW5zdGVhZCBvZiBqdXN0IHRoZSByZXNvbHZlZCBsb2NhbGUuXG4gICAgdmFyIHBsdXJhbEZuID0gdGhpcy5fZmluZFBsdXJhbFJ1bGVGdW5jdGlvbih0aGlzLl9sb2NhbGUpO1xuICAgIHZhciBwYXR0ZXJuICA9IHRoaXMuX2NvbXBpbGVQYXR0ZXJuKGFzdCwgbG9jYWxlcywgZm9ybWF0cywgcGx1cmFsRm4pO1xuXG4gICAgLy8gXCJCaW5kXCIgYGZvcm1hdCgpYCBtZXRob2QgdG8gYHRoaXNgIHNvIGl0IGNhbiBiZSBwYXNzZWQgYnkgcmVmZXJlbmNlIGxpa2VcbiAgICAvLyB0aGUgb3RoZXIgYEludGxgIEFQSXMuXG4gICAgdmFyIG1lc3NhZ2VGb3JtYXQgPSB0aGlzO1xuICAgIHRoaXMuZm9ybWF0ID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VGb3JtYXQuX2Zvcm1hdChwYXR0ZXJuLCB2YWx1ZXMpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS52YXJpYWJsZUlkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ1RoZSBpbnRsIHN0cmluZyBjb250ZXh0IHZhcmlhYmxlIFxcJycgKyBlLnZhcmlhYmxlSWQgKyAnXFwnJyArXG4gICAgICAgICAgICAnIHdhcyBub3QgcHJvdmlkZWQgdG8gdGhlIHN0cmluZyBcXCcnICsgbWVzc2FnZSArICdcXCcnXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbn1cblxuLy8gRGVmYXVsdCBmb3JtYXQgb3B0aW9ucyB1c2VkIGFzIHRoZSBwcm90b3R5cGUgb2YgdGhlIGBmb3JtYXRzYCBwcm92aWRlZCB0byB0aGVcbi8vIGNvbnN0cnVjdG9yLiBUaGVzZSBhcmUgdXNlZCB3aGVuIGNvbnN0cnVjdGluZyB0aGUgaW50ZXJuYWwgSW50bC5OdW1iZXJGb3JtYXRcbi8vIGFuZCBJbnRsLkRhdGVUaW1lRm9ybWF0IGluc3RhbmNlcy5cbnNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eShNZXNzYWdlRm9ybWF0LCAnZm9ybWF0cycsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuXG4gICAgdmFsdWU6IHtcbiAgICAgICAgbnVtYmVyOiB7XG4gICAgICAgICAgICAnY3VycmVuY3knOiB7XG4gICAgICAgICAgICAgICAgc3R5bGU6ICdjdXJyZW5jeSdcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdwZXJjZW50Jzoge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAncGVyY2VudCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkYXRlOiB7XG4gICAgICAgICAgICAnc2hvcnQnOiB7XG4gICAgICAgICAgICAgICAgbW9udGg6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICBkYXkgIDogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIHllYXIgOiAnMi1kaWdpdCdcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdtZWRpdW0nOiB7XG4gICAgICAgICAgICAgICAgbW9udGg6ICdzaG9ydCcsXG4gICAgICAgICAgICAgICAgZGF5ICA6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICB5ZWFyIDogJ251bWVyaWMnXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAnbG9uZyc6IHtcbiAgICAgICAgICAgICAgICBtb250aDogJ2xvbmcnLFxuICAgICAgICAgICAgICAgIGRheSAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgeWVhciA6ICdudW1lcmljJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgJ2Z1bGwnOiB7XG4gICAgICAgICAgICAgICAgd2Vla2RheTogJ2xvbmcnLFxuICAgICAgICAgICAgICAgIG1vbnRoICA6ICdsb25nJyxcbiAgICAgICAgICAgICAgICBkYXkgICAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgeWVhciAgIDogJ251bWVyaWMnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGltZToge1xuICAgICAgICAgICAgJ3Nob3J0Jzoge1xuICAgICAgICAgICAgICAgIGhvdXIgIDogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIG1pbnV0ZTogJ251bWVyaWMnXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAnbWVkaXVtJzogIHtcbiAgICAgICAgICAgICAgICBob3VyICA6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICBtaW51dGU6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICBzZWNvbmQ6ICdudW1lcmljJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgJ2xvbmcnOiB7XG4gICAgICAgICAgICAgICAgaG91ciAgICAgICAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgbWludXRlICAgICAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgc2Vjb25kICAgICAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgdGltZVpvbmVOYW1lOiAnc2hvcnQnXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAnZnVsbCc6IHtcbiAgICAgICAgICAgICAgICBob3VyICAgICAgICA6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICBtaW51dGUgICAgICA6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICBzZWNvbmQgICAgICA6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICB0aW1lWm9uZU5hbWU6ICdzaG9ydCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG4vLyBEZWZpbmUgaW50ZXJuYWwgcHJpdmF0ZSBwcm9wZXJ0aWVzIGZvciBkZWFsaW5nIHdpdGggbG9jYWxlIGRhdGEuXG5zcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkoTWVzc2FnZUZvcm1hdCwgJ19fbG9jYWxlRGF0YV9fJywge3ZhbHVlOiBzcmMkZXM1JCQub2JqQ3JlYXRlKG51bGwpfSk7XG5zcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkoTWVzc2FnZUZvcm1hdCwgJ19fYWRkTG9jYWxlRGF0YScsIHt2YWx1ZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoIShkYXRhICYmIGRhdGEubG9jYWxlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnTG9jYWxlIGRhdGEgcHJvdmlkZWQgdG8gSW50bE1lc3NhZ2VGb3JtYXQgaXMgbWlzc2luZyBhICcgK1xuICAgICAgICAgICAgJ2Bsb2NhbGVgIHByb3BlcnR5J1xuICAgICAgICApO1xuICAgIH1cblxuICAgIE1lc3NhZ2VGb3JtYXQuX19sb2NhbGVEYXRhX19bZGF0YS5sb2NhbGUudG9Mb3dlckNhc2UoKV0gPSBkYXRhO1xufX0pO1xuXG4vLyBEZWZpbmVzIGBfX3BhcnNlKClgIHN0YXRpYyBtZXRob2QgYXMgYW4gZXhwb3NlZCBwcml2YXRlLlxuc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KE1lc3NhZ2VGb3JtYXQsICdfX3BhcnNlJywge3ZhbHVlOiBpbnRsJG1lc3NhZ2Vmb3JtYXQkcGFyc2VyJCRbXCJkZWZhdWx0XCJdLnBhcnNlfSk7XG5cbi8vIERlZmluZSBwdWJsaWMgYGRlZmF1bHRMb2NhbGVgIHByb3BlcnR5IHdoaWNoIGRlZmF1bHRzIHRvIEVuZ2xpc2gsIGJ1dCBjYW4gYmVcbi8vIHNldCBieSB0aGUgZGV2ZWxvcGVyLlxuc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KE1lc3NhZ2VGb3JtYXQsICdkZWZhdWx0TG9jYWxlJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgd3JpdGFibGUgIDogdHJ1ZSxcbiAgICB2YWx1ZSAgICAgOiB1bmRlZmluZWRcbn0pO1xuXG5NZXNzYWdlRm9ybWF0LnByb3RvdHlwZS5yZXNvbHZlZE9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogUHJvdmlkZSBhbnl0aGluZyBlbHNlP1xuICAgIHJldHVybiB7XG4gICAgICAgIGxvY2FsZTogdGhpcy5fbG9jYWxlXG4gICAgfTtcbn07XG5cbk1lc3NhZ2VGb3JtYXQucHJvdG90eXBlLl9jb21waWxlUGF0dGVybiA9IGZ1bmN0aW9uIChhc3QsIGxvY2FsZXMsIGZvcm1hdHMsIHBsdXJhbEZuKSB7XG4gICAgdmFyIGNvbXBpbGVyID0gbmV3IHNyYyRjb21waWxlciQkW1wiZGVmYXVsdFwiXShsb2NhbGVzLCBmb3JtYXRzLCBwbHVyYWxGbik7XG4gICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGUoYXN0KTtcbn07XG5cbk1lc3NhZ2VGb3JtYXQucHJvdG90eXBlLl9maW5kUGx1cmFsUnVsZUZ1bmN0aW9uID0gZnVuY3Rpb24gKGxvY2FsZSkge1xuICAgIHZhciBsb2NhbGVEYXRhID0gTWVzc2FnZUZvcm1hdC5fX2xvY2FsZURhdGFfXztcbiAgICB2YXIgZGF0YSAgICAgICA9IGxvY2FsZURhdGFbbG9jYWxlLnRvTG93ZXJDYXNlKCldO1xuXG4gICAgLy8gVGhlIGxvY2FsZSBkYXRhIGlzIGRlLWR1cGxpY2F0ZWQsIHNvIHdlIGhhdmUgdG8gdHJhdmVyc2UgdGhlIGxvY2FsZSdzXG4gICAgLy8gaGllcmFyY2h5IHVudGlsIHdlIGZpbmQgYSBgcGx1cmFsUnVsZUZ1bmN0aW9uYCB0byByZXR1cm4uXG4gICAgd2hpbGUgKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEucGx1cmFsUnVsZUZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5wbHVyYWxSdWxlRnVuY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhID0gZGF0YS5wYXJlbnRMb2NhbGUgJiYgbG9jYWxlRGF0YVtkYXRhLnBhcmVudExvY2FsZS50b0xvd2VyQ2FzZSgpXTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdMb2NhbGUgZGF0YSBhZGRlZCB0byBJbnRsTWVzc2FnZUZvcm1hdCBpcyBtaXNzaW5nIGEgJyArXG4gICAgICAgICdgcGx1cmFsUnVsZUZ1bmN0aW9uYCBmb3IgOicgKyBsb2NhbGVcbiAgICApO1xufTtcblxuTWVzc2FnZUZvcm1hdC5wcm90b3R5cGUuX2Zvcm1hdCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCB2YWx1ZXMpIHtcbiAgICB2YXIgcmVzdWx0ID0gJycsXG4gICAgICAgIGksIGxlbiwgcGFydCwgaWQsIHZhbHVlLCBlcnI7XG5cbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBwYXR0ZXJuLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIHBhcnQgPSBwYXR0ZXJuW2ldO1xuXG4gICAgICAgIC8vIEV4aXN0IGVhcmx5IGZvciBzdHJpbmcgcGFydHMuXG4gICAgICAgIGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBwYXJ0O1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZCA9IHBhcnQuaWQ7XG5cbiAgICAgICAgLy8gRW5mb3JjZSB0aGF0IGFsbCByZXF1aXJlZCB2YWx1ZXMgYXJlIHByb3ZpZGVkIGJ5IHRoZSBjYWxsZXIuXG4gICAgICAgIGlmICghKHZhbHVlcyAmJiBzcmMkdXRpbHMkJC5ob3AuY2FsbCh2YWx1ZXMsIGlkKSkpIHtcbiAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoJ0EgdmFsdWUgbXVzdCBiZSBwcm92aWRlZCBmb3I6ICcgKyBpZCk7XG4gICAgICAgICAgZXJyLnZhcmlhYmxlSWQgPSBpZDtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZSA9IHZhbHVlc1tpZF07XG5cbiAgICAgICAgLy8gUmVjdXJzaXZlbHkgZm9ybWF0IHBsdXJhbCBhbmQgc2VsZWN0IHBhcnRzJyBvcHRpb24g4oCUIHdoaWNoIGNhbiBiZSBhXG4gICAgICAgIC8vIG5lc3RlZCBwYXR0ZXJuIHN0cnVjdHVyZS4gVGhlIGNob29zaW5nIG9mIHRoZSBvcHRpb24gdG8gdXNlIGlzXG4gICAgICAgIC8vIGFic3RyYWN0ZWQtYnkgYW5kIGRlbGVnYXRlZC10byB0aGUgcGFydCBoZWxwZXIgb2JqZWN0LlxuICAgICAgICBpZiAocGFydC5vcHRpb25zKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gdGhpcy5fZm9ybWF0KHBhcnQuZ2V0T3B0aW9uKHZhbHVlKSwgdmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBwYXJ0LmZvcm1hdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuTWVzc2FnZUZvcm1hdC5wcm90b3R5cGUuX21lcmdlRm9ybWF0cyA9IGZ1bmN0aW9uIChkZWZhdWx0cywgZm9ybWF0cykge1xuICAgIHZhciBtZXJnZWRGb3JtYXRzID0ge30sXG4gICAgICAgIHR5cGUsIG1lcmdlZFR5cGU7XG5cbiAgICBmb3IgKHR5cGUgaW4gZGVmYXVsdHMpIHtcbiAgICAgICAgaWYgKCFzcmMkdXRpbHMkJC5ob3AuY2FsbChkZWZhdWx0cywgdHlwZSkpIHsgY29udGludWU7IH1cblxuICAgICAgICBtZXJnZWRGb3JtYXRzW3R5cGVdID0gbWVyZ2VkVHlwZSA9IHNyYyRlczUkJC5vYmpDcmVhdGUoZGVmYXVsdHNbdHlwZV0pO1xuXG4gICAgICAgIGlmIChmb3JtYXRzICYmIHNyYyR1dGlscyQkLmhvcC5jYWxsKGZvcm1hdHMsIHR5cGUpKSB7XG4gICAgICAgICAgICBzcmMkdXRpbHMkJC5leHRlbmQobWVyZ2VkVHlwZSwgZm9ybWF0c1t0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VkRm9ybWF0cztcbn07XG5cbk1lc3NhZ2VGb3JtYXQucHJvdG90eXBlLl9yZXNvbHZlTG9jYWxlID0gZnVuY3Rpb24gKGxvY2FsZXMpIHtcbiAgICBpZiAodHlwZW9mIGxvY2FsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGxvY2FsZXMgPSBbbG9jYWxlc107XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgY29weSBvZiB0aGUgYXJyYXkgc28gd2UgY2FuIHB1c2ggb24gdGhlIGRlZmF1bHQgbG9jYWxlLlxuICAgIGxvY2FsZXMgPSAobG9jYWxlcyB8fCBbXSkuY29uY2F0KE1lc3NhZ2VGb3JtYXQuZGVmYXVsdExvY2FsZSk7XG5cbiAgICB2YXIgbG9jYWxlRGF0YSA9IE1lc3NhZ2VGb3JtYXQuX19sb2NhbGVEYXRhX187XG4gICAgdmFyIGksIGxlbiwgbG9jYWxlUGFydHMsIGRhdGE7XG5cbiAgICAvLyBVc2luZyB0aGUgc2V0IG9mIGxvY2FsZXMgKyB0aGUgZGVmYXVsdCBsb2NhbGUsIHdlIGxvb2sgZm9yIHRoZSBmaXJzdCBvbmVcbiAgICAvLyB3aGljaCB0aGF0IGhhcyBiZWVuIHJlZ2lzdGVyZWQuIFdoZW4gZGF0YSBkb2VzIG5vdCBleGlzdCBmb3IgYSBsb2NhbGUsIHdlXG4gICAgLy8gdHJhdmVyc2UgaXRzIGFuY2VzdG9ycyB0byBmaW5kIHNvbWV0aGluZyB0aGF0J3MgYmVlbiByZWdpc3RlcmVkIHdpdGhpblxuICAgIC8vIGl0cyBoaWVyYXJjaHkgb2YgbG9jYWxlcy4gU2luY2Ugd2UgbGFjayB0aGUgcHJvcGVyIGBwYXJlbnRMb2NhbGVgIGRhdGFcbiAgICAvLyBoZXJlLCB3ZSBtdXN0IHRha2UgYSBuYWl2ZSBhcHByb2FjaCB0byB0cmF2ZXJzYWwuXG4gICAgZm9yIChpID0gMCwgbGVuID0gbG9jYWxlcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBsb2NhbGVQYXJ0cyA9IGxvY2FsZXNbaV0udG9Mb3dlckNhc2UoKS5zcGxpdCgnLScpO1xuXG4gICAgICAgIHdoaWxlIChsb2NhbGVQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGEgPSBsb2NhbGVEYXRhW2xvY2FsZVBhcnRzLmpvaW4oJy0nKV07XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIFJldHVybiB0aGUgbm9ybWFsaXplZCBsb2NhbGUgc3RyaW5nOyBlLmcuLCB3ZSByZXR1cm4gXCJlbi1VU1wiLFxuICAgICAgICAgICAgICAgIC8vIGluc3RlYWQgb2YgXCJlbi11c1wiLlxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmxvY2FsZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9jYWxlUGFydHMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdExvY2FsZSA9IGxvY2FsZXMucG9wKCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnTm8gbG9jYWxlIGRhdGEgaGFzIGJlZW4gYWRkZWQgdG8gSW50bE1lc3NhZ2VGb3JtYXQgZm9yOiAnICtcbiAgICAgICAgbG9jYWxlcy5qb2luKCcsICcpICsgJywgb3IgdGhlIGRlZmF1bHQgbG9jYWxlOiAnICsgZGVmYXVsdExvY2FsZVxuICAgICk7XG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb3JlLmpzLm1hcCIsIi8vIEdFTkVSQVRFRCBGSUxFXG5cInVzZSBzdHJpY3RcIjtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0ge1wibG9jYWxlXCI6XCJlblwiLFwicGx1cmFsUnVsZUZ1bmN0aW9uXCI6ZnVuY3Rpb24gKG4sb3JkKXt2YXIgcz1TdHJpbmcobikuc3BsaXQoXCIuXCIpLHYwPSFzWzFdLHQwPU51bWJlcihzWzBdKT09bixuMTA9dDAmJnNbMF0uc2xpY2UoLTEpLG4xMDA9dDAmJnNbMF0uc2xpY2UoLTIpO2lmKG9yZClyZXR1cm4gbjEwPT0xJiZuMTAwIT0xMT9cIm9uZVwiOm4xMD09MiYmbjEwMCE9MTI/XCJ0d29cIjpuMTA9PTMmJm4xMDAhPTEzP1wiZmV3XCI6XCJvdGhlclwiO3JldHVybiBuPT0xJiZ2MD9cIm9uZVwiOlwib3RoZXJcIn19O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbi5qcy5tYXAiLCIvKlxuQ29weXJpZ2h0IChjKSAyMDE0LCBZYWhvbyEgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBMaWNlbnNlLlxuU2VlIHRoZSBhY2NvbXBhbnlpbmcgTElDRU5TRSBmaWxlIGZvciB0ZXJtcy5cbiovXG5cbi8qIGpzbGludCBlc25leHQ6IHRydWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgc3JjJHV0aWxzJCQgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcblxuLy8gUHVycG9zZWx5IHVzaW5nIHRoZSBzYW1lIGltcGxlbWVudGF0aW9uIGFzIHRoZSBJbnRsLmpzIGBJbnRsYCBwb2x5ZmlsbC5cbi8vIENvcHlyaWdodCAyMDEzIEFuZHkgRWFybnNoYXcsIE1JVCBMaWNlbnNlXG5cbnZhciByZWFsRGVmaW5lUHJvcCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHsgcmV0dXJuICEhT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHt9KTsgfVxuICAgIGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfVxufSkoKTtcblxudmFyIGVzMyA9ICFyZWFsRGVmaW5lUHJvcCAmJiAhT2JqZWN0LnByb3RvdHlwZS5fX2RlZmluZUdldHRlcl9fO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSByZWFsRGVmaW5lUHJvcCA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6XG4gICAgICAgIGZ1bmN0aW9uIChvYmosIG5hbWUsIGRlc2MpIHtcblxuICAgIGlmICgnZ2V0JyBpbiBkZXNjICYmIG9iai5fX2RlZmluZUdldHRlcl9fKSB7XG4gICAgICAgIG9iai5fX2RlZmluZUdldHRlcl9fKG5hbWUsIGRlc2MuZ2V0KTtcbiAgICB9IGVsc2UgaWYgKCFzcmMkdXRpbHMkJC5ob3AuY2FsbChvYmosIG5hbWUpIHx8ICd2YWx1ZScgaW4gZGVzYykge1xuICAgICAgICBvYmpbbmFtZV0gPSBkZXNjLnZhbHVlO1xuICAgIH1cbn07XG5cbnZhciBvYmpDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90bywgcHJvcHMpIHtcbiAgICB2YXIgb2JqLCBrO1xuXG4gICAgZnVuY3Rpb24gRigpIHt9XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICBvYmogPSBuZXcgRigpO1xuXG4gICAgZm9yIChrIGluIHByb3BzKSB7XG4gICAgICAgIGlmIChzcmMkdXRpbHMkJC5ob3AuY2FsbChwcm9wcywgaykpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KG9iaiwgaywgcHJvcHNba10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydHMuZGVmaW5lUHJvcGVydHkgPSBkZWZpbmVQcm9wZXJ0eSwgZXhwb3J0cy5vYmpDcmVhdGUgPSBvYmpDcmVhdGU7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVzNS5qcy5tYXAiLCIvKiBqc2xpbnQgZXNuZXh0OiB0cnVlICovXG5cblwidXNlIHN0cmljdFwiO1xudmFyIHNyYyRjb3JlJCQgPSByZXF1aXJlKFwiLi9jb3JlXCIpLCBzcmMkZW4kJCA9IHJlcXVpcmUoXCIuL2VuXCIpO1xuXG5zcmMkY29yZSQkW1wiZGVmYXVsdFwiXS5fX2FkZExvY2FsZURhdGEoc3JjJGVuJCRbXCJkZWZhdWx0XCJdKTtcbnNyYyRjb3JlJCRbXCJkZWZhdWx0XCJdLmRlZmF1bHRMb2NhbGUgPSAnZW4nO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHNyYyRjb3JlJCRbXCJkZWZhdWx0XCJdO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQsIFlhaG9vISBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5Db3B5cmlnaHRzIGxpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIExpY2Vuc2UuXG5TZWUgdGhlIGFjY29tcGFueWluZyBMSUNFTlNFIGZpbGUgZm9yIHRlcm1zLlxuKi9cblxuLyoganNsaW50IGVzbmV4dDogdHJ1ZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcbmV4cG9ydHMuZXh0ZW5kID0gZXh0ZW5kO1xudmFyIGhvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmZ1bmN0aW9uIGV4dGVuZChvYmopIHtcbiAgICB2YXIgc291cmNlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgIGksIGxlbiwgc291cmNlLCBrZXk7XG5cbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBzb3VyY2VzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIHNvdXJjZSA9IHNvdXJjZXNbaV07XG4gICAgICAgIGlmICghc291cmNlKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoaG9wLmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59XG5leHBvcnRzLmhvcCA9IGhvcDtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuXCIsXCJwbHVyYWxSdWxlRnVuY3Rpb25cIjpmdW5jdGlvbiAobixvcmQpe3ZhciBzPVN0cmluZyhuKS5zcGxpdChcIi5cIiksdjA9IXNbMV0sdDA9TnVtYmVyKHNbMF0pPT1uLG4xMD10MCYmc1swXS5zbGljZSgtMSksbjEwMD10MCYmc1swXS5zbGljZSgtMik7aWYob3JkKXJldHVybiBuMTA9PTEmJm4xMDAhPTExP1wib25lXCI6bjEwPT0yJiZuMTAwIT0xMj9cInR3b1wiOm4xMD09MyYmbjEwMCE9MTM/XCJmZXdcIjpcIm90aGVyXCI7cmV0dXJuIG49PTEmJnYwP1wib25lXCI6XCJvdGhlclwifSxcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwieWVhclwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJ0aGlzIHllYXJcIixcIjFcIjpcIm5leHQgeWVhclwiLFwiLTFcIjpcImxhc3QgeWVhclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IHllYXJcIixcIm90aGVyXCI6XCJpbiB7MH0geWVhcnNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJ7MH0geWVhciBhZ29cIixcIm90aGVyXCI6XCJ7MH0geWVhcnMgYWdvXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtb250aFwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJ0aGlzIG1vbnRoXCIsXCIxXCI6XCJuZXh0IG1vbnRoXCIsXCItMVwiOlwibGFzdCBtb250aFwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IG1vbnRoXCIsXCJvdGhlclwiOlwiaW4gezB9IG1vbnRoc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSBtb250aCBhZ29cIixcIm90aGVyXCI6XCJ7MH0gbW9udGhzIGFnb1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcImRheVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJ0b2RheVwiLFwiMVwiOlwidG9tb3Jyb3dcIixcIi0xXCI6XCJ5ZXN0ZXJkYXlcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImluIHswfSBkYXlcIixcIm90aGVyXCI6XCJpbiB7MH0gZGF5c1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSBkYXkgYWdvXCIsXCJvdGhlclwiOlwiezB9IGRheXMgYWdvXCJ9fX0sXCJob3VyXCI6e1wiZGlzcGxheU5hbWVcIjpcImhvdXJcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IGhvdXJcIixcIm90aGVyXCI6XCJpbiB7MH0gaG91cnNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJ7MH0gaG91ciBhZ29cIixcIm90aGVyXCI6XCJ7MH0gaG91cnMgYWdvXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRlXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImluIHswfSBtaW51dGVcIixcIm90aGVyXCI6XCJpbiB7MH0gbWludXRlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSBtaW51dGUgYWdvXCIsXCJvdGhlclwiOlwiezB9IG1pbnV0ZXMgYWdvXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwic2Vjb25kXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcIm5vd1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IHNlY29uZFwiLFwib3RoZXJcIjpcImluIHswfSBzZWNvbmRzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IHNlY29uZCBhZ29cIixcIm90aGVyXCI6XCJ7MH0gc2Vjb25kcyBhZ29cIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi0wMDFcIixcInBhcmVudExvY2FsZVwiOlwiZW5cIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLTE1MFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUFHXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQUlcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1BU1wiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQVRcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMTUwXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1BVVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUJCXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQkVcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1CSVwiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQk1cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1CU1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUJXXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQlpcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1DQVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUNDXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQ0hcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMTUwXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1DS1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUNNXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQ1hcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1DWVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLURFXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTE1MFwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tREdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1ES1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0xNTBcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLURNXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tRHNydFwiLFwicGx1cmFsUnVsZUZ1bmN0aW9uXCI6ZnVuY3Rpb24gKG4sb3JkKXtpZihvcmQpcmV0dXJuXCJvdGhlclwiO3JldHVyblwib3RoZXJcIn0sXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcIlllYXJcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidGhpcyB5ZWFyXCIsXCIxXCI6XCJuZXh0IHllYXJcIixcIi0xXCI6XCJsYXN0IHllYXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSB5XCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IHlcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIk1vbnRoXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRoaXMgbW9udGhcIixcIjFcIjpcIm5leHQgbW9udGhcIixcIi0xXCI6XCJsYXN0IG1vbnRoXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gbVwifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBtXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiRGF5XCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRvZGF5XCIsXCIxXCI6XCJ0b21vcnJvd1wiLFwiLTFcIjpcInllc3RlcmRheVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IGRcIn0sXCJwYXN0XCI6e1wib3RoZXJcIjpcIi17MH0gZFwifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJIb3VyXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSBoXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IGhcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJNaW51dGVcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IG1pblwifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBtaW5cIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJTZWNvbmRcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwibm93XCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gc1wifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBzXCJ9fX19fSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tRVJcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1GSVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0xNTBcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUZKXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tRktcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1GTVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUdCXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tR0RcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1HR1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUdIXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tR0lcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1HTVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUdVXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1HWVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUhLXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tSUVcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1JTFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUlNXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tSU5cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1JT1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUpFXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tSk1cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1LRVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUtJXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tS05cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1LWVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUxDXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTFJcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1MU1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU1HXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTUhcIixcInBhcmVudExvY2FsZVwiOlwiZW5cIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU1PXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTVBcIixcInBhcmVudExvY2FsZVwiOlwiZW5cIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU1TXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTVRcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1NVVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU1XXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTVlcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1OQVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU5GXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTkdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1OTFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0xNTBcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU5SXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTlVcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1OWlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVBHXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tUEhcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1QS1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVBOXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tUFJcIixcInBhcmVudExvY2FsZVwiOlwiZW5cIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVBXXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tUldcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TQlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNDXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU0RcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TRVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0xNTBcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNHXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU0hcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TSVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0xNTBcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNMXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU1NcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TWFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNaXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU2hhd1wiLFwicGx1cmFsUnVsZUZ1bmN0aW9uXCI6ZnVuY3Rpb24gKG4sb3JkKXtpZihvcmQpcmV0dXJuXCJvdGhlclwiO3JldHVyblwib3RoZXJcIn0sXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcIlllYXJcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidGhpcyB5ZWFyXCIsXCIxXCI6XCJuZXh0IHllYXJcIixcIi0xXCI6XCJsYXN0IHllYXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSB5XCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IHlcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIk1vbnRoXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRoaXMgbW9udGhcIixcIjFcIjpcIm5leHQgbW9udGhcIixcIi0xXCI6XCJsYXN0IG1vbnRoXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gbVwifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBtXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiRGF5XCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRvZGF5XCIsXCIxXCI6XCJ0b21vcnJvd1wiLFwiLTFcIjpcInllc3RlcmRheVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IGRcIn0sXCJwYXN0XCI6e1wib3RoZXJcIjpcIi17MH0gZFwifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJIb3VyXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSBoXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IGhcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJNaW51dGVcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IG1pblwifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBtaW5cIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJTZWNvbmRcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwibm93XCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gc1wifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBzXCJ9fX19fSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVENcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1US1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVRPXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVFRcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1UVlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVRaXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVUdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1VTVwiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVVNcIixcInBhcmVudExvY2FsZVwiOlwiZW5cIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVZDXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVkdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1WSVwiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVlVcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1XU1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVpBXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tWk1cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1aV1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuIiwiSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzXCIsXCJwbHVyYWxSdWxlRnVuY3Rpb25cIjpmdW5jdGlvbiAobixvcmQpe2lmKG9yZClyZXR1cm5cIm90aGVyXCI7cmV0dXJuIG49PTE/XCJvbmVcIjpcIm90aGVyXCJ9LFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJhw7FvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgYcOxb1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gYcOxb1wiLFwiLTFcIjpcImVsIGHDsW8gcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGHDsW9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGHDsW9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IGHDsW9zXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtZXNcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBtZXNcIixcIjFcIjpcImVsIHByw7N4aW1vIG1lc1wiLFwiLTFcIjpcImVsIG1lcyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtZXNlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1lc1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1lc2VzXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZMOtYVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJob3lcIixcIjFcIjpcIm1hw7FhbmFcIixcIjJcIjpcInBhc2FkbyBtYcOxYW5hXCIsXCItMlwiOlwiYW50ZWF5ZXJcIixcIi0xXCI6XCJheWVyXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGTDrWFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGTDrWFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGTDrWFzXCJ9fX0sXCJob3VyXCI6e1wiZGlzcGxheU5hbWVcIjpcImhvcmFcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBob3Jhc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGhvcmFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBob3Jhc1wifX19LFwibWludXRlXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1pbnV0b1wiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWludXRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1pbnV0b3NcIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJzZWd1bmRvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImFob3JhXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IHNlZ3VuZG9zXCJ9fX19fSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtNDE5XCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1BUlwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLUJPXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtQ0xcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1DT1wiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLUNSXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwiLFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJhw7FvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgYcOxb1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gYcOxb1wiLFwiLTFcIjpcImVsIGHDsW8gcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGHDsW9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGHDsW9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IGHDsW9zXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtZXNcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBtZXNcIixcIjFcIjpcImVsIHByw7N4aW1vIG1lc1wiLFwiLTFcIjpcImVsIG1lcyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtZXNlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1lc1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1lc2VzXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZMOtYVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJob3lcIixcIjFcIjpcIm1hw7FhbmFcIixcIjJcIjpcInBhc2FkbyBtYcOxYW5hXCIsXCItMlwiOlwiYW50aWVyXCIsXCItMVwiOlwiYXllclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBkw61hc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGTDrWFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBkw61hc1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3JhXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gaG9yYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gaG9yYXNcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dG9cIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBtaW51dG9zXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwic2VndW5kb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJhaG9yYVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBzZWd1bmRvc1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLUNVXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtRE9cIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCIsXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcIkHDsW9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBhw7FvXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBhw7FvXCIsXCItMVwiOlwiZWwgYcOxbyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gYcOxb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gYcOxb3NcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIk1lc1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIG1lc1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gbWVzXCIsXCItMVwiOlwiZWwgbWVzIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtZXNcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1lc2VzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWVzZXNcIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJEw61hXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImhveVwiLFwiMVwiOlwibWHDsWFuYVwiLFwiMlwiOlwicGFzYWRvIG1hw7FhbmFcIixcIi0yXCI6XCJhbnRlYXllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwiTWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcIlNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1FQVwiLFwicGFyZW50TG9jYWxlXCI6XCJlc1wifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtRUNcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1HUVwiLFwicGFyZW50TG9jYWxlXCI6XCJlc1wifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtR1RcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCIsXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcImHDsW9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBhw7FvXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBhw7FvXCIsXCItMVwiOlwiZWwgYcOxbyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gYcOxb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gYcOxb3NcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1lc1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIG1lc1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gbWVzXCIsXCItMVwiOlwiZWwgbWVzIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtZXNcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1lc2VzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWVzZXNcIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJkw61hXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImhveVwiLFwiMVwiOlwibWHDsWFuYVwiLFwiMlwiOlwicGFzYWRvIG1hw7FhbmFcIixcIi0yXCI6XCJhbnRpZXJcIixcIi0xXCI6XCJheWVyXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGTDrWFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGTDrWFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGTDrWFzXCJ9fX0sXCJob3VyXCI6e1wiZGlzcGxheU5hbWVcIjpcImhvcmFcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBob3Jhc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGhvcmFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBob3Jhc1wifX19LFwibWludXRlXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1pbnV0b1wiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWludXRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1pbnV0b3NcIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJzZWd1bmRvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImFob3JhXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IHNlZ3VuZG9zXCJ9fX19fSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtSE5cIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCIsXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcImHDsW9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBhw7FvXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBhw7FvXCIsXCItMVwiOlwiZWwgYcOxbyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gYcOxb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gYcOxb3NcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1lc1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIG1lc1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gbWVzXCIsXCItMVwiOlwiZWwgbWVzIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtZXNcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1lc2VzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWVzZXNcIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJkw61hXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImhveVwiLFwiMVwiOlwibWHDsWFuYVwiLFwiMlwiOlwicGFzYWRvIG1hw7FhbmFcIixcIi0yXCI6XCJhbnRpZXJcIixcIi0xXCI6XCJheWVyXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGTDrWFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGTDrWFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGTDrWFzXCJ9fX0sXCJob3VyXCI6e1wiZGlzcGxheU5hbWVcIjpcImhvcmFcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBob3Jhc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGhvcmFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBob3Jhc1wifX19LFwibWludXRlXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1pbnV0b1wiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWludXRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1pbnV0b3NcIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJzZWd1bmRvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImFob3JhXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IHNlZ3VuZG9zXCJ9fX19fSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtSUNcIixcInBhcmVudExvY2FsZVwiOlwiZXNcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLU1YXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwiLFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJhw7FvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgYcOxb1wiLFwiMVwiOlwiZWwgYcOxbyBwcsOzeGltb1wiLFwiLTFcIjpcImVsIGHDsW8gcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGHDsW9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGHDsW9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IGHDsW9zXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtZXNcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBtZXNcIixcIjFcIjpcImVsIG1lcyBwcsOzeGltb1wiLFwiLTFcIjpcImVsIG1lcyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImVuIHswfSBtZXNcIixcIm90aGVyXCI6XCJlbiB7MH0gbWVzZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtZXNcIixcIm90aGVyXCI6XCJoYWNlIHswfSBtZXNlc1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcImTDrWFcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiaG95XCIsXCIxXCI6XCJtYcOxYW5hXCIsXCIyXCI6XCJwYXNhZG8gbWHDsWFuYVwiLFwiLTJcIjpcImFudGllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1OSVwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIixcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiYcOxb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIGHDsW9cIixcIjFcIjpcImVsIHByw7N4aW1vIGHDsW9cIixcIi0xXCI6XCJlbCBhw7FvIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBhw7Fvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGHDsW9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBhw7Fvc1wifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWVzXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgbWVzXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBtZXNcIixcIi0xXCI6XCJlbCBtZXMgcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1lc1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWVzZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtZXNcIixcIm90aGVyXCI6XCJoYWNlIHswfSBtZXNlc1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcImTDrWFcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiaG95XCIsXCIxXCI6XCJtYcOxYW5hXCIsXCIyXCI6XCJwYXNhZG8gbWHDsWFuYVwiLFwiLTJcIjpcImFudGllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1QQVwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIixcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiYcOxb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIGHDsW9cIixcIjFcIjpcImVsIHByw7N4aW1vIGHDsW9cIixcIi0xXCI6XCJlbCBhw7FvIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBhw7Fvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGHDsW9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBhw7Fvc1wifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWVzXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgbWVzXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBtZXNcIixcIi0xXCI6XCJlbCBtZXMgcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1lc1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWVzZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtZXNcIixcIm90aGVyXCI6XCJoYWNlIHswfSBtZXNlc1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcImTDrWFcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiaG95XCIsXCIxXCI6XCJtYcOxYW5hXCIsXCIyXCI6XCJwYXNhZG8gbWHDsWFuYVwiLFwiLTJcIjpcImFudGllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1QRVwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVBIXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1QUlwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVBZXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwiLFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJhw7FvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgYcOxb1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gYcOxb1wiLFwiLTFcIjpcImVsIGHDsW8gcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGHDsW9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGHDsW9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IGHDsW9zXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtZXNcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBtZXNcIixcIjFcIjpcImVsIHByw7N4aW1vIG1lc1wiLFwiLTFcIjpcImVsIG1lcyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtZXNlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1lc1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1lc2VzXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZMOtYVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJob3lcIixcIjFcIjpcIm1hw7FhbmFcIixcIjJcIjpcInBhc2FkbyBtYcOxYW5hXCIsXCItMlwiOlwiYW50ZXMgZGUgYXllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1TVlwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIixcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiYcOxb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIGHDsW9cIixcIjFcIjpcImVsIHByw7N4aW1vIGHDsW9cIixcIi0xXCI6XCJlbCBhw7FvIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBhw7Fvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGHDsW9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBhw7Fvc1wifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWVzXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgbWVzXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBtZXNcIixcIi0xXCI6XCJlbCBtZXMgcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1lc1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWVzZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtZXNcIixcIm90aGVyXCI6XCJoYWNlIHswfSBtZXNlc1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcImTDrWFcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiaG95XCIsXCIxXCI6XCJtYcOxYW5hXCIsXCIyXCI6XCJwYXNhZG8gbWHDsWFuYVwiLFwiLTJcIjpcImFudGllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1VU1wiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVVZXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtVkVcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCJ9KTtcbiIsIi8qIGpzaGludCBub2RlOnRydWUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW50bFJlbGF0aXZlRm9ybWF0ID0gcmVxdWlyZSgnLi9saWIvbWFpbicpWydkZWZhdWx0J107XG5cbi8vIEFkZCBhbGwgbG9jYWxlIGRhdGEgdG8gYEludGxSZWxhdGl2ZUZvcm1hdGAuIFRoaXMgbW9kdWxlIHdpbGwgYmUgaWdub3JlZCB3aGVuXG4vLyBidW5kbGluZyBmb3IgdGhlIGJyb3dzZXIgd2l0aCBCcm93c2VyaWZ5L1dlYnBhY2suXG5yZXF1aXJlKCcuL2xpYi9sb2NhbGVzJyk7XG5cbi8vIFJlLWV4cG9ydCBgSW50bFJlbGF0aXZlRm9ybWF0YCBhcyB0aGUgQ29tbW9uSlMgZGVmYXVsdCBleHBvcnRzIHdpdGggYWxsIHRoZVxuLy8gbG9jYWxlIGRhdGEgcmVnaXN0ZXJlZCwgYW5kIHdpdGggRW5nbGlzaCBzZXQgYXMgdGhlIGRlZmF1bHQgbG9jYWxlLiBEZWZpbmVcbi8vIHRoZSBgZGVmYXVsdGAgcHJvcCBmb3IgdXNlIHdpdGggb3RoZXIgY29tcGlsZWQgRVM2IE1vZHVsZXMuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBJbnRsUmVsYXRpdmVGb3JtYXQ7XG5leHBvcnRzWydkZWZhdWx0J10gPSBleHBvcnRzO1xuIiwiLypcbkNvcHlyaWdodCAoYykgMjAxNCwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4qL1xuXG4vKiBqc2xpbnQgZXNuZXh0OiB0cnVlICovXG5cblwidXNlIHN0cmljdFwiO1xudmFyIGludGwkbWVzc2FnZWZvcm1hdCQkID0gcmVxdWlyZShcImludGwtbWVzc2FnZWZvcm1hdFwiKSwgc3JjJGRpZmYkJCA9IHJlcXVpcmUoXCIuL2RpZmZcIiksIHNyYyRlczUkJCA9IHJlcXVpcmUoXCIuL2VzNVwiKTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gUmVsYXRpdmVGb3JtYXQ7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBGSUVMRFMgPSBbJ3NlY29uZCcsICdtaW51dGUnLCAnaG91cicsICdkYXknLCAnbW9udGgnLCAneWVhciddO1xudmFyIFNUWUxFUyA9IFsnYmVzdCBmaXQnLCAnbnVtZXJpYyddO1xuXG4vLyAtLSBSZWxhdGl2ZUZvcm1hdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBSZWxhdGl2ZUZvcm1hdChsb2NhbGVzLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBNYWtlIGEgY29weSBvZiBgbG9jYWxlc2AgaWYgaXQncyBhbiBhcnJheSwgc28gdGhhdCBpdCBkb2Vzbid0IGNoYW5nZVxuICAgIC8vIHNpbmNlIGl0J3MgdXNlZCBsYXppbHkuXG4gICAgaWYgKHNyYyRlczUkJC5pc0FycmF5KGxvY2FsZXMpKSB7XG4gICAgICAgIGxvY2FsZXMgPSBsb2NhbGVzLmNvbmNhdCgpO1xuICAgIH1cblxuICAgIHNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2xvY2FsZScsIHt2YWx1ZTogdGhpcy5fcmVzb2x2ZUxvY2FsZShsb2NhbGVzKX0pO1xuICAgIHNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX29wdGlvbnMnLCB7dmFsdWU6IHtcbiAgICAgICAgc3R5bGU6IHRoaXMuX3Jlc29sdmVTdHlsZShvcHRpb25zLnN0eWxlKSxcbiAgICAgICAgdW5pdHM6IHRoaXMuX2lzVmFsaWRVbml0cyhvcHRpb25zLnVuaXRzKSAmJiBvcHRpb25zLnVuaXRzXG4gICAgfX0pO1xuXG4gICAgc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KHRoaXMsICdfbG9jYWxlcycsIHt2YWx1ZTogbG9jYWxlc30pO1xuICAgIHNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2ZpZWxkcycsIHt2YWx1ZTogdGhpcy5fZmluZEZpZWxkcyh0aGlzLl9sb2NhbGUpfSk7XG4gICAgc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KHRoaXMsICdfbWVzc2FnZXMnLCB7dmFsdWU6IHNyYyRlczUkJC5vYmpDcmVhdGUobnVsbCl9KTtcblxuICAgIC8vIFwiQmluZFwiIGBmb3JtYXQoKWAgbWV0aG9kIHRvIGB0aGlzYCBzbyBpdCBjYW4gYmUgcGFzc2VkIGJ5IHJlZmVyZW5jZSBsaWtlXG4gICAgLy8gdGhlIG90aGVyIGBJbnRsYCBBUElzLlxuICAgIHZhciByZWxhdGl2ZUZvcm1hdCA9IHRoaXM7XG4gICAgdGhpcy5mb3JtYXQgPSBmdW5jdGlvbiBmb3JtYXQoZGF0ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gcmVsYXRpdmVGb3JtYXQuX2Zvcm1hdChkYXRlLCBvcHRpb25zKTtcbiAgICB9O1xufVxuXG4vLyBEZWZpbmUgaW50ZXJuYWwgcHJpdmF0ZSBwcm9wZXJ0aWVzIGZvciBkZWFsaW5nIHdpdGggbG9jYWxlIGRhdGEuXG5zcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkoUmVsYXRpdmVGb3JtYXQsICdfX2xvY2FsZURhdGFfXycsIHt2YWx1ZTogc3JjJGVzNSQkLm9iakNyZWF0ZShudWxsKX0pO1xuc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KFJlbGF0aXZlRm9ybWF0LCAnX19hZGRMb2NhbGVEYXRhJywge3ZhbHVlOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmICghKGRhdGEgJiYgZGF0YS5sb2NhbGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdMb2NhbGUgZGF0YSBwcm92aWRlZCB0byBJbnRsUmVsYXRpdmVGb3JtYXQgaXMgbWlzc2luZyBhICcgK1xuICAgICAgICAgICAgJ2Bsb2NhbGVgIHByb3BlcnR5IHZhbHVlJ1xuICAgICAgICApO1xuICAgIH1cblxuICAgIFJlbGF0aXZlRm9ybWF0Ll9fbG9jYWxlRGF0YV9fW2RhdGEubG9jYWxlLnRvTG93ZXJDYXNlKCldID0gZGF0YTtcblxuICAgIC8vIEFkZCBkYXRhIHRvIEludGxNZXNzYWdlRm9ybWF0LlxuICAgIGludGwkbWVzc2FnZWZvcm1hdCQkW1wiZGVmYXVsdFwiXS5fX2FkZExvY2FsZURhdGEoZGF0YSk7XG59fSk7XG5cbi8vIERlZmluZSBwdWJsaWMgYGRlZmF1bHRMb2NhbGVgIHByb3BlcnR5IHdoaWNoIGNhbiBiZSBzZXQgYnkgdGhlIGRldmVsb3Blciwgb3Jcbi8vIGl0IHdpbGwgYmUgc2V0IHdoZW4gdGhlIGZpcnN0IFJlbGF0aXZlRm9ybWF0IGluc3RhbmNlIGlzIGNyZWF0ZWQgYnlcbi8vIGxldmVyYWdpbmcgdGhlIHJlc29sdmVkIGxvY2FsZSBmcm9tIGBJbnRsYC5cbnNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eShSZWxhdGl2ZUZvcm1hdCwgJ2RlZmF1bHRMb2NhbGUnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZSAgOiB0cnVlLFxuICAgIHZhbHVlICAgICA6IHVuZGVmaW5lZFxufSk7XG5cbi8vIERlZmluZSBwdWJsaWMgYHRocmVzaG9sZHNgIHByb3BlcnR5IHdoaWNoIGNhbiBiZSBzZXQgYnkgdGhlIGRldmVsb3BlciwgYW5kXG4vLyBkZWZhdWx0cyB0byByZWxhdGl2ZSB0aW1lIHRocmVzaG9sZHMgZnJvbSBtb21lbnQuanMuXG5zcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkoUmVsYXRpdmVGb3JtYXQsICd0aHJlc2hvbGRzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG5cbiAgICB2YWx1ZToge1xuICAgICAgICBzZWNvbmQ6IDQ1LCAgLy8gc2Vjb25kcyB0byBtaW51dGVcbiAgICAgICAgbWludXRlOiA0NSwgIC8vIG1pbnV0ZXMgdG8gaG91clxuICAgICAgICBob3VyICA6IDIyLCAgLy8gaG91cnMgdG8gZGF5XG4gICAgICAgIGRheSAgIDogMjYsICAvLyBkYXlzIHRvIG1vbnRoXG4gICAgICAgIG1vbnRoIDogMTEgICAvLyBtb250aHMgdG8geWVhclxuICAgIH1cbn0pO1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUucmVzb2x2ZWRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGxvY2FsZTogdGhpcy5fbG9jYWxlLFxuICAgICAgICBzdHlsZSA6IHRoaXMuX29wdGlvbnMuc3R5bGUsXG4gICAgICAgIHVuaXRzIDogdGhpcy5fb3B0aW9ucy51bml0c1xuICAgIH07XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX2NvbXBpbGVNZXNzYWdlID0gZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgLy8gYHRoaXMuX2xvY2FsZXNgIGlzIHRoZSBvcmlnaW5hbCBzZXQgb2YgbG9jYWxlcyB0aGUgdXNlciBzcGVjaWZpZWQgdG8gdGhlXG4gICAgLy8gY29uc3RydWN0b3IsIHdoaWxlIGB0aGlzLl9sb2NhbGVgIGlzIHRoZSByZXNvbHZlZCByb290IGxvY2FsZS5cbiAgICB2YXIgbG9jYWxlcyAgICAgICAgPSB0aGlzLl9sb2NhbGVzO1xuICAgIHZhciByZXNvbHZlZExvY2FsZSA9IHRoaXMuX2xvY2FsZTtcblxuICAgIHZhciBmaWVsZCAgICAgICAgPSB0aGlzLl9maWVsZHNbdW5pdHNdO1xuICAgIHZhciByZWxhdGl2ZVRpbWUgPSBmaWVsZC5yZWxhdGl2ZVRpbWU7XG4gICAgdmFyIGZ1dHVyZSAgICAgICA9ICcnO1xuICAgIHZhciBwYXN0ICAgICAgICAgPSAnJztcbiAgICB2YXIgaTtcblxuICAgIGZvciAoaSBpbiByZWxhdGl2ZVRpbWUuZnV0dXJlKSB7XG4gICAgICAgIGlmIChyZWxhdGl2ZVRpbWUuZnV0dXJlLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBmdXR1cmUgKz0gJyAnICsgaSArICcgeycgK1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlVGltZS5mdXR1cmVbaV0ucmVwbGFjZSgnezB9JywgJyMnKSArICd9JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSBpbiByZWxhdGl2ZVRpbWUucGFzdCkge1xuICAgICAgICBpZiAocmVsYXRpdmVUaW1lLnBhc3QuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIHBhc3QgKz0gJyAnICsgaSArICcgeycgK1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlVGltZS5wYXN0W2ldLnJlcGxhY2UoJ3swfScsICcjJykgKyAnfSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbWVzc2FnZSA9ICd7d2hlbiwgc2VsZWN0LCBmdXR1cmUge3swLCBwbHVyYWwsICcgKyBmdXR1cmUgKyAnfX0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwYXN0IHt7MCwgcGx1cmFsLCAnICsgcGFzdCArICd9fX0nO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBzeW50aGV0aWMgSW50bE1lc3NhZ2VGb3JtYXQgaW5zdGFuY2UgdXNpbmcgdGhlIG9yaWdpbmFsXG4gICAgLy8gbG9jYWxlcyB2YWx1ZSBzcGVjaWZpZWQgYnkgdGhlIHVzZXIgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlIHRoZSBwYXJlbnRcbiAgICAvLyBJbnRsUmVsYXRpdmVGb3JtYXQgaW5zdGFuY2UuXG4gICAgcmV0dXJuIG5ldyBpbnRsJG1lc3NhZ2Vmb3JtYXQkJFtcImRlZmF1bHRcIl0obWVzc2FnZSwgbG9jYWxlcyk7XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX2dldE1lc3NhZ2UgPSBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlcztcblxuICAgIC8vIENyZWF0ZSBhIG5ldyBzeW50aGV0aWMgbWVzc2FnZSBiYXNlZCBvbiB0aGUgbG9jYWxlIGRhdGEgZnJvbSBDTERSLlxuICAgIGlmICghbWVzc2FnZXNbdW5pdHNdKSB7XG4gICAgICAgIG1lc3NhZ2VzW3VuaXRzXSA9IHRoaXMuX2NvbXBpbGVNZXNzYWdlKHVuaXRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVzc2FnZXNbdW5pdHNdO1xufTtcblxuUmVsYXRpdmVGb3JtYXQucHJvdG90eXBlLl9nZXRSZWxhdGl2ZVVuaXRzID0gZnVuY3Rpb24gKGRpZmYsIHVuaXRzKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5fZmllbGRzW3VuaXRzXTtcblxuICAgIGlmIChmaWVsZC5yZWxhdGl2ZSkge1xuICAgICAgICByZXR1cm4gZmllbGQucmVsYXRpdmVbZGlmZl07XG4gICAgfVxufTtcblxuUmVsYXRpdmVGb3JtYXQucHJvdG90eXBlLl9maW5kRmllbGRzID0gZnVuY3Rpb24gKGxvY2FsZSkge1xuICAgIHZhciBsb2NhbGVEYXRhID0gUmVsYXRpdmVGb3JtYXQuX19sb2NhbGVEYXRhX187XG4gICAgdmFyIGRhdGEgICAgICAgPSBsb2NhbGVEYXRhW2xvY2FsZS50b0xvd2VyQ2FzZSgpXTtcblxuICAgIC8vIFRoZSBsb2NhbGUgZGF0YSBpcyBkZS1kdXBsaWNhdGVkLCBzbyB3ZSBoYXZlIHRvIHRyYXZlcnNlIHRoZSBsb2NhbGUnc1xuICAgIC8vIGhpZXJhcmNoeSB1bnRpbCB3ZSBmaW5kIGBmaWVsZHNgIHRvIHJldHVybi5cbiAgICB3aGlsZSAoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5maWVsZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmZpZWxkcztcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEgPSBkYXRhLnBhcmVudExvY2FsZSAmJiBsb2NhbGVEYXRhW2RhdGEucGFyZW50TG9jYWxlLnRvTG93ZXJDYXNlKCldO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0xvY2FsZSBkYXRhIGFkZGVkIHRvIEludGxSZWxhdGl2ZUZvcm1hdCBpcyBtaXNzaW5nIGBmaWVsZHNgIGZvciA6JyArXG4gICAgICAgIGxvY2FsZVxuICAgICk7XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX2Zvcm1hdCA9IGZ1bmN0aW9uIChkYXRlLCBvcHRpb25zKSB7XG4gICAgdmFyIG5vdyA9IG9wdGlvbnMgJiYgb3B0aW9ucy5ub3cgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMubm93IDogc3JjJGVzNSQkLmRhdGVOb3coKTtcblxuICAgIGlmIChkYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGF0ZSA9IG5vdztcbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgdGhlIGBkYXRlYCBhbmQgb3B0aW9uYWwgYG5vd2AgdmFsdWVzIGFyZSB2YWxpZCwgYW5kIHRocm93IGFcbiAgICAvLyBzaW1pbGFyIGVycm9yIHRvIHdoYXQgYEludGwuRGF0ZVRpbWVGb3JtYXQjZm9ybWF0KClgIHdvdWxkIHRocm93LlxuICAgIGlmICghaXNGaW5pdGUobm93KSkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgICAgICdUaGUgYG5vd2Agb3B0aW9uIHByb3ZpZGVkIHRvIEludGxSZWxhdGl2ZUZvcm1hdCNmb3JtYXQoKSBpcyBub3QgJyArXG4gICAgICAgICAgICAnaW4gdmFsaWQgcmFuZ2UuJ1xuICAgICAgICApO1xuICAgIH1cblxuICAgIGlmICghaXNGaW5pdGUoZGF0ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXG4gICAgICAgICAgICAnVGhlIGRhdGUgdmFsdWUgcHJvdmlkZWQgdG8gSW50bFJlbGF0aXZlRm9ybWF0I2Zvcm1hdCgpIGlzIG5vdCAnICtcbiAgICAgICAgICAgICdpbiB2YWxpZCByYW5nZS4nXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGRpZmZSZXBvcnQgID0gc3JjJGRpZmYkJFtcImRlZmF1bHRcIl0obm93LCBkYXRlKTtcbiAgICB2YXIgdW5pdHMgICAgICAgPSB0aGlzLl9vcHRpb25zLnVuaXRzIHx8IHRoaXMuX3NlbGVjdFVuaXRzKGRpZmZSZXBvcnQpO1xuICAgIHZhciBkaWZmSW5Vbml0cyA9IGRpZmZSZXBvcnRbdW5pdHNdO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuc3R5bGUgIT09ICdudW1lcmljJykge1xuICAgICAgICB2YXIgcmVsYXRpdmVVbml0cyA9IHRoaXMuX2dldFJlbGF0aXZlVW5pdHMoZGlmZkluVW5pdHMsIHVuaXRzKTtcbiAgICAgICAgaWYgKHJlbGF0aXZlVW5pdHMpIHtcbiAgICAgICAgICAgIHJldHVybiByZWxhdGl2ZVVuaXRzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2dldE1lc3NhZ2UodW5pdHMpLmZvcm1hdCh7XG4gICAgICAgICcwJyA6IE1hdGguYWJzKGRpZmZJblVuaXRzKSxcbiAgICAgICAgd2hlbjogZGlmZkluVW5pdHMgPCAwID8gJ3Bhc3QnIDogJ2Z1dHVyZSdcbiAgICB9KTtcbn07XG5cblJlbGF0aXZlRm9ybWF0LnByb3RvdHlwZS5faXNWYWxpZFVuaXRzID0gZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgaWYgKCF1bml0cyB8fCBzcmMkZXM1JCQuYXJySW5kZXhPZi5jYWxsKEZJRUxEUywgdW5pdHMpID49IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB1bml0cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFyIHN1Z2dlc3Rpb24gPSAvcyQvLnRlc3QodW5pdHMpICYmIHVuaXRzLnN1YnN0cigwLCB1bml0cy5sZW5ndGggLSAxKTtcbiAgICAgICAgaWYgKHN1Z2dlc3Rpb24gJiYgc3JjJGVzNSQkLmFyckluZGV4T2YuY2FsbChGSUVMRFMsIHN1Z2dlc3Rpb24pID49IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAnXCInICsgdW5pdHMgKyAnXCIgaXMgbm90IGEgdmFsaWQgSW50bFJlbGF0aXZlRm9ybWF0IGB1bml0c2AgJyArXG4gICAgICAgICAgICAgICAgJ3ZhbHVlLCBkaWQgeW91IG1lYW46ICcgKyBzdWdnZXN0aW9uXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnXCInICsgdW5pdHMgKyAnXCIgaXMgbm90IGEgdmFsaWQgSW50bFJlbGF0aXZlRm9ybWF0IGB1bml0c2AgdmFsdWUsIGl0ICcgK1xuICAgICAgICAnbXVzdCBiZSBvbmUgb2Y6IFwiJyArIEZJRUxEUy5qb2luKCdcIiwgXCInKSArICdcIidcbiAgICApO1xufTtcblxuUmVsYXRpdmVGb3JtYXQucHJvdG90eXBlLl9yZXNvbHZlTG9jYWxlID0gZnVuY3Rpb24gKGxvY2FsZXMpIHtcbiAgICBpZiAodHlwZW9mIGxvY2FsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGxvY2FsZXMgPSBbbG9jYWxlc107XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgY29weSBvZiB0aGUgYXJyYXkgc28gd2UgY2FuIHB1c2ggb24gdGhlIGRlZmF1bHQgbG9jYWxlLlxuICAgIGxvY2FsZXMgPSAobG9jYWxlcyB8fCBbXSkuY29uY2F0KFJlbGF0aXZlRm9ybWF0LmRlZmF1bHRMb2NhbGUpO1xuXG4gICAgdmFyIGxvY2FsZURhdGEgPSBSZWxhdGl2ZUZvcm1hdC5fX2xvY2FsZURhdGFfXztcbiAgICB2YXIgaSwgbGVuLCBsb2NhbGVQYXJ0cywgZGF0YTtcblxuICAgIC8vIFVzaW5nIHRoZSBzZXQgb2YgbG9jYWxlcyArIHRoZSBkZWZhdWx0IGxvY2FsZSwgd2UgbG9vayBmb3IgdGhlIGZpcnN0IG9uZVxuICAgIC8vIHdoaWNoIHRoYXQgaGFzIGJlZW4gcmVnaXN0ZXJlZC4gV2hlbiBkYXRhIGRvZXMgbm90IGV4aXN0IGZvciBhIGxvY2FsZSwgd2VcbiAgICAvLyB0cmF2ZXJzZSBpdHMgYW5jZXN0b3JzIHRvIGZpbmQgc29tZXRoaW5nIHRoYXQncyBiZWVuIHJlZ2lzdGVyZWQgd2l0aGluXG4gICAgLy8gaXRzIGhpZXJhcmNoeSBvZiBsb2NhbGVzLiBTaW5jZSB3ZSBsYWNrIHRoZSBwcm9wZXIgYHBhcmVudExvY2FsZWAgZGF0YVxuICAgIC8vIGhlcmUsIHdlIG11c3QgdGFrZSBhIG5haXZlIGFwcHJvYWNoIHRvIHRyYXZlcnNhbC5cbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBsb2NhbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIGxvY2FsZVBhcnRzID0gbG9jYWxlc1tpXS50b0xvd2VyQ2FzZSgpLnNwbGl0KCctJyk7XG5cbiAgICAgICAgd2hpbGUgKGxvY2FsZVBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgZGF0YSA9IGxvY2FsZURhdGFbbG9jYWxlUGFydHMuam9pbignLScpXTtcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBub3JtYWxpemVkIGxvY2FsZSBzdHJpbmc7IGUuZy4sIHdlIHJldHVybiBcImVuLVVTXCIsXG4gICAgICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBcImVuLXVzXCIuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEubG9jYWxlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2NhbGVQYXJ0cy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkZWZhdWx0TG9jYWxlID0gbG9jYWxlcy5wb3AoKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdObyBsb2NhbGUgZGF0YSBoYXMgYmVlbiBhZGRlZCB0byBJbnRsUmVsYXRpdmVGb3JtYXQgZm9yOiAnICtcbiAgICAgICAgbG9jYWxlcy5qb2luKCcsICcpICsgJywgb3IgdGhlIGRlZmF1bHQgbG9jYWxlOiAnICsgZGVmYXVsdExvY2FsZVxuICAgICk7XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX3Jlc29sdmVTdHlsZSA9IGZ1bmN0aW9uIChzdHlsZSkge1xuICAgIC8vIERlZmF1bHQgdG8gXCJiZXN0IGZpdFwiIHN0eWxlLlxuICAgIGlmICghc3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFU1swXTtcbiAgICB9XG5cbiAgICBpZiAoc3JjJGVzNSQkLmFyckluZGV4T2YuY2FsbChTVFlMRVMsIHN0eWxlKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdcIicgKyBzdHlsZSArICdcIiBpcyBub3QgYSB2YWxpZCBJbnRsUmVsYXRpdmVGb3JtYXQgYHN0eWxlYCB2YWx1ZSwgaXQgJyArXG4gICAgICAgICdtdXN0IGJlIG9uZSBvZjogXCInICsgU1RZTEVTLmpvaW4oJ1wiLCBcIicpICsgJ1wiJ1xuICAgICk7XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX3NlbGVjdFVuaXRzID0gZnVuY3Rpb24gKGRpZmZSZXBvcnQpIHtcbiAgICB2YXIgaSwgbCwgdW5pdHM7XG5cbiAgICBmb3IgKGkgPSAwLCBsID0gRklFTERTLmxlbmd0aDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICB1bml0cyA9IEZJRUxEU1tpXTtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZlJlcG9ydFt1bml0c10pIDwgUmVsYXRpdmVGb3JtYXQudGhyZXNob2xkc1t1bml0c10pIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuaXRzO1xufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29yZS5qcy5tYXAiLCIvKlxuQ29weXJpZ2h0IChjKSAyMDE0LCBZYWhvbyEgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBMaWNlbnNlLlxuU2VlIHRoZSBhY2NvbXBhbnlpbmcgTElDRU5TRSBmaWxlIGZvciB0ZXJtcy5cbiovXG5cbi8qIGpzbGludCBlc25leHQ6IHRydWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciByb3VuZCA9IE1hdGgucm91bmQ7XG5cbmZ1bmN0aW9uIGRheXNUb1llYXJzKGRheXMpIHtcbiAgICAvLyA0MDAgeWVhcnMgaGF2ZSAxNDYwOTcgZGF5cyAodGFraW5nIGludG8gYWNjb3VudCBsZWFwIHllYXIgcnVsZXMpXG4gICAgcmV0dXJuIGRheXMgKiA0MDAgLyAxNDYwOTc7XG59XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGZyb20sIHRvKSB7XG4gICAgLy8gQ29udmVydCB0byBtcyB0aW1lc3RhbXBzLlxuICAgIGZyb20gPSArZnJvbTtcbiAgICB0byAgID0gK3RvO1xuXG4gICAgdmFyIG1pbGxpc2Vjb25kID0gcm91bmQodG8gLSBmcm9tKSxcbiAgICAgICAgc2Vjb25kICAgICAgPSByb3VuZChtaWxsaXNlY29uZCAvIDEwMDApLFxuICAgICAgICBtaW51dGUgICAgICA9IHJvdW5kKHNlY29uZCAvIDYwKSxcbiAgICAgICAgaG91ciAgICAgICAgPSByb3VuZChtaW51dGUgLyA2MCksXG4gICAgICAgIGRheSAgICAgICAgID0gcm91bmQoaG91ciAvIDI0KSxcbiAgICAgICAgd2VlayAgICAgICAgPSByb3VuZChkYXkgLyA3KTtcblxuICAgIHZhciByYXdZZWFycyA9IGRheXNUb1llYXJzKGRheSksXG4gICAgICAgIG1vbnRoICAgID0gcm91bmQocmF3WWVhcnMgKiAxMiksXG4gICAgICAgIHllYXIgICAgID0gcm91bmQocmF3WWVhcnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWlsbGlzZWNvbmQ6IG1pbGxpc2Vjb25kLFxuICAgICAgICBzZWNvbmQgICAgIDogc2Vjb25kLFxuICAgICAgICBtaW51dGUgICAgIDogbWludXRlLFxuICAgICAgICBob3VyICAgICAgIDogaG91cixcbiAgICAgICAgZGF5ICAgICAgICA6IGRheSxcbiAgICAgICAgd2VlayAgICAgICA6IHdlZWssXG4gICAgICAgIG1vbnRoICAgICAgOiBtb250aCxcbiAgICAgICAgeWVhciAgICAgICA6IHllYXJcbiAgICB9O1xufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlmZi5qcy5tYXAiLCIvLyBHRU5FUkFURUQgRklMRVxuXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHtcImxvY2FsZVwiOlwiZW5cIixcInBsdXJhbFJ1bGVGdW5jdGlvblwiOmZ1bmN0aW9uIChuLG9yZCl7dmFyIHM9U3RyaW5nKG4pLnNwbGl0KFwiLlwiKSx2MD0hc1sxXSx0MD1OdW1iZXIoc1swXSk9PW4sbjEwPXQwJiZzWzBdLnNsaWNlKC0xKSxuMTAwPXQwJiZzWzBdLnNsaWNlKC0yKTtpZihvcmQpcmV0dXJuIG4xMD09MSYmbjEwMCE9MTE/XCJvbmVcIjpuMTA9PTImJm4xMDAhPTEyP1widHdvXCI6bjEwPT0zJiZuMTAwIT0xMz9cImZld1wiOlwib3RoZXJcIjtyZXR1cm4gbj09MSYmdjA/XCJvbmVcIjpcIm90aGVyXCJ9LFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJ5ZWFyXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRoaXMgeWVhclwiLFwiMVwiOlwibmV4dCB5ZWFyXCIsXCItMVwiOlwibGFzdCB5ZWFyXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0geWVhclwiLFwib3RoZXJcIjpcImluIHswfSB5ZWFyc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSB5ZWFyIGFnb1wiLFwib3RoZXJcIjpcInswfSB5ZWFycyBhZ29cIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1vbnRoXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRoaXMgbW9udGhcIixcIjFcIjpcIm5leHQgbW9udGhcIixcIi0xXCI6XCJsYXN0IG1vbnRoXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gbW9udGhcIixcIm90aGVyXCI6XCJpbiB7MH0gbW9udGhzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IG1vbnRoIGFnb1wiLFwib3RoZXJcIjpcInswfSBtb250aHMgYWdvXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZGF5XCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRvZGF5XCIsXCIxXCI6XCJ0b21vcnJvd1wiLFwiLTFcIjpcInllc3RlcmRheVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IGRheVwiLFwib3RoZXJcIjpcImluIHswfSBkYXlzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IGRheSBhZ29cIixcIm90aGVyXCI6XCJ7MH0gZGF5cyBhZ29cIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG91clwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gaG91clwiLFwib3RoZXJcIjpcImluIHswfSBob3Vyc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSBob3VyIGFnb1wiLFwib3RoZXJcIjpcInswfSBob3VycyBhZ29cIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dGVcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IG1pbnV0ZVwiLFwib3RoZXJcIjpcImluIHswfSBtaW51dGVzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IG1pbnV0ZSBhZ29cIixcIm90aGVyXCI6XCJ7MH0gbWludXRlcyBhZ29cIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJzZWNvbmRcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwibm93XCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gc2Vjb25kXCIsXCJvdGhlclwiOlwiaW4gezB9IHNlY29uZHNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJ7MH0gc2Vjb25kIGFnb1wiLFwib3RoZXJcIjpcInswfSBzZWNvbmRzIGFnb1wifX19fX07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVuLmpzLm1hcCIsIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQsIFlhaG9vISBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5Db3B5cmlnaHRzIGxpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIExpY2Vuc2UuXG5TZWUgdGhlIGFjY29tcGFueWluZyBMSUNFTlNFIGZpbGUgZm9yIHRlcm1zLlxuKi9cblxuLyoganNsaW50IGVzbmV4dDogdHJ1ZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gUHVycG9zZWx5IHVzaW5nIHRoZSBzYW1lIGltcGxlbWVudGF0aW9uIGFzIHRoZSBJbnRsLmpzIGBJbnRsYCBwb2x5ZmlsbC5cbi8vIENvcHlyaWdodCAyMDEzIEFuZHkgRWFybnNoYXcsIE1JVCBMaWNlbnNlXG5cbnZhciBob3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIHJlYWxEZWZpbmVQcm9wID0gKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkgeyByZXR1cm4gISFPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge30pOyB9XG4gICAgY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9XG59KSgpO1xuXG52YXIgZXMzID0gIXJlYWxEZWZpbmVQcm9wICYmICFPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX187XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlYWxEZWZpbmVQcm9wID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDpcbiAgICAgICAgZnVuY3Rpb24gKG9iaiwgbmFtZSwgZGVzYykge1xuXG4gICAgaWYgKCdnZXQnIGluIGRlc2MgJiYgb2JqLl9fZGVmaW5lR2V0dGVyX18pIHtcbiAgICAgICAgb2JqLl9fZGVmaW5lR2V0dGVyX18obmFtZSwgZGVzYy5nZXQpO1xuICAgIH0gZWxzZSBpZiAoIWhvcC5jYWxsKG9iaiwgbmFtZSkgfHwgJ3ZhbHVlJyBpbiBkZXNjKSB7XG4gICAgICAgIG9ialtuYW1lXSA9IGRlc2MudmFsdWU7XG4gICAgfVxufTtcblxudmFyIG9iakNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvLCBwcm9wcykge1xuICAgIHZhciBvYmosIGs7XG5cbiAgICBmdW5jdGlvbiBGKCkge31cbiAgICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIG9iaiA9IG5ldyBGKCk7XG5cbiAgICBmb3IgKGsgaW4gcHJvcHMpIHtcbiAgICAgICAgaWYgKGhvcC5jYWxsKHByb3BzLCBrKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkob2JqLCBrLCBwcm9wc1trXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxudmFyIGFyckluZGV4T2YgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiB8fCBmdW5jdGlvbiAoc2VhcmNoLCBmcm9tSW5kZXgpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgIHZhciBhcnIgPSB0aGlzO1xuICAgIGlmICghYXJyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IGZyb21JbmRleCB8fCAwLCBtYXggPSBhcnIubGVuZ3RoOyBpIDwgbWF4OyBpKyspIHtcbiAgICAgICAgaWYgKGFycltpXSA9PT0gc2VhcmNoKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBkYXRlTm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn07XG5leHBvcnRzLmRlZmluZVByb3BlcnR5ID0gZGVmaW5lUHJvcGVydHksIGV4cG9ydHMub2JqQ3JlYXRlID0gb2JqQ3JlYXRlLCBleHBvcnRzLmFyckluZGV4T2YgPSBhcnJJbmRleE9mLCBleHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5LCBleHBvcnRzLmRhdGVOb3cgPSBkYXRlTm93O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lczUuanMubWFwIiwiLy8gRXhwb3NlIGBJbnRsUG9seWZpbGxgIGFzIGdsb2JhbCB0byBhZGQgbG9jYWxlIGRhdGEgaW50byBydW50aW1lIGxhdGVyIG9uLlxuZ2xvYmFsLkludGxQb2x5ZmlsbCA9IHJlcXVpcmUoJy4vbGliL2NvcmUuanMnKTtcblxuLy8gUmVxdWlyZSBhbGwgbG9jYWxlIGRhdGEgZm9yIGBJbnRsYC4gVGhpcyBtb2R1bGUgd2lsbCBiZVxuLy8gaWdub3JlZCB3aGVuIGJ1bmRsaW5nIGZvciB0aGUgYnJvd3NlciB3aXRoIEJyb3dzZXJpZnkvV2VicGFjay5cbnJlcXVpcmUoJy4vbG9jYWxlLWRhdGEvY29tcGxldGUuanMnKTtcblxuLy8gaGFjayB0byBleHBvcnQgdGhlIHBvbHlmaWxsIGFzIGdsb2JhbCBJbnRsIGlmIG5lZWRlZFxuaWYgKCFnbG9iYWwuSW50bCkge1xuICAgIGdsb2JhbC5JbnRsID0gZ2xvYmFsLkludGxQb2x5ZmlsbDtcbiAgICBnbG9iYWwuSW50bFBvbHlmaWxsLl9fYXBwbHlMb2NhbGVTZW5zaXRpdmVQcm90b3R5cGVzKCk7XG59XG5cbi8vIHByb3ZpZGluZyBhbiBpZGlvbWF0aWMgYXBpIGZvciB0aGUgbm9kZWpzIHZlcnNpb24gb2YgdGhpcyBtb2R1bGVcbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLkludGxQb2x5ZmlsbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmo7XG59IDogZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xufTtcblxudmFyIGpzeCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuZm9yICYmIFN5bWJvbC5mb3IoXCJyZWFjdC5lbGVtZW50XCIpIHx8IDB4ZWFjNztcbiAgcmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZVJhd1JlYWN0RWxlbWVudCh0eXBlLCBwcm9wcywga2V5LCBjaGlsZHJlbikge1xuICAgIHZhciBkZWZhdWx0UHJvcHMgPSB0eXBlICYmIHR5cGUuZGVmYXVsdFByb3BzO1xuICAgIHZhciBjaGlsZHJlbkxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGggLSAzO1xuXG4gICAgaWYgKCFwcm9wcyAmJiBjaGlsZHJlbkxlbmd0aCAhPT0gMCkge1xuICAgICAgcHJvcHMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMgJiYgZGVmYXVsdFByb3BzKSB7XG4gICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3BzW3Byb3BOYW1lXSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZGVmYXVsdFByb3BzW3Byb3BOYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXByb3BzKSB7XG4gICAgICBwcm9wcyA9IGRlZmF1bHRQcm9wcyB8fCB7fTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGRyZW5MZW5ndGggPT09IDEpIHtcbiAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgfSBlbHNlIGlmIChjaGlsZHJlbkxlbmd0aCA+IDEpIHtcbiAgICAgIHZhciBjaGlsZEFycmF5ID0gQXJyYXkoY2hpbGRyZW5MZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hpbGRBcnJheVtpXSA9IGFyZ3VtZW50c1tpICsgM107XG4gICAgICB9XG5cbiAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRBcnJheTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJCR0eXBlb2Y6IFJFQUNUX0VMRU1FTlRfVFlQRSxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBrZXk6IGtleSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6ICcnICsga2V5LFxuICAgICAgcmVmOiBudWxsLFxuICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgX293bmVyOiBudWxsXG4gICAgfTtcbiAgfTtcbn0oKTtcblxudmFyIGFzeW5jVG9HZW5lcmF0b3IgPSBmdW5jdGlvbiAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VuID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gc3RlcChrZXksIGFyZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcChcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKFwidGhyb3dcIiwgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RlcChcIm5leHRcIik7XG4gICAgfSk7XG4gIH07XG59O1xuXG52YXIgY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxudmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpO1xuXG52YXIgZGVmaW5lRW51bWVyYWJsZVByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqLCBkZXNjcykge1xuICBmb3IgKHZhciBrZXkgaW4gZGVzY3MpIHtcbiAgICB2YXIgZGVzYyA9IGRlc2NzW2tleV07XG4gICAgZGVzYy5jb25maWd1cmFibGUgPSBkZXNjLmVudW1lcmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzYykgZGVzYy53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCBkZXNjKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgZGVmYXVsdHMgPSBmdW5jdGlvbiAob2JqLCBkZWZhdWx0cykge1xuICB2YXIga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGRlZmF1bHRzKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsdWUgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGRlZmF1bHRzLCBrZXkpO1xuXG4gICAgaWYgKHZhbHVlICYmIHZhbHVlLmNvbmZpZ3VyYWJsZSAmJiBvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGRlZmluZVByb3BlcnR5JDEgPSBmdW5jdGlvbiAob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG52YXIgZ2V0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgfVxufTtcblxudmFyIGluaGVyaXRzID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTtcblxudmFyIF9pbnN0YW5jZW9mID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChyaWdodCAhPSBudWxsICYmIHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgcmlnaHRbU3ltYm9sLmhhc0luc3RhbmNlXSkge1xuICAgIHJldHVybiByaWdodFtTeW1ib2wuaGFzSW5zdGFuY2VdKGxlZnQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsZWZ0IGluc3RhbmNlb2YgcmlnaHQ7XG4gIH1cbn07XG5cbnZhciBpbnRlcm9wUmVxdWlyZURlZmF1bHQgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgZGVmYXVsdDogb2JqXG4gIH07XG59O1xuXG52YXIgaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuXG4gICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH1cbn07XG5cbnZhciBuZXdBcnJvd0NoZWNrID0gZnVuY3Rpb24gKGlubmVyVGhpcywgYm91bmRUaGlzKSB7XG4gIGlmIChpbm5lclRoaXMgIT09IGJvdW5kVGhpcykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgaW5zdGFudGlhdGUgYW4gYXJyb3cgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbnZhciBvYmplY3REZXN0cnVjdHVyaW5nRW1wdHkgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChvYmogPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBkZXN0cnVjdHVyZSB1bmRlZmluZWRcIik7XG59O1xuXG52YXIgb2JqZWN0V2l0aG91dFByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqLCBrZXlzKSB7XG4gIHZhciB0YXJnZXQgPSB7fTtcblxuICBmb3IgKHZhciBpIGluIG9iaikge1xuICAgIGlmIChrZXlzLmluZGV4T2YoaSkgPj0gMCkgY29udGludWU7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7XG4gICAgdGFyZ2V0W2ldID0gb2JqW2ldO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbnZhciBwb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59O1xuXG52YXIgc2VsZkdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogZ2xvYmFsO1xuXG52YXIgc2V0ID0gZnVuY3Rpb24gc2V0KG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYyAmJiBkZXNjLndyaXRhYmxlKSB7XG4gICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBzZXR0ZXIgPSBkZXNjLnNldDtcblxuICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2V0dGVyLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG52YXIgc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHtcbiAgICB2YXIgX2FyciA9IFtdO1xuICAgIHZhciBfbiA9IHRydWU7XG4gICAgdmFyIF9kID0gZmFsc2U7XG4gICAgdmFyIF9lID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZCA9IHRydWU7XG4gICAgICBfZSA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9hcnI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHtcbiAgICAgIHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICAgIH1cbiAgfTtcbn0oKTtcblxudmFyIHNsaWNlZFRvQXJyYXlMb29zZSA9IGZ1bmN0aW9uIChhcnIsIGkpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIHJldHVybiBhcnI7XG4gIH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcblxuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZTspIHtcbiAgICAgIF9hcnIucHVzaChfc3RlcC52YWx1ZSk7XG5cbiAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gX2FycjtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbiAgfVxufTtcblxudmFyIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbCA9IGZ1bmN0aW9uIChzdHJpbmdzLCByYXcpIHtcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RyaW5ncywge1xuICAgIHJhdzoge1xuICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUocmF3KVxuICAgIH1cbiAgfSkpO1xufTtcblxudmFyIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbExvb3NlID0gZnVuY3Rpb24gKHN0cmluZ3MsIHJhdykge1xuICBzdHJpbmdzLnJhdyA9IHJhdztcbiAgcmV0dXJuIHN0cmluZ3M7XG59O1xuXG52YXIgdGVtcG9yYWxSZWYgPSBmdW5jdGlvbiAodmFsLCBuYW1lLCB1bmRlZikge1xuICBpZiAodmFsID09PSB1bmRlZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihuYW1lICsgXCIgaXMgbm90IGRlZmluZWQgLSB0ZW1wb3JhbCBkZWFkIHpvbmVcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcblxudmFyIHRlbXBvcmFsVW5kZWZpbmVkID0ge307XG5cbnZhciB0b0FycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpID8gYXJyIDogQXJyYXkuZnJvbShhcnIpO1xufTtcblxudmFyIHRvQ29uc3VtYWJsZUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTtcblxuICAgIHJldHVybiBhcnIyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGFycik7XG4gIH1cbn07XG5cblxuXG52YXIgYmFiZWxIZWxwZXJzJDEgPSBPYmplY3QuZnJlZXplKHtcbiAganN4OiBqc3gsXG4gIGFzeW5jVG9HZW5lcmF0b3I6IGFzeW5jVG9HZW5lcmF0b3IsXG4gIGNsYXNzQ2FsbENoZWNrOiBjbGFzc0NhbGxDaGVjayxcbiAgY3JlYXRlQ2xhc3M6IGNyZWF0ZUNsYXNzLFxuICBkZWZpbmVFbnVtZXJhYmxlUHJvcGVydGllczogZGVmaW5lRW51bWVyYWJsZVByb3BlcnRpZXMsXG4gIGRlZmF1bHRzOiBkZWZhdWx0cyxcbiAgZGVmaW5lUHJvcGVydHk6IGRlZmluZVByb3BlcnR5JDEsXG4gIGdldDogZ2V0LFxuICBpbmhlcml0czogaW5oZXJpdHMsXG4gIGludGVyb3BSZXF1aXJlRGVmYXVsdDogaW50ZXJvcFJlcXVpcmVEZWZhdWx0LFxuICBpbnRlcm9wUmVxdWlyZVdpbGRjYXJkOiBpbnRlcm9wUmVxdWlyZVdpbGRjYXJkLFxuICBuZXdBcnJvd0NoZWNrOiBuZXdBcnJvd0NoZWNrLFxuICBvYmplY3REZXN0cnVjdHVyaW5nRW1wdHk6IG9iamVjdERlc3RydWN0dXJpbmdFbXB0eSxcbiAgb2JqZWN0V2l0aG91dFByb3BlcnRpZXM6IG9iamVjdFdpdGhvdXRQcm9wZXJ0aWVzLFxuICBwb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuOiBwb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuLFxuICBzZWxmR2xvYmFsOiBzZWxmR2xvYmFsLFxuICBzZXQ6IHNldCxcbiAgc2xpY2VkVG9BcnJheTogc2xpY2VkVG9BcnJheSxcbiAgc2xpY2VkVG9BcnJheUxvb3NlOiBzbGljZWRUb0FycmF5TG9vc2UsXG4gIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbDogdGFnZ2VkVGVtcGxhdGVMaXRlcmFsLFxuICB0YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZTogdGFnZ2VkVGVtcGxhdGVMaXRlcmFsTG9vc2UsXG4gIHRlbXBvcmFsUmVmOiB0ZW1wb3JhbFJlZixcbiAgdGVtcG9yYWxVbmRlZmluZWQ6IHRlbXBvcmFsVW5kZWZpbmVkLFxuICB0b0FycmF5OiB0b0FycmF5LFxuICB0b0NvbnN1bWFibGVBcnJheTogdG9Db25zdW1hYmxlQXJyYXksXG4gIHR5cGVvZjogX3R5cGVvZixcbiAgZXh0ZW5kczogX2V4dGVuZHMsXG4gIGluc3RhbmNlb2Y6IF9pbnN0YW5jZW9mXG59KTtcblxudmFyIHJlYWxEZWZpbmVQcm9wID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZW50aW5lbCA9IGZ1bmN0aW9uIHNlbnRpbmVsKCkge307XG4gICAgdHJ5IHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbnRpbmVsLCAnYScsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbnRpbmVsLCAncHJvdG90eXBlJywgeyB3cml0YWJsZTogZmFsc2UgfSk7XG4gICAgICAgIHJldHVybiBzZW50aW5lbC5hID09PSAxICYmIHNlbnRpbmVsLnByb3RvdHlwZSBpbnN0YW5jZW9mIE9iamVjdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59KCk7XG5cbi8vIE5lZWQgYSB3b3JrYXJvdW5kIGZvciBnZXR0ZXJzIGluIEVTM1xudmFyIGVzMyA9ICFyZWFsRGVmaW5lUHJvcCAmJiAhT2JqZWN0LnByb3RvdHlwZS5fX2RlZmluZUdldHRlcl9fO1xuXG4vLyBXZSB1c2UgdGhpcyBhIGxvdCAoYW5kIG5lZWQgaXQgZm9yIHByb3RvLWxlc3Mgb2JqZWN0cylcbnZhciBob3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBOYWl2ZSBkZWZpbmVQcm9wZXJ0eSBmb3IgY29tcGF0aWJpbGl0eVxudmFyIGRlZmluZVByb3BlcnR5ID0gcmVhbERlZmluZVByb3AgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiAob2JqLCBuYW1lLCBkZXNjKSB7XG4gICAgaWYgKCdnZXQnIGluIGRlc2MgJiYgb2JqLl9fZGVmaW5lR2V0dGVyX18pIG9iai5fX2RlZmluZUdldHRlcl9fKG5hbWUsIGRlc2MuZ2V0KTtlbHNlIGlmICghaG9wLmNhbGwob2JqLCBuYW1lKSB8fCAndmFsdWUnIGluIGRlc2MpIG9ialtuYW1lXSA9IGRlc2MudmFsdWU7XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiwgYXMgZ29vZCBhcyB3ZSBuZWVkIGl0IHRvIGJlXG52YXIgYXJySW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uIChzZWFyY2gpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgIHZhciB0ID0gdGhpcztcbiAgICBpZiAoIXQubGVuZ3RoKSByZXR1cm4gLTE7XG5cbiAgICBmb3IgKHZhciBpID0gYXJndW1lbnRzWzFdIHx8IDAsIG1heCA9IHQubGVuZ3RoOyBpIDwgbWF4OyBpKyspIHtcbiAgICAgICAgaWYgKHRbaV0gPT09IHNlYXJjaCkgcmV0dXJuIGk7XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufTtcblxuLy8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIHRoZSBzcGVjaWZpZWQgcHJvdG90eXBlICgybmQgYXJnIHJlcXVpcmVkIGZvciBSZWNvcmQpXG52YXIgb2JqQ3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG8sIHByb3BzKSB7XG4gICAgdmFyIG9iaiA9IHZvaWQgMDtcblxuICAgIGZ1bmN0aW9uIEYoKSB7fVxuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgb2JqID0gbmV3IEYoKTtcblxuICAgIGZvciAodmFyIGsgaW4gcHJvcHMpIHtcbiAgICAgICAgaWYgKGhvcC5jYWxsKHByb3BzLCBrKSkgZGVmaW5lUHJvcGVydHkob2JqLCBrLCBwcm9wc1trXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8vIFNuYXBzaG90IHNvbWUgKGhvcGVmdWxseSBzdGlsbCkgbmF0aXZlIGJ1aWx0LWluc1xudmFyIGFyclNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGFyckNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG52YXIgYXJyUHVzaCA9IEFycmF5LnByb3RvdHlwZS5wdXNoO1xudmFyIGFyckpvaW4gPSBBcnJheS5wcm90b3R5cGUuam9pbjtcbnZhciBhcnJTaGlmdCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdDtcblxuLy8gTmFpdmUgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgZm9yIGNvbXBhdGliaWxpdHlcbnZhciBmbkJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBmdW5jdGlvbiAodGhpc09iaikge1xuICAgIHZhciBmbiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcnJTbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAvLyBBbGwgb3VyIChwcmVzZW50bHkpIGJvdW5kIGZ1bmN0aW9ucyBoYXZlIGVpdGhlciAxIG9yIDAgYXJndW1lbnRzLiBCeSByZXR1cm5pbmdcbiAgICAvLyBkaWZmZXJlbnQgZnVuY3Rpb24gc2lnbmF0dXJlcywgd2UgY2FuIHBhc3Mgc29tZSB0ZXN0cyBpbiBFUzMgZW52aXJvbm1lbnRzXG4gICAgaWYgKGZuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNPYmosIGFyckNvbmNhdC5jYWxsKGFyZ3MsIGFyclNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpc09iaiwgYXJyQ29uY2F0LmNhbGwoYXJncywgYXJyU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbn07XG5cbi8vIE9iamVjdCBob3VzaW5nIGludGVybmFsIHByb3BlcnRpZXMgZm9yIGNvbnN0cnVjdG9yc1xudmFyIGludGVybmFscyA9IG9iakNyZWF0ZShudWxsKTtcblxuLy8gS2VlcCBpbnRlcm5hbCBwcm9wZXJ0aWVzIGludGVybmFsXG52YXIgc2VjcmV0ID0gTWF0aC5yYW5kb20oKTtcblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuLy8gPT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdG8gZGVhbCB3aXRoIHRoZSBpbmFjY3VyYWN5IG9mIGNhbGN1bGF0aW5nIGxvZzEwIGluIHByZS1FUzZcbiAqIEphdmFTY3JpcHQgZW52aXJvbm1lbnRzLiBNYXRoLmxvZyhudW0pIC8gTWF0aC5MTjEwIHdhcyByZXNwb25zaWJsZSBmb3JcbiAqIGNhdXNpbmcgaXNzdWUgIzYyLlxuICovXG5mdW5jdGlvbiBsb2cxMEZsb29yKG4pIHtcbiAgICAvLyBFUzYgcHJvdmlkZXMgdGhlIG1vcmUgYWNjdXJhdGUgTWF0aC5sb2cxMFxuICAgIGlmICh0eXBlb2YgTWF0aC5sb2cxMCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5sb2cxMChuKSk7XG5cbiAgICB2YXIgeCA9IE1hdGgucm91bmQoTWF0aC5sb2cobikgKiBNYXRoLkxPRzEwRSk7XG4gICAgcmV0dXJuIHggLSAoTnVtYmVyKCcxZScgKyB4KSA+IG4pO1xufVxuXG4vKipcbiAqIEEgbWFwIHRoYXQgZG9lc24ndCBjb250YWluIE9iamVjdCBpbiBpdHMgcHJvdG90eXBlIGNoYWluXG4gKi9cbmZ1bmN0aW9uIFJlY29yZChvYmopIHtcbiAgICAvLyBDb3B5IG9ubHkgb3duIHByb3BlcnRpZXMgb3ZlciB1bmxlc3MgdGhpcyBvYmplY3QgaXMgYWxyZWFkeSBhIFJlY29yZCBpbnN0YW5jZVxuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBSZWNvcmQgfHwgaG9wLmNhbGwob2JqLCBrKSkgZGVmaW5lUHJvcGVydHkodGhpcywgaywgeyB2YWx1ZTogb2JqW2tdLCBlbnVtZXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuICAgIH1cbn1cblJlY29yZC5wcm90b3R5cGUgPSBvYmpDcmVhdGUobnVsbCk7XG5cbi8qKlxuICogQW4gb3JkZXJlZCBsaXN0XG4gKi9cbmZ1bmN0aW9uIExpc3QoKSB7XG4gICAgZGVmaW5lUHJvcGVydHkodGhpcywgJ2xlbmd0aCcsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiAwIH0pO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIGFyclB1c2guYXBwbHkodGhpcywgYXJyU2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbn1cbkxpc3QucHJvdG90eXBlID0gb2JqQ3JlYXRlKG51bGwpO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gcmVzdG9yZSB0YWludGVkIFJlZ0V4cCBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJlZ0V4cFJlc3RvcmUoKSB7XG4gICAgaWYgKGludGVybmFscy5kaXNhYmxlUmVnRXhwUmVzdG9yZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgey8qIG5vLW9wICovfTtcbiAgICB9XG5cbiAgICB2YXIgcmVnRXhwQ2FjaGUgPSB7XG4gICAgICAgIGxhc3RNYXRjaDogUmVnRXhwLmxhc3RNYXRjaCB8fCAnJyxcbiAgICAgICAgbGVmdENvbnRleHQ6IFJlZ0V4cC5sZWZ0Q29udGV4dCxcbiAgICAgICAgbXVsdGlsaW5lOiBSZWdFeHAubXVsdGlsaW5lLFxuICAgICAgICBpbnB1dDogUmVnRXhwLmlucHV0XG4gICAgfSxcbiAgICAgICAgaGFzID0gZmFsc2U7XG5cbiAgICAvLyBDcmVhdGUgYSBzbmFwc2hvdCBvZiBhbGwgdGhlICdjYXB0dXJlZCcgcHJvcGVydGllc1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDk7IGkrKykge1xuICAgICAgICBoYXMgPSAocmVnRXhwQ2FjaGVbJyQnICsgaV0gPSBSZWdFeHBbJyQnICsgaV0pIHx8IGhhcztcbiAgICB9cmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gTm93IHdlJ3ZlIHNuYXBzaG90dGVkIHNvbWUgcHJvcGVydGllcywgZXNjYXBlIHRoZSBsYXN0TWF0Y2ggc3RyaW5nXG4gICAgICAgIHZhciBlc2MgPSAvWy4/KiteJFtcXF1cXFxcKCl7fXwtXS9nLFxuICAgICAgICAgICAgbG0gPSByZWdFeHBDYWNoZS5sYXN0TWF0Y2gucmVwbGFjZShlc2MsICdcXFxcJCYnKSxcbiAgICAgICAgICAgIHJlZyA9IG5ldyBMaXN0KCk7XG5cbiAgICAgICAgLy8gSWYgYW55IG9mIHRoZSBjYXB0dXJlZCBzdHJpbmdzIHdlcmUgbm9uLWVtcHR5LCBpdGVyYXRlIG92ZXIgdGhlbSBhbGxcbiAgICAgICAgaWYgKGhhcykge1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8PSA5OyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSByZWdFeHBDYWNoZVsnJCcgKyBfaV07XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBpdCdzIGVtcHR5LCBhZGQgYW4gZW1wdHkgY2FwdHVyaW5nIGdyb3VwXG4gICAgICAgICAgICAgICAgaWYgKCFtKSBsbSA9ICcoKScgKyBsbTtcblxuICAgICAgICAgICAgICAgIC8vIEVsc2UgZmluZCB0aGUgc3RyaW5nIGluIGxtIGFuZCBlc2NhcGUgJiB3cmFwIGl0IHRvIGNhcHR1cmUgaXRcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0gPSBtLnJlcGxhY2UoZXNjLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsbSA9IGxtLnJlcGxhY2UobSwgJygnICsgbSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFB1c2ggaXQgdG8gdGhlIHJlZyBhbmQgY2hvcCBsbSB0byBtYWtlIHN1cmUgZnVydGhlciBncm91cHMgY29tZSBhZnRlclxuICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZWcsIGxtLnNsaWNlKDAsIGxtLmluZGV4T2YoJygnKSArIDEpKTtcbiAgICAgICAgICAgICAgICBsbSA9IGxtLnNsaWNlKGxtLmluZGV4T2YoJygnKSArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGV4cHJTdHIgPSBhcnJKb2luLmNhbGwocmVnLCAnJykgKyBsbTtcblxuICAgICAgICAvLyBTaG9ydGVuIHRoZSByZWdleCBieSByZXBsYWNpbmcgZWFjaCBwYXJ0IG9mIHRoZSBleHByZXNzaW9uIHdpdGggYSBtYXRjaFxuICAgICAgICAvLyBmb3IgYSBzdHJpbmcgb2YgdGhhdCBleGFjdCBsZW5ndGguICBUaGlzIGlzIHNhZmUgZm9yIHRoZSB0eXBlIG9mXG4gICAgICAgIC8vIGV4cHJlc3Npb25zIGdlbmVyYXRlZCBhYm92ZSwgYmVjYXVzZSB0aGUgZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSB3aG9sZVxuICAgICAgICAvLyBtYXRjaCBzdHJpbmcsIHNvIHdlIGtub3cgZWFjaCBncm91cCBhbmQgZWFjaCBzZWdtZW50IGJldHdlZW4gY2FwdHVyaW5nXG4gICAgICAgIC8vIGdyb3VwcyBjYW4gYmUgbWF0Y2hlZCBieSBpdHMgbGVuZ3RoIGFsb25lLlxuICAgICAgICBleHByU3RyID0gZXhwclN0ci5yZXBsYWNlKC8oXFxcXFxcKHxcXFxcXFwpfFteKCldKSsvZywgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ1tcXFxcc1xcXFxTXXsnICsgbWF0Y2gucmVwbGFjZSgnXFxcXCcsICcnKS5sZW5ndGggKyAnfSc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcmVndWxhciBleHByZXNzaW9uIHRoYXQgd2lsbCByZWNvbnN0cnVjdCB0aGUgUmVnRXhwIHByb3BlcnRpZXNcbiAgICAgICAgdmFyIGV4cHIgPSBuZXcgUmVnRXhwKGV4cHJTdHIsIHJlZ0V4cENhY2hlLm11bHRpbGluZSA/ICdnbScgOiAnZycpO1xuXG4gICAgICAgIC8vIFNldCB0aGUgbGFzdEluZGV4IG9mIHRoZSBnZW5lcmF0ZWQgZXhwcmVzc2lvbiB0byBlbnN1cmUgdGhhdCB0aGUgbWF0Y2hcbiAgICAgICAgLy8gaXMgZm91bmQgaW4gdGhlIGNvcnJlY3QgaW5kZXguXG4gICAgICAgIGV4cHIubGFzdEluZGV4ID0gcmVnRXhwQ2FjaGUubGVmdENvbnRleHQubGVuZ3RoO1xuXG4gICAgICAgIGV4cHIuZXhlYyhyZWdFeHBDYWNoZS5pbnB1dCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBNaW1pY3MgRVM1J3MgYWJzdHJhY3QgVG9PYmplY3QoKSBmdW5jdGlvblxuICovXG5mdW5jdGlvbiB0b09iamVjdChhcmcpIHtcbiAgICBpZiAoYXJnID09PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCBudWxsIG9yIHVuZGVmaW5lZCB0byBvYmplY3QnKTtcblxuICAgIGlmICgodHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IGJhYmVsSGVscGVycyQxWyd0eXBlb2YnXShhcmcpKSA9PT0gJ29iamVjdCcpIHJldHVybiBhcmc7XG4gICAgcmV0dXJuIE9iamVjdChhcmcpO1xufVxuXG5mdW5jdGlvbiB0b051bWJlcihhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHJldHVybiBhcmc7XG4gICAgcmV0dXJuIE51bWJlcihhcmcpO1xufVxuXG5mdW5jdGlvbiB0b0ludGVnZXIoYXJnKSB7XG4gICAgdmFyIG51bWJlciA9IHRvTnVtYmVyKGFyZyk7XG4gICAgaWYgKGlzTmFOKG51bWJlcikpIHJldHVybiAwO1xuICAgIGlmIChudW1iZXIgPT09ICswIHx8IG51bWJlciA9PT0gLTAgfHwgbnVtYmVyID09PSArSW5maW5pdHkgfHwgbnVtYmVyID09PSAtSW5maW5pdHkpIHJldHVybiBudW1iZXI7XG4gICAgaWYgKG51bWJlciA8IDApIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpICogLTE7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnMobnVtYmVyKSk7XG59XG5cbmZ1bmN0aW9uIHRvTGVuZ3RoKGFyZykge1xuICAgIHZhciBsZW4gPSB0b0ludGVnZXIoYXJnKTtcbiAgICBpZiAobGVuIDw9IDApIHJldHVybiAwO1xuICAgIGlmIChsZW4gPT09IEluZmluaXR5KSByZXR1cm4gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5taW4obGVuLCBNYXRoLnBvdygyLCA1MykgLSAxKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIFwiaW50ZXJuYWxcIiBwcm9wZXJ0aWVzIGZvciBhbiBvYmplY3RcbiAqL1xuZnVuY3Rpb24gZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzKG9iaikge1xuICAgIGlmIChob3AuY2FsbChvYmosICdfX2dldEludGVybmFsUHJvcGVydGllcycpKSByZXR1cm4gb2JqLl9fZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzKHNlY3JldCk7XG5cbiAgICByZXR1cm4gb2JqQ3JlYXRlKG51bGwpO1xufVxuXG4vKipcbiogRGVmaW5lcyByZWd1bGFyIGV4cHJlc3Npb25zIGZvciB2YXJpb3VzIG9wZXJhdGlvbnMgcmVsYXRlZCB0byB0aGUgQkNQIDQ3IHN5bnRheCxcbiogYXMgZGVmaW5lZCBhdCBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9iY3A0NyNzZWN0aW9uLTIuMVxuKi9cblxuLy8gZXh0bGFuZyAgICAgICA9IDNBTFBIQSAgICAgICAgICAgICAgOyBzZWxlY3RlZCBJU08gNjM5IGNvZGVzXG4vLyAgICAgICAgICAgICAgICAgKjIoXCItXCIgM0FMUEhBKSAgICAgIDsgcGVybWFuZW50bHkgcmVzZXJ2ZWRcbnZhciBleHRsYW5nID0gJ1thLXpdezN9KD86LVthLXpdezN9KXswLDJ9JztcblxuLy8gbGFuZ3VhZ2UgICAgICA9IDIqM0FMUEhBICAgICAgICAgICAgOyBzaG9ydGVzdCBJU08gNjM5IGNvZGVcbi8vICAgICAgICAgICAgICAgICBbXCItXCIgZXh0bGFuZ10gICAgICAgOyBzb21ldGltZXMgZm9sbG93ZWQgYnlcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDsgZXh0ZW5kZWQgbGFuZ3VhZ2Ugc3VidGFnc1xuLy8gICAgICAgICAgICAgICAvIDRBTFBIQSAgICAgICAgICAgICAgOyBvciByZXNlcnZlZCBmb3IgZnV0dXJlIHVzZVxuLy8gICAgICAgICAgICAgICAvIDUqOEFMUEhBICAgICAgICAgICAgOyBvciByZWdpc3RlcmVkIGxhbmd1YWdlIHN1YnRhZ1xudmFyIGxhbmd1YWdlID0gJyg/OlthLXpdezIsM30oPzotJyArIGV4dGxhbmcgKyAnKT98W2Etel17NH18W2Etel17NSw4fSknO1xuXG4vLyBzY3JpcHQgICAgICAgID0gNEFMUEhBICAgICAgICAgICAgICA7IElTTyAxNTkyNCBjb2RlXG52YXIgc2NyaXB0ID0gJ1thLXpdezR9JztcblxuLy8gcmVnaW9uICAgICAgICA9IDJBTFBIQSAgICAgICAgICAgICAgOyBJU08gMzE2Ni0xIGNvZGVcbi8vICAgICAgICAgICAgICAgLyAzRElHSVQgICAgICAgICAgICAgIDsgVU4gTS40OSBjb2RlXG52YXIgcmVnaW9uID0gJyg/OlthLXpdezJ9fFxcXFxkezN9KSc7XG5cbi8vIHZhcmlhbnQgICAgICAgPSA1KjhhbHBoYW51bSAgICAgICAgIDsgcmVnaXN0ZXJlZCB2YXJpYW50c1xuLy8gICAgICAgICAgICAgICAvIChESUdJVCAzYWxwaGFudW0pXG52YXIgdmFyaWFudCA9ICcoPzpbYS16MC05XXs1LDh9fFxcXFxkW2EtejAtOV17M30pJztcblxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOyBTaW5nbGUgYWxwaGFudW1lcmljc1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOyBcInhcIiByZXNlcnZlZCBmb3IgcHJpdmF0ZSB1c2Vcbi8vIHNpbmdsZXRvbiAgICAgPSBESUdJVCAgICAgICAgICAgICAgIDsgMCAtIDlcbi8vICAgICAgICAgICAgICAgLyAleDQxLTU3ICAgICAgICAgICAgIDsgQSAtIFdcbi8vICAgICAgICAgICAgICAgLyAleDU5LTVBICAgICAgICAgICAgIDsgWSAtIFpcbi8vICAgICAgICAgICAgICAgLyAleDYxLTc3ICAgICAgICAgICAgIDsgYSAtIHdcbi8vICAgICAgICAgICAgICAgLyAleDc5LTdBICAgICAgICAgICAgIDsgeSAtIHpcbnZhciBzaW5nbGV0b24gPSAnWzAtOWEtd3ktel0nO1xuXG4vLyBleHRlbnNpb24gICAgID0gc2luZ2xldG9uIDEqKFwiLVwiICgyKjhhbHBoYW51bSkpXG52YXIgZXh0ZW5zaW9uID0gc2luZ2xldG9uICsgJyg/Oi1bYS16MC05XXsyLDh9KSsnO1xuXG4vLyBwcml2YXRldXNlICAgID0gXCJ4XCIgMSooXCItXCIgKDEqOGFscGhhbnVtKSlcbnZhciBwcml2YXRldXNlID0gJ3goPzotW2EtejAtOV17MSw4fSkrJztcblxuLy8gaXJyZWd1bGFyICAgICA9IFwiZW4tR0Itb2VkXCIgICAgICAgICA7IGlycmVndWxhciB0YWdzIGRvIG5vdCBtYXRjaFxuLy8gICAgICAgICAgICAgICAvIFwiaS1hbWlcIiAgICAgICAgICAgICA7IHRoZSAnbGFuZ3RhZycgcHJvZHVjdGlvbiBhbmRcbi8vICAgICAgICAgICAgICAgLyBcImktYm5uXCIgICAgICAgICAgICAgOyB3b3VsZCBub3Qgb3RoZXJ3aXNlIGJlXG4vLyAgICAgICAgICAgICAgIC8gXCJpLWRlZmF1bHRcIiAgICAgICAgIDsgY29uc2lkZXJlZCAnd2VsbC1mb3JtZWQnXG4vLyAgICAgICAgICAgICAgIC8gXCJpLWVub2NoaWFuXCIgICAgICAgIDsgVGhlc2UgdGFncyBhcmUgYWxsIHZhbGlkLFxuLy8gICAgICAgICAgICAgICAvIFwiaS1oYWtcIiAgICAgICAgICAgICA7IGJ1dCBtb3N0IGFyZSBkZXByZWNhdGVkXG4vLyAgICAgICAgICAgICAgIC8gXCJpLWtsaW5nb25cIiAgICAgICAgIDsgaW4gZmF2b3Igb2YgbW9yZSBtb2Rlcm5cbi8vICAgICAgICAgICAgICAgLyBcImktbHV4XCIgICAgICAgICAgICAgOyBzdWJ0YWdzIG9yIHN1YnRhZ1xuLy8gICAgICAgICAgICAgICAvIFwiaS1taW5nb1wiICAgICAgICAgICA7IGNvbWJpbmF0aW9uXG4vLyAgICAgICAgICAgICAgIC8gXCJpLW5hdmFqb1wiXG4vLyAgICAgICAgICAgICAgIC8gXCJpLXB3blwiXG4vLyAgICAgICAgICAgICAgIC8gXCJpLXRhb1wiXG4vLyAgICAgICAgICAgICAgIC8gXCJpLXRheVwiXG4vLyAgICAgICAgICAgICAgIC8gXCJpLXRzdVwiXG4vLyAgICAgICAgICAgICAgIC8gXCJzZ24tQkUtRlJcIlxuLy8gICAgICAgICAgICAgICAvIFwic2duLUJFLU5MXCJcbi8vICAgICAgICAgICAgICAgLyBcInNnbi1DSC1ERVwiXG52YXIgaXJyZWd1bGFyID0gJyg/OmVuLUdCLW9lZCcgKyAnfGktKD86YW1pfGJubnxkZWZhdWx0fGVub2NoaWFufGhha3xrbGluZ29ufGx1eHxtaW5nb3xuYXZham98cHdufHRhb3x0YXl8dHN1KScgKyAnfHNnbi0oPzpCRS1GUnxCRS1OTHxDSC1ERSkpJztcblxuLy8gcmVndWxhciAgICAgICA9IFwiYXJ0LWxvamJhblwiICAgICAgICA7IHRoZXNlIHRhZ3MgbWF0Y2ggdGhlICdsYW5ndGFnJ1xuLy8gICAgICAgICAgICAgICAvIFwiY2VsLWdhdWxpc2hcIiAgICAgICA7IHByb2R1Y3Rpb24sIGJ1dCB0aGVpciBzdWJ0YWdzXG4vLyAgICAgICAgICAgICAgIC8gXCJuby1ib2tcIiAgICAgICAgICAgIDsgYXJlIG5vdCBleHRlbmRlZCBsYW5ndWFnZVxuLy8gICAgICAgICAgICAgICAvIFwibm8tbnluXCIgICAgICAgICAgICA7IG9yIHZhcmlhbnQgc3VidGFnczogdGhlaXIgbWVhbmluZ1xuLy8gICAgICAgICAgICAgICAvIFwiemgtZ3VveXVcIiAgICAgICAgICA7IGlzIGRlZmluZWQgYnkgdGhlaXIgcmVnaXN0cmF0aW9uXG4vLyAgICAgICAgICAgICAgIC8gXCJ6aC1oYWtrYVwiICAgICAgICAgIDsgYW5kIGFsbCBvZiB0aGVzZSBhcmUgZGVwcmVjYXRlZFxuLy8gICAgICAgICAgICAgICAvIFwiemgtbWluXCIgICAgICAgICAgICA7IGluIGZhdm9yIG9mIGEgbW9yZSBtb2Rlcm5cbi8vICAgICAgICAgICAgICAgLyBcInpoLW1pbi1uYW5cIiAgICAgICAgOyBzdWJ0YWcgb3Igc2VxdWVuY2Ugb2Ygc3VidGFnc1xuLy8gICAgICAgICAgICAgICAvIFwiemgteGlhbmdcIlxudmFyIHJlZ3VsYXIgPSAnKD86YXJ0LWxvamJhbnxjZWwtZ2F1bGlzaHxuby1ib2t8bm8tbnluJyArICd8emgtKD86Z3VveXV8aGFra2F8bWlufG1pbi1uYW58eGlhbmcpKSc7XG5cbi8vIGdyYW5kZmF0aGVyZWQgPSBpcnJlZ3VsYXIgICAgICAgICAgIDsgbm9uLXJlZHVuZGFudCB0YWdzIHJlZ2lzdGVyZWRcbi8vICAgICAgICAgICAgICAgLyByZWd1bGFyICAgICAgICAgICAgIDsgZHVyaW5nIHRoZSBSRkMgMzA2NiBlcmFcbnZhciBncmFuZGZhdGhlcmVkID0gJyg/OicgKyBpcnJlZ3VsYXIgKyAnfCcgKyByZWd1bGFyICsgJyknO1xuXG4vLyBsYW5ndGFnICAgICAgID0gbGFuZ3VhZ2Vcbi8vICAgICAgICAgICAgICAgICBbXCItXCIgc2NyaXB0XVxuLy8gICAgICAgICAgICAgICAgIFtcIi1cIiByZWdpb25dXG4vLyAgICAgICAgICAgICAgICAgKihcIi1cIiB2YXJpYW50KVxuLy8gICAgICAgICAgICAgICAgICooXCItXCIgZXh0ZW5zaW9uKVxuLy8gICAgICAgICAgICAgICAgIFtcIi1cIiBwcml2YXRldXNlXVxudmFyIGxhbmd0YWcgPSBsYW5ndWFnZSArICcoPzotJyArIHNjcmlwdCArICcpPyg/Oi0nICsgcmVnaW9uICsgJyk/KD86LScgKyB2YXJpYW50ICsgJykqKD86LScgKyBleHRlbnNpb24gKyAnKSooPzotJyArIHByaXZhdGV1c2UgKyAnKT8nO1xuXG4vLyBMYW5ndWFnZS1UYWcgID0gbGFuZ3RhZyAgICAgICAgICAgICA7IG5vcm1hbCBsYW5ndWFnZSB0YWdzXG4vLyAgICAgICAgICAgICAgIC8gcHJpdmF0ZXVzZSAgICAgICAgICA7IHByaXZhdGUgdXNlIHRhZ1xuLy8gICAgICAgICAgICAgICAvIGdyYW5kZmF0aGVyZWQgICAgICAgOyBncmFuZGZhdGhlcmVkIHRhZ3NcbnZhciBleHBCQ1A0N1N5bnRheCA9IFJlZ0V4cCgnXig/OicgKyBsYW5ndGFnICsgJ3wnICsgcHJpdmF0ZXVzZSArICd8JyArIGdyYW5kZmF0aGVyZWQgKyAnKSQnLCAnaScpO1xuXG4vLyBNYXRjaCBkdXBsaWNhdGUgdmFyaWFudHMgaW4gYSBsYW5ndWFnZSB0YWdcbnZhciBleHBWYXJpYW50RHVwZXMgPSBSZWdFeHAoJ14oPyF4KS4qPy0oJyArIHZhcmlhbnQgKyAnKS0oPzpcXFxcd3s0LDh9LSg/IXgtKSkqXFxcXDFcXFxcYicsICdpJyk7XG5cbi8vIE1hdGNoIGR1cGxpY2F0ZSBzaW5nbGV0b25zIGluIGEgbGFuZ3VhZ2UgdGFnIChleGNlcHQgaW4gcHJpdmF0ZSB1c2UpXG52YXIgZXhwU2luZ2xldG9uRHVwZXMgPSBSZWdFeHAoJ14oPyF4KS4qPy0oJyArIHNpbmdsZXRvbiArICcpLSg/OlxcXFx3Ky0oPyF4LSkpKlxcXFwxXFxcXGInLCAnaScpO1xuXG4vLyBNYXRjaCBhbGwgZXh0ZW5zaW9uIHNlcXVlbmNlc1xudmFyIGV4cEV4dFNlcXVlbmNlcyA9IFJlZ0V4cCgnLScgKyBleHRlbnNpb24sICdpZycpO1xuXG4vLyBEZWZhdWx0IGxvY2FsZSBpcyB0aGUgZmlyc3QtYWRkZWQgbG9jYWxlIGRhdGEgZm9yIHVzXG52YXIgZGVmYXVsdExvY2FsZSA9IHZvaWQgMDtcbmZ1bmN0aW9uIHNldERlZmF1bHRMb2NhbGUobG9jYWxlKSB7XG4gICAgZGVmYXVsdExvY2FsZSA9IGxvY2FsZTtcbn1cblxuLy8gSUFOQSBTdWJ0YWcgUmVnaXN0cnkgcmVkdW5kYW50IHRhZyBhbmQgc3VidGFnIG1hcHNcbnZhciByZWR1bmRhbnRUYWdzID0ge1xuICAgIHRhZ3M6IHtcbiAgICAgICAgXCJhcnQtbG9qYmFuXCI6IFwiamJvXCIsXG4gICAgICAgIFwiaS1hbWlcIjogXCJhbWlcIixcbiAgICAgICAgXCJpLWJublwiOiBcImJublwiLFxuICAgICAgICBcImktaGFrXCI6IFwiaGFrXCIsXG4gICAgICAgIFwiaS1rbGluZ29uXCI6IFwidGxoXCIsXG4gICAgICAgIFwiaS1sdXhcIjogXCJsYlwiLFxuICAgICAgICBcImktbmF2YWpvXCI6IFwibnZcIixcbiAgICAgICAgXCJpLXB3blwiOiBcInB3blwiLFxuICAgICAgICBcImktdGFvXCI6IFwidGFvXCIsXG4gICAgICAgIFwiaS10YXlcIjogXCJ0YXlcIixcbiAgICAgICAgXCJpLXRzdVwiOiBcInRzdVwiLFxuICAgICAgICBcIm5vLWJva1wiOiBcIm5iXCIsXG4gICAgICAgIFwibm8tbnluXCI6IFwibm5cIixcbiAgICAgICAgXCJzZ24tQkUtRlJcIjogXCJzZmJcIixcbiAgICAgICAgXCJzZ24tQkUtTkxcIjogXCJ2Z3RcIixcbiAgICAgICAgXCJzZ24tQ0gtREVcIjogXCJzZ2dcIixcbiAgICAgICAgXCJ6aC1ndW95dVwiOiBcImNtblwiLFxuICAgICAgICBcInpoLWhha2thXCI6IFwiaGFrXCIsXG4gICAgICAgIFwiemgtbWluLW5hblwiOiBcIm5hblwiLFxuICAgICAgICBcInpoLXhpYW5nXCI6IFwiaHNuXCIsXG4gICAgICAgIFwic2duLUJSXCI6IFwiYnpzXCIsXG4gICAgICAgIFwic2duLUNPXCI6IFwiY3NuXCIsXG4gICAgICAgIFwic2duLURFXCI6IFwiZ3NnXCIsXG4gICAgICAgIFwic2duLURLXCI6IFwiZHNsXCIsXG4gICAgICAgIFwic2duLUVTXCI6IFwic3NwXCIsXG4gICAgICAgIFwic2duLUZSXCI6IFwiZnNsXCIsXG4gICAgICAgIFwic2duLUdCXCI6IFwiYmZpXCIsXG4gICAgICAgIFwic2duLUdSXCI6IFwiZ3NzXCIsXG4gICAgICAgIFwic2duLUlFXCI6IFwiaXNnXCIsXG4gICAgICAgIFwic2duLUlUXCI6IFwiaXNlXCIsXG4gICAgICAgIFwic2duLUpQXCI6IFwianNsXCIsXG4gICAgICAgIFwic2duLU1YXCI6IFwibWZzXCIsXG4gICAgICAgIFwic2duLU5JXCI6IFwibmNzXCIsXG4gICAgICAgIFwic2duLU5MXCI6IFwiZHNlXCIsXG4gICAgICAgIFwic2duLU5PXCI6IFwibnNsXCIsXG4gICAgICAgIFwic2duLVBUXCI6IFwicHNyXCIsXG4gICAgICAgIFwic2duLVNFXCI6IFwic3dsXCIsXG4gICAgICAgIFwic2duLVVTXCI6IFwiYXNlXCIsXG4gICAgICAgIFwic2duLVpBXCI6IFwic2ZzXCIsXG4gICAgICAgIFwiemgtY21uXCI6IFwiY21uXCIsXG4gICAgICAgIFwiemgtY21uLUhhbnNcIjogXCJjbW4tSGFuc1wiLFxuICAgICAgICBcInpoLWNtbi1IYW50XCI6IFwiY21uLUhhbnRcIixcbiAgICAgICAgXCJ6aC1nYW5cIjogXCJnYW5cIixcbiAgICAgICAgXCJ6aC13dXVcIjogXCJ3dXVcIixcbiAgICAgICAgXCJ6aC15dWVcIjogXCJ5dWVcIlxuICAgIH0sXG4gICAgc3VidGFnczoge1xuICAgICAgICBCVTogXCJNTVwiLFxuICAgICAgICBERDogXCJERVwiLFxuICAgICAgICBGWDogXCJGUlwiLFxuICAgICAgICBUUDogXCJUTFwiLFxuICAgICAgICBZRDogXCJZRVwiLFxuICAgICAgICBaUjogXCJDRFwiLFxuICAgICAgICBoZXBsb2M6IFwiYWxhbGM5N1wiLFxuICAgICAgICAnaW4nOiBcImlkXCIsXG4gICAgICAgIGl3OiBcImhlXCIsXG4gICAgICAgIGppOiBcInlpXCIsXG4gICAgICAgIGp3OiBcImp2XCIsXG4gICAgICAgIG1vOiBcInJvXCIsXG4gICAgICAgIGF5eDogXCJudW5cIixcbiAgICAgICAgYmpkOiBcImRybFwiLFxuICAgICAgICBjY3E6IFwicmtpXCIsXG4gICAgICAgIGNqcjogXCJtb21cIixcbiAgICAgICAgY2thOiBcImNtclwiLFxuICAgICAgICBjbWs6IFwieGNoXCIsXG4gICAgICAgIGRyaDogXCJraGtcIixcbiAgICAgICAgZHJ3OiBcInByc1wiLFxuICAgICAgICBnYXY6IFwiZGV2XCIsXG4gICAgICAgIGhycjogXCJqYWxcIixcbiAgICAgICAgaWJpOiBcIm9wYVwiLFxuICAgICAgICBrZ2g6IFwia21sXCIsXG4gICAgICAgIGxjcTogXCJwcHJcIixcbiAgICAgICAgbXN0OiBcIm1yeVwiLFxuICAgICAgICBteXQ6IFwibXJ5XCIsXG4gICAgICAgIHNjYTogXCJobGVcIixcbiAgICAgICAgdGllOiBcInJhc1wiLFxuICAgICAgICB0a2s6IFwidHdtXCIsXG4gICAgICAgIHRsdzogXCJ3ZW9cIixcbiAgICAgICAgdG5mOiBcInByc1wiLFxuICAgICAgICB5YmQ6IFwicmtpXCIsXG4gICAgICAgIHltYTogXCJscnJcIlxuICAgIH0sXG4gICAgZXh0TGFuZzoge1xuICAgICAgICBhYW86IFtcImFhb1wiLCBcImFyXCJdLFxuICAgICAgICBhYmg6IFtcImFiaFwiLCBcImFyXCJdLFxuICAgICAgICBhYnY6IFtcImFidlwiLCBcImFyXCJdLFxuICAgICAgICBhY206IFtcImFjbVwiLCBcImFyXCJdLFxuICAgICAgICBhY3E6IFtcImFjcVwiLCBcImFyXCJdLFxuICAgICAgICBhY3c6IFtcImFjd1wiLCBcImFyXCJdLFxuICAgICAgICBhY3g6IFtcImFjeFwiLCBcImFyXCJdLFxuICAgICAgICBhY3k6IFtcImFjeVwiLCBcImFyXCJdLFxuICAgICAgICBhZGY6IFtcImFkZlwiLCBcImFyXCJdLFxuICAgICAgICBhZHM6IFtcImFkc1wiLCBcInNnblwiXSxcbiAgICAgICAgYWViOiBbXCJhZWJcIiwgXCJhclwiXSxcbiAgICAgICAgYWVjOiBbXCJhZWNcIiwgXCJhclwiXSxcbiAgICAgICAgYWVkOiBbXCJhZWRcIiwgXCJzZ25cIl0sXG4gICAgICAgIGFlbjogW1wiYWVuXCIsIFwic2duXCJdLFxuICAgICAgICBhZmI6IFtcImFmYlwiLCBcImFyXCJdLFxuICAgICAgICBhZmc6IFtcImFmZ1wiLCBcInNnblwiXSxcbiAgICAgICAgYWpwOiBbXCJhanBcIiwgXCJhclwiXSxcbiAgICAgICAgYXBjOiBbXCJhcGNcIiwgXCJhclwiXSxcbiAgICAgICAgYXBkOiBbXCJhcGRcIiwgXCJhclwiXSxcbiAgICAgICAgYXJiOiBbXCJhcmJcIiwgXCJhclwiXSxcbiAgICAgICAgYXJxOiBbXCJhcnFcIiwgXCJhclwiXSxcbiAgICAgICAgYXJzOiBbXCJhcnNcIiwgXCJhclwiXSxcbiAgICAgICAgYXJ5OiBbXCJhcnlcIiwgXCJhclwiXSxcbiAgICAgICAgYXJ6OiBbXCJhcnpcIiwgXCJhclwiXSxcbiAgICAgICAgYXNlOiBbXCJhc2VcIiwgXCJzZ25cIl0sXG4gICAgICAgIGFzZjogW1wiYXNmXCIsIFwic2duXCJdLFxuICAgICAgICBhc3A6IFtcImFzcFwiLCBcInNnblwiXSxcbiAgICAgICAgYXNxOiBbXCJhc3FcIiwgXCJzZ25cIl0sXG4gICAgICAgIGFzdzogW1wiYXN3XCIsIFwic2duXCJdLFxuICAgICAgICBhdXo6IFtcImF1elwiLCBcImFyXCJdLFxuICAgICAgICBhdmw6IFtcImF2bFwiLCBcImFyXCJdLFxuICAgICAgICBheWg6IFtcImF5aFwiLCBcImFyXCJdLFxuICAgICAgICBheWw6IFtcImF5bFwiLCBcImFyXCJdLFxuICAgICAgICBheW46IFtcImF5blwiLCBcImFyXCJdLFxuICAgICAgICBheXA6IFtcImF5cFwiLCBcImFyXCJdLFxuICAgICAgICBiYno6IFtcImJielwiLCBcImFyXCJdLFxuICAgICAgICBiZmk6IFtcImJmaVwiLCBcInNnblwiXSxcbiAgICAgICAgYmZrOiBbXCJiZmtcIiwgXCJzZ25cIl0sXG4gICAgICAgIGJqbjogW1wiYmpuXCIsIFwibXNcIl0sXG4gICAgICAgIGJvZzogW1wiYm9nXCIsIFwic2duXCJdLFxuICAgICAgICBicW46IFtcImJxblwiLCBcInNnblwiXSxcbiAgICAgICAgYnF5OiBbXCJicXlcIiwgXCJzZ25cIl0sXG4gICAgICAgIGJ0ajogW1wiYnRqXCIsIFwibXNcIl0sXG4gICAgICAgIGJ2ZTogW1wiYnZlXCIsIFwibXNcIl0sXG4gICAgICAgIGJ2bDogW1wiYnZsXCIsIFwic2duXCJdLFxuICAgICAgICBidnU6IFtcImJ2dVwiLCBcIm1zXCJdLFxuICAgICAgICBienM6IFtcImJ6c1wiLCBcInNnblwiXSxcbiAgICAgICAgY2RvOiBbXCJjZG9cIiwgXCJ6aFwiXSxcbiAgICAgICAgY2RzOiBbXCJjZHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGNqeTogW1wiY2p5XCIsIFwiemhcIl0sXG4gICAgICAgIGNtbjogW1wiY21uXCIsIFwiemhcIl0sXG4gICAgICAgIGNvYTogW1wiY29hXCIsIFwibXNcIl0sXG4gICAgICAgIGNweDogW1wiY3B4XCIsIFwiemhcIl0sXG4gICAgICAgIGNzYzogW1wiY3NjXCIsIFwic2duXCJdLFxuICAgICAgICBjc2Q6IFtcImNzZFwiLCBcInNnblwiXSxcbiAgICAgICAgY3NlOiBbXCJjc2VcIiwgXCJzZ25cIl0sXG4gICAgICAgIGNzZjogW1wiY3NmXCIsIFwic2duXCJdLFxuICAgICAgICBjc2c6IFtcImNzZ1wiLCBcInNnblwiXSxcbiAgICAgICAgY3NsOiBbXCJjc2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIGNzbjogW1wiY3NuXCIsIFwic2duXCJdLFxuICAgICAgICBjc3E6IFtcImNzcVwiLCBcInNnblwiXSxcbiAgICAgICAgY3NyOiBbXCJjc3JcIiwgXCJzZ25cIl0sXG4gICAgICAgIGN6aDogW1wiY3poXCIsIFwiemhcIl0sXG4gICAgICAgIGN6bzogW1wiY3pvXCIsIFwiemhcIl0sXG4gICAgICAgIGRvcTogW1wiZG9xXCIsIFwic2duXCJdLFxuICAgICAgICBkc2U6IFtcImRzZVwiLCBcInNnblwiXSxcbiAgICAgICAgZHNsOiBbXCJkc2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIGR1cDogW1wiZHVwXCIsIFwibXNcIl0sXG4gICAgICAgIGVjczogW1wiZWNzXCIsIFwic2duXCJdLFxuICAgICAgICBlc2w6IFtcImVzbFwiLCBcInNnblwiXSxcbiAgICAgICAgZXNuOiBbXCJlc25cIiwgXCJzZ25cIl0sXG4gICAgICAgIGVzbzogW1wiZXNvXCIsIFwic2duXCJdLFxuICAgICAgICBldGg6IFtcImV0aFwiLCBcInNnblwiXSxcbiAgICAgICAgZmNzOiBbXCJmY3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIGZzZTogW1wiZnNlXCIsIFwic2duXCJdLFxuICAgICAgICBmc2w6IFtcImZzbFwiLCBcInNnblwiXSxcbiAgICAgICAgZnNzOiBbXCJmc3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIGdhbjogW1wiZ2FuXCIsIFwiemhcIl0sXG4gICAgICAgIGdkczogW1wiZ2RzXCIsIFwic2duXCJdLFxuICAgICAgICBnb206IFtcImdvbVwiLCBcImtva1wiXSxcbiAgICAgICAgZ3NlOiBbXCJnc2VcIiwgXCJzZ25cIl0sXG4gICAgICAgIGdzZzogW1wiZ3NnXCIsIFwic2duXCJdLFxuICAgICAgICBnc206IFtcImdzbVwiLCBcInNnblwiXSxcbiAgICAgICAgZ3NzOiBbXCJnc3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIGd1czogW1wiZ3VzXCIsIFwic2duXCJdLFxuICAgICAgICBoYWI6IFtcImhhYlwiLCBcInNnblwiXSxcbiAgICAgICAgaGFmOiBbXCJoYWZcIiwgXCJzZ25cIl0sXG4gICAgICAgIGhhazogW1wiaGFrXCIsIFwiemhcIl0sXG4gICAgICAgIGhkczogW1wiaGRzXCIsIFwic2duXCJdLFxuICAgICAgICBoamk6IFtcImhqaVwiLCBcIm1zXCJdLFxuICAgICAgICBoa3M6IFtcImhrc1wiLCBcInNnblwiXSxcbiAgICAgICAgaG9zOiBbXCJob3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIGhwczogW1wiaHBzXCIsIFwic2duXCJdLFxuICAgICAgICBoc2g6IFtcImhzaFwiLCBcInNnblwiXSxcbiAgICAgICAgaHNsOiBbXCJoc2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIGhzbjogW1wiaHNuXCIsIFwiemhcIl0sXG4gICAgICAgIGljbDogW1wiaWNsXCIsIFwic2duXCJdLFxuICAgICAgICBpbHM6IFtcImlsc1wiLCBcInNnblwiXSxcbiAgICAgICAgaW5sOiBbXCJpbmxcIiwgXCJzZ25cIl0sXG4gICAgICAgIGluczogW1wiaW5zXCIsIFwic2duXCJdLFxuICAgICAgICBpc2U6IFtcImlzZVwiLCBcInNnblwiXSxcbiAgICAgICAgaXNnOiBbXCJpc2dcIiwgXCJzZ25cIl0sXG4gICAgICAgIGlzcjogW1wiaXNyXCIsIFwic2duXCJdLFxuICAgICAgICBqYWs6IFtcImpha1wiLCBcIm1zXCJdLFxuICAgICAgICBqYXg6IFtcImpheFwiLCBcIm1zXCJdLFxuICAgICAgICBqY3M6IFtcImpjc1wiLCBcInNnblwiXSxcbiAgICAgICAgamhzOiBbXCJqaHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGpsczogW1wiamxzXCIsIFwic2duXCJdLFxuICAgICAgICBqb3M6IFtcImpvc1wiLCBcInNnblwiXSxcbiAgICAgICAganNsOiBbXCJqc2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIGp1czogW1wianVzXCIsIFwic2duXCJdLFxuICAgICAgICBrZ2k6IFtcImtnaVwiLCBcInNnblwiXSxcbiAgICAgICAga25uOiBbXCJrbm5cIiwgXCJrb2tcIl0sXG4gICAgICAgIGt2YjogW1wia3ZiXCIsIFwibXNcIl0sXG4gICAgICAgIGt2azogW1wia3ZrXCIsIFwic2duXCJdLFxuICAgICAgICBrdnI6IFtcImt2clwiLCBcIm1zXCJdLFxuICAgICAgICBreGQ6IFtcImt4ZFwiLCBcIm1zXCJdLFxuICAgICAgICBsYnM6IFtcImxic1wiLCBcInNnblwiXSxcbiAgICAgICAgbGNlOiBbXCJsY2VcIiwgXCJtc1wiXSxcbiAgICAgICAgbGNmOiBbXCJsY2ZcIiwgXCJtc1wiXSxcbiAgICAgICAgbGl3OiBbXCJsaXdcIiwgXCJtc1wiXSxcbiAgICAgICAgbGxzOiBbXCJsbHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGxzZzogW1wibHNnXCIsIFwic2duXCJdLFxuICAgICAgICBsc2w6IFtcImxzbFwiLCBcInNnblwiXSxcbiAgICAgICAgbHNvOiBbXCJsc29cIiwgXCJzZ25cIl0sXG4gICAgICAgIGxzcDogW1wibHNwXCIsIFwic2duXCJdLFxuICAgICAgICBsc3Q6IFtcImxzdFwiLCBcInNnblwiXSxcbiAgICAgICAgbHN5OiBbXCJsc3lcIiwgXCJzZ25cIl0sXG4gICAgICAgIGx0ZzogW1wibHRnXCIsIFwibHZcIl0sXG4gICAgICAgIGx2czogW1wibHZzXCIsIFwibHZcIl0sXG4gICAgICAgIGx6aDogW1wibHpoXCIsIFwiemhcIl0sXG4gICAgICAgIG1heDogW1wibWF4XCIsIFwibXNcIl0sXG4gICAgICAgIG1kbDogW1wibWRsXCIsIFwic2duXCJdLFxuICAgICAgICBtZW86IFtcIm1lb1wiLCBcIm1zXCJdLFxuICAgICAgICBtZmE6IFtcIm1mYVwiLCBcIm1zXCJdLFxuICAgICAgICBtZmI6IFtcIm1mYlwiLCBcIm1zXCJdLFxuICAgICAgICBtZnM6IFtcIm1mc1wiLCBcInNnblwiXSxcbiAgICAgICAgbWluOiBbXCJtaW5cIiwgXCJtc1wiXSxcbiAgICAgICAgbW5wOiBbXCJtbnBcIiwgXCJ6aFwiXSxcbiAgICAgICAgbXFnOiBbXCJtcWdcIiwgXCJtc1wiXSxcbiAgICAgICAgbXJlOiBbXCJtcmVcIiwgXCJzZ25cIl0sXG4gICAgICAgIG1zZDogW1wibXNkXCIsIFwic2duXCJdLFxuICAgICAgICBtc2k6IFtcIm1zaVwiLCBcIm1zXCJdLFxuICAgICAgICBtc3I6IFtcIm1zclwiLCBcInNnblwiXSxcbiAgICAgICAgbXVpOiBbXCJtdWlcIiwgXCJtc1wiXSxcbiAgICAgICAgbXpjOiBbXCJtemNcIiwgXCJzZ25cIl0sXG4gICAgICAgIG16ZzogW1wibXpnXCIsIFwic2duXCJdLFxuICAgICAgICBtenk6IFtcIm16eVwiLCBcInNnblwiXSxcbiAgICAgICAgbmFuOiBbXCJuYW5cIiwgXCJ6aFwiXSxcbiAgICAgICAgbmJzOiBbXCJuYnNcIiwgXCJzZ25cIl0sXG4gICAgICAgIG5jczogW1wibmNzXCIsIFwic2duXCJdLFxuICAgICAgICBuc2k6IFtcIm5zaVwiLCBcInNnblwiXSxcbiAgICAgICAgbnNsOiBbXCJuc2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIG5zcDogW1wibnNwXCIsIFwic2duXCJdLFxuICAgICAgICBuc3I6IFtcIm5zclwiLCBcInNnblwiXSxcbiAgICAgICAgbnpzOiBbXCJuenNcIiwgXCJzZ25cIl0sXG4gICAgICAgIG9rbDogW1wib2tsXCIsIFwic2duXCJdLFxuICAgICAgICBvcm46IFtcIm9yblwiLCBcIm1zXCJdLFxuICAgICAgICBvcnM6IFtcIm9yc1wiLCBcIm1zXCJdLFxuICAgICAgICBwZWw6IFtcInBlbFwiLCBcIm1zXCJdLFxuICAgICAgICBwZ2E6IFtcInBnYVwiLCBcImFyXCJdLFxuICAgICAgICBwa3M6IFtcInBrc1wiLCBcInNnblwiXSxcbiAgICAgICAgcHJsOiBbXCJwcmxcIiwgXCJzZ25cIl0sXG4gICAgICAgIHByejogW1wicHJ6XCIsIFwic2duXCJdLFxuICAgICAgICBwc2M6IFtcInBzY1wiLCBcInNnblwiXSxcbiAgICAgICAgcHNkOiBbXCJwc2RcIiwgXCJzZ25cIl0sXG4gICAgICAgIHBzZTogW1wicHNlXCIsIFwibXNcIl0sXG4gICAgICAgIHBzZzogW1wicHNnXCIsIFwic2duXCJdLFxuICAgICAgICBwc2w6IFtcInBzbFwiLCBcInNnblwiXSxcbiAgICAgICAgcHNvOiBbXCJwc29cIiwgXCJzZ25cIl0sXG4gICAgICAgIHBzcDogW1wicHNwXCIsIFwic2duXCJdLFxuICAgICAgICBwc3I6IFtcInBzclwiLCBcInNnblwiXSxcbiAgICAgICAgcHlzOiBbXCJweXNcIiwgXCJzZ25cIl0sXG4gICAgICAgIHJtczogW1wicm1zXCIsIFwic2duXCJdLFxuICAgICAgICByc2k6IFtcInJzaVwiLCBcInNnblwiXSxcbiAgICAgICAgcnNsOiBbXCJyc2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNkbDogW1wic2RsXCIsIFwic2duXCJdLFxuICAgICAgICBzZmI6IFtcInNmYlwiLCBcInNnblwiXSxcbiAgICAgICAgc2ZzOiBbXCJzZnNcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNnZzogW1wic2dnXCIsIFwic2duXCJdLFxuICAgICAgICBzZ3g6IFtcInNneFwiLCBcInNnblwiXSxcbiAgICAgICAgc2h1OiBbXCJzaHVcIiwgXCJhclwiXSxcbiAgICAgICAgc2xmOiBbXCJzbGZcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNsczogW1wic2xzXCIsIFwic2duXCJdLFxuICAgICAgICBzcWs6IFtcInNxa1wiLCBcInNnblwiXSxcbiAgICAgICAgc3FzOiBbXCJzcXNcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNzaDogW1wic3NoXCIsIFwiYXJcIl0sXG4gICAgICAgIHNzcDogW1wic3NwXCIsIFwic2duXCJdLFxuICAgICAgICBzc3I6IFtcInNzclwiLCBcInNnblwiXSxcbiAgICAgICAgc3ZrOiBbXCJzdmtcIiwgXCJzZ25cIl0sXG4gICAgICAgIHN3YzogW1wic3djXCIsIFwic3dcIl0sXG4gICAgICAgIHN3aDogW1wic3doXCIsIFwic3dcIl0sXG4gICAgICAgIHN3bDogW1wic3dsXCIsIFwic2duXCJdLFxuICAgICAgICBzeXk6IFtcInN5eVwiLCBcInNnblwiXSxcbiAgICAgICAgdG13OiBbXCJ0bXdcIiwgXCJtc1wiXSxcbiAgICAgICAgdHNlOiBbXCJ0c2VcIiwgXCJzZ25cIl0sXG4gICAgICAgIHRzbTogW1widHNtXCIsIFwic2duXCJdLFxuICAgICAgICB0c3E6IFtcInRzcVwiLCBcInNnblwiXSxcbiAgICAgICAgdHNzOiBbXCJ0c3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIHRzeTogW1widHN5XCIsIFwic2duXCJdLFxuICAgICAgICB0emE6IFtcInR6YVwiLCBcInNnblwiXSxcbiAgICAgICAgdWduOiBbXCJ1Z25cIiwgXCJzZ25cIl0sXG4gICAgICAgIHVneTogW1widWd5XCIsIFwic2duXCJdLFxuICAgICAgICB1a2w6IFtcInVrbFwiLCBcInNnblwiXSxcbiAgICAgICAgdWtzOiBbXCJ1a3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIHVyazogW1widXJrXCIsIFwibXNcIl0sXG4gICAgICAgIHV6bjogW1widXpuXCIsIFwidXpcIl0sXG4gICAgICAgIHV6czogW1widXpzXCIsIFwidXpcIl0sXG4gICAgICAgIHZndDogW1widmd0XCIsIFwic2duXCJdLFxuICAgICAgICB2a2s6IFtcInZra1wiLCBcIm1zXCJdLFxuICAgICAgICB2a3Q6IFtcInZrdFwiLCBcIm1zXCJdLFxuICAgICAgICB2c2k6IFtcInZzaVwiLCBcInNnblwiXSxcbiAgICAgICAgdnNsOiBbXCJ2c2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIHZzdjogW1widnN2XCIsIFwic2duXCJdLFxuICAgICAgICB3dXU6IFtcInd1dVwiLCBcInpoXCJdLFxuICAgICAgICB4a2k6IFtcInhraVwiLCBcInNnblwiXSxcbiAgICAgICAgeG1sOiBbXCJ4bWxcIiwgXCJzZ25cIl0sXG4gICAgICAgIHhtbTogW1wieG1tXCIsIFwibXNcIl0sXG4gICAgICAgIHhtczogW1wieG1zXCIsIFwic2duXCJdLFxuICAgICAgICB5ZHM6IFtcInlkc1wiLCBcInNnblwiXSxcbiAgICAgICAgeXNsOiBbXCJ5c2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIHl1ZTogW1wieXVlXCIsIFwiemhcIl0sXG4gICAgICAgIHppYjogW1wiemliXCIsIFwic2duXCJdLFxuICAgICAgICB6bG06IFtcInpsbVwiLCBcIm1zXCJdLFxuICAgICAgICB6bWk6IFtcInptaVwiLCBcIm1zXCJdLFxuICAgICAgICB6c2w6IFtcInpzbFwiLCBcInNnblwiXSxcbiAgICAgICAgenNtOiBbXCJ6c21cIiwgXCJtc1wiXVxuICAgIH1cbn07XG5cbi8qKlxuICogQ29udmVydCBvbmx5IGEteiB0byB1cHBlcmNhc2UgYXMgcGVyIHNlY3Rpb24gNi4xIG9mIHRoZSBzcGVjXG4gKi9cbmZ1bmN0aW9uIHRvTGF0aW5VcHBlckNhc2Uoc3RyKSB7XG4gICAgdmFyIGkgPSBzdHIubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICB2YXIgY2ggPSBzdHIuY2hhckF0KGkpO1xuXG4gICAgICAgIGlmIChjaCA+PSBcImFcIiAmJiBjaCA8PSBcInpcIikgc3RyID0gc3RyLnNsaWNlKDAsIGkpICsgY2gudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZShpICsgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBUaGUgSXNTdHJ1Y3R1cmFsbHlWYWxpZExhbmd1YWdlVGFnIGFic3RyYWN0IG9wZXJhdGlvbiB2ZXJpZmllcyB0aGF0IHRoZSBsb2NhbGVcbiAqIGFyZ3VtZW50ICh3aGljaCBtdXN0IGJlIGEgU3RyaW5nIHZhbHVlKVxuICpcbiAqIC0gcmVwcmVzZW50cyBhIHdlbGwtZm9ybWVkIEJDUCA0NyBsYW5ndWFnZSB0YWcgYXMgc3BlY2lmaWVkIGluIFJGQyA1NjQ2IHNlY3Rpb25cbiAqICAgMi4xLCBvciBzdWNjZXNzb3IsXG4gKiAtIGRvZXMgbm90IGluY2x1ZGUgZHVwbGljYXRlIHZhcmlhbnQgc3VidGFncywgYW5kXG4gKiAtIGRvZXMgbm90IGluY2x1ZGUgZHVwbGljYXRlIHNpbmdsZXRvbiBzdWJ0YWdzLlxuICpcbiAqIFRoZSBhYnN0cmFjdCBvcGVyYXRpb24gcmV0dXJucyB0cnVlIGlmIGxvY2FsZSBjYW4gYmUgZ2VuZXJhdGVkIGZyb20gdGhlIEFCTkZcbiAqIGdyYW1tYXIgaW4gc2VjdGlvbiAyLjEgb2YgdGhlIFJGQywgc3RhcnRpbmcgd2l0aCBMYW5ndWFnZS1UYWcsIGFuZCBkb2VzIG5vdFxuICogY29udGFpbiBkdXBsaWNhdGUgdmFyaWFudCBvciBzaW5nbGV0b24gc3VidGFncyAob3RoZXIgdGhhbiBhcyBhIHByaXZhdGUgdXNlXG4gKiBzdWJ0YWcpLiBJdCByZXR1cm5zIGZhbHNlIG90aGVyd2lzZS4gVGVybWluYWwgdmFsdWUgY2hhcmFjdGVycyBpbiB0aGUgZ3JhbW1hciBhcmVcbiAqIGludGVycHJldGVkIGFzIHRoZSBVbmljb2RlIGVxdWl2YWxlbnRzIG9mIHRoZSBBU0NJSSBvY3RldCB2YWx1ZXMgZ2l2ZW4uXG4gKi9cbmZ1bmN0aW9uIC8qIDYuMi4yICovSXNTdHJ1Y3R1cmFsbHlWYWxpZExhbmd1YWdlVGFnKGxvY2FsZSkge1xuICAgIC8vIHJlcHJlc2VudHMgYSB3ZWxsLWZvcm1lZCBCQ1AgNDcgbGFuZ3VhZ2UgdGFnIGFzIHNwZWNpZmllZCBpbiBSRkMgNTY0NlxuICAgIGlmICghZXhwQkNQNDdTeW50YXgudGVzdChsb2NhbGUpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBkb2VzIG5vdCBpbmNsdWRlIGR1cGxpY2F0ZSB2YXJpYW50IHN1YnRhZ3MsIGFuZFxuICAgIGlmIChleHBWYXJpYW50RHVwZXMudGVzdChsb2NhbGUpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBkb2VzIG5vdCBpbmNsdWRlIGR1cGxpY2F0ZSBzaW5nbGV0b24gc3VidGFncy5cbiAgICBpZiAoZXhwU2luZ2xldG9uRHVwZXMudGVzdChsb2NhbGUpKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUaGUgQ2Fub25pY2FsaXplTGFuZ3VhZ2VUYWcgYWJzdHJhY3Qgb3BlcmF0aW9uIHJldHVybnMgdGhlIGNhbm9uaWNhbCBhbmQgY2FzZS1cbiAqIHJlZ3VsYXJpemVkIGZvcm0gb2YgdGhlIGxvY2FsZSBhcmd1bWVudCAod2hpY2ggbXVzdCBiZSBhIFN0cmluZyB2YWx1ZSB0aGF0IGlzXG4gKiBhIHN0cnVjdHVyYWxseSB2YWxpZCBCQ1AgNDcgbGFuZ3VhZ2UgdGFnIGFzIHZlcmlmaWVkIGJ5IHRoZVxuICogSXNTdHJ1Y3R1cmFsbHlWYWxpZExhbmd1YWdlVGFnIGFic3RyYWN0IG9wZXJhdGlvbikuIEl0IHRha2VzIHRoZSBzdGVwc1xuICogc3BlY2lmaWVkIGluIFJGQyA1NjQ2IHNlY3Rpb24gNC41LCBvciBzdWNjZXNzb3IsIHRvIGJyaW5nIHRoZSBsYW5ndWFnZSB0YWdcbiAqIGludG8gY2Fub25pY2FsIGZvcm0sIGFuZCB0byByZWd1bGFyaXplIHRoZSBjYXNlIG9mIHRoZSBzdWJ0YWdzLCBidXQgZG9lcyBub3RcbiAqIHRha2UgdGhlIHN0ZXBzIHRvIGJyaW5nIGEgbGFuZ3VhZ2UgdGFnIGludG8g4oCcZXh0bGFuZyBmb3Jt4oCdIGFuZCB0byByZW9yZGVyXG4gKiB2YXJpYW50IHN1YnRhZ3MuXG5cbiAqIFRoZSBzcGVjaWZpY2F0aW9ucyBmb3IgZXh0ZW5zaW9ucyB0byBCQ1AgNDcgbGFuZ3VhZ2UgdGFncywgc3VjaCBhcyBSRkMgNjA2NyxcbiAqIG1heSBpbmNsdWRlIGNhbm9uaWNhbGl6YXRpb24gcnVsZXMgZm9yIHRoZSBleHRlbnNpb24gc3VidGFnIHNlcXVlbmNlcyB0aGV5XG4gKiBkZWZpbmUgdGhhdCBnbyBiZXlvbmQgdGhlIGNhbm9uaWNhbGl6YXRpb24gcnVsZXMgb2YgUkZDIDU2NDYgc2VjdGlvbiA0LjUuXG4gKiBJbXBsZW1lbnRhdGlvbnMgYXJlIGFsbG93ZWQsIGJ1dCBub3QgcmVxdWlyZWQsIHRvIGFwcGx5IHRoZXNlIGFkZGl0aW9uYWwgcnVsZXMuXG4gKi9cbmZ1bmN0aW9uIC8qIDYuMi4zICovQ2Fub25pY2FsaXplTGFuZ3VhZ2VUYWcobG9jYWxlKSB7XG4gICAgdmFyIG1hdGNoID0gdm9pZCAwLFxuICAgICAgICBwYXJ0cyA9IHZvaWQgMDtcblxuICAgIC8vIEEgbGFuZ3VhZ2UgdGFnIGlzIGluICdjYW5vbmljYWwgZm9ybScgd2hlbiB0aGUgdGFnIGlzIHdlbGwtZm9ybWVkXG4gICAgLy8gYWNjb3JkaW5nIHRvIHRoZSBydWxlcyBpbiBTZWN0aW9ucyAyLjEgYW5kIDIuMlxuXG4gICAgLy8gU2VjdGlvbiAyLjEgc2F5cyBhbGwgc3VidGFncyB1c2UgbG93ZXJjYXNlLi4uXG4gICAgbG9jYWxlID0gbG9jYWxlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyAuLi53aXRoIDIgZXhjZXB0aW9uczogJ3R3by1sZXR0ZXIgYW5kIGZvdXItbGV0dGVyIHN1YnRhZ3MgdGhhdCBuZWl0aGVyXG4gICAgLy8gYXBwZWFyIGF0IHRoZSBzdGFydCBvZiB0aGUgdGFnIG5vciBvY2N1ciBhZnRlciBzaW5nbGV0b25zLiAgU3VjaCB0d28tbGV0dGVyXG4gICAgLy8gc3VidGFncyBhcmUgYWxsIHVwcGVyY2FzZSAoYXMgaW4gdGhlIHRhZ3MgXCJlbi1DQS14LWNhXCIgb3IgXCJzZ24tQkUtRlJcIikgYW5kXG4gICAgLy8gZm91ci1sZXR0ZXIgc3VidGFncyBhcmUgdGl0bGVjYXNlIChhcyBpbiB0aGUgdGFnIFwiYXotTGF0bi14LWxhdG5cIikuXG4gICAgcGFydHMgPSBsb2NhbGUuc3BsaXQoJy0nKTtcbiAgICBmb3IgKHZhciBpID0gMSwgbWF4ID0gcGFydHMubGVuZ3RoOyBpIDwgbWF4OyBpKyspIHtcbiAgICAgICAgLy8gVHdvLWxldHRlciBzdWJ0YWdzIGFyZSBhbGwgdXBwZXJjYXNlXG4gICAgICAgIGlmIChwYXJ0c1tpXS5sZW5ndGggPT09IDIpIHBhcnRzW2ldID0gcGFydHNbaV0udG9VcHBlckNhc2UoKTtcblxuICAgICAgICAvLyBGb3VyLWxldHRlciBzdWJ0YWdzIGFyZSB0aXRsZWNhc2VcbiAgICAgICAgZWxzZSBpZiAocGFydHNbaV0ubGVuZ3RoID09PSA0KSBwYXJ0c1tpXSA9IHBhcnRzW2ldLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFydHNbaV0uc2xpY2UoMSk7XG5cbiAgICAgICAgICAgIC8vIElzIGl0IGEgc2luZ2xldG9uP1xuICAgICAgICAgICAgZWxzZSBpZiAocGFydHNbaV0ubGVuZ3RoID09PSAxICYmIHBhcnRzW2ldICE9PSAneCcpIGJyZWFrO1xuICAgIH1cbiAgICBsb2NhbGUgPSBhcnJKb2luLmNhbGwocGFydHMsICctJyk7XG5cbiAgICAvLyBUaGUgc3RlcHMgbGFpZCBvdXQgaW4gUkZDIDU2NDYgc2VjdGlvbiA0LjUgYXJlIGFzIGZvbGxvd3M6XG5cbiAgICAvLyAxLiAgRXh0ZW5zaW9uIHNlcXVlbmNlcyBhcmUgb3JkZXJlZCBpbnRvIGNhc2UtaW5zZW5zaXRpdmUgQVNDSUkgb3JkZXJcbiAgICAvLyAgICAgYnkgc2luZ2xldG9uIHN1YnRhZy5cbiAgICBpZiAoKG1hdGNoID0gbG9jYWxlLm1hdGNoKGV4cEV4dFNlcXVlbmNlcykpICYmIG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgLy8gVGhlIGJ1aWx0LWluIHNvcnQoKSBzb3J0cyBieSBBU0NJSSBvcmRlciwgc28gdXNlIHRoYXRcbiAgICAgICAgbWF0Y2guc29ydCgpO1xuXG4gICAgICAgIC8vIFJlcGxhY2UgYWxsIGV4dGVuc2lvbnMgd2l0aCB0aGUgam9pbmVkLCBzb3J0ZWQgYXJyYXlcbiAgICAgICAgbG9jYWxlID0gbG9jYWxlLnJlcGxhY2UoUmVnRXhwKCcoPzonICsgZXhwRXh0U2VxdWVuY2VzLnNvdXJjZSArICcpKycsICdpJyksIGFyckpvaW4uY2FsbChtYXRjaCwgJycpKTtcbiAgICB9XG5cbiAgICAvLyAyLiAgUmVkdW5kYW50IG9yIGdyYW5kZmF0aGVyZWQgdGFncyBhcmUgcmVwbGFjZWQgYnkgdGhlaXIgJ1ByZWZlcnJlZC1cbiAgICAvLyAgICAgVmFsdWUnLCBpZiB0aGVyZSBpcyBvbmUuXG4gICAgaWYgKGhvcC5jYWxsKHJlZHVuZGFudFRhZ3MudGFncywgbG9jYWxlKSkgbG9jYWxlID0gcmVkdW5kYW50VGFncy50YWdzW2xvY2FsZV07XG5cbiAgICAvLyAzLiAgU3VidGFncyBhcmUgcmVwbGFjZWQgYnkgdGhlaXIgJ1ByZWZlcnJlZC1WYWx1ZScsIGlmIHRoZXJlIGlzIG9uZS5cbiAgICAvLyAgICAgRm9yIGV4dGxhbmdzLCB0aGUgb3JpZ2luYWwgcHJpbWFyeSBsYW5ndWFnZSBzdWJ0YWcgaXMgYWxzb1xuICAgIC8vICAgICByZXBsYWNlZCBpZiB0aGVyZSBpcyBhIHByaW1hcnkgbGFuZ3VhZ2Ugc3VidGFnIGluIHRoZSAnUHJlZmVycmVkLVxuICAgIC8vICAgICBWYWx1ZScuXG4gICAgcGFydHMgPSBsb2NhbGUuc3BsaXQoJy0nKTtcblxuICAgIGZvciAodmFyIF9pID0gMSwgX21heCA9IHBhcnRzLmxlbmd0aDsgX2kgPCBfbWF4OyBfaSsrKSB7XG4gICAgICAgIGlmIChob3AuY2FsbChyZWR1bmRhbnRUYWdzLnN1YnRhZ3MsIHBhcnRzW19pXSkpIHBhcnRzW19pXSA9IHJlZHVuZGFudFRhZ3Muc3VidGFnc1twYXJ0c1tfaV1dO2Vsc2UgaWYgKGhvcC5jYWxsKHJlZHVuZGFudFRhZ3MuZXh0TGFuZywgcGFydHNbX2ldKSkge1xuICAgICAgICAgICAgcGFydHNbX2ldID0gcmVkdW5kYW50VGFncy5leHRMYW5nW3BhcnRzW19pXV1bMF07XG5cbiAgICAgICAgICAgIC8vIEZvciBleHRsYW5nIHRhZ3MsIHRoZSBwcmVmaXggbmVlZHMgdG8gYmUgcmVtb3ZlZCBpZiBpdCBpcyByZWR1bmRhbnRcbiAgICAgICAgICAgIGlmIChfaSA9PT0gMSAmJiByZWR1bmRhbnRUYWdzLmV4dExhbmdbcGFydHNbMV1dWzFdID09PSBwYXJ0c1swXSkge1xuICAgICAgICAgICAgICAgIHBhcnRzID0gYXJyU2xpY2UuY2FsbChwYXJ0cywgX2krKyk7XG4gICAgICAgICAgICAgICAgX21heCAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyckpvaW4uY2FsbChwYXJ0cywgJy0nKTtcbn1cblxuLyoqXG4gKiBUaGUgRGVmYXVsdExvY2FsZSBhYnN0cmFjdCBvcGVyYXRpb24gcmV0dXJucyBhIFN0cmluZyB2YWx1ZSByZXByZXNlbnRpbmcgdGhlXG4gKiBzdHJ1Y3R1cmFsbHkgdmFsaWQgKDYuMi4yKSBhbmQgY2Fub25pY2FsaXplZCAoNi4yLjMpIEJDUCA0NyBsYW5ndWFnZSB0YWcgZm9yIHRoZVxuICogaG9zdCBlbnZpcm9ubWVudOKAmXMgY3VycmVudCBsb2NhbGUuXG4gKi9cbmZ1bmN0aW9uIC8qIDYuMi40ICovRGVmYXVsdExvY2FsZSgpIHtcbiAgICByZXR1cm4gZGVmYXVsdExvY2FsZTtcbn1cblxuLy8gU2VjdCA2LjMgQ3VycmVuY3kgQ29kZXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbnZhciBleHBDdXJyZW5jeUNvZGUgPSAvXltBLVpdezN9JC87XG5cbi8qKlxuICogVGhlIElzV2VsbEZvcm1lZEN1cnJlbmN5Q29kZSBhYnN0cmFjdCBvcGVyYXRpb24gdmVyaWZpZXMgdGhhdCB0aGUgY3VycmVuY3kgYXJndW1lbnRcbiAqIChhZnRlciBjb252ZXJzaW9uIHRvIGEgU3RyaW5nIHZhbHVlKSByZXByZXNlbnRzIGEgd2VsbC1mb3JtZWQgMy1sZXR0ZXIgSVNPIGN1cnJlbmN5XG4gKiBjb2RlLiBUaGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gLyogNi4zLjEgKi9Jc1dlbGxGb3JtZWRDdXJyZW5jeUNvZGUoY3VycmVuY3kpIHtcbiAgICAvLyAxLiBMZXQgYGNgIGJlIFRvU3RyaW5nKGN1cnJlbmN5KVxuICAgIHZhciBjID0gU3RyaW5nKGN1cnJlbmN5KTtcblxuICAgIC8vIDIuIExldCBgbm9ybWFsaXplZGAgYmUgdGhlIHJlc3VsdCBvZiBtYXBwaW5nIGMgdG8gdXBwZXIgY2FzZSBhcyBkZXNjcmliZWRcbiAgICAvLyAgICBpbiA2LjEuXG4gICAgdmFyIG5vcm1hbGl6ZWQgPSB0b0xhdGluVXBwZXJDYXNlKGMpO1xuXG4gICAgLy8gMy4gSWYgdGhlIHN0cmluZyBsZW5ndGggb2Ygbm9ybWFsaXplZCBpcyBub3QgMywgcmV0dXJuIGZhbHNlLlxuICAgIC8vIDQuIElmIG5vcm1hbGl6ZWQgY29udGFpbnMgYW55IGNoYXJhY3RlciB0aGF0IGlzIG5vdCBpbiB0aGUgcmFuZ2UgXCJBXCIgdG8gXCJaXCJcbiAgICAvLyAgICAoVSswMDQxIHRvIFUrMDA1QSksIHJldHVybiBmYWxzZS5cbiAgICBpZiAoZXhwQ3VycmVuY3lDb2RlLnRlc3Qobm9ybWFsaXplZCkgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyA1LiBSZXR1cm4gdHJ1ZVxuICAgIHJldHVybiB0cnVlO1xufVxuXG52YXIgZXhwVW5pY29kZUV4U2VxID0gLy11KD86LVswLTlhLXpdezIsOH0pKy9naTsgLy8gU2VlIGBleHRlbnNpb25gIGJlbG93XG5cbmZ1bmN0aW9uIC8qIDkuMi4xICovQ2Fub25pY2FsaXplTG9jYWxlTGlzdChsb2NhbGVzKSB7XG4gICAgLy8gVGhlIGFic3RyYWN0IG9wZXJhdGlvbiBDYW5vbmljYWxpemVMb2NhbGVMaXN0IHRha2VzIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG5cbiAgICAvLyAxLiBJZiBsb2NhbGVzIGlzIHVuZGVmaW5lZCwgdGhlbiBhLiBSZXR1cm4gYSBuZXcgZW1wdHkgTGlzdFxuICAgIGlmIChsb2NhbGVzID09PSB1bmRlZmluZWQpIHJldHVybiBuZXcgTGlzdCgpO1xuXG4gICAgLy8gMi4gTGV0IHNlZW4gYmUgYSBuZXcgZW1wdHkgTGlzdC5cbiAgICB2YXIgc2VlbiA9IG5ldyBMaXN0KCk7XG5cbiAgICAvLyAzLiBJZiBsb2NhbGVzIGlzIGEgU3RyaW5nIHZhbHVlLCB0aGVuXG4gICAgLy8gICAgYS4gTGV0IGxvY2FsZXMgYmUgYSBuZXcgYXJyYXkgY3JlYXRlZCBhcyBpZiBieSB0aGUgZXhwcmVzc2lvbiBuZXdcbiAgICAvLyAgICBBcnJheShsb2NhbGVzKSB3aGVyZSBBcnJheSBpcyB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gY29uc3RydWN0b3Igd2l0aFxuICAgIC8vICAgIHRoYXQgbmFtZSBhbmQgbG9jYWxlcyBpcyB0aGUgdmFsdWUgb2YgbG9jYWxlcy5cbiAgICBsb2NhbGVzID0gdHlwZW9mIGxvY2FsZXMgPT09ICdzdHJpbmcnID8gW2xvY2FsZXNdIDogbG9jYWxlcztcblxuICAgIC8vIDQuIExldCBPIGJlIFRvT2JqZWN0KGxvY2FsZXMpLlxuICAgIHZhciBPID0gdG9PYmplY3QobG9jYWxlcyk7XG5cbiAgICAvLyA1LiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgIC8vICAgIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICAvLyA2LiBMZXQgbGVuIGJlIFRvVWludDMyKGxlblZhbHVlKS5cbiAgICB2YXIgbGVuID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuXG4gICAgLy8gNy4gTGV0IGsgYmUgMC5cbiAgICB2YXIgayA9IDA7XG5cbiAgICAvLyA4LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW5cbiAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICAvLyBhLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAgIHZhciBQayA9IFN0cmluZyhrKTtcblxuICAgICAgICAvLyBiLiBMZXQga1ByZXNlbnQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0hhc1Byb3BlcnR5XV0gaW50ZXJuYWxcbiAgICAgICAgLy8gICAgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cbiAgICAgICAgdmFyIGtQcmVzZW50ID0gUGsgaW4gTztcblxuICAgICAgICAvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXG4gICAgICAgIGlmIChrUHJlc2VudCkge1xuICAgICAgICAgICAgLy8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWxcbiAgICAgICAgICAgIC8vICAgICBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICAgICAgdmFyIGtWYWx1ZSA9IE9bUGtdO1xuXG4gICAgICAgICAgICAvLyBpaS4gSWYgdGhlIHR5cGUgb2Yga1ZhbHVlIGlzIG5vdCBTdHJpbmcgb3IgT2JqZWN0LCB0aGVuIHRocm93IGFcbiAgICAgICAgICAgIC8vICAgICBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICAgICAgaWYgKGtWYWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2Yga1ZhbHVlICE9PSAnc3RyaW5nJyAmJiAodHlwZW9mIGtWYWx1ZSA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBiYWJlbEhlbHBlcnMkMVtcInR5cGVvZlwiXShrVmFsdWUpKSAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0cmluZyBvciBPYmplY3QgdHlwZSBleHBlY3RlZCcpO1xuXG4gICAgICAgICAgICAvLyBpaWkuIExldCB0YWcgYmUgVG9TdHJpbmcoa1ZhbHVlKS5cbiAgICAgICAgICAgIHZhciB0YWcgPSBTdHJpbmcoa1ZhbHVlKTtcblxuICAgICAgICAgICAgLy8gaXYuIElmIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgICAgICAgICAvLyAgICAgSXNTdHJ1Y3R1cmFsbHlWYWxpZExhbmd1YWdlVGFnIChkZWZpbmVkIGluIDYuMi4yKSwgcGFzc2luZyB0YWcgYXNcbiAgICAgICAgICAgIC8vICAgICB0aGUgYXJndW1lbnQsIGlzIGZhbHNlLCB0aGVuIHRocm93IGEgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gICAgICAgICAgICBpZiAoIUlzU3RydWN0dXJhbGx5VmFsaWRMYW5ndWFnZVRhZyh0YWcpKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIidcIiArIHRhZyArIFwiJyBpcyBub3QgYSBzdHJ1Y3R1cmFsbHkgdmFsaWQgbGFuZ3VhZ2UgdGFnXCIpO1xuXG4gICAgICAgICAgICAvLyB2LiBMZXQgdGFnIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgICAgICAgICAvLyAgICBDYW5vbmljYWxpemVMYW5ndWFnZVRhZyAoZGVmaW5lZCBpbiA2LjIuMyksIHBhc3NpbmcgdGFnIGFzIHRoZVxuICAgICAgICAgICAgLy8gICAgYXJndW1lbnQuXG4gICAgICAgICAgICB0YWcgPSBDYW5vbmljYWxpemVMYW5ndWFnZVRhZyh0YWcpO1xuXG4gICAgICAgICAgICAvLyB2aS4gSWYgdGFnIGlzIG5vdCBhbiBlbGVtZW50IG9mIHNlZW4sIHRoZW4gYXBwZW5kIHRhZyBhcyB0aGUgbGFzdFxuICAgICAgICAgICAgLy8gICAgIGVsZW1lbnQgb2Ygc2Vlbi5cbiAgICAgICAgICAgIGlmIChhcnJJbmRleE9mLmNhbGwoc2VlbiwgdGFnKSA9PT0gLTEpIGFyclB1c2guY2FsbChzZWVuLCB0YWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZC4gSW5jcmVhc2UgayBieSAxLlxuICAgICAgICBrKys7XG4gICAgfVxuXG4gICAgLy8gOS4gUmV0dXJuIHNlZW4uXG4gICAgcmV0dXJuIHNlZW47XG59XG5cbi8qKlxuICogVGhlIEJlc3RBdmFpbGFibGVMb2NhbGUgYWJzdHJhY3Qgb3BlcmF0aW9uIGNvbXBhcmVzIHRoZSBwcm92aWRlZCBhcmd1bWVudFxuICogbG9jYWxlLCB3aGljaCBtdXN0IGJlIGEgU3RyaW5nIHZhbHVlIHdpdGggYSBzdHJ1Y3R1cmFsbHkgdmFsaWQgYW5kXG4gKiBjYW5vbmljYWxpemVkIEJDUCA0NyBsYW5ndWFnZSB0YWcsIGFnYWluc3QgdGhlIGxvY2FsZXMgaW4gYXZhaWxhYmxlTG9jYWxlcyBhbmRcbiAqIHJldHVybnMgZWl0aGVyIHRoZSBsb25nZXN0IG5vbi1lbXB0eSBwcmVmaXggb2YgbG9jYWxlIHRoYXQgaXMgYW4gZWxlbWVudCBvZlxuICogYXZhaWxhYmxlTG9jYWxlcywgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIHN1Y2ggZWxlbWVudC4gSXQgdXNlcyB0aGVcbiAqIGZhbGxiYWNrIG1lY2hhbmlzbSBvZiBSRkMgNDY0Nywgc2VjdGlvbiAzLjQuIFRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG5mdW5jdGlvbiAvKiA5LjIuMiAqL0Jlc3RBdmFpbGFibGVMb2NhbGUoYXZhaWxhYmxlTG9jYWxlcywgbG9jYWxlKSB7XG4gICAgLy8gMS4gTGV0IGNhbmRpZGF0ZSBiZSBsb2NhbGVcbiAgICB2YXIgY2FuZGlkYXRlID0gbG9jYWxlO1xuXG4gICAgLy8gMi4gUmVwZWF0XG4gICAgd2hpbGUgKGNhbmRpZGF0ZSkge1xuICAgICAgICAvLyBhLiBJZiBhdmFpbGFibGVMb2NhbGVzIGNvbnRhaW5zIGFuIGVsZW1lbnQgZXF1YWwgdG8gY2FuZGlkYXRlLCB0aGVuIHJldHVyblxuICAgICAgICAvLyBjYW5kaWRhdGUuXG4gICAgICAgIGlmIChhcnJJbmRleE9mLmNhbGwoYXZhaWxhYmxlTG9jYWxlcywgY2FuZGlkYXRlKSA+IC0xKSByZXR1cm4gY2FuZGlkYXRlO1xuXG4gICAgICAgIC8vIGIuIExldCBwb3MgYmUgdGhlIGNoYXJhY3RlciBpbmRleCBvZiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIFwiLVwiXG4gICAgICAgIC8vIChVKzAwMkQpIHdpdGhpbiBjYW5kaWRhdGUuIElmIHRoYXQgY2hhcmFjdGVyIGRvZXMgbm90IG9jY3VyLCByZXR1cm5cbiAgICAgICAgLy8gdW5kZWZpbmVkLlxuICAgICAgICB2YXIgcG9zID0gY2FuZGlkYXRlLmxhc3RJbmRleE9mKCctJyk7XG5cbiAgICAgICAgaWYgKHBvcyA8IDApIHJldHVybjtcblxuICAgICAgICAvLyBjLiBJZiBwb3Mg4omlIDIgYW5kIHRoZSBjaGFyYWN0ZXIgXCItXCIgb2NjdXJzIGF0IGluZGV4IHBvcy0yIG9mIGNhbmRpZGF0ZSxcbiAgICAgICAgLy8gICAgdGhlbiBkZWNyZWFzZSBwb3MgYnkgMi5cbiAgICAgICAgaWYgKHBvcyA+PSAyICYmIGNhbmRpZGF0ZS5jaGFyQXQocG9zIC0gMikgPT09ICctJykgcG9zIC09IDI7XG5cbiAgICAgICAgLy8gZC4gTGV0IGNhbmRpZGF0ZSBiZSB0aGUgc3Vic3RyaW5nIG9mIGNhbmRpZGF0ZSBmcm9tIHBvc2l0aW9uIDAsIGluY2x1c2l2ZSxcbiAgICAgICAgLy8gICAgdG8gcG9zaXRpb24gcG9zLCBleGNsdXNpdmUuXG4gICAgICAgIGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIExvb2t1cE1hdGNoZXIgYWJzdHJhY3Qgb3BlcmF0aW9uIGNvbXBhcmVzIHJlcXVlc3RlZExvY2FsZXMsIHdoaWNoIG11c3QgYmVcbiAqIGEgTGlzdCBhcyByZXR1cm5lZCBieSBDYW5vbmljYWxpemVMb2NhbGVMaXN0LCBhZ2FpbnN0IHRoZSBsb2NhbGVzIGluXG4gKiBhdmFpbGFibGVMb2NhbGVzIGFuZCBkZXRlcm1pbmVzIHRoZSBiZXN0IGF2YWlsYWJsZSBsYW5ndWFnZSB0byBtZWV0IHRoZVxuICogcmVxdWVzdC4gVGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbmZ1bmN0aW9uIC8qIDkuMi4zICovTG9va3VwTWF0Y2hlcihhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKSB7XG4gICAgLy8gMS4gTGV0IGkgYmUgMC5cbiAgICB2YXIgaSA9IDA7XG5cbiAgICAvLyAyLiBMZXQgbGVuIGJlIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gcmVxdWVzdGVkTG9jYWxlcy5cbiAgICB2YXIgbGVuID0gcmVxdWVzdGVkTG9jYWxlcy5sZW5ndGg7XG5cbiAgICAvLyAzLiBMZXQgYXZhaWxhYmxlTG9jYWxlIGJlIHVuZGVmaW5lZC5cbiAgICB2YXIgYXZhaWxhYmxlTG9jYWxlID0gdm9pZCAwO1xuXG4gICAgdmFyIGxvY2FsZSA9IHZvaWQgMCxcbiAgICAgICAgbm9FeHRlbnNpb25zTG9jYWxlID0gdm9pZCAwO1xuXG4gICAgLy8gNC4gUmVwZWF0IHdoaWxlIGkgPCBsZW4gYW5kIGF2YWlsYWJsZUxvY2FsZSBpcyB1bmRlZmluZWQ6XG4gICAgd2hpbGUgKGkgPCBsZW4gJiYgIWF2YWlsYWJsZUxvY2FsZSkge1xuICAgICAgICAvLyBhLiBMZXQgbG9jYWxlIGJlIHRoZSBlbGVtZW50IG9mIHJlcXVlc3RlZExvY2FsZXMgYXQgMC1vcmlnaW5lZCBsaXN0XG4gICAgICAgIC8vICAgIHBvc2l0aW9uIGkuXG4gICAgICAgIGxvY2FsZSA9IHJlcXVlc3RlZExvY2FsZXNbaV07XG5cbiAgICAgICAgLy8gYi4gTGV0IG5vRXh0ZW5zaW9uc0xvY2FsZSBiZSB0aGUgU3RyaW5nIHZhbHVlIHRoYXQgaXMgbG9jYWxlIHdpdGggYWxsXG4gICAgICAgIC8vICAgIFVuaWNvZGUgbG9jYWxlIGV4dGVuc2lvbiBzZXF1ZW5jZXMgcmVtb3ZlZC5cbiAgICAgICAgbm9FeHRlbnNpb25zTG9jYWxlID0gU3RyaW5nKGxvY2FsZSkucmVwbGFjZShleHBVbmljb2RlRXhTZXEsICcnKTtcblxuICAgICAgICAvLyBjLiBMZXQgYXZhaWxhYmxlTG9jYWxlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGVcbiAgICAgICAgLy8gICAgQmVzdEF2YWlsYWJsZUxvY2FsZSBhYnN0cmFjdCBvcGVyYXRpb24gKGRlZmluZWQgaW4gOS4yLjIpIHdpdGhcbiAgICAgICAgLy8gICAgYXJndW1lbnRzIGF2YWlsYWJsZUxvY2FsZXMgYW5kIG5vRXh0ZW5zaW9uc0xvY2FsZS5cbiAgICAgICAgYXZhaWxhYmxlTG9jYWxlID0gQmVzdEF2YWlsYWJsZUxvY2FsZShhdmFpbGFibGVMb2NhbGVzLCBub0V4dGVuc2lvbnNMb2NhbGUpO1xuXG4gICAgICAgIC8vIGQuIEluY3JlYXNlIGkgYnkgMS5cbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vIDUuIExldCByZXN1bHQgYmUgYSBuZXcgUmVjb3JkLlxuICAgIHZhciByZXN1bHQgPSBuZXcgUmVjb3JkKCk7XG5cbiAgICAvLyA2LiBJZiBhdmFpbGFibGVMb2NhbGUgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmIChhdmFpbGFibGVMb2NhbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBhLiBTZXQgcmVzdWx0LltbbG9jYWxlXV0gdG8gYXZhaWxhYmxlTG9jYWxlLlxuICAgICAgICByZXN1bHRbJ1tbbG9jYWxlXV0nXSA9IGF2YWlsYWJsZUxvY2FsZTtcblxuICAgICAgICAvLyBiLiBJZiBsb2NhbGUgYW5kIG5vRXh0ZW5zaW9uc0xvY2FsZSBhcmUgbm90IHRoZSBzYW1lIFN0cmluZyB2YWx1ZSwgdGhlblxuICAgICAgICBpZiAoU3RyaW5nKGxvY2FsZSkgIT09IFN0cmluZyhub0V4dGVuc2lvbnNMb2NhbGUpKSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQgZXh0ZW5zaW9uIGJlIHRoZSBTdHJpbmcgdmFsdWUgY29uc2lzdGluZyBvZiB0aGUgZmlyc3RcbiAgICAgICAgICAgIC8vICAgIHN1YnN0cmluZyBvZiBsb2NhbGUgdGhhdCBpcyBhIFVuaWNvZGUgbG9jYWxlIGV4dGVuc2lvbiBzZXF1ZW5jZS5cbiAgICAgICAgICAgIHZhciBleHRlbnNpb24gPSBsb2NhbGUubWF0Y2goZXhwVW5pY29kZUV4U2VxKVswXTtcblxuICAgICAgICAgICAgLy8gaWkuIExldCBleHRlbnNpb25JbmRleCBiZSB0aGUgY2hhcmFjdGVyIHBvc2l0aW9uIG9mIHRoZSBpbml0aWFsXG4gICAgICAgICAgICAvLyAgICAgXCItXCIgb2YgdGhlIGZpcnN0IFVuaWNvZGUgbG9jYWxlIGV4dGVuc2lvbiBzZXF1ZW5jZSB3aXRoaW4gbG9jYWxlLlxuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbkluZGV4ID0gbG9jYWxlLmluZGV4T2YoJy11LScpO1xuXG4gICAgICAgICAgICAvLyBpaWkuIFNldCByZXN1bHQuW1tleHRlbnNpb25dXSB0byBleHRlbnNpb24uXG4gICAgICAgICAgICByZXN1bHRbJ1tbZXh0ZW5zaW9uXV0nXSA9IGV4dGVuc2lvbjtcblxuICAgICAgICAgICAgLy8gaXYuIFNldCByZXN1bHQuW1tleHRlbnNpb25JbmRleF1dIHRvIGV4dGVuc2lvbkluZGV4LlxuICAgICAgICAgICAgcmVzdWx0WydbW2V4dGVuc2lvbkluZGV4XV0nXSA9IGV4dGVuc2lvbkluZGV4O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIDcuIEVsc2VcbiAgICBlbHNlXG4gICAgICAgIC8vIGEuIFNldCByZXN1bHQuW1tsb2NhbGVdXSB0byB0aGUgdmFsdWUgcmV0dXJuZWQgYnkgdGhlIERlZmF1bHRMb2NhbGUgYWJzdHJhY3RcbiAgICAgICAgLy8gICAgb3BlcmF0aW9uIChkZWZpbmVkIGluIDYuMi40KS5cbiAgICAgICAgcmVzdWx0WydbW2xvY2FsZV1dJ10gPSBEZWZhdWx0TG9jYWxlKCk7XG5cbiAgICAvLyA4LiBSZXR1cm4gcmVzdWx0XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUaGUgQmVzdEZpdE1hdGNoZXIgYWJzdHJhY3Qgb3BlcmF0aW9uIGNvbXBhcmVzIHJlcXVlc3RlZExvY2FsZXMsIHdoaWNoIG11c3QgYmVcbiAqIGEgTGlzdCBhcyByZXR1cm5lZCBieSBDYW5vbmljYWxpemVMb2NhbGVMaXN0LCBhZ2FpbnN0IHRoZSBsb2NhbGVzIGluXG4gKiBhdmFpbGFibGVMb2NhbGVzIGFuZCBkZXRlcm1pbmVzIHRoZSBiZXN0IGF2YWlsYWJsZSBsYW5ndWFnZSB0byBtZWV0IHRoZVxuICogcmVxdWVzdC4gVGhlIGFsZ29yaXRobSBpcyBpbXBsZW1lbnRhdGlvbiBkZXBlbmRlbnQsIGJ1dCBzaG91bGQgcHJvZHVjZSByZXN1bHRzXG4gKiB0aGF0IGEgdHlwaWNhbCB1c2VyIG9mIHRoZSByZXF1ZXN0ZWQgbG9jYWxlcyB3b3VsZCBwZXJjZWl2ZSBhcyBhdCBsZWFzdCBhc1xuICogZ29vZCBhcyB0aG9zZSBwcm9kdWNlZCBieSB0aGUgTG9va3VwTWF0Y2hlciBhYnN0cmFjdCBvcGVyYXRpb24uIE9wdGlvbnNcbiAqIHNwZWNpZmllZCB0aHJvdWdoIFVuaWNvZGUgbG9jYWxlIGV4dGVuc2lvbiBzZXF1ZW5jZXMgbXVzdCBiZSBpZ25vcmVkIGJ5IHRoZVxuICogYWxnb3JpdGhtLiBJbmZvcm1hdGlvbiBhYm91dCBzdWNoIHN1YnNlcXVlbmNlcyBpcyByZXR1cm5lZCBzZXBhcmF0ZWx5LlxuICogVGhlIGFic3RyYWN0IG9wZXJhdGlvbiByZXR1cm5zIGEgcmVjb3JkIHdpdGggYSBbW2xvY2FsZV1dIGZpZWxkLCB3aG9zZSB2YWx1ZVxuICogaXMgdGhlIGxhbmd1YWdlIHRhZyBvZiB0aGUgc2VsZWN0ZWQgbG9jYWxlLCB3aGljaCBtdXN0IGJlIGFuIGVsZW1lbnQgb2ZcbiAqIGF2YWlsYWJsZUxvY2FsZXMuIElmIHRoZSBsYW5ndWFnZSB0YWcgb2YgdGhlIHJlcXVlc3QgbG9jYWxlIHRoYXQgbGVkIHRvIHRoZVxuICogc2VsZWN0ZWQgbG9jYWxlIGNvbnRhaW5lZCBhIFVuaWNvZGUgbG9jYWxlIGV4dGVuc2lvbiBzZXF1ZW5jZSwgdGhlbiB0aGVcbiAqIHJldHVybmVkIHJlY29yZCBhbHNvIGNvbnRhaW5zIGFuIFtbZXh0ZW5zaW9uXV0gZmllbGQgd2hvc2UgdmFsdWUgaXMgdGhlIGZpcnN0XG4gKiBVbmljb2RlIGxvY2FsZSBleHRlbnNpb24gc2VxdWVuY2UsIGFuZCBhbiBbW2V4dGVuc2lvbkluZGV4XV0gZmllbGQgd2hvc2UgdmFsdWVcbiAqIGlzIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgVW5pY29kZSBsb2NhbGUgZXh0ZW5zaW9uIHNlcXVlbmNlIHdpdGhpbiB0aGUgcmVxdWVzdFxuICogbG9jYWxlIGxhbmd1YWdlIHRhZy5cbiAqL1xuZnVuY3Rpb24gLyogOS4yLjQgKi9CZXN0Rml0TWF0Y2hlcihhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKSB7XG4gICAgcmV0dXJuIExvb2t1cE1hdGNoZXIoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcyk7XG59XG5cbi8qKlxuICogVGhlIFJlc29sdmVMb2NhbGUgYWJzdHJhY3Qgb3BlcmF0aW9uIGNvbXBhcmVzIGEgQkNQIDQ3IGxhbmd1YWdlIHByaW9yaXR5IGxpc3RcbiAqIHJlcXVlc3RlZExvY2FsZXMgYWdhaW5zdCB0aGUgbG9jYWxlcyBpbiBhdmFpbGFibGVMb2NhbGVzIGFuZCBkZXRlcm1pbmVzIHRoZVxuICogYmVzdCBhdmFpbGFibGUgbGFuZ3VhZ2UgdG8gbWVldCB0aGUgcmVxdWVzdC4gYXZhaWxhYmxlTG9jYWxlcyBhbmRcbiAqIHJlcXVlc3RlZExvY2FsZXMgbXVzdCBiZSBwcm92aWRlZCBhcyBMaXN0IHZhbHVlcywgb3B0aW9ucyBhcyBhIFJlY29yZC5cbiAqL1xuZnVuY3Rpb24gLyogOS4yLjUgKi9SZXNvbHZlTG9jYWxlKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMsIG9wdGlvbnMsIHJlbGV2YW50RXh0ZW5zaW9uS2V5cywgbG9jYWxlRGF0YSkge1xuICAgIGlmIChhdmFpbGFibGVMb2NhbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ05vIGxvY2FsZSBkYXRhIGhhcyBiZWVuIHByb3ZpZGVkIGZvciB0aGlzIG9iamVjdCB5ZXQuJyk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gICAgLy8gMS4gTGV0IG1hdGNoZXIgYmUgdGhlIHZhbHVlIG9mIG9wdGlvbnMuW1tsb2NhbGVNYXRjaGVyXV0uXG4gICAgdmFyIG1hdGNoZXIgPSBvcHRpb25zWydbW2xvY2FsZU1hdGNoZXJdXSddO1xuXG4gICAgdmFyIHIgPSB2b2lkIDA7XG5cbiAgICAvLyAyLiBJZiBtYXRjaGVyIGlzIFwibG9va3VwXCIsIHRoZW5cbiAgICBpZiAobWF0Y2hlciA9PT0gJ2xvb2t1cCcpXG4gICAgICAgIC8vIGEuIExldCByIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgTG9va3VwTWF0Y2hlciBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAgICAgLy8gICAgKGRlZmluZWQgaW4gOS4yLjMpIHdpdGggYXJndW1lbnRzIGF2YWlsYWJsZUxvY2FsZXMgYW5kXG4gICAgICAgIC8vICAgIHJlcXVlc3RlZExvY2FsZXMuXG4gICAgICAgIHIgPSBMb29rdXBNYXRjaGVyKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMpO1xuXG4gICAgICAgIC8vIDMuIEVsc2VcbiAgICBlbHNlXG4gICAgICAgIC8vIGEuIExldCByIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQmVzdEZpdE1hdGNoZXIgYWJzdHJhY3RcbiAgICAgICAgLy8gICAgb3BlcmF0aW9uIChkZWZpbmVkIGluIDkuMi40KSB3aXRoIGFyZ3VtZW50cyBhdmFpbGFibGVMb2NhbGVzIGFuZFxuICAgICAgICAvLyAgICByZXF1ZXN0ZWRMb2NhbGVzLlxuICAgICAgICByID0gQmVzdEZpdE1hdGNoZXIoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcyk7XG5cbiAgICAvLyA0LiBMZXQgZm91bmRMb2NhbGUgYmUgdGhlIHZhbHVlIG9mIHIuW1tsb2NhbGVdXS5cbiAgICB2YXIgZm91bmRMb2NhbGUgPSByWydbW2xvY2FsZV1dJ107XG5cbiAgICB2YXIgZXh0ZW5zaW9uU3VidGFncyA9IHZvaWQgMCxcbiAgICAgICAgZXh0ZW5zaW9uU3VidGFnc0xlbmd0aCA9IHZvaWQgMDtcblxuICAgIC8vIDUuIElmIHIgaGFzIGFuIFtbZXh0ZW5zaW9uXV0gZmllbGQsIHRoZW5cbiAgICBpZiAoaG9wLmNhbGwociwgJ1tbZXh0ZW5zaW9uXV0nKSkge1xuICAgICAgICAvLyBhLiBMZXQgZXh0ZW5zaW9uIGJlIHRoZSB2YWx1ZSBvZiByLltbZXh0ZW5zaW9uXV0uXG4gICAgICAgIHZhciBleHRlbnNpb24gPSByWydbW2V4dGVuc2lvbl1dJ107XG4gICAgICAgIC8vIGIuIExldCBzcGxpdCBiZSB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gZnVuY3Rpb24gb2JqZWN0IGRlZmluZWQgaW4gRVM1LFxuICAgICAgICAvLyAgICAxNS41LjQuMTQuXG4gICAgICAgIHZhciBzcGxpdCA9IFN0cmluZy5wcm90b3R5cGUuc3BsaXQ7XG4gICAgICAgIC8vIGMuIExldCBleHRlbnNpb25TdWJ0YWdzIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDYWxsXV0gaW50ZXJuYWxcbiAgICAgICAgLy8gICAgbWV0aG9kIG9mIHNwbGl0IHdpdGggZXh0ZW5zaW9uIGFzIHRoZSB0aGlzIHZhbHVlIGFuZCBhbiBhcmd1bWVudFxuICAgICAgICAvLyAgICBsaXN0IGNvbnRhaW5pbmcgdGhlIHNpbmdsZSBpdGVtIFwiLVwiLlxuICAgICAgICBleHRlbnNpb25TdWJ0YWdzID0gc3BsaXQuY2FsbChleHRlbnNpb24sICctJyk7XG4gICAgICAgIC8vIGQuIExldCBleHRlbnNpb25TdWJ0YWdzTGVuZ3RoIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXVxuICAgICAgICAvLyAgICBpbnRlcm5hbCBtZXRob2Qgb2YgZXh0ZW5zaW9uU3VidGFncyB3aXRoIGFyZ3VtZW50IFwibGVuZ3RoXCIuXG4gICAgICAgIGV4dGVuc2lvblN1YnRhZ3NMZW5ndGggPSBleHRlbnNpb25TdWJ0YWdzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyA2LiBMZXQgcmVzdWx0IGJlIGEgbmV3IFJlY29yZC5cbiAgICB2YXIgcmVzdWx0ID0gbmV3IFJlY29yZCgpO1xuXG4gICAgLy8gNy4gU2V0IHJlc3VsdC5bW2RhdGFMb2NhbGVdXSB0byBmb3VuZExvY2FsZS5cbiAgICByZXN1bHRbJ1tbZGF0YUxvY2FsZV1dJ10gPSBmb3VuZExvY2FsZTtcblxuICAgIC8vIDguIExldCBzdXBwb3J0ZWRFeHRlbnNpb24gYmUgXCItdVwiLlxuICAgIHZhciBzdXBwb3J0ZWRFeHRlbnNpb24gPSAnLXUnO1xuICAgIC8vIDkuIExldCBpIGJlIDAuXG4gICAgdmFyIGkgPSAwO1xuICAgIC8vIDEwLiBMZXQgbGVuIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAvLyAgICAgcmVsZXZhbnRFeHRlbnNpb25LZXlzIHdpdGggYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICB2YXIgbGVuID0gcmVsZXZhbnRFeHRlbnNpb25LZXlzLmxlbmd0aDtcblxuICAgIC8vIDExIFJlcGVhdCB3aGlsZSBpIDwgbGVuOlxuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICAgIC8vIGEuIExldCBrZXkgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgICAgICAvLyAgICByZWxldmFudEV4dGVuc2lvbktleXMgd2l0aCBhcmd1bWVudCBUb1N0cmluZyhpKS5cbiAgICAgICAgdmFyIGtleSA9IHJlbGV2YW50RXh0ZW5zaW9uS2V5c1tpXTtcbiAgICAgICAgLy8gYi4gTGV0IGZvdW5kTG9jYWxlRGF0YSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWxcbiAgICAgICAgLy8gICAgbWV0aG9kIG9mIGxvY2FsZURhdGEgd2l0aCB0aGUgYXJndW1lbnQgZm91bmRMb2NhbGUuXG4gICAgICAgIHZhciBmb3VuZExvY2FsZURhdGEgPSBsb2NhbGVEYXRhW2ZvdW5kTG9jYWxlXTtcbiAgICAgICAgLy8gYy4gTGV0IGtleUxvY2FsZURhdGEgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsXG4gICAgICAgIC8vICAgIG1ldGhvZCBvZiBmb3VuZExvY2FsZURhdGEgd2l0aCB0aGUgYXJndW1lbnQga2V5LlxuICAgICAgICB2YXIga2V5TG9jYWxlRGF0YSA9IGZvdW5kTG9jYWxlRGF0YVtrZXldO1xuICAgICAgICAvLyBkLiBMZXQgdmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgICAgICAvLyAgICBrZXlMb2NhbGVEYXRhIHdpdGggYXJndW1lbnQgXCIwXCIuXG4gICAgICAgIHZhciB2YWx1ZSA9IGtleUxvY2FsZURhdGFbJzAnXTtcbiAgICAgICAgLy8gZS4gTGV0IHN1cHBvcnRlZEV4dGVuc2lvbkFkZGl0aW9uIGJlIFwiXCIuXG4gICAgICAgIHZhciBzdXBwb3J0ZWRFeHRlbnNpb25BZGRpdGlvbiA9ICcnO1xuICAgICAgICAvLyBmLiBMZXQgaW5kZXhPZiBiZSB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gZnVuY3Rpb24gb2JqZWN0IGRlZmluZWQgaW5cbiAgICAgICAgLy8gICAgRVM1LCAxNS40LjQuMTQuXG4gICAgICAgIHZhciBpbmRleE9mID0gYXJySW5kZXhPZjtcblxuICAgICAgICAvLyBnLiBJZiBleHRlbnNpb25TdWJ0YWdzIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICAgICAgaWYgKGV4dGVuc2lvblN1YnRhZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gaS4gTGV0IGtleVBvcyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ2FsbF1dIGludGVybmFsXG4gICAgICAgICAgICAvLyAgICBtZXRob2Qgb2YgaW5kZXhPZiB3aXRoIGV4dGVuc2lvblN1YnRhZ3MgYXMgdGhlIHRoaXMgdmFsdWUgYW5kXG4gICAgICAgICAgICAvLyBhbiBhcmd1bWVudCBsaXN0IGNvbnRhaW5pbmcgdGhlIHNpbmdsZSBpdGVtIGtleS5cbiAgICAgICAgICAgIHZhciBrZXlQb3MgPSBpbmRleE9mLmNhbGwoZXh0ZW5zaW9uU3VidGFncywga2V5KTtcblxuICAgICAgICAgICAgLy8gaWkuIElmIGtleVBvcyDiiaAgLTEsIHRoZW5cbiAgICAgICAgICAgIGlmIChrZXlQb3MgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gMS4gSWYga2V5UG9zICsgMSA8IGV4dGVuc2lvblN1YnRhZ3NMZW5ndGggYW5kIHRoZSBsZW5ndGggb2YgdGhlXG4gICAgICAgICAgICAgICAgLy8gICAgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgICAgICAgICAgICAgLy8gICAgZXh0ZW5zaW9uU3VidGFncyB3aXRoIGFyZ3VtZW50IFRvU3RyaW5nKGtleVBvcyArMSkgaXMgZ3JlYXRlclxuICAgICAgICAgICAgICAgIC8vICAgIHRoYW4gMiwgdGhlblxuICAgICAgICAgICAgICAgIGlmIChrZXlQb3MgKyAxIDwgZXh0ZW5zaW9uU3VidGFnc0xlbmd0aCAmJiBleHRlbnNpb25TdWJ0YWdzW2tleVBvcyArIDFdLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IHJlcXVlc3RlZFZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXVxuICAgICAgICAgICAgICAgICAgICAvLyAgICBpbnRlcm5hbCBtZXRob2Qgb2YgZXh0ZW5zaW9uU3VidGFncyB3aXRoIGFyZ3VtZW50XG4gICAgICAgICAgICAgICAgICAgIC8vICAgIFRvU3RyaW5nKGtleVBvcyArIDEpLlxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdGVkVmFsdWUgPSBleHRlbnNpb25TdWJ0YWdzW2tleVBvcyArIDFdO1xuICAgICAgICAgICAgICAgICAgICAvLyBiLiBMZXQgdmFsdWVQb3MgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NhbGxdXVxuICAgICAgICAgICAgICAgICAgICAvLyAgICBpbnRlcm5hbCBtZXRob2Qgb2YgaW5kZXhPZiB3aXRoIGtleUxvY2FsZURhdGEgYXMgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIHRoaXMgdmFsdWUgYW5kIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGl0ZW0gcmVxdWVzdGVkVmFsdWUuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZVBvcyA9IGluZGV4T2YuY2FsbChrZXlMb2NhbGVEYXRhLCByZXF1ZXN0ZWRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYy4gSWYgdmFsdWVQb3Mg4omgIC0xLCB0aGVuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZVBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCB2YWx1ZSBiZSByZXF1ZXN0ZWRWYWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcmVxdWVzdGVkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpaS4gTGV0IHN1cHBvcnRlZEV4dGVuc2lvbkFkZGl0aW9uIGJlIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGNvbmNhdGVuYXRpb24gb2YgXCItXCIsIGtleSwgXCItXCIsIGFuZCB2YWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRlZEV4dGVuc2lvbkFkZGl0aW9uID0gJy0nICsga2V5ICsgJy0nICsgdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gMi4gRWxzZVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IHZhbHVlUG9zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDYWxsXV1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGludGVybmFsIG1ldGhvZCBvZiBpbmRleE9mIHdpdGgga2V5TG9jYWxlRGF0YSBhcyB0aGUgdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdmFsdWUgYW5kIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwidHJ1ZVwiLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF92YWx1ZVBvcyA9IGluZGV4T2Yoa2V5TG9jYWxlRGF0YSwgJ3RydWUnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYi4gSWYgdmFsdWVQb3Mg4omgIC0xLCB0aGVuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3ZhbHVlUG9zICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpLiBMZXQgdmFsdWUgYmUgXCJ0cnVlXCIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAndHJ1ZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBoLiBJZiBvcHRpb25zIGhhcyBhIGZpZWxkIFtbPGtleT5dXSwgdGhlblxuICAgICAgICBpZiAoaG9wLmNhbGwob3B0aW9ucywgJ1tbJyArIGtleSArICddXScpKSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQgb3B0aW9uc1ZhbHVlIGJlIHRoZSB2YWx1ZSBvZiBvcHRpb25zLltbPGtleT5dXS5cbiAgICAgICAgICAgIHZhciBvcHRpb25zVmFsdWUgPSBvcHRpb25zWydbWycgKyBrZXkgKyAnXV0nXTtcblxuICAgICAgICAgICAgLy8gaWkuIElmIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDYWxsXV0gaW50ZXJuYWwgbWV0aG9kIG9mIGluZGV4T2ZcbiAgICAgICAgICAgIC8vICAgICB3aXRoIGtleUxvY2FsZURhdGEgYXMgdGhlIHRoaXMgdmFsdWUgYW5kIGFuIGFyZ3VtZW50IGxpc3RcbiAgICAgICAgICAgIC8vICAgICBjb250YWluaW5nIHRoZSBzaW5nbGUgaXRlbSBvcHRpb25zVmFsdWUgaXMgbm90IC0xLCB0aGVuXG4gICAgICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKGtleUxvY2FsZURhdGEsIG9wdGlvbnNWYWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gMS4gSWYgb3B0aW9uc1ZhbHVlIGlzIG5vdCBlcXVhbCB0byB2YWx1ZSwgdGhlblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zVmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCB2YWx1ZSBiZSBvcHRpb25zVmFsdWUuXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gb3B0aW9uc1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBiLiBMZXQgc3VwcG9ydGVkRXh0ZW5zaW9uQWRkaXRpb24gYmUgXCJcIi5cbiAgICAgICAgICAgICAgICAgICAgc3VwcG9ydGVkRXh0ZW5zaW9uQWRkaXRpb24gPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gaS4gU2V0IHJlc3VsdC5bWzxrZXk+XV0gdG8gdmFsdWUuXG4gICAgICAgIHJlc3VsdFsnW1snICsga2V5ICsgJ11dJ10gPSB2YWx1ZTtcblxuICAgICAgICAvLyBqLiBBcHBlbmQgc3VwcG9ydGVkRXh0ZW5zaW9uQWRkaXRpb24gdG8gc3VwcG9ydGVkRXh0ZW5zaW9uLlxuICAgICAgICBzdXBwb3J0ZWRFeHRlbnNpb24gKz0gc3VwcG9ydGVkRXh0ZW5zaW9uQWRkaXRpb247XG5cbiAgICAgICAgLy8gay4gSW5jcmVhc2UgaSBieSAxLlxuICAgICAgICBpKys7XG4gICAgfVxuICAgIC8vIDEyLiBJZiB0aGUgbGVuZ3RoIG9mIHN1cHBvcnRlZEV4dGVuc2lvbiBpcyBncmVhdGVyIHRoYW4gMiwgdGhlblxuICAgIGlmIChzdXBwb3J0ZWRFeHRlbnNpb24ubGVuZ3RoID4gMikge1xuICAgICAgICAvLyBhLlxuICAgICAgICB2YXIgcHJpdmF0ZUluZGV4ID0gZm91bmRMb2NhbGUuaW5kZXhPZihcIi14LVwiKTtcbiAgICAgICAgLy8gYi5cbiAgICAgICAgaWYgKHByaXZhdGVJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIGkuXG4gICAgICAgICAgICBmb3VuZExvY2FsZSA9IGZvdW5kTG9jYWxlICsgc3VwcG9ydGVkRXh0ZW5zaW9uO1xuICAgICAgICB9XG4gICAgICAgIC8vIGMuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGkuXG4gICAgICAgICAgICAgICAgdmFyIHByZUV4dGVuc2lvbiA9IGZvdW5kTG9jYWxlLnN1YnN0cmluZygwLCBwcml2YXRlSW5kZXgpO1xuICAgICAgICAgICAgICAgIC8vIGlpLlxuICAgICAgICAgICAgICAgIHZhciBwb3N0RXh0ZW5zaW9uID0gZm91bmRMb2NhbGUuc3Vic3RyaW5nKHByaXZhdGVJbmRleCk7XG4gICAgICAgICAgICAgICAgLy8gaWlpLlxuICAgICAgICAgICAgICAgIGZvdW5kTG9jYWxlID0gcHJlRXh0ZW5zaW9uICsgc3VwcG9ydGVkRXh0ZW5zaW9uICsgcG9zdEV4dGVuc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgLy8gZC4gYXNzZXJ0aW5nIC0gc2tpcHBpbmdcbiAgICAgICAgLy8gZS5cbiAgICAgICAgZm91bmRMb2NhbGUgPSBDYW5vbmljYWxpemVMYW5ndWFnZVRhZyhmb3VuZExvY2FsZSk7XG4gICAgfVxuICAgIC8vIDEzLiBTZXQgcmVzdWx0LltbbG9jYWxlXV0gdG8gZm91bmRMb2NhbGUuXG4gICAgcmVzdWx0WydbW2xvY2FsZV1dJ10gPSBmb3VuZExvY2FsZTtcblxuICAgIC8vIDE0LiBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhlIExvb2t1cFN1cHBvcnRlZExvY2FsZXMgYWJzdHJhY3Qgb3BlcmF0aW9uIHJldHVybnMgdGhlIHN1YnNldCBvZiB0aGVcbiAqIHByb3ZpZGVkIEJDUCA0NyBsYW5ndWFnZSBwcmlvcml0eSBsaXN0IHJlcXVlc3RlZExvY2FsZXMgZm9yIHdoaWNoXG4gKiBhdmFpbGFibGVMb2NhbGVzIGhhcyBhIG1hdGNoaW5nIGxvY2FsZSB3aGVuIHVzaW5nIHRoZSBCQ1AgNDcgTG9va3VwIGFsZ29yaXRobS5cbiAqIExvY2FsZXMgYXBwZWFyIGluIHRoZSBzYW1lIG9yZGVyIGluIHRoZSByZXR1cm5lZCBsaXN0IGFzIGluIHJlcXVlc3RlZExvY2FsZXMuXG4gKiBUaGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gLyogOS4yLjYgKi9Mb29rdXBTdXBwb3J0ZWRMb2NhbGVzKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMpIHtcbiAgICAvLyAxLiBMZXQgbGVuIGJlIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gcmVxdWVzdGVkTG9jYWxlcy5cbiAgICB2YXIgbGVuID0gcmVxdWVzdGVkTG9jYWxlcy5sZW5ndGg7XG4gICAgLy8gMi4gTGV0IHN1YnNldCBiZSBhIG5ldyBlbXB0eSBMaXN0LlxuICAgIHZhciBzdWJzZXQgPSBuZXcgTGlzdCgpO1xuICAgIC8vIDMuIExldCBrIGJlIDAuXG4gICAgdmFyIGsgPSAwO1xuXG4gICAgLy8gNC4gUmVwZWF0IHdoaWxlIGsgPCBsZW5cbiAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICAvLyBhLiBMZXQgbG9jYWxlIGJlIHRoZSBlbGVtZW50IG9mIHJlcXVlc3RlZExvY2FsZXMgYXQgMC1vcmlnaW5lZCBsaXN0XG4gICAgICAgIC8vICAgIHBvc2l0aW9uIGsuXG4gICAgICAgIHZhciBsb2NhbGUgPSByZXF1ZXN0ZWRMb2NhbGVzW2tdO1xuICAgICAgICAvLyBiLiBMZXQgbm9FeHRlbnNpb25zTG9jYWxlIGJlIHRoZSBTdHJpbmcgdmFsdWUgdGhhdCBpcyBsb2NhbGUgd2l0aCBhbGxcbiAgICAgICAgLy8gICAgVW5pY29kZSBsb2NhbGUgZXh0ZW5zaW9uIHNlcXVlbmNlcyByZW1vdmVkLlxuICAgICAgICB2YXIgbm9FeHRlbnNpb25zTG9jYWxlID0gU3RyaW5nKGxvY2FsZSkucmVwbGFjZShleHBVbmljb2RlRXhTZXEsICcnKTtcbiAgICAgICAgLy8gYy4gTGV0IGF2YWlsYWJsZUxvY2FsZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlXG4gICAgICAgIC8vICAgIEJlc3RBdmFpbGFibGVMb2NhbGUgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkIGluIDkuMi4yKSB3aXRoXG4gICAgICAgIC8vICAgIGFyZ3VtZW50cyBhdmFpbGFibGVMb2NhbGVzIGFuZCBub0V4dGVuc2lvbnNMb2NhbGUuXG4gICAgICAgIHZhciBhdmFpbGFibGVMb2NhbGUgPSBCZXN0QXZhaWxhYmxlTG9jYWxlKGF2YWlsYWJsZUxvY2FsZXMsIG5vRXh0ZW5zaW9uc0xvY2FsZSk7XG5cbiAgICAgICAgLy8gZC4gSWYgYXZhaWxhYmxlTG9jYWxlIGlzIG5vdCB1bmRlZmluZWQsIHRoZW4gYXBwZW5kIGxvY2FsZSB0byB0aGUgZW5kIG9mXG4gICAgICAgIC8vICAgIHN1YnNldC5cbiAgICAgICAgaWYgKGF2YWlsYWJsZUxvY2FsZSAhPT0gdW5kZWZpbmVkKSBhcnJQdXNoLmNhbGwoc3Vic2V0LCBsb2NhbGUpO1xuXG4gICAgICAgIC8vIGUuIEluY3JlbWVudCBrIGJ5IDEuXG4gICAgICAgIGsrKztcbiAgICB9XG5cbiAgICAvLyA1LiBMZXQgc3Vic2V0QXJyYXkgYmUgYSBuZXcgQXJyYXkgb2JqZWN0IHdob3NlIGVsZW1lbnRzIGFyZSB0aGUgc2FtZVxuICAgIC8vICAgIHZhbHVlcyBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGUgZWxlbWVudHMgb2Ygc3Vic2V0LlxuICAgIHZhciBzdWJzZXRBcnJheSA9IGFyclNsaWNlLmNhbGwoc3Vic2V0KTtcblxuICAgIC8vIDYuIFJldHVybiBzdWJzZXRBcnJheS5cbiAgICByZXR1cm4gc3Vic2V0QXJyYXk7XG59XG5cbi8qKlxuICogVGhlIEJlc3RGaXRTdXBwb3J0ZWRMb2NhbGVzIGFic3RyYWN0IG9wZXJhdGlvbiByZXR1cm5zIHRoZSBzdWJzZXQgb2YgdGhlXG4gKiBwcm92aWRlZCBCQ1AgNDcgbGFuZ3VhZ2UgcHJpb3JpdHkgbGlzdCByZXF1ZXN0ZWRMb2NhbGVzIGZvciB3aGljaFxuICogYXZhaWxhYmxlTG9jYWxlcyBoYXMgYSBtYXRjaGluZyBsb2NhbGUgd2hlbiB1c2luZyB0aGUgQmVzdCBGaXQgTWF0Y2hlclxuICogYWxnb3JpdGhtLiBMb2NhbGVzIGFwcGVhciBpbiB0aGUgc2FtZSBvcmRlciBpbiB0aGUgcmV0dXJuZWQgbGlzdCBhcyBpblxuICogcmVxdWVzdGVkTG9jYWxlcy4gVGhlIHN0ZXBzIHRha2VuIGFyZSBpbXBsZW1lbnRhdGlvbiBkZXBlbmRlbnQuXG4gKi9cbmZ1bmN0aW9uIC8qOS4yLjcgKi9CZXN0Rml0U3VwcG9ydGVkTG9jYWxlcyhhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKSB7XG4gICAgLy8gIyMjVE9ETzogaW1wbGVtZW50IHRoaXMgZnVuY3Rpb24gYXMgZGVzY3JpYmVkIGJ5IHRoZSBzcGVjaWZpY2F0aW9uIyMjXG4gICAgcmV0dXJuIExvb2t1cFN1cHBvcnRlZExvY2FsZXMoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcyk7XG59XG5cbi8qKlxuICogVGhlIFN1cHBvcnRlZExvY2FsZXMgYWJzdHJhY3Qgb3BlcmF0aW9uIHJldHVybnMgdGhlIHN1YnNldCBvZiB0aGUgcHJvdmlkZWQgQkNQXG4gKiA0NyBsYW5ndWFnZSBwcmlvcml0eSBsaXN0IHJlcXVlc3RlZExvY2FsZXMgZm9yIHdoaWNoIGF2YWlsYWJsZUxvY2FsZXMgaGFzIGFcbiAqIG1hdGNoaW5nIGxvY2FsZS4gVHdvIGFsZ29yaXRobXMgYXJlIGF2YWlsYWJsZSB0byBtYXRjaCB0aGUgbG9jYWxlczogdGhlIExvb2t1cFxuICogYWxnb3JpdGhtIGRlc2NyaWJlZCBpbiBSRkMgNDY0NyBzZWN0aW9uIDMuNCwgYW5kIGFuIGltcGxlbWVudGF0aW9uIGRlcGVuZGVudFxuICogYmVzdC1maXQgYWxnb3JpdGhtLiBMb2NhbGVzIGFwcGVhciBpbiB0aGUgc2FtZSBvcmRlciBpbiB0aGUgcmV0dXJuZWQgbGlzdCBhc1xuICogaW4gcmVxdWVzdGVkTG9jYWxlcy4gVGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbmZ1bmN0aW9uIC8qOS4yLjggKi9TdXBwb3J0ZWRMb2NhbGVzKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgbWF0Y2hlciA9IHZvaWQgMCxcbiAgICAgICAgc3Vic2V0ID0gdm9pZCAwO1xuXG4gICAgLy8gMS4gSWYgb3B0aW9ucyBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBhLiBMZXQgb3B0aW9ucyBiZSBUb09iamVjdChvcHRpb25zKS5cbiAgICAgICAgb3B0aW9ucyA9IG5ldyBSZWNvcmQodG9PYmplY3Qob3B0aW9ucykpO1xuICAgICAgICAvLyBiLiBMZXQgbWF0Y2hlciBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgICAgIC8vICAgIG9wdGlvbnMgd2l0aCBhcmd1bWVudCBcImxvY2FsZU1hdGNoZXJcIi5cbiAgICAgICAgbWF0Y2hlciA9IG9wdGlvbnMubG9jYWxlTWF0Y2hlcjtcblxuICAgICAgICAvLyBjLiBJZiBtYXRjaGVyIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICAgICAgaWYgKG1hdGNoZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gaS4gTGV0IG1hdGNoZXIgYmUgVG9TdHJpbmcobWF0Y2hlcikuXG4gICAgICAgICAgICBtYXRjaGVyID0gU3RyaW5nKG1hdGNoZXIpO1xuXG4gICAgICAgICAgICAvLyBpaS4gSWYgbWF0Y2hlciBpcyBub3QgXCJsb29rdXBcIiBvciBcImJlc3QgZml0XCIsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yXG4gICAgICAgICAgICAvLyAgICAgZXhjZXB0aW9uLlxuICAgICAgICAgICAgaWYgKG1hdGNoZXIgIT09ICdsb29rdXAnICYmIG1hdGNoZXIgIT09ICdiZXN0IGZpdCcpIHRocm93IG5ldyBSYW5nZUVycm9yKCdtYXRjaGVyIHNob3VsZCBiZSBcImxvb2t1cFwiIG9yIFwiYmVzdCBmaXRcIicpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIDIuIElmIG1hdGNoZXIgaXMgdW5kZWZpbmVkIG9yIFwiYmVzdCBmaXRcIiwgdGhlblxuICAgIGlmIChtYXRjaGVyID09PSB1bmRlZmluZWQgfHwgbWF0Y2hlciA9PT0gJ2Jlc3QgZml0JylcbiAgICAgICAgLy8gYS4gTGV0IHN1YnNldCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEJlc3RGaXRTdXBwb3J0ZWRMb2NhbGVzXG4gICAgICAgIC8vICAgIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBpbiA5LjIuNykgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgLy8gICAgYXZhaWxhYmxlTG9jYWxlcyBhbmQgcmVxdWVzdGVkTG9jYWxlcy5cbiAgICAgICAgc3Vic2V0ID0gQmVzdEZpdFN1cHBvcnRlZExvY2FsZXMoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcyk7XG4gICAgICAgIC8vIDMuIEVsc2VcbiAgICBlbHNlXG4gICAgICAgIC8vIGEuIExldCBzdWJzZXQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBMb29rdXBTdXBwb3J0ZWRMb2NhbGVzXG4gICAgICAgIC8vICAgIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBpbiA5LjIuNikgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgLy8gICAgYXZhaWxhYmxlTG9jYWxlcyBhbmQgcmVxdWVzdGVkTG9jYWxlcy5cbiAgICAgICAgc3Vic2V0ID0gTG9va3VwU3VwcG9ydGVkTG9jYWxlcyhhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKTtcblxuICAgIC8vIDQuIEZvciBlYWNoIG5hbWVkIG93biBwcm9wZXJ0eSBuYW1lIFAgb2Ygc3Vic2V0LFxuICAgIGZvciAodmFyIFAgaW4gc3Vic2V0KSB7XG4gICAgICAgIGlmICghaG9wLmNhbGwoc3Vic2V0LCBQKSkgY29udGludWU7XG5cbiAgICAgICAgLy8gYS4gTGV0IGRlc2MgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldE93blByb3BlcnR5XV0gaW50ZXJuYWxcbiAgICAgICAgLy8gICAgbWV0aG9kIG9mIHN1YnNldCB3aXRoIFAuXG4gICAgICAgIC8vIGIuIFNldCBkZXNjLltbV3JpdGFibGVdXSB0byBmYWxzZS5cbiAgICAgICAgLy8gYy4gU2V0IGRlc2MuW1tDb25maWd1cmFibGVdXSB0byBmYWxzZS5cbiAgICAgICAgLy8gZC4gQ2FsbCB0aGUgW1tEZWZpbmVPd25Qcm9wZXJ0eV1dIGludGVybmFsIG1ldGhvZCBvZiBzdWJzZXQgd2l0aCBQLCBkZXNjLFxuICAgICAgICAvLyAgICBhbmQgdHJ1ZSBhcyBhcmd1bWVudHMuXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHN1YnNldCwgUCwge1xuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLCBjb25maWd1cmFibGU6IGZhbHNlLCB2YWx1ZTogc3Vic2V0W1BdXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBcIkZyZWV6ZVwiIHRoZSBhcnJheSBzbyBubyBuZXcgZWxlbWVudHMgY2FuIGJlIGFkZGVkXG4gICAgZGVmaW5lUHJvcGVydHkoc3Vic2V0LCAnbGVuZ3RoJywgeyB3cml0YWJsZTogZmFsc2UgfSk7XG5cbiAgICAvLyA1LiBSZXR1cm4gc3Vic2V0XG4gICAgcmV0dXJuIHN1YnNldDtcbn1cblxuLyoqXG4gKiBUaGUgR2V0T3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvbiBleHRyYWN0cyB0aGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5IG5hbWVkXG4gKiBwcm9wZXJ0eSBmcm9tIHRoZSBwcm92aWRlZCBvcHRpb25zIG9iamVjdCwgY29udmVydHMgaXQgdG8gdGhlIHJlcXVpcmVkIHR5cGUsXG4gKiBjaGVja3Mgd2hldGhlciBpdCBpcyBvbmUgb2YgYSBMaXN0IG9mIGFsbG93ZWQgdmFsdWVzLCBhbmQgZmlsbHMgaW4gYSBmYWxsYmFja1xuICogdmFsdWUgaWYgbmVjZXNzYXJ5LlxuICovXG5mdW5jdGlvbiAvKjkuMi45ICovR2V0T3B0aW9uKG9wdGlvbnMsIHByb3BlcnR5LCB0eXBlLCB2YWx1ZXMsIGZhbGxiYWNrKSB7XG4gICAgLy8gMS4gTGV0IHZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAvLyAgICBvcHRpb25zIHdpdGggYXJndW1lbnQgcHJvcGVydHkuXG4gICAgdmFyIHZhbHVlID0gb3B0aW9uc1twcm9wZXJ0eV07XG5cbiAgICAvLyAyLiBJZiB2YWx1ZSBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYS4gQXNzZXJ0OiB0eXBlIGlzIFwiYm9vbGVhblwiIG9yIFwic3RyaW5nXCIuXG4gICAgICAgIC8vIGIuIElmIHR5cGUgaXMgXCJib29sZWFuXCIsIHRoZW4gbGV0IHZhbHVlIGJlIFRvQm9vbGVhbih2YWx1ZSkuXG4gICAgICAgIC8vIGMuIElmIHR5cGUgaXMgXCJzdHJpbmdcIiwgdGhlbiBsZXQgdmFsdWUgYmUgVG9TdHJpbmcodmFsdWUpLlxuICAgICAgICB2YWx1ZSA9IHR5cGUgPT09ICdib29sZWFuJyA/IEJvb2xlYW4odmFsdWUpIDogdHlwZSA9PT0gJ3N0cmluZycgPyBTdHJpbmcodmFsdWUpIDogdmFsdWU7XG5cbiAgICAgICAgLy8gZC4gSWYgdmFsdWVzIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICAgICAgaWYgKHZhbHVlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBpLiBJZiB2YWx1ZXMgZG9lcyBub3QgY29udGFpbiBhbiBlbGVtZW50IGVxdWFsIHRvIHZhbHVlLCB0aGVuIHRocm93IGFcbiAgICAgICAgICAgIC8vICAgIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICAgICAgaWYgKGFyckluZGV4T2YuY2FsbCh2YWx1ZXMsIHZhbHVlKSA9PT0gLTEpIHRocm93IG5ldyBSYW5nZUVycm9yKFwiJ1wiICsgdmFsdWUgKyBcIicgaXMgbm90IGFuIGFsbG93ZWQgdmFsdWUgZm9yIGBcIiArIHByb3BlcnR5ICsgJ2AnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGUuIFJldHVybiB2YWx1ZS5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBFbHNlIHJldHVybiBmYWxsYmFjay5cbiAgICByZXR1cm4gZmFsbGJhY2s7XG59XG5cbi8qKlxuICogVGhlIEdldE51bWJlck9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb24gZXh0cmFjdHMgYSBwcm9wZXJ0eSB2YWx1ZSBmcm9tIHRoZVxuICogcHJvdmlkZWQgb3B0aW9ucyBvYmplY3QsIGNvbnZlcnRzIGl0IHRvIGEgTnVtYmVyIHZhbHVlLCBjaGVja3Mgd2hldGhlciBpdCBpc1xuICogaW4gdGhlIGFsbG93ZWQgcmFuZ2UsIGFuZCBmaWxscyBpbiBhIGZhbGxiYWNrIHZhbHVlIGlmIG5lY2Vzc2FyeS5cbiAqL1xuZnVuY3Rpb24gLyogOS4yLjEwICovR2V0TnVtYmVyT3B0aW9uKG9wdGlvbnMsIHByb3BlcnR5LCBtaW5pbXVtLCBtYXhpbXVtLCBmYWxsYmFjaykge1xuICAgIC8vIDEuIExldCB2YWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgLy8gICAgb3B0aW9ucyB3aXRoIGFyZ3VtZW50IHByb3BlcnR5LlxuICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbcHJvcGVydHldO1xuXG4gICAgLy8gMi4gSWYgdmFsdWUgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGEuIExldCB2YWx1ZSBiZSBUb051bWJlcih2YWx1ZSkuXG4gICAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblxuICAgICAgICAvLyBiLiBJZiB2YWx1ZSBpcyBOYU4gb3IgbGVzcyB0aGFuIG1pbmltdW0gb3IgZ3JlYXRlciB0aGFuIG1heGltdW0sIHRocm93IGFcbiAgICAgICAgLy8gICAgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCBtaW5pbXVtIHx8IHZhbHVlID4gbWF4aW11bSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1ZhbHVlIGlzIG5vdCBhIG51bWJlciBvciBvdXRzaWRlIGFjY2VwdGVkIHJhbmdlJyk7XG5cbiAgICAgICAgLy8gYy4gUmV0dXJuIGZsb29yKHZhbHVlKS5cbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodmFsdWUpO1xuICAgIH1cbiAgICAvLyAzLiBFbHNlIHJldHVybiBmYWxsYmFjay5cbiAgICByZXR1cm4gZmFsbGJhY2s7XG59XG5cbi8vIDggVGhlIEludGwgT2JqZWN0XG52YXIgSW50bCA9IHt9O1xuXG4vLyA4LjIgRnVuY3Rpb24gUHJvcGVydGllcyBvZiB0aGUgSW50bCBPYmplY3RcblxuLy8gOC4yLjFcbi8vIEBzcGVjW3RjMzkvZWNtYTQwMi9tYXN0ZXIvc3BlYy9pbnRsLmh0bWxdXG4vLyBAY2xhdXNlW3NlYy1pbnRsLmdldGNhbm9uaWNhbGxvY2FsZXNdXG5mdW5jdGlvbiBnZXRDYW5vbmljYWxMb2NhbGVzKGxvY2FsZXMpIHtcbiAgICAvLyAxLiBMZXQgbGwgYmUgPyBDYW5vbmljYWxpemVMb2NhbGVMaXN0KGxvY2FsZXMpLlxuICAgIHZhciBsbCA9IENhbm9uaWNhbGl6ZUxvY2FsZUxpc3QobG9jYWxlcyk7XG4gICAgLy8gMi4gUmV0dXJuIENyZWF0ZUFycmF5RnJvbUxpc3QobGwpLlxuICAgIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIHZhciBsZW4gPSBsbC5sZW5ndGg7XG4gICAgICAgIHZhciBrID0gMDtcblxuICAgICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICAgICAgcmVzdWx0W2tdID0gbGxba107XG4gICAgICAgICAgICBrKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbnRsLCAnZ2V0Q2Fub25pY2FsTG9jYWxlcycsIHtcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IGdldENhbm9uaWNhbExvY2FsZXNcbn0pO1xuXG4vLyBDdXJyZW5jeSBtaW5vciB1bml0cyBvdXRwdXQgZnJvbSBnZXQtNDIxNyBncnVudCB0YXNrLCBmb3JtYXR0ZWRcbnZhciBjdXJyZW5jeU1pbm9yVW5pdHMgPSB7XG4gICAgQkhEOiAzLCBCWVI6IDAsIFhPRjogMCwgQklGOiAwLCBYQUY6IDAsIENMRjogNCwgQ0xQOiAwLCBLTUY6IDAsIERKRjogMCxcbiAgICBYUEY6IDAsIEdORjogMCwgSVNLOiAwLCBJUUQ6IDMsIEpQWTogMCwgSk9EOiAzLCBLUlc6IDAsIEtXRDogMywgTFlEOiAzLFxuICAgIE9NUjogMywgUFlHOiAwLCBSV0Y6IDAsIFRORDogMywgVUdYOiAwLCBVWUk6IDAsIFZVVjogMCwgVk5EOiAwXG59O1xuXG4vLyBEZWZpbmUgdGhlIE51bWJlckZvcm1hdCBjb25zdHJ1Y3RvciBpbnRlcm5hbGx5IHNvIGl0IGNhbm5vdCBiZSB0YWludGVkXG5mdW5jdGlvbiBOdW1iZXJGb3JtYXRDb25zdHJ1Y3RvcigpIHtcbiAgICB2YXIgbG9jYWxlcyA9IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmICghdGhpcyB8fCB0aGlzID09PSBJbnRsKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQobG9jYWxlcywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIEluaXRpYWxpemVOdW1iZXJGb3JtYXQodG9PYmplY3QodGhpcyksIGxvY2FsZXMsIG9wdGlvbnMpO1xufVxuXG5kZWZpbmVQcm9wZXJ0eShJbnRsLCAnTnVtYmVyRm9ybWF0Jywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogTnVtYmVyRm9ybWF0Q29uc3RydWN0b3Jcbn0pO1xuXG4vLyBNdXN0IGV4cGxpY2l0bHkgc2V0IHByb3RvdHlwZXMgYXMgdW53cml0YWJsZVxuZGVmaW5lUHJvcGVydHkoSW50bC5OdW1iZXJGb3JtYXQsICdwcm90b3R5cGUnLCB7XG4gICAgd3JpdGFibGU6IGZhbHNlXG59KTtcblxuLyoqXG4gKiBUaGUgYWJzdHJhY3Qgb3BlcmF0aW9uIEluaXRpYWxpemVOdW1iZXJGb3JtYXQgYWNjZXB0cyB0aGUgYXJndW1lbnRzXG4gKiBudW1iZXJGb3JtYXQgKHdoaWNoIG11c3QgYmUgYW4gb2JqZWN0KSwgbG9jYWxlcywgYW5kIG9wdGlvbnMuIEl0IGluaXRpYWxpemVzXG4gKiBudW1iZXJGb3JtYXQgYXMgYSBOdW1iZXJGb3JtYXQgb2JqZWN0LlxuICovXG5mdW5jdGlvbiAvKjExLjEuMS4xICovSW5pdGlhbGl6ZU51bWJlckZvcm1hdChudW1iZXJGb3JtYXQsIGxvY2FsZXMsIG9wdGlvbnMpIHtcbiAgICAvLyBUaGlzIHdpbGwgYmUgYSBpbnRlcm5hbCBwcm9wZXJ0aWVzIG9iamVjdCBpZiB3ZSdyZSBub3QgYWxyZWFkeSBpbml0aWFsaXplZFxuICAgIHZhciBpbnRlcm5hbCA9IGdldEludGVybmFsUHJvcGVydGllcyhudW1iZXJGb3JtYXQpO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB3aG9zZSBwcm9wcyBjYW4gYmUgdXNlZCB0byByZXN0b3JlIHRoZSB2YWx1ZXMgb2YgUmVnRXhwIHByb3BzXG4gICAgdmFyIHJlZ2V4cFJlc3RvcmUgPSBjcmVhdGVSZWdFeHBSZXN0b3JlKCk7XG5cbiAgICAvLyAxLiBJZiBudW1iZXJGb3JtYXQgaGFzIGFuIFtbaW5pdGlhbGl6ZWRJbnRsT2JqZWN0XV0gaW50ZXJuYWwgcHJvcGVydHkgd2l0aFxuICAgIC8vIHZhbHVlIHRydWUsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICBpZiAoaW50ZXJuYWxbJ1tbaW5pdGlhbGl6ZWRJbnRsT2JqZWN0XV0nXSA9PT0gdHJ1ZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIG9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkIGFzIGFuIEludGwgb2JqZWN0Jyk7XG5cbiAgICAvLyBOZWVkIHRoaXMgdG8gYWNjZXNzIHRoZSBgaW50ZXJuYWxgIG9iamVjdFxuICAgIGRlZmluZVByb3BlcnR5KG51bWJlckZvcm1hdCwgJ19fZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzJywge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUoKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBOb24tc3RhbmRhcmQsIGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1swXSA9PT0gc2VjcmV0KSByZXR1cm4gaW50ZXJuYWw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIDIuIFNldCB0aGUgW1tpbml0aWFsaXplZEludGxPYmplY3RdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gdHJ1ZS5cbiAgICBpbnRlcm5hbFsnW1tpbml0aWFsaXplZEludGxPYmplY3RdXSddID0gdHJ1ZTtcblxuICAgIC8vIDMuIExldCByZXF1ZXN0ZWRMb2NhbGVzIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQ2Fub25pY2FsaXplTG9jYWxlTGlzdFxuICAgIC8vICAgIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBpbiA5LjIuMSkgd2l0aCBhcmd1bWVudCBsb2NhbGVzLlxuICAgIHZhciByZXF1ZXN0ZWRMb2NhbGVzID0gQ2Fub25pY2FsaXplTG9jYWxlTGlzdChsb2NhbGVzKTtcblxuICAgIC8vIDQuIElmIG9wdGlvbnMgaXMgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgLy8gYS4gTGV0IG9wdGlvbnMgYmUgdGhlIHJlc3VsdCBvZiBjcmVhdGluZyBhIG5ldyBvYmplY3QgYXMgaWYgYnkgdGhlXG4gICAgICAgIC8vIGV4cHJlc3Npb24gbmV3IE9iamVjdCgpIHdoZXJlIE9iamVjdCBpcyB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gY29uc3RydWN0b3JcbiAgICAgICAgLy8gd2l0aCB0aGF0IG5hbWUuXG4gICAgICAgIG9wdGlvbnMgPSB7fTtcblxuICAgICAgICAvLyA1LiBFbHNlXG4gICAgZWxzZVxuICAgICAgICAvLyBhLiBMZXQgb3B0aW9ucyBiZSBUb09iamVjdChvcHRpb25zKS5cbiAgICAgICAgb3B0aW9ucyA9IHRvT2JqZWN0KG9wdGlvbnMpO1xuXG4gICAgLy8gNi4gTGV0IG9wdCBiZSBhIG5ldyBSZWNvcmQuXG4gICAgdmFyIG9wdCA9IG5ldyBSZWNvcmQoKSxcblxuXG4gICAgLy8gNy4gTGV0IG1hdGNoZXIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgLy8gICAgKGRlZmluZWQgaW4gOS4yLjkpIHdpdGggdGhlIGFyZ3VtZW50cyBvcHRpb25zLCBcImxvY2FsZU1hdGNoZXJcIiwgXCJzdHJpbmdcIixcbiAgICAvLyAgICBhIExpc3QgY29udGFpbmluZyB0aGUgdHdvIFN0cmluZyB2YWx1ZXMgXCJsb29rdXBcIiBhbmQgXCJiZXN0IGZpdFwiLCBhbmRcbiAgICAvLyAgICBcImJlc3QgZml0XCIuXG4gICAgbWF0Y2hlciA9IEdldE9wdGlvbihvcHRpb25zLCAnbG9jYWxlTWF0Y2hlcicsICdzdHJpbmcnLCBuZXcgTGlzdCgnbG9va3VwJywgJ2Jlc3QgZml0JyksICdiZXN0IGZpdCcpO1xuXG4gICAgLy8gOC4gU2V0IG9wdC5bW2xvY2FsZU1hdGNoZXJdXSB0byBtYXRjaGVyLlxuICAgIG9wdFsnW1tsb2NhbGVNYXRjaGVyXV0nXSA9IG1hdGNoZXI7XG5cbiAgICAvLyA5LiBMZXQgTnVtYmVyRm9ybWF0IGJlIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBvYmplY3QgdGhhdCBpcyB0aGUgaW5pdGlhbCB2YWx1ZVxuICAgIC8vICAgIG9mIEludGwuTnVtYmVyRm9ybWF0LlxuICAgIC8vIDEwLiBMZXQgbG9jYWxlRGF0YSBiZSB0aGUgdmFsdWUgb2YgdGhlIFtbbG9jYWxlRGF0YV1dIGludGVybmFsIHByb3BlcnR5IG9mXG4gICAgLy8gICAgIE51bWJlckZvcm1hdC5cbiAgICB2YXIgbG9jYWxlRGF0YSA9IGludGVybmFscy5OdW1iZXJGb3JtYXRbJ1tbbG9jYWxlRGF0YV1dJ107XG5cbiAgICAvLyAxMS4gTGV0IHIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBSZXNvbHZlTG9jYWxlIGFic3RyYWN0IG9wZXJhdGlvblxuICAgIC8vICAgICAoZGVmaW5lZCBpbiA5LjIuNSkgd2l0aCB0aGUgW1thdmFpbGFibGVMb2NhbGVzXV0gaW50ZXJuYWwgcHJvcGVydHkgb2ZcbiAgICAvLyAgICAgTnVtYmVyRm9ybWF0LCByZXF1ZXN0ZWRMb2NhbGVzLCBvcHQsIHRoZSBbW3JlbGV2YW50RXh0ZW5zaW9uS2V5c11dXG4gICAgLy8gICAgIGludGVybmFsIHByb3BlcnR5IG9mIE51bWJlckZvcm1hdCwgYW5kIGxvY2FsZURhdGEuXG4gICAgdmFyIHIgPSBSZXNvbHZlTG9jYWxlKGludGVybmFscy5OdW1iZXJGb3JtYXRbJ1tbYXZhaWxhYmxlTG9jYWxlc11dJ10sIHJlcXVlc3RlZExvY2FsZXMsIG9wdCwgaW50ZXJuYWxzLk51bWJlckZvcm1hdFsnW1tyZWxldmFudEV4dGVuc2lvbktleXNdXSddLCBsb2NhbGVEYXRhKTtcblxuICAgIC8vIDEyLiBTZXQgdGhlIFtbbG9jYWxlXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIHRoZSB2YWx1ZSBvZlxuICAgIC8vICAgICByLltbbG9jYWxlXV0uXG4gICAgaW50ZXJuYWxbJ1tbbG9jYWxlXV0nXSA9IHJbJ1tbbG9jYWxlXV0nXTtcblxuICAgIC8vIDEzLiBTZXQgdGhlIFtbbnVtYmVyaW5nU3lzdGVtXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIHRoZSB2YWx1ZVxuICAgIC8vICAgICBvZiByLltbbnVdXS5cbiAgICBpbnRlcm5hbFsnW1tudW1iZXJpbmdTeXN0ZW1dXSddID0gclsnW1tudV1dJ107XG5cbiAgICAvLyBUaGUgc3BlY2lmaWNhdGlvbiBkb2Vzbid0IHRlbGwgdXMgdG8gZG8gdGhpcywgYnV0IGl0J3MgaGVscGZ1bCBsYXRlciBvblxuICAgIGludGVybmFsWydbW2RhdGFMb2NhbGVdXSddID0gclsnW1tkYXRhTG9jYWxlXV0nXTtcblxuICAgIC8vIDE0LiBMZXQgZGF0YUxvY2FsZSBiZSB0aGUgdmFsdWUgb2Ygci5bW2RhdGFMb2NhbGVdXS5cbiAgICB2YXIgZGF0YUxvY2FsZSA9IHJbJ1tbZGF0YUxvY2FsZV1dJ107XG5cbiAgICAvLyAxNS4gTGV0IHMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uIHdpdGggdGhlXG4gICAgLy8gICAgIGFyZ3VtZW50cyBvcHRpb25zLCBcInN0eWxlXCIsIFwic3RyaW5nXCIsIGEgTGlzdCBjb250YWluaW5nIHRoZSB0aHJlZSBTdHJpbmdcbiAgICAvLyAgICAgdmFsdWVzIFwiZGVjaW1hbFwiLCBcInBlcmNlbnRcIiwgYW5kIFwiY3VycmVuY3lcIiwgYW5kIFwiZGVjaW1hbFwiLlxuICAgIHZhciBzID0gR2V0T3B0aW9uKG9wdGlvbnMsICdzdHlsZScsICdzdHJpbmcnLCBuZXcgTGlzdCgnZGVjaW1hbCcsICdwZXJjZW50JywgJ2N1cnJlbmN5JyksICdkZWNpbWFsJyk7XG5cbiAgICAvLyAxNi4gU2V0IHRoZSBbW3N0eWxlXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIHMuXG4gICAgaW50ZXJuYWxbJ1tbc3R5bGVdXSddID0gcztcblxuICAgIC8vIDE3LiBMZXQgYyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb24gd2l0aCB0aGVcbiAgICAvLyAgICAgYXJndW1lbnRzIG9wdGlvbnMsIFwiY3VycmVuY3lcIiwgXCJzdHJpbmdcIiwgdW5kZWZpbmVkLCBhbmQgdW5kZWZpbmVkLlxuICAgIHZhciBjID0gR2V0T3B0aW9uKG9wdGlvbnMsICdjdXJyZW5jeScsICdzdHJpbmcnKTtcblxuICAgIC8vIDE4LiBJZiBjIGlzIG5vdCB1bmRlZmluZWQgYW5kIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGVcbiAgICAvLyAgICAgSXNXZWxsRm9ybWVkQ3VycmVuY3lDb2RlIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBpbiA2LjMuMSkgd2l0aFxuICAgIC8vICAgICBhcmd1bWVudCBjIGlzIGZhbHNlLCB0aGVuIHRocm93IGEgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCAmJiAhSXNXZWxsRm9ybWVkQ3VycmVuY3lDb2RlKGMpKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIidcIiArIGMgKyBcIicgaXMgbm90IGEgdmFsaWQgY3VycmVuY3kgY29kZVwiKTtcblxuICAgIC8vIDE5LiBJZiBzIGlzIFwiY3VycmVuY3lcIiBhbmQgYyBpcyB1bmRlZmluZWQsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICBpZiAocyA9PT0gJ2N1cnJlbmN5JyAmJiBjID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0N1cnJlbmN5IGNvZGUgaXMgcmVxdWlyZWQgd2hlbiBzdHlsZSBpcyBjdXJyZW5jeScpO1xuXG4gICAgdmFyIGNEaWdpdHMgPSB2b2lkIDA7XG5cbiAgICAvLyAyMC4gSWYgcyBpcyBcImN1cnJlbmN5XCIsIHRoZW5cbiAgICBpZiAocyA9PT0gJ2N1cnJlbmN5Jykge1xuICAgICAgICAvLyBhLiBMZXQgYyBiZSB0aGUgcmVzdWx0IG9mIGNvbnZlcnRpbmcgYyB0byB1cHBlciBjYXNlIGFzIHNwZWNpZmllZCBpbiA2LjEuXG4gICAgICAgIGMgPSBjLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgLy8gYi4gU2V0IHRoZSBbW2N1cnJlbmN5XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIGMuXG4gICAgICAgIGludGVybmFsWydbW2N1cnJlbmN5XV0nXSA9IGM7XG5cbiAgICAgICAgLy8gYy4gTGV0IGNEaWdpdHMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBDdXJyZW5jeURpZ2l0cyBhYnN0cmFjdFxuICAgICAgICAvLyAgICBvcGVyYXRpb24gKGRlZmluZWQgYmVsb3cpIHdpdGggYXJndW1lbnQgYy5cbiAgICAgICAgY0RpZ2l0cyA9IEN1cnJlbmN5RGlnaXRzKGMpO1xuICAgIH1cblxuICAgIC8vIDIxLiBMZXQgY2QgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uIHdpdGggdGhlXG4gICAgLy8gICAgIGFyZ3VtZW50cyBvcHRpb25zLCBcImN1cnJlbmN5RGlzcGxheVwiLCBcInN0cmluZ1wiLCBhIExpc3QgY29udGFpbmluZyB0aGVcbiAgICAvLyAgICAgdGhyZWUgU3RyaW5nIHZhbHVlcyBcImNvZGVcIiwgXCJzeW1ib2xcIiwgYW5kIFwibmFtZVwiLCBhbmQgXCJzeW1ib2xcIi5cbiAgICB2YXIgY2QgPSBHZXRPcHRpb24ob3B0aW9ucywgJ2N1cnJlbmN5RGlzcGxheScsICdzdHJpbmcnLCBuZXcgTGlzdCgnY29kZScsICdzeW1ib2wnLCAnbmFtZScpLCAnc3ltYm9sJyk7XG5cbiAgICAvLyAyMi4gSWYgcyBpcyBcImN1cnJlbmN5XCIsIHRoZW4gc2V0IHRoZSBbW2N1cnJlbmN5RGlzcGxheV1dIGludGVybmFsIHByb3BlcnR5IG9mXG4gICAgLy8gICAgIG51bWJlckZvcm1hdCB0byBjZC5cbiAgICBpZiAocyA9PT0gJ2N1cnJlbmN5JykgaW50ZXJuYWxbJ1tbY3VycmVuY3lEaXNwbGF5XV0nXSA9IGNkO1xuXG4gICAgLy8gMjMuIExldCBtbmlkIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0TnVtYmVyT3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvblxuICAgIC8vICAgICAoZGVmaW5lZCBpbiA5LjIuMTApIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsIFwibWluaW11bUludGVnZXJEaWdpdHNcIiwgMSwgMjEsXG4gICAgLy8gICAgIGFuZCAxLlxuICAgIHZhciBtbmlkID0gR2V0TnVtYmVyT3B0aW9uKG9wdGlvbnMsICdtaW5pbXVtSW50ZWdlckRpZ2l0cycsIDEsIDIxLCAxKTtcblxuICAgIC8vIDI0LiBTZXQgdGhlIFtbbWluaW11bUludGVnZXJEaWdpdHNdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gbW5pZC5cbiAgICBpbnRlcm5hbFsnW1ttaW5pbXVtSW50ZWdlckRpZ2l0c11dJ10gPSBtbmlkO1xuXG4gICAgLy8gMjUuIElmIHMgaXMgXCJjdXJyZW5jeVwiLCB0aGVuIGxldCBtbmZkRGVmYXVsdCBiZSBjRGlnaXRzOyBlbHNlIGxldCBtbmZkRGVmYXVsdFxuICAgIC8vICAgICBiZSAwLlxuICAgIHZhciBtbmZkRGVmYXVsdCA9IHMgPT09ICdjdXJyZW5jeScgPyBjRGlnaXRzIDogMDtcblxuICAgIC8vIDI2LiBMZXQgbW5mZCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE51bWJlck9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAvLyAgICAgd2l0aCBhcmd1bWVudHMgb3B0aW9ucywgXCJtaW5pbXVtRnJhY3Rpb25EaWdpdHNcIiwgMCwgMjAsIGFuZCBtbmZkRGVmYXVsdC5cbiAgICB2YXIgbW5mZCA9IEdldE51bWJlck9wdGlvbihvcHRpb25zLCAnbWluaW11bUZyYWN0aW9uRGlnaXRzJywgMCwgMjAsIG1uZmREZWZhdWx0KTtcblxuICAgIC8vIDI3LiBTZXQgdGhlIFtbbWluaW11bUZyYWN0aW9uRGlnaXRzXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIG1uZmQuXG4gICAgaW50ZXJuYWxbJ1tbbWluaW11bUZyYWN0aW9uRGlnaXRzXV0nXSA9IG1uZmQ7XG5cbiAgICAvLyAyOC4gSWYgcyBpcyBcImN1cnJlbmN5XCIsIHRoZW4gbGV0IG14ZmREZWZhdWx0IGJlIG1heChtbmZkLCBjRGlnaXRzKTsgZWxzZSBpZiBzXG4gICAgLy8gICAgIGlzIFwicGVyY2VudFwiLCB0aGVuIGxldCBteGZkRGVmYXVsdCBiZSBtYXgobW5mZCwgMCk7IGVsc2UgbGV0IG14ZmREZWZhdWx0XG4gICAgLy8gICAgIGJlIG1heChtbmZkLCAzKS5cbiAgICB2YXIgbXhmZERlZmF1bHQgPSBzID09PSAnY3VycmVuY3knID8gTWF0aC5tYXgobW5mZCwgY0RpZ2l0cykgOiBzID09PSAncGVyY2VudCcgPyBNYXRoLm1heChtbmZkLCAwKSA6IE1hdGgubWF4KG1uZmQsIDMpO1xuXG4gICAgLy8gMjkuIExldCBteGZkIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0TnVtYmVyT3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvblxuICAgIC8vICAgICB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLCBcIm1heGltdW1GcmFjdGlvbkRpZ2l0c1wiLCBtbmZkLCAyMCwgYW5kIG14ZmREZWZhdWx0LlxuICAgIHZhciBteGZkID0gR2V0TnVtYmVyT3B0aW9uKG9wdGlvbnMsICdtYXhpbXVtRnJhY3Rpb25EaWdpdHMnLCBtbmZkLCAyMCwgbXhmZERlZmF1bHQpO1xuXG4gICAgLy8gMzAuIFNldCB0aGUgW1ttYXhpbXVtRnJhY3Rpb25EaWdpdHNdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gbXhmZC5cbiAgICBpbnRlcm5hbFsnW1ttYXhpbXVtRnJhY3Rpb25EaWdpdHNdXSddID0gbXhmZDtcblxuICAgIC8vIDMxLiBMZXQgbW5zZCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIG9wdGlvbnNcbiAgICAvLyAgICAgd2l0aCBhcmd1bWVudCBcIm1pbmltdW1TaWduaWZpY2FudERpZ2l0c1wiLlxuICAgIHZhciBtbnNkID0gb3B0aW9ucy5taW5pbXVtU2lnbmlmaWNhbnREaWdpdHM7XG5cbiAgICAvLyAzMi4gTGV0IG14c2QgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBvcHRpb25zXG4gICAgLy8gICAgIHdpdGggYXJndW1lbnQgXCJtYXhpbXVtU2lnbmlmaWNhbnREaWdpdHNcIi5cbiAgICB2YXIgbXhzZCA9IG9wdGlvbnMubWF4aW11bVNpZ25pZmljYW50RGlnaXRzO1xuXG4gICAgLy8gMzMuIElmIG1uc2QgaXMgbm90IHVuZGVmaW5lZCBvciBteHNkIGlzIG5vdCB1bmRlZmluZWQsIHRoZW46XG4gICAgaWYgKG1uc2QgIT09IHVuZGVmaW5lZCB8fCBteHNkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYS4gTGV0IG1uc2QgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXROdW1iZXJPcHRpb24gYWJzdHJhY3RcbiAgICAgICAgLy8gICAgb3BlcmF0aW9uIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsIFwibWluaW11bVNpZ25pZmljYW50RGlnaXRzXCIsIDEsIDIxLFxuICAgICAgICAvLyAgICBhbmQgMS5cbiAgICAgICAgbW5zZCA9IEdldE51bWJlck9wdGlvbihvcHRpb25zLCAnbWluaW11bVNpZ25pZmljYW50RGlnaXRzJywgMSwgMjEsIDEpO1xuXG4gICAgICAgIC8vIGIuIExldCBteHNkIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0TnVtYmVyT3B0aW9uIGFic3RyYWN0XG4gICAgICAgIC8vICAgICBvcGVyYXRpb24gd2l0aCBhcmd1bWVudHMgb3B0aW9ucywgXCJtYXhpbXVtU2lnbmlmaWNhbnREaWdpdHNcIiwgbW5zZCxcbiAgICAgICAgLy8gICAgIDIxLCBhbmQgMjEuXG4gICAgICAgIG14c2QgPSBHZXROdW1iZXJPcHRpb24ob3B0aW9ucywgJ21heGltdW1TaWduaWZpY2FudERpZ2l0cycsIG1uc2QsIDIxLCAyMSk7XG5cbiAgICAgICAgLy8gYy4gU2V0IHRoZSBbW21pbmltdW1TaWduaWZpY2FudERpZ2l0c11dIGludGVybmFsIHByb3BlcnR5IG9mIG51bWJlckZvcm1hdFxuICAgICAgICAvLyAgICB0byBtbnNkLCBhbmQgdGhlIFtbbWF4aW11bVNpZ25pZmljYW50RGlnaXRzXV0gaW50ZXJuYWwgcHJvcGVydHkgb2ZcbiAgICAgICAgLy8gICAgbnVtYmVyRm9ybWF0IHRvIG14c2QuXG4gICAgICAgIGludGVybmFsWydbW21pbmltdW1TaWduaWZpY2FudERpZ2l0c11dJ10gPSBtbnNkO1xuICAgICAgICBpbnRlcm5hbFsnW1ttYXhpbXVtU2lnbmlmaWNhbnREaWdpdHNdXSddID0gbXhzZDtcbiAgICB9XG4gICAgLy8gMzQuIExldCBnIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0T3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvbiB3aXRoIHRoZVxuICAgIC8vICAgICBhcmd1bWVudHMgb3B0aW9ucywgXCJ1c2VHcm91cGluZ1wiLCBcImJvb2xlYW5cIiwgdW5kZWZpbmVkLCBhbmQgdHJ1ZS5cbiAgICB2YXIgZyA9IEdldE9wdGlvbihvcHRpb25zLCAndXNlR3JvdXBpbmcnLCAnYm9vbGVhbicsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAvLyAzNS4gU2V0IHRoZSBbW3VzZUdyb3VwaW5nXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIGcuXG4gICAgaW50ZXJuYWxbJ1tbdXNlR3JvdXBpbmddXSddID0gZztcblxuICAgIC8vIDM2LiBMZXQgZGF0YUxvY2FsZURhdGEgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgIC8vICAgICBsb2NhbGVEYXRhIHdpdGggYXJndW1lbnQgZGF0YUxvY2FsZS5cbiAgICB2YXIgZGF0YUxvY2FsZURhdGEgPSBsb2NhbGVEYXRhW2RhdGFMb2NhbGVdO1xuXG4gICAgLy8gMzcuIExldCBwYXR0ZXJucyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgLy8gICAgIGRhdGFMb2NhbGVEYXRhIHdpdGggYXJndW1lbnQgXCJwYXR0ZXJuc1wiLlxuICAgIHZhciBwYXR0ZXJucyA9IGRhdGFMb2NhbGVEYXRhLnBhdHRlcm5zO1xuXG4gICAgLy8gMzguIEFzc2VydDogcGF0dGVybnMgaXMgYW4gb2JqZWN0IChzZWUgMTEuMi4zKVxuXG4gICAgLy8gMzkuIExldCBzdHlsZVBhdHRlcm5zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAvLyAgICAgcGF0dGVybnMgd2l0aCBhcmd1bWVudCBzLlxuICAgIHZhciBzdHlsZVBhdHRlcm5zID0gcGF0dGVybnNbc107XG5cbiAgICAvLyA0MC4gU2V0IHRoZSBbW3Bvc2l0aXZlUGF0dGVybl1dIGludGVybmFsIHByb3BlcnR5IG9mIG51bWJlckZvcm1hdCB0byB0aGVcbiAgICAvLyAgICAgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIHN0eWxlUGF0dGVybnMgd2l0aCB0aGVcbiAgICAvLyAgICAgYXJndW1lbnQgXCJwb3NpdGl2ZVBhdHRlcm5cIi5cbiAgICBpbnRlcm5hbFsnW1twb3NpdGl2ZVBhdHRlcm5dXSddID0gc3R5bGVQYXR0ZXJucy5wb3NpdGl2ZVBhdHRlcm47XG5cbiAgICAvLyA0MS4gU2V0IHRoZSBbW25lZ2F0aXZlUGF0dGVybl1dIGludGVybmFsIHByb3BlcnR5IG9mIG51bWJlckZvcm1hdCB0byB0aGVcbiAgICAvLyAgICAgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIHN0eWxlUGF0dGVybnMgd2l0aCB0aGVcbiAgICAvLyAgICAgYXJndW1lbnQgXCJuZWdhdGl2ZVBhdHRlcm5cIi5cbiAgICBpbnRlcm5hbFsnW1tuZWdhdGl2ZVBhdHRlcm5dXSddID0gc3R5bGVQYXR0ZXJucy5uZWdhdGl2ZVBhdHRlcm47XG5cbiAgICAvLyA0Mi4gU2V0IHRoZSBbW2JvdW5kRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIHVuZGVmaW5lZC5cbiAgICBpbnRlcm5hbFsnW1tib3VuZEZvcm1hdF1dJ10gPSB1bmRlZmluZWQ7XG5cbiAgICAvLyA0My4gU2V0IHRoZSBbW2luaXRpYWxpemVkTnVtYmVyRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvXG4gICAgLy8gICAgIHRydWUuXG4gICAgaW50ZXJuYWxbJ1tbaW5pdGlhbGl6ZWROdW1iZXJGb3JtYXRdXSddID0gdHJ1ZTtcblxuICAgIC8vIEluIEVTMywgd2UgbmVlZCB0byBwcmUtYmluZCB0aGUgZm9ybWF0KCkgZnVuY3Rpb25cbiAgICBpZiAoZXMzKSBudW1iZXJGb3JtYXQuZm9ybWF0ID0gR2V0Rm9ybWF0TnVtYmVyLmNhbGwobnVtYmVyRm9ybWF0KTtcblxuICAgIC8vIFJlc3RvcmUgdGhlIFJlZ0V4cCBwcm9wZXJ0aWVzXG4gICAgcmVnZXhwUmVzdG9yZSgpO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBuZXdseSBpbml0aWFsaXNlZCBvYmplY3RcbiAgICByZXR1cm4gbnVtYmVyRm9ybWF0O1xufVxuXG5mdW5jdGlvbiBDdXJyZW5jeURpZ2l0cyhjdXJyZW5jeSkge1xuICAgIC8vIFdoZW4gdGhlIEN1cnJlbmN5RGlnaXRzIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCBhbiBhcmd1bWVudCBjdXJyZW5jeVxuICAgIC8vICh3aGljaCBtdXN0IGJlIGFuIHVwcGVyIGNhc2UgU3RyaW5nIHZhbHVlKSwgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG5cbiAgICAvLyAxLiBJZiB0aGUgSVNPIDQyMTcgY3VycmVuY3kgYW5kIGZ1bmRzIGNvZGUgbGlzdCBjb250YWlucyBjdXJyZW5jeSBhcyBhblxuICAgIC8vIGFscGhhYmV0aWMgY29kZSwgdGhlbiByZXR1cm4gdGhlIG1pbm9yIHVuaXQgdmFsdWUgY29ycmVzcG9uZGluZyB0byB0aGVcbiAgICAvLyBjdXJyZW5jeSBmcm9tIHRoZSBsaXN0OyBlbHNlIHJldHVybiAyLlxuICAgIHJldHVybiBjdXJyZW5jeU1pbm9yVW5pdHNbY3VycmVuY3ldICE9PSB1bmRlZmluZWQgPyBjdXJyZW5jeU1pbm9yVW5pdHNbY3VycmVuY3ldIDogMjtcbn1cblxuLyogMTEuMi4zICovaW50ZXJuYWxzLk51bWJlckZvcm1hdCA9IHtcbiAgICAnW1thdmFpbGFibGVMb2NhbGVzXV0nOiBbXSxcbiAgICAnW1tyZWxldmFudEV4dGVuc2lvbktleXNdXSc6IFsnbnUnXSxcbiAgICAnW1tsb2NhbGVEYXRhXV0nOiB7fVxufTtcblxuLyoqXG4gKiBXaGVuIHRoZSBzdXBwb3J0ZWRMb2NhbGVzT2YgbWV0aG9kIG9mIEludGwuTnVtYmVyRm9ybWF0IGlzIGNhbGxlZCwgdGhlXG4gKiBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG4vKiAxMS4yLjIgKi9cbmRlZmluZVByb3BlcnR5KEludGwuTnVtYmVyRm9ybWF0LCAnc3VwcG9ydGVkTG9jYWxlc09mJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogZm5CaW5kLmNhbGwoZnVuY3Rpb24gKGxvY2FsZXMpIHtcbiAgICAgICAgLy8gQm91bmQgZnVuY3Rpb25zIG9ubHkgaGF2ZSB0aGUgYHRoaXNgIHZhbHVlIGFsdGVyZWQgaWYgYmVpbmcgdXNlZCBhcyBhIGNvbnN0cnVjdG9yLFxuICAgICAgICAvLyB0aGlzIGxldHMgdXMgaW1pdGF0ZSBhIG5hdGl2ZSBmdW5jdGlvbiB0aGF0IGhhcyBubyBjb25zdHJ1Y3RvclxuICAgICAgICBpZiAoIWhvcC5jYWxsKHRoaXMsICdbW2F2YWlsYWJsZUxvY2FsZXNdXScpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdXBwb3J0ZWRMb2NhbGVzT2YoKSBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBvYmplY3Qgd2hvc2UgcHJvcHMgY2FuIGJlIHVzZWQgdG8gcmVzdG9yZSB0aGUgdmFsdWVzIG9mIFJlZ0V4cCBwcm9wc1xuICAgICAgICB2YXIgcmVnZXhwUmVzdG9yZSA9IGNyZWF0ZVJlZ0V4cFJlc3RvcmUoKSxcblxuXG4gICAgICAgIC8vIDEuIElmIG9wdGlvbnMgaXMgbm90IHByb3ZpZGVkLCB0aGVuIGxldCBvcHRpb25zIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSxcblxuXG4gICAgICAgIC8vIDIuIExldCBhdmFpbGFibGVMb2NhbGVzIGJlIHRoZSB2YWx1ZSBvZiB0aGUgW1thdmFpbGFibGVMb2NhbGVzXV0gaW50ZXJuYWxcbiAgICAgICAgLy8gICAgcHJvcGVydHkgb2YgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIG9iamVjdCB0aGF0IGlzIHRoZSBpbml0aWFsIHZhbHVlIG9mXG4gICAgICAgIC8vICAgIEludGwuTnVtYmVyRm9ybWF0LlxuXG4gICAgICAgIGF2YWlsYWJsZUxvY2FsZXMgPSB0aGlzWydbW2F2YWlsYWJsZUxvY2FsZXNdXSddLFxuXG5cbiAgICAgICAgLy8gMy4gTGV0IHJlcXVlc3RlZExvY2FsZXMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBDYW5vbmljYWxpemVMb2NhbGVMaXN0XG4gICAgICAgIC8vICAgIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBpbiA5LjIuMSkgd2l0aCBhcmd1bWVudCBsb2NhbGVzLlxuICAgICAgICByZXF1ZXN0ZWRMb2NhbGVzID0gQ2Fub25pY2FsaXplTG9jYWxlTGlzdChsb2NhbGVzKTtcblxuICAgICAgICAvLyBSZXN0b3JlIHRoZSBSZWdFeHAgcHJvcGVydGllc1xuICAgICAgICByZWdleHBSZXN0b3JlKCk7XG5cbiAgICAgICAgLy8gNC4gUmV0dXJuIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgU3VwcG9ydGVkTG9jYWxlcyBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAgICAgLy8gICAgKGRlZmluZWQgaW4gOS4yLjgpIHdpdGggYXJndW1lbnRzIGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMsXG4gICAgICAgIC8vICAgIGFuZCBvcHRpb25zLlxuICAgICAgICByZXR1cm4gU3VwcG9ydGVkTG9jYWxlcyhhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzLCBvcHRpb25zKTtcbiAgICB9LCBpbnRlcm5hbHMuTnVtYmVyRm9ybWF0KVxufSk7XG5cbi8qKlxuICogVGhpcyBuYW1lZCBhY2Nlc3NvciBwcm9wZXJ0eSByZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBmb3JtYXRzIGEgbnVtYmVyXG4gKiBhY2NvcmRpbmcgdG8gdGhlIGVmZmVjdGl2ZSBsb2NhbGUgYW5kIHRoZSBmb3JtYXR0aW5nIG9wdGlvbnMgb2YgdGhpc1xuICogTnVtYmVyRm9ybWF0IG9iamVjdC5cbiAqL1xuLyogMTEuMy4yICovZGVmaW5lUHJvcGVydHkoSW50bC5OdW1iZXJGb3JtYXQucHJvdG90eXBlLCAnZm9ybWF0Jywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IEdldEZvcm1hdE51bWJlclxufSk7XG5cbmZ1bmN0aW9uIEdldEZvcm1hdE51bWJlcigpIHtcbiAgICB2YXIgaW50ZXJuYWwgPSB0aGlzICE9PSBudWxsICYmIGJhYmVsSGVscGVycyQxW1widHlwZW9mXCJdKHRoaXMpID09PSAnb2JqZWN0JyAmJiBnZXRJbnRlcm5hbFByb3BlcnRpZXModGhpcyk7XG5cbiAgICAvLyBTYXRpc2Z5IHRlc3QgMTEuM19iXG4gICAgaWYgKCFpbnRlcm5hbCB8fCAhaW50ZXJuYWxbJ1tbaW5pdGlhbGl6ZWROdW1iZXJGb3JtYXRdXSddKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2AgdmFsdWUgZm9yIGZvcm1hdCgpIGlzIG5vdCBhbiBpbml0aWFsaXplZCBJbnRsLk51bWJlckZvcm1hdCBvYmplY3QuJyk7XG5cbiAgICAvLyBUaGUgdmFsdWUgb2YgdGhlIFtbR2V0XV0gYXR0cmlidXRlIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgZm9sbG93aW5nXG4gICAgLy8gc3RlcHM6XG5cbiAgICAvLyAxLiBJZiB0aGUgW1tib3VuZEZvcm1hdF1dIGludGVybmFsIHByb3BlcnR5IG9mIHRoaXMgTnVtYmVyRm9ybWF0IG9iamVjdFxuICAgIC8vICAgIGlzIHVuZGVmaW5lZCwgdGhlbjpcbiAgICBpZiAoaW50ZXJuYWxbJ1tbYm91bmRGb3JtYXRdXSddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYS4gTGV0IEYgYmUgYSBGdW5jdGlvbiBvYmplY3QsIHdpdGggaW50ZXJuYWwgcHJvcGVydGllcyBzZXQgYXNcbiAgICAgICAgLy8gICAgc3BlY2lmaWVkIGZvciBidWlsdC1pbiBmdW5jdGlvbnMgaW4gRVM1LCAxNSwgb3Igc3VjY2Vzc29yLCBhbmQgdGhlXG4gICAgICAgIC8vICAgIGxlbmd0aCBwcm9wZXJ0eSBzZXQgdG8gMSwgdGhhdCB0YWtlcyB0aGUgYXJndW1lbnQgdmFsdWUgYW5kXG4gICAgICAgIC8vICAgIHBlcmZvcm1zIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgIHZhciBGID0gZnVuY3Rpb24gRih2YWx1ZSkge1xuICAgICAgICAgICAgLy8gaS4gSWYgdmFsdWUgaXMgbm90IHByb3ZpZGVkLCB0aGVuIGxldCB2YWx1ZSBiZSB1bmRlZmluZWQuXG4gICAgICAgICAgICAvLyBpaS4gTGV0IHggYmUgVG9OdW1iZXIodmFsdWUpLlxuICAgICAgICAgICAgLy8gaWlpLiBSZXR1cm4gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBGb3JtYXROdW1iZXIgYWJzdHJhY3RcbiAgICAgICAgICAgIC8vICAgICAgb3BlcmF0aW9uIChkZWZpbmVkIGJlbG93KSB3aXRoIGFyZ3VtZW50cyB0aGlzIGFuZCB4LlxuICAgICAgICAgICAgcmV0dXJuIEZvcm1hdE51bWJlcih0aGlzLCAvKiB4ID0gKi9OdW1iZXIodmFsdWUpKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBiLiBMZXQgYmluZCBiZSB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gZnVuY3Rpb24gb2JqZWN0IGRlZmluZWQgaW4gRVM1LFxuICAgICAgICAvLyAgICAxNS4zLjQuNS5cbiAgICAgICAgLy8gYy4gTGV0IGJmIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDYWxsXV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgICAgIC8vICAgIGJpbmQgd2l0aCBGIGFzIHRoZSB0aGlzIHZhbHVlIGFuZCBhbiBhcmd1bWVudCBsaXN0IGNvbnRhaW5pbmdcbiAgICAgICAgLy8gICAgdGhlIHNpbmdsZSBpdGVtIHRoaXMuXG4gICAgICAgIHZhciBiZiA9IGZuQmluZC5jYWxsKEYsIHRoaXMpO1xuXG4gICAgICAgIC8vIGQuIFNldCB0aGUgW1tib3VuZEZvcm1hdF1dIGludGVybmFsIHByb3BlcnR5IG9mIHRoaXMgTnVtYmVyRm9ybWF0XG4gICAgICAgIC8vICAgIG9iamVjdCB0byBiZi5cbiAgICAgICAgaW50ZXJuYWxbJ1tbYm91bmRGb3JtYXRdXSddID0gYmY7XG4gICAgfVxuICAgIC8vIFJldHVybiB0aGUgdmFsdWUgb2YgdGhlIFtbYm91bmRGb3JtYXRdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiB0aGlzXG4gICAgLy8gTnVtYmVyRm9ybWF0IG9iamVjdC5cbiAgICByZXR1cm4gaW50ZXJuYWxbJ1tbYm91bmRGb3JtYXRdXSddO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRUb1BhcnRzKCkge1xuICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXTtcblxuICAgIHZhciBpbnRlcm5hbCA9IHRoaXMgIT09IG51bGwgJiYgYmFiZWxIZWxwZXJzJDFbXCJ0eXBlb2ZcIl0odGhpcykgPT09ICdvYmplY3QnICYmIGdldEludGVybmFsUHJvcGVydGllcyh0aGlzKTtcbiAgICBpZiAoIWludGVybmFsIHx8ICFpbnRlcm5hbFsnW1tpbml0aWFsaXplZE51bWJlckZvcm1hdF1dJ10pIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCB2YWx1ZSBmb3IgZm9ybWF0VG9QYXJ0cygpIGlzIG5vdCBhbiBpbml0aWFsaXplZCBJbnRsLk51bWJlckZvcm1hdCBvYmplY3QuJyk7XG5cbiAgICB2YXIgeCA9IE51bWJlcih2YWx1ZSk7XG4gICAgcmV0dXJuIEZvcm1hdE51bWJlclRvUGFydHModGhpcywgeCk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbnRsLk51bWJlckZvcm1hdC5wcm90b3R5cGUsICdmb3JtYXRUb1BhcnRzJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogZm9ybWF0VG9QYXJ0c1xufSk7XG5cbi8qXG4gKiBAc3BlY1tzdGFzbS9lY21hNDAyL251bWJlci1mb3JtYXQtdG8tcGFydHMvc3BlYy9udW1iZXJmb3JtYXQuaHRtbF1cbiAqIEBjbGF1c2Vbc2VjLWZvcm1hdG51bWJlcnRvcGFydHNdXG4gKi9cbmZ1bmN0aW9uIEZvcm1hdE51bWJlclRvUGFydHMobnVtYmVyRm9ybWF0LCB4KSB7XG4gICAgLy8gMS4gTGV0IHBhcnRzIGJlID8gUGFydGl0aW9uTnVtYmVyUGF0dGVybihudW1iZXJGb3JtYXQsIHgpLlxuICAgIHZhciBwYXJ0cyA9IFBhcnRpdGlvbk51bWJlclBhdHRlcm4obnVtYmVyRm9ybWF0LCB4KTtcbiAgICAvLyAyLiBMZXQgcmVzdWx0IGJlIEFycmF5Q3JlYXRlKDApLlxuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAvLyAzLiBMZXQgbiBiZSAwLlxuICAgIHZhciBuID0gMDtcbiAgICAvLyA0LiBGb3IgZWFjaCBwYXJ0IGluIHBhcnRzLCBkbzpcbiAgICBmb3IgKHZhciBpID0gMDsgcGFydHMubGVuZ3RoID4gaTsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgIC8vIGEuIExldCBPIGJlIE9iamVjdENyZWF0ZSglT2JqZWN0UHJvdG90eXBlJSkuXG4gICAgICAgIHZhciBPID0ge307XG4gICAgICAgIC8vIGEuIFBlcmZvcm0gPyBDcmVhdGVEYXRhUHJvcGVydHlPclRocm93KE8sIFwidHlwZVwiLCBwYXJ0LltbdHlwZV1dKS5cbiAgICAgICAgTy50eXBlID0gcGFydFsnW1t0eXBlXV0nXTtcbiAgICAgICAgLy8gYS4gUGVyZm9ybSA/IENyZWF0ZURhdGFQcm9wZXJ0eU9yVGhyb3coTywgXCJ2YWx1ZVwiLCBwYXJ0LltbdmFsdWVdXSkuXG4gICAgICAgIE8udmFsdWUgPSBwYXJ0WydbW3ZhbHVlXV0nXTtcbiAgICAgICAgLy8gYS4gUGVyZm9ybSA/IENyZWF0ZURhdGFQcm9wZXJ0eU9yVGhyb3cocmVzdWx0LCA/IFRvU3RyaW5nKG4pLCBPKS5cbiAgICAgICAgcmVzdWx0W25dID0gTztcbiAgICAgICAgLy8gYS4gSW5jcmVtZW50IG4gYnkgMS5cbiAgICAgICAgbiArPSAxO1xuICAgIH1cbiAgICAvLyA1LiBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qXG4gKiBAc3BlY1tzdGFzbS9lY21hNDAyL251bWJlci1mb3JtYXQtdG8tcGFydHMvc3BlYy9udW1iZXJmb3JtYXQuaHRtbF1cbiAqIEBjbGF1c2Vbc2VjLXBhcnRpdGlvbm51bWJlcnBhdHRlcm5dXG4gKi9cbmZ1bmN0aW9uIFBhcnRpdGlvbk51bWJlclBhdHRlcm4obnVtYmVyRm9ybWF0LCB4KSB7XG5cbiAgICB2YXIgaW50ZXJuYWwgPSBnZXRJbnRlcm5hbFByb3BlcnRpZXMobnVtYmVyRm9ybWF0KSxcbiAgICAgICAgbG9jYWxlID0gaW50ZXJuYWxbJ1tbZGF0YUxvY2FsZV1dJ10sXG4gICAgICAgIG51bXMgPSBpbnRlcm5hbFsnW1tudW1iZXJpbmdTeXN0ZW1dXSddLFxuICAgICAgICBkYXRhID0gaW50ZXJuYWxzLk51bWJlckZvcm1hdFsnW1tsb2NhbGVEYXRhXV0nXVtsb2NhbGVdLFxuICAgICAgICBpbGQgPSBkYXRhLnN5bWJvbHNbbnVtc10gfHwgZGF0YS5zeW1ib2xzLmxhdG4sXG4gICAgICAgIHBhdHRlcm4gPSB2b2lkIDA7XG5cbiAgICAvLyAxLiBJZiB4IGlzIG5vdCBOYU4gYW5kIHggPCAwLCB0aGVuOlxuICAgIGlmICghaXNOYU4oeCkgJiYgeCA8IDApIHtcbiAgICAgICAgLy8gYS4gTGV0IHggYmUgLXguXG4gICAgICAgIHggPSAteDtcbiAgICAgICAgLy8gYS4gTGV0IHBhdHRlcm4gYmUgdGhlIHZhbHVlIG9mIG51bWJlckZvcm1hdC5bW25lZ2F0aXZlUGF0dGVybl1dLlxuICAgICAgICBwYXR0ZXJuID0gaW50ZXJuYWxbJ1tbbmVnYXRpdmVQYXR0ZXJuXV0nXTtcbiAgICB9XG4gICAgLy8gMi4gRWxzZSxcbiAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGEuIExldCBwYXR0ZXJuIGJlIHRoZSB2YWx1ZSBvZiBudW1iZXJGb3JtYXQuW1twb3NpdGl2ZVBhdHRlcm5dXS5cbiAgICAgICAgICAgIHBhdHRlcm4gPSBpbnRlcm5hbFsnW1twb3NpdGl2ZVBhdHRlcm5dXSddO1xuICAgICAgICB9XG4gICAgLy8gMy4gTGV0IHJlc3VsdCBiZSBhIG5ldyBlbXB0eSBMaXN0LlxuICAgIHZhciByZXN1bHQgPSBuZXcgTGlzdCgpO1xuICAgIC8vIDQuIExldCBiZWdpbkluZGV4IGJlIENhbGwoJVN0cmluZ1Byb3RvX2luZGV4T2YlLCBwYXR0ZXJuLCBcIntcIiwgMCkuXG4gICAgdmFyIGJlZ2luSW5kZXggPSBwYXR0ZXJuLmluZGV4T2YoJ3snLCAwKTtcbiAgICAvLyA1LiBMZXQgZW5kSW5kZXggYmUgMC5cbiAgICB2YXIgZW5kSW5kZXggPSAwO1xuICAgIC8vIDYuIExldCBuZXh0SW5kZXggYmUgMC5cbiAgICB2YXIgbmV4dEluZGV4ID0gMDtcbiAgICAvLyA3LiBMZXQgbGVuZ3RoIGJlIHRoZSBudW1iZXIgb2YgY29kZSB1bml0cyBpbiBwYXR0ZXJuLlxuICAgIHZhciBsZW5ndGggPSBwYXR0ZXJuLmxlbmd0aDtcbiAgICAvLyA4LiBSZXBlYXQgd2hpbGUgYmVnaW5JbmRleCBpcyBhbiBpbnRlZ2VyIGluZGV4IGludG8gcGF0dGVybjpcbiAgICB3aGlsZSAoYmVnaW5JbmRleCA+IC0xICYmIGJlZ2luSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgLy8gYS4gU2V0IGVuZEluZGV4IHRvIENhbGwoJVN0cmluZ1Byb3RvX2luZGV4T2YlLCBwYXR0ZXJuLCBcIn1cIiwgYmVnaW5JbmRleClcbiAgICAgICAgZW5kSW5kZXggPSBwYXR0ZXJuLmluZGV4T2YoJ30nLCBiZWdpbkluZGV4KTtcbiAgICAgICAgLy8gYS4gSWYgZW5kSW5kZXggPSAtMSwgdGhyb3cgbmV3IEVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKGVuZEluZGV4ID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIC8vIGEuIElmIGJlZ2luSW5kZXggaXMgZ3JlYXRlciB0aGFuIG5leHRJbmRleCwgdGhlbjpcbiAgICAgICAgaWYgKGJlZ2luSW5kZXggPiBuZXh0SW5kZXgpIHtcbiAgICAgICAgICAgIC8vIGkuIExldCBsaXRlcmFsIGJlIGEgc3Vic3RyaW5nIG9mIHBhdHRlcm4gZnJvbSBwb3NpdGlvbiBuZXh0SW5kZXgsIGluY2x1c2l2ZSwgdG8gcG9zaXRpb24gYmVnaW5JbmRleCwgZXhjbHVzaXZlLlxuICAgICAgICAgICAgdmFyIGxpdGVyYWwgPSBwYXR0ZXJuLnN1YnN0cmluZyhuZXh0SW5kZXgsIGJlZ2luSW5kZXgpO1xuICAgICAgICAgICAgLy8gaWkuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJsaXRlcmFsXCIsIFtbdmFsdWVdXTogbGl0ZXJhbCB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnbGl0ZXJhbCcsICdbW3ZhbHVlXV0nOiBsaXRlcmFsIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGEuIExldCBwIGJlIHRoZSBzdWJzdHJpbmcgb2YgcGF0dGVybiBmcm9tIHBvc2l0aW9uIGJlZ2luSW5kZXgsIGV4Y2x1c2l2ZSwgdG8gcG9zaXRpb24gZW5kSW5kZXgsIGV4Y2x1c2l2ZS5cbiAgICAgICAgdmFyIHAgPSBwYXR0ZXJuLnN1YnN0cmluZyhiZWdpbkluZGV4ICsgMSwgZW5kSW5kZXgpO1xuICAgICAgICAvLyBhLiBJZiBwIGlzIGVxdWFsIFwibnVtYmVyXCIsIHRoZW46XG4gICAgICAgIGlmIChwID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAvLyBpLiBJZiB4IGlzIE5hTixcbiAgICAgICAgICAgIGlmIChpc05hTih4KSkge1xuICAgICAgICAgICAgICAgIC8vIDEuIExldCBuIGJlIGFuIElMRCBTdHJpbmcgdmFsdWUgaW5kaWNhdGluZyB0aGUgTmFOIHZhbHVlLlxuICAgICAgICAgICAgICAgIHZhciBuID0gaWxkLm5hbjtcbiAgICAgICAgICAgICAgICAvLyAyLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwibmFuXCIsIFtbdmFsdWVdXTogbiB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ25hbicsICdbW3ZhbHVlXV0nOiBuIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWkuIEVsc2UgaWYgaXNGaW5pdGUoeCkgaXMgZmFsc2UsXG4gICAgICAgICAgICBlbHNlIGlmICghaXNGaW5pdGUoeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMS4gTGV0IG4gYmUgYW4gSUxEIFN0cmluZyB2YWx1ZSBpbmRpY2F0aW5nIGluZmluaXR5LlxuICAgICAgICAgICAgICAgICAgICB2YXIgX24gPSBpbGQuaW5maW5pdHk7XG4gICAgICAgICAgICAgICAgICAgIC8vIDIuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJpbmZpbml0eVwiLCBbW3ZhbHVlXV06IG4gfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnaW5maW5pdHknLCAnW1t2YWx1ZV1dJzogX24gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlpaS4gRWxzZSxcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEuIElmIHRoZSB2YWx1ZSBvZiBudW1iZXJGb3JtYXQuW1tzdHlsZV1dIGlzIFwicGVyY2VudFwiIGFuZCBpc0Zpbml0ZSh4KSwgbGV0IHggYmUgMTAwIMOXIHguXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxbJ1tbc3R5bGVdXSddID09PSAncGVyY2VudCcgJiYgaXNGaW5pdGUoeCkpIHggKj0gMTAwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX24yID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMi4gSWYgdGhlIG51bWJlckZvcm1hdC5bW21pbmltdW1TaWduaWZpY2FudERpZ2l0c11dIGFuZCBudW1iZXJGb3JtYXQuW1ttYXhpbXVtU2lnbmlmaWNhbnREaWdpdHNdXSBhcmUgcHJlc2VudCwgdGhlblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhvcC5jYWxsKGludGVybmFsLCAnW1ttaW5pbXVtU2lnbmlmaWNhbnREaWdpdHNdXScpICYmIGhvcC5jYWxsKGludGVybmFsLCAnW1ttYXhpbXVtU2lnbmlmaWNhbnREaWdpdHNdXScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IG4gYmUgVG9SYXdQcmVjaXNpb24oeCwgbnVtYmVyRm9ybWF0LltbbWluaW11bVNpZ25pZmljYW50RGlnaXRzXV0sIG51bWJlckZvcm1hdC5bW21heGltdW1TaWduaWZpY2FudERpZ2l0c11dKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbjIgPSBUb1Jhd1ByZWNpc2lvbih4LCBpbnRlcm5hbFsnW1ttaW5pbXVtU2lnbmlmaWNhbnREaWdpdHNdXSddLCBpbnRlcm5hbFsnW1ttYXhpbXVtU2lnbmlmaWNhbnREaWdpdHNdXSddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMuIEVsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IG4gYmUgVG9SYXdGaXhlZCh4LCBudW1iZXJGb3JtYXQuW1ttaW5pbXVtSW50ZWdlckRpZ2l0c11dLCBudW1iZXJGb3JtYXQuW1ttaW5pbXVtRnJhY3Rpb25EaWdpdHNdXSwgbnVtYmVyRm9ybWF0LltbbWF4aW11bUZyYWN0aW9uRGlnaXRzXV0pLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbjIgPSBUb1Jhd0ZpeGVkKHgsIGludGVybmFsWydbW21pbmltdW1JbnRlZ2VyRGlnaXRzXV0nXSwgaW50ZXJuYWxbJ1tbbWluaW11bUZyYWN0aW9uRGlnaXRzXV0nXSwgaW50ZXJuYWxbJ1tbbWF4aW11bUZyYWN0aW9uRGlnaXRzXV0nXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNC4gSWYgdGhlIHZhbHVlIG9mIHRoZSBudW1iZXJGb3JtYXQuW1tudW1iZXJpbmdTeXN0ZW1dXSBtYXRjaGVzIG9uZSBvZiB0aGUgdmFsdWVzIGluIHRoZSBcIk51bWJlcmluZyBTeXN0ZW1cIiBjb2x1bW4gb2YgVGFibGUgMiBiZWxvdywgdGhlblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bVN5c1tudW1zXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCBkaWdpdHMgYmUgYW4gYXJyYXkgd2hvc2UgMTAgU3RyaW5nIHZhbHVlZCBlbGVtZW50cyBhcmUgdGhlIFVURi0xNiBzdHJpbmcgcmVwcmVzZW50YXRpb25zIG9mIHRoZSAxMCBkaWdpdHMgc3BlY2lmaWVkIGluIHRoZSBcIkRpZ2l0c1wiIGNvbHVtbiBvZiB0aGUgbWF0Y2hpbmcgcm93IGluIFRhYmxlIDIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaWdpdHMgPSBudW1TeXNbbnVtc107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIFJlcGxhY2UgZWFjaCBkaWdpdCBpbiBuIHdpdGggdGhlIHZhbHVlIG9mIGRpZ2l0c1tkaWdpdF0uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9uMiA9IFN0cmluZyhfbjIpLnJlcGxhY2UoL1xcZC9nLCBmdW5jdGlvbiAoZGlnaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkaWdpdHNbZGlnaXRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNS4gRWxzZSB1c2UgYW4gaW1wbGVtZW50YXRpb24gZGVwZW5kZW50IGFsZ29yaXRobSB0byBtYXAgbiB0byB0aGUgYXBwcm9wcmlhdGUgcmVwcmVzZW50YXRpb24gb2YgbiBpbiB0aGUgZ2l2ZW4gbnVtYmVyaW5nIHN5c3RlbS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgX24yID0gU3RyaW5nKF9uMik7IC8vICMjI1RPRE8jIyNcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGludGVnZXIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZnJhY3Rpb24gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA2LiBMZXQgZGVjaW1hbFNlcEluZGV4IGJlIENhbGwoJVN0cmluZ1Byb3RvX2luZGV4T2YlLCBuLCBcIi5cIiwgMCkuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVjaW1hbFNlcEluZGV4ID0gX24yLmluZGV4T2YoJy4nLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDcuIElmIGRlY2ltYWxTZXBJbmRleCA+IDAsIHRoZW46XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVjaW1hbFNlcEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCBpbnRlZ2VyIGJlIHRoZSBzdWJzdHJpbmcgb2YgbiBmcm9tIHBvc2l0aW9uIDAsIGluY2x1c2l2ZSwgdG8gcG9zaXRpb24gZGVjaW1hbFNlcEluZGV4LCBleGNsdXNpdmUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZWdlciA9IF9uMi5zdWJzdHJpbmcoMCwgZGVjaW1hbFNlcEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBMZXQgZnJhY3Rpb24gYmUgdGhlIHN1YnN0cmluZyBvZiBuIGZyb20gcG9zaXRpb24gZGVjaW1hbFNlcEluZGV4LCBleGNsdXNpdmUsIHRvIHRoZSBlbmQgb2Ygbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbiA9IF9uMi5zdWJzdHJpbmcoZGVjaW1hbFNlcEluZGV4ICsgMSwgZGVjaW1hbFNlcEluZGV4Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA4LiBFbHNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCBpbnRlZ2VyIGJlIG4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVnZXIgPSBfbjI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCBmcmFjdGlvbiBiZSB1bmRlZmluZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDkuIElmIHRoZSB2YWx1ZSBvZiB0aGUgbnVtYmVyRm9ybWF0LltbdXNlR3JvdXBpbmddXSBpcyB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsWydbW3VzZUdyb3VwaW5nXV0nXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCBncm91cFNlcFN5bWJvbCBiZSB0aGUgSUxORCBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBncm91cGluZyBzZXBhcmF0b3IuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwU2VwU3ltYm9sID0gaWxkLmdyb3VwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCBncm91cHMgYmUgYSBMaXN0IHdob3NlIGVsZW1lbnRzIGFyZSwgaW4gbGVmdCB0byByaWdodCBvcmRlciwgdGhlIHN1YnN0cmluZ3MgZGVmaW5lZCBieSBJTE5EIHNldCBvZiBsb2NhdGlvbnMgd2l0aGluIHRoZSBpbnRlZ2VyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBncm91cHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtLS0tPiBpbXBsZW1lbnRhdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmltYXJ5IGdyb3VwIHJlcHJlc2VudHMgdGhlIGdyb3VwIGNsb3Nlc3QgdG8gdGhlIGRlY2ltYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGdTaXplID0gZGF0YS5wYXR0ZXJucy5wcmltYXJ5R3JvdXBTaXplIHx8IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2Vjb25kYXJ5IGdyb3VwIGlzIGV2ZXJ5IG90aGVyIGdyb3VwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNnU2l6ZSA9IGRhdGEucGF0dGVybnMuc2Vjb25kYXJ5R3JvdXBTaXplIHx8IHBnU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHcm91cCBvbmx5IGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlZ2VyLmxlbmd0aCA+IHBnU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbmRleCBvZiB0aGUgcHJpbWFyeSBncm91cGluZyBzZXBhcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZCA9IGludGVnZXIubGVuZ3RoIC0gcGdTaXplO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydGluZyBpbmRleCBmb3Igb3VyIGxvb3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkeCA9IGVuZCAlIHNnU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gaW50ZWdlci5zbGljZSgwLCBpZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnQubGVuZ3RoKSBhcnJQdXNoLmNhbGwoZ3JvdXBzLCBzdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExvb3AgdG8gc2VwYXJhdGUgaW50byBzZWNvbmRhcnkgZ3JvdXBpbmcgZGlnaXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpZHggPCBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChncm91cHMsIGludGVnZXIuc2xpY2UoaWR4LCBpZHggKyBzZ1NpemUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkeCArPSBzZ1NpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBwcmltYXJ5IGdyb3VwaW5nIGRpZ2l0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJQdXNoLmNhbGwoZ3JvdXBzLCBpbnRlZ2VyLnNsaWNlKGVuZCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChncm91cHMsIGludGVnZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBBc3NlcnQ6IFRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gZ3JvdXBzIExpc3QgaXMgZ3JlYXRlciB0aGFuIDAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3Vwcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIFJlcGVhdCwgd2hpbGUgZ3JvdXBzIExpc3QgaXMgbm90IGVtcHR5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChncm91cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGkuIFJlbW92ZSB0aGUgZmlyc3QgZWxlbWVudCBmcm9tIGdyb3VwcyBhbmQgbGV0IGludGVnZXJHcm91cCBiZSB0aGUgdmFsdWUgb2YgdGhhdCBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW50ZWdlckdyb3VwID0gYXJyU2hpZnQuY2FsbChncm91cHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpaS4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImludGVnZXJcIiwgW1t2YWx1ZV1dOiBpbnRlZ2VyR3JvdXAgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnaW50ZWdlcicsICdbW3ZhbHVlXV0nOiBpbnRlZ2VyR3JvdXAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlpaS4gSWYgZ3JvdXBzIExpc3QgaXMgbm90IGVtcHR5LCB0aGVuOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImdyb3VwXCIsIFtbdmFsdWVdXTogZ3JvdXBTZXBTeW1ib2wgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ2dyb3VwJywgJ1tbdmFsdWVdXSc6IGdyb3VwU2VwU3ltYm9sIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMTAuIEVsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImludGVnZXJcIiwgW1t2YWx1ZV1dOiBpbnRlZ2VyIH0gYXMgYSBuZXcgZWxlbWVudCBvZiB0aGUgbGlzdCByZXN1bHQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ2ludGVnZXInLCAnW1t2YWx1ZV1dJzogaW50ZWdlciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAxMS4gSWYgZnJhY3Rpb24gaXMgbm90IHVuZGVmaW5lZCwgdGhlbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcmFjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IGRlY2ltYWxTZXBTeW1ib2wgYmUgdGhlIElMTkQgU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgZGVjaW1hbCBzZXBhcmF0b3IuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlY2ltYWxTZXBTeW1ib2wgPSBpbGQuZGVjaW1hbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwiZGVjaW1hbFwiLCBbW3ZhbHVlXV06IGRlY2ltYWxTZXBTeW1ib2wgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7ICdbW3R5cGVdXSc6ICdkZWNpbWFsJywgJ1tbdmFsdWVdXSc6IGRlY2ltYWxTZXBTeW1ib2wgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImZyYWN0aW9uXCIsIFtbdmFsdWVdXTogZnJhY3Rpb24gfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7ICdbW3R5cGVdXSc6ICdmcmFjdGlvbicsICdbW3ZhbHVlXV0nOiBmcmFjdGlvbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGEuIEVsc2UgaWYgcCBpcyBlcXVhbCBcInBsdXNTaWduXCIsIHRoZW46XG4gICAgICAgIGVsc2UgaWYgKHAgPT09IFwicGx1c1NpZ25cIikge1xuICAgICAgICAgICAgICAgIC8vIGkuIExldCBwbHVzU2lnblN5bWJvbCBiZSB0aGUgSUxORCBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBwbHVzIHNpZ24uXG4gICAgICAgICAgICAgICAgdmFyIHBsdXNTaWduU3ltYm9sID0gaWxkLnBsdXNTaWduO1xuICAgICAgICAgICAgICAgIC8vIGlpLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwicGx1c1NpZ25cIiwgW1t2YWx1ZV1dOiBwbHVzU2lnblN5bWJvbCB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ3BsdXNTaWduJywgJ1tbdmFsdWVdXSc6IHBsdXNTaWduU3ltYm9sIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gYS4gRWxzZSBpZiBwIGlzIGVxdWFsIFwibWludXNTaWduXCIsIHRoZW46XG4gICAgICAgICAgICBlbHNlIGlmIChwID09PSBcIm1pbnVzU2lnblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCBtaW51c1NpZ25TeW1ib2wgYmUgdGhlIElMTkQgU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWludXMgc2lnbi5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1pbnVzU2lnblN5bWJvbCA9IGlsZC5taW51c1NpZ247XG4gICAgICAgICAgICAgICAgICAgIC8vIGlpLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwibWludXNTaWduXCIsIFtbdmFsdWVdXTogbWludXNTaWduU3ltYm9sIH0gYXMgYSBuZXcgZWxlbWVudCBvZiB0aGUgbGlzdCByZXN1bHQuXG4gICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ21pbnVzU2lnbicsICdbW3ZhbHVlXV0nOiBtaW51c1NpZ25TeW1ib2wgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGEuIEVsc2UgaWYgcCBpcyBlcXVhbCBcInBlcmNlbnRTaWduXCIgYW5kIG51bWJlckZvcm1hdC5bW3N0eWxlXV0gaXMgXCJwZXJjZW50XCIsIHRoZW46XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocCA9PT0gXCJwZXJjZW50U2lnblwiICYmIGludGVybmFsWydbW3N0eWxlXV0nXSA9PT0gXCJwZXJjZW50XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCBwZXJjZW50U2lnblN5bWJvbCBiZSB0aGUgSUxORCBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBwZXJjZW50IHNpZ24uXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGVyY2VudFNpZ25TeW1ib2wgPSBpbGQucGVyY2VudFNpZ247XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpaS4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcInBlcmNlbnRTaWduXCIsIFtbdmFsdWVdXTogcGVyY2VudFNpZ25TeW1ib2wgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ2xpdGVyYWwnLCAnW1t2YWx1ZV1dJzogcGVyY2VudFNpZ25TeW1ib2wgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gYS4gRWxzZSBpZiBwIGlzIGVxdWFsIFwiY3VycmVuY3lcIiBhbmQgbnVtYmVyRm9ybWF0Lltbc3R5bGVdXSBpcyBcImN1cnJlbmN5XCIsIHRoZW46XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHAgPT09IFwiY3VycmVuY3lcIiAmJiBpbnRlcm5hbFsnW1tzdHlsZV1dJ10gPT09IFwiY3VycmVuY3lcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCBjdXJyZW5jeSBiZSB0aGUgdmFsdWUgb2YgbnVtYmVyRm9ybWF0LltbY3VycmVuY3ldXS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVuY3kgPSBpbnRlcm5hbFsnW1tjdXJyZW5jeV1dJ107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2QgPSB2b2lkIDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpaS4gSWYgbnVtYmVyRm9ybWF0LltbY3VycmVuY3lEaXNwbGF5XV0gaXMgXCJjb2RlXCIsIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxbJ1tbY3VycmVuY3lEaXNwbGF5XV0nXSA9PT0gXCJjb2RlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gTGV0IGNkIGJlIGN1cnJlbmN5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZCA9IGN1cnJlbmN5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpaWkuIEVsc2UgaWYgbnVtYmVyRm9ybWF0LltbY3VycmVuY3lEaXNwbGF5XV0gaXMgXCJzeW1ib2xcIiwgdGhlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGludGVybmFsWydbW2N1cnJlbmN5RGlzcGxheV1dJ10gPT09IFwic3ltYm9sXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEuIExldCBjZCBiZSBhbiBJTEQgc3RyaW5nIHJlcHJlc2VudGluZyBjdXJyZW5jeSBpbiBzaG9ydCBmb3JtLiBJZiB0aGUgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgaGF2ZSBzdWNoIGEgcmVwcmVzZW50YXRpb24gb2YgY3VycmVuY3ksIHVzZSBjdXJyZW5jeSBpdHNlbGYuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZCA9IGRhdGEuY3VycmVuY2llc1tjdXJyZW5jeV0gfHwgY3VycmVuY3k7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXYuIEVsc2UgaWYgbnVtYmVyRm9ybWF0LltbY3VycmVuY3lEaXNwbGF5XV0gaXMgXCJuYW1lXCIsIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW50ZXJuYWxbJ1tbY3VycmVuY3lEaXNwbGF5XV0nXSA9PT0gXCJuYW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxLiBMZXQgY2QgYmUgYW4gSUxEIHN0cmluZyByZXByZXNlbnRpbmcgY3VycmVuY3kgaW4gbG9uZyBmb3JtLiBJZiB0aGUgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgaGF2ZSBzdWNoIGEgcmVwcmVzZW50YXRpb24gb2YgY3VycmVuY3ksIHRoZW4gdXNlIGN1cnJlbmN5IGl0c2VsZi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZCA9IGN1cnJlbmN5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHYuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJjdXJyZW5jeVwiLCBbW3ZhbHVlXV06IGNkIH0gYXMgYSBuZXcgZWxlbWVudCBvZiB0aGUgbGlzdCByZXN1bHQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnY3VycmVuY3knLCAnW1t2YWx1ZV1dJzogY2QgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBFbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCBsaXRlcmFsIGJlIHRoZSBzdWJzdHJpbmcgb2YgcGF0dGVybiBmcm9tIHBvc2l0aW9uIGJlZ2luSW5kZXgsIGluY2x1c2l2ZSwgdG8gcG9zaXRpb24gZW5kSW5kZXgsIGluY2x1c2l2ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9saXRlcmFsID0gcGF0dGVybi5zdWJzdHJpbmcoYmVnaW5JbmRleCwgZW5kSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpaS4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImxpdGVyYWxcIiwgW1t2YWx1ZV1dOiBsaXRlcmFsIH0gYXMgYSBuZXcgZWxlbWVudCBvZiB0aGUgbGlzdCByZXN1bHQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ2xpdGVyYWwnLCAnW1t2YWx1ZV1dJzogX2xpdGVyYWwgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAvLyBhLiBTZXQgbmV4dEluZGV4IHRvIGVuZEluZGV4ICsgMS5cbiAgICAgICAgbmV4dEluZGV4ID0gZW5kSW5kZXggKyAxO1xuICAgICAgICAvLyBhLiBTZXQgYmVnaW5JbmRleCB0byBDYWxsKCVTdHJpbmdQcm90b19pbmRleE9mJSwgcGF0dGVybiwgXCJ7XCIsIG5leHRJbmRleClcbiAgICAgICAgYmVnaW5JbmRleCA9IHBhdHRlcm4uaW5kZXhPZigneycsIG5leHRJbmRleCk7XG4gICAgfVxuICAgIC8vIDkuIElmIG5leHRJbmRleCBpcyBsZXNzIHRoYW4gbGVuZ3RoLCB0aGVuOlxuICAgIGlmIChuZXh0SW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgLy8gYS4gTGV0IGxpdGVyYWwgYmUgdGhlIHN1YnN0cmluZyBvZiBwYXR0ZXJuIGZyb20gcG9zaXRpb24gbmV4dEluZGV4LCBpbmNsdXNpdmUsIHRvIHBvc2l0aW9uIGxlbmd0aCwgZXhjbHVzaXZlLlxuICAgICAgICB2YXIgX2xpdGVyYWwyID0gcGF0dGVybi5zdWJzdHJpbmcobmV4dEluZGV4LCBsZW5ndGgpO1xuICAgICAgICAvLyBhLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwibGl0ZXJhbFwiLCBbW3ZhbHVlXV06IGxpdGVyYWwgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnbGl0ZXJhbCcsICdbW3ZhbHVlXV0nOiBfbGl0ZXJhbDIgfSk7XG4gICAgfVxuICAgIC8vIDEwLiBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qXG4gKiBAc3BlY1tzdGFzbS9lY21hNDAyL251bWJlci1mb3JtYXQtdG8tcGFydHMvc3BlYy9udW1iZXJmb3JtYXQuaHRtbF1cbiAqIEBjbGF1c2Vbc2VjLWZvcm1hdG51bWJlcl1cbiAqL1xuZnVuY3Rpb24gRm9ybWF0TnVtYmVyKG51bWJlckZvcm1hdCwgeCkge1xuICAgIC8vIDEuIExldCBwYXJ0cyBiZSA/IFBhcnRpdGlvbk51bWJlclBhdHRlcm4obnVtYmVyRm9ybWF0LCB4KS5cbiAgICB2YXIgcGFydHMgPSBQYXJ0aXRpb25OdW1iZXJQYXR0ZXJuKG51bWJlckZvcm1hdCwgeCk7XG4gICAgLy8gMi4gTGV0IHJlc3VsdCBiZSBhbiBlbXB0eSBTdHJpbmcuXG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIC8vIDMuIEZvciBlYWNoIHBhcnQgaW4gcGFydHMsIGRvOlxuICAgIGZvciAodmFyIGkgPSAwOyBwYXJ0cy5sZW5ndGggPiBpOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBwYXJ0c1tpXTtcbiAgICAgICAgLy8gYS4gU2V0IHJlc3VsdCB0byBhIFN0cmluZyB2YWx1ZSBwcm9kdWNlZCBieSBjb25jYXRlbmF0aW5nIHJlc3VsdCBhbmQgcGFydC5bW3ZhbHVlXV0uXG4gICAgICAgIHJlc3VsdCArPSBwYXJ0WydbW3ZhbHVlXV0nXTtcbiAgICB9XG4gICAgLy8gNC4gUmV0dXJuIHJlc3VsdC5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIFRvUmF3UHJlY2lzaW9uIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCBhcmd1bWVudHMgeCAod2hpY2hcbiAqIG11c3QgYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlciksIG1pblByZWNpc2lvbiwgYW5kIG1heFByZWNpc2lvbiAoYm90aFxuICogbXVzdCBiZSBpbnRlZ2VycyBiZXR3ZWVuIDEgYW5kIDIxKSB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gVG9SYXdQcmVjaXNpb24oeCwgbWluUHJlY2lzaW9uLCBtYXhQcmVjaXNpb24pIHtcbiAgICAvLyAxLiBMZXQgcCBiZSBtYXhQcmVjaXNpb24uXG4gICAgdmFyIHAgPSBtYXhQcmVjaXNpb247XG5cbiAgICB2YXIgbSA9IHZvaWQgMCxcbiAgICAgICAgZSA9IHZvaWQgMDtcblxuICAgIC8vIDIuIElmIHggPSAwLCB0aGVuXG4gICAgaWYgKHggPT09IDApIHtcbiAgICAgICAgLy8gYS4gTGV0IG0gYmUgdGhlIFN0cmluZyBjb25zaXN0aW5nIG9mIHAgb2NjdXJyZW5jZXMgb2YgdGhlIGNoYXJhY3RlciBcIjBcIi5cbiAgICAgICAgbSA9IGFyckpvaW4uY2FsbChBcnJheShwICsgMSksICcwJyk7XG4gICAgICAgIC8vIGIuIExldCBlIGJlIDAuXG4gICAgICAgIGUgPSAwO1xuICAgIH1cbiAgICAvLyAzLiBFbHNlXG4gICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBhLiBMZXQgZSBhbmQgbiBiZSBpbnRlZ2VycyBzdWNoIHRoYXQgMTDhtZbigbvCuSDiiaQgbiA8IDEw4bWWIGFuZCBmb3Igd2hpY2ggdGhlXG4gICAgICAgICAgICAvLyAgICBleGFjdCBtYXRoZW1hdGljYWwgdmFsdWUgb2YgbiDDlyAxMOG1ieKBu+G1luKBusK5IOKAkyB4IGlzIGFzIGNsb3NlIHRvIHplcm8gYXNcbiAgICAgICAgICAgIC8vICAgIHBvc3NpYmxlLiBJZiB0aGVyZSBhcmUgdHdvIHN1Y2ggc2V0cyBvZiBlIGFuZCBuLCBwaWNrIHRoZSBlIGFuZCBuIGZvclxuICAgICAgICAgICAgLy8gICAgd2hpY2ggbiDDlyAxMOG1ieKBu+G1luKBusK5IGlzIGxhcmdlci5cbiAgICAgICAgICAgIGUgPSBsb2cxMEZsb29yKE1hdGguYWJzKHgpKTtcblxuICAgICAgICAgICAgLy8gRWFzaWVyIHRvIGdldCB0byBtIGZyb20gaGVyZVxuICAgICAgICAgICAgdmFyIGYgPSBNYXRoLnJvdW5kKE1hdGguZXhwKE1hdGguYWJzKGUgLSBwICsgMSkgKiBNYXRoLkxOMTApKTtcblxuICAgICAgICAgICAgLy8gYi4gTGV0IG0gYmUgdGhlIFN0cmluZyBjb25zaXN0aW5nIG9mIHRoZSBkaWdpdHMgb2YgdGhlIGRlY2ltYWxcbiAgICAgICAgICAgIC8vICAgIHJlcHJlc2VudGF0aW9uIG9mIG4gKGluIG9yZGVyLCB3aXRoIG5vIGxlYWRpbmcgemVyb2VzKVxuICAgICAgICAgICAgbSA9IFN0cmluZyhNYXRoLnJvdW5kKGUgLSBwICsgMSA8IDAgPyB4ICogZiA6IHggLyBmKSk7XG4gICAgICAgIH1cblxuICAgIC8vIDQuIElmIGUg4omlIHAsIHRoZW5cbiAgICBpZiAoZSA+PSBwKVxuICAgICAgICAvLyBhLiBSZXR1cm4gdGhlIGNvbmNhdGVuYXRpb24gb2YgbSBhbmQgZS1wKzEgb2NjdXJyZW5jZXMgb2YgdGhlIGNoYXJhY3RlciBcIjBcIi5cbiAgICAgICAgcmV0dXJuIG0gKyBhcnJKb2luLmNhbGwoQXJyYXkoZSAtIHAgKyAxICsgMSksICcwJyk7XG5cbiAgICAgICAgLy8gNS4gSWYgZSA9IHAtMSwgdGhlblxuICAgIGVsc2UgaWYgKGUgPT09IHAgLSAxKVxuICAgICAgICAgICAgLy8gYS4gUmV0dXJuIG0uXG4gICAgICAgICAgICByZXR1cm4gbTtcblxuICAgICAgICAgICAgLy8gNi4gSWYgZSDiiaUgMCwgdGhlblxuICAgICAgICBlbHNlIGlmIChlID49IDApXG4gICAgICAgICAgICAgICAgLy8gYS4gTGV0IG0gYmUgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlIGZpcnN0IGUrMSBjaGFyYWN0ZXJzIG9mIG0sIHRoZSBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAvLyAgICBcIi5cIiwgYW5kIHRoZSByZW1haW5pbmcgcOKAkyhlKzEpIGNoYXJhY3RlcnMgb2YgbS5cbiAgICAgICAgICAgICAgICBtID0gbS5zbGljZSgwLCBlICsgMSkgKyAnLicgKyBtLnNsaWNlKGUgKyAxKTtcblxuICAgICAgICAgICAgICAgIC8vIDcuIElmIGUgPCAwLCB0aGVuXG4gICAgICAgICAgICBlbHNlIGlmIChlIDwgMClcbiAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IG0gYmUgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlIFN0cmluZyBcIjAuXCIsIOKAkyhlKzEpIG9jY3VycmVuY2VzIG9mIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyAgICBjaGFyYWN0ZXIgXCIwXCIsIGFuZCB0aGUgc3RyaW5nIG0uXG4gICAgICAgICAgICAgICAgICAgIG0gPSAnMC4nICsgYXJySm9pbi5jYWxsKEFycmF5KC0oZSArIDEpICsgMSksICcwJykgKyBtO1xuXG4gICAgLy8gOC4gSWYgbSBjb250YWlucyB0aGUgY2hhcmFjdGVyIFwiLlwiLCBhbmQgbWF4UHJlY2lzaW9uID4gbWluUHJlY2lzaW9uLCB0aGVuXG4gICAgaWYgKG0uaW5kZXhPZihcIi5cIikgPj0gMCAmJiBtYXhQcmVjaXNpb24gPiBtaW5QcmVjaXNpb24pIHtcbiAgICAgICAgLy8gYS4gTGV0IGN1dCBiZSBtYXhQcmVjaXNpb24g4oCTIG1pblByZWNpc2lvbi5cbiAgICAgICAgdmFyIGN1dCA9IG1heFByZWNpc2lvbiAtIG1pblByZWNpc2lvbjtcblxuICAgICAgICAvLyBiLiBSZXBlYXQgd2hpbGUgY3V0ID4gMCBhbmQgdGhlIGxhc3QgY2hhcmFjdGVyIG9mIG0gaXMgXCIwXCI6XG4gICAgICAgIHdoaWxlIChjdXQgPiAwICYmIG0uY2hhckF0KG0ubGVuZ3RoIC0gMSkgPT09ICcwJykge1xuICAgICAgICAgICAgLy8gIGkuIFJlbW92ZSB0aGUgbGFzdCBjaGFyYWN0ZXIgZnJvbSBtLlxuICAgICAgICAgICAgbSA9IG0uc2xpY2UoMCwgLTEpO1xuXG4gICAgICAgICAgICAvLyAgaWkuIERlY3JlYXNlIGN1dCBieSAxLlxuICAgICAgICAgICAgY3V0LS07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjLiBJZiB0aGUgbGFzdCBjaGFyYWN0ZXIgb2YgbSBpcyBcIi5cIiwgdGhlblxuICAgICAgICBpZiAobS5jaGFyQXQobS5sZW5ndGggLSAxKSA9PT0gJy4nKVxuICAgICAgICAgICAgLy8gICAgaS4gUmVtb3ZlIHRoZSBsYXN0IGNoYXJhY3RlciBmcm9tIG0uXG4gICAgICAgICAgICBtID0gbS5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIC8vIDkuIFJldHVybiBtLlxuICAgIHJldHVybiBtO1xufVxuXG4vKipcbiAqIEBzcGVjW3RjMzkvZWNtYTQwMi9tYXN0ZXIvc3BlYy9udW1iZXJmb3JtYXQuaHRtbF1cbiAqIEBjbGF1c2Vbc2VjLXRvcmF3Zml4ZWRdXG4gKiBXaGVuIHRoZSBUb1Jhd0ZpeGVkIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCBhcmd1bWVudHMgeCAod2hpY2ggbXVzdFxuICogYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlciksIG1pbkludGVnZXIgKHdoaWNoIG11c3QgYmUgYW4gaW50ZWdlciBiZXR3ZWVuXG4gKiAxIGFuZCAyMSksIG1pbkZyYWN0aW9uLCBhbmQgbWF4RnJhY3Rpb24gKHdoaWNoIG11c3QgYmUgaW50ZWdlcnMgYmV0d2VlbiAwIGFuZFxuICogMjApIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG5mdW5jdGlvbiBUb1Jhd0ZpeGVkKHgsIG1pbkludGVnZXIsIG1pbkZyYWN0aW9uLCBtYXhGcmFjdGlvbikge1xuICAgIC8vIDEuIExldCBmIGJlIG1heEZyYWN0aW9uLlxuICAgIHZhciBmID0gbWF4RnJhY3Rpb247XG4gICAgLy8gMi4gTGV0IG4gYmUgYW4gaW50ZWdlciBmb3Igd2hpY2ggdGhlIGV4YWN0IG1hdGhlbWF0aWNhbCB2YWx1ZSBvZiBuIMO3IDEwZiDigJMgeCBpcyBhcyBjbG9zZSB0byB6ZXJvIGFzIHBvc3NpYmxlLiBJZiB0aGVyZSBhcmUgdHdvIHN1Y2ggbiwgcGljayB0aGUgbGFyZ2VyIG4uXG4gICAgdmFyIG4gPSBNYXRoLnBvdygxMCwgZikgKiB4OyAvLyBkaXZlcmdpbmcuLi5cbiAgICAvLyAzLiBJZiBuID0gMCwgbGV0IG0gYmUgdGhlIFN0cmluZyBcIjBcIi4gT3RoZXJ3aXNlLCBsZXQgbSBiZSB0aGUgU3RyaW5nIGNvbnNpc3Rpbmcgb2YgdGhlIGRpZ2l0cyBvZiB0aGUgZGVjaW1hbCByZXByZXNlbnRhdGlvbiBvZiBuIChpbiBvcmRlciwgd2l0aCBubyBsZWFkaW5nIHplcm9lcykuXG4gICAgdmFyIG0gPSBuID09PSAwID8gXCIwXCIgOiBuLnRvRml4ZWQoMCk7IC8vIGRpdmVyaW5nLi4uXG5cbiAgICB7XG4gICAgICAgIC8vIHRoaXMgZGl2ZXJzaW9uIGlzIG5lZWRlZCB0byB0YWtlIGludG8gY29uc2lkZXJhdGlvbiBiaWcgbnVtYmVycywgZS5nLjpcbiAgICAgICAgLy8gMS4yMzQ0NTAxZSszNyAtPiAxMjM0NDUwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICB2YXIgaWR4ID0gdm9pZCAwO1xuICAgICAgICB2YXIgZXhwID0gKGlkeCA9IG0uaW5kZXhPZignZScpKSA+IC0xID8gbS5zbGljZShpZHggKyAxKSA6IDA7XG4gICAgICAgIGlmIChleHApIHtcbiAgICAgICAgICAgIG0gPSBtLnNsaWNlKDAsIGlkeCkucmVwbGFjZSgnLicsICcnKTtcbiAgICAgICAgICAgIG0gKz0gYXJySm9pbi5jYWxsKEFycmF5KGV4cCAtIChtLmxlbmd0aCAtIDEpICsgMSksICcwJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaW50ID0gdm9pZCAwO1xuICAgIC8vIDQuIElmIGYg4omgIDAsIHRoZW5cbiAgICBpZiAoZiAhPT0gMCkge1xuICAgICAgICAvLyBhLiBMZXQgayBiZSB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgaW4gbS5cbiAgICAgICAgdmFyIGsgPSBtLmxlbmd0aDtcbiAgICAgICAgLy8gYS4gSWYgayDiiaQgZiwgdGhlblxuICAgICAgICBpZiAoayA8PSBmKSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQgeiBiZSB0aGUgU3RyaW5nIGNvbnNpc3Rpbmcgb2YgZisx4oCTayBvY2N1cnJlbmNlcyBvZiB0aGUgY2hhcmFjdGVyIFwiMFwiLlxuICAgICAgICAgICAgdmFyIHogPSBhcnJKb2luLmNhbGwoQXJyYXkoZiArIDEgLSBrICsgMSksICcwJyk7XG4gICAgICAgICAgICAvLyBpaS4gTGV0IG0gYmUgdGhlIGNvbmNhdGVuYXRpb24gb2YgU3RyaW5ncyB6IGFuZCBtLlxuICAgICAgICAgICAgbSA9IHogKyBtO1xuICAgICAgICAgICAgLy8gaWlpLiBMZXQgayBiZSBmKzEuXG4gICAgICAgICAgICBrID0gZiArIDE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYS4gTGV0IGEgYmUgdGhlIGZpcnN0IGvigJNmIGNoYXJhY3RlcnMgb2YgbSwgYW5kIGxldCBiIGJlIHRoZSByZW1haW5pbmcgZiBjaGFyYWN0ZXJzIG9mIG0uXG4gICAgICAgIHZhciBhID0gbS5zdWJzdHJpbmcoMCwgayAtIGYpLFxuICAgICAgICAgICAgYiA9IG0uc3Vic3RyaW5nKGsgLSBmLCBtLmxlbmd0aCk7XG4gICAgICAgIC8vIGEuIExldCBtIGJlIHRoZSBjb25jYXRlbmF0aW9uIG9mIHRoZSB0aHJlZSBTdHJpbmdzIGEsIFwiLlwiLCBhbmQgYi5cbiAgICAgICAgbSA9IGEgKyBcIi5cIiArIGI7XG4gICAgICAgIC8vIGEuIExldCBpbnQgYmUgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGluIGEuXG4gICAgICAgIGludCA9IGEubGVuZ3RoO1xuICAgIH1cbiAgICAvLyA1LiBFbHNlLCBsZXQgaW50IGJlIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyBpbiBtLlxuICAgIGVsc2UgaW50ID0gbS5sZW5ndGg7XG4gICAgLy8gNi4gTGV0IGN1dCBiZSBtYXhGcmFjdGlvbiDigJMgbWluRnJhY3Rpb24uXG4gICAgdmFyIGN1dCA9IG1heEZyYWN0aW9uIC0gbWluRnJhY3Rpb247XG4gICAgLy8gNy4gUmVwZWF0IHdoaWxlIGN1dCA+IDAgYW5kIHRoZSBsYXN0IGNoYXJhY3RlciBvZiBtIGlzIFwiMFwiOlxuICAgIHdoaWxlIChjdXQgPiAwICYmIG0uc2xpY2UoLTEpID09PSBcIjBcIikge1xuICAgICAgICAvLyBhLiBSZW1vdmUgdGhlIGxhc3QgY2hhcmFjdGVyIGZyb20gbS5cbiAgICAgICAgbSA9IG0uc2xpY2UoMCwgLTEpO1xuICAgICAgICAvLyBhLiBEZWNyZWFzZSBjdXQgYnkgMS5cbiAgICAgICAgY3V0LS07XG4gICAgfVxuICAgIC8vIDguIElmIHRoZSBsYXN0IGNoYXJhY3RlciBvZiBtIGlzIFwiLlwiLCB0aGVuXG4gICAgaWYgKG0uc2xpY2UoLTEpID09PSBcIi5cIikge1xuICAgICAgICAvLyBhLiBSZW1vdmUgdGhlIGxhc3QgY2hhcmFjdGVyIGZyb20gbS5cbiAgICAgICAgbSA9IG0uc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICAvLyA5LiBJZiBpbnQgPCBtaW5JbnRlZ2VyLCB0aGVuXG4gICAgaWYgKGludCA8IG1pbkludGVnZXIpIHtcbiAgICAgICAgLy8gYS4gTGV0IHogYmUgdGhlIFN0cmluZyBjb25zaXN0aW5nIG9mIG1pbkludGVnZXLigJNpbnQgb2NjdXJyZW5jZXMgb2YgdGhlIGNoYXJhY3RlciBcIjBcIi5cbiAgICAgICAgdmFyIF96ID0gYXJySm9pbi5jYWxsKEFycmF5KG1pbkludGVnZXIgLSBpbnQgKyAxKSwgJzAnKTtcbiAgICAgICAgLy8gYS4gTGV0IG0gYmUgdGhlIGNvbmNhdGVuYXRpb24gb2YgU3RyaW5ncyB6IGFuZCBtLlxuICAgICAgICBtID0gX3ogKyBtO1xuICAgIH1cbiAgICAvLyAxMC4gUmV0dXJuIG0uXG4gICAgcmV0dXJuIG07XG59XG5cbi8vIFNlY3QgMTEuMy4yIFRhYmxlIDIsIE51bWJlcmluZyBzeXN0ZW1zXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxudmFyIG51bVN5cyA9IHtcbiAgICBhcmFiOiBbXCLZoFwiLCBcItmhXCIsIFwi2aJcIiwgXCLZo1wiLCBcItmkXCIsIFwi2aVcIiwgXCLZplwiLCBcItmnXCIsIFwi2ahcIiwgXCLZqVwiXSxcbiAgICBhcmFiZXh0OiBbXCLbsFwiLCBcItuxXCIsIFwi27JcIiwgXCLbs1wiLCBcItu0XCIsIFwi27VcIiwgXCLbtlwiLCBcItu3XCIsIFwi27hcIiwgXCLbuVwiXSxcbiAgICBiYWxpOiBbXCLhrZBcIiwgXCLhrZFcIiwgXCLhrZJcIiwgXCLhrZNcIiwgXCLhrZRcIiwgXCLhrZVcIiwgXCLhrZZcIiwgXCLhrZdcIiwgXCLhrZhcIiwgXCLhrZlcIl0sXG4gICAgYmVuZzogW1wi4KemXCIsIFwi4KenXCIsIFwi4KeoXCIsIFwi4KepXCIsIFwi4KeqXCIsIFwi4KerXCIsIFwi4KesXCIsIFwi4KetXCIsIFwi4KeuXCIsIFwi4KevXCJdLFxuICAgIGRldmE6IFtcIuClplwiLCBcIuClp1wiLCBcIuClqFwiLCBcIuClqVwiLCBcIuClqlwiLCBcIuClq1wiLCBcIuClrFwiLCBcIuClrVwiLCBcIuClrlwiLCBcIuClr1wiXSxcbiAgICBmdWxsd2lkZTogW1wi77yQXCIsIFwi77yRXCIsIFwi77ySXCIsIFwi77yTXCIsIFwi77yUXCIsIFwi77yVXCIsIFwi77yWXCIsIFwi77yXXCIsIFwi77yYXCIsIFwi77yZXCJdLFxuICAgIGd1anI6IFtcIuCrplwiLCBcIuCrp1wiLCBcIuCrqFwiLCBcIuCrqVwiLCBcIuCrqlwiLCBcIuCrq1wiLCBcIuCrrFwiLCBcIuCrrVwiLCBcIuCrrlwiLCBcIuCrr1wiXSxcbiAgICBndXJ1OiBbXCLgqaZcIiwgXCLgqadcIiwgXCLgqahcIiwgXCLgqalcIiwgXCLgqapcIiwgXCLgqatcIiwgXCLgqaxcIiwgXCLgqa1cIiwgXCLgqa5cIiwgXCLgqa9cIl0sXG4gICAgaGFuaWRlYzogW1wi44CHXCIsIFwi5LiAXCIsIFwi5LqMXCIsIFwi5LiJXCIsIFwi5ZubXCIsIFwi5LqUXCIsIFwi5YWtXCIsIFwi5LiDXCIsIFwi5YWrXCIsIFwi5LmdXCJdLFxuICAgIGtobXI6IFtcIuGfoFwiLCBcIuGfoVwiLCBcIuGfolwiLCBcIuGfo1wiLCBcIuGfpFwiLCBcIuGfpVwiLCBcIuGfplwiLCBcIuGfp1wiLCBcIuGfqFwiLCBcIuGfqVwiXSxcbiAgICBrbmRhOiBbXCLgs6ZcIiwgXCLgs6dcIiwgXCLgs6hcIiwgXCLgs6lcIiwgXCLgs6pcIiwgXCLgs6tcIiwgXCLgs6xcIiwgXCLgs61cIiwgXCLgs65cIiwgXCLgs69cIl0sXG4gICAgbGFvbzogW1wi4LuQXCIsIFwi4LuRXCIsIFwi4LuSXCIsIFwi4LuTXCIsIFwi4LuUXCIsIFwi4LuVXCIsIFwi4LuWXCIsIFwi4LuXXCIsIFwi4LuYXCIsIFwi4LuZXCJdLFxuICAgIGxhdG46IFtcIjBcIiwgXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiLCBcIjZcIiwgXCI3XCIsIFwiOFwiLCBcIjlcIl0sXG4gICAgbGltYjogW1wi4aWGXCIsIFwi4aWHXCIsIFwi4aWIXCIsIFwi4aWJXCIsIFwi4aWKXCIsIFwi4aWLXCIsIFwi4aWMXCIsIFwi4aWNXCIsIFwi4aWOXCIsIFwi4aWPXCJdLFxuICAgIG1seW06IFtcIuC1plwiLCBcIuC1p1wiLCBcIuC1qFwiLCBcIuC1qVwiLCBcIuC1qlwiLCBcIuC1q1wiLCBcIuC1rFwiLCBcIuC1rVwiLCBcIuC1rlwiLCBcIuC1r1wiXSxcbiAgICBtb25nOiBbXCLhoJBcIiwgXCLhoJFcIiwgXCLhoJJcIiwgXCLhoJNcIiwgXCLhoJRcIiwgXCLhoJVcIiwgXCLhoJZcIiwgXCLhoJdcIiwgXCLhoJhcIiwgXCLhoJlcIl0sXG4gICAgbXltcjogW1wi4YGAXCIsIFwi4YGBXCIsIFwi4YGCXCIsIFwi4YGDXCIsIFwi4YGEXCIsIFwi4YGFXCIsIFwi4YGGXCIsIFwi4YGHXCIsIFwi4YGIXCIsIFwi4YGJXCJdLFxuICAgIG9yeWE6IFtcIuCtplwiLCBcIuCtp1wiLCBcIuCtqFwiLCBcIuCtqVwiLCBcIuCtqlwiLCBcIuCtq1wiLCBcIuCtrFwiLCBcIuCtrVwiLCBcIuCtrlwiLCBcIuCtr1wiXSxcbiAgICB0YW1sZGVjOiBbXCLgr6ZcIiwgXCLgr6dcIiwgXCLgr6hcIiwgXCLgr6lcIiwgXCLgr6pcIiwgXCLgr6tcIiwgXCLgr6xcIiwgXCLgr61cIiwgXCLgr65cIiwgXCLgr69cIl0sXG4gICAgdGVsdTogW1wi4LGmXCIsIFwi4LGnXCIsIFwi4LGoXCIsIFwi4LGpXCIsIFwi4LGqXCIsIFwi4LGrXCIsIFwi4LGsXCIsIFwi4LGtXCIsIFwi4LGuXCIsIFwi4LGvXCJdLFxuICAgIHRoYWk6IFtcIuC5kFwiLCBcIuC5kVwiLCBcIuC5klwiLCBcIuC5k1wiLCBcIuC5lFwiLCBcIuC5lVwiLCBcIuC5llwiLCBcIuC5l1wiLCBcIuC5mFwiLCBcIuC5mVwiXSxcbiAgICB0aWJ0OiBbXCLgvKBcIiwgXCLgvKFcIiwgXCLgvKJcIiwgXCLgvKNcIiwgXCLgvKRcIiwgXCLgvKVcIiwgXCLgvKZcIiwgXCLgvKdcIiwgXCLgvKhcIiwgXCLgvKlcIl1cbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIGxvY2FsZSBhbmQgZm9ybWF0dGluZyBvcHRpb25zIGNvbXB1dGVkXG4gKiBkdXJpbmcgaW5pdGlhbGl6YXRpb24gb2YgdGhlIG9iamVjdC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gcmV0dXJucyBhIG5ldyBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhbmQgYXR0cmlidXRlcyBhcmUgc2V0IGFzXG4gKiBpZiBjb25zdHJ1Y3RlZCBieSBhbiBvYmplY3QgbGl0ZXJhbCBhc3NpZ25pbmcgdG8gZWFjaCBvZiB0aGUgZm9sbG93aW5nXG4gKiBwcm9wZXJ0aWVzIHRoZSB2YWx1ZSBvZiB0aGUgY29ycmVzcG9uZGluZyBpbnRlcm5hbCBwcm9wZXJ0eSBvZiB0aGlzXG4gKiBOdW1iZXJGb3JtYXQgb2JqZWN0IChzZWUgMTEuNCk6IGxvY2FsZSwgbnVtYmVyaW5nU3lzdGVtLCBzdHlsZSwgY3VycmVuY3ksXG4gKiBjdXJyZW5jeURpc3BsYXksIG1pbmltdW1JbnRlZ2VyRGlnaXRzLCBtaW5pbXVtRnJhY3Rpb25EaWdpdHMsXG4gKiBtYXhpbXVtRnJhY3Rpb25EaWdpdHMsIG1pbmltdW1TaWduaWZpY2FudERpZ2l0cywgbWF4aW11bVNpZ25pZmljYW50RGlnaXRzLCBhbmRcbiAqIHVzZUdyb3VwaW5nLiBQcm9wZXJ0aWVzIHdob3NlIGNvcnJlc3BvbmRpbmcgaW50ZXJuYWwgcHJvcGVydGllcyBhcmUgbm90IHByZXNlbnRcbiAqIGFyZSBub3QgYXNzaWduZWQuXG4gKi9cbi8qIDExLjMuMyAqL2RlZmluZVByb3BlcnR5KEludGwuTnVtYmVyRm9ybWF0LnByb3RvdHlwZSwgJ3Jlc29sdmVkT3B0aW9ucycsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHZhbHVlKCkge1xuICAgICAgICB2YXIgcHJvcCA9IHZvaWQgMCxcbiAgICAgICAgICAgIGRlc2NzID0gbmV3IFJlY29yZCgpLFxuICAgICAgICAgICAgcHJvcHMgPSBbJ2xvY2FsZScsICdudW1iZXJpbmdTeXN0ZW0nLCAnc3R5bGUnLCAnY3VycmVuY3knLCAnY3VycmVuY3lEaXNwbGF5JywgJ21pbmltdW1JbnRlZ2VyRGlnaXRzJywgJ21pbmltdW1GcmFjdGlvbkRpZ2l0cycsICdtYXhpbXVtRnJhY3Rpb25EaWdpdHMnLCAnbWluaW11bVNpZ25pZmljYW50RGlnaXRzJywgJ21heGltdW1TaWduaWZpY2FudERpZ2l0cycsICd1c2VHcm91cGluZyddLFxuICAgICAgICAgICAgaW50ZXJuYWwgPSB0aGlzICE9PSBudWxsICYmIGJhYmVsSGVscGVycyQxW1widHlwZW9mXCJdKHRoaXMpID09PSAnb2JqZWN0JyAmJiBnZXRJbnRlcm5hbFByb3BlcnRpZXModGhpcyk7XG5cbiAgICAgICAgLy8gU2F0aXNmeSB0ZXN0IDExLjNfYlxuICAgICAgICBpZiAoIWludGVybmFsIHx8ICFpbnRlcm5hbFsnW1tpbml0aWFsaXplZE51bWJlckZvcm1hdF1dJ10pIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCB2YWx1ZSBmb3IgcmVzb2x2ZWRPcHRpb25zKCkgaXMgbm90IGFuIGluaXRpYWxpemVkIEludGwuTnVtYmVyRm9ybWF0IG9iamVjdC4nKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbWF4ID0gcHJvcHMubGVuZ3RoOyBpIDwgbWF4OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChob3AuY2FsbChpbnRlcm5hbCwgcHJvcCA9ICdbWycgKyBwcm9wc1tpXSArICddXScpKSBkZXNjc1twcm9wc1tpXV0gPSB7IHZhbHVlOiBpbnRlcm5hbFtwcm9wXSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9iakNyZWF0ZSh7fSwgZGVzY3MpO1xuICAgIH1cbn0pO1xuXG4vKiBqc2xpbnQgZXNuZXh0OiB0cnVlICovXG5cbi8vIE1hdGNoIHRoZXNlIGRhdGV0aW1lIGNvbXBvbmVudHMgaW4gYSBDTERSIHBhdHRlcm4sIGV4Y2VwdCB0aG9zZSBpbiBzaW5nbGUgcXVvdGVzXG52YXIgZXhwRFRDb21wb25lbnRzID0gLyg/OltFZWNdezEsNn18R3sxLDV9fFtRcV17MSw1fXwoPzpbeVl1cl0rfFV7MSw1fSl8W01MXXsxLDV9fGR7MSwyfXxEezEsM318RnsxfXxbYWJCXXsxLDV9fFtoa0hLXXsxLDJ9fHd7MSwyfXxXezF9fG17MSwyfXxzezEsMn18W3paT3ZWeFhdezEsNH0pKD89KFteJ10qJ1teJ10qJykqW14nXSokKS9nO1xuLy8gdHJpbSBwYXR0ZXJucyBhZnRlciB0cmFuc2Zvcm1hdGlvbnNcbnZhciBleHBQYXR0ZXJuVHJpbW1lciA9IC9eW1xcc1xcdUZFRkZcXHhBMF0rfFtcXHNcXHVGRUZGXFx4QTBdKyQvZztcbi8vIFNraXAgb3ZlciBwYXR0ZXJucyB3aXRoIHRoZXNlIGRhdGV0aW1lIGNvbXBvbmVudHMgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGRhdGFcbi8vIHRvIGJhY2sgdGhlbSB1cDpcbi8vIHRpbWV6b25lLCB3ZWVrZGF5LCBhbW91bmcgb3RoZXJzXG52YXIgdW53YW50ZWREVENzID0gL1tycVFBU2pKZ3dXSVFxXS87IC8vIHhYVk8gd2VyZSByZW1vdmVkIGZyb20gdGhpcyBsaXN0IGluIGZhdm9yIG9mIGNvbXB1dGluZyBtYXRjaGVzIHdpdGggdGltZVpvbmVOYW1lIHZhbHVlcyBidXQgcHJpbnRpbmcgYXMgZW1wdHkgc3RyaW5nXG5cbnZhciBkdEtleXMgPSBbXCJlcmFcIiwgXCJ5ZWFyXCIsIFwibW9udGhcIiwgXCJkYXlcIiwgXCJ3ZWVrZGF5XCIsIFwicXVhcnRlclwiXTtcbnZhciB0bUtleXMgPSBbXCJob3VyXCIsIFwibWludXRlXCIsIFwic2Vjb25kXCIsIFwiaG91cjEyXCIsIFwidGltZVpvbmVOYW1lXCJdO1xuXG5mdW5jdGlvbiBpc0RhdGVGb3JtYXRPbmx5KG9iaikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG1LZXlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkodG1LZXlzW2ldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpc1RpbWVGb3JtYXRPbmx5KG9iaikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHRLZXlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoZHRLZXlzW2ldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBqb2luRGF0ZUFuZFRpbWVGb3JtYXRzKGRhdGVGb3JtYXRPYmosIHRpbWVGb3JtYXRPYmopIHtcbiAgICB2YXIgbyA9IHsgXzoge30gfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGR0S2V5cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoZGF0ZUZvcm1hdE9ialtkdEtleXNbaV1dKSB7XG4gICAgICAgICAgICBvW2R0S2V5c1tpXV0gPSBkYXRlRm9ybWF0T2JqW2R0S2V5c1tpXV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGVGb3JtYXRPYmouX1tkdEtleXNbaV1dKSB7XG4gICAgICAgICAgICBvLl9bZHRLZXlzW2ldXSA9IGRhdGVGb3JtYXRPYmouX1tkdEtleXNbaV1dO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdG1LZXlzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmICh0aW1lRm9ybWF0T2JqW3RtS2V5c1tqXV0pIHtcbiAgICAgICAgICAgIG9bdG1LZXlzW2pdXSA9IHRpbWVGb3JtYXRPYmpbdG1LZXlzW2pdXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGltZUZvcm1hdE9iai5fW3RtS2V5c1tqXV0pIHtcbiAgICAgICAgICAgIG8uX1t0bUtleXNbal1dID0gdGltZUZvcm1hdE9iai5fW3RtS2V5c1tqXV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG87XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVGaW5hbFBhdHRlcm5zKGZvcm1hdE9iaikge1xuICAgIC8vIEZyb20gaHR0cDovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zOlxuICAgIC8vICAnSW4gcGF0dGVybnMsIHR3byBzaW5nbGUgcXVvdGVzIHJlcHJlc2VudHMgYSBsaXRlcmFsIHNpbmdsZSBxdW90ZSwgZWl0aGVyXG4gICAgLy8gICBpbnNpZGUgb3Igb3V0c2lkZSBzaW5nbGUgcXVvdGVzLiBUZXh0IHdpdGhpbiBzaW5nbGUgcXVvdGVzIGlzIG5vdFxuICAgIC8vICAgaW50ZXJwcmV0ZWQgaW4gYW55IHdheSAoZXhjZXB0IGZvciB0d28gYWRqYWNlbnQgc2luZ2xlIHF1b3RlcykuJ1xuICAgIGZvcm1hdE9iai5wYXR0ZXJuMTIgPSBmb3JtYXRPYmouZXh0ZW5kZWRQYXR0ZXJuLnJlcGxhY2UoLycoW14nXSopJy9nLCBmdW5jdGlvbiAoJDAsIGxpdGVyYWwpIHtcbiAgICAgICAgcmV0dXJuIGxpdGVyYWwgPyBsaXRlcmFsIDogXCInXCI7XG4gICAgfSk7XG5cbiAgICAvLyBwYXR0ZXJuIDEyIGlzIGFsd2F5cyB0aGUgZGVmYXVsdC4gd2UgY2FuIHByb2R1Y2UgdGhlIDI0IGJ5IHJlbW92aW5nIHthbXBtfVxuICAgIGZvcm1hdE9iai5wYXR0ZXJuID0gZm9ybWF0T2JqLnBhdHRlcm4xMi5yZXBsYWNlKCd7YW1wbX0nLCAnJykucmVwbGFjZShleHBQYXR0ZXJuVHJpbW1lciwgJycpO1xuICAgIHJldHVybiBmb3JtYXRPYmo7XG59XG5cbmZ1bmN0aW9uIGV4cERUQ29tcG9uZW50c01ldGEoJDAsIGZvcm1hdE9iaikge1xuICAgIHN3aXRjaCAoJDAuY2hhckF0KDApKSB7XG4gICAgICAgIC8vIC0tLSBFcmFcbiAgICAgICAgY2FzZSAnRyc6XG4gICAgICAgICAgICBmb3JtYXRPYmouZXJhID0gWydzaG9ydCcsICdzaG9ydCcsICdzaG9ydCcsICdsb25nJywgJ25hcnJvdyddWyQwLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuICd7ZXJhfSc7XG5cbiAgICAgICAgLy8gLS0tIFllYXJcbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgIGNhc2UgJ1knOlxuICAgICAgICBjYXNlICd1JzpcbiAgICAgICAgY2FzZSAnVSc6XG4gICAgICAgIGNhc2UgJ3InOlxuICAgICAgICAgICAgZm9ybWF0T2JqLnllYXIgPSAkMC5sZW5ndGggPT09IDIgPyAnMi1kaWdpdCcgOiAnbnVtZXJpYyc7XG4gICAgICAgICAgICByZXR1cm4gJ3t5ZWFyfSc7XG5cbiAgICAgICAgLy8gLS0tIFF1YXJ0ZXIgKG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBwb2x5ZmlsbClcbiAgICAgICAgY2FzZSAnUSc6XG4gICAgICAgIGNhc2UgJ3EnOlxuICAgICAgICAgICAgZm9ybWF0T2JqLnF1YXJ0ZXIgPSBbJ251bWVyaWMnLCAnMi1kaWdpdCcsICdzaG9ydCcsICdsb25nJywgJ25hcnJvdyddWyQwLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuICd7cXVhcnRlcn0nO1xuXG4gICAgICAgIC8vIC0tLSBNb250aFxuICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgY2FzZSAnTCc6XG4gICAgICAgICAgICBmb3JtYXRPYmoubW9udGggPSBbJ251bWVyaWMnLCAnMi1kaWdpdCcsICdzaG9ydCcsICdsb25nJywgJ25hcnJvdyddWyQwLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuICd7bW9udGh9JztcblxuICAgICAgICAvLyAtLS0gV2VlayAobm90IHN1cHBvcnRlZCBpbiB0aGlzIHBvbHlmaWxsKVxuICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgIC8vIHdlZWsgb2YgdGhlIHllYXJcbiAgICAgICAgICAgIGZvcm1hdE9iai53ZWVrID0gJDAubGVuZ3RoID09PSAyID8gJzItZGlnaXQnIDogJ251bWVyaWMnO1xuICAgICAgICAgICAgcmV0dXJuICd7d2Vla2RheX0nO1xuICAgICAgICBjYXNlICdXJzpcbiAgICAgICAgICAgIC8vIHdlZWsgb2YgdGhlIG1vbnRoXG4gICAgICAgICAgICBmb3JtYXRPYmoud2VlayA9ICdudW1lcmljJztcbiAgICAgICAgICAgIHJldHVybiAne3dlZWtkYXl9JztcblxuICAgICAgICAvLyAtLS0gRGF5XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgLy8gZGF5IG9mIHRoZSBtb250aFxuICAgICAgICAgICAgZm9ybWF0T2JqLmRheSA9ICQwLmxlbmd0aCA9PT0gMiA/ICcyLWRpZ2l0JyA6ICdudW1lcmljJztcbiAgICAgICAgICAgIHJldHVybiAne2RheX0nO1xuICAgICAgICBjYXNlICdEJzogLy8gZGF5IG9mIHRoZSB5ZWFyXG4gICAgICAgIGNhc2UgJ0YnOiAvLyBkYXkgb2YgdGhlIHdlZWtcbiAgICAgICAgY2FzZSAnZyc6XG4gICAgICAgICAgICAvLyAxLi5uOiBNb2RpZmllZCBKdWxpYW4gZGF5XG4gICAgICAgICAgICBmb3JtYXRPYmouZGF5ID0gJ251bWVyaWMnO1xuICAgICAgICAgICAgcmV0dXJuICd7ZGF5fSc7XG5cbiAgICAgICAgLy8gLS0tIFdlZWsgRGF5XG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgICAgLy8gZGF5IG9mIHRoZSB3ZWVrXG4gICAgICAgICAgICBmb3JtYXRPYmoud2Vla2RheSA9IFsnc2hvcnQnLCAnc2hvcnQnLCAnc2hvcnQnLCAnbG9uZycsICduYXJyb3cnLCAnc2hvcnQnXVskMC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHJldHVybiAne3dlZWtkYXl9JztcbiAgICAgICAgY2FzZSAnZSc6XG4gICAgICAgICAgICAvLyBsb2NhbCBkYXkgb2YgdGhlIHdlZWtcbiAgICAgICAgICAgIGZvcm1hdE9iai53ZWVrZGF5ID0gWydudW1lcmljJywgJzItZGlnaXQnLCAnc2hvcnQnLCAnbG9uZycsICduYXJyb3cnLCAnc2hvcnQnXVskMC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHJldHVybiAne3dlZWtkYXl9JztcbiAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgICAvLyBzdGFuZCBhbG9uZSBsb2NhbCBkYXkgb2YgdGhlIHdlZWtcbiAgICAgICAgICAgIGZvcm1hdE9iai53ZWVrZGF5ID0gWydudW1lcmljJywgdW5kZWZpbmVkLCAnc2hvcnQnLCAnbG9uZycsICduYXJyb3cnLCAnc2hvcnQnXVskMC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHJldHVybiAne3dlZWtkYXl9JztcblxuICAgICAgICAvLyAtLS0gUGVyaW9kXG4gICAgICAgIGNhc2UgJ2EnOiAvLyBBTSwgUE1cbiAgICAgICAgY2FzZSAnYic6IC8vIGFtLCBwbSwgbm9vbiwgbWlkbmlnaHRcbiAgICAgICAgY2FzZSAnQic6XG4gICAgICAgICAgICAvLyBmbGV4aWJsZSBkYXkgcGVyaW9kc1xuICAgICAgICAgICAgZm9ybWF0T2JqLmhvdXIxMiA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gJ3thbXBtfSc7XG5cbiAgICAgICAgLy8gLS0tIEhvdXJcbiAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgIGNhc2UgJ0gnOlxuICAgICAgICAgICAgZm9ybWF0T2JqLmhvdXIgPSAkMC5sZW5ndGggPT09IDIgPyAnMi1kaWdpdCcgOiAnbnVtZXJpYyc7XG4gICAgICAgICAgICByZXR1cm4gJ3tob3VyfSc7XG4gICAgICAgIGNhc2UgJ2snOlxuICAgICAgICBjYXNlICdLJzpcbiAgICAgICAgICAgIGZvcm1hdE9iai5ob3VyMTIgPSB0cnVlOyAvLyAxMi1ob3VyLWN5Y2xlIHRpbWUgZm9ybWF0cyAodXNpbmcgaCBvciBLKVxuICAgICAgICAgICAgZm9ybWF0T2JqLmhvdXIgPSAkMC5sZW5ndGggPT09IDIgPyAnMi1kaWdpdCcgOiAnbnVtZXJpYyc7XG4gICAgICAgICAgICByZXR1cm4gJ3tob3VyfSc7XG5cbiAgICAgICAgLy8gLS0tIE1pbnV0ZVxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIGZvcm1hdE9iai5taW51dGUgPSAkMC5sZW5ndGggPT09IDIgPyAnMi1kaWdpdCcgOiAnbnVtZXJpYyc7XG4gICAgICAgICAgICByZXR1cm4gJ3ttaW51dGV9JztcblxuICAgICAgICAvLyAtLS0gU2Vjb25kXG4gICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgZm9ybWF0T2JqLnNlY29uZCA9ICQwLmxlbmd0aCA9PT0gMiA/ICcyLWRpZ2l0JyA6ICdudW1lcmljJztcbiAgICAgICAgICAgIHJldHVybiAne3NlY29uZH0nO1xuICAgICAgICBjYXNlICdTJzpcbiAgICAgICAgY2FzZSAnQSc6XG4gICAgICAgICAgICBmb3JtYXRPYmouc2Vjb25kID0gJ251bWVyaWMnO1xuICAgICAgICAgICAgcmV0dXJuICd7c2Vjb25kfSc7XG5cbiAgICAgICAgLy8gLS0tIFRpbWV6b25lXG4gICAgICAgIGNhc2UgJ3onOiAvLyAxLi4zLCA0OiBzcGVjaWZpYyBub24tbG9jYXRpb24gZm9ybWF0XG4gICAgICAgIGNhc2UgJ1onOiAvLyAxLi4zLCA0LCA1OiBUaGUgSVNPODYwMSB2YXJpb3MgZm9ybWF0c1xuICAgICAgICBjYXNlICdPJzogLy8gMSwgNDogbWlsaXNlY29uZHMgaW4gZGF5IHNob3J0LCBsb25nXG4gICAgICAgIGNhc2UgJ3YnOiAvLyAxLCA0OiBnZW5lcmljIG5vbi1sb2NhdGlvbiBmb3JtYXRcbiAgICAgICAgY2FzZSAnVic6IC8vIDEsIDIsIDMsIDQ6IHRpbWUgem9uZSBJRCBvciBjaXR5XG4gICAgICAgIGNhc2UgJ1gnOiAvLyAxLCAyLCAzLCA0OiBUaGUgSVNPODYwMSB2YXJpb3MgZm9ybWF0c1xuICAgICAgICBjYXNlICd4JzpcbiAgICAgICAgICAgIC8vIDEsIDIsIDMsIDQ6IFRoZSBJU084NjAxIHZhcmlvcyBmb3JtYXRzXG4gICAgICAgICAgICAvLyB0aGlzIHBvbHlmaWxsIG9ubHkgc3VwcG9ydHMgbXVjaCwgZm9yIG5vdywgd2UgYXJlIGp1c3QgZG9pbmcgc29tZXRoaW5nIGR1bW15XG4gICAgICAgICAgICBmb3JtYXRPYmoudGltZVpvbmVOYW1lID0gJDAubGVuZ3RoIDwgNCA/ICdzaG9ydCcgOiAnbG9uZyc7XG4gICAgICAgICAgICByZXR1cm4gJ3t0aW1lWm9uZU5hbWV9JztcbiAgICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIENMRFIgYXZhaWxhYmxlRm9ybWF0cyBpbnRvIHRoZSBvYmplY3RzIGFuZCBwYXR0ZXJucyByZXF1aXJlZCBieVxuICogdGhlIEVDTUFTY3JpcHQgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJIHNwZWNpZmljYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURhdGVUaW1lRm9ybWF0KHNrZWxldG9uLCBwYXR0ZXJuKSB7XG4gICAgLy8gd2UgaWdub3JlIGNlcnRhaW4gcGF0dGVybnMgdGhhdCBhcmUgdW5zdXBwb3J0ZWQgdG8gYXZvaWQgdGhpcyBleHBlbnNpdmUgb3AuXG4gICAgaWYgKHVud2FudGVkRFRDcy50ZXN0KHBhdHRlcm4pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgdmFyIGZvcm1hdE9iaiA9IHtcbiAgICAgICAgb3JpZ2luYWxQYXR0ZXJuOiBwYXR0ZXJuLFxuICAgICAgICBfOiB7fVxuICAgIH07XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBwYXR0ZXJuIHN0cmluZyB3aXRoIHRoZSBvbmUgcmVxdWlyZWQgYnkgdGhlIHNwZWNpZmljYXRpb24sIHdoaWxzdFxuICAgIC8vIGF0IHRoZSBzYW1lIHRpbWUgZXZhbHVhdGluZyBpdCBmb3IgdGhlIHN1YnNldHMgYW5kIGZvcm1hdHNcbiAgICBmb3JtYXRPYmouZXh0ZW5kZWRQYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKGV4cERUQ29tcG9uZW50cywgZnVuY3Rpb24gKCQwKSB7XG4gICAgICAgIC8vIFNlZSB3aGljaCBzeW1ib2wgd2UncmUgZGVhbGluZyB3aXRoXG4gICAgICAgIHJldHVybiBleHBEVENvbXBvbmVudHNNZXRhKCQwLCBmb3JtYXRPYmouXyk7XG4gICAgfSk7XG5cbiAgICAvLyBNYXRjaCB0aGUgc2tlbGV0b24gc3RyaW5nIHdpdGggdGhlIG9uZSByZXF1aXJlZCBieSB0aGUgc3BlY2lmaWNhdGlvblxuICAgIC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgYmFzZWQgb24gdGhlIERhdGUgRmllbGQgU3ltYm9sIFRhYmxlOlxuICAgIC8vIGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRmllbGRfU3ltYm9sX1RhYmxlXG4gICAgLy8gTm90ZTogd2UgYXJlIGFkZGluZyBleHRyYSBkYXRhIHRvIHRoZSBmb3JtYXRPYmplY3QgZXZlbiB0aG91Z2ggdGhpcyBwb2x5ZmlsbFxuICAgIC8vICAgICAgIG1pZ2h0IG5vdCBzdXBwb3J0IGl0LlxuICAgIHNrZWxldG9uLnJlcGxhY2UoZXhwRFRDb21wb25lbnRzLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgICAgLy8gU2VlIHdoaWNoIHN5bWJvbCB3ZSdyZSBkZWFsaW5nIHdpdGhcbiAgICAgICAgcmV0dXJuIGV4cERUQ29tcG9uZW50c01ldGEoJDAsIGZvcm1hdE9iaik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29tcHV0ZUZpbmFsUGF0dGVybnMoZm9ybWF0T2JqKTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzZXMgRGF0ZVRpbWUgZm9ybWF0cyBmcm9tIENMRFIgdG8gYW4gZWFzaWVyLXRvLXBhcnNlIGZvcm1hdC5cbiAqIHRoZSByZXN1bHQgb2YgdGhpcyBvcGVyYXRpb24gc2hvdWxkIGJlIGNhY2hlZCB0aGUgZmlyc3QgdGltZSBhIHBhcnRpY3VsYXJcbiAqIGNhbGVuZGFyIGlzIGFuYWx5emVkLlxuICpcbiAqIFRoZSBzcGVjaWZpY2F0aW9uIHJlcXVpcmVzIHdlIHN1cHBvcnQgYXQgbGVhc3QgdGhlIGZvbGxvd2luZyBzdWJzZXRzIG9mXG4gKiBkYXRlL3RpbWUgY29tcG9uZW50czpcbiAqXG4gKiAgIC0gJ3dlZWtkYXknLCAneWVhcicsICdtb250aCcsICdkYXknLCAnaG91cicsICdtaW51dGUnLCAnc2Vjb25kJ1xuICogICAtICd3ZWVrZGF5JywgJ3llYXInLCAnbW9udGgnLCAnZGF5J1xuICogICAtICd5ZWFyJywgJ21vbnRoJywgJ2RheSdcbiAqICAgLSAneWVhcicsICdtb250aCdcbiAqICAgLSAnbW9udGgnLCAnZGF5J1xuICogICAtICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnXG4gKiAgIC0gJ2hvdXInLCAnbWludXRlJ1xuICpcbiAqIFdlIG5lZWQgdG8gY2hlcnJ5IHBpY2sgYXQgbGVhc3QgdGhlc2Ugc3Vic2V0cyBmcm9tIHRoZSBDTERSIGRhdGEgYW5kIGNvbnZlcnRcbiAqIHRoZW0gaW50byB0aGUgcGF0dGVybiBvYmplY3RzIHVzZWQgaW4gdGhlIEVDTUEtNDAyIEFQSS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRGF0ZVRpbWVGb3JtYXRzKGZvcm1hdHMpIHtcbiAgICB2YXIgYXZhaWxhYmxlRm9ybWF0cyA9IGZvcm1hdHMuYXZhaWxhYmxlRm9ybWF0cztcbiAgICB2YXIgdGltZUZvcm1hdHMgPSBmb3JtYXRzLnRpbWVGb3JtYXRzO1xuICAgIHZhciBkYXRlRm9ybWF0cyA9IGZvcm1hdHMuZGF0ZUZvcm1hdHM7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBza2VsZXRvbiA9IHZvaWQgMCxcbiAgICAgICAgcGF0dGVybiA9IHZvaWQgMCxcbiAgICAgICAgY29tcHV0ZWQgPSB2b2lkIDAsXG4gICAgICAgIGkgPSB2b2lkIDAsXG4gICAgICAgIGogPSB2b2lkIDA7XG4gICAgdmFyIHRpbWVSZWxhdGVkRm9ybWF0cyA9IFtdO1xuICAgIHZhciBkYXRlUmVsYXRlZEZvcm1hdHMgPSBbXTtcblxuICAgIC8vIE1hcCBhdmFpbGFibGUgKGN1c3RvbSkgZm9ybWF0cyBpbnRvIGEgcGF0dGVybiBmb3IgY3JlYXRlRGF0ZVRpbWVGb3JtYXRzXG4gICAgZm9yIChza2VsZXRvbiBpbiBhdmFpbGFibGVGb3JtYXRzKSB7XG4gICAgICAgIGlmIChhdmFpbGFibGVGb3JtYXRzLmhhc093blByb3BlcnR5KHNrZWxldG9uKSkge1xuICAgICAgICAgICAgcGF0dGVybiA9IGF2YWlsYWJsZUZvcm1hdHNbc2tlbGV0b25dO1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjcmVhdGVEYXRlVGltZUZvcm1hdChza2VsZXRvbiwgcGF0dGVybik7XG4gICAgICAgICAgICBpZiAoY29tcHV0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgICAgICAgLy8gaW4gc29tZSBjYXNlcywgdGhlIGZvcm1hdCBpcyBvbmx5IGRpc3BsYXlpbmcgZGF0ZSBzcGVjaWZpYyBwcm9wc1xuICAgICAgICAgICAgICAgIC8vIG9yIHRpbWUgc3BlY2lmaWMgcHJvcHMsIGluIHdoaWNoIGNhc2Ugd2UgbmVlZCB0byBhbHNvIHByb2R1Y2UgdGhlXG4gICAgICAgICAgICAgICAgLy8gY29tYmluZWQgZm9ybWF0cy5cbiAgICAgICAgICAgICAgICBpZiAoaXNEYXRlRm9ybWF0T25seShjb21wdXRlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVJlbGF0ZWRGb3JtYXRzLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNUaW1lRm9ybWF0T25seShjb21wdXRlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZVJlbGF0ZWRGb3JtYXRzLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcCB0aW1lIGZvcm1hdHMgaW50byBhIHBhdHRlcm4gZm9yIGNyZWF0ZURhdGVUaW1lRm9ybWF0c1xuICAgIGZvciAoc2tlbGV0b24gaW4gdGltZUZvcm1hdHMpIHtcbiAgICAgICAgaWYgKHRpbWVGb3JtYXRzLmhhc093blByb3BlcnR5KHNrZWxldG9uKSkge1xuICAgICAgICAgICAgcGF0dGVybiA9IHRpbWVGb3JtYXRzW3NrZWxldG9uXTtcbiAgICAgICAgICAgIGNvbXB1dGVkID0gY3JlYXRlRGF0ZVRpbWVGb3JtYXQoc2tlbGV0b24sIHBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKGNvbXB1dGVkKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgICAgICAgIHRpbWVSZWxhdGVkRm9ybWF0cy5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcCBkYXRlIGZvcm1hdHMgaW50byBhIHBhdHRlcm4gZm9yIGNyZWF0ZURhdGVUaW1lRm9ybWF0c1xuICAgIGZvciAoc2tlbGV0b24gaW4gZGF0ZUZvcm1hdHMpIHtcbiAgICAgICAgaWYgKGRhdGVGb3JtYXRzLmhhc093blByb3BlcnR5KHNrZWxldG9uKSkge1xuICAgICAgICAgICAgcGF0dGVybiA9IGRhdGVGb3JtYXRzW3NrZWxldG9uXTtcbiAgICAgICAgICAgIGNvbXB1dGVkID0gY3JlYXRlRGF0ZVRpbWVGb3JtYXQoc2tlbGV0b24sIHBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKGNvbXB1dGVkKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgICAgICAgIGRhdGVSZWxhdGVkRm9ybWF0cy5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvbWJpbmUgY3VzdG9tIHRpbWUgYW5kIGN1c3RvbSBkYXRlIGZvcm1hdHMgd2hlbiB0aGV5IGFyZSBvcnRob2dvbmFscyB0byBjb21wbGV0ZSB0aGVcbiAgICAvLyBmb3JtYXRzIHN1cHBvcnRlZCBieSBDTERSLlxuICAgIC8vIFRoaXMgQWxnbyBpcyBiYXNlZCBvbiBzZWN0aW9uIFwiTWlzc2luZyBTa2VsZXRvbiBGaWVsZHNcIiBmcm9tOlxuICAgIC8vIGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI2F2YWlsYWJsZUZvcm1hdHNfYXBwZW5kSXRlbXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGltZVJlbGF0ZWRGb3JtYXRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBkYXRlUmVsYXRlZEZvcm1hdHMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChkYXRlUmVsYXRlZEZvcm1hdHNbal0ubW9udGggPT09ICdsb25nJykge1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBkYXRlUmVsYXRlZEZvcm1hdHNbal0ud2Vla2RheSA/IGZvcm1hdHMuZnVsbCA6IGZvcm1hdHMubG9uZztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0ZVJlbGF0ZWRGb3JtYXRzW2pdLm1vbnRoID09PSAnc2hvcnQnKSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IGZvcm1hdHMubWVkaXVtO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gZm9ybWF0cy5zaG9ydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXB1dGVkID0gam9pbkRhdGVBbmRUaW1lRm9ybWF0cyhkYXRlUmVsYXRlZEZvcm1hdHNbal0sIHRpbWVSZWxhdGVkRm9ybWF0c1tpXSk7XG4gICAgICAgICAgICBjb21wdXRlZC5vcmlnaW5hbFBhdHRlcm4gPSBwYXR0ZXJuO1xuICAgICAgICAgICAgY29tcHV0ZWQuZXh0ZW5kZWRQYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKCd7MH0nLCB0aW1lUmVsYXRlZEZvcm1hdHNbaV0uZXh0ZW5kZWRQYXR0ZXJuKS5yZXBsYWNlKCd7MX0nLCBkYXRlUmVsYXRlZEZvcm1hdHNbal0uZXh0ZW5kZWRQYXR0ZXJuKS5yZXBsYWNlKC9eWyxcXHNdK3xbLFxcc10rJC9naSwgJycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tcHV0ZUZpbmFsUGF0dGVybnMoY29tcHV0ZWQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIHRoaXMgcmVwcmVzZW50cyB0aGUgZXhjZXB0aW9ucyBvZiB0aGUgcnVsZSB0aGF0IGFyZSBub3QgY292ZXJlZCBieSBDTERSIGF2YWlsYWJsZUZvcm1hdHNcbi8vIGZvciBzaW5nbGUgcHJvcGVydHkgY29uZmlndXJhdGlvbnMsIHRoZXkgcGxheSBubyByb2xlIHdoZW4gdXNpbmcgbXVsdGlwbGUgcHJvcGVydGllcywgYW5kXG4vLyB0aG9zZSB0aGF0IGFyZSBub3QgaW4gdGhpcyB0YWJsZSwgYXJlIG5vdCBleGNlcHRpb25zIG9yIGFyZSBub3QgY292ZXJlZCBieSB0aGUgZGF0YSB3ZVxuLy8gcHJvdmlkZS5cbnZhciB2YWxpZFN5bnRoZXRpY1Byb3BzID0ge1xuICAgIHNlY29uZDoge1xuICAgICAgICBudW1lcmljOiAncycsXG4gICAgICAgICcyLWRpZ2l0JzogJ3NzJ1xuICAgIH0sXG4gICAgbWludXRlOiB7XG4gICAgICAgIG51bWVyaWM6ICdtJyxcbiAgICAgICAgJzItZGlnaXQnOiAnbW0nXG4gICAgfSxcbiAgICB5ZWFyOiB7XG4gICAgICAgIG51bWVyaWM6ICd5JyxcbiAgICAgICAgJzItZGlnaXQnOiAneXknXG4gICAgfSxcbiAgICBkYXk6IHtcbiAgICAgICAgbnVtZXJpYzogJ2QnLFxuICAgICAgICAnMi1kaWdpdCc6ICdkZCdcbiAgICB9LFxuICAgIG1vbnRoOiB7XG4gICAgICAgIG51bWVyaWM6ICdMJyxcbiAgICAgICAgJzItZGlnaXQnOiAnTEwnLFxuICAgICAgICBuYXJyb3c6ICdMTExMTCcsXG4gICAgICAgIHNob3J0OiAnTExMJyxcbiAgICAgICAgbG9uZzogJ0xMTEwnXG4gICAgfSxcbiAgICB3ZWVrZGF5OiB7XG4gICAgICAgIG5hcnJvdzogJ2NjY2NjJyxcbiAgICAgICAgc2hvcnQ6ICdjY2MnLFxuICAgICAgICBsb25nOiAnY2NjYydcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBnZW5lcmF0ZVN5bnRoZXRpY0Zvcm1hdChwcm9wTmFtZSwgcHJvcFZhbHVlKSB7XG4gICAgaWYgKHZhbGlkU3ludGhldGljUHJvcHNbcHJvcE5hbWVdICYmIHZhbGlkU3ludGhldGljUHJvcHNbcHJvcE5hbWVdW3Byb3BWYWx1ZV0pIHtcbiAgICAgICAgdmFyIF9yZWYyO1xuXG4gICAgICAgIHJldHVybiBfcmVmMiA9IHtcbiAgICAgICAgICAgIG9yaWdpbmFsUGF0dGVybjogdmFsaWRTeW50aGV0aWNQcm9wc1twcm9wTmFtZV1bcHJvcFZhbHVlXSxcbiAgICAgICAgICAgIF86IGRlZmluZVByb3BlcnR5JDEoe30sIHByb3BOYW1lLCBwcm9wVmFsdWUpLFxuICAgICAgICAgICAgZXh0ZW5kZWRQYXR0ZXJuOiBcIntcIiArIHByb3BOYW1lICsgXCJ9XCJcbiAgICAgICAgfSwgZGVmaW5lUHJvcGVydHkkMShfcmVmMiwgcHJvcE5hbWUsIHByb3BWYWx1ZSksIGRlZmluZVByb3BlcnR5JDEoX3JlZjIsIFwicGF0dGVybjEyXCIsIFwie1wiICsgcHJvcE5hbWUgKyBcIn1cIiksIGRlZmluZVByb3BlcnR5JDEoX3JlZjIsIFwicGF0dGVyblwiLCBcIntcIiArIHByb3BOYW1lICsgXCJ9XCIpLCBfcmVmMjtcbiAgICB9XG59XG5cbi8vIEFuIG9iamVjdCBtYXAgb2YgZGF0ZSBjb21wb25lbnQga2V5cywgc2F2ZXMgdXNpbmcgYSByZWdleCBsYXRlclxudmFyIGRhdGVXaWR0aHMgPSBvYmpDcmVhdGUobnVsbCwgeyBuYXJyb3c6IHt9LCBzaG9ydDoge30sIGxvbmc6IHt9IH0pO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgZm9yIGEgZGF0ZSBjb21wb25lbnQsIHJlc29sdmVkIHVzaW5nIG11bHRpcGxlIGluaGVyaXRhbmNlIGFzIHNwZWNpZmllZFxuICogYXMgc3BlY2lmaWVkIGluIHRoZSBVbmljb2RlIFRlY2huaWNhbCBTdGFuZGFyZCAzNS5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZURhdGVTdHJpbmcoZGF0YSwgY2EsIGNvbXBvbmVudCwgd2lkdGgsIGtleSkge1xuICAgIC8vIEZyb20gaHR0cDovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS5odG1sI011bHRpcGxlX0luaGVyaXRhbmNlOlxuICAgIC8vICdJbiBjbGVhcmx5IHNwZWNpZmllZCBpbnN0YW5jZXMsIHJlc291cmNlcyBtYXkgaW5oZXJpdCBmcm9tIHdpdGhpbiB0aGUgc2FtZSBsb2NhbGUuXG4gICAgLy8gIEZvciBleGFtcGxlLCAuLi4gdGhlIEJ1ZGRoaXN0IGNhbGVuZGFyIGluaGVyaXRzIGZyb20gdGhlIEdyZWdvcmlhbiBjYWxlbmRhci4nXG4gICAgdmFyIG9iaiA9IGRhdGFbY2FdICYmIGRhdGFbY2FdW2NvbXBvbmVudF0gPyBkYXRhW2NhXVtjb21wb25lbnRdIDogZGF0YS5ncmVnb3J5W2NvbXBvbmVudF0sXG5cblxuICAgIC8vIFwic2lkZXdheXNcIiBpbmhlcml0YW5jZSByZXNvbHZlcyBzdHJpbmdzIHdoZW4gYSBrZXkgZG9lc24ndCBleGlzdFxuICAgIGFsdHMgPSB7XG4gICAgICAgIG5hcnJvdzogWydzaG9ydCcsICdsb25nJ10sXG4gICAgICAgIHNob3J0OiBbJ2xvbmcnLCAnbmFycm93J10sXG4gICAgICAgIGxvbmc6IFsnc2hvcnQnLCAnbmFycm93J11cbiAgICB9LFxuXG5cbiAgICAvL1xuICAgIHJlc29sdmVkID0gaG9wLmNhbGwob2JqLCB3aWR0aCkgPyBvYmpbd2lkdGhdIDogaG9wLmNhbGwob2JqLCBhbHRzW3dpZHRoXVswXSkgPyBvYmpbYWx0c1t3aWR0aF1bMF1dIDogb2JqW2FsdHNbd2lkdGhdWzFdXTtcblxuICAgIC8vIGBrZXlgIHdvdWxkbid0IGJlIHNwZWNpZmllZCBmb3IgY29tcG9uZW50cyAnZGF5UGVyaW9kcydcbiAgICByZXR1cm4ga2V5ICE9PSBudWxsID8gcmVzb2x2ZWRba2V5XSA6IHJlc29sdmVkO1xufVxuXG4vLyBEZWZpbmUgdGhlIERhdGVUaW1lRm9ybWF0IGNvbnN0cnVjdG9yIGludGVybmFsbHkgc28gaXQgY2Fubm90IGJlIHRhaW50ZWRcbmZ1bmN0aW9uIERhdGVUaW1lRm9ybWF0Q29uc3RydWN0b3IoKSB7XG4gICAgdmFyIGxvY2FsZXMgPSBhcmd1bWVudHNbMF07XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV07XG5cbiAgICBpZiAoIXRoaXMgfHwgdGhpcyA9PT0gSW50bCkge1xuICAgICAgICByZXR1cm4gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobG9jYWxlcywgb3B0aW9ucyk7XG4gICAgfVxuICAgIHJldHVybiBJbml0aWFsaXplRGF0ZVRpbWVGb3JtYXQodG9PYmplY3QodGhpcyksIGxvY2FsZXMsIG9wdGlvbnMpO1xufVxuXG5kZWZpbmVQcm9wZXJ0eShJbnRsLCAnRGF0ZVRpbWVGb3JtYXQnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBEYXRlVGltZUZvcm1hdENvbnN0cnVjdG9yXG59KTtcblxuLy8gTXVzdCBleHBsaWNpdGx5IHNldCBwcm90b3R5cGVzIGFzIHVud3JpdGFibGVcbmRlZmluZVByb3BlcnR5KERhdGVUaW1lRm9ybWF0Q29uc3RydWN0b3IsICdwcm90b3R5cGUnLCB7XG4gICAgd3JpdGFibGU6IGZhbHNlXG59KTtcblxuLyoqXG4gKiBUaGUgYWJzdHJhY3Qgb3BlcmF0aW9uIEluaXRpYWxpemVEYXRlVGltZUZvcm1hdCBhY2NlcHRzIHRoZSBhcmd1bWVudHMgZGF0ZVRpbWVGb3JtYXRcbiAqICh3aGljaCBtdXN0IGJlIGFuIG9iamVjdCksIGxvY2FsZXMsIGFuZCBvcHRpb25zLiBJdCBpbml0aWFsaXplcyBkYXRlVGltZUZvcm1hdCBhcyBhXG4gKiBEYXRlVGltZUZvcm1hdCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIC8qIDEyLjEuMS4xICovSW5pdGlhbGl6ZURhdGVUaW1lRm9ybWF0KGRhdGVUaW1lRm9ybWF0LCBsb2NhbGVzLCBvcHRpb25zKSB7XG4gICAgLy8gVGhpcyB3aWxsIGJlIGEgaW50ZXJuYWwgcHJvcGVydGllcyBvYmplY3QgaWYgd2UncmUgbm90IGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgICB2YXIgaW50ZXJuYWwgPSBnZXRJbnRlcm5hbFByb3BlcnRpZXMoZGF0ZVRpbWVGb3JtYXQpO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB3aG9zZSBwcm9wcyBjYW4gYmUgdXNlZCB0byByZXN0b3JlIHRoZSB2YWx1ZXMgb2YgUmVnRXhwIHByb3BzXG4gICAgdmFyIHJlZ2V4cFJlc3RvcmUgPSBjcmVhdGVSZWdFeHBSZXN0b3JlKCk7XG5cbiAgICAvLyAxLiBJZiBkYXRlVGltZUZvcm1hdCBoYXMgYW4gW1tpbml0aWFsaXplZEludGxPYmplY3RdXSBpbnRlcm5hbCBwcm9wZXJ0eSB3aXRoXG4gICAgLy8gICAgdmFsdWUgdHJ1ZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgIGlmIChpbnRlcm5hbFsnW1tpbml0aWFsaXplZEludGxPYmplY3RdXSddID09PSB0cnVlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2Agb2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQgYXMgYW4gSW50bCBvYmplY3QnKTtcblxuICAgIC8vIE5lZWQgdGhpcyB0byBhY2Nlc3MgdGhlIGBpbnRlcm5hbGAgb2JqZWN0XG4gICAgZGVmaW5lUHJvcGVydHkoZGF0ZVRpbWVGb3JtYXQsICdfX2dldEludGVybmFsUHJvcGVydGllcycsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHZhbHVlKCkge1xuICAgICAgICAgICAgLy8gTk9URTogTm9uLXN0YW5kYXJkLCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IHNlY3JldCkgcmV0dXJuIGludGVybmFsO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyAyLiBTZXQgdGhlIFtbaW5pdGlhbGl6ZWRJbnRsT2JqZWN0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIHRydWUuXG4gICAgaW50ZXJuYWxbJ1tbaW5pdGlhbGl6ZWRJbnRsT2JqZWN0XV0nXSA9IHRydWU7XG5cbiAgICAvLyAzLiBMZXQgcmVxdWVzdGVkTG9jYWxlcyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIENhbm9uaWNhbGl6ZUxvY2FsZUxpc3RcbiAgICAvLyAgICBhYnN0cmFjdCBvcGVyYXRpb24gKGRlZmluZWQgaW4gOS4yLjEpIHdpdGggYXJndW1lbnQgbG9jYWxlcy5cbiAgICB2YXIgcmVxdWVzdGVkTG9jYWxlcyA9IENhbm9uaWNhbGl6ZUxvY2FsZUxpc3QobG9jYWxlcyk7XG5cbiAgICAvLyA0LiBMZXQgb3B0aW9ucyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFRvRGF0ZVRpbWVPcHRpb25zIGFic3RyYWN0XG4gICAgLy8gICAgb3BlcmF0aW9uIChkZWZpbmVkIGJlbG93KSB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLCBcImFueVwiLCBhbmQgXCJkYXRlXCIuXG4gICAgb3B0aW9ucyA9IFRvRGF0ZVRpbWVPcHRpb25zKG9wdGlvbnMsICdhbnknLCAnZGF0ZScpO1xuXG4gICAgLy8gNS4gTGV0IG9wdCBiZSBhIG5ldyBSZWNvcmQuXG4gICAgdmFyIG9wdCA9IG5ldyBSZWNvcmQoKTtcblxuICAgIC8vIDYuIExldCBtYXRjaGVyIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0T3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvblxuICAgIC8vICAgIChkZWZpbmVkIGluIDkuMi45KSB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLCBcImxvY2FsZU1hdGNoZXJcIiwgXCJzdHJpbmdcIiwgYSBMaXN0XG4gICAgLy8gICAgY29udGFpbmluZyB0aGUgdHdvIFN0cmluZyB2YWx1ZXMgXCJsb29rdXBcIiBhbmQgXCJiZXN0IGZpdFwiLCBhbmQgXCJiZXN0IGZpdFwiLlxuICAgIHZhciBtYXRjaGVyID0gR2V0T3B0aW9uKG9wdGlvbnMsICdsb2NhbGVNYXRjaGVyJywgJ3N0cmluZycsIG5ldyBMaXN0KCdsb29rdXAnLCAnYmVzdCBmaXQnKSwgJ2Jlc3QgZml0Jyk7XG5cbiAgICAvLyA3LiBTZXQgb3B0LltbbG9jYWxlTWF0Y2hlcl1dIHRvIG1hdGNoZXIuXG4gICAgb3B0WydbW2xvY2FsZU1hdGNoZXJdXSddID0gbWF0Y2hlcjtcblxuICAgIC8vIDguIExldCBEYXRlVGltZUZvcm1hdCBiZSB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gb2JqZWN0IHRoYXQgaXMgdGhlIGluaXRpYWxcbiAgICAvLyAgICB2YWx1ZSBvZiBJbnRsLkRhdGVUaW1lRm9ybWF0LlxuICAgIHZhciBEYXRlVGltZUZvcm1hdCA9IGludGVybmFscy5EYXRlVGltZUZvcm1hdDsgLy8gVGhpcyBpcyB3aGF0IHdlICpyZWFsbHkqIG5lZWRcblxuICAgIC8vIDkuIExldCBsb2NhbGVEYXRhIGJlIHRoZSB2YWx1ZSBvZiB0aGUgW1tsb2NhbGVEYXRhXV0gaW50ZXJuYWwgcHJvcGVydHkgb2ZcbiAgICAvLyAgICBEYXRlVGltZUZvcm1hdC5cbiAgICB2YXIgbG9jYWxlRGF0YSA9IERhdGVUaW1lRm9ybWF0WydbW2xvY2FsZURhdGFdXSddO1xuXG4gICAgLy8gMTAuIExldCByIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgUmVzb2x2ZUxvY2FsZSBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAvLyAgICAgKGRlZmluZWQgaW4gOS4yLjUpIHdpdGggdGhlIFtbYXZhaWxhYmxlTG9jYWxlc11dIGludGVybmFsIHByb3BlcnR5IG9mXG4gICAgLy8gICAgICBEYXRlVGltZUZvcm1hdCwgcmVxdWVzdGVkTG9jYWxlcywgb3B0LCB0aGUgW1tyZWxldmFudEV4dGVuc2lvbktleXNdXVxuICAgIC8vICAgICAgaW50ZXJuYWwgcHJvcGVydHkgb2YgRGF0ZVRpbWVGb3JtYXQsIGFuZCBsb2NhbGVEYXRhLlxuICAgIHZhciByID0gUmVzb2x2ZUxvY2FsZShEYXRlVGltZUZvcm1hdFsnW1thdmFpbGFibGVMb2NhbGVzXV0nXSwgcmVxdWVzdGVkTG9jYWxlcywgb3B0LCBEYXRlVGltZUZvcm1hdFsnW1tyZWxldmFudEV4dGVuc2lvbktleXNdXSddLCBsb2NhbGVEYXRhKTtcblxuICAgIC8vIDExLiBTZXQgdGhlIFtbbG9jYWxlXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gdGhlIHZhbHVlIG9mXG4gICAgLy8gICAgIHIuW1tsb2NhbGVdXS5cbiAgICBpbnRlcm5hbFsnW1tsb2NhbGVdXSddID0gclsnW1tsb2NhbGVdXSddO1xuXG4gICAgLy8gMTIuIFNldCB0aGUgW1tjYWxlbmRhcl1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0IHRvIHRoZSB2YWx1ZSBvZlxuICAgIC8vICAgICByLltbY2FdXS5cbiAgICBpbnRlcm5hbFsnW1tjYWxlbmRhcl1dJ10gPSByWydbW2NhXV0nXTtcblxuICAgIC8vIDEzLiBTZXQgdGhlIFtbbnVtYmVyaW5nU3lzdGVtXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gdGhlIHZhbHVlIG9mXG4gICAgLy8gICAgIHIuW1tudV1dLlxuICAgIGludGVybmFsWydbW251bWJlcmluZ1N5c3RlbV1dJ10gPSByWydbW251XV0nXTtcblxuICAgIC8vIFRoZSBzcGVjaWZpY2F0aW9uIGRvZXNuJ3QgdGVsbCB1cyB0byBkbyB0aGlzLCBidXQgaXQncyBoZWxwZnVsIGxhdGVyIG9uXG4gICAgaW50ZXJuYWxbJ1tbZGF0YUxvY2FsZV1dJ10gPSByWydbW2RhdGFMb2NhbGVdXSddO1xuXG4gICAgLy8gMTQuIExldCBkYXRhTG9jYWxlIGJlIHRoZSB2YWx1ZSBvZiByLltbZGF0YUxvY2FsZV1dLlxuICAgIHZhciBkYXRhTG9jYWxlID0gclsnW1tkYXRhTG9jYWxlXV0nXTtcblxuICAgIC8vIDE1LiBMZXQgdHogYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBvcHRpb25zIHdpdGhcbiAgICAvLyAgICAgYXJndW1lbnQgXCJ0aW1lWm9uZVwiLlxuICAgIHZhciB0eiA9IG9wdGlvbnMudGltZVpvbmU7XG5cbiAgICAvLyAxNi4gSWYgdHogaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmICh0eiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGEuIExldCB0eiBiZSBUb1N0cmluZyh0eikuXG4gICAgICAgIC8vIGIuIENvbnZlcnQgdHogdG8gdXBwZXIgY2FzZSBhcyBkZXNjcmliZWQgaW4gNi4xLlxuICAgICAgICAvLyAgICBOT1RFOiBJZiBhbiBpbXBsZW1lbnRhdGlvbiBhY2NlcHRzIGFkZGl0aW9uYWwgdGltZSB6b25lIHZhbHVlcywgYXMgcGVybWl0dGVkXG4gICAgICAgIC8vICAgICAgICAgIHVuZGVyIGNlcnRhaW4gY29uZGl0aW9ucyBieSB0aGUgQ29uZm9ybWFuY2UgY2xhdXNlLCBkaWZmZXJlbnQgY2FzaW5nXG4gICAgICAgIC8vICAgICAgICAgIHJ1bGVzIGFwcGx5LlxuICAgICAgICB0eiA9IHRvTGF0aW5VcHBlckNhc2UodHopO1xuXG4gICAgICAgIC8vIGMuIElmIHR6IGlzIG5vdCBcIlVUQ1wiLCB0aGVuIHRocm93IGEgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gICAgICAgIC8vICMjI1RPRE86IGFjY2VwdCBtb3JlIHRpbWUgem9uZXMjIyNcbiAgICAgICAgaWYgKHR6ICE9PSAnVVRDJykgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RpbWVab25lIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgfVxuXG4gICAgLy8gMTcuIFNldCB0aGUgW1t0aW1lWm9uZV1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0IHRvIHR6LlxuICAgIGludGVybmFsWydbW3RpbWVab25lXV0nXSA9IHR6O1xuXG4gICAgLy8gMTguIExldCBvcHQgYmUgYSBuZXcgUmVjb3JkLlxuICAgIG9wdCA9IG5ldyBSZWNvcmQoKTtcblxuICAgIC8vIDE5LiBGb3IgZWFjaCByb3cgb2YgVGFibGUgMywgZXhjZXB0IHRoZSBoZWFkZXIgcm93LCBkbzpcbiAgICBmb3IgKHZhciBwcm9wIGluIGRhdGVUaW1lQ29tcG9uZW50cykge1xuICAgICAgICBpZiAoIWhvcC5jYWxsKGRhdGVUaW1lQ29tcG9uZW50cywgcHJvcCkpIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIDIwLiBMZXQgcHJvcCBiZSB0aGUgbmFtZSBnaXZlbiBpbiB0aGUgUHJvcGVydHkgY29sdW1uIG9mIHRoZSByb3cuXG4gICAgICAgIC8vIDIxLiBMZXQgdmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uLFxuICAgICAgICAvLyAgICAgcGFzc2luZyBhcyBhcmd1bWVudCBvcHRpb25zLCB0aGUgbmFtZSBnaXZlbiBpbiB0aGUgUHJvcGVydHkgY29sdW1uIG9mIHRoZVxuICAgICAgICAvLyAgICAgcm93LCBcInN0cmluZ1wiLCBhIExpc3QgY29udGFpbmluZyB0aGUgc3RyaW5ncyBnaXZlbiBpbiB0aGUgVmFsdWVzIGNvbHVtbiBvZlxuICAgICAgICAvLyAgICAgdGhlIHJvdywgYW5kIHVuZGVmaW5lZC5cbiAgICAgICAgdmFyIHZhbHVlID0gR2V0T3B0aW9uKG9wdGlvbnMsIHByb3AsICdzdHJpbmcnLCBkYXRlVGltZUNvbXBvbmVudHNbcHJvcF0pO1xuXG4gICAgICAgIC8vIDIyLiBTZXQgb3B0LltbPHByb3A+XV0gdG8gdmFsdWUuXG4gICAgICAgIG9wdFsnW1snICsgcHJvcCArICddXSddID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLy8gQXNzaWduZWQgYSB2YWx1ZSBiZWxvd1xuICAgIHZhciBiZXN0Rm9ybWF0ID0gdm9pZCAwO1xuXG4gICAgLy8gMjMuIExldCBkYXRhTG9jYWxlRGF0YSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgLy8gICAgIGxvY2FsZURhdGEgd2l0aCBhcmd1bWVudCBkYXRhTG9jYWxlLlxuICAgIHZhciBkYXRhTG9jYWxlRGF0YSA9IGxvY2FsZURhdGFbZGF0YUxvY2FsZV07XG5cbiAgICAvLyAyNC4gTGV0IGZvcm1hdHMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgIC8vICAgICBkYXRhTG9jYWxlRGF0YSB3aXRoIGFyZ3VtZW50IFwiZm9ybWF0c1wiLlxuICAgIC8vICAgICBOb3RlOiB3ZSBwcm9jZXNzIHRoZSBDTERSIGZvcm1hdHMgaW50byB0aGUgc3BlYydkIHN0cnVjdHVyZVxuICAgIHZhciBmb3JtYXRzID0gVG9EYXRlVGltZUZvcm1hdHMoZGF0YUxvY2FsZURhdGEuZm9ybWF0cyk7XG5cbiAgICAvLyAyNS4gTGV0IG1hdGNoZXIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uIHdpdGhcbiAgICAvLyAgICAgYXJndW1lbnRzIG9wdGlvbnMsIFwiZm9ybWF0TWF0Y2hlclwiLCBcInN0cmluZ1wiLCBhIExpc3QgY29udGFpbmluZyB0aGUgdHdvIFN0cmluZ1xuICAgIC8vICAgICB2YWx1ZXMgXCJiYXNpY1wiIGFuZCBcImJlc3QgZml0XCIsIGFuZCBcImJlc3QgZml0XCIuXG4gICAgbWF0Y2hlciA9IEdldE9wdGlvbihvcHRpb25zLCAnZm9ybWF0TWF0Y2hlcicsICdzdHJpbmcnLCBuZXcgTGlzdCgnYmFzaWMnLCAnYmVzdCBmaXQnKSwgJ2Jlc3QgZml0Jyk7XG5cbiAgICAvLyBPcHRpbWl6YXRpb246IGNhY2hpbmcgdGhlIHByb2Nlc3NlZCBmb3JtYXRzIGFzIGEgb25lIHRpbWUgb3BlcmF0aW9uIGJ5XG4gICAgLy8gcmVwbGFjaW5nIHRoZSBpbml0aWFsIHN0cnVjdHVyZSBmcm9tIGxvY2FsZURhdGFcbiAgICBkYXRhTG9jYWxlRGF0YS5mb3JtYXRzID0gZm9ybWF0cztcblxuICAgIC8vIDI2LiBJZiBtYXRjaGVyIGlzIFwiYmFzaWNcIiwgdGhlblxuICAgIGlmIChtYXRjaGVyID09PSAnYmFzaWMnKSB7XG4gICAgICAgIC8vIDI3LiBMZXQgYmVzdEZvcm1hdCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEJhc2ljRm9ybWF0TWF0Y2hlciBhYnN0cmFjdFxuICAgICAgICAvLyAgICAgb3BlcmF0aW9uIChkZWZpbmVkIGJlbG93KSB3aXRoIG9wdCBhbmQgZm9ybWF0cy5cbiAgICAgICAgYmVzdEZvcm1hdCA9IEJhc2ljRm9ybWF0TWF0Y2hlcihvcHQsIGZvcm1hdHMpO1xuXG4gICAgICAgIC8vIDI4LiBFbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gZGl2ZXJnaW5nXG4gICAgICAgICAgICB2YXIgX2hyID0gR2V0T3B0aW9uKG9wdGlvbnMsICdob3VyMTInLCAnYm9vbGVhbicgLyosIHVuZGVmaW5lZCwgdW5kZWZpbmVkKi8pO1xuICAgICAgICAgICAgb3B0LmhvdXIxMiA9IF9ociA9PT0gdW5kZWZpbmVkID8gZGF0YUxvY2FsZURhdGEuaG91cjEyIDogX2hyO1xuICAgICAgICB9XG4gICAgICAgIC8vIDI5LiBMZXQgYmVzdEZvcm1hdCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEJlc3RGaXRGb3JtYXRNYXRjaGVyXG4gICAgICAgIC8vICAgICBhYnN0cmFjdCBvcGVyYXRpb24gKGRlZmluZWQgYmVsb3cpIHdpdGggb3B0IGFuZCBmb3JtYXRzLlxuICAgICAgICBiZXN0Rm9ybWF0ID0gQmVzdEZpdEZvcm1hdE1hdGNoZXIob3B0LCBmb3JtYXRzKTtcbiAgICB9XG5cbiAgICAvLyAzMC4gRm9yIGVhY2ggcm93IGluIFRhYmxlIDMsIGV4Y2VwdCB0aGUgaGVhZGVyIHJvdywgZG9cbiAgICBmb3IgKHZhciBfcHJvcCBpbiBkYXRlVGltZUNvbXBvbmVudHMpIHtcbiAgICAgICAgaWYgKCFob3AuY2FsbChkYXRlVGltZUNvbXBvbmVudHMsIF9wcm9wKSkgY29udGludWU7XG5cbiAgICAgICAgLy8gYS4gTGV0IHByb3AgYmUgdGhlIG5hbWUgZ2l2ZW4gaW4gdGhlIFByb3BlcnR5IGNvbHVtbiBvZiB0aGUgcm93LlxuICAgICAgICAvLyBiLiBMZXQgcERlc2MgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldE93blByb3BlcnR5XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgICAgIC8vICAgIGJlc3RGb3JtYXQgd2l0aCBhcmd1bWVudCBwcm9wLlxuICAgICAgICAvLyBjLiBJZiBwRGVzYyBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgICAgIGlmIChob3AuY2FsbChiZXN0Rm9ybWF0LCBfcHJvcCkpIHtcbiAgICAgICAgICAgIC8vIGkuIExldCBwIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2YgYmVzdEZvcm1hdFxuICAgICAgICAgICAgLy8gICAgd2l0aCBhcmd1bWVudCBwcm9wLlxuICAgICAgICAgICAgdmFyIHAgPSBiZXN0Rm9ybWF0W19wcm9wXTtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBkaXZlcmdpbmdcbiAgICAgICAgICAgICAgICBwID0gYmVzdEZvcm1hdC5fICYmIGhvcC5jYWxsKGJlc3RGb3JtYXQuXywgX3Byb3ApID8gYmVzdEZvcm1hdC5fW19wcm9wXSA6IHA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlpLiBTZXQgdGhlIFtbPHByb3A+XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gcC5cbiAgICAgICAgICAgIGludGVybmFsWydbWycgKyBfcHJvcCArICddXSddID0gcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwYXR0ZXJuID0gdm9pZCAwOyAvLyBBc3NpZ25lZCBhIHZhbHVlIGJlbG93XG5cbiAgICAvLyAzMS4gTGV0IGhyMTIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uIHdpdGhcbiAgICAvLyAgICAgYXJndW1lbnRzIG9wdGlvbnMsIFwiaG91cjEyXCIsIFwiYm9vbGVhblwiLCB1bmRlZmluZWQsIGFuZCB1bmRlZmluZWQuXG4gICAgdmFyIGhyMTIgPSBHZXRPcHRpb24ob3B0aW9ucywgJ2hvdXIxMicsICdib29sZWFuJyAvKiwgdW5kZWZpbmVkLCB1bmRlZmluZWQqLyk7XG5cbiAgICAvLyAzMi4gSWYgZGF0ZVRpbWVGb3JtYXQgaGFzIGFuIGludGVybmFsIHByb3BlcnR5IFtbaG91cl1dLCB0aGVuXG4gICAgaWYgKGludGVybmFsWydbW2hvdXJdXSddKSB7XG4gICAgICAgIC8vIGEuIElmIGhyMTIgaXMgdW5kZWZpbmVkLCB0aGVuIGxldCBocjEyIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXVxuICAgICAgICAvLyAgICBpbnRlcm5hbCBtZXRob2Qgb2YgZGF0YUxvY2FsZURhdGEgd2l0aCBhcmd1bWVudCBcImhvdXIxMlwiLlxuICAgICAgICBocjEyID0gaHIxMiA9PT0gdW5kZWZpbmVkID8gZGF0YUxvY2FsZURhdGEuaG91cjEyIDogaHIxMjtcblxuICAgICAgICAvLyBiLiBTZXQgdGhlIFtbaG91cjEyXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gaHIxMi5cbiAgICAgICAgaW50ZXJuYWxbJ1tbaG91cjEyXV0nXSA9IGhyMTI7XG5cbiAgICAgICAgLy8gYy4gSWYgaHIxMiBpcyB0cnVlLCB0aGVuXG4gICAgICAgIGlmIChocjEyID09PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQgaG91ck5vMCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgICAgICAgICAvLyAgICBkYXRhTG9jYWxlRGF0YSB3aXRoIGFyZ3VtZW50IFwiaG91ck5vMFwiLlxuICAgICAgICAgICAgdmFyIGhvdXJObzAgPSBkYXRhTG9jYWxlRGF0YS5ob3VyTm8wO1xuXG4gICAgICAgICAgICAvLyBpaS4gU2V0IHRoZSBbW2hvdXJObzBdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdCB0byBob3VyTm8wLlxuICAgICAgICAgICAgaW50ZXJuYWxbJ1tbaG91ck5vMF1dJ10gPSBob3VyTm8wO1xuXG4gICAgICAgICAgICAvLyBpaWkuIExldCBwYXR0ZXJuIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgICAgIC8vICAgICAgYmVzdEZvcm1hdCB3aXRoIGFyZ3VtZW50IFwicGF0dGVybjEyXCIuXG4gICAgICAgICAgICBwYXR0ZXJuID0gYmVzdEZvcm1hdC5wYXR0ZXJuMTI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkLiBFbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIC8vIGkuIExldCBwYXR0ZXJuIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgICAgIC8vICAgIGJlc3RGb3JtYXQgd2l0aCBhcmd1bWVudCBcInBhdHRlcm5cIi5cbiAgICAgICAgICAgIHBhdHRlcm4gPSBiZXN0Rm9ybWF0LnBhdHRlcm47XG4gICAgfVxuXG4gICAgLy8gMzMuIEVsc2VcbiAgICBlbHNlXG4gICAgICAgIC8vIGEuIExldCBwYXR0ZXJuIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgLy8gICAgYmVzdEZvcm1hdCB3aXRoIGFyZ3VtZW50IFwicGF0dGVyblwiLlxuICAgICAgICBwYXR0ZXJuID0gYmVzdEZvcm1hdC5wYXR0ZXJuO1xuXG4gICAgLy8gMzQuIFNldCB0aGUgW1twYXR0ZXJuXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gcGF0dGVybi5cbiAgICBpbnRlcm5hbFsnW1twYXR0ZXJuXV0nXSA9IHBhdHRlcm47XG5cbiAgICAvLyAzNS4gU2V0IHRoZSBbW2JvdW5kRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gdW5kZWZpbmVkLlxuICAgIGludGVybmFsWydbW2JvdW5kRm9ybWF0XV0nXSA9IHVuZGVmaW5lZDtcblxuICAgIC8vIDM2LiBTZXQgdGhlIFtbaW5pdGlhbGl6ZWREYXRlVGltZUZvcm1hdF1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0IHRvXG4gICAgLy8gICAgIHRydWUuXG4gICAgaW50ZXJuYWxbJ1tbaW5pdGlhbGl6ZWREYXRlVGltZUZvcm1hdF1dJ10gPSB0cnVlO1xuXG4gICAgLy8gSW4gRVMzLCB3ZSBuZWVkIHRvIHByZS1iaW5kIHRoZSBmb3JtYXQoKSBmdW5jdGlvblxuICAgIGlmIChlczMpIGRhdGVUaW1lRm9ybWF0LmZvcm1hdCA9IEdldEZvcm1hdERhdGVUaW1lLmNhbGwoZGF0ZVRpbWVGb3JtYXQpO1xuXG4gICAgLy8gUmVzdG9yZSB0aGUgUmVnRXhwIHByb3BlcnRpZXNcbiAgICByZWdleHBSZXN0b3JlKCk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIG5ld2x5IGluaXRpYWxpc2VkIG9iamVjdFxuICAgIHJldHVybiBkYXRlVGltZUZvcm1hdDtcbn1cblxuLyoqXG4gKiBTZXZlcmFsIERhdGVUaW1lRm9ybWF0IGFsZ29yaXRobXMgdXNlIHZhbHVlcyBmcm9tIHRoZSBmb2xsb3dpbmcgdGFibGUsIHdoaWNoIHByb3ZpZGVzXG4gKiBwcm9wZXJ0eSBuYW1lcyBhbmQgYWxsb3dhYmxlIHZhbHVlcyBmb3IgdGhlIGNvbXBvbmVudHMgb2YgZGF0ZSBhbmQgdGltZSBmb3JtYXRzOlxuICovXG52YXIgZGF0ZVRpbWVDb21wb25lbnRzID0ge1xuICAgIHdlZWtkYXk6IFtcIm5hcnJvd1wiLCBcInNob3J0XCIsIFwibG9uZ1wiXSxcbiAgICBlcmE6IFtcIm5hcnJvd1wiLCBcInNob3J0XCIsIFwibG9uZ1wiXSxcbiAgICB5ZWFyOiBbXCIyLWRpZ2l0XCIsIFwibnVtZXJpY1wiXSxcbiAgICBtb250aDogW1wiMi1kaWdpdFwiLCBcIm51bWVyaWNcIiwgXCJuYXJyb3dcIiwgXCJzaG9ydFwiLCBcImxvbmdcIl0sXG4gICAgZGF5OiBbXCIyLWRpZ2l0XCIsIFwibnVtZXJpY1wiXSxcbiAgICBob3VyOiBbXCIyLWRpZ2l0XCIsIFwibnVtZXJpY1wiXSxcbiAgICBtaW51dGU6IFtcIjItZGlnaXRcIiwgXCJudW1lcmljXCJdLFxuICAgIHNlY29uZDogW1wiMi1kaWdpdFwiLCBcIm51bWVyaWNcIl0sXG4gICAgdGltZVpvbmVOYW1lOiBbXCJzaG9ydFwiLCBcImxvbmdcIl1cbn07XG5cbi8qKlxuICogV2hlbiB0aGUgVG9EYXRlVGltZU9wdGlvbnMgYWJzdHJhY3Qgb3BlcmF0aW9uIGlzIGNhbGxlZCB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLFxuICogcmVxdWlyZWQsIGFuZCBkZWZhdWx0cywgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbmZ1bmN0aW9uIFRvRGF0ZVRpbWVGb3JtYXRzKGZvcm1hdHMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGZvcm1hdHMpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRzO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlRGF0ZVRpbWVGb3JtYXRzKGZvcm1hdHMpO1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIFRvRGF0ZVRpbWVPcHRpb25zIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCBhcmd1bWVudHMgb3B0aW9ucyxcbiAqIHJlcXVpcmVkLCBhbmQgZGVmYXVsdHMsIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG5mdW5jdGlvbiBUb0RhdGVUaW1lT3B0aW9ucyhvcHRpb25zLCByZXF1aXJlZCwgZGVmYXVsdHMpIHtcbiAgICAvLyAxLiBJZiBvcHRpb25zIGlzIHVuZGVmaW5lZCwgdGhlbiBsZXQgb3B0aW9ucyBiZSBudWxsLCBlbHNlIGxldCBvcHRpb25zIGJlXG4gICAgLy8gICAgVG9PYmplY3Qob3B0aW9ucykuXG4gICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkgb3B0aW9ucyA9IG51bGw7ZWxzZSB7XG4gICAgICAgIC8vICgjMTIpIG9wdGlvbnMgbmVlZHMgdG8gYmUgYSBSZWNvcmQsIGJ1dCBpdCBhbHNvIG5lZWRzIHRvIGluaGVyaXQgcHJvcGVydGllc1xuICAgICAgICB2YXIgb3B0MiA9IHRvT2JqZWN0KG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zID0gbmV3IFJlY29yZCgpO1xuXG4gICAgICAgIGZvciAodmFyIGsgaW4gb3B0Mikge1xuICAgICAgICAgICAgb3B0aW9uc1trXSA9IG9wdDJba107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLiBMZXQgY3JlYXRlIGJlIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBmdW5jdGlvbiBvYmplY3QgZGVmaW5lZCBpbiBFUzUsIDE1LjIuMy41LlxuICAgIHZhciBjcmVhdGUgPSBvYmpDcmVhdGU7XG5cbiAgICAvLyAzLiBMZXQgb3B0aW9ucyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ2FsbF1dIGludGVybmFsIG1ldGhvZCBvZiBjcmVhdGUgd2l0aFxuICAgIC8vICAgIHVuZGVmaW5lZCBhcyB0aGUgdGhpcyB2YWx1ZSBhbmQgYW4gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIHRoZSBzaW5nbGUgaXRlbVxuICAgIC8vICAgIG9wdGlvbnMuXG4gICAgb3B0aW9ucyA9IGNyZWF0ZShvcHRpb25zKTtcblxuICAgIC8vIDQuIExldCBuZWVkRGVmYXVsdHMgYmUgdHJ1ZS5cbiAgICB2YXIgbmVlZERlZmF1bHRzID0gdHJ1ZTtcblxuICAgIC8vIDUuIElmIHJlcXVpcmVkIGlzIFwiZGF0ZVwiIG9yIFwiYW55XCIsIHRoZW5cbiAgICBpZiAocmVxdWlyZWQgPT09ICdkYXRlJyB8fCByZXF1aXJlZCA9PT0gJ2FueScpIHtcbiAgICAgICAgLy8gYS4gRm9yIGVhY2ggb2YgdGhlIHByb3BlcnR5IG5hbWVzIFwid2Vla2RheVwiLCBcInllYXJcIiwgXCJtb250aFwiLCBcImRheVwiOlxuICAgICAgICAvLyBpLiBJZiB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIG9wdGlvbnMgd2l0aCB0aGVcbiAgICAgICAgLy8gICAgcHJvcGVydHkgbmFtZSBpcyBub3QgdW5kZWZpbmVkLCB0aGVuIGxldCBuZWVkRGVmYXVsdHMgYmUgZmFsc2UuXG4gICAgICAgIGlmIChvcHRpb25zLndlZWtkYXkgIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnllYXIgIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLm1vbnRoICE9PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5kYXkgIT09IHVuZGVmaW5lZCkgbmVlZERlZmF1bHRzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gNi4gSWYgcmVxdWlyZWQgaXMgXCJ0aW1lXCIgb3IgXCJhbnlcIiwgdGhlblxuICAgIGlmIChyZXF1aXJlZCA9PT0gJ3RpbWUnIHx8IHJlcXVpcmVkID09PSAnYW55Jykge1xuICAgICAgICAvLyBhLiBGb3IgZWFjaCBvZiB0aGUgcHJvcGVydHkgbmFtZXMgXCJob3VyXCIsIFwibWludXRlXCIsIFwic2Vjb25kXCI6XG4gICAgICAgIC8vIGkuIElmIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2Ygb3B0aW9ucyB3aXRoIHRoZVxuICAgICAgICAvLyAgICBwcm9wZXJ0eSBuYW1lIGlzIG5vdCB1bmRlZmluZWQsIHRoZW4gbGV0IG5lZWREZWZhdWx0cyBiZSBmYWxzZS5cbiAgICAgICAgaWYgKG9wdGlvbnMuaG91ciAhPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMubWludXRlICE9PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5zZWNvbmQgIT09IHVuZGVmaW5lZCkgbmVlZERlZmF1bHRzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gNy4gSWYgbmVlZERlZmF1bHRzIGlzIHRydWUgYW5kIGRlZmF1bHRzIGlzIGVpdGhlciBcImRhdGVcIiBvciBcImFsbFwiLCB0aGVuXG4gICAgaWYgKG5lZWREZWZhdWx0cyAmJiAoZGVmYXVsdHMgPT09ICdkYXRlJyB8fCBkZWZhdWx0cyA9PT0gJ2FsbCcpKVxuICAgICAgICAvLyBhLiBGb3IgZWFjaCBvZiB0aGUgcHJvcGVydHkgbmFtZXMgXCJ5ZWFyXCIsIFwibW9udGhcIiwgXCJkYXlcIjpcbiAgICAgICAgLy8gaS4gQ2FsbCB0aGUgW1tEZWZpbmVPd25Qcm9wZXJ0eV1dIGludGVybmFsIG1ldGhvZCBvZiBvcHRpb25zIHdpdGggdGhlXG4gICAgICAgIC8vICAgIHByb3BlcnR5IG5hbWUsIFByb3BlcnR5IERlc2NyaXB0b3Ige1tbVmFsdWVdXTogXCJudW1lcmljXCIsIFtbV3JpdGFibGVdXTpcbiAgICAgICAgLy8gICAgdHJ1ZSwgW1tFbnVtZXJhYmxlXV06IHRydWUsIFtbQ29uZmlndXJhYmxlXV06IHRydWV9LCBhbmQgZmFsc2UuXG4gICAgICAgIG9wdGlvbnMueWVhciA9IG9wdGlvbnMubW9udGggPSBvcHRpb25zLmRheSA9ICdudW1lcmljJztcblxuICAgIC8vIDguIElmIG5lZWREZWZhdWx0cyBpcyB0cnVlIGFuZCBkZWZhdWx0cyBpcyBlaXRoZXIgXCJ0aW1lXCIgb3IgXCJhbGxcIiwgdGhlblxuICAgIGlmIChuZWVkRGVmYXVsdHMgJiYgKGRlZmF1bHRzID09PSAndGltZScgfHwgZGVmYXVsdHMgPT09ICdhbGwnKSlcbiAgICAgICAgLy8gYS4gRm9yIGVhY2ggb2YgdGhlIHByb3BlcnR5IG5hbWVzIFwiaG91clwiLCBcIm1pbnV0ZVwiLCBcInNlY29uZFwiOlxuICAgICAgICAvLyBpLiBDYWxsIHRoZSBbW0RlZmluZU93blByb3BlcnR5XV0gaW50ZXJuYWwgbWV0aG9kIG9mIG9wdGlvbnMgd2l0aCB0aGVcbiAgICAgICAgLy8gICAgcHJvcGVydHkgbmFtZSwgUHJvcGVydHkgRGVzY3JpcHRvciB7W1tWYWx1ZV1dOiBcIm51bWVyaWNcIiwgW1tXcml0YWJsZV1dOlxuICAgICAgICAvLyAgICB0cnVlLCBbW0VudW1lcmFibGVdXTogdHJ1ZSwgW1tDb25maWd1cmFibGVdXTogdHJ1ZX0sIGFuZCBmYWxzZS5cbiAgICAgICAgb3B0aW9ucy5ob3VyID0gb3B0aW9ucy5taW51dGUgPSBvcHRpb25zLnNlY29uZCA9ICdudW1lcmljJztcblxuICAgIC8vIDkuIFJldHVybiBvcHRpb25zLlxuICAgIHJldHVybiBvcHRpb25zO1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIEJhc2ljRm9ybWF0TWF0Y2hlciBhYnN0cmFjdCBvcGVyYXRpb24gaXMgY2FsbGVkIHdpdGggdHdvIGFyZ3VtZW50cyBvcHRpb25zIGFuZFxuICogZm9ybWF0cywgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbmZ1bmN0aW9uIEJhc2ljRm9ybWF0TWF0Y2hlcihvcHRpb25zLCBmb3JtYXRzKSB7XG4gICAgLy8gMS4gTGV0IHJlbW92YWxQZW5hbHR5IGJlIDEyMC5cbiAgICB2YXIgcmVtb3ZhbFBlbmFsdHkgPSAxMjA7XG5cbiAgICAvLyAyLiBMZXQgYWRkaXRpb25QZW5hbHR5IGJlIDIwLlxuICAgIHZhciBhZGRpdGlvblBlbmFsdHkgPSAyMDtcblxuICAgIC8vIDMuIExldCBsb25nTGVzc1BlbmFsdHkgYmUgOC5cbiAgICB2YXIgbG9uZ0xlc3NQZW5hbHR5ID0gODtcblxuICAgIC8vIDQuIExldCBsb25nTW9yZVBlbmFsdHkgYmUgNi5cbiAgICB2YXIgbG9uZ01vcmVQZW5hbHR5ID0gNjtcblxuICAgIC8vIDUuIExldCBzaG9ydExlc3NQZW5hbHR5IGJlIDYuXG4gICAgdmFyIHNob3J0TGVzc1BlbmFsdHkgPSA2O1xuXG4gICAgLy8gNi4gTGV0IHNob3J0TW9yZVBlbmFsdHkgYmUgMy5cbiAgICB2YXIgc2hvcnRNb3JlUGVuYWx0eSA9IDM7XG5cbiAgICAvLyA3LiBMZXQgYmVzdFNjb3JlIGJlIC1JbmZpbml0eS5cbiAgICB2YXIgYmVzdFNjb3JlID0gLUluZmluaXR5O1xuXG4gICAgLy8gOC4gTGV0IGJlc3RGb3JtYXQgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBiZXN0Rm9ybWF0ID0gdm9pZCAwO1xuXG4gICAgLy8gOS4gTGV0IGkgYmUgMC5cbiAgICB2YXIgaSA9IDA7XG5cbiAgICAvLyAxMC4gQXNzZXJ0OiBmb3JtYXRzIGlzIGFuIEFycmF5IG9iamVjdC5cblxuICAgIC8vIDExLiBMZXQgbGVuIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2YgZm9ybWF0cyB3aXRoIGFyZ3VtZW50IFwibGVuZ3RoXCIuXG4gICAgdmFyIGxlbiA9IGZvcm1hdHMubGVuZ3RoO1xuXG4gICAgLy8gMTIuIFJlcGVhdCB3aGlsZSBpIDwgbGVuOlxuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICAgIC8vIGEuIExldCBmb3JtYXQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBmb3JtYXRzIHdpdGggYXJndW1lbnQgVG9TdHJpbmcoaSkuXG4gICAgICAgIHZhciBmb3JtYXQgPSBmb3JtYXRzW2ldO1xuXG4gICAgICAgIC8vIGIuIExldCBzY29yZSBiZSAwLlxuICAgICAgICB2YXIgc2NvcmUgPSAwO1xuXG4gICAgICAgIC8vIGMuIEZvciBlYWNoIHByb3BlcnR5IHNob3duIGluIFRhYmxlIDM6XG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIGRhdGVUaW1lQ29tcG9uZW50cykge1xuICAgICAgICAgICAgaWYgKCFob3AuY2FsbChkYXRlVGltZUNvbXBvbmVudHMsIHByb3BlcnR5KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIGkuIExldCBvcHRpb25zUHJvcCBiZSBvcHRpb25zLltbPHByb3BlcnR5Pl1dLlxuICAgICAgICAgICAgdmFyIG9wdGlvbnNQcm9wID0gb3B0aW9uc1snW1snICsgcHJvcGVydHkgKyAnXV0nXTtcblxuICAgICAgICAgICAgLy8gaWkuIExldCBmb3JtYXRQcm9wRGVzYyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0T3duUHJvcGVydHldXSBpbnRlcm5hbCBtZXRob2Qgb2YgZm9ybWF0XG4gICAgICAgICAgICAvLyAgICAgd2l0aCBhcmd1bWVudCBwcm9wZXJ0eS5cbiAgICAgICAgICAgIC8vIGlpaS4gSWYgZm9ybWF0UHJvcERlc2MgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgICAgICAgICAgLy8gICAgIDEuIExldCBmb3JtYXRQcm9wIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2YgZm9ybWF0IHdpdGggYXJndW1lbnQgcHJvcGVydHkuXG4gICAgICAgICAgICB2YXIgZm9ybWF0UHJvcCA9IGhvcC5jYWxsKGZvcm1hdCwgcHJvcGVydHkpID8gZm9ybWF0W3Byb3BlcnR5XSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgLy8gaXYuIElmIG9wdGlvbnNQcm9wIGlzIHVuZGVmaW5lZCBhbmQgZm9ybWF0UHJvcCBpcyBub3QgdW5kZWZpbmVkLCB0aGVuIGRlY3JlYXNlIHNjb3JlIGJ5XG4gICAgICAgICAgICAvLyAgICAgYWRkaXRpb25QZW5hbHR5LlxuICAgICAgICAgICAgaWYgKG9wdGlvbnNQcm9wID09PSB1bmRlZmluZWQgJiYgZm9ybWF0UHJvcCAhPT0gdW5kZWZpbmVkKSBzY29yZSAtPSBhZGRpdGlvblBlbmFsdHk7XG5cbiAgICAgICAgICAgIC8vIHYuIEVsc2UgaWYgb3B0aW9uc1Byb3AgaXMgbm90IHVuZGVmaW5lZCBhbmQgZm9ybWF0UHJvcCBpcyB1bmRlZmluZWQsIHRoZW4gZGVjcmVhc2Ugc2NvcmUgYnlcbiAgICAgICAgICAgIC8vICAgIHJlbW92YWxQZW5hbHR5LlxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9uc1Byb3AgIT09IHVuZGVmaW5lZCAmJiBmb3JtYXRQcm9wID09PSB1bmRlZmluZWQpIHNjb3JlIC09IHJlbW92YWxQZW5hbHR5O1xuXG4gICAgICAgICAgICAgICAgLy8gdmkuIEVsc2VcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEuIExldCB2YWx1ZXMgYmUgdGhlIGFycmF5IFtcIjItZGlnaXRcIiwgXCJudW1lcmljXCIsIFwibmFycm93XCIsIFwic2hvcnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgIFwibG9uZ1wiXS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbJzItZGlnaXQnLCAnbnVtZXJpYycsICduYXJyb3cnLCAnc2hvcnQnLCAnbG9uZyddO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAyLiBMZXQgb3B0aW9uc1Byb3BJbmRleCBiZSB0aGUgaW5kZXggb2Ygb3B0aW9uc1Byb3Agd2l0aGluIHZhbHVlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zUHJvcEluZGV4ID0gYXJySW5kZXhPZi5jYWxsKHZhbHVlcywgb3B0aW9uc1Byb3ApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAzLiBMZXQgZm9ybWF0UHJvcEluZGV4IGJlIHRoZSBpbmRleCBvZiBmb3JtYXRQcm9wIHdpdGhpbiB2YWx1ZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybWF0UHJvcEluZGV4ID0gYXJySW5kZXhPZi5jYWxsKHZhbHVlcywgZm9ybWF0UHJvcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDQuIExldCBkZWx0YSBiZSBtYXgobWluKGZvcm1hdFByb3BJbmRleCAtIG9wdGlvbnNQcm9wSW5kZXgsIDIpLCAtMikuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVsdGEgPSBNYXRoLm1heChNYXRoLm1pbihmb3JtYXRQcm9wSW5kZXggLSBvcHRpb25zUHJvcEluZGV4LCAyKSwgLTIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA1LiBJZiBkZWx0YSA9IDIsIGRlY3JlYXNlIHNjb3JlIGJ5IGxvbmdNb3JlUGVuYWx0eS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWx0YSA9PT0gMikgc2NvcmUgLT0gbG9uZ01vcmVQZW5hbHR5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA2LiBFbHNlIGlmIGRlbHRhID0gMSwgZGVjcmVhc2Ugc2NvcmUgYnkgc2hvcnRNb3JlUGVuYWx0eS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRlbHRhID09PSAxKSBzY29yZSAtPSBzaG9ydE1vcmVQZW5hbHR5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gNy4gRWxzZSBpZiBkZWx0YSA9IC0xLCBkZWNyZWFzZSBzY29yZSBieSBzaG9ydExlc3NQZW5hbHR5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRlbHRhID09PSAtMSkgc2NvcmUgLT0gc2hvcnRMZXNzUGVuYWx0eTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA4LiBFbHNlIGlmIGRlbHRhID0gLTIsIGRlY3JlYXNlIHNjb3JlIGJ5IGxvbmdMZXNzUGVuYWx0eS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPT09IC0yKSBzY29yZSAtPSBsb25nTGVzc1BlbmFsdHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGQuIElmIHNjb3JlID4gYmVzdFNjb3JlLCB0aGVuXG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICAgICAgLy8gaS4gTGV0IGJlc3RTY29yZSBiZSBzY29yZS5cbiAgICAgICAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xuXG4gICAgICAgICAgICAvLyBpaS4gTGV0IGJlc3RGb3JtYXQgYmUgZm9ybWF0LlxuICAgICAgICAgICAgYmVzdEZvcm1hdCA9IGZvcm1hdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGUuIEluY3JlYXNlIGkgYnkgMS5cbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vIDEzLiBSZXR1cm4gYmVzdEZvcm1hdC5cbiAgICByZXR1cm4gYmVzdEZvcm1hdDtcbn1cblxuLyoqXG4gKiBXaGVuIHRoZSBCZXN0Rml0Rm9ybWF0TWF0Y2hlciBhYnN0cmFjdCBvcGVyYXRpb24gaXMgY2FsbGVkIHdpdGggdHdvIGFyZ3VtZW50cyBvcHRpb25zXG4gKiBhbmQgZm9ybWF0cywgaXQgcGVyZm9ybXMgaW1wbGVtZW50YXRpb24gZGVwZW5kZW50IHN0ZXBzLCB3aGljaCBzaG91bGQgcmV0dXJuIGEgc2V0IG9mXG4gKiBjb21wb25lbnQgcmVwcmVzZW50YXRpb25zIHRoYXQgYSB0eXBpY2FsIHVzZXIgb2YgdGhlIHNlbGVjdGVkIGxvY2FsZSB3b3VsZCBwZXJjZWl2ZSBhc1xuICogYXQgbGVhc3QgYXMgZ29vZCBhcyB0aGUgb25lIHJldHVybmVkIGJ5IEJhc2ljRm9ybWF0TWF0Y2hlci5cbiAqXG4gKiBUaGlzIHBvbHlmaWxsIGRlZmluZXMgdGhlIGFsZ29yaXRobSB0byBiZSB0aGUgc2FtZSBhcyBCYXNpY0Zvcm1hdE1hdGNoZXIsXG4gKiB3aXRoIHRoZSBhZGRpdGlvbiBvZiBib251cyBwb2ludHMgYXdhcmRlZCB3aGVyZSB0aGUgcmVxdWVzdGVkIGZvcm1hdCBpcyBvZlxuICogdGhlIHNhbWUgZGF0YSB0eXBlIGFzIHRoZSBwb3RlbnRpYWxseSBtYXRjaGluZyBmb3JtYXQuXG4gKlxuICogVGhpcyBhbGdvIHJlbGllcyBvbiB0aGUgY29uY2VwdCBvZiBjbG9zZXN0IGRpc3RhbmNlIG1hdGNoaW5nIGRlc2NyaWJlZCBoZXJlOlxuICogaHR0cDovL3VuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjTWF0Y2hpbmdfU2tlbGV0b25zXG4gKiBUeXBpY2FsbHkgYSDigJxiZXN0IG1hdGNo4oCdIGlzIGZvdW5kIHVzaW5nIGEgY2xvc2VzdCBkaXN0YW5jZSBtYXRjaCwgc3VjaCBhczpcbiAqXG4gKiBTeW1ib2xzIHJlcXVlc3RpbmcgYSBiZXN0IGNob2ljZSBmb3IgdGhlIGxvY2FsZSBhcmUgcmVwbGFjZWQuXG4gKiAgICAgIGog4oaSIG9uZSBvZiB7SCwgaywgaCwgS307IEMg4oaSIG9uZSBvZiB7YSwgYiwgQn1cbiAqIC0+IENvdmVyZWQgYnkgY2xkci5qcyBtYXRjaGluZyBwcm9jZXNzXG4gKlxuICogRm9yIGZpZWxkcyB3aXRoIHN5bWJvbHMgcmVwcmVzZW50aW5nIHRoZSBzYW1lIHR5cGUgKHllYXIsIG1vbnRoLCBkYXksIGV0Yyk6XG4gKiAgICAgTW9zdCBzeW1ib2xzIGhhdmUgYSBzbWFsbCBkaXN0YW5jZSBmcm9tIGVhY2ggb3RoZXIuXG4gKiAgICAgICAgIE0g4omFIEw7IEUg4omFIGM7IGEg4omFIGIg4omFIEI7IEgg4omFIGsg4omFIGgg4omFIEs7IC4uLlxuICogICAgIC0+IENvdmVyZWQgYnkgY2xkci5qcyBtYXRjaGluZyBwcm9jZXNzXG4gKlxuICogICAgIFdpZHRoIGRpZmZlcmVuY2VzIGFtb25nIGZpZWxkcywgb3RoZXIgdGhhbiB0aG9zZSBtYXJraW5nIHRleHQgdnMgbnVtZXJpYywgYXJlIGdpdmVuIHNtYWxsIGRpc3RhbmNlIGZyb20gZWFjaCBvdGhlci5cbiAqICAgICAgICAgTU1NIOKJhSBNTU1NXG4gKiAgICAgICAgIE1NIOKJhSBNXG4gKiAgICAgTnVtZXJpYyBhbmQgdGV4dCBmaWVsZHMgYXJlIGdpdmVuIGEgbGFyZ2VyIGRpc3RhbmNlIGZyb20gZWFjaCBvdGhlci5cbiAqICAgICAgICAgTU1NIOKJiCBNTVxuICogICAgIFN5bWJvbHMgcmVwcmVzZW50aW5nIHN1YnN0YW50aWFsIGRpZmZlcmVuY2VzICh3ZWVrIG9mIHllYXIgdnMgd2VlayBvZiBtb250aCkgYXJlIGdpdmVuIG11Y2ggbGFyZ2VyIGEgZGlzdGFuY2VzIGZyb20gZWFjaCBvdGhlci5cbiAqICAgICAgICAgZCDiiYsgRDsgLi4uXG4gKiAgICAgTWlzc2luZyBvciBleHRyYSBmaWVsZHMgY2F1c2UgYSBtYXRjaCB0byBmYWlsLiAoQnV0IHNlZSBNaXNzaW5nIFNrZWxldG9uIEZpZWxkcykuXG4gKlxuICpcbiAqIEZvciBleGFtcGxlLFxuICpcbiAqICAgICB7IG1vbnRoOiAnbnVtZXJpYycsIGRheTogJ251bWVyaWMnIH1cbiAqXG4gKiBzaG91bGQgbWF0Y2hcbiAqXG4gKiAgICAgeyBtb250aDogJzItZGlnaXQnLCBkYXk6ICcyLWRpZ2l0JyB9XG4gKlxuICogcmF0aGVyIHRoYW5cbiAqXG4gKiAgICAgeyBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycgfVxuICpcbiAqIFRoaXMgbWFrZXMgc2Vuc2UgYmVjYXVzZSBhIHVzZXIgcmVxdWVzdGluZyBhIGZvcm1hdHRlZCBkYXRlIHdpdGggbnVtZXJpYyBwYXJ0cyB3b3VsZFxuICogbm90IGV4cGVjdCB0byBzZWUgdGhlIHJldHVybmVkIGZvcm1hdCBjb250YWluaW5nIG5hcnJvdywgc2hvcnQgb3IgbG9uZyBwYXJ0IG5hbWVzXG4gKi9cbmZ1bmN0aW9uIEJlc3RGaXRGb3JtYXRNYXRjaGVyKG9wdGlvbnMsIGZvcm1hdHMpIHtcbiAgICAvKiogRGl2ZXJnaW5nOiB0aGlzIGJsb2NrIGltcGxlbWVudHMgdGhlIGhhY2sgZm9yIHNpbmdsZSBwcm9wZXJ0eSBjb25maWd1cmF0aW9uLCBlZy46XG4gICAgICpcbiAgICAgKiAgICAgIGBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCgnZW4nLCB7ZGF5OiAnbnVtZXJpYyd9KWBcbiAgICAgKlxuICAgICAqIHNob3VsZCBwcm9kdWNlIGEgc2luZ2xlIGRpZ2l0IHdpdGggdGhlIGRheSBvZiB0aGUgbW9udGguIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2VcbiAgICAgKiBDTERSIGBhdmFpbGFibGVGb3JtYXRzYCBkYXRhIHN0cnVjdHVyZSBkb2Vzbid0IGNvdmVyIHRoZXNlIGNhc2VzLlxuICAgICAqL1xuICAgIHtcbiAgICAgICAgdmFyIG9wdGlvbnNQcm9wTmFtZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gZGF0ZVRpbWVDb21wb25lbnRzKSB7XG4gICAgICAgICAgICBpZiAoIWhvcC5jYWxsKGRhdGVUaW1lQ29tcG9uZW50cywgcHJvcGVydHkpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnNbJ1tbJyArIHByb3BlcnR5ICsgJ11dJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnNQcm9wTmFtZXMucHVzaChwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnNQcm9wTmFtZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgX2Jlc3RGb3JtYXQgPSBnZW5lcmF0ZVN5bnRoZXRpY0Zvcm1hdChvcHRpb25zUHJvcE5hbWVzWzBdLCBvcHRpb25zWydbWycgKyBvcHRpb25zUHJvcE5hbWVzWzBdICsgJ11dJ10pO1xuICAgICAgICAgICAgaWYgKF9iZXN0Rm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9iZXN0Rm9ybWF0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gMS4gTGV0IHJlbW92YWxQZW5hbHR5IGJlIDEyMC5cbiAgICB2YXIgcmVtb3ZhbFBlbmFsdHkgPSAxMjA7XG5cbiAgICAvLyAyLiBMZXQgYWRkaXRpb25QZW5hbHR5IGJlIDIwLlxuICAgIHZhciBhZGRpdGlvblBlbmFsdHkgPSAyMDtcblxuICAgIC8vIDMuIExldCBsb25nTGVzc1BlbmFsdHkgYmUgOC5cbiAgICB2YXIgbG9uZ0xlc3NQZW5hbHR5ID0gODtcblxuICAgIC8vIDQuIExldCBsb25nTW9yZVBlbmFsdHkgYmUgNi5cbiAgICB2YXIgbG9uZ01vcmVQZW5hbHR5ID0gNjtcblxuICAgIC8vIDUuIExldCBzaG9ydExlc3NQZW5hbHR5IGJlIDYuXG4gICAgdmFyIHNob3J0TGVzc1BlbmFsdHkgPSA2O1xuXG4gICAgLy8gNi4gTGV0IHNob3J0TW9yZVBlbmFsdHkgYmUgMy5cbiAgICB2YXIgc2hvcnRNb3JlUGVuYWx0eSA9IDM7XG5cbiAgICB2YXIgcGF0dGVyblBlbmFsdHkgPSAyO1xuXG4gICAgdmFyIGhvdXIxMlBlbmFsdHkgPSAxO1xuXG4gICAgLy8gNy4gTGV0IGJlc3RTY29yZSBiZSAtSW5maW5pdHkuXG4gICAgdmFyIGJlc3RTY29yZSA9IC1JbmZpbml0eTtcblxuICAgIC8vIDguIExldCBiZXN0Rm9ybWF0IGJlIHVuZGVmaW5lZC5cbiAgICB2YXIgYmVzdEZvcm1hdCA9IHZvaWQgMDtcblxuICAgIC8vIDkuIExldCBpIGJlIDAuXG4gICAgdmFyIGkgPSAwO1xuXG4gICAgLy8gMTAuIEFzc2VydDogZm9ybWF0cyBpcyBhbiBBcnJheSBvYmplY3QuXG5cbiAgICAvLyAxMS4gTGV0IGxlbiBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIGZvcm1hdHMgd2l0aCBhcmd1bWVudCBcImxlbmd0aFwiLlxuICAgIHZhciBsZW4gPSBmb3JtYXRzLmxlbmd0aDtcblxuICAgIC8vIDEyLiBSZXBlYXQgd2hpbGUgaSA8IGxlbjpcbiAgICB3aGlsZSAoaSA8IGxlbikge1xuICAgICAgICAvLyBhLiBMZXQgZm9ybWF0IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2YgZm9ybWF0cyB3aXRoIGFyZ3VtZW50IFRvU3RyaW5nKGkpLlxuICAgICAgICB2YXIgZm9ybWF0ID0gZm9ybWF0c1tpXTtcblxuICAgICAgICAvLyBiLiBMZXQgc2NvcmUgYmUgMC5cbiAgICAgICAgdmFyIHNjb3JlID0gMDtcblxuICAgICAgICAvLyBjLiBGb3IgZWFjaCBwcm9wZXJ0eSBzaG93biBpbiBUYWJsZSAzOlxuICAgICAgICBmb3IgKHZhciBfcHJvcGVydHkgaW4gZGF0ZVRpbWVDb21wb25lbnRzKSB7XG4gICAgICAgICAgICBpZiAoIWhvcC5jYWxsKGRhdGVUaW1lQ29tcG9uZW50cywgX3Byb3BlcnR5KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIGkuIExldCBvcHRpb25zUHJvcCBiZSBvcHRpb25zLltbPHByb3BlcnR5Pl1dLlxuICAgICAgICAgICAgdmFyIG9wdGlvbnNQcm9wID0gb3B0aW9uc1snW1snICsgX3Byb3BlcnR5ICsgJ11dJ107XG5cbiAgICAgICAgICAgIC8vIGlpLiBMZXQgZm9ybWF0UHJvcERlc2MgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldE93blByb3BlcnR5XV0gaW50ZXJuYWwgbWV0aG9kIG9mIGZvcm1hdFxuICAgICAgICAgICAgLy8gICAgIHdpdGggYXJndW1lbnQgcHJvcGVydHkuXG4gICAgICAgICAgICAvLyBpaWkuIElmIGZvcm1hdFByb3BEZXNjIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICAgICAgICAgIC8vICAgICAxLiBMZXQgZm9ybWF0UHJvcCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIGZvcm1hdCB3aXRoIGFyZ3VtZW50IHByb3BlcnR5LlxuICAgICAgICAgICAgdmFyIGZvcm1hdFByb3AgPSBob3AuY2FsbChmb3JtYXQsIF9wcm9wZXJ0eSkgPyBmb3JtYXRbX3Byb3BlcnR5XSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgLy8gRGl2ZXJnaW5nOiB1c2luZyB0aGUgZGVmYXVsdCBwcm9wZXJ0aWVzIHByb2R1Y2VkIGJ5IHRoZSBwYXR0ZXJuL3NrZWxldG9uXG4gICAgICAgICAgICAvLyB0byBtYXRjaCBpdCB3aXRoIHVzZXIgb3B0aW9ucywgYW5kIGFwcGx5IGEgcGVuYWx0eVxuICAgICAgICAgICAgdmFyIHBhdHRlcm5Qcm9wID0gaG9wLmNhbGwoZm9ybWF0Ll8sIF9wcm9wZXJ0eSkgPyBmb3JtYXQuX1tfcHJvcGVydHldIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnNQcm9wICE9PSBwYXR0ZXJuUHJvcCkge1xuICAgICAgICAgICAgICAgIHNjb3JlIC09IHBhdHRlcm5QZW5hbHR5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpdi4gSWYgb3B0aW9uc1Byb3AgaXMgdW5kZWZpbmVkIGFuZCBmb3JtYXRQcm9wIGlzIG5vdCB1bmRlZmluZWQsIHRoZW4gZGVjcmVhc2Ugc2NvcmUgYnlcbiAgICAgICAgICAgIC8vICAgICBhZGRpdGlvblBlbmFsdHkuXG4gICAgICAgICAgICBpZiAob3B0aW9uc1Byb3AgPT09IHVuZGVmaW5lZCAmJiBmb3JtYXRQcm9wICE9PSB1bmRlZmluZWQpIHNjb3JlIC09IGFkZGl0aW9uUGVuYWx0eTtcblxuICAgICAgICAgICAgLy8gdi4gRWxzZSBpZiBvcHRpb25zUHJvcCBpcyBub3QgdW5kZWZpbmVkIGFuZCBmb3JtYXRQcm9wIGlzIHVuZGVmaW5lZCwgdGhlbiBkZWNyZWFzZSBzY29yZSBieVxuICAgICAgICAgICAgLy8gICAgcmVtb3ZhbFBlbmFsdHkuXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zUHJvcCAhPT0gdW5kZWZpbmVkICYmIGZvcm1hdFByb3AgPT09IHVuZGVmaW5lZCkgc2NvcmUgLT0gcmVtb3ZhbFBlbmFsdHk7XG5cbiAgICAgICAgICAgICAgICAvLyB2aS4gRWxzZVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gTGV0IHZhbHVlcyBiZSB0aGUgYXJyYXkgW1wiMi1kaWdpdFwiLCBcIm51bWVyaWNcIiwgXCJuYXJyb3dcIiwgXCJzaG9ydFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJsb25nXCJdLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IFsnMi1kaWdpdCcsICdudW1lcmljJywgJ25hcnJvdycsICdzaG9ydCcsICdsb25nJ107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDIuIExldCBvcHRpb25zUHJvcEluZGV4IGJlIHRoZSBpbmRleCBvZiBvcHRpb25zUHJvcCB3aXRoaW4gdmFsdWVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnNQcm9wSW5kZXggPSBhcnJJbmRleE9mLmNhbGwodmFsdWVzLCBvcHRpb25zUHJvcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMuIExldCBmb3JtYXRQcm9wSW5kZXggYmUgdGhlIGluZGV4IG9mIGZvcm1hdFByb3Agd2l0aGluIHZhbHVlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtYXRQcm9wSW5kZXggPSBhcnJJbmRleE9mLmNhbGwodmFsdWVzLCBmb3JtYXRQcm9wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNC4gTGV0IGRlbHRhIGJlIG1heChtaW4oZm9ybWF0UHJvcEluZGV4IC0gb3B0aW9uc1Byb3BJbmRleCwgMiksIC0yKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWx0YSA9IE1hdGgubWF4KE1hdGgubWluKGZvcm1hdFByb3BJbmRleCAtIG9wdGlvbnNQcm9wSW5kZXgsIDIpLCAtMik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaXZlcmdpbmcgZnJvbSBzcGVjXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgYmVzdEZpdCBhcmd1bWVudCBpcyB0cnVlLCBzdWJ0cmFjdCBhZGRpdGlvbmFsIHBlbmFsdHkgd2hlcmUgZGF0YSB0eXBlcyBhcmUgbm90IHRoZSBzYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvcm1hdFByb3BJbmRleCA8PSAxICYmIG9wdGlvbnNQcm9wSW5kZXggPj0gMiB8fCBmb3JtYXRQcm9wSW5kZXggPj0gMiAmJiBvcHRpb25zUHJvcEluZGV4IDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gNS4gSWYgZGVsdGEgPSAyLCBkZWNyZWFzZSBzY29yZSBieSBsb25nTW9yZVBlbmFsdHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWx0YSA+IDApIHNjb3JlIC09IGxvbmdNb3JlUGVuYWx0eTtlbHNlIGlmIChkZWx0YSA8IDApIHNjb3JlIC09IGxvbmdMZXNzUGVuYWx0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA1LiBJZiBkZWx0YSA9IDIsIGRlY3JlYXNlIHNjb3JlIGJ5IGxvbmdNb3JlUGVuYWx0eS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlbHRhID4gMSkgc2NvcmUgLT0gc2hvcnRNb3JlUGVuYWx0eTtlbHNlIGlmIChkZWx0YSA8IC0xKSBzY29yZSAtPSBzaG9ydExlc3NQZW5hbHR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAge1xuICAgICAgICAgICAgLy8gZGl2ZXJnaW5nIHRvIGFsc28gdGFrZSBpbnRvIGNvbnNpZGVyYXRpb24gZGlmZmVyZW5jZXMgYmV0d2VlbiAxMiBvciAyNCBob3Vyc1xuICAgICAgICAgICAgLy8gd2hpY2ggaXMgc3BlY2lhbCBmb3IgdGhlIGJlc3QgZml0IG9ubHkuXG4gICAgICAgICAgICBpZiAoZm9ybWF0Ll8uaG91cjEyICE9PSBvcHRpb25zLmhvdXIxMikge1xuICAgICAgICAgICAgICAgIHNjb3JlIC09IGhvdXIxMlBlbmFsdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkLiBJZiBzY29yZSA+IGJlc3RTY29yZSwgdGhlblxuICAgICAgICBpZiAoc2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgICAgIC8vIGkuIExldCBiZXN0U2NvcmUgYmUgc2NvcmUuXG4gICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICAgIC8vIGlpLiBMZXQgYmVzdEZvcm1hdCBiZSBmb3JtYXQuXG4gICAgICAgICAgICBiZXN0Rm9ybWF0ID0gZm9ybWF0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZS4gSW5jcmVhc2UgaSBieSAxLlxuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gMTMuIFJldHVybiBiZXN0Rm9ybWF0LlxuICAgIHJldHVybiBiZXN0Rm9ybWF0O1xufVxuXG4vKiAxMi4yLjMgKi9pbnRlcm5hbHMuRGF0ZVRpbWVGb3JtYXQgPSB7XG4gICAgJ1tbYXZhaWxhYmxlTG9jYWxlc11dJzogW10sXG4gICAgJ1tbcmVsZXZhbnRFeHRlbnNpb25LZXlzXV0nOiBbJ2NhJywgJ251J10sXG4gICAgJ1tbbG9jYWxlRGF0YV1dJzoge31cbn07XG5cbi8qKlxuICogV2hlbiB0aGUgc3VwcG9ydGVkTG9jYWxlc09mIG1ldGhvZCBvZiBJbnRsLkRhdGVUaW1lRm9ybWF0IGlzIGNhbGxlZCwgdGhlXG4gKiBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG4vKiAxMi4yLjIgKi9cbmRlZmluZVByb3BlcnR5KEludGwuRGF0ZVRpbWVGb3JtYXQsICdzdXBwb3J0ZWRMb2NhbGVzT2YnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBmbkJpbmQuY2FsbChmdW5jdGlvbiAobG9jYWxlcykge1xuICAgICAgICAvLyBCb3VuZCBmdW5jdGlvbnMgb25seSBoYXZlIHRoZSBgdGhpc2AgdmFsdWUgYWx0ZXJlZCBpZiBiZWluZyB1c2VkIGFzIGEgY29uc3RydWN0b3IsXG4gICAgICAgIC8vIHRoaXMgbGV0cyB1cyBpbWl0YXRlIGEgbmF0aXZlIGZ1bmN0aW9uIHRoYXQgaGFzIG5vIGNvbnN0cnVjdG9yXG4gICAgICAgIGlmICghaG9wLmNhbGwodGhpcywgJ1tbYXZhaWxhYmxlTG9jYWxlc11dJykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N1cHBvcnRlZExvY2FsZXNPZigpIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB3aG9zZSBwcm9wcyBjYW4gYmUgdXNlZCB0byByZXN0b3JlIHRoZSB2YWx1ZXMgb2YgUmVnRXhwIHByb3BzXG4gICAgICAgIHZhciByZWdleHBSZXN0b3JlID0gY3JlYXRlUmVnRXhwUmVzdG9yZSgpLFxuXG5cbiAgICAgICAgLy8gMS4gSWYgb3B0aW9ucyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IG9wdGlvbnMgYmUgdW5kZWZpbmVkLlxuICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzWzFdLFxuXG5cbiAgICAgICAgLy8gMi4gTGV0IGF2YWlsYWJsZUxvY2FsZXMgYmUgdGhlIHZhbHVlIG9mIHRoZSBbW2F2YWlsYWJsZUxvY2FsZXNdXSBpbnRlcm5hbFxuICAgICAgICAvLyAgICBwcm9wZXJ0eSBvZiB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gb2JqZWN0IHRoYXQgaXMgdGhlIGluaXRpYWwgdmFsdWUgb2ZcbiAgICAgICAgLy8gICAgSW50bC5OdW1iZXJGb3JtYXQuXG5cbiAgICAgICAgYXZhaWxhYmxlTG9jYWxlcyA9IHRoaXNbJ1tbYXZhaWxhYmxlTG9jYWxlc11dJ10sXG5cblxuICAgICAgICAvLyAzLiBMZXQgcmVxdWVzdGVkTG9jYWxlcyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIENhbm9uaWNhbGl6ZUxvY2FsZUxpc3RcbiAgICAgICAgLy8gICAgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkIGluIDkuMi4xKSB3aXRoIGFyZ3VtZW50IGxvY2FsZXMuXG4gICAgICAgIHJlcXVlc3RlZExvY2FsZXMgPSBDYW5vbmljYWxpemVMb2NhbGVMaXN0KGxvY2FsZXMpO1xuXG4gICAgICAgIC8vIFJlc3RvcmUgdGhlIFJlZ0V4cCBwcm9wZXJ0aWVzXG4gICAgICAgIHJlZ2V4cFJlc3RvcmUoKTtcblxuICAgICAgICAvLyA0LiBSZXR1cm4gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBTdXBwb3J0ZWRMb2NhbGVzIGFic3RyYWN0IG9wZXJhdGlvblxuICAgICAgICAvLyAgICAoZGVmaW5lZCBpbiA5LjIuOCkgd2l0aCBhcmd1bWVudHMgYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcyxcbiAgICAgICAgLy8gICAgYW5kIG9wdGlvbnMuXG4gICAgICAgIHJldHVybiBTdXBwb3J0ZWRMb2NhbGVzKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMsIG9wdGlvbnMpO1xuICAgIH0sIGludGVybmFscy5OdW1iZXJGb3JtYXQpXG59KTtcblxuLyoqXG4gKiBUaGlzIG5hbWVkIGFjY2Vzc29yIHByb3BlcnR5IHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGZvcm1hdHMgYSBudW1iZXJcbiAqIGFjY29yZGluZyB0byB0aGUgZWZmZWN0aXZlIGxvY2FsZSBhbmQgdGhlIGZvcm1hdHRpbmcgb3B0aW9ucyBvZiB0aGlzXG4gKiBEYXRlVGltZUZvcm1hdCBvYmplY3QuXG4gKi9cbi8qIDEyLjMuMiAqL2RlZmluZVByb3BlcnR5KEludGwuRGF0ZVRpbWVGb3JtYXQucHJvdG90eXBlLCAnZm9ybWF0Jywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IEdldEZvcm1hdERhdGVUaW1lXG59KTtcblxuZnVuY3Rpb24gR2V0Rm9ybWF0RGF0ZVRpbWUoKSB7XG4gICAgdmFyIGludGVybmFsID0gdGhpcyAhPT0gbnVsbCAmJiBiYWJlbEhlbHBlcnMkMVtcInR5cGVvZlwiXSh0aGlzKSA9PT0gJ29iamVjdCcgJiYgZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzKHRoaXMpO1xuXG4gICAgLy8gU2F0aXNmeSB0ZXN0IDEyLjNfYlxuICAgIGlmICghaW50ZXJuYWwgfHwgIWludGVybmFsWydbW2luaXRpYWxpemVkRGF0ZVRpbWVGb3JtYXRdXSddKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2AgdmFsdWUgZm9yIGZvcm1hdCgpIGlzIG5vdCBhbiBpbml0aWFsaXplZCBJbnRsLkRhdGVUaW1lRm9ybWF0IG9iamVjdC4nKTtcblxuICAgIC8vIFRoZSB2YWx1ZSBvZiB0aGUgW1tHZXRdXSBhdHRyaWJ1dGUgaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBmb2xsb3dpbmdcbiAgICAvLyBzdGVwczpcblxuICAgIC8vIDEuIElmIHRoZSBbW2JvdW5kRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgdGhpcyBEYXRlVGltZUZvcm1hdCBvYmplY3RcbiAgICAvLyAgICBpcyB1bmRlZmluZWQsIHRoZW46XG4gICAgaWYgKGludGVybmFsWydbW2JvdW5kRm9ybWF0XV0nXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGEuIExldCBGIGJlIGEgRnVuY3Rpb24gb2JqZWN0LCB3aXRoIGludGVybmFsIHByb3BlcnRpZXMgc2V0IGFzXG4gICAgICAgIC8vICAgIHNwZWNpZmllZCBmb3IgYnVpbHQtaW4gZnVuY3Rpb25zIGluIEVTNSwgMTUsIG9yIHN1Y2Nlc3NvciwgYW5kIHRoZVxuICAgICAgICAvLyAgICBsZW5ndGggcHJvcGVydHkgc2V0IHRvIDAsIHRoYXQgdGFrZXMgdGhlIGFyZ3VtZW50IGRhdGUgYW5kXG4gICAgICAgIC8vICAgIHBlcmZvcm1zIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgIHZhciBGID0gZnVuY3Rpb24gRigpIHtcbiAgICAgICAgICAgIHZhciBkYXRlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAgICAgICAvLyAgIGkuIElmIGRhdGUgaXMgbm90IHByb3ZpZGVkIG9yIGlzIHVuZGVmaW5lZCwgdGhlbiBsZXQgeCBiZSB0aGVcbiAgICAgICAgICAgIC8vICAgICAgcmVzdWx0IGFzIGlmIGJ5IHRoZSBleHByZXNzaW9uIERhdGUubm93KCkgd2hlcmUgRGF0ZS5ub3cgaXNcbiAgICAgICAgICAgIC8vICAgICAgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIGZ1bmN0aW9uIGRlZmluZWQgaW4gRVM1LCAxNS45LjQuNC5cbiAgICAgICAgICAgIC8vICBpaS4gRWxzZSBsZXQgeCBiZSBUb051bWJlcihkYXRlKS5cbiAgICAgICAgICAgIC8vIGlpaS4gUmV0dXJuIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgRm9ybWF0RGF0ZVRpbWUgYWJzdHJhY3RcbiAgICAgICAgICAgIC8vICAgICAgb3BlcmF0aW9uIChkZWZpbmVkIGJlbG93KSB3aXRoIGFyZ3VtZW50cyB0aGlzIGFuZCB4LlxuICAgICAgICAgICAgdmFyIHggPSBkYXRlID09PSB1bmRlZmluZWQgPyBEYXRlLm5vdygpIDogdG9OdW1iZXIoZGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gRm9ybWF0RGF0ZVRpbWUodGhpcywgeCk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGIuIExldCBiaW5kIGJlIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBmdW5jdGlvbiBvYmplY3QgZGVmaW5lZCBpbiBFUzUsXG4gICAgICAgIC8vICAgIDE1LjMuNC41LlxuICAgICAgICAvLyBjLiBMZXQgYmYgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NhbGxdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgLy8gICAgYmluZCB3aXRoIEYgYXMgdGhlIHRoaXMgdmFsdWUgYW5kIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZ1xuICAgICAgICAvLyAgICB0aGUgc2luZ2xlIGl0ZW0gdGhpcy5cbiAgICAgICAgdmFyIGJmID0gZm5CaW5kLmNhbGwoRiwgdGhpcyk7XG4gICAgICAgIC8vIGQuIFNldCB0aGUgW1tib3VuZEZvcm1hdF1dIGludGVybmFsIHByb3BlcnR5IG9mIHRoaXMgTnVtYmVyRm9ybWF0XG4gICAgICAgIC8vICAgIG9iamVjdCB0byBiZi5cbiAgICAgICAgaW50ZXJuYWxbJ1tbYm91bmRGb3JtYXRdXSddID0gYmY7XG4gICAgfVxuICAgIC8vIFJldHVybiB0aGUgdmFsdWUgb2YgdGhlIFtbYm91bmRGb3JtYXRdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiB0aGlzXG4gICAgLy8gTnVtYmVyRm9ybWF0IG9iamVjdC5cbiAgICByZXR1cm4gaW50ZXJuYWxbJ1tbYm91bmRGb3JtYXRdXSddO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRUb1BhcnRzJDEoKSB7XG4gICAgdmFyIGRhdGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMF07XG5cbiAgICB2YXIgaW50ZXJuYWwgPSB0aGlzICE9PSBudWxsICYmIGJhYmVsSGVscGVycyQxW1widHlwZW9mXCJdKHRoaXMpID09PSAnb2JqZWN0JyAmJiBnZXRJbnRlcm5hbFByb3BlcnRpZXModGhpcyk7XG5cbiAgICBpZiAoIWludGVybmFsIHx8ICFpbnRlcm5hbFsnW1tpbml0aWFsaXplZERhdGVUaW1lRm9ybWF0XV0nXSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIHZhbHVlIGZvciBmb3JtYXRUb1BhcnRzKCkgaXMgbm90IGFuIGluaXRpYWxpemVkIEludGwuRGF0ZVRpbWVGb3JtYXQgb2JqZWN0LicpO1xuXG4gICAgdmFyIHggPSBkYXRlID09PSB1bmRlZmluZWQgPyBEYXRlLm5vdygpIDogdG9OdW1iZXIoZGF0ZSk7XG4gICAgcmV0dXJuIEZvcm1hdFRvUGFydHNEYXRlVGltZSh0aGlzLCB4KTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEludGwuRGF0ZVRpbWVGb3JtYXQucHJvdG90eXBlLCAnZm9ybWF0VG9QYXJ0cycsIHtcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgdmFsdWU6IGZvcm1hdFRvUGFydHMkMVxufSk7XG5cbmZ1bmN0aW9uIENyZWF0ZURhdGVUaW1lUGFydHMoZGF0ZVRpbWVGb3JtYXQsIHgpIHtcbiAgICAvLyAxLiBJZiB4IGlzIG5vdCBhIGZpbml0ZSBOdW1iZXIsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCB2YWxpZCBkYXRlIHBhc3NlZCB0byBmb3JtYXQnKTtcblxuICAgIHZhciBpbnRlcm5hbCA9IGRhdGVUaW1lRm9ybWF0Ll9fZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzKHNlY3JldCk7XG5cbiAgICAvLyBDcmVhdGluZyByZXN0b3JlIHBvaW50IGZvciBwcm9wZXJ0aWVzIG9uIHRoZSBSZWdFeHAgb2JqZWN0Li4uIHBsZWFzZSB3YWl0XG4gICAgLyogbGV0IHJlZ2V4cFJlc3RvcmUgPSAqL2NyZWF0ZVJlZ0V4cFJlc3RvcmUoKTsgLy8gIyMjVE9ETzogcmV2aWV3IHRoaXNcblxuICAgIC8vIDIuIExldCBsb2NhbGUgYmUgdGhlIHZhbHVlIG9mIHRoZSBbW2xvY2FsZV1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0LlxuICAgIHZhciBsb2NhbGUgPSBpbnRlcm5hbFsnW1tsb2NhbGVdXSddO1xuXG4gICAgLy8gMy4gTGV0IG5mIGJlIHRoZSByZXN1bHQgb2YgY3JlYXRpbmcgYSBuZXcgTnVtYmVyRm9ybWF0IG9iamVjdCBhcyBpZiBieSB0aGVcbiAgICAvLyBleHByZXNzaW9uIG5ldyBJbnRsLk51bWJlckZvcm1hdChbbG9jYWxlXSwge3VzZUdyb3VwaW5nOiBmYWxzZX0pIHdoZXJlXG4gICAgLy8gSW50bC5OdW1iZXJGb3JtYXQgaXMgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIGNvbnN0cnVjdG9yIGRlZmluZWQgaW4gMTEuMS4zLlxuICAgIHZhciBuZiA9IG5ldyBJbnRsLk51bWJlckZvcm1hdChbbG9jYWxlXSwgeyB1c2VHcm91cGluZzogZmFsc2UgfSk7XG5cbiAgICAvLyA0LiBMZXQgbmYyIGJlIHRoZSByZXN1bHQgb2YgY3JlYXRpbmcgYSBuZXcgTnVtYmVyRm9ybWF0IG9iamVjdCBhcyBpZiBieSB0aGVcbiAgICAvLyBleHByZXNzaW9uIG5ldyBJbnRsLk51bWJlckZvcm1hdChbbG9jYWxlXSwge21pbmltdW1JbnRlZ2VyRGlnaXRzOiAyLCB1c2VHcm91cGluZzpcbiAgICAvLyBmYWxzZX0pIHdoZXJlIEludGwuTnVtYmVyRm9ybWF0IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvciBkZWZpbmVkIGluXG4gICAgLy8gMTEuMS4zLlxuICAgIHZhciBuZjIgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoW2xvY2FsZV0sIHsgbWluaW11bUludGVnZXJEaWdpdHM6IDIsIHVzZUdyb3VwaW5nOiBmYWxzZSB9KTtcblxuICAgIC8vIDUuIExldCB0bSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFRvTG9jYWxUaW1lIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZFxuICAgIC8vIGJlbG93KSB3aXRoIHgsIHRoZSB2YWx1ZSBvZiB0aGUgW1tjYWxlbmRhcl1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0LFxuICAgIC8vIGFuZCB0aGUgdmFsdWUgb2YgdGhlIFtbdGltZVpvbmVdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdC5cbiAgICB2YXIgdG0gPSBUb0xvY2FsVGltZSh4LCBpbnRlcm5hbFsnW1tjYWxlbmRhcl1dJ10sIGludGVybmFsWydbW3RpbWVab25lXV0nXSk7XG5cbiAgICAvLyA2LiBMZXQgcmVzdWx0IGJlIHRoZSB2YWx1ZSBvZiB0aGUgW1twYXR0ZXJuXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQuXG4gICAgdmFyIHBhdHRlcm4gPSBpbnRlcm5hbFsnW1twYXR0ZXJuXV0nXTtcblxuICAgIC8vIDcuXG4gICAgdmFyIHJlc3VsdCA9IG5ldyBMaXN0KCk7XG5cbiAgICAvLyA4LlxuICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICAvLyA5LlxuICAgIHZhciBiZWdpbkluZGV4ID0gcGF0dGVybi5pbmRleE9mKCd7Jyk7XG5cbiAgICAvLyAxMC5cbiAgICB2YXIgZW5kSW5kZXggPSAwO1xuXG4gICAgLy8gTmVlZCB0aGUgbG9jYWxlIG1pbnVzIGFueSBleHRlbnNpb25zXG4gICAgdmFyIGRhdGFMb2NhbGUgPSBpbnRlcm5hbFsnW1tkYXRhTG9jYWxlXV0nXTtcblxuICAgIC8vIE5lZWQgdGhlIGNhbGVuZGFyIGRhdGEgZnJvbSBDTERSXG4gICAgdmFyIGxvY2FsZURhdGEgPSBpbnRlcm5hbHMuRGF0ZVRpbWVGb3JtYXRbJ1tbbG9jYWxlRGF0YV1dJ11bZGF0YUxvY2FsZV0uY2FsZW5kYXJzO1xuICAgIHZhciBjYSA9IGludGVybmFsWydbW2NhbGVuZGFyXV0nXTtcblxuICAgIC8vIDExLlxuICAgIHdoaWxlIChiZWdpbkluZGV4ICE9PSAtMSkge1xuICAgICAgICB2YXIgZnYgPSB2b2lkIDA7XG4gICAgICAgIC8vIGEuXG4gICAgICAgIGVuZEluZGV4ID0gcGF0dGVybi5pbmRleE9mKCd9JywgYmVnaW5JbmRleCk7XG4gICAgICAgIC8vIGIuXG4gICAgICAgIGlmIChlbmRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgcGF0dGVybicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGMuXG4gICAgICAgIGlmIChiZWdpbkluZGV4ID4gaW5kZXgpIHtcbiAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGl0ZXJhbCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHBhdHRlcm4uc3Vic3RyaW5nKGluZGV4LCBiZWdpbkluZGV4KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZC5cbiAgICAgICAgdmFyIHAgPSBwYXR0ZXJuLnN1YnN0cmluZyhiZWdpbkluZGV4ICsgMSwgZW5kSW5kZXgpO1xuICAgICAgICAvLyBlLlxuICAgICAgICBpZiAoZGF0ZVRpbWVDb21wb25lbnRzLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICAgICAgICAvLyAgIGkuIExldCBmIGJlIHRoZSB2YWx1ZSBvZiB0aGUgW1s8cD5dXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdC5cbiAgICAgICAgICAgIHZhciBmID0gaW50ZXJuYWxbJ1tbJyArIHAgKyAnXV0nXTtcbiAgICAgICAgICAgIC8vICBpaS4gTGV0IHYgYmUgdGhlIHZhbHVlIG9mIHRtLltbPHA+XV0uXG4gICAgICAgICAgICB2YXIgdiA9IHRtWydbWycgKyBwICsgJ11dJ107XG4gICAgICAgICAgICAvLyBpaWkuIElmIHAgaXMgXCJ5ZWFyXCIgYW5kIHYg4omkIDAsIHRoZW4gbGV0IHYgYmUgMSAtIHYuXG4gICAgICAgICAgICBpZiAocCA9PT0gJ3llYXInICYmIHYgPD0gMCkge1xuICAgICAgICAgICAgICAgIHYgPSAxIC0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vICBpdi4gSWYgcCBpcyBcIm1vbnRoXCIsIHRoZW4gaW5jcmVhc2UgdiBieSAxLlxuICAgICAgICAgICAgZWxzZSBpZiAocCA9PT0gJ21vbnRoJykge1xuICAgICAgICAgICAgICAgICAgICB2Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgdi4gSWYgcCBpcyBcImhvdXJcIiBhbmQgdGhlIHZhbHVlIG9mIHRoZSBbW2hvdXIxMl1dIGludGVybmFsIHByb3BlcnR5IG9mXG4gICAgICAgICAgICAgICAgLy8gICAgICBkYXRlVGltZUZvcm1hdCBpcyB0cnVlLCB0aGVuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocCA9PT0gJ2hvdXInICYmIGludGVybmFsWydbW2hvdXIxMl1dJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEuIExldCB2IGJlIHYgbW9kdWxvIDEyLlxuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHYgJSAxMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDIuIElmIHYgaXMgMCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBbW2hvdXJObzBdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgZGF0ZVRpbWVGb3JtYXQgaXMgdHJ1ZSwgdGhlbiBsZXQgdiBiZSAxMi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2ID09PSAwICYmIGludGVybmFsWydbW2hvdXJObzBdXSddID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdiA9IDEyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vICB2aS4gSWYgZiBpcyBcIm51bWVyaWNcIiwgdGhlblxuICAgICAgICAgICAgaWYgKGYgPT09ICdudW1lcmljJykge1xuICAgICAgICAgICAgICAgIC8vIDEuIExldCBmdiBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEZvcm1hdE51bWJlciBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAgICAgICAgICAgICAvLyAgICAoZGVmaW5lZCBpbiAxMS4zLjIpIHdpdGggYXJndW1lbnRzIG5mIGFuZCB2LlxuICAgICAgICAgICAgICAgIGZ2ID0gRm9ybWF0TnVtYmVyKG5mLCB2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHZpaS4gRWxzZSBpZiBmIGlzIFwiMi1kaWdpdFwiLCB0aGVuXG4gICAgICAgICAgICBlbHNlIGlmIChmID09PSAnMi1kaWdpdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMS4gTGV0IGZ2IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgRm9ybWF0TnVtYmVyIGFic3RyYWN0IG9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyAgICB3aXRoIGFyZ3VtZW50cyBuZjIgYW5kIHYuXG4gICAgICAgICAgICAgICAgICAgIGZ2ID0gRm9ybWF0TnVtYmVyKG5mMiwgdik7XG4gICAgICAgICAgICAgICAgICAgIC8vIDIuIElmIHRoZSBsZW5ndGggb2YgZnYgaXMgZ3JlYXRlciB0aGFuIDIsIGxldCBmdiBiZSB0aGUgc3Vic3RyaW5nIG9mIGZ2XG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNvbnRhaW5pbmcgdGhlIGxhc3QgdHdvIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChmdi5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdiA9IGZ2LnNsaWNlKC0yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyB2aWlpLiBFbHNlIGlmIGYgaXMgXCJuYXJyb3dcIiwgXCJzaG9ydFwiLCBvciBcImxvbmdcIiwgdGhlbiBsZXQgZnYgYmUgYSBTdHJpbmdcbiAgICAgICAgICAgICAgICAvLyAgICAgdmFsdWUgcmVwcmVzZW50aW5nIGYgaW4gdGhlIGRlc2lyZWQgZm9ybTsgdGhlIFN0cmluZyB2YWx1ZSBkZXBlbmRzIHVwb25cbiAgICAgICAgICAgICAgICAvLyAgICAgdGhlIGltcGxlbWVudGF0aW9uIGFuZCB0aGUgZWZmZWN0aXZlIGxvY2FsZSBhbmQgY2FsZW5kYXIgb2ZcbiAgICAgICAgICAgICAgICAvLyAgICAgZGF0ZVRpbWVGb3JtYXQuIElmIHAgaXMgXCJtb250aFwiLCB0aGVuIHRoZSBTdHJpbmcgdmFsdWUgbWF5IGFsc28gZGVwZW5kXG4gICAgICAgICAgICAgICAgLy8gICAgIG9uIHdoZXRoZXIgZGF0ZVRpbWVGb3JtYXQgaGFzIGEgW1tkYXldXSBpbnRlcm5hbCBwcm9wZXJ0eS4gSWYgcCBpc1xuICAgICAgICAgICAgICAgIC8vICAgICBcInRpbWVab25lTmFtZVwiLCB0aGVuIHRoZSBTdHJpbmcgdmFsdWUgbWF5IGFsc28gZGVwZW5kIG9uIHRoZSB2YWx1ZSBvZlxuICAgICAgICAgICAgICAgIC8vICAgICB0aGUgW1tpbkRTVF1dIGZpZWxkIG9mIHRtLlxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGYgaW4gZGF0ZVdpZHRocykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdiA9IHJlc29sdmVEYXRlU3RyaW5nKGxvY2FsZURhdGEsIGNhLCAnbW9udGhzJywgZiwgdG1bJ1tbJyArIHAgKyAnXV0nXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnd2Vla2RheSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdiA9IHJlc29sdmVEYXRlU3RyaW5nKGxvY2FsZURhdGEsIGNhLCAnZGF5cycsIGYsIHRtWydbWycgKyBwICsgJ11dJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZnYgPSByZXNvbHZlRGF0ZVN0cmluZyhjYS5kYXlzLCBmKVt0bVsnW1snKyBwICsnXV0nXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgd2Vla2RheSBkYXRhIGZvciBsb2NhbGUgJyArIGxvY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0aW1lWm9uZU5hbWUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdiA9ICcnOyAvLyAjIyNUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZXJhJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ2ID0gcmVzb2x2ZURhdGVTdHJpbmcobG9jYWxlRGF0YSwgY2EsICdlcmFzJywgZiwgdG1bJ1tbJyArIHAgKyAnXV0nXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgZXJhIGRhdGEgZm9yIGxvY2FsZSAnICsgbG9jYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ2ID0gdG1bJ1tbJyArIHAgKyAnXV0nXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaXhcbiAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBwLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBmdlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBmLlxuICAgICAgICB9IGVsc2UgaWYgKHAgPT09ICdhbXBtJykge1xuICAgICAgICAgICAgLy8gaS5cbiAgICAgICAgICAgIHZhciBfdiA9IHRtWydbW2hvdXJdXSddO1xuICAgICAgICAgICAgLy8gaWkuL2lpaS5cbiAgICAgICAgICAgIGZ2ID0gcmVzb2x2ZURhdGVTdHJpbmcobG9jYWxlRGF0YSwgY2EsICdkYXlQZXJpb2RzJywgX3YgPiAxMSA/ICdwbScgOiAnYW0nLCBudWxsKTtcbiAgICAgICAgICAgIC8vIGl2LlxuICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdkYXlQZXJpb2QnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBmdlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBnLlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaXRlcmFsJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcGF0dGVybi5zdWJzdHJpbmcoYmVnaW5JbmRleCwgZW5kSW5kZXggKyAxKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaC5cbiAgICAgICAgaW5kZXggPSBlbmRJbmRleCArIDE7XG4gICAgICAgIC8vIGkuXG4gICAgICAgIGJlZ2luSW5kZXggPSBwYXR0ZXJuLmluZGV4T2YoJ3snLCBpbmRleCk7XG4gICAgfVxuICAgIC8vIDEyLlxuICAgIGlmIChlbmRJbmRleCA8IHBhdHRlcm4ubGVuZ3RoIC0gMSkge1xuICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7XG4gICAgICAgICAgICB0eXBlOiAnbGl0ZXJhbCcsXG4gICAgICAgICAgICB2YWx1ZTogcGF0dGVybi5zdWJzdHIoZW5kSW5kZXggKyAxKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gMTMuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBXaGVuIHRoZSBGb3JtYXREYXRlVGltZSBhYnN0cmFjdCBvcGVyYXRpb24gaXMgY2FsbGVkIHdpdGggYXJndW1lbnRzIGRhdGVUaW1lRm9ybWF0XG4gKiAod2hpY2ggbXVzdCBiZSBhbiBvYmplY3QgaW5pdGlhbGl6ZWQgYXMgYSBEYXRlVGltZUZvcm1hdCkgYW5kIHggKHdoaWNoIG11c3QgYmUgYSBOdW1iZXJcbiAqIHZhbHVlKSwgaXQgcmV0dXJucyBhIFN0cmluZyB2YWx1ZSByZXByZXNlbnRpbmcgeCAoaW50ZXJwcmV0ZWQgYXMgYSB0aW1lIHZhbHVlIGFzXG4gKiBzcGVjaWZpZWQgaW4gRVM1LCAxNS45LjEuMSkgYWNjb3JkaW5nIHRvIHRoZSBlZmZlY3RpdmUgbG9jYWxlIGFuZCB0aGUgZm9ybWF0dGluZ1xuICogb3B0aW9ucyBvZiBkYXRlVGltZUZvcm1hdC5cbiAqL1xuZnVuY3Rpb24gRm9ybWF0RGF0ZVRpbWUoZGF0ZVRpbWVGb3JtYXQsIHgpIHtcbiAgICB2YXIgcGFydHMgPSBDcmVhdGVEYXRlVGltZVBhcnRzKGRhdGVUaW1lRm9ybWF0LCB4KTtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgcGFydHMubGVuZ3RoID4gaTsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgIHJlc3VsdCArPSBwYXJ0LnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBGb3JtYXRUb1BhcnRzRGF0ZVRpbWUoZGF0ZVRpbWVGb3JtYXQsIHgpIHtcbiAgICB2YXIgcGFydHMgPSBDcmVhdGVEYXRlVGltZVBhcnRzKGRhdGVUaW1lRm9ybWF0LCB4KTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IHBhcnRzLmxlbmd0aCA+IGk7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IHBhcnRzW2ldO1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBwYXJ0LnR5cGUsXG4gICAgICAgICAgICB2YWx1ZTogcGFydC52YWx1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBXaGVuIHRoZSBUb0xvY2FsVGltZSBhYnN0cmFjdCBvcGVyYXRpb24gaXMgY2FsbGVkIHdpdGggYXJndW1lbnRzIGRhdGUsIGNhbGVuZGFyLCBhbmRcbiAqIHRpbWVab25lLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gVG9Mb2NhbFRpbWUoZGF0ZSwgY2FsZW5kYXIsIHRpbWVab25lKSB7XG4gICAgLy8gMS4gQXBwbHkgY2FsZW5kcmljYWwgY2FsY3VsYXRpb25zIG9uIGRhdGUgZm9yIHRoZSBnaXZlbiBjYWxlbmRhciBhbmQgdGltZSB6b25lIHRvXG4gICAgLy8gICAgcHJvZHVjZSB3ZWVrZGF5LCBlcmEsIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBhbmQgaW5EU1QgdmFsdWVzLlxuICAgIC8vICAgIFRoZSBjYWxjdWxhdGlvbnMgc2hvdWxkIHVzZSBiZXN0IGF2YWlsYWJsZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3BlY2lmaWVkXG4gICAgLy8gICAgY2FsZW5kYXIgYW5kIHRpbWUgem9uZS4gSWYgdGhlIGNhbGVuZGFyIGlzIFwiZ3JlZ29yeVwiLCB0aGVuIHRoZSBjYWxjdWxhdGlvbnMgbXVzdFxuICAgIC8vICAgIG1hdGNoIHRoZSBhbGdvcml0aG1zIHNwZWNpZmllZCBpbiBFUzUsIDE1LjkuMSwgZXhjZXB0IHRoYXQgY2FsY3VsYXRpb25zIGFyZSBub3RcbiAgICAvLyAgICBib3VuZCBieSB0aGUgcmVzdHJpY3Rpb25zIG9uIHRoZSB1c2Ugb2YgYmVzdCBhdmFpbGFibGUgaW5mb3JtYXRpb24gb24gdGltZSB6b25lc1xuICAgIC8vICAgIGZvciBsb2NhbCB0aW1lIHpvbmUgYWRqdXN0bWVudCBhbmQgZGF5bGlnaHQgc2F2aW5nIHRpbWUgYWRqdXN0bWVudCBpbXBvc2VkIGJ5XG4gICAgLy8gICAgRVM1LCAxNS45LjEuNyBhbmQgMTUuOS4xLjguXG4gICAgLy8gIyMjVE9ETyMjI1xuICAgIHZhciBkID0gbmV3IERhdGUoZGF0ZSksXG4gICAgICAgIG0gPSAnZ2V0JyArICh0aW1lWm9uZSB8fCAnJyk7XG5cbiAgICAvLyAyLiBSZXR1cm4gYSBSZWNvcmQgd2l0aCBmaWVsZHMgW1t3ZWVrZGF5XV0sIFtbZXJhXV0sIFtbeWVhcl1dLCBbW21vbnRoXV0sIFtbZGF5XV0sXG4gICAgLy8gICAgW1tob3VyXV0sIFtbbWludXRlXV0sIFtbc2Vjb25kXV0sIGFuZCBbW2luRFNUXV0sIGVhY2ggd2l0aCB0aGUgY29ycmVzcG9uZGluZ1xuICAgIC8vICAgIGNhbGN1bGF0ZWQgdmFsdWUuXG4gICAgcmV0dXJuIG5ldyBSZWNvcmQoe1xuICAgICAgICAnW1t3ZWVrZGF5XV0nOiBkW20gKyAnRGF5J10oKSxcbiAgICAgICAgJ1tbZXJhXV0nOiArKGRbbSArICdGdWxsWWVhciddKCkgPj0gMCksXG4gICAgICAgICdbW3llYXJdXSc6IGRbbSArICdGdWxsWWVhciddKCksXG4gICAgICAgICdbW21vbnRoXV0nOiBkW20gKyAnTW9udGgnXSgpLFxuICAgICAgICAnW1tkYXldXSc6IGRbbSArICdEYXRlJ10oKSxcbiAgICAgICAgJ1tbaG91cl1dJzogZFttICsgJ0hvdXJzJ10oKSxcbiAgICAgICAgJ1tbbWludXRlXV0nOiBkW20gKyAnTWludXRlcyddKCksXG4gICAgICAgICdbW3NlY29uZF1dJzogZFttICsgJ1NlY29uZHMnXSgpLFxuICAgICAgICAnW1tpbkRTVF1dJzogZmFsc2UgLy8gIyMjVE9ETyMjI1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFRoZSBmdW5jdGlvbiByZXR1cm5zIGEgbmV3IG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFuZCBhdHRyaWJ1dGVzIGFyZSBzZXQgYXMgaWZcbiAqIGNvbnN0cnVjdGVkIGJ5IGFuIG9iamVjdCBsaXRlcmFsIGFzc2lnbmluZyB0byBlYWNoIG9mIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllcyB0aGVcbiAqIHZhbHVlIG9mIHRoZSBjb3JyZXNwb25kaW5nIGludGVybmFsIHByb3BlcnR5IG9mIHRoaXMgRGF0ZVRpbWVGb3JtYXQgb2JqZWN0IChzZWUgMTIuNCk6XG4gKiBsb2NhbGUsIGNhbGVuZGFyLCBudW1iZXJpbmdTeXN0ZW0sIHRpbWVab25lLCBob3VyMTIsIHdlZWtkYXksIGVyYSwgeWVhciwgbW9udGgsIGRheSxcbiAqIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBhbmQgdGltZVpvbmVOYW1lLiBQcm9wZXJ0aWVzIHdob3NlIGNvcnJlc3BvbmRpbmcgaW50ZXJuYWxcbiAqIHByb3BlcnRpZXMgYXJlIG5vdCBwcmVzZW50IGFyZSBub3QgYXNzaWduZWQuXG4gKi9cbi8qIDEyLjMuMyAqL2RlZmluZVByb3BlcnR5KEludGwuRGF0ZVRpbWVGb3JtYXQucHJvdG90eXBlLCAncmVzb2x2ZWRPcHRpb25zJywge1xuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUoKSB7XG4gICAgICAgIHZhciBwcm9wID0gdm9pZCAwLFxuICAgICAgICAgICAgZGVzY3MgPSBuZXcgUmVjb3JkKCksXG4gICAgICAgICAgICBwcm9wcyA9IFsnbG9jYWxlJywgJ2NhbGVuZGFyJywgJ251bWJlcmluZ1N5c3RlbScsICd0aW1lWm9uZScsICdob3VyMTInLCAnd2Vla2RheScsICdlcmEnLCAneWVhcicsICdtb250aCcsICdkYXknLCAnaG91cicsICdtaW51dGUnLCAnc2Vjb25kJywgJ3RpbWVab25lTmFtZSddLFxuICAgICAgICAgICAgaW50ZXJuYWwgPSB0aGlzICE9PSBudWxsICYmIGJhYmVsSGVscGVycyQxW1widHlwZW9mXCJdKHRoaXMpID09PSAnb2JqZWN0JyAmJiBnZXRJbnRlcm5hbFByb3BlcnRpZXModGhpcyk7XG5cbiAgICAgICAgLy8gU2F0aXNmeSB0ZXN0IDEyLjNfYlxuICAgICAgICBpZiAoIWludGVybmFsIHx8ICFpbnRlcm5hbFsnW1tpbml0aWFsaXplZERhdGVUaW1lRm9ybWF0XV0nXSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIHZhbHVlIGZvciByZXNvbHZlZE9wdGlvbnMoKSBpcyBub3QgYW4gaW5pdGlhbGl6ZWQgSW50bC5EYXRlVGltZUZvcm1hdCBvYmplY3QuJyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG1heCA9IHByb3BzLmxlbmd0aDsgaSA8IG1heDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaG9wLmNhbGwoaW50ZXJuYWwsIHByb3AgPSAnW1snICsgcHJvcHNbaV0gKyAnXV0nKSkgZGVzY3NbcHJvcHNbaV1dID0geyB2YWx1ZTogaW50ZXJuYWxbcHJvcF0sIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IHRydWUgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvYmpDcmVhdGUoe30sIGRlc2NzKTtcbiAgICB9XG59KTtcblxudmFyIGxzID0gSW50bC5fX2xvY2FsZVNlbnNpdGl2ZVByb3RvcyA9IHtcbiAgICBOdW1iZXI6IHt9LFxuICAgIERhdGU6IHt9XG59O1xuXG4vKipcbiAqIFdoZW4gdGhlIHRvTG9jYWxlU3RyaW5nIG1ldGhvZCBpcyBjYWxsZWQgd2l0aCBvcHRpb25hbCBhcmd1bWVudHMgbG9jYWxlcyBhbmQgb3B0aW9ucyxcbiAqIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG4vKiAxMy4yLjEgKi9scy5OdW1iZXIudG9Mb2NhbGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2F0aXNmeSB0ZXN0IDEzLjIuMV8xXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGlzKSAhPT0gJ1tvYmplY3QgTnVtYmVyXScpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCB2YWx1ZSBtdXN0IGJlIGEgbnVtYmVyIGZvciBOdW1iZXIucHJvdG90eXBlLnRvTG9jYWxlU3RyaW5nKCknKTtcblxuICAgIC8vIDEuIExldCB4IGJlIHRoaXMgTnVtYmVyIHZhbHVlIChhcyBkZWZpbmVkIGluIEVTNSwgMTUuNy40KS5cbiAgICAvLyAyLiBJZiBsb2NhbGVzIGlzIG5vdCBwcm92aWRlZCwgdGhlbiBsZXQgbG9jYWxlcyBiZSB1bmRlZmluZWQuXG4gICAgLy8gMy4gSWYgb3B0aW9ucyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IG9wdGlvbnMgYmUgdW5kZWZpbmVkLlxuICAgIC8vIDQuIExldCBudW1iZXJGb3JtYXQgYmUgdGhlIHJlc3VsdCBvZiBjcmVhdGluZyBhIG5ldyBvYmplY3QgYXMgaWYgYnkgdGhlXG4gICAgLy8gICAgZXhwcmVzc2lvbiBuZXcgSW50bC5OdW1iZXJGb3JtYXQobG9jYWxlcywgb3B0aW9ucykgd2hlcmVcbiAgICAvLyAgICBJbnRsLk51bWJlckZvcm1hdCBpcyB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gY29uc3RydWN0b3IgZGVmaW5lZCBpbiAxMS4xLjMuXG4gICAgLy8gNS4gUmV0dXJuIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgRm9ybWF0TnVtYmVyIGFic3RyYWN0IG9wZXJhdGlvblxuICAgIC8vICAgIChkZWZpbmVkIGluIDExLjMuMikgd2l0aCBhcmd1bWVudHMgbnVtYmVyRm9ybWF0IGFuZCB4LlxuICAgIHJldHVybiBGb3JtYXROdW1iZXIobmV3IE51bWJlckZvcm1hdENvbnN0cnVjdG9yKGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKSwgdGhpcyk7XG59O1xuXG4vKipcbiAqIFdoZW4gdGhlIHRvTG9jYWxlU3RyaW5nIG1ldGhvZCBpcyBjYWxsZWQgd2l0aCBvcHRpb25hbCBhcmd1bWVudHMgbG9jYWxlcyBhbmQgb3B0aW9ucyxcbiAqIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG4vKiAxMy4zLjEgKi9scy5EYXRlLnRvTG9jYWxlU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFNhdGlzZnkgdGVzdCAxMy4zLjBfMVxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpcykgIT09ICdbb2JqZWN0IERhdGVdJykgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIHZhbHVlIG11c3QgYmUgYSBEYXRlIGluc3RhbmNlIGZvciBEYXRlLnByb3RvdHlwZS50b0xvY2FsZVN0cmluZygpJyk7XG5cbiAgICAvLyAxLiBMZXQgeCBiZSB0aGlzIHRpbWUgdmFsdWUgKGFzIGRlZmluZWQgaW4gRVM1LCAxNS45LjUpLlxuICAgIHZhciB4ID0gK3RoaXM7XG5cbiAgICAvLyAyLiBJZiB4IGlzIE5hTiwgdGhlbiByZXR1cm4gXCJJbnZhbGlkIERhdGVcIi5cbiAgICBpZiAoaXNOYU4oeCkpIHJldHVybiAnSW52YWxpZCBEYXRlJztcblxuICAgIC8vIDMuIElmIGxvY2FsZXMgaXMgbm90IHByb3ZpZGVkLCB0aGVuIGxldCBsb2NhbGVzIGJlIHVuZGVmaW5lZC5cbiAgICB2YXIgbG9jYWxlcyA9IGFyZ3VtZW50c1swXTtcblxuICAgIC8vIDQuIElmIG9wdGlvbnMgaXMgbm90IHByb3ZpZGVkLCB0aGVuIGxldCBvcHRpb25zIGJlIHVuZGVmaW5lZC5cbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXTtcblxuICAgIC8vIDUuIExldCBvcHRpb25zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgVG9EYXRlVGltZU9wdGlvbnMgYWJzdHJhY3RcbiAgICAvLyAgICBvcGVyYXRpb24gKGRlZmluZWQgaW4gMTIuMS4xKSB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLCBcImFueVwiLCBhbmQgXCJhbGxcIi5cbiAgICBvcHRpb25zID0gVG9EYXRlVGltZU9wdGlvbnMob3B0aW9ucywgJ2FueScsICdhbGwnKTtcblxuICAgIC8vIDYuIExldCBkYXRlVGltZUZvcm1hdCBiZSB0aGUgcmVzdWx0IG9mIGNyZWF0aW5nIGEgbmV3IG9iamVjdCBhcyBpZiBieSB0aGVcbiAgICAvLyAgICBleHByZXNzaW9uIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KGxvY2FsZXMsIG9wdGlvbnMpIHdoZXJlXG4gICAgLy8gICAgSW50bC5EYXRlVGltZUZvcm1hdCBpcyB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gY29uc3RydWN0b3IgZGVmaW5lZCBpbiAxMi4xLjMuXG4gICAgdmFyIGRhdGVUaW1lRm9ybWF0ID0gbmV3IERhdGVUaW1lRm9ybWF0Q29uc3RydWN0b3IobG9jYWxlcywgb3B0aW9ucyk7XG5cbiAgICAvLyA3LiBSZXR1cm4gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBGb3JtYXREYXRlVGltZSBhYnN0cmFjdCBvcGVyYXRpb24gKGRlZmluZWRcbiAgICAvLyAgICBpbiAxMi4zLjIpIHdpdGggYXJndW1lbnRzIGRhdGVUaW1lRm9ybWF0IGFuZCB4LlxuICAgIHJldHVybiBGb3JtYXREYXRlVGltZShkYXRlVGltZUZvcm1hdCwgeCk7XG59O1xuXG4vKipcbiAqIFdoZW4gdGhlIHRvTG9jYWxlRGF0ZVN0cmluZyBtZXRob2QgaXMgY2FsbGVkIHdpdGggb3B0aW9uYWwgYXJndW1lbnRzIGxvY2FsZXMgYW5kXG4gKiBvcHRpb25zLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuLyogMTMuMy4yICovbHMuRGF0ZS50b0xvY2FsZURhdGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2F0aXNmeSB0ZXN0IDEzLjMuMF8xXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGlzKSAhPT0gJ1tvYmplY3QgRGF0ZV0nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2AgdmFsdWUgbXVzdCBiZSBhIERhdGUgaW5zdGFuY2UgZm9yIERhdGUucHJvdG90eXBlLnRvTG9jYWxlRGF0ZVN0cmluZygpJyk7XG5cbiAgICAvLyAxLiBMZXQgeCBiZSB0aGlzIHRpbWUgdmFsdWUgKGFzIGRlZmluZWQgaW4gRVM1LCAxNS45LjUpLlxuICAgIHZhciB4ID0gK3RoaXM7XG5cbiAgICAvLyAyLiBJZiB4IGlzIE5hTiwgdGhlbiByZXR1cm4gXCJJbnZhbGlkIERhdGVcIi5cbiAgICBpZiAoaXNOYU4oeCkpIHJldHVybiAnSW52YWxpZCBEYXRlJztcblxuICAgIC8vIDMuIElmIGxvY2FsZXMgaXMgbm90IHByb3ZpZGVkLCB0aGVuIGxldCBsb2NhbGVzIGJlIHVuZGVmaW5lZC5cbiAgICB2YXIgbG9jYWxlcyA9IGFyZ3VtZW50c1swXSxcblxuXG4gICAgLy8gNC4gSWYgb3B0aW9ucyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IG9wdGlvbnMgYmUgdW5kZWZpbmVkLlxuICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMV07XG5cbiAgICAvLyA1LiBMZXQgb3B0aW9ucyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFRvRGF0ZVRpbWVPcHRpb25zIGFic3RyYWN0XG4gICAgLy8gICAgb3BlcmF0aW9uIChkZWZpbmVkIGluIDEyLjEuMSkgd2l0aCBhcmd1bWVudHMgb3B0aW9ucywgXCJkYXRlXCIsIGFuZCBcImRhdGVcIi5cbiAgICBvcHRpb25zID0gVG9EYXRlVGltZU9wdGlvbnMob3B0aW9ucywgJ2RhdGUnLCAnZGF0ZScpO1xuXG4gICAgLy8gNi4gTGV0IGRhdGVUaW1lRm9ybWF0IGJlIHRoZSByZXN1bHQgb2YgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IGFzIGlmIGJ5IHRoZVxuICAgIC8vICAgIGV4cHJlc3Npb24gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobG9jYWxlcywgb3B0aW9ucykgd2hlcmVcbiAgICAvLyAgICBJbnRsLkRhdGVUaW1lRm9ybWF0IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvciBkZWZpbmVkIGluIDEyLjEuMy5cbiAgICB2YXIgZGF0ZVRpbWVGb3JtYXQgPSBuZXcgRGF0ZVRpbWVGb3JtYXRDb25zdHJ1Y3Rvcihsb2NhbGVzLCBvcHRpb25zKTtcblxuICAgIC8vIDcuIFJldHVybiB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEZvcm1hdERhdGVUaW1lIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZFxuICAgIC8vICAgIGluIDEyLjMuMikgd2l0aCBhcmd1bWVudHMgZGF0ZVRpbWVGb3JtYXQgYW5kIHguXG4gICAgcmV0dXJuIEZvcm1hdERhdGVUaW1lKGRhdGVUaW1lRm9ybWF0LCB4KTtcbn07XG5cbi8qKlxuICogV2hlbiB0aGUgdG9Mb2NhbGVUaW1lU3RyaW5nIG1ldGhvZCBpcyBjYWxsZWQgd2l0aCBvcHRpb25hbCBhcmd1bWVudHMgbG9jYWxlcyBhbmRcbiAqIG9wdGlvbnMsIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG4vKiAxMy4zLjMgKi9scy5EYXRlLnRvTG9jYWxlVGltZVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTYXRpc2Z5IHRlc3QgMTMuMy4wXzFcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaXMpICE9PSAnW29iamVjdCBEYXRlXScpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCB2YWx1ZSBtdXN0IGJlIGEgRGF0ZSBpbnN0YW5jZSBmb3IgRGF0ZS5wcm90b3R5cGUudG9Mb2NhbGVUaW1lU3RyaW5nKCknKTtcblxuICAgIC8vIDEuIExldCB4IGJlIHRoaXMgdGltZSB2YWx1ZSAoYXMgZGVmaW5lZCBpbiBFUzUsIDE1LjkuNSkuXG4gICAgdmFyIHggPSArdGhpcztcblxuICAgIC8vIDIuIElmIHggaXMgTmFOLCB0aGVuIHJldHVybiBcIkludmFsaWQgRGF0ZVwiLlxuICAgIGlmIChpc05hTih4KSkgcmV0dXJuICdJbnZhbGlkIERhdGUnO1xuXG4gICAgLy8gMy4gSWYgbG9jYWxlcyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IGxvY2FsZXMgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBsb2NhbGVzID0gYXJndW1lbnRzWzBdO1xuXG4gICAgLy8gNC4gSWYgb3B0aW9ucyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IG9wdGlvbnMgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdO1xuXG4gICAgLy8gNS4gTGV0IG9wdGlvbnMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBUb0RhdGVUaW1lT3B0aW9ucyBhYnN0cmFjdFxuICAgIC8vICAgIG9wZXJhdGlvbiAoZGVmaW5lZCBpbiAxMi4xLjEpIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsIFwidGltZVwiLCBhbmQgXCJ0aW1lXCIuXG4gICAgb3B0aW9ucyA9IFRvRGF0ZVRpbWVPcHRpb25zKG9wdGlvbnMsICd0aW1lJywgJ3RpbWUnKTtcblxuICAgIC8vIDYuIExldCBkYXRlVGltZUZvcm1hdCBiZSB0aGUgcmVzdWx0IG9mIGNyZWF0aW5nIGEgbmV3IG9iamVjdCBhcyBpZiBieSB0aGVcbiAgICAvLyAgICBleHByZXNzaW9uIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KGxvY2FsZXMsIG9wdGlvbnMpIHdoZXJlXG4gICAgLy8gICAgSW50bC5EYXRlVGltZUZvcm1hdCBpcyB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gY29uc3RydWN0b3IgZGVmaW5lZCBpbiAxMi4xLjMuXG4gICAgdmFyIGRhdGVUaW1lRm9ybWF0ID0gbmV3IERhdGVUaW1lRm9ybWF0Q29uc3RydWN0b3IobG9jYWxlcywgb3B0aW9ucyk7XG5cbiAgICAvLyA3LiBSZXR1cm4gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBGb3JtYXREYXRlVGltZSBhYnN0cmFjdCBvcGVyYXRpb24gKGRlZmluZWRcbiAgICAvLyAgICBpbiAxMi4zLjIpIHdpdGggYXJndW1lbnRzIGRhdGVUaW1lRm9ybWF0IGFuZCB4LlxuICAgIHJldHVybiBGb3JtYXREYXRlVGltZShkYXRlVGltZUZvcm1hdCwgeCk7XG59O1xuXG5kZWZpbmVQcm9wZXJ0eShJbnRsLCAnX19hcHBseUxvY2FsZVNlbnNpdGl2ZVByb3RvdHlwZXMnLCB7XG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZSgpIHtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkoTnVtYmVyLnByb3RvdHlwZSwgJ3RvTG9jYWxlU3RyaW5nJywgeyB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogbHMuTnVtYmVyLnRvTG9jYWxlU3RyaW5nIH0pO1xuICAgICAgICAvLyBOZWVkIHRoaXMgaGVyZSBmb3IgSUUgOCwgdG8gYXZvaWQgdGhlIF9Eb250RW51bV8gYnVnXG4gICAgICAgIGRlZmluZVByb3BlcnR5KERhdGUucHJvdG90eXBlLCAndG9Mb2NhbGVTdHJpbmcnLCB7IHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBscy5EYXRlLnRvTG9jYWxlU3RyaW5nIH0pO1xuXG4gICAgICAgIGZvciAodmFyIGsgaW4gbHMuRGF0ZSkge1xuICAgICAgICAgICAgaWYgKGhvcC5jYWxsKGxzLkRhdGUsIGspKSBkZWZpbmVQcm9wZXJ0eShEYXRlLnByb3RvdHlwZSwgaywgeyB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogbHMuRGF0ZVtrXSB9KTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG4vKipcbiAqIENhbid0IHJlYWxseSBzaGlwIGEgc2luZ2xlIHNjcmlwdCB3aXRoIGRhdGEgZm9yIGh1bmRyZWRzIG9mIGxvY2FsZXMsIHNvIHdlIHByb3ZpZGVcbiAqIHRoaXMgX19hZGRMb2NhbGVEYXRhIG1ldGhvZCBhcyBhIG1lYW5zIGZvciB0aGUgZGV2ZWxvcGVyIHRvIGFkZCB0aGUgZGF0YSBvbiBhblxuICogYXMtbmVlZGVkIGJhc2lzXG4gKi9cbmRlZmluZVByb3BlcnR5KEludGwsICdfX2FkZExvY2FsZURhdGEnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uIHZhbHVlKGRhdGEpIHtcbiAgICAgICAgaWYgKCFJc1N0cnVjdHVyYWxseVZhbGlkTGFuZ3VhZ2VUYWcoZGF0YS5sb2NhbGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJPYmplY3QgcGFzc2VkIGRvZXNuJ3QgaWRlbnRpZnkgaXRzZWxmIHdpdGggYSB2YWxpZCBsYW5ndWFnZSB0YWdcIik7XG5cbiAgICAgICAgYWRkTG9jYWxlRGF0YShkYXRhLCBkYXRhLmxvY2FsZSk7XG4gICAgfVxufSk7XG5cbmZ1bmN0aW9uIGFkZExvY2FsZURhdGEoZGF0YSwgdGFnKSB7XG4gICAgLy8gQm90aCBOdW1iZXJGb3JtYXQgYW5kIERhdGVUaW1lRm9ybWF0IHJlcXVpcmUgbnVtYmVyIGRhdGEsIHNvIHRocm93IGlmIGl0IGlzbid0IHByZXNlbnRcbiAgICBpZiAoIWRhdGEubnVtYmVyKSB0aHJvdyBuZXcgRXJyb3IoXCJPYmplY3QgcGFzc2VkIGRvZXNuJ3QgY29udGFpbiBsb2NhbGUgZGF0YSBmb3IgSW50bC5OdW1iZXJGb3JtYXRcIik7XG5cbiAgICB2YXIgbG9jYWxlID0gdm9pZCAwLFxuICAgICAgICBsb2NhbGVzID0gW3RhZ10sXG4gICAgICAgIHBhcnRzID0gdGFnLnNwbGl0KCctJyk7XG5cbiAgICAvLyBDcmVhdGUgZmFsbGJhY2tzIGZvciBsb2NhbGUgZGF0YSB3aXRoIHNjcmlwdHMsIGUuZy4gTGF0biwgSGFucywgVmFpaSwgZXRjXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIgJiYgcGFydHNbMV0ubGVuZ3RoID09PSA0KSBhcnJQdXNoLmNhbGwobG9jYWxlcywgcGFydHNbMF0gKyAnLScgKyBwYXJ0c1syXSk7XG5cbiAgICB3aGlsZSAobG9jYWxlID0gYXJyU2hpZnQuY2FsbChsb2NhbGVzKSkge1xuICAgICAgICAvLyBBZGQgdG8gTnVtYmVyRm9ybWF0IGludGVybmFsIHByb3BlcnRpZXMgYXMgcGVyIDExLjIuM1xuICAgICAgICBhcnJQdXNoLmNhbGwoaW50ZXJuYWxzLk51bWJlckZvcm1hdFsnW1thdmFpbGFibGVMb2NhbGVzXV0nXSwgbG9jYWxlKTtcbiAgICAgICAgaW50ZXJuYWxzLk51bWJlckZvcm1hdFsnW1tsb2NhbGVEYXRhXV0nXVtsb2NhbGVdID0gZGF0YS5udW1iZXI7XG5cbiAgICAgICAgLy8gLi4uYW5kIERhdGVUaW1lRm9ybWF0IGludGVybmFsIHByb3BlcnRpZXMgYXMgcGVyIDEyLjIuM1xuICAgICAgICBpZiAoZGF0YS5kYXRlKSB7XG4gICAgICAgICAgICBkYXRhLmRhdGUubnUgPSBkYXRhLm51bWJlci5udTtcbiAgICAgICAgICAgIGFyclB1c2guY2FsbChpbnRlcm5hbHMuRGF0ZVRpbWVGb3JtYXRbJ1tbYXZhaWxhYmxlTG9jYWxlc11dJ10sIGxvY2FsZSk7XG4gICAgICAgICAgICBpbnRlcm5hbHMuRGF0ZVRpbWVGb3JtYXRbJ1tbbG9jYWxlRGF0YV1dJ11bbG9jYWxlXSA9IGRhdGEuZGF0ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHNldCBvZiBsb2NhbGUgZGF0YSBhZGRlZCwgbWFrZSBpdCB0aGUgZGVmYXVsdFxuICAgIGlmIChkZWZhdWx0TG9jYWxlID09PSB1bmRlZmluZWQpIHNldERlZmF1bHRMb2NhbGUodGFnKTtcbn1cblxuZGVmaW5lUHJvcGVydHkoSW50bCwgJ19fZGlzYWJsZVJlZ0V4cFJlc3RvcmUnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uIHZhbHVlKCkge1xuICAgICAgICBpbnRlcm5hbHMuZGlzYWJsZVJlZ0V4cFJlc3RvcmUgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGw7IiwibW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFuZ2U7IC8vIENyZWF0ZSBhIHJhbmdlIG9iamVjdCBmb3IgZWZmaWNlbnRseSByZW5kZXJpbmcgc3RyaW5ncyB0byBlbGVtZW50cy5cbnZhciBOU19YSFRNTCA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJztcblxudmFyIGRvYyA9IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBkb2N1bWVudDtcblxudmFyIHRlc3RFbCA9IGRvYyA/XG4gICAgZG9jLmJvZHkgfHwgZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpIDpcbiAgICB7fTtcblxuLy8gRml4ZXMgPGh0dHBzOi8vZ2l0aHViLmNvbS9wYXRyaWNrLXN0ZWVsZS1pZGVtL21vcnBoZG9tL2lzc3Vlcy8zMj5cbi8vIChJRTcrIHN1cHBvcnQpIDw9SUU3IGRvZXMgbm90IHN1cHBvcnQgZWwuaGFzQXR0cmlidXRlKG5hbWUpXG52YXIgYWN0dWFsSGFzQXR0cmlidXRlTlM7XG5cbmlmICh0ZXN0RWwuaGFzQXR0cmlidXRlTlMpIHtcbiAgICBhY3R1YWxIYXNBdHRyaWJ1dGVOUyA9IGZ1bmN0aW9uKGVsLCBuYW1lc3BhY2VVUkksIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGVsLmhhc0F0dHJpYnV0ZU5TKG5hbWVzcGFjZVVSSSwgbmFtZSk7XG4gICAgfTtcbn0gZWxzZSBpZiAodGVzdEVsLmhhc0F0dHJpYnV0ZSkge1xuICAgIGFjdHVhbEhhc0F0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWwsIG5hbWVzcGFjZVVSSSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZWwuaGFzQXR0cmlidXRlKG5hbWUpO1xuICAgIH07XG59IGVsc2Uge1xuICAgIGFjdHVhbEhhc0F0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWwsIG5hbWVzcGFjZVVSSSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlTm9kZShuYW1lc3BhY2VVUkksIG5hbWUpICE9IG51bGw7XG4gICAgfTtcbn1cblxudmFyIGhhc0F0dHJpYnV0ZU5TID0gYWN0dWFsSGFzQXR0cmlidXRlTlM7XG5cblxuZnVuY3Rpb24gdG9FbGVtZW50KHN0cikge1xuICAgIGlmICghcmFuZ2UgJiYgZG9jLmNyZWF0ZVJhbmdlKSB7XG4gICAgICAgIHJhbmdlID0gZG9jLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jLmJvZHkpO1xuICAgIH1cblxuICAgIHZhciBmcmFnbWVudDtcbiAgICBpZiAocmFuZ2UgJiYgcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KSB7XG4gICAgICAgIGZyYWdtZW50ID0gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHN0cik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZnJhZ21lbnQgPSBkb2MuY3JlYXRlRWxlbWVudCgnYm9keScpO1xuICAgICAgICBmcmFnbWVudC5pbm5lckhUTUwgPSBzdHI7XG4gICAgfVxuICAgIHJldHVybiBmcmFnbWVudC5jaGlsZE5vZGVzWzBdO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0d28gbm9kZSdzIG5hbWVzIGFyZSB0aGUgc2FtZS5cbiAqXG4gKiBOT1RFOiBXZSBkb24ndCBib3RoZXIgY2hlY2tpbmcgYG5hbWVzcGFjZVVSSWAgYmVjYXVzZSB5b3Ugd2lsbCBuZXZlciBmaW5kIHR3byBIVE1MIGVsZW1lbnRzIHdpdGggdGhlIHNhbWVcbiAqICAgICAgIG5vZGVOYW1lIGFuZCBkaWZmZXJlbnQgbmFtZXNwYWNlIFVSSXMuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBhXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGIgVGhlIHRhcmdldCBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBjb21wYXJlTm9kZU5hbWVzKGZyb21FbCwgdG9FbCkge1xuICAgIHZhciBmcm9tTm9kZU5hbWUgPSBmcm9tRWwubm9kZU5hbWU7XG4gICAgdmFyIHRvTm9kZU5hbWUgPSB0b0VsLm5vZGVOYW1lO1xuXG4gICAgaWYgKGZyb21Ob2RlTmFtZSA9PT0gdG9Ob2RlTmFtZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodG9FbC5hY3R1YWxpemUgJiZcbiAgICAgICAgZnJvbU5vZGVOYW1lLmNoYXJDb2RlQXQoMCkgPCA5MSAmJiAvKiBmcm9tIHRhZyBuYW1lIGlzIHVwcGVyIGNhc2UgKi9cbiAgICAgICAgdG9Ob2RlTmFtZS5jaGFyQ29kZUF0KDApID4gOTAgLyogdGFyZ2V0IHRhZyBuYW1lIGlzIGxvd2VyIGNhc2UgKi8pIHtcbiAgICAgICAgLy8gSWYgdGhlIHRhcmdldCBlbGVtZW50IGlzIGEgdmlydHVhbCBET00gbm9kZSB0aGVuIHdlIG1heSBuZWVkIHRvIG5vcm1hbGl6ZSB0aGUgdGFnIG5hbWVcbiAgICAgICAgLy8gYmVmb3JlIGNvbXBhcmluZy4gTm9ybWFsIEhUTUwgZWxlbWVudHMgdGhhdCBhcmUgaW4gdGhlIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiXG4gICAgICAgIC8vIGFyZSBjb252ZXJ0ZWQgdG8gdXBwZXIgY2FzZVxuICAgICAgICByZXR1cm4gZnJvbU5vZGVOYW1lID09PSB0b05vZGVOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gZWxlbWVudCwgb3B0aW9uYWxseSB3aXRoIGEga25vd24gbmFtZXNwYWNlIFVSSS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgZWxlbWVudCBuYW1lLCBlLmcuICdkaXYnIG9yICdzdmcnXG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWVzcGFjZVVSSV0gdGhlIGVsZW1lbnQncyBuYW1lc3BhY2UgVVJJLCBpLmUuIHRoZSB2YWx1ZSBvZlxuICogaXRzIGB4bWxuc2AgYXR0cmlidXRlIG9yIGl0cyBpbmZlcnJlZCBuYW1lc3BhY2UuXG4gKlxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWUsIG5hbWVzcGFjZVVSSSkge1xuICAgIHJldHVybiAhbmFtZXNwYWNlVVJJIHx8IG5hbWVzcGFjZVVSSSA9PT0gTlNfWEhUTUwgP1xuICAgICAgICBkb2MuY3JlYXRlRWxlbWVudChuYW1lKSA6XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIGNoaWxkcmVuIG9mIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyIERPTSBlbGVtZW50XG4gKi9cbmZ1bmN0aW9uIG1vdmVDaGlsZHJlbihmcm9tRWwsIHRvRWwpIHtcbiAgICB2YXIgY3VyQ2hpbGQgPSBmcm9tRWwuZmlyc3RDaGlsZDtcbiAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcbiAgICAgICAgdmFyIG5leHRDaGlsZCA9IGN1ckNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICB0b0VsLmFwcGVuZENoaWxkKGN1ckNoaWxkKTtcbiAgICAgICAgY3VyQ2hpbGQgPSBuZXh0Q2hpbGQ7XG4gICAgfVxuICAgIHJldHVybiB0b0VsO1xufVxuXG5mdW5jdGlvbiBtb3JwaEF0dHJzKGZyb21Ob2RlLCB0b05vZGUpIHtcbiAgICB2YXIgYXR0cnMgPSB0b05vZGUuYXR0cmlidXRlcztcbiAgICB2YXIgaTtcbiAgICB2YXIgYXR0cjtcbiAgICB2YXIgYXR0ck5hbWU7XG4gICAgdmFyIGF0dHJOYW1lc3BhY2VVUkk7XG4gICAgdmFyIGF0dHJWYWx1ZTtcbiAgICB2YXIgZnJvbVZhbHVlO1xuXG4gICAgZm9yIChpID0gYXR0cnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgYXR0ciA9IGF0dHJzW2ldO1xuICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZTtcbiAgICAgICAgYXR0ck5hbWVzcGFjZVVSSSA9IGF0dHIubmFtZXNwYWNlVVJJO1xuICAgICAgICBhdHRyVmFsdWUgPSBhdHRyLnZhbHVlO1xuXG4gICAgICAgIGlmIChhdHRyTmFtZXNwYWNlVVJJKSB7XG4gICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubG9jYWxOYW1lIHx8IGF0dHJOYW1lO1xuICAgICAgICAgICAgZnJvbVZhbHVlID0gZnJvbU5vZGUuZ2V0QXR0cmlidXRlTlMoYXR0ck5hbWVzcGFjZVVSSSwgYXR0ck5hbWUpO1xuXG4gICAgICAgICAgICBpZiAoZnJvbVZhbHVlICE9PSBhdHRyVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmcm9tTm9kZS5zZXRBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyb21WYWx1ZSA9IGZyb21Ob2RlLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChmcm9tVmFsdWUgIT09IGF0dHJWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGZyb21Ob2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhbnkgZXh0cmEgYXR0cmlidXRlcyBmb3VuZCBvbiB0aGUgb3JpZ2luYWwgRE9NIGVsZW1lbnQgdGhhdFxuICAgIC8vIHdlcmVuJ3QgZm91bmQgb24gdGhlIHRhcmdldCBlbGVtZW50LlxuICAgIGF0dHJzID0gZnJvbU5vZGUuYXR0cmlidXRlcztcblxuICAgIGZvciAoaSA9IGF0dHJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGF0dHIgPSBhdHRyc1tpXTtcbiAgICAgICAgaWYgKGF0dHIuc3BlY2lmaWVkICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgYXR0ck5hbWUgPSBhdHRyLm5hbWU7XG4gICAgICAgICAgICBhdHRyTmFtZXNwYWNlVVJJID0gYXR0ci5uYW1lc3BhY2VVUkk7XG5cbiAgICAgICAgICAgIGlmIChhdHRyTmFtZXNwYWNlVVJJKSB7XG4gICAgICAgICAgICAgICAgYXR0ck5hbWUgPSBhdHRyLmxvY2FsTmFtZSB8fCBhdHRyTmFtZTtcblxuICAgICAgICAgICAgICAgIGlmICghaGFzQXR0cmlidXRlTlModG9Ob2RlLCBhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbU5vZGUucmVtb3ZlQXR0cmlidXRlTlMoYXR0ck5hbWVzcGFjZVVSSSwgYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNBdHRyaWJ1dGVOUyh0b05vZGUsIG51bGwsIGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsIG5hbWUpIHtcbiAgICBpZiAoZnJvbUVsW25hbWVdICE9PSB0b0VsW25hbWVdKSB7XG4gICAgICAgIGZyb21FbFtuYW1lXSA9IHRvRWxbbmFtZV07XG4gICAgICAgIGlmIChmcm9tRWxbbmFtZV0pIHtcbiAgICAgICAgICAgIGZyb21FbC5zZXRBdHRyaWJ1dGUobmFtZSwgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJvbUVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lLCAnJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnZhciBzcGVjaWFsRWxIYW5kbGVycyA9IHtcbiAgICAvKipcbiAgICAgKiBOZWVkZWQgZm9yIElFLiBBcHBhcmVudGx5IElFIGRvZXNuJ3QgdGhpbmsgdGhhdCBcInNlbGVjdGVkXCIgaXMgYW5cbiAgICAgKiBhdHRyaWJ1dGUgd2hlbiByZWFkaW5nIG92ZXIgdGhlIGF0dHJpYnV0ZXMgdXNpbmcgc2VsZWN0RWwuYXR0cmlidXRlc1xuICAgICAqL1xuICAgIE9QVElPTjogZnVuY3Rpb24oZnJvbUVsLCB0b0VsKSB7XG4gICAgICAgIHN5bmNCb29sZWFuQXR0clByb3AoZnJvbUVsLCB0b0VsLCAnc2VsZWN0ZWQnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBcInZhbHVlXCIgYXR0cmlidXRlIGlzIHNwZWNpYWwgZm9yIHRoZSA8aW5wdXQ+IGVsZW1lbnQgc2luY2UgaXQgc2V0c1xuICAgICAqIHRoZSBpbml0aWFsIHZhbHVlLiBDaGFuZ2luZyB0aGUgXCJ2YWx1ZVwiIGF0dHJpYnV0ZSB3aXRob3V0IGNoYW5naW5nIHRoZVxuICAgICAqIFwidmFsdWVcIiBwcm9wZXJ0eSB3aWxsIGhhdmUgbm8gZWZmZWN0IHNpbmNlIGl0IGlzIG9ubHkgdXNlZCB0byB0aGUgc2V0IHRoZVxuICAgICAqIGluaXRpYWwgdmFsdWUuICBTaW1pbGFyIGZvciB0aGUgXCJjaGVja2VkXCIgYXR0cmlidXRlLCBhbmQgXCJkaXNhYmxlZFwiLlxuICAgICAqL1xuICAgIElOUFVUOiBmdW5jdGlvbihmcm9tRWwsIHRvRWwpIHtcbiAgICAgICAgc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsICdjaGVja2VkJyk7XG4gICAgICAgIHN5bmNCb29sZWFuQXR0clByb3AoZnJvbUVsLCB0b0VsLCAnZGlzYWJsZWQnKTtcblxuICAgICAgICBpZiAoZnJvbUVsLnZhbHVlICE9PSB0b0VsLnZhbHVlKSB7XG4gICAgICAgICAgICBmcm9tRWwudmFsdWUgPSB0b0VsLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNBdHRyaWJ1dGVOUyh0b0VsLCBudWxsLCAndmFsdWUnKSkge1xuICAgICAgICAgICAgZnJvbUVsLnJlbW92ZUF0dHJpYnV0ZSgndmFsdWUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBURVhUQVJFQTogZnVuY3Rpb24oZnJvbUVsLCB0b0VsKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRvRWwudmFsdWU7XG4gICAgICAgIGlmIChmcm9tRWwudmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBmcm9tRWwudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXJzdENoaWxkID0gZnJvbUVsLmZpcnN0Q2hpbGQ7XG4gICAgICAgIGlmIChmaXJzdENoaWxkKSB7XG4gICAgICAgICAgICAvLyBOZWVkZWQgZm9yIElFLiBBcHBhcmVudGx5IElFIHNldHMgdGhlIHBsYWNlaG9sZGVyIGFzIHRoZVxuICAgICAgICAgICAgLy8gbm9kZSB2YWx1ZSBhbmQgdmlzZSB2ZXJzYS4gVGhpcyBpZ25vcmVzIGFuIGVtcHR5IHVwZGF0ZS5cbiAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IGZpcnN0Q2hpbGQubm9kZVZhbHVlO1xuXG4gICAgICAgICAgICBpZiAob2xkVmFsdWUgPT0gbmV3VmFsdWUgfHwgKCFuZXdWYWx1ZSAmJiBvbGRWYWx1ZSA9PSBmcm9tRWwucGxhY2Vob2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdENoaWxkLm5vZGVWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBTRUxFQ1Q6IGZ1bmN0aW9uKGZyb21FbCwgdG9FbCkge1xuICAgICAgICBpZiAoIWhhc0F0dHJpYnV0ZU5TKHRvRWwsIG51bGwsICdtdWx0aXBsZScpKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgdmFyIGN1ckNoaWxkID0gdG9FbC5maXJzdENoaWxkO1xuICAgICAgICAgICAgd2hpbGUoY3VyQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZU5hbWUgPSBjdXJDaGlsZC5ub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZU5hbWUgJiYgbm9kZU5hbWUudG9VcHBlckNhc2UoKSA9PT0gJ09QVElPTicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0F0dHJpYnV0ZU5TKGN1ckNoaWxkLCBudWxsLCAnc2VsZWN0ZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZyb21FbC5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbnZhciBFTEVNRU5UX05PREUgPSAxO1xudmFyIFRFWFRfTk9ERSA9IDM7XG52YXIgQ09NTUVOVF9OT0RFID0gODtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmZ1bmN0aW9uIGRlZmF1bHRHZXROb2RlS2V5KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5pZDtcbn1cblxuZnVuY3Rpb24gbW9ycGhkb21GYWN0b3J5KG1vcnBoQXR0cnMpIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiBtb3JwaGRvbShmcm9tTm9kZSwgdG9Ob2RlLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0b05vZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoZnJvbU5vZGUubm9kZU5hbWUgPT09ICcjZG9jdW1lbnQnIHx8IGZyb21Ob2RlLm5vZGVOYW1lID09PSAnSFRNTCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9Ob2RlSHRtbCA9IHRvTm9kZTtcbiAgICAgICAgICAgICAgICB0b05vZGUgPSBkb2MuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgICAgICAgICAgICAgIHRvTm9kZS5pbm5lckhUTUwgPSB0b05vZGVIdG1sO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b05vZGUgPSB0b0VsZW1lbnQodG9Ob2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBnZXROb2RlS2V5ID0gb3B0aW9ucy5nZXROb2RlS2V5IHx8IGRlZmF1bHRHZXROb2RlS2V5O1xuICAgICAgICB2YXIgb25CZWZvcmVOb2RlQWRkZWQgPSBvcHRpb25zLm9uQmVmb3JlTm9kZUFkZGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbk5vZGVBZGRlZCA9IG9wdGlvbnMub25Ob2RlQWRkZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uQmVmb3JlRWxVcGRhdGVkID0gb3B0aW9ucy5vbkJlZm9yZUVsVXBkYXRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25FbFVwZGF0ZWQgPSBvcHRpb25zLm9uRWxVcGRhdGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbkJlZm9yZU5vZGVEaXNjYXJkZWQgPSBvcHRpb25zLm9uQmVmb3JlTm9kZURpc2NhcmRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25Ob2RlRGlzY2FyZGVkID0gb3B0aW9ucy5vbk5vZGVEaXNjYXJkZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uQmVmb3JlRWxDaGlsZHJlblVwZGF0ZWQgPSBvcHRpb25zLm9uQmVmb3JlRWxDaGlsZHJlblVwZGF0ZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIGNoaWxkcmVuT25seSA9IG9wdGlvbnMuY2hpbGRyZW5Pbmx5ID09PSB0cnVlO1xuXG4gICAgICAgIC8vIFRoaXMgb2JqZWN0IGlzIHVzZWQgYXMgYSBsb29rdXAgdG8gcXVpY2tseSBmaW5kIGFsbCBrZXllZCBlbGVtZW50cyBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUuXG4gICAgICAgIHZhciBmcm9tTm9kZXNMb29rdXAgPSB7fTtcbiAgICAgICAgdmFyIGtleWVkUmVtb3ZhbExpc3Q7XG5cbiAgICAgICAgZnVuY3Rpb24gYWRkS2V5ZWRSZW1vdmFsKGtleSkge1xuICAgICAgICAgICAgaWYgKGtleWVkUmVtb3ZhbExpc3QpIHtcbiAgICAgICAgICAgICAgICBrZXllZFJlbW92YWxMaXN0LnB1c2goa2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ZWRSZW1vdmFsTGlzdCA9IFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMobm9kZSwgc2tpcEtleWVkTm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyQ2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1ckNoaWxkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2tpcEtleWVkTm9kZXMgJiYgKGtleSA9IGdldE5vZGVLZXkoY3VyQ2hpbGQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgYXJlIHNraXBwaW5nIGtleWVkIG5vZGVzIHRoZW4gd2UgYWRkIHRoZSBrZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIGEgbGlzdCBzbyB0aGF0IGl0IGNhbiBiZSBoYW5kbGVkIGF0IHRoZSB2ZXJ5IGVuZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZEtleWVkUmVtb3ZhbChrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSByZXBvcnQgdGhlIG5vZGUgYXMgZGlzY2FyZGVkIGlmIGl0IGlzIG5vdCBrZXllZC4gV2UgZG8gdGhpcyBiZWNhdXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhdCB0aGUgZW5kIHdlIGxvb3AgdGhyb3VnaCBhbGwga2V5ZWQgZWxlbWVudHMgdGhhdCB3ZXJlIHVubWF0Y2hlZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIHRoZW4gZGlzY2FyZCB0aGVtIGluIG9uZSBmaW5hbCBwYXNzLlxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJDaGlsZC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMoY3VyQ2hpbGQsIHNraXBLZXllZE5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgYSBET00gbm9kZSBvdXQgb2YgdGhlIG9yaWdpbmFsIERPTVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gIHtOb2RlfSBub2RlIFRoZSBub2RlIHRvIHJlbW92ZVxuICAgICAgICAgKiBAcGFyYW0gIHtOb2RlfSBwYXJlbnROb2RlIFRoZSBub2RlcyBwYXJlbnRcbiAgICAgICAgICogQHBhcmFtICB7Qm9vbGVhbn0gc2tpcEtleWVkTm9kZXMgSWYgdHJ1ZSB0aGVuIGVsZW1lbnRzIHdpdGgga2V5cyB3aWxsIGJlIHNraXBwZWQgYW5kIG5vdCBkaXNjYXJkZWQuXG4gICAgICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZSwgcGFyZW50Tm9kZSwgc2tpcEtleWVkTm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChvbkJlZm9yZU5vZGVEaXNjYXJkZWQobm9kZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChub2RlKTtcbiAgICAgICAgICAgIHdhbGtEaXNjYXJkZWRDaGlsZE5vZGVzKG5vZGUsIHNraXBLZXllZE5vZGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIC8vIFRyZWVXYWxrZXIgaW1wbGVtZW50YXRpb24gaXMgbm8gZmFzdGVyLCBidXQga2VlcGluZyB0aGlzIGFyb3VuZCBpbiBjYXNlIHRoaXMgY2hhbmdlcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgIC8vIGZ1bmN0aW9uIGluZGV4VHJlZShyb290KSB7XG4gICAgICAgIC8vICAgICB2YXIgdHJlZVdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoXG4gICAgICAgIC8vICAgICAgICAgcm9vdCxcbiAgICAgICAgLy8gICAgICAgICBOb2RlRmlsdGVyLlNIT1dfRUxFTUVOVCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICB2YXIgZWw7XG4gICAgICAgIC8vICAgICB3aGlsZSgoZWwgPSB0cmVlV2Fsa2VyLm5leHROb2RlKCkpKSB7XG4gICAgICAgIC8vICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoZWwpO1xuICAgICAgICAvLyAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgZnJvbU5vZGVzTG9va3VwW2tleV0gPSBlbDtcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyAvLyBOb2RlSXRlcmF0b3IgaW1wbGVtZW50YXRpb24gaXMgbm8gZmFzdGVyLCBidXQga2VlcGluZyB0aGlzIGFyb3VuZCBpbiBjYXNlIHRoaXMgY2hhbmdlcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGZ1bmN0aW9uIGluZGV4VHJlZShub2RlKSB7XG4gICAgICAgIC8vICAgICB2YXIgbm9kZUl0ZXJhdG9yID0gZG9jdW1lbnQuY3JlYXRlTm9kZUl0ZXJhdG9yKG5vZGUsIE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UKTtcbiAgICAgICAgLy8gICAgIHZhciBlbDtcbiAgICAgICAgLy8gICAgIHdoaWxlKChlbCA9IG5vZGVJdGVyYXRvci5uZXh0Tm9kZSgpKSkge1xuICAgICAgICAvLyAgICAgICAgIHZhciBrZXkgPSBnZXROb2RlS2V5KGVsKTtcbiAgICAgICAgLy8gICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIGZyb21Ob2Rlc0xvb2t1cFtrZXldID0gZWw7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgZnVuY3Rpb24gaW5kZXhUcmVlKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyQ2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1ckNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBnZXROb2RlS2V5KGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbU5vZGVzTG9va3VwW2tleV0gPSBjdXJDaGlsZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdhbGsgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhUcmVlKGN1ckNoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICBjdXJDaGlsZCA9IGN1ckNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGluZGV4VHJlZShmcm9tTm9kZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlTm9kZUFkZGVkKGVsKSB7XG4gICAgICAgICAgICBvbk5vZGVBZGRlZChlbCk7XG5cbiAgICAgICAgICAgIHZhciBjdXJDaGlsZCA9IGVsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFNpYmxpbmcgPSBjdXJDaGlsZC5uZXh0U2libGluZztcblxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBnZXROb2RlS2V5KGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1bm1hdGNoZWRGcm9tRWwgPSBmcm9tTm9kZXNMb29rdXBba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVubWF0Y2hlZEZyb21FbCAmJiBjb21wYXJlTm9kZU5hbWVzKGN1ckNoaWxkLCB1bm1hdGNoZWRGcm9tRWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJDaGlsZC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh1bm1hdGNoZWRGcm9tRWwsIGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwodW5tYXRjaGVkRnJvbUVsLCBjdXJDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBoYW5kbGVOb2RlQWRkZWQoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gbmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3JwaEVsKGZyb21FbCwgdG9FbCwgY2hpbGRyZW5Pbmx5KSB7XG4gICAgICAgICAgICB2YXIgdG9FbEtleSA9IGdldE5vZGVLZXkodG9FbCk7XG4gICAgICAgICAgICB2YXIgY3VyRnJvbU5vZGVLZXk7XG5cbiAgICAgICAgICAgIGlmICh0b0VsS2V5KSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgYW4gZWxlbWVudCB3aXRoIGFuIElEIGlzIGJlaW5nIG1vcnBoZWQgdGhlbiBpdCBpcyB3aWxsIGJlIGluIHRoZSBmaW5hbFxuICAgICAgICAgICAgICAgIC8vIERPTSBzbyBjbGVhciBpdCBvdXQgb2YgdGhlIHNhdmVkIGVsZW1lbnRzIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICBkZWxldGUgZnJvbU5vZGVzTG9va3VwW3RvRWxLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG9Ob2RlLmlzU2FtZU5vZGUgJiYgdG9Ob2RlLmlzU2FtZU5vZGUoZnJvbU5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWNoaWxkcmVuT25seSkge1xuICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZUVsVXBkYXRlZChmcm9tRWwsIHRvRWwpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbW9ycGhBdHRycyhmcm9tRWwsIHRvRWwpO1xuICAgICAgICAgICAgICAgIG9uRWxVcGRhdGVkKGZyb21FbCk7XG5cbiAgICAgICAgICAgICAgICBpZiAob25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZChmcm9tRWwsIHRvRWwpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZnJvbUVsLm5vZGVOYW1lICE9PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1clRvTm9kZUNoaWxkID0gdG9FbC5maXJzdENoaWxkO1xuICAgICAgICAgICAgICAgIHZhciBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbUVsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgdmFyIGN1clRvTm9kZUtleTtcblxuICAgICAgICAgICAgICAgIHZhciBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgdmFyIHRvTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoaW5nRnJvbUVsO1xuXG4gICAgICAgICAgICAgICAgb3V0ZXI6IHdoaWxlIChjdXJUb05vZGVDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICB0b05leHRTaWJsaW5nID0gY3VyVG9Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUtleSA9IGdldE5vZGVLZXkoY3VyVG9Ob2RlQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJGcm9tTm9kZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tTmV4dFNpYmxpbmcgPSBjdXJGcm9tTm9kZUNoaWxkLm5leHRTaWJsaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlQ2hpbGQuaXNTYW1lTm9kZSAmJiBjdXJUb05vZGVDaGlsZC5pc1NhbWVOb2RlKGN1ckZyb21Ob2RlQ2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSB0b05leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWUgb3V0ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlS2V5ID0gZ2V0Tm9kZUtleShjdXJGcm9tTm9kZUNoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1ckZyb21Ob2RlVHlwZSA9IGN1ckZyb21Ob2RlQ2hpbGQubm9kZVR5cGU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc0NvbXBhdGlibGUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZVR5cGUgPT09IGN1clRvTm9kZUNoaWxkLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJvdGggbm9kZXMgYmVpbmcgY29tcGFyZWQgYXJlIEVsZW1lbnQgbm9kZXNcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgdGFyZ2V0IG5vZGUgaGFzIGEga2V5IHNvIHdlIHdhbnQgdG8gbWF0Y2ggaXQgdXAgd2l0aCB0aGUgY29ycmVjdCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVLZXkgIT09IGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGN1cnJlbnQgZWxlbWVudCBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUgZG9lcyBub3QgaGF2ZSBhIG1hdGNoaW5nIGtleSBzb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCdzIGNoZWNrIG91ciBsb29rdXAgdG8gc2VlIGlmIHRoZXJlIGlzIGEgbWF0Y2hpbmcgZWxlbWVudCBpbiB0aGUgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBET00gdHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgobWF0Y2hpbmdGcm9tRWwgPSBmcm9tTm9kZXNMb29rdXBbY3VyVG9Ob2RlS2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmcgPT09IG1hdGNoaW5nRnJvbUVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIHNpbmdsZSBlbGVtZW50IHJlbW92YWxzLiBUbyBhdm9pZCByZW1vdmluZyB0aGUgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERPTSBub2RlIG91dCBvZiB0aGUgdHJlZSAoc2luY2UgdGhhdCBjYW4gYnJlYWsgQ1NTIHRyYW5zaXRpb25zLCBldGMuKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIHdpbGwgaW5zdGVhZCBkaXNjYXJkIHRoZSBjdXJyZW50IG5vZGUgYW5kIHdhaXQgdW50aWwgdGhlIG5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGlvbiB0byBwcm9wZXJseSBtYXRjaCB1cCB0aGUga2V5ZWQgdGFyZ2V0IGVsZW1lbnQgd2l0aCBpdHMgbWF0Y2hpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVsZW1lbnQgaW4gdGhlIG9yaWdpbmFsIHRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZm91bmQgYSBtYXRjaGluZyBrZXllZCBlbGVtZW50IHNvbWV3aGVyZSBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMZXQncyBtb3ZpbmcgdGhlIG9yaWdpbmFsIERPTSBub2RlIGludG8gdGhlIGN1cnJlbnQgcG9zaXRpb24gYW5kIG1vcnBoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpdC5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogV2UgdXNlIGluc2VydEJlZm9yZSBpbnN0ZWFkIG9mIHJlcGxhY2VDaGlsZCBiZWNhdXNlIHdlIHdhbnQgdG8gZ28gdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGByZW1vdmVOb2RlKClgIGZ1bmN0aW9uIGZvciB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nIGRpc2NhcmRlZCBzbyB0aGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbGwgbGlmZWN5Y2xlIGhvb2tzIGFyZSBjb3JyZWN0bHkgaW52b2tlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUVsLmluc2VydEJlZm9yZShtYXRjaGluZ0Zyb21FbCwgY3VyRnJvbU5vZGVDaGlsZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21OZXh0U2libGluZyA9IGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZUtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBub2RlIGlzIGtleWVkIGl0IG1pZ2h0IGJlIG1hdGNoZWQgdXAgbGF0ZXIgc28gd2UgZGVmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgYWN0dWFsIHJlbW92YWwgdG8gbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRLZXllZFJlbW92YWwoY3VyRnJvbU5vZGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiB3ZSBza2lwIG5lc3RlZCBrZXllZCBub2RlcyBmcm9tIGJlaW5nIHJlbW92ZWQgc2luY2UgdGhlcmUgaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICBzdGlsbCBhIGNoYW5jZSB0aGV5IHdpbGwgYmUgbWF0Y2hlZCB1cCBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoY3VyRnJvbU5vZGVDaGlsZCwgZnJvbUVsLCB0cnVlIC8qIHNraXAga2V5ZWQgbm9kZXMgKi8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkID0gbWF0Y2hpbmdGcm9tRWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbm9kZXMgYXJlIG5vdCBjb21wYXRpYmxlIHNpbmNlIHRoZSBcInRvXCIgbm9kZSBoYXMgYSBrZXkgYW5kIHRoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlzIG5vIG1hdGNoaW5nIGtleWVkIG5vZGUgaW4gdGhlIHNvdXJjZSB0cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJGcm9tTm9kZUtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG9yaWdpbmFsIGhhcyBhIGtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBhdGlibGUgPSBpc0NvbXBhdGlibGUgIT09IGZhbHNlICYmIGNvbXBhcmVOb2RlTmFtZXMoY3VyRnJvbU5vZGVDaGlsZCwgY3VyVG9Ob2RlQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNDb21wYXRpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBmb3VuZCBjb21wYXRpYmxlIERPTSBlbGVtZW50cyBzbyB0cmFuc2Zvcm1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IFwiZnJvbVwiIG5vZGUgdG8gbWF0Y2ggdGhlIGN1cnJlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRhcmdldCBET00gbm9kZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwoY3VyRnJvbU5vZGVDaGlsZCwgY3VyVG9Ob2RlQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1ckZyb21Ob2RlVHlwZSA9PT0gVEVYVF9OT0RFIHx8IGN1ckZyb21Ob2RlVHlwZSA9PSBDT01NRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQm90aCBub2RlcyBiZWluZyBjb21wYXJlZCBhcmUgVGV4dCBvciBDb21tZW50IG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbXBseSB1cGRhdGUgbm9kZVZhbHVlIG9uIHRoZSBvcmlnaW5hbCBub2RlIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSB0aGUgdGV4dCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyRnJvbU5vZGVDaGlsZC5ub2RlVmFsdWUgIT09IGN1clRvTm9kZUNoaWxkLm5vZGVWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZC5ub2RlVmFsdWUgPSBjdXJUb05vZGVDaGlsZC5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ29tcGF0aWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgYm90aCB0aGUgXCJ0b1wiIGNoaWxkIGFuZCB0aGUgXCJmcm9tXCIgY2hpbGQgc2luY2Ugd2UgZm91bmQgYSBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbU5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIG91dGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBObyBjb21wYXRpYmxlIG1hdGNoIHNvIHJlbW92ZSB0aGUgb2xkIG5vZGUgZnJvbSB0aGUgRE9NIGFuZCBjb250aW51ZSB0cnlpbmcgdG8gZmluZCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaCBpbiB0aGUgb3JpZ2luYWwgRE9NLiBIb3dldmVyLCB3ZSBvbmx5IGRvIHRoaXMgaWYgdGhlIGZyb20gbm9kZSBpcyBub3Qga2V5ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIGl0IGlzIHBvc3NpYmxlIHRoYXQgYSBrZXllZCBub2RlIG1pZ2h0IG1hdGNoIHVwIHdpdGggYSBub2RlIHNvbWV3aGVyZSBlbHNlIGluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGFyZ2V0IHRyZWUgYW5kIHdlIGRvbid0IHdhbnQgdG8gZGlzY2FyZCBpdCBqdXN0IHlldCBzaW5jZSBpdCBzdGlsbCBtaWdodCBmaW5kIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhvbWUgaW4gdGhlIGZpbmFsIERPTSB0cmVlLiBBZnRlciBldmVyeXRoaW5nIGlzIGRvbmUgd2Ugd2lsbCByZW1vdmUgYW55IGtleWVkIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGF0IGRpZG4ndCBmaW5kIGEgaG9tZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMga2V5ZWQgaXQgbWlnaHQgYmUgbWF0Y2hlZCB1cCBsYXRlciBzbyB3ZSBkZWZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEtleWVkUmVtb3ZhbChjdXJGcm9tTm9kZUtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHN0aWxsIGEgY2hhbmNlIHRoZXkgd2lsbCBiZSBtYXRjaGVkIHVwIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTm9kZShjdXJGcm9tTm9kZUNoaWxkLCBmcm9tRWwsIHRydWUgLyogc2tpcCBrZXllZCBub2RlcyAqLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBnb3QgdGhpcyBmYXIgdGhlbiB3ZSBkaWQgbm90IGZpbmQgYSBjYW5kaWRhdGUgbWF0Y2ggZm9yXG4gICAgICAgICAgICAgICAgICAgIC8vIG91ciBcInRvIG5vZGVcIiBhbmQgd2UgZXhoYXVzdGVkIGFsbCBvZiB0aGUgY2hpbGRyZW4gXCJmcm9tXCJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm9kZXMuIFRoZXJlZm9yZSwgd2Ugd2lsbCBqdXN0IGFwcGVuZCB0aGUgY3VycmVudCBcInRvXCIgbm9kZVxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgZW5kXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVLZXkgJiYgKG1hdGNoaW5nRnJvbUVsID0gZnJvbU5vZGVzTG9va3VwW2N1clRvTm9kZUtleV0pICYmIGNvbXBhcmVOb2RlTmFtZXMobWF0Y2hpbmdGcm9tRWwsIGN1clRvTm9kZUNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUVsLmFwcGVuZENoaWxkKG1hdGNoaW5nRnJvbUVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwobWF0Y2hpbmdGcm9tRWwsIGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdCA9IG9uQmVmb3JlTm9kZUFkZGVkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob25CZWZvcmVOb2RlQWRkZWRSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSBvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlQ2hpbGQuYWN0dWFsaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gY3VyVG9Ob2RlQ2hpbGQuYWN0dWFsaXplKGZyb21FbC5vd25lckRvY3VtZW50IHx8IGRvYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21FbC5hcHBlbmRDaGlsZChjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlTm9kZUFkZGVkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHByb2Nlc3NlZCBhbGwgb2YgdGhlIFwidG8gbm9kZXNcIi4gSWYgY3VyRnJvbU5vZGVDaGlsZCBpc1xuICAgICAgICAgICAgICAgIC8vIG5vbi1udWxsIHRoZW4gd2Ugc3RpbGwgaGF2ZSBzb21lIGZyb20gbm9kZXMgbGVmdCBvdmVyIHRoYXQgbmVlZFxuICAgICAgICAgICAgICAgIC8vIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyRnJvbU5vZGVDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTmV4dFNpYmxpbmcgPSBjdXJGcm9tTm9kZUNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGN1ckZyb21Ob2RlS2V5ID0gZ2V0Tm9kZUtleShjdXJGcm9tTm9kZUNoaWxkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBub2RlIGlzIGtleWVkIGl0IG1pZ2h0IGJlIG1hdGNoZWQgdXAgbGF0ZXIgc28gd2UgZGVmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkS2V5ZWRSZW1vdmFsKGN1ckZyb21Ob2RlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgc3RpbGwgYSBjaGFuY2UgdGhleSB3aWxsIGJlIG1hdGNoZWQgdXAgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoY3VyRnJvbU5vZGVDaGlsZCwgZnJvbUVsLCB0cnVlIC8qIHNraXAga2V5ZWQgbm9kZXMgKi8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3BlY2lhbEVsSGFuZGxlciA9IHNwZWNpYWxFbEhhbmRsZXJzW2Zyb21FbC5ub2RlTmFtZV07XG4gICAgICAgICAgICBpZiAoc3BlY2lhbEVsSGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbEhhbmRsZXIoZnJvbUVsLCB0b0VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBFTkQ6IG1vcnBoRWwoLi4uKVxuXG4gICAgICAgIHZhciBtb3JwaGVkTm9kZSA9IGZyb21Ob2RlO1xuICAgICAgICB2YXIgbW9ycGhlZE5vZGVUeXBlID0gbW9ycGhlZE5vZGUubm9kZVR5cGU7XG4gICAgICAgIHZhciB0b05vZGVUeXBlID0gdG9Ob2RlLm5vZGVUeXBlO1xuXG4gICAgICAgIGlmICghY2hpbGRyZW5Pbmx5KSB7XG4gICAgICAgICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgYXJlIGdpdmVuIHR3byBET00gbm9kZXMgdGhhdCBhcmUgbm90XG4gICAgICAgICAgICAvLyBjb21wYXRpYmxlIChlLmcuIDxkaXY+IC0tPiA8c3Bhbj4gb3IgPGRpdj4gLS0+IFRFWFQpXG4gICAgICAgICAgICBpZiAobW9ycGhlZE5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICBpZiAodG9Ob2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcGFyZU5vZGVOYW1lcyhmcm9tTm9kZSwgdG9Ob2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKGZyb21Ob2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gbW92ZUNoaWxkcmVuKGZyb21Ob2RlLCBjcmVhdGVFbGVtZW50TlModG9Ob2RlLm5vZGVOYW1lLCB0b05vZGUubmFtZXNwYWNlVVJJKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBHb2luZyBmcm9tIGFuIGVsZW1lbnQgbm9kZSB0byBhIHRleHQgbm9kZVxuICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZSA9IHRvTm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vcnBoZWROb2RlVHlwZSA9PT0gVEVYVF9OT0RFIHx8IG1vcnBoZWROb2RlVHlwZSA9PT0gQ09NTUVOVF9OT0RFKSB7IC8vIFRleHQgb3IgY29tbWVudCBub2RlXG4gICAgICAgICAgICAgICAgaWYgKHRvTm9kZVR5cGUgPT09IG1vcnBoZWROb2RlVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobW9ycGhlZE5vZGUubm9kZVZhbHVlICE9PSB0b05vZGUubm9kZVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZS5ub2RlVmFsdWUgPSB0b05vZGUubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vcnBoZWROb2RlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRleHQgbm9kZSB0byBzb21ldGhpbmcgZWxzZVxuICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZSA9IHRvTm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9ycGhlZE5vZGUgPT09IHRvTm9kZSkge1xuICAgICAgICAgICAgLy8gVGhlIFwidG8gbm9kZVwiIHdhcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBcImZyb20gbm9kZVwiIHNvIHdlIGhhZCB0b1xuICAgICAgICAgICAgLy8gdG9zcyBvdXQgdGhlIFwiZnJvbSBub2RlXCIgYW5kIHVzZSB0aGUgXCJ0byBub2RlXCJcbiAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChmcm9tTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb3JwaEVsKG1vcnBoZWROb2RlLCB0b05vZGUsIGNoaWxkcmVuT25seSk7XG5cbiAgICAgICAgICAgIC8vIFdlIG5vdyBuZWVkIHRvIGxvb3Agb3ZlciBhbnkga2V5ZWQgbm9kZXMgdGhhdCBtaWdodCBuZWVkIHRvIGJlXG4gICAgICAgICAgICAvLyByZW1vdmVkLiBXZSBvbmx5IGRvIHRoZSByZW1vdmFsIGlmIHdlIGtub3cgdGhhdCB0aGUga2V5ZWQgbm9kZVxuICAgICAgICAgICAgLy8gbmV2ZXIgZm91bmQgYSBtYXRjaC4gV2hlbiBhIGtleWVkIG5vZGUgaXMgbWF0Y2hlZCB1cCB3ZSByZW1vdmVcbiAgICAgICAgICAgIC8vIGl0IG91dCBvZiBmcm9tTm9kZXNMb29rdXAgYW5kIHdlIHVzZSBmcm9tTm9kZXNMb29rdXAgdG8gZGV0ZXJtaW5lXG4gICAgICAgICAgICAvLyBpZiBhIGtleWVkIG5vZGUgaGFzIGJlZW4gbWF0Y2hlZCB1cCBvciBub3RcbiAgICAgICAgICAgIGlmIChrZXllZFJlbW92YWxMaXN0KSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wLCBsZW49a2V5ZWRSZW1vdmFsTGlzdC5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsVG9SZW1vdmUgPSBmcm9tTm9kZXNMb29rdXBba2V5ZWRSZW1vdmFsTGlzdFtpXV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFRvUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVOb2RlKGVsVG9SZW1vdmUsIGVsVG9SZW1vdmUucGFyZW50Tm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjaGlsZHJlbk9ubHkgJiYgbW9ycGhlZE5vZGUgIT09IGZyb21Ob2RlICYmIGZyb21Ob2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChtb3JwaGVkTm9kZS5hY3R1YWxpemUpIHtcbiAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZSA9IG1vcnBoZWROb2RlLmFjdHVhbGl6ZShmcm9tTm9kZS5vd25lckRvY3VtZW50IHx8IGRvYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYWQgdG8gc3dhcCBvdXQgdGhlIGZyb20gbm9kZSB3aXRoIGEgbmV3IG5vZGUgYmVjYXVzZSB0aGUgb2xkXG4gICAgICAgICAgICAvLyBub2RlIHdhcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSB0YXJnZXQgbm9kZSB0aGVuIHdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIG9sZCBET00gbm9kZSBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUuIFRoaXMgaXMgb25seVxuICAgICAgICAgICAgLy8gcG9zc2libGUgaWYgdGhlIG9yaWdpbmFsIERPTSBub2RlIHdhcyBwYXJ0IG9mIGEgRE9NIHRyZWUgd2hpY2hcbiAgICAgICAgICAgIC8vIHdlIGtub3cgaXMgdGhlIGNhc2UgaWYgaXQgaGFzIGEgcGFyZW50IG5vZGUuXG4gICAgICAgICAgICBmcm9tTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChtb3JwaGVkTm9kZSwgZnJvbU5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1vcnBoZWROb2RlO1xuICAgIH07XG59XG5cbnZhciBtb3JwaGRvbSA9IG1vcnBoZG9tRmFjdG9yeShtb3JwaEF0dHJzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBtb3JwaGRvbTtcbiIsIi8qIGdsb2JhbCBNdXRhdGlvbk9ic2VydmVyICovXG52YXIgZG9jdW1lbnQgPSByZXF1aXJlKCdnbG9iYWwvZG9jdW1lbnQnKVxudmFyIHdpbmRvdyA9IHJlcXVpcmUoJ2dsb2JhbC93aW5kb3cnKVxudmFyIHdhdGNoID0gT2JqZWN0LmNyZWF0ZShudWxsKVxudmFyIEtFWV9JRCA9ICdvbmxvYWRpZCcgKyAobmV3IERhdGUoKSAlIDllNikudG9TdHJpbmcoMzYpXG52YXIgS0VZX0FUVFIgPSAnZGF0YS0nICsgS0VZX0lEXG52YXIgSU5ERVggPSAwXG5cbmlmICh3aW5kb3cgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgIGlmIChPYmplY3Qua2V5cyh3YXRjaCkubGVuZ3RoIDwgMSkgcmV0dXJuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtdXRhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChtdXRhdGlvbnNbaV0uYXR0cmlidXRlTmFtZSA9PT0gS0VZX0FUVFIpIHtcbiAgICAgICAgZWFjaEF0dHIobXV0YXRpb25zW2ldLCB0dXJub24sIHR1cm5vZmYpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBlYWNoTXV0YXRpb24obXV0YXRpb25zW2ldLnJlbW92ZWROb2RlcywgdHVybm9mZilcbiAgICAgIGVhY2hNdXRhdGlvbihtdXRhdGlvbnNbaV0uYWRkZWROb2RlcywgdHVybm9uKVxuICAgIH1cbiAgfSlcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVGaWx0ZXI6IFtLRVlfQVRUUl1cbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvbmxvYWQgKGVsLCBvbiwgb2ZmLCBjYWxsZXIpIHtcbiAgb24gPSBvbiB8fCBmdW5jdGlvbiAoKSB7fVxuICBvZmYgPSBvZmYgfHwgZnVuY3Rpb24gKCkge31cbiAgZWwuc2V0QXR0cmlidXRlKEtFWV9BVFRSLCAnbycgKyBJTkRFWClcbiAgd2F0Y2hbJ28nICsgSU5ERVhdID0gW29uLCBvZmYsIDAsIGNhbGxlciB8fCBvbmxvYWQuY2FsbGVyXVxuICBJTkRFWCArPSAxXG4gIHJldHVybiBlbFxufVxuXG5mdW5jdGlvbiB0dXJub24gKGluZGV4LCBlbCkge1xuICBpZiAod2F0Y2hbaW5kZXhdWzBdICYmIHdhdGNoW2luZGV4XVsyXSA9PT0gMCkge1xuICAgIHdhdGNoW2luZGV4XVswXShlbClcbiAgICB3YXRjaFtpbmRleF1bMl0gPSAxXG4gIH1cbn1cblxuZnVuY3Rpb24gdHVybm9mZiAoaW5kZXgsIGVsKSB7XG4gIGlmICh3YXRjaFtpbmRleF1bMV0gJiYgd2F0Y2hbaW5kZXhdWzJdID09PSAxKSB7XG4gICAgd2F0Y2hbaW5kZXhdWzFdKGVsKVxuICAgIHdhdGNoW2luZGV4XVsyXSA9IDBcbiAgfVxufVxuXG5mdW5jdGlvbiBlYWNoQXR0ciAobXV0YXRpb24sIG9uLCBvZmYpIHtcbiAgdmFyIG5ld1ZhbHVlID0gbXV0YXRpb24udGFyZ2V0LmdldEF0dHJpYnV0ZShLRVlfQVRUUilcbiAgaWYgKHNhbWVPcmlnaW4obXV0YXRpb24ub2xkVmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgIHdhdGNoW25ld1ZhbHVlXSA9IHdhdGNoW211dGF0aW9uLm9sZFZhbHVlXVxuICAgIHJldHVyblxuICB9XG4gIGlmICh3YXRjaFttdXRhdGlvbi5vbGRWYWx1ZV0pIHtcbiAgICBvZmYobXV0YXRpb24ub2xkVmFsdWUsIG11dGF0aW9uLnRhcmdldClcbiAgfVxuICBpZiAod2F0Y2hbbmV3VmFsdWVdKSB7XG4gICAgb24obmV3VmFsdWUsIG11dGF0aW9uLnRhcmdldClcbiAgfVxufVxuXG5mdW5jdGlvbiBzYW1lT3JpZ2luIChvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgaWYgKCFvbGRWYWx1ZSB8fCAhbmV3VmFsdWUpIHJldHVybiBmYWxzZVxuICByZXR1cm4gd2F0Y2hbb2xkVmFsdWVdWzNdID09PSB3YXRjaFtuZXdWYWx1ZV1bM11cbn1cblxuZnVuY3Rpb24gZWFjaE11dGF0aW9uIChub2RlcywgZm4pIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh3YXRjaClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChub2Rlc1tpXSAmJiBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUgJiYgbm9kZXNbaV0uZ2V0QXR0cmlidXRlKEtFWV9BVFRSKSkge1xuICAgICAgdmFyIG9ubG9hZGlkID0gbm9kZXNbaV0uZ2V0QXR0cmlidXRlKEtFWV9BVFRSKVxuICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIGlmIChvbmxvYWRpZCA9PT0gaykge1xuICAgICAgICAgIGZuKGssIG5vZGVzW2ldKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAobm9kZXNbaV0uY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICBlYWNoTXV0YXRpb24obm9kZXNbaV0uY2hpbGROb2RlcywgZm4pXG4gICAgfVxuICB9XG59XG4iLCIgIC8qIGdsb2JhbHMgcmVxdWlyZSwgbW9kdWxlICovXG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICAgKi9cblxuICB2YXIgcGF0aHRvUmVnZXhwID0gcmVxdWlyZSgncGF0aC10by1yZWdleHAnKTtcblxuICAvKipcbiAgICogTW9kdWxlIGV4cG9ydHMuXG4gICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzID0gcGFnZTtcblxuICAvKipcbiAgICogRGV0ZWN0IGNsaWNrIGV2ZW50XG4gICAqL1xuICB2YXIgY2xpY2tFdmVudCA9ICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGRvY3VtZW50KSAmJiBkb2N1bWVudC5vbnRvdWNoc3RhcnQgPyAndG91Y2hzdGFydCcgOiAnY2xpY2snO1xuXG4gIC8qKlxuICAgKiBUbyB3b3JrIHByb3Blcmx5IHdpdGggdGhlIFVSTFxuICAgKiBoaXN0b3J5LmxvY2F0aW9uIGdlbmVyYXRlZCBwb2x5ZmlsbCBpbiBodHRwczovL2dpdGh1Yi5jb20vZGV2b3RlL0hUTUw1LUhpc3RvcnktQVBJXG4gICAqL1xuXG4gIHZhciBsb2NhdGlvbiA9ICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHdpbmRvdykgJiYgKHdpbmRvdy5oaXN0b3J5LmxvY2F0aW9uIHx8IHdpbmRvdy5sb2NhdGlvbik7XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaC5cbiAgICovXG5cbiAgdmFyIGRpc3BhdGNoID0gdHJ1ZTtcblxuXG4gIC8qKlxuICAgKiBEZWNvZGUgVVJMIGNvbXBvbmVudHMgKHF1ZXJ5IHN0cmluZywgcGF0aG5hbWUsIGhhc2gpLlxuICAgKiBBY2NvbW1vZGF0ZXMgYm90aCByZWd1bGFyIHBlcmNlbnQgZW5jb2RpbmcgYW5kIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBmb3JtYXQuXG4gICAqL1xuICB2YXIgZGVjb2RlVVJMQ29tcG9uZW50cyA9IHRydWU7XG5cbiAgLyoqXG4gICAqIEJhc2UgcGF0aC5cbiAgICovXG5cbiAgdmFyIGJhc2UgPSAnJztcblxuICAvKipcbiAgICogUnVubmluZyBmbGFnLlxuICAgKi9cblxuICB2YXIgcnVubmluZztcblxuICAvKipcbiAgICogSGFzaEJhbmcgb3B0aW9uXG4gICAqL1xuXG4gIHZhciBoYXNoYmFuZyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBQcmV2aW91cyBjb250ZXh0LCBmb3IgY2FwdHVyaW5nXG4gICAqIHBhZ2UgZXhpdCBldmVudHMuXG4gICAqL1xuXG4gIHZhciBwcmV2Q29udGV4dDtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYHBhdGhgIHdpdGggY2FsbGJhY2sgYGZuKClgLFxuICAgKiBvciByb3V0ZSBgcGF0aGAsIG9yIHJlZGlyZWN0aW9uLFxuICAgKiBvciBgcGFnZS5zdGFydCgpYC5cbiAgICpcbiAgICogICBwYWdlKGZuKTtcbiAgICogICBwYWdlKCcqJywgZm4pO1xuICAgKiAgIHBhZ2UoJy91c2VyLzppZCcsIGxvYWQsIHVzZXIpO1xuICAgKiAgIHBhZ2UoJy91c2VyLycgKyB1c2VyLmlkLCB7IHNvbWU6ICd0aGluZycgfSk7XG4gICAqICAgcGFnZSgnL3VzZXIvJyArIHVzZXIuaWQpO1xuICAgKiAgIHBhZ2UoJy9mcm9tJywgJy90bycpXG4gICAqICAgcGFnZSgpO1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3whRnVuY3Rpb258IU9iamVjdH0gcGF0aFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9uPX0gZm5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gcGFnZShwYXRoLCBmbikge1xuICAgIC8vIDxjYWxsYmFjaz5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHJldHVybiBwYWdlKCcqJywgcGF0aCk7XG4gICAgfVxuXG4gICAgLy8gcm91dGUgPHBhdGg+IHRvIDxjYWxsYmFjayAuLi4+XG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBmbikge1xuICAgICAgdmFyIHJvdXRlID0gbmV3IFJvdXRlKC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAocGF0aCkpO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcGFnZS5jYWxsYmFja3MucHVzaChyb3V0ZS5taWRkbGV3YXJlKGFyZ3VtZW50c1tpXSkpO1xuICAgICAgfVxuICAgICAgLy8gc2hvdyA8cGF0aD4gd2l0aCBbc3RhdGVdXG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHBhZ2VbJ3N0cmluZycgPT09IHR5cGVvZiBmbiA/ICdyZWRpcmVjdCcgOiAnc2hvdyddKHBhdGgsIGZuKTtcbiAgICAgIC8vIHN0YXJ0IFtvcHRpb25zXVxuICAgIH0gZWxzZSB7XG4gICAgICBwYWdlLnN0YXJ0KHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmdW5jdGlvbnMuXG4gICAqL1xuXG4gIHBhZ2UuY2FsbGJhY2tzID0gW107XG4gIHBhZ2UuZXhpdHMgPSBbXTtcblxuICAvKipcbiAgICogQ3VycmVudCBwYXRoIGJlaW5nIHByb2Nlc3NlZFxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgcGFnZS5jdXJyZW50ID0gJyc7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBwYWdlcyBuYXZpZ2F0ZWQgdG8uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqXG4gICAqICAgICBwYWdlLmxlbiA9PSAwO1xuICAgKiAgICAgcGFnZSgnL2xvZ2luJyk7XG4gICAqICAgICBwYWdlLmxlbiA9PSAxO1xuICAgKi9cblxuICBwYWdlLmxlbiA9IDA7XG5cbiAgLyoqXG4gICAqIEdldCBvciBzZXQgYmFzZXBhdGggdG8gYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLmJhc2UgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgaWYgKDAgPT09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBiYXNlO1xuICAgIGJhc2UgPSBwYXRoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBCaW5kIHdpdGggdGhlIGdpdmVuIGBvcHRpb25zYC5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogICAgLSBgY2xpY2tgIGJpbmQgdG8gY2xpY2sgZXZlbnRzIFt0cnVlXVxuICAgKiAgICAtIGBwb3BzdGF0ZWAgYmluZCB0byBwb3BzdGF0ZSBbdHJ1ZV1cbiAgICogICAgLSBgZGlzcGF0Y2hgIHBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaCBbdHJ1ZV1cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zdGFydCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAocnVubmluZykgcmV0dXJuO1xuICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgIGlmIChmYWxzZSA9PT0gb3B0aW9ucy5kaXNwYXRjaCkgZGlzcGF0Y2ggPSBmYWxzZTtcbiAgICBpZiAoZmFsc2UgPT09IG9wdGlvbnMuZGVjb2RlVVJMQ29tcG9uZW50cykgZGVjb2RlVVJMQ29tcG9uZW50cyA9IGZhbHNlO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5wb3BzdGF0ZSkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgb25wb3BzdGF0ZSwgZmFsc2UpO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5jbGljaykge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50LCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgfVxuICAgIGlmICh0cnVlID09PSBvcHRpb25zLmhhc2hiYW5nKSBoYXNoYmFuZyA9IHRydWU7XG4gICAgaWYgKCFkaXNwYXRjaCkgcmV0dXJuO1xuICAgIHZhciB1cmwgPSAoaGFzaGJhbmcgJiYgfmxvY2F0aW9uLmhhc2guaW5kZXhPZignIyEnKSkgPyBsb2NhdGlvbi5oYXNoLnN1YnN0cigyKSArIGxvY2F0aW9uLnNlYXJjaCA6IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoICsgbG9jYXRpb24uaGFzaDtcbiAgICBwYWdlLnJlcGxhY2UodXJsLCBudWxsLCB0cnVlLCBkaXNwYXRjaCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFVuYmluZCBjbGljayBhbmQgcG9wc3RhdGUgZXZlbnQgaGFuZGxlcnMuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2Uuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghcnVubmluZykgcmV0dXJuO1xuICAgIHBhZ2UuY3VycmVudCA9ICcnO1xuICAgIHBhZ2UubGVuID0gMDtcbiAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50LCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgb25wb3BzdGF0ZSwgZmFsc2UpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTaG93IGBwYXRoYCB3aXRoIG9wdGlvbmFsIGBzdGF0ZWAgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdD19IHN0YXRlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGRpc3BhdGNoXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHB1c2hcbiAgICogQHJldHVybiB7IUNvbnRleHR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2Uuc2hvdyA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlLCBkaXNwYXRjaCwgcHVzaCkge1xuICAgIHZhciBjdHggPSBuZXcgQ29udGV4dChwYXRoLCBzdGF0ZSk7XG4gICAgcGFnZS5jdXJyZW50ID0gY3R4LnBhdGg7XG4gICAgaWYgKGZhbHNlICE9PSBkaXNwYXRjaCkgcGFnZS5kaXNwYXRjaChjdHgpO1xuICAgIGlmIChmYWxzZSAhPT0gY3R4LmhhbmRsZWQgJiYgZmFsc2UgIT09IHB1c2gpIGN0eC5wdXNoU3RhdGUoKTtcbiAgICByZXR1cm4gY3R4O1xuICB9O1xuXG4gIC8qKlxuICAgKiBHb2VzIGJhY2sgaW4gdGhlIGhpc3RvcnlcbiAgICogQmFjayBzaG91bGQgYWx3YXlzIGxldCB0aGUgY3VycmVudCByb3V0ZSBwdXNoIHN0YXRlIGFuZCB0aGVuIGdvIGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gZmFsbGJhY2sgcGF0aCB0byBnbyBiYWNrIGlmIG5vIG1vcmUgaGlzdG9yeSBleGlzdHMsIGlmIHVuZGVmaW5lZCBkZWZhdWx0cyB0byBwYWdlLmJhc2VcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBzdGF0ZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLmJhY2sgPSBmdW5jdGlvbihwYXRoLCBzdGF0ZSkge1xuICAgIGlmIChwYWdlLmxlbiA+IDApIHtcbiAgICAgIC8vIHRoaXMgbWF5IG5lZWQgbW9yZSB0ZXN0aW5nIHRvIHNlZSBpZiBhbGwgYnJvd3NlcnNcbiAgICAgIC8vIHdhaXQgZm9yIHRoZSBuZXh0IHRpY2sgdG8gZ28gYmFjayBpbiBoaXN0b3J5XG4gICAgICBoaXN0b3J5LmJhY2soKTtcbiAgICAgIHBhZ2UubGVuLS07XG4gICAgfSBlbHNlIGlmIChwYXRoKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBwYWdlLnNob3cocGF0aCwgc3RhdGUpO1xuICAgICAgfSk7XG4gICAgfWVsc2V7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBwYWdlLnNob3coYmFzZSwgc3RhdGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHJvdXRlIHRvIHJlZGlyZWN0IGZyb20gb25lIHBhdGggdG8gb3RoZXJcbiAgICogb3IganVzdCByZWRpcmVjdCB0byBhbm90aGVyIHJvdXRlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tIC0gaWYgcGFyYW0gJ3RvJyBpcyB1bmRlZmluZWQgcmVkaXJlY3RzIHRvICdmcm9tJ1xuICAgKiBAcGFyYW0ge3N0cmluZz19IHRvXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBwYWdlLnJlZGlyZWN0ID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICAvLyBEZWZpbmUgcm91dGUgZnJvbSBhIHBhdGggdG8gYW5vdGhlclxuICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGZyb20gJiYgJ3N0cmluZycgPT09IHR5cGVvZiB0bykge1xuICAgICAgcGFnZShmcm9tLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcGFnZS5yZXBsYWNlKC8qKiBAdHlwZSB7IXN0cmluZ30gKi8gKHRvKSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgdGhlIHB1c2ggc3RhdGUgYW5kIHJlcGxhY2UgaXQgd2l0aCBhbm90aGVyXG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgZnJvbSAmJiAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRvKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBwYWdlLnJlcGxhY2UoZnJvbSk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgYHBhdGhgIHdpdGggb3B0aW9uYWwgYHN0YXRlYCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gc3RhdGVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gaW5pdFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBkaXNwYXRjaFxuICAgKiBAcmV0dXJuIHshQ29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cblxuICBwYWdlLnJlcGxhY2UgPSBmdW5jdGlvbihwYXRoLCBzdGF0ZSwgaW5pdCwgZGlzcGF0Y2gpIHtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIHBhZ2UuY3VycmVudCA9IGN0eC5wYXRoO1xuICAgIGN0eC5pbml0ID0gaW5pdDtcbiAgICBjdHguc2F2ZSgpOyAvLyBzYXZlIGJlZm9yZSBkaXNwYXRjaGluZywgd2hpY2ggbWF5IHJlZGlyZWN0XG4gICAgaWYgKGZhbHNlICE9PSBkaXNwYXRjaCkgcGFnZS5kaXNwYXRjaChjdHgpO1xuICAgIHJldHVybiBjdHg7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoIHRoZSBnaXZlbiBgY3R4YC5cbiAgICpcbiAgICogQHBhcmFtIHtDb250ZXh0fSBjdHhcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBwYWdlLmRpc3BhdGNoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgdmFyIHByZXYgPSBwcmV2Q29udGV4dCxcbiAgICAgIGkgPSAwLFxuICAgICAgaiA9IDA7XG5cbiAgICBwcmV2Q29udGV4dCA9IGN0eDtcblxuICAgIGZ1bmN0aW9uIG5leHRFeGl0KCkge1xuICAgICAgdmFyIGZuID0gcGFnZS5leGl0c1tqKytdO1xuICAgICAgaWYgKCFmbikgcmV0dXJuIG5leHRFbnRlcigpO1xuICAgICAgZm4ocHJldiwgbmV4dEV4aXQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5leHRFbnRlcigpIHtcbiAgICAgIHZhciBmbiA9IHBhZ2UuY2FsbGJhY2tzW2krK107XG5cbiAgICAgIGlmIChjdHgucGF0aCAhPT0gcGFnZS5jdXJyZW50KSB7XG4gICAgICAgIGN0eC5oYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghZm4pIHJldHVybiB1bmhhbmRsZWQoY3R4KTtcbiAgICAgIGZuKGN0eCwgbmV4dEVudGVyKTtcbiAgICB9XG5cbiAgICBpZiAocHJldikge1xuICAgICAgbmV4dEV4aXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dEVudGVyKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBVbmhhbmRsZWQgYGN0eGAuIFdoZW4gaXQncyBub3QgdGhlIGluaXRpYWxcbiAgICogcG9wc3RhdGUgdGhlbiByZWRpcmVjdC4gSWYgeW91IHdpc2ggdG8gaGFuZGxlXG4gICAqIDQwNHMgb24geW91ciBvd24gdXNlIGBwYWdlKCcqJywgY2FsbGJhY2spYC5cbiAgICpcbiAgICogQHBhcmFtIHtDb250ZXh0fSBjdHhcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiB1bmhhbmRsZWQoY3R4KSB7XG4gICAgaWYgKGN0eC5oYW5kbGVkKSByZXR1cm47XG4gICAgdmFyIGN1cnJlbnQ7XG5cbiAgICBpZiAoaGFzaGJhbmcpIHtcbiAgICAgIGN1cnJlbnQgPSBiYXNlICsgbG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjIScsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCA9IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50ID09PSBjdHguY2Fub25pY2FsUGF0aCkgcmV0dXJuO1xuICAgIHBhZ2Uuc3RvcCgpO1xuICAgIGN0eC5oYW5kbGVkID0gZmFsc2U7XG4gICAgbG9jYXRpb24uaHJlZiA9IGN0eC5jYW5vbmljYWxQYXRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIGV4aXQgcm91dGUgb24gYHBhdGhgIHdpdGhcbiAgICogY2FsbGJhY2sgYGZuKClgLCB3aGljaCB3aWxsIGJlIGNhbGxlZFxuICAgKiBvbiB0aGUgcHJldmlvdXMgY29udGV4dCB3aGVuIGEgbmV3XG4gICAqIHBhZ2UgaXMgdmlzaXRlZC5cbiAgICovXG4gIHBhZ2UuZXhpdCA9IGZ1bmN0aW9uKHBhdGgsIGZuKSB7XG4gICAgaWYgKHR5cGVvZiBwYXRoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcGFnZS5leGl0KCcqJywgcGF0aCk7XG4gICAgfVxuXG4gICAgdmFyIHJvdXRlID0gbmV3IFJvdXRlKHBhdGgpO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICBwYWdlLmV4aXRzLnB1c2gocm91dGUubWlkZGxld2FyZShhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBVUkwgZW5jb2RpbmcgZnJvbSB0aGUgZ2l2ZW4gYHN0cmAuXG4gICAqIEFjY29tbW9kYXRlcyB3aGl0ZXNwYWNlIGluIGJvdGggeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAqIGFuZCByZWd1bGFyIHBlcmNlbnQtZW5jb2RlZCBmb3JtLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsIC0gVVJMIGNvbXBvbmVudCB0byBkZWNvZGVcbiAgICovXG4gIGZ1bmN0aW9uIGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQodmFsKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSB7IHJldHVybiB2YWw7IH1cbiAgICByZXR1cm4gZGVjb2RlVVJMQ29tcG9uZW50cyA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWwucmVwbGFjZSgvXFwrL2csICcgJykpIDogdmFsO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYSBuZXcgXCJyZXF1ZXN0XCIgYENvbnRleHRgXG4gICAqIHdpdGggdGhlIGdpdmVuIGBwYXRoYCBhbmQgb3B0aW9uYWwgaW5pdGlhbCBgc3RhdGVgLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBzdGF0ZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBDb250ZXh0KHBhdGgsIHN0YXRlKSB7XG4gICAgaWYgKCcvJyA9PT0gcGF0aFswXSAmJiAwICE9PSBwYXRoLmluZGV4T2YoYmFzZSkpIHBhdGggPSBiYXNlICsgKGhhc2hiYW5nID8gJyMhJyA6ICcnKSArIHBhdGg7XG4gICAgdmFyIGkgPSBwYXRoLmluZGV4T2YoJz8nKTtcblxuICAgIHRoaXMuY2Fub25pY2FsUGF0aCA9IHBhdGg7XG4gICAgdGhpcy5wYXRoID0gcGF0aC5yZXBsYWNlKGJhc2UsICcnKSB8fCAnLyc7XG4gICAgaWYgKGhhc2hiYW5nKSB0aGlzLnBhdGggPSB0aGlzLnBhdGgucmVwbGFjZSgnIyEnLCAnJykgfHwgJy8nO1xuXG4gICAgdGhpcy50aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSB8fCB7fTtcbiAgICB0aGlzLnN0YXRlLnBhdGggPSBwYXRoO1xuICAgIHRoaXMucXVlcnlzdHJpbmcgPSB+aSA/IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQocGF0aC5zbGljZShpICsgMSkpIDogJyc7XG4gICAgdGhpcy5wYXRobmFtZSA9IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQofmkgPyBwYXRoLnNsaWNlKDAsIGkpIDogcGF0aCk7XG4gICAgdGhpcy5wYXJhbXMgPSB7fTtcblxuICAgIC8vIGZyYWdtZW50XG4gICAgdGhpcy5oYXNoID0gJyc7XG4gICAgaWYgKCFoYXNoYmFuZykge1xuICAgICAgaWYgKCF+dGhpcy5wYXRoLmluZGV4T2YoJyMnKSkgcmV0dXJuO1xuICAgICAgdmFyIHBhcnRzID0gdGhpcy5wYXRoLnNwbGl0KCcjJyk7XG4gICAgICB0aGlzLnBhdGggPSBwYXJ0c1swXTtcbiAgICAgIHRoaXMuaGFzaCA9IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQocGFydHNbMV0pIHx8ICcnO1xuICAgICAgdGhpcy5xdWVyeXN0cmluZyA9IHRoaXMucXVlcnlzdHJpbmcuc3BsaXQoJyMnKVswXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIGBDb250ZXh0YC5cbiAgICovXG5cbiAgcGFnZS5Db250ZXh0ID0gQ29udGV4dDtcblxuICAvKipcbiAgICogUHVzaCBzdGF0ZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIENvbnRleHQucHJvdG90eXBlLnB1c2hTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHBhZ2UubGVuKys7XG4gICAgaGlzdG9yeS5wdXNoU3RhdGUodGhpcy5zdGF0ZSwgdGhpcy50aXRsZSwgaGFzaGJhbmcgJiYgdGhpcy5wYXRoICE9PSAnLycgPyAnIyEnICsgdGhpcy5wYXRoIDogdGhpcy5jYW5vbmljYWxQYXRoKTtcbiAgfTtcblxuICAvKipcbiAgICogU2F2ZSB0aGUgY29udGV4dCBzdGF0ZS5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgQ29udGV4dC5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHRoaXMuc3RhdGUsIHRoaXMudGl0bGUsIGhhc2hiYW5nICYmIHRoaXMucGF0aCAhPT0gJy8nID8gJyMhJyArIHRoaXMucGF0aCA6IHRoaXMuY2Fub25pY2FsUGF0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYFJvdXRlYCB3aXRoIHRoZSBnaXZlbiBIVFRQIGBwYXRoYCxcbiAgICogYW5kIGFuIGFycmF5IG9mIGBjYWxsYmFja3NgIGFuZCBgb3B0aW9uc2AuXG4gICAqXG4gICAqIE9wdGlvbnM6XG4gICAqXG4gICAqICAgLSBgc2Vuc2l0aXZlYCAgICBlbmFibGUgY2FzZS1zZW5zaXRpdmUgcm91dGVzXG4gICAqICAgLSBgc3RyaWN0YCAgICAgICBlbmFibGUgc3RyaWN0IG1hdGNoaW5nIGZvciB0cmFpbGluZyBzbGFzaGVzXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnNcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFJvdXRlKHBhdGgsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnBhdGggPSAocGF0aCA9PT0gJyonKSA/ICcoLiopJyA6IHBhdGg7XG4gICAgdGhpcy5tZXRob2QgPSAnR0VUJztcbiAgICB0aGlzLnJlZ2V4cCA9IHBhdGh0b1JlZ2V4cCh0aGlzLnBhdGgsXG4gICAgICB0aGlzLmtleXMgPSBbXSxcbiAgICAgIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBgUm91dGVgLlxuICAgKi9cblxuICBwYWdlLlJvdXRlID0gUm91dGU7XG5cbiAgLyoqXG4gICAqIFJldHVybiByb3V0ZSBtaWRkbGV3YXJlIHdpdGhcbiAgICogdGhlIGdpdmVuIGNhbGxiYWNrIGBmbigpYC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFJvdXRlLnByb3RvdHlwZS5taWRkbGV3YXJlID0gZnVuY3Rpb24oZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGN0eCwgbmV4dCkge1xuICAgICAgaWYgKHNlbGYubWF0Y2goY3R4LnBhdGgsIGN0eC5wYXJhbXMpKSByZXR1cm4gZm4oY3R4LCBuZXh0KTtcbiAgICAgIG5leHQoKTtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGlzIHJvdXRlIG1hdGNoZXMgYHBhdGhgLCBpZiBzb1xuICAgKiBwb3B1bGF0ZSBgcGFyYW1zYC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgUm91dGUucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24ocGF0aCwgcGFyYW1zKSB7XG4gICAgdmFyIGtleXMgPSB0aGlzLmtleXMsXG4gICAgICBxc0luZGV4ID0gcGF0aC5pbmRleE9mKCc/JyksXG4gICAgICBwYXRobmFtZSA9IH5xc0luZGV4ID8gcGF0aC5zbGljZSgwLCBxc0luZGV4KSA6IHBhdGgsXG4gICAgICBtID0gdGhpcy5yZWdleHAuZXhlYyhkZWNvZGVVUklDb21wb25lbnQocGF0aG5hbWUpKTtcblxuICAgIGlmICghbSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbiA9IG0ubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2kgLSAxXTtcbiAgICAgIHZhciB2YWwgPSBkZWNvZGVVUkxFbmNvZGVkVVJJQ29tcG9uZW50KG1baV0pO1xuICAgICAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkIHx8ICEoaGFzT3duUHJvcGVydHkuY2FsbChwYXJhbXMsIGtleS5uYW1lKSkpIHtcbiAgICAgICAgcGFyYW1zW2tleS5uYW1lXSA9IHZhbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBIYW5kbGUgXCJwb3B1bGF0ZVwiIGV2ZW50cy5cbiAgICovXG5cbiAgdmFyIG9ucG9wc3RhdGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiB3aW5kb3cpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG9ucG9wc3RhdGUoZSkge1xuICAgICAgaWYgKCFsb2FkZWQpIHJldHVybjtcbiAgICAgIGlmIChlLnN0YXRlKSB7XG4gICAgICAgIHZhciBwYXRoID0gZS5zdGF0ZS5wYXRoO1xuICAgICAgICBwYWdlLnJlcGxhY2UocGF0aCwgZS5zdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdlLnNob3cobG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5oYXNoLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG4gIC8qKlxuICAgKiBIYW5kbGUgXCJjbGlja1wiIGV2ZW50cy5cbiAgICovXG5cbiAgZnVuY3Rpb24gb25jbGljayhlKSB7XG5cbiAgICBpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuICAgIGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcbiAgICBpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblxuXG4gICAgLy8gZW5zdXJlIGxpbmtcbiAgICAvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZVxuICAgIHZhciBlbCA9IGUucGF0aCA/IGUucGF0aFswXSA6IGUudGFyZ2V0O1xuICAgIHdoaWxlIChlbCAmJiAnQScgIT09IGVsLm5vZGVOYW1lKSBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgaWYgKCFlbCB8fCAnQScgIT09IGVsLm5vZGVOYW1lKSByZXR1cm47XG5cblxuXG4gICAgLy8gSWdub3JlIGlmIHRhZyBoYXNcbiAgICAvLyAxLiBcImRvd25sb2FkXCIgYXR0cmlidXRlXG4gICAgLy8gMi4gcmVsPVwiZXh0ZXJuYWxcIiBhdHRyaWJ1dGVcbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdkb3dubG9hZCcpIHx8IGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdleHRlcm5hbCcpIHJldHVybjtcblxuICAgIC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuICAgIHZhciBsaW5rID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgaWYgKCFoYXNoYmFuZyAmJiBlbC5wYXRobmFtZSA9PT0gbG9jYXRpb24ucGF0aG5hbWUgJiYgKGVsLmhhc2ggfHwgJyMnID09PSBsaW5rKSkgcmV0dXJuO1xuXG5cblxuICAgIC8vIENoZWNrIGZvciBtYWlsdG86IGluIHRoZSBocmVmXG4gICAgaWYgKGxpbmsgJiYgbGluay5pbmRleE9mKCdtYWlsdG86JykgPiAtMSkgcmV0dXJuO1xuXG4gICAgLy8gY2hlY2sgdGFyZ2V0XG4gICAgaWYgKGVsLnRhcmdldCkgcmV0dXJuO1xuXG4gICAgLy8geC1vcmlnaW5cbiAgICBpZiAoIXNhbWVPcmlnaW4oZWwuaHJlZikpIHJldHVybjtcblxuXG5cbiAgICAvLyByZWJ1aWxkIHBhdGhcbiAgICB2YXIgcGF0aCA9IGVsLnBhdGhuYW1lICsgZWwuc2VhcmNoICsgKGVsLmhhc2ggfHwgJycpO1xuXG4gICAgLy8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwYXRoLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcbiAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC9bYS16QS1aXTpcXC8vLCAnLycpO1xuICAgIH1cblxuICAgIC8vIHNhbWUgcGFnZVxuICAgIHZhciBvcmlnID0gcGF0aDtcblxuICAgIGlmIChwYXRoLmluZGV4T2YoYmFzZSkgPT09IDApIHtcbiAgICAgIHBhdGggPSBwYXRoLnN1YnN0cihiYXNlLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYgKGhhc2hiYW5nKSBwYXRoID0gcGF0aC5yZXBsYWNlKCcjIScsICcnKTtcblxuICAgIGlmIChiYXNlICYmIG9yaWcgPT09IHBhdGgpIHJldHVybjtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBwYWdlLnNob3cob3JpZyk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgYnV0dG9uLlxuICAgKi9cblxuICBmdW5jdGlvbiB3aGljaChlKSB7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIHJldHVybiBudWxsID09PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBocmVmYCBpcyB0aGUgc2FtZSBvcmlnaW4uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHNhbWVPcmlnaW4oaHJlZikge1xuICAgIHZhciBvcmlnaW4gPSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0bmFtZTtcbiAgICBpZiAobG9jYXRpb24ucG9ydCkgb3JpZ2luICs9ICc6JyArIGxvY2F0aW9uLnBvcnQ7XG4gICAgcmV0dXJuIChocmVmICYmICgwID09PSBocmVmLmluZGV4T2Yob3JpZ2luKSkpO1xuICB9XG5cbiAgcGFnZS5zYW1lT3JpZ2luID0gc2FtZU9yaWdpbjtcbiIsInZhciBpc2FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbi8qKlxuICogRXhwb3NlIGBwYXRoVG9SZWdleHBgLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhUb1JlZ2V4cFxubW9kdWxlLmV4cG9ydHMucGFyc2UgPSBwYXJzZVxubW9kdWxlLmV4cG9ydHMuY29tcGlsZSA9IGNvbXBpbGVcbm1vZHVsZS5leHBvcnRzLnRva2Vuc1RvRnVuY3Rpb24gPSB0b2tlbnNUb0Z1bmN0aW9uXG5tb2R1bGUuZXhwb3J0cy50b2tlbnNUb1JlZ0V4cCA9IHRva2Vuc1RvUmVnRXhwXG5cbi8qKlxuICogVGhlIG1haW4gcGF0aCBtYXRjaGluZyByZWdleHAgdXRpbGl0eS5cbiAqXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG52YXIgUEFUSF9SRUdFWFAgPSBuZXcgUmVnRXhwKFtcbiAgLy8gTWF0Y2ggZXNjYXBlZCBjaGFyYWN0ZXJzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGFwcGVhciBpbiBmdXR1cmUgbWF0Y2hlcy5cbiAgLy8gVGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gZXNjYXBlIHNwZWNpYWwgY2hhcmFjdGVycyB0aGF0IHdvbid0IHRyYW5zZm9ybS5cbiAgJyhcXFxcXFxcXC4pJyxcbiAgLy8gTWF0Y2ggRXhwcmVzcy1zdHlsZSBwYXJhbWV0ZXJzIGFuZCB1bi1uYW1lZCBwYXJhbWV0ZXJzIHdpdGggYSBwcmVmaXhcbiAgLy8gYW5kIG9wdGlvbmFsIHN1ZmZpeGVzLiBNYXRjaGVzIGFwcGVhciBhczpcbiAgLy9cbiAgLy8gXCIvOnRlc3QoXFxcXGQrKT9cIiA9PiBbXCIvXCIsIFwidGVzdFwiLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCBcIj9cIiwgdW5kZWZpbmVkXVxuICAvLyBcIi9yb3V0ZShcXFxcZCspXCIgID0+IFt1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gIC8vIFwiLypcIiAgICAgICAgICAgID0+IFtcIi9cIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIipcIl1cbiAgJyhbXFxcXC8uXSk/KD86KD86XFxcXDooXFxcXHcrKSg/OlxcXFwoKCg/OlxcXFxcXFxcLnxbXigpXSkrKVxcXFwpKT98XFxcXCgoKD86XFxcXFxcXFwufFteKCldKSspXFxcXCkpKFsrKj9dKT98KFxcXFwqKSknXG5dLmpvaW4oJ3wnKSwgJ2cnKVxuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIGZvciB0aGUgcmF3IHRva2Vucy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlIChzdHIpIHtcbiAgdmFyIHRva2VucyA9IFtdXG4gIHZhciBrZXkgPSAwXG4gIHZhciBpbmRleCA9IDBcbiAgdmFyIHBhdGggPSAnJ1xuICB2YXIgcmVzXG5cbiAgd2hpbGUgKChyZXMgPSBQQVRIX1JFR0VYUC5leGVjKHN0cikpICE9IG51bGwpIHtcbiAgICB2YXIgbSA9IHJlc1swXVxuICAgIHZhciBlc2NhcGVkID0gcmVzWzFdXG4gICAgdmFyIG9mZnNldCA9IHJlcy5pbmRleFxuICAgIHBhdGggKz0gc3RyLnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgaW5kZXggPSBvZmZzZXQgKyBtLmxlbmd0aFxuXG4gICAgLy8gSWdub3JlIGFscmVhZHkgZXNjYXBlZCBzZXF1ZW5jZXMuXG4gICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgIHBhdGggKz0gZXNjYXBlZFsxXVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICAvLyBQdXNoIHRoZSBjdXJyZW50IHBhdGggb250byB0aGUgdG9rZW5zLlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0b2tlbnMucHVzaChwYXRoKVxuICAgICAgcGF0aCA9ICcnXG4gICAgfVxuXG4gICAgdmFyIHByZWZpeCA9IHJlc1syXVxuICAgIHZhciBuYW1lID0gcmVzWzNdXG4gICAgdmFyIGNhcHR1cmUgPSByZXNbNF1cbiAgICB2YXIgZ3JvdXAgPSByZXNbNV1cbiAgICB2YXIgc3VmZml4ID0gcmVzWzZdXG4gICAgdmFyIGFzdGVyaXNrID0gcmVzWzddXG5cbiAgICB2YXIgcmVwZWF0ID0gc3VmZml4ID09PSAnKycgfHwgc3VmZml4ID09PSAnKidcbiAgICB2YXIgb3B0aW9uYWwgPSBzdWZmaXggPT09ICc/JyB8fCBzdWZmaXggPT09ICcqJ1xuICAgIHZhciBkZWxpbWl0ZXIgPSBwcmVmaXggfHwgJy8nXG4gICAgdmFyIHBhdHRlcm4gPSBjYXB0dXJlIHx8IGdyb3VwIHx8IChhc3RlcmlzayA/ICcuKicgOiAnW14nICsgZGVsaW1pdGVyICsgJ10rPycpXG5cbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICBuYW1lOiBuYW1lIHx8IGtleSsrLFxuICAgICAgcHJlZml4OiBwcmVmaXggfHwgJycsXG4gICAgICBkZWxpbWl0ZXI6IGRlbGltaXRlcixcbiAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcbiAgICAgIHJlcGVhdDogcmVwZWF0LFxuICAgICAgcGF0dGVybjogZXNjYXBlR3JvdXAocGF0dGVybilcbiAgICB9KVxuICB9XG5cbiAgLy8gTWF0Y2ggYW55IGNoYXJhY3RlcnMgc3RpbGwgcmVtYWluaW5nLlxuICBpZiAoaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgcGF0aCArPSBzdHIuc3Vic3RyKGluZGV4KVxuICB9XG5cbiAgLy8gSWYgdGhlIHBhdGggZXhpc3RzLCBwdXNoIGl0IG9udG8gdGhlIGVuZC5cbiAgaWYgKHBhdGgpIHtcbiAgICB0b2tlbnMucHVzaChwYXRoKVxuICB9XG5cbiAgcmV0dXJuIHRva2Vuc1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBzdHJpbmcgdG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiBmb3IgdGhlIHBhdGguXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSAgIHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGUgKHN0cikge1xuICByZXR1cm4gdG9rZW5zVG9GdW5jdGlvbihwYXJzZShzdHIpKVxufVxuXG4vKipcbiAqIEV4cG9zZSBhIG1ldGhvZCBmb3IgdHJhbnNmb3JtaW5nIHRva2VucyBpbnRvIHRoZSBwYXRoIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiB0b2tlbnNUb0Z1bmN0aW9uICh0b2tlbnMpIHtcbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHRva2VucyBpbnRvIHJlZ2V4cHMuXG4gIHZhciBtYXRjaGVzID0gbmV3IEFycmF5KHRva2Vucy5sZW5ndGgpXG5cbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHBhdHRlcm5zIGJlZm9yZSBjb21waWxhdGlvbi5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRva2Vuc1tpXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG1hdGNoZXNbaV0gPSBuZXcgUmVnRXhwKCdeJyArIHRva2Vuc1tpXS5wYXR0ZXJuICsgJyQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHBhdGggPSAnJ1xuICAgIHZhciBkYXRhID0gb2JqIHx8IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHRva2VuID0gdG9rZW5zW2ldXG5cbiAgICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBhdGggKz0gdG9rZW5cblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUgPSBkYXRhW3Rva2VuLm5hbWVdXG4gICAgICB2YXIgc2VnbWVudFxuXG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gYmUgZGVmaW5lZCcpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzYXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGlmICghdG9rZW4ucmVwZWF0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgcmVwZWF0LCBidXQgcmVjZWl2ZWQgXCInICsgdmFsdWUgKyAnXCInKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgYmUgZW1wdHknKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBzZWdtZW50ID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2pdKVxuXG4gICAgICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIHRva2VuLnBhdHRlcm4gKyAnXCIsIGJ1dCByZWNlaXZlZCBcIicgKyBzZWdtZW50ICsgJ1wiJylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXRoICs9IChqID09PSAwID8gdG9rZW4ucHJlZml4IDogdG9rZW4uZGVsaW1pdGVyKSArIHNlZ21lbnRcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHNlZ21lbnQgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpXG5cbiAgICAgIGlmICghbWF0Y2hlc1tpXS50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgfVxuXG4gICAgICBwYXRoICs9IHRva2VuLnByZWZpeCArIHNlZ21lbnRcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aFxuICB9XG59XG5cbi8qKlxuICogRXNjYXBlIGEgcmVndWxhciBleHByZXNzaW9uIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmcgKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbLisqPz1eIToke30oKVtcXF18XFwvXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogRXNjYXBlIHRoZSBjYXB0dXJpbmcgZ3JvdXAgYnkgZXNjYXBpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzIGFuZCBtZWFuaW5nLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZ3JvdXBcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZXNjYXBlR3JvdXAgKGdyb3VwKSB7XG4gIHJldHVybiBncm91cC5yZXBsYWNlKC8oWz0hOiRcXC8oKV0pL2csICdcXFxcJDEnKVxufVxuXG4vKipcbiAqIEF0dGFjaCB0aGUga2V5cyBhcyBhIHByb3BlcnR5IG9mIHRoZSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSByZVxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIGF0dGFjaEtleXMgKHJlLCBrZXlzKSB7XG4gIHJlLmtleXMgPSBrZXlzXG4gIHJldHVybiByZVxufVxuXG4vKipcbiAqIEdldCB0aGUgZmxhZ3MgZm9yIGEgcmVnZXhwIGZyb20gdGhlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZsYWdzIChvcHRpb25zKSB7XG4gIHJldHVybiBvcHRpb25zLnNlbnNpdGl2ZSA/ICcnIDogJ2knXG59XG5cbi8qKlxuICogUHVsbCBvdXQga2V5cyBmcm9tIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge1JlZ0V4cH0gcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHJlZ2V4cFRvUmVnZXhwIChwYXRoLCBrZXlzKSB7XG4gIC8vIFVzZSBhIG5lZ2F0aXZlIGxvb2thaGVhZCB0byBtYXRjaCBvbmx5IGNhcHR1cmluZyBncm91cHMuXG4gIHZhciBncm91cHMgPSBwYXRoLnNvdXJjZS5tYXRjaCgvXFwoKD8hXFw/KS9nKVxuXG4gIGlmIChncm91cHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgbmFtZTogaSxcbiAgICAgICAgcHJlZml4OiBudWxsLFxuICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgIG9wdGlvbmFsOiBmYWxzZSxcbiAgICAgICAgcmVwZWF0OiBmYWxzZSxcbiAgICAgICAgcGF0dGVybjogbnVsbFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0YWNoS2V5cyhwYXRoLCBrZXlzKVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhbiBhcnJheSBpbnRvIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXJyYXlUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgcGFydHMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIHBhcnRzLnB1c2gocGF0aFRvUmVnZXhwKHBhdGhbaV0sIGtleXMsIG9wdGlvbnMpLnNvdXJjZSlcbiAgfVxuXG4gIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCcoPzonICsgcGFydHMuam9pbignfCcpICsgJyknLCBmbGFncyhvcHRpb25zKSlcblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZWdleHAsIGtleXMpXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcGF0aCByZWdleHAgZnJvbSBzdHJpbmcgaW5wdXQuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBzdHJpbmdUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgdG9rZW5zID0gcGFyc2UocGF0aClcbiAgdmFyIHJlID0gdG9rZW5zVG9SZWdFeHAodG9rZW5zLCBvcHRpb25zKVxuXG4gIC8vIEF0dGFjaCBrZXlzIGJhY2sgdG8gdGhlIHJlZ2V4cC5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRva2Vuc1tpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGtleXMucHVzaCh0b2tlbnNbaV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF0dGFjaEtleXMocmUsIGtleXMpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgZnVuY3Rpb24gZm9yIHRha2luZyB0b2tlbnMgYW5kIHJldHVybmluZyBhIFJlZ0V4cC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gIHRva2Vuc1xuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gdG9rZW5zVG9SZWdFeHAgKHRva2Vucywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gIHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdFxuICB2YXIgZW5kID0gb3B0aW9ucy5lbmQgIT09IGZhbHNlXG4gIHZhciByb3V0ZSA9ICcnXG4gIHZhciBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdXG4gIHZhciBlbmRzV2l0aFNsYXNoID0gdHlwZW9mIGxhc3RUb2tlbiA9PT0gJ3N0cmluZycgJiYgL1xcLyQvLnRlc3QobGFzdFRva2VuKVxuXG4gIC8vIEl0ZXJhdGUgb3ZlciB0aGUgdG9rZW5zIGFuZCBjcmVhdGUgb3VyIHJlZ2V4cCBzdHJpbmcuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRva2VuID0gdG9rZW5zW2ldXG5cbiAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgcm91dGUgKz0gZXNjYXBlU3RyaW5nKHRva2VuKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcHJlZml4ID0gZXNjYXBlU3RyaW5nKHRva2VuLnByZWZpeClcbiAgICAgIHZhciBjYXB0dXJlID0gdG9rZW4ucGF0dGVyblxuXG4gICAgICBpZiAodG9rZW4ucmVwZWF0KSB7XG4gICAgICAgIGNhcHR1cmUgKz0gJyg/OicgKyBwcmVmaXggKyBjYXB0dXJlICsgJykqJ1xuICAgICAgfVxuXG4gICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIGNhcHR1cmUgPSAnKD86JyArIHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSk/J1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhcHR1cmUgPSAnKCcgKyBjYXB0dXJlICsgJyk/J1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYXB0dXJlID0gcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpJ1xuICAgICAgfVxuXG4gICAgICByb3V0ZSArPSBjYXB0dXJlXG4gICAgfVxuICB9XG5cbiAgLy8gSW4gbm9uLXN0cmljdCBtb2RlIHdlIGFsbG93IGEgc2xhc2ggYXQgdGhlIGVuZCBvZiBtYXRjaC4gSWYgdGhlIHBhdGggdG9cbiAgLy8gbWF0Y2ggYWxyZWFkeSBlbmRzIHdpdGggYSBzbGFzaCwgd2UgcmVtb3ZlIGl0IGZvciBjb25zaXN0ZW5jeS4gVGhlIHNsYXNoXG4gIC8vIGlzIHZhbGlkIGF0IHRoZSBlbmQgb2YgYSBwYXRoIG1hdGNoLCBub3QgaW4gdGhlIG1pZGRsZS4gVGhpcyBpcyBpbXBvcnRhbnRcbiAgLy8gaW4gbm9uLWVuZGluZyBtb2RlLCB3aGVyZSBcIi90ZXN0L1wiIHNob3VsZG4ndCBtYXRjaCBcIi90ZXN0Ly9yb3V0ZVwiLlxuICBpZiAoIXN0cmljdCkge1xuICAgIHJvdXRlID0gKGVuZHNXaXRoU2xhc2ggPyByb3V0ZS5zbGljZSgwLCAtMikgOiByb3V0ZSkgKyAnKD86XFxcXC8oPz0kKSk/J1xuICB9XG5cbiAgaWYgKGVuZCkge1xuICAgIHJvdXRlICs9ICckJ1xuICB9IGVsc2Uge1xuICAgIC8vIEluIG5vbi1lbmRpbmcgbW9kZSwgd2UgbmVlZCB0aGUgY2FwdHVyaW5nIGdyb3VwcyB0byBtYXRjaCBhcyBtdWNoIGFzXG4gICAgLy8gcG9zc2libGUgYnkgdXNpbmcgYSBwb3NpdGl2ZSBsb29rYWhlYWQgdG8gdGhlIGVuZCBvciBuZXh0IHBhdGggc2VnbWVudC5cbiAgICByb3V0ZSArPSBzdHJpY3QgJiYgZW5kc1dpdGhTbGFzaCA/ICcnIDogJyg/PVxcXFwvfCQpJ1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgcm91dGUsIGZsYWdzKG9wdGlvbnMpKVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZ2l2ZW4gcGF0aCBzdHJpbmcsIHJldHVybmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBBbiBlbXB0eSBhcnJheSBjYW4gYmUgcGFzc2VkIGluIGZvciB0aGUga2V5cywgd2hpY2ggd2lsbCBob2xkIHRoZVxuICogcGxhY2Vob2xkZXIga2V5IGRlc2NyaXB0aW9ucy4gRm9yIGV4YW1wbGUsIHVzaW5nIGAvdXNlci86aWRgLCBga2V5c2Agd2lsbFxuICogY29udGFpbiBgW3sgbmFtZTogJ2lkJywgZGVsaW1pdGVyOiAnLycsIG9wdGlvbmFsOiBmYWxzZSwgcmVwZWF0OiBmYWxzZSB9XWAuXG4gKlxuICogQHBhcmFtICB7KFN0cmluZ3xSZWdFeHB8QXJyYXkpfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgICAgICAgICAgIFtrZXlzXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgICAgICAgICAgICBbb3B0aW9uc11cbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcGF0aFRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIGtleXMgPSBrZXlzIHx8IFtdXG5cbiAgaWYgKCFpc2FycmF5KGtleXMpKSB7XG4gICAgb3B0aW9ucyA9IGtleXNcbiAgICBrZXlzID0gW11cbiAgfSBlbHNlIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgaWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gcmVnZXhwVG9SZWdleHAocGF0aCwga2V5cywgb3B0aW9ucylcbiAgfVxuXG4gIGlmIChpc2FycmF5KHBhdGgpKSB7XG4gICAgcmV0dXJuIGFycmF5VG9SZWdleHAocGF0aCwga2V5cywgb3B0aW9ucylcbiAgfVxuXG4gIHJldHVybiBzdHJpbmdUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIlxudmFyIG9yaWcgPSBkb2N1bWVudC50aXRsZTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc2V0O1xuXG5mdW5jdGlvbiBzZXQoc3RyKSB7XG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIGRvY3VtZW50LnRpdGxlID0gc3RyLnJlcGxhY2UoLyVbb3NdL2csIGZ1bmN0aW9uKF8pe1xuICAgIHN3aXRjaCAoXykge1xuICAgICAgY2FzZSAnJW8nOlxuICAgICAgICByZXR1cm4gb3JpZztcbiAgICAgIGNhc2UgJyVzJzpcbiAgICAgICAgcmV0dXJuIGFyZ3NbaSsrXTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnRzLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgc2V0KG9yaWcpO1xufTtcbiIsInZhciBiZWwgPSByZXF1aXJlKCdiZWwnKSAvLyB0dXJucyB0ZW1wbGF0ZSB0YWcgaW50byBET00gZWxlbWVudHNcbnZhciBtb3JwaGRvbSA9IHJlcXVpcmUoJ21vcnBoZG9tJykgLy8gZWZmaWNpZW50bHkgZGlmZnMgKyBtb3JwaHMgdHdvIERPTSBlbGVtZW50c1xudmFyIGRlZmF1bHRFdmVudHMgPSByZXF1aXJlKCcuL3VwZGF0ZS1ldmVudHMuanMnKSAvLyBkZWZhdWx0IGV2ZW50cyB0byBiZSBjb3BpZWQgd2hlbiBkb20gZWxlbWVudHMgdXBkYXRlXG5cbm1vZHVsZS5leHBvcnRzID0gYmVsXG5cbi8vIFRPRE8gbW92ZSB0aGlzICsgZGVmYXVsdEV2ZW50cyB0byBhIG5ldyBtb2R1bGUgb25jZSB3ZSByZWNlaXZlIG1vcmUgZmVlZGJhY2tcbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChmcm9tTm9kZSwgdG9Ob2RlLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG4gIGlmIChvcHRzLmV2ZW50cyAhPT0gZmFsc2UpIHtcbiAgICBpZiAoIW9wdHMub25CZWZvcmVFbFVwZGF0ZWQpIG9wdHMub25CZWZvcmVFbFVwZGF0ZWQgPSBjb3BpZXJcbiAgfVxuXG4gIHJldHVybiBtb3JwaGRvbShmcm9tTm9kZSwgdG9Ob2RlLCBvcHRzKVxuXG4gIC8vIG1vcnBoZG9tIG9ubHkgY29waWVzIGF0dHJpYnV0ZXMuIHdlIGRlY2lkZWQgd2UgYWxzbyB3YW50ZWQgdG8gY29weSBldmVudHNcbiAgLy8gdGhhdCBjYW4gYmUgc2V0IHZpYSBhdHRyaWJ1dGVzXG4gIGZ1bmN0aW9uIGNvcGllciAoZiwgdCkge1xuICAgIC8vIGNvcHkgZXZlbnRzOlxuICAgIHZhciBldmVudHMgPSBvcHRzLmV2ZW50cyB8fCBkZWZhdWx0RXZlbnRzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBldiA9IGV2ZW50c1tpXVxuICAgICAgaWYgKHRbZXZdKSB7IC8vIGlmIG5ldyBlbGVtZW50IGhhcyBhIHdoaXRlbGlzdGVkIGF0dHJpYnV0ZVxuICAgICAgICBmW2V2XSA9IHRbZXZdIC8vIHVwZGF0ZSBleGlzdGluZyBlbGVtZW50XG4gICAgICB9IGVsc2UgaWYgKGZbZXZdKSB7IC8vIGlmIGV4aXN0aW5nIGVsZW1lbnQgaGFzIGl0IGFuZCBuZXcgb25lIGRvZXNudFxuICAgICAgICBmW2V2XSA9IHVuZGVmaW5lZCAvLyByZW1vdmUgaXQgZnJvbSBleGlzdGluZyBlbGVtZW50XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBvbGRWYWx1ZSA9IGYudmFsdWVcbiAgICB2YXIgbmV3VmFsdWUgPSB0LnZhbHVlXG4gICAgLy8gY29weSB2YWx1ZXMgZm9yIGZvcm0gZWxlbWVudHNcbiAgICBpZiAoKGYubm9kZU5hbWUgPT09ICdJTlBVVCcgJiYgZi50eXBlICE9PSAnZmlsZScpIHx8IGYubm9kZU5hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICBpZiAoIW5ld1ZhbHVlICYmICF0Lmhhc0F0dHJpYnV0ZSgndmFsdWUnKSkge1xuICAgICAgICB0LnZhbHVlID0gZi52YWx1ZVxuICAgICAgfSBlbHNlIGlmIChuZXdWYWx1ZSAhPT0gb2xkVmFsdWUpIHtcbiAgICAgICAgZi52YWx1ZSA9IG5ld1ZhbHVlXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmLm5vZGVOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICBpZiAodC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJykgPT09IG51bGwpIGYudmFsdWUgPSB0LnZhbHVlXG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAgLy8gYXR0cmlidXRlIGV2ZW50cyAoY2FuIGJlIHNldCB3aXRoIGF0dHJpYnV0ZXMpXG4gICdvbmNsaWNrJyxcbiAgJ29uZGJsY2xpY2snLFxuICAnb25tb3VzZWRvd24nLFxuICAnb25tb3VzZXVwJyxcbiAgJ29ubW91c2VvdmVyJyxcbiAgJ29ubW91c2Vtb3ZlJyxcbiAgJ29ubW91c2VvdXQnLFxuICAnb25kcmFnc3RhcnQnLFxuICAnb25kcmFnJyxcbiAgJ29uZHJhZ2VudGVyJyxcbiAgJ29uZHJhZ2xlYXZlJyxcbiAgJ29uZHJhZ292ZXInLFxuICAnb25kcm9wJyxcbiAgJ29uZHJhZ2VuZCcsXG4gICdvbmtleWRvd24nLFxuICAnb25rZXlwcmVzcycsXG4gICdvbmtleXVwJyxcbiAgJ29udW5sb2FkJyxcbiAgJ29uYWJvcnQnLFxuICAnb25lcnJvcicsXG4gICdvbnJlc2l6ZScsXG4gICdvbnNjcm9sbCcsXG4gICdvbnNlbGVjdCcsXG4gICdvbmNoYW5nZScsXG4gICdvbnN1Ym1pdCcsXG4gICdvbnJlc2V0JyxcbiAgJ29uZm9jdXMnLFxuICAnb25ibHVyJyxcbiAgJ29uaW5wdXQnLFxuICAvLyBvdGhlciBjb21tb24gZXZlbnRzXG4gICdvbmNvbnRleHRtZW51JyxcbiAgJ29uZm9jdXNpbicsXG4gICdvbmZvY3Vzb3V0J1xuXVxuIiwidmFyIHBhZ2UgPSByZXF1aXJlKCdwYWdlJyk7XG52YXIgZW1wdHkgPSByZXF1aXJlKCdlbXB0eS1lbGVtZW50Jyk7XG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyk7XG52YXIgdGl0bGUgPSByZXF1aXJlKCd0aXRsZScpO1xuXG5wYWdlKCcvJywgZnVuY3Rpb24gKGN0eCwgbmV4dCkge1xuICB0aXRsZSgnUGxhdHppZ3JhbScpO1xuICB2YXIgbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLWNvbnRhaW5lcicpO1xuXG4gIHZhciBwaWN0dXJlcyA9IFtcbiAgICB7XG4gICAgICB1c2VyOiB7XG4gICAgICAgIHVzZXJuYW1lOiAnSm9zZSBSb3NhbGVzJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9zY29udGVudC1taWEzLTIueHguZmJjZG4ubmV0L3YvdDEuMC05LzEwMTcxNzQ1XzEwMTUyMTE3NjkzNzU2ODg4XzE2MzUyMDIxNjhfbi5qcGc/b2g9ODg3OTM1YjJkNzQ2MzczZWMzZGY4NTNlY2Y1ZTJjMWImb2U9NUEzMjAxNkInXG4gICAgICB9LFxuICAgICAgdXJsOiAnb2ZmaWNlLmpwZycsXG4gICAgICBsaWtlczogMTAsXG4gICAgICBsaWtlZDogZmFsc2UsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKClcbiAgICB9LFxuICAgIHtcbiAgICAgIHVzZXI6IHtcbiAgICAgICAgdXNlcm5hbWU6ICdKb3NlIFJvc2FsZXMnLFxuICAgICAgICBhdmF0YXI6ICdodHRwczovL3Njb250ZW50LW1pYTMtMi54eC5mYmNkbi5uZXQvdi90MS4wLTkvMTAxNzE3NDVfMTAxNTIxMTc2OTM3NTY4ODhfMTYzNTIwMjE2OF9uLmpwZz9vaD04ODc5MzViMmQ3NDYzNzNlYzNkZjg1M2VjZjVlMmMxYiZvZT01QTMyMDE2QidcbiAgICAgIH0sXG4gICAgICB1cmw6ICdvZmZpY2UuanBnJyxcbiAgICAgIGxpa2VzOiAyLFxuICAgICAgbGlrZWQ6IHRydWUsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkuc2V0RGF0ZShuZXcgRGF0ZSgpLmdldERhdGUoKSAtIDEwKVxuICAgIH0sXG4gICAge1xuICAgICAgdXNlcjoge1xuICAgICAgICB1c2VybmFtZTogJ0pvc2UgUm9zYWxlcycsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vc2NvbnRlbnQtbWlhMy0yLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8xMDE3MTc0NV8xMDE1MjExNzY5Mzc1Njg4OF8xNjM1MjAyMTY4X24uanBnP29oPTg4NzkzNWIyZDc0NjM3M2VjM2RmODUzZWNmNWUyYzFiJm9lPTVBMzIwMTZCJ1xuICAgICAgfSxcbiAgICAgIHVybDogJ29mZmljZS5qcGcnLFxuICAgICAgbGlrZXM6IDI5LFxuICAgICAgbGlrZWQ6IGZhbHNlLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnNldERhdGUobmV3IERhdGUoKS5nZXREYXRlKCkgLSAyMClcbiAgICB9XG4gIF07XG5cbiAgZW1wdHkobWFpbikuYXBwZW5kQ2hpbGQodGVtcGxhdGUocGljdHVyZXMpKTtcbn0pXG4iLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xudmFyIGxheW91dCA9IHJlcXVpcmUoJy4uL2xheW91dCcpO1xudmFyIHBpY3R1cmUgPSByZXF1aXJlKCcuLi9waWN0dXJlLWNhcmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGljdHVyZXMpIHtcbiAgdmFyIGVsID0geW9gPGRpdiBjbGFzcz1cImNvbnRhaW5lciB0aW1lbGluZVwiPlxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjb2wgczEyIG0xMCBvZmZzZXQtbTEgbDYgb2Zmc2V0LWwzXCI+XG4gICAgICAgICR7cGljdHVyZXMubWFwKGZ1bmN0aW9uIChwaWMpIHtcbiAgICAgICAgICByZXR1cm4gcGljdHVyZShwaWMpO1xuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5gO1xuXG4gIHJldHVybiBsYXlvdXQoZWwpO1xufVxuXG4iLCJ2YXIgcGFnZSA9IHJlcXVpcmUoJ3BhZ2UnKTtcblxucmVxdWlyZSgnLi9ob21lcGFnZScpO1xucmVxdWlyZSgnLi9zaWdudXAnKTtcbnJlcXVpcmUoJy4vc2lnbmluJyk7XG5cbnBhZ2UoKTsiLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxhbmRpbmcoYm94KSB7XG4gIHJldHVybiB5b2A8ZGl2IGNsYXNzPVwiY29udGFpbmVyIGxhbmRpbmdcIj5cbiAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY29sIHMxMCBwdXNoLXMxXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sIG01IGhpZGUtb24tc21hbGwtb25seVwiPlxuICAgICAgICAgICAgPGltZyBjbGFzcz1cImlwaG9uZVwiIHNyYz1cImlwaG9uZS5wbmdcIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICR7Ym94fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5gXG59IiwidmFyIHlvID0gcmVxdWlyZSgneW8teW8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsYXlvdXQoY29udGVudCkge1xuICByZXR1cm4geW9gPGRpdj5cblx0PG5hdiBjbGFzcz1cImhlYWRlclwiPlxuICAgIDxkaXYgY2xhc3M9XCJuYXYtd3JhcHBlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTIgbTYgb2Zmc2V0LW0xXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnJhbmQtbG9nbyBwbGF0emlncmFtXCI+UGxhdHppZ3JhbTwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sIHMyIG0xIHB1c2gtczEwIHB1c2gtbTVcIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLWxhcmdlIGJ0bi1mbGF0IGRyb3Bkb3duLWJ1dHRvblwiIGRhdGEtYWN0aXZhdGVzPVwiZHJvcC11c2VyXCI+XG4gICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtdXNlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDx1bCBpZD1cImRyb3AtdXNlclwiIGNsYXNzPVwiZHJvcGRvd24tY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPlNhbGlyPC9hPjwvbGk+XG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L25hdj5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICAgICAgJHtjb250ZW50fVxuICAgIDwvZGl2PlxuICA8L2Rpdj5gO1xufVxuIiwidmFyIHlvID0gcmVxdWlyZSgneW8teW8nKTtcblxuaWYgKCF3aW5kb3cuSW50bCl7XG4gIHdpbmRvdy5JbnRsID0gcmVxdWlyZSgnaW50bCcpO1xufVxudmFyIEludGxSZWxhdGl2ZUZvcm1hdCA9IHdpbmRvdy5JbnRsUmVsYXRpdmVGb3JtYXQgPSByZXF1aXJlKCdpbnRsLXJlbGF0aXZlZm9ybWF0Jyk7XG5cbnJlcXVpcmUoJ2ludGwtcmVsYXRpdmVmb3JtYXQvZGlzdC9sb2NhbGUtZGF0YS9lbi5qcycpO1xucmVxdWlyZSgnaW50bC1yZWxhdGl2ZWZvcm1hdC9kaXN0L2xvY2FsZS1kYXRhL2VzLmpzJyk7XG5cbnZhciByZiA9IG5ldyBJbnRsUmVsYXRpdmVGb3JtYXQoJ2VzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGljdHVyZUNhcmQocGljKSB7XG4gIHZhciBlbDtcblxuICBmdW5jdGlvbiByZW5kZXIocGljdHVyZSkge1xuICAgIHJldHVybiB5b2A8ZGl2IGNsYXNzPVwiY2FyZCAke3BpY3R1cmUubGlrZWQgPyAnbGlrZWQnIDogJyd9XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1pbWFnZVwiPlxuICAgICAgICA8aW1nIGNsYXNzPVwiYWN0aXZhdG9yXCIgc3JjPVwiJHtwaWN0dXJlLnVybH1cIj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtY29udGVudFwiPlxuICAgICAgICA8YSBocmVmPVwiL3VzZXIvJHtwaWN0dXJlLnVzZXIudXNlcm5hbWV9XCIgY2xhc3M9XCJjYXJkLXRpdGxlXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIke3BpY3R1cmUudXNlci5hdmF0YXJ9XCIgY2xhc3M9XCJhdmF0YXJcIiAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwidXNlcm5hbWVcIj4ke3BpY3R1cmUudXNlci51c2VybmFtZX08L3NwYW4+XG4gICAgICAgIDwvYT5cbiAgICAgICAgPHNtYWxsIGNsYXNzPVwicmlnaHQgdGltZVwiPiR7cmYuZm9ybWF0KHBpY3R1cmUuY3JlYXRlZEF0KX08L3NtYWxsPlxuICAgICAgICA8cD5cbiAgICAgICAgICA8YSBjbGFzcz1cImxlZnRcIiBocmVmPVwiI1wiIG9uY2xpY2s9JHtsaWtlLmJpbmQobnVsbCwgdHJ1ZSl9PjxpIGNsYXNzPVwiZmEgZmEtaGVhcnQtb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2E+XG4gICAgICAgICAgPGEgY2xhc3M9XCJsZWZ0XCIgaHJlZj1cIiNcIiBvbmNsaWNrPSR7bGlrZS5iaW5kKG51bGwsIGZhbHNlKX0+PGkgY2xhc3M9XCJmYSBmYS1oZWFydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2E+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJsZWZ0IGxpa2VzXCI+JHtwaWN0dXJlLmxpa2VzfSBtZSBndXN0YTwvc3Bhbj5cbiAgICAgICAgPC9wPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YFxuICB9XG5cbiAgZnVuY3Rpb24gbGlrZShsaWtlZCkge1xuICAgIHBpYy5saWtlZCA9IGxpa2VkO1xuICAgIHBpYy5saWtlcyArPSBsaWtlZCA/IDEgOiAtMTtcbiAgICB2YXIgbmV3RWwgPSByZW5kZXIocGljKTtcbiAgICB5by51cGRhdGUoZWwsIG5ld0VsKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBlbCA9IHJlbmRlcihwaWMpO1xuICByZXR1cm4gZWw7XG59IiwidmFyIHBhZ2UgPSByZXF1aXJlKCdwYWdlJyk7XG52YXIgZW1wdHkgPSByZXF1aXJlKCdlbXB0eS1lbGVtZW50Jyk7XG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyk7XG52YXIgdGl0bGUgPSByZXF1aXJlKCd0aXRsZScpO1xuXG5wYWdlKCcvc2lnbmluJywgZnVuY3Rpb24gKGN0eCwgbmV4dCkge1xuICB0aXRsZSgnUGxhdHppZ3JhbSAtIFNpZ25pbicpO1xuICB2YXIgbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLWNvbnRhaW5lcicpO1xuICBlbXB0eShtYWluKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG59KVxuIiwidmFyIHlvID0gcmVxdWlyZSgneW8teW8nKTtcbnZhciBsYW5kaW5nID0gcmVxdWlyZSgnLi4vbGFuZGluZycpO1xuXG52YXIgc2lnbmluRm9ybSA9IHlvYDxkaXYgY2xhc3M9XCJjb2wgczEyIG03XCI+XG4gIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2lnbnVwLWJveFwiPlxuICAgICAgPGgxIGNsYXNzPVwicGxhdHppZ3JhbVwiPlBsYXR6aWdyYW08L2gxPlxuICAgICAgPGZvcm0gY2xhc3M9XCJzaWdudXAtZm9ybVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvblwiPlxuICAgICAgICAgIDxhIGNsYXNzPVwiYnRuIGJ0bi1mYiBoaWRlLW9uLXNtYWxsLW9ubHlcIj5JbmljaWFyIHNlc2nDs24gY29uIEZhY2Vib29rPC9hPlxuICAgICAgICAgIDxhIGNsYXNzPVwiYnRuIGJ0bi1mYiBoaWRlLW9uLW1lZC1hbmQtdXBcIj48aSBjbGFzcz1cImZhIGZhLWZhY2Vib29rLW9mZmljaWFsXCI+PC9pPiBJbmljaWFyIHNlc2nDs248L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvblwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJ1c2VybmFtZVwiIHBsYWNlaG9sZGVyPVwiTm9tYnJlIGRlIHVzdWFyaW9cIiAvPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuYW1lPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIkNvbnRyYXNlw7FhXCIgLz5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIHdhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4tc2lnbnVwXCIgdHlwZT1cInN1Ym1pdFwiPkluaWNpYSBzZXNpw7NuPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9mb3JtPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgIDxkaXYgY2xhc3M9XCJsb2dpbi1ib3hcIj5cbiAgICAgIMK/Tm8gdGllbmVzIHVuYSBjdWVudGE/IDxhIGhyZWY9XCIvc2lnbnVwXCI+UmVnw61zdHJhdGU8L2E+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+YDtcblxubW9kdWxlLmV4cG9ydHMgPSBsYW5kaW5nKHNpZ25pbkZvcm0pO1xuIiwidmFyIHBhZ2UgPSByZXF1aXJlKCdwYWdlJyk7XG52YXIgZW1wdHkgPSByZXF1aXJlKCdlbXB0eS1lbGVtZW50Jyk7XG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyk7XG52YXIgdGl0bGUgPSByZXF1aXJlKCd0aXRsZScpO1xuXG5wYWdlKCcvc2lnbnVwJywgZnVuY3Rpb24gKGN0eCwgbmV4dCkge1xuICB0aXRsZSgnUGxhdHppZ3JhbSAtIFNpZ251cCcpO1xuICB2YXIgbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLWNvbnRhaW5lcicpO1xuICBlbXB0eShtYWluKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG59KVxuIiwidmFyIHlvID0gcmVxdWlyZSgneW8teW8nKTtcbnZhciBsYW5kaW5nID0gcmVxdWlyZSgnLi4vbGFuZGluZycpO1xuXG52YXIgc2lnbnVwRm9ybSA9IHlvYDxkaXYgY2xhc3M9XCJjb2wgczEyIG03XCI+XG4gIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2lnbnVwLWJveFwiPlxuICAgICAgPGgxIGNsYXNzPVwicGxhdHppZ3JhbVwiPlBsYXR6aWdyYW08L2gxPlxuICAgICAgPGZvcm0gY2xhc3M9XCJzaWdudXAtZm9ybVwiPlxuICAgICAgICA8aDI+UmVnw61zdHJhdGUgcGFyYSB2ZXIgZm90b3MgZGUgdHVzIGFtaWdvcyBlc3R1ZGlhbmRvIGVuIFBsYXR6aTwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgPGEgY2xhc3M9XCJidG4gYnRuLWZiIGhpZGUtb24tc21hbGwtb25seVwiPkluaWNpYXIgc2VzacOzbiBjb24gRmFjZWJvb2s8L2E+XG4gICAgICAgICAgPGEgY2xhc3M9XCJidG4gYnRuLWZiIGhpZGUtb24tbWVkLWFuZC11cFwiPjxpIGNsYXNzPVwiZmEgZmEtZmFjZWJvb2stb2ZmaWNpYWxcIj48L2k+IEluaWNpYXIgc2VzacOzbjwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJlbWFpbFwiIG5hbWU9XCJlbWFpbFwiIHBsYWNlaG9sZGVyPVwiQ29ycmVvIGVsZWN0csOzbmljb1wiIC8+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cIm5hbWVcIiBwbGFjZWhvbGRlcj1cIk5vbWJyZSBjb21wbGV0b1wiIC8+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInVzZXJuYW1lXCIgcGxhY2Vob2xkZXI9XCJOb21icmUgZGUgdXN1YXJpb1wiIC8+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5hbWU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwiQ29udHJhc2XDsWFcIiAvPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0bi1zaWdudXBcIiB0eXBlPVwic3VibWl0XCI+UmVnw61zdHJhdGU8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgPGRpdiBjbGFzcz1cImxvZ2luLWJveFwiPlxuICAgICAgwr9UaWVuZXMgdW5hIGN1ZW50YT8gPGEgaHJlZj1cIi9zaWduaW5cIj5FbnRyYXI8L2E+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+YDtcblxubW9kdWxlLmV4cG9ydHMgPSBsYW5kaW5nKHNpZ251cEZvcm0pO1xuIl19
