var utils = require('../utils');
/**
 * Create custom, reusable snippets within your templates.
 * Can be imported from one template to another using the <a href="#import"><code data-language="swig">{% import ... %}</code></a> tag.
 *
 * @alias macro
 *
 * @example
 * {% macro input(type, name, id, label, value, error) %}
 *   <label for="{{ name }}">{{ label }}</label>
 *   <input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}"{% if error %} class="error"{% endif %}>
 * {% endmacro %}
 *
 * {{ input("text", "fname", "fname", "First Name", fname.value, fname.errors) }}
 * // => <label for="fname">First Name</label>
 * //    <input type="text" name="fname" id="fname" value="">
 *
 * @param {...arguments} arguments  User-defined arguments.
 */
exports.compile = function (compiler, args, content, parents, options, blockName) {

  for(var i=0; i<args.length; i++) {
    args[i] = utils.fixReserved(args[i]);
  }

	var fnName = args.shift();
	
	// Apply default arguments, if any, to undefined arguments
	var defArgs = '\n';
	for(i=0;  i<args.length; i++) {
		v = args.pop();
		if(v.charAt(0) === '=') {
			a = args.pop();
			defArgs += 'if(' + a + ' === undefined) ' + a + '='+v.slice(1)+';\n';
			args.unshift(a);
		} else {
			args.unshift(v);
		}
	}

	// Apply keyword arguments if defined.
	var kwArgs = 'if(_ctx.kwargs != undefined) {\n';
	for(i=0;  i<args.length; i++) {
		if(args[i].charAt(0) != ',') {
			kwArgs += 'if(_ctx.kwargs.' + args[i] + ' != undefined) {' + args[i] + ' = _ctx.kwargs.' + args[i] + ';}\n';
		}
	}
	kwArgs += '}\n';

  return '_ctx.' + fnName + ' = function (' + args.join('') + ') {\n' +
    '  var _output = "",\n' +
    '    __ctx = _utils.extend({}, _ctx);\n' +
	defArgs + 
	kwArgs + 
    '  _utils.each(_ctx, function (v, k) {\n' +
    '    if (["' + args.join('","') + '"].indexOf(k) !== -1) { delete _ctx[k]; }\n' +
    '  });\n' +
    compiler(content, parents, options, blockName) + '\n' +
    ' _ctx = _utils.extend(_ctx, __ctx);\n' +
    '  return _output;\n' +
    '};\n' +
    '_ctx.' + fnName + '.safe = true;\n';
};

exports.parse = function (str, line, parser, types) {
  var name;
  var scope = 0;
 
  parser.on(types.VAR, function (token) {
    if (token.match.indexOf('.') !== -1) {
      throw new Error('Unexpected dot in macro argument "' + token.match + '" on line ' + line + '.');
    }
    this.out.push(token.match);
  });

  parser.on(types.FUNCTION, function (token) {
    if (!name) {
      name = token.match;
      this.out.push(name);
      this.state.push(types.FUNCTION);
    }
  });

  parser.on(types.FUNCTIONEMPTY, function (token) {
    if (!name) {
      name = token.match;
      this.out.push(name);
    }
  });
  
  parser.on(types.ASSIGNMENT, function(token) {
    if(scope === 0) {
      this.aStart = this.out.length;
    }
	});

  parser.on(types.PARENCLOSE, function (token) {
    if(this.isLast) {
      if(this.aStart !== undefined) {
        this.out.push('=' + this.out.splice(this.aStart).join(''));
        delete this.aStart; 
      }
    } else {
      this.out.push(token.match);
    }
    scope--;
  });

  parser.on(types.COMMA, function (token) {
    if(this.aStart !== undefined && scope === 0) {
      this.out.push('=' + this.out.splice(this.aStart).join(''));
      delete this.aStart; 
    }
    this.out.push(token.match);
  });

  parser.on('*', function (token) {
    switch(token.type) {
      case types.PARENOPEN:
      case types.BRACKETOPEN:
      case types.CURLYOPEN:
        scope++;
        break;
      case types.PARENCLOSE:
      case types.BRACKETCLOSE:
      case types.CURLYCLOSE:
        scope--;
        break;
      case types.WHITESPACE:
        return;         // Ignore whitespace
      case types.NONE:
      case types.BOOL:
        return true;    // default handling of None
    }
    this.out.push(token.match);
  });
  
  return true;
};

exports.ends = true;
exports.block = true;
