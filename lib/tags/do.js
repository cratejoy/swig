/**
 *
 */
exports.compile = function (compiler, args, content, parents, options, blockName) {
	return args.join('') + ';\n';
};

exports.parse = function (str, line, parser, types) {
	return true;
};

exports.ends = false;
exports.block = true;
