var _import = require('./import'),
    utils = require('../utils');


exports.compile = function (compiler, args) {
  var imports = [];
  var macros = [];
  var imp = '';

  while((imp = args.pop()) !== 'import' && args.length) {
    imports.push(imp);
  }

  utils.each(args, function(arg) {
    if(arg.name !== undefined) {
      macros.push(arg);
    }
  });

  //var out = '_ctx.' + ctx + ' = (_ctx.' + ctx + ' || {});\n  var _output = "";\n';
  var out = '';

  utils.each(args, function(arg) {
    if(arg.is_import === true) {
      out += arg.compiled;
    } else if(arg.name !== undefined) {
      out += arg.compiled;
    }
  });

  return out;
};

exports.parse = function (str, line, parser, types, stack, opts, swig) {
  return _import.parse(str, line, parser, types, stack, opts, swig);
};

exports.block = true;
