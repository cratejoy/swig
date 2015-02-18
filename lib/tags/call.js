/**
 *
 */
exports.compile = function (compiler, args, content, parents, options, blockName) {
  var out = '';
  out += '_ctx.caller = function() { var _output="";\n' + 
    compiler(content, parents, options, blockName) + '\n return _output; };\n';
	out += '_output+=' + args.join(' ') + ';\n';
  out += 'delete _ctx.caller;'
  return out;
};

exports.parse = function (str, line, parser, types) {
	return true;
};

exports.ends = true;
exports.block = true;
