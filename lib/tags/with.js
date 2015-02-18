/**
 *
 */
exports.compile = function (compiler, args, content, parents, options, blockName) {
	var fnName = args.shift();
	console.log('compiling with');
	return '';
};

exports.parse = function (str, line, parser, types) {
	var name;
	console.log('parsing with');
	return true;
};

exports.ends = false;
exports.block = true;
