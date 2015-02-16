var utils = require('../utils');

/**
 * Allows you to import macros from another file directly into your current context.
 * The import tag is specifically designed for importing macros into your template with a specific context scope. This is very useful for keeping your macros from overriding template context that is being injected by your server-side page generation.
 *
 * @alias import
 *
 * @example
 * {% import './formmacros.html' as form %}
 * {{ form.input("text", "name") }}
 * // => <input type="text" name="name">
 *
 * @example
 * {% import "../shared/tags.html" as tags %}
 * {{ tags.stylesheet('global') }}
 * // => <link rel="stylesheet" href="/global.css">
 *
 * @param {string|var}  file      Relative path from the current template file to the file to import macros from.
 * @param {literal}     as        Literally, "as".
 * @param {literal}     varname   Local-accessible object name to assign the macros to.
 */
exports.compile = function (compiler, args) {
  var ctx = args.pop();
  var macros = [];

  utils.each(args, function(arg) {
    if(arg.is_import === undefined) {
      macros.push(arg);
    }
  });

  var allMacros = utils.map(macros, function (arg) {
    return arg.name;
  }).join('|');
  
  var out = '_ctx.' + ctx + ' = {};\n  var _output = "";\n';

  var replacements = utils.map(macros, function (arg) {
    if(!arg.is_import) {
      return {
        ex: new RegExp('_ctx.' + arg.name + '(\\W)(?!' + allMacros + ')', 'g'),
        re: '_ctx.' + ctx + '.' + arg.name + '$1'
      };
    }
  });

  // Replace all occurrences of all macros in this file with
  // proper namespaced definitions and calls
  utils.each(args, function (arg) {
    if(arg.is_import === true) {
      out += arg.compiled;
    } else {
      var c = arg.compiled;
      utils.each(replacements, function (re) {
        c = c.replace(re.ex, re.re);
      });
      out += c;
    }
  });

  return out;
};

exports.parse = function (str, line, parser, types, stack, opts, swig) {
  var compiler = require('../parser').compile,
    parseOpts = { resolveFrom: opts.filename },
    compileOpts = utils.extend({}, opts, parseOpts),
    tokens,
    ctx;

  parser.on(types.STRING, function (token) {
    var self = this;
    if (!tokens) {
      tokens = swig.parseFile(token.match.replace(/^("|')|("|')$/g, ''), parseOpts).tokens;
      utils.each(tokens, function (token) {
        if(token.name === 'import') {
          self.out.push({
            compiled: token.compile(compiler, token.args),
            is_import: true
          });
        } else {
          var out = '',
            macroName;
          if (!token || token.name !== 'macro' || !token.compile) {
            return;
          }
          macroName = token.args[0];
          out += token.compile(compiler, token.args, token.content, [], compileOpts) + '\n';
          self.out.push({compiled: out, name: macroName});
        }
      });
      return;
    }

    throw new Error('Unexpected string ' + token.match + ' on line ' + line + '.');
  });

  parser.on(types.VAR, function (token) {
    var self = this;
    if (!tokens || ctx) {
      if(token.match !== 'with' && token.match !== 'context') {
        throw new Error('Unexpected variable "' + token.match + '" on line ' + line + '.');
      } else {
        return;
      }
    }

    if (token.match === 'as') {
      return;
    }

    ctx = token.match;
    self.out.push(ctx);
    return false;
  });

  return true;
};

exports.block = true;
