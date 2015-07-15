function stringFormat(str, replacements) {
	var counter = 0;
	return str.replace(/\{\}/g, function() { return replacements[counter]; });
}

export default stringFormat;
