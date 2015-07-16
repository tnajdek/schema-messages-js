import struct from 'bower_components/jspack-arraybuffer/struct.js';
import utf8 from 'bower_components/utf8/utf8.js';
import stringFormat from 'js/string-format.js';


export default class {
	pack() {
		let cls = Object.getPrototypeOf(this);
		let format = cls.format;
		let binaryFormat = cls.binaryFormat;
		let keys = Object.keys(format).sort();
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
	}

	getBinaryLength() {
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
	}
}
