import struct from '../bower_components/jspack-arraybuffer/struct.js';
import utf8 from '../bower_components/utf8/utf8.js';
import stringFormat from './string-format.js';


function MessageBase() {
	this.data = {};
}

MessageBase.prototype.pack = function() {
	let cls = Object.getPrototypeOf(this);
	let format = cls.format;
	let binaryFormat = cls.binaryFormat;
	let keys = cls.keys;
	let stringLengths = [];
	let data = [ cls.id ];

	for(let i = 0; i < keys.length; i++) {
		let key = keys[i];
		let type = format[key];
		let value = this.data[key];
		if(type === 'enum') {
			value = cls.enums[key][value];
		} else if(type === 'string') {
			value = utf8.encode(value);
			data.push(value.length);
			stringLengths.push(value.length);
		}
		data.push(value);
	}
	binaryFormat = stringFormat(binaryFormat, stringLengths);
	return struct.pack(binaryFormat, data);
};

MessageBase.prototype.getBinaryLength = function() {
	let cls = Object.getPrototypeOf(this);
	let format = cls.format;
	let keys = Object.keys(format).sort();
	let binaryFormat = cls.binaryFormat;
	let stringLengths = [];

	for(let i = 0; i < keys.length; i++) {
		let key = keys[i];

		if(format[key] === 'string') {
			stringLengths.push(this.data[key].length);
		}
	}

	binaryFormat = stringFormat(binaryFormat, stringLengths);
	return struct.calcLength(binaryFormat);
};

export default MessageBase;
