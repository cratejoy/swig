exports.compile = function (compiler, args, content, parents, options, blockName) {
	var fnName = args.shift();
	console.log('compiling call');
	return '';
};

exports.parse = function (str, line, parser, types) {
  var name;
	console.log('parsing call');
  return true;
};

exports.ends = true;
exports.block = true;
