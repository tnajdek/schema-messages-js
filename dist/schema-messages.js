(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MessageFactory = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function () {

	// utility pack and unpack functions to simplify magic
	var common = {
		pack: function pack(method, dv, value, offset, c, littleendian) {
			if (!Array.isArray(value)) value = [value];

			for (var i = 0; i < c; i++) dv[method](offset + i, value[i], littleendian);
		},
		unpack: function unpack(method, dv, offset, c, littleendian) {
			var r = [];
			for (var i = 0; i < c; i++) r.push(dv[method](offset + i, littleendian));

			return r;
		}
	};

	// pack and unpacking for different types
	var magic = {
		// byte array
		A: {
			length: 1,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setInt8', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getInt8', dv, offset, c, littleendian);
			}
		},
		// padding byte
		x: {
			length: 1,
			pack: function pack(dv, value, offset, c, littleendian) {
				for (var i = 0; i < c; i++) dv.setUint8(offset + i, 0);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				var r = [];
				for (var i = 0; i < c; i++) r.push(0);

				return r;
			}
		},
		// char
		c: {
			length: 1,
			pack: function pack(method, dv, value, offset, c, littleendian) {
				if (!Array.isArray(value)) value = [value];

				for (var i = 0; i < c; i++) dv.setUint8(offset + i, value[i].charCodeAt(0));
			},
			unpack: function unpack(method, dv, offset, c, littleendian) {
				var r = [];
				for (var i = 0; i < c; i++) r.push(String.fromCharCode(dv.getUint8(offset + i)));

				return r;
			}
		},
		// signed char
		b: {
			length: 1,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setInt8', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getInt8', dv, offset, c, littleendian);
			}
		},
		// unsigned char
		B: {
			length: 1,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setUint8', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getUint8', dv, offset, c, littleendian);
			}
		},
		// signed short
		h: {
			length: 2,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setInt16', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getInt16', dv, offset, c, littleendian);
			}
		},
		// unsigned short
		H: {
			length: 2,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setUint16', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getUint16', dv, offset, c, littleendian);
			}
		},
		// signed long
		i: {
			length: 4,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setInt32', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getInt32', dv, offset, c, littleendian);
			}
		},
		// unsigned long
		I: {
			length: 4,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setUint32', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getUint32', dv, offset, c, littleendian);
			}
		},
		l: {
			length: 4,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setInt32', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getInt32', dv, offset, c, littleendian);
			}
		},
		// unsigned long
		L: {
			length: 4,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setUint32', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getUint32', dv, offset, c, littleendian);
			}
		},
		// char[]
		s: {
			length: 1,
			pack: function pack(dv, value, offset, c, littleendian) {
				var val = new String(value[0]);

				for (var i = 0; i < c; i++) {
					var code = 0;

					if (i < val.length) code = val.charCodeAt(i);

					dv.setUint8(offset + i, code);
				}
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				var r = [];
				for (var i = 0; i < c; i++) r.push(String.fromCharCode(dv.getUint8(offset + i)));

				return [r.join('')];
			}
		},
		// float
		f: {
			length: 4,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setFloat32', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getFloat32', dv, offset, c, littleendian);
			}
		},
		// double
		d: {
			length: 8,
			pack: function pack(dv, value, offset, c, littleendian) {
				common.pack('setFloat64', dv, value, offset, c, littleendian);
			},
			unpack: function unpack(dv, offset, c, littleendian) {
				return common.unpack('getFloat64', dv, offset, c, littleendian);
			}
		}
	};

	// pattern of stuff we're looking for
	var pattern = '(\\d+)?([AxcbBhHsfdiIlL])';

	// determine the size of arraybuffer we'd need
	var determineLength = function determineLength(fmt) {
		var re = new RegExp(pattern, 'g'),
		    m,
		    sum = 0;

		while (m = re.exec(fmt)) sum += (m[1] == undefined || m[1] == '' ? 1 : parseInt(m[1])) * magic[m[2]].length;

		return sum;
	};

	// pack a set of values, starting at offset, based on format
	var pack = function pack(fmt, values, offset) {
		var littleendian = fmt.charAt(0) == '<';
		offset = offset ? offset : 0;

		var ab = new ArrayBuffer(determineLength(fmt)),
		    dv = new DataView(ab),
		    re = new RegExp(pattern, 'g'),
		    m,
		    c,
		    l,
		    i = 0;

		while (m = re.exec(fmt)) {
			if (magic[m[2]] == undefined) throw new Error('Unknown format type');

			c = m[1] == undefined || m[1] == '' ? 1 : parseInt(m[1]);
			l = magic[m[2]].length;

			if (offset + c * l > ab.length) return;

			var value = values.slice(i, i + 1);

			magic[m[2]].pack(dv, value, offset, c, littleendian);

			offset += c * l;
			i += 1;
		}

		return ab;
	};

	// unpack an arraybuffer, starting at offset, based on format
	// returns an array
	var unpack = function unpack(fmt, ab, offset) {
		var littleendian = fmt.charAt(0) == '<',
		    offset = offset ? offset : 0;

		var results = [],
		    re = new RegExp(pattern, 'g'),
		    dv = new DataView(ab),
		    m,
		    c,
		    l;

		while (m = re.exec(fmt)) {
			if (magic[m[2]] == undefined) throw new Error('Unknown format type');

			c = m[1] == undefined || m[1] == '' ? 1 : parseInt(m[1]);
			l = magic[m[2]].length;

			if (offset + c * l > ab.length) return;

			results = results.concat(magic[m[2]].unpack(dv, offset, c, littleendian));

			offset += c * l;
		}

		return results;
	};

	// external API
	var struct = {
		pack: pack,
		unpack: unpack,
		calcLength: determineLength,

		// jspack compatible API
		Pack: pack,
		Unpack: unpack,
		CalcLength: determineLength
	};

	// publishing to the outside world
	if (typeof module !== 'undefined' && module.exports) module.exports = struct;else this.struct = struct;
}).call(undefined);

},{}],2:[function(require,module,exports){
(function (global){
/*! http://mths.be/utf8js v2.0.0 by @mathias */
'use strict';

;(function (root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from http://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) {
					// low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from http://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) {
			// 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) {
			// 2-byte sequence
			symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);
		} else if ((codePoint & 0xFFFF0000) == 0) {
			// 3-byte sequence
			symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);
			symbol += createByte(codePoint, 6);
		} else if ((codePoint & 0xFFE00000) == 0) {
			// 4-byte sequence
			symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode(codePoint & 0x3F | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);

		// console.log(JSON.stringify(codePoints.map(function(x) {
		// 	return 'U+' + x.toString(16).toUpperCase();
		// })));

		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = (byte1 & 0x1F) << 6 | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = (byte1 & 0x0F) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.0.0',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(function () {
			return utf8;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) {
			// in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.utf8 = utf8;
	}
})(undefined);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
// import struct from '../bower_components/jspack-arraybuffer/struct.js';
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _messageJs = require('./message.js');

var _messageJs2 = _interopRequireDefault(_messageJs);

// import stringFormat from './string-format.js';
// import utf8 from '../bower_components/utf8/utf8.js';

var _unpackersJs = require('./unpackers.js');

var unpackers = _interopRequireWildcard(_unpackersJs);

var MAX_SUPPORTED_NUMBER = Number.MAX_SAFE_INTEGER > Math.pow(2, 64) - 1 ? Number.MAX_SAFE_INTEGER : Math.pow(2, 64) - 1; //eslint-disable-line

var binaryTypes = {
	'bool': '?',
	'byte': 'b',
	'ubyte': 'B',
	'char': 'c',
	'short': 'h',
	'ushort': 'H',
	'int': 'i',
	'uint': 'I',
	'int64': 'q',
	'uint64': 'Q',
	'float': 'f',
	'double': 'd',
	'string': 's'
},
    typeLookup = {};

Object.keys(binaryTypes).forEach(function (typeName) {
	typeLookup[typeName] = unpackers['unpack' + typeName.charAt(0).toUpperCase() + typeName.slice(1)];
});

typeLookup['enum'] = unpackers.unpackEnum;

var getBytesToRepresent = function getBytesToRepresent(number) {
	return Math.ceil(Math.log(number, 2) / 8);
};

var getBinaryFormatSymbol = function getBinaryFormatSymbol(number) {
	var bytesNeeded = getBytesToRepresent(number);

	if (bytesNeeded <= 1) {
		return 'B';
	} else if (bytesNeeded === 2) {
		return 'H';
	} else if (bytesNeeded <= 4) {
		return 'I';
	} else if (bytesNeeded <= 8) {
		return 'Q';
	} else {
		throw 'Unable to represent number $number in packed structure';
	}
};

var getUnpacker = function getUnpacker(number) {
	var bytesNeeded = getBytesToRepresent(number);

	if (bytesNeeded <= 1) {
		return unpackers.unpackUbyte;
	} else if (bytesNeeded === 2) {
		return unpackers.unpackUshort;
	} else if (bytesNeeded <= 4) {
		return unpackers.unpackUint;
	} else if (bytesNeeded <= 8) {
		return unpackers.unpackUint64;
	} else {
		throw 'No suitable unpacked could be found that could unpack $number';
	}
};

var MessageFactory = (function () {
	function MessageFactory(schema) {
		_classCallCheck(this, MessageFactory);

		var keys = Object.keys(schema).sort();
		this.msgClassesByName = {};
		this.msgClassesById = {};
		this.bytesNeededForId = Math.ceil(Math.log(keys.length + 1, 2) / 8);
		this.idBinaryFormat = getBinaryFormatSymbol(keys.length);
		this.idUnpacker = getUnpacker(keys.length);

		keys.forEach((function (className, index) {
			var enums = {},
			    reverseEnums = {},
			    msgkeys = Object.keys(schema[className].format).sort(),
			    msgunpackers = [];

			if (schema[className].enums) {
				for (var enumName in schema[className].enums) {
					var enumValues = schema[className].enums[enumName];
					enums[enumName] = {};
					reverseEnums[enumName] = {};
					for (var enumKey in enumValues) {
						var enumValue = enumValues[enumKey];
						enums[enumName][enumKey] = enumValue;
						reverseEnums[enumName][enumValue] = enumKey;
					}
				}
			}

			var MessageClass = function MessageClass() {
				_messageJs2['default'].call(this);
			};

			msgkeys.forEach(function (msgkey) {
				var unpacker = typeLookup[schema[className].format[msgkey]];
				if (schema[className].format[msgkey] === 'enum') {
					msgunpackers.push(unpacker.bind(MessageClass, reverseEnums[msgkey], getUnpacker(Object.keys(enums).length)));
				} else {
					msgunpackers.push(unpacker.bind(MessageClass));
				}
			});

			var properties = {
				'name': {
					value: className,
					writable: false
				},
				'binaryFormat': {
					value: this.getBinaryFormat(schema[className]),
					writable: false
				},
				'format': {
					value: schema[className].format,
					writable: false
				},
				'schema': {
					value: schema,
					writable: false
				},
				'id': {
					value: index + 1,
					writable: false
				},
				'enums': {
					value: enums,
					writable: false
				},
				'reverseEnums': {
					value: reverseEnums,
					writable: false
				},
				'length': {
					value: msgkeys.length,
					writable: false
				},
				'keys': {
					value: msgkeys,
					writable: false
				},
				'unpackers': {
					value: msgunpackers,
					writable: false
				}
			};

			// @TODO revisit if setting properties like this can be avoided
			MessageClass.prototype = Object.create(_messageJs2['default'].prototype, properties);
			Object.defineProperties(MessageClass, properties);

			this.msgClassesById[index + 1] = MessageClass;
			this.msgClassesByName[className] = MessageClass;
		}).bind(this));
	}

	_createClass(MessageFactory, [{
		key: 'getBinaryFormat',
		value: function getBinaryFormat(msgSchema) {
			var fields = Object.keys(msgSchema.format).sort();
			var binaryFormat = '!'; // we always use network (big-endian) byte order
			binaryFormat += this.idBinaryFormat;

			fields.forEach(function (field) {
				if (msgSchema.format[field] === 'string') {
					binaryFormat += 'I{}s';
				} else if (msgSchema.format[field] === 'enum') {
					try {
						binaryFormat += getBinaryFormatSymbol(Object.keys(msgSchema.format[field]).length);
					} catch (e) {
						throw 'Enum field can contain the maximum number MAX_SUPPORTED_NUMBER possible values.';
					}
				} else {
					try {
						binaryFormat += binaryTypes[msgSchema.format[field]];
					} catch (e) {
						throw 'Unknown field type msgSchema.format[field].';
					}
				}
			});

			return binaryFormat;
		}
	}, {
		key: 'getByName',
		value: function getByName(name) {
			return this.msgClassesByName[name];
		}
	}, {
		key: 'getById',
		value: function getById(id) {
			return this.msgClassesById[id];
		}
	}, {
		key: 'get',
		value: function get(idOrName) {
			if (!isNaN(parseInt(idOrName)) && isFinite(idOrName)) {
				return this.getById(idOrName);
			} else {
				return this.getByName(idOrName);
			}
		}
	}, {
		key: 'unpackMessageInDV',
		value: function unpackMessageInDV(dv, pointer, items) {
			var data = [],
			    ids = [],
			    Cls = undefined,
			    item = undefined;

			pointer = this.idUnpacker(dv, pointer, ids);
			Cls = this.getById(ids.pop());
			item = new Cls();

			for (var i = 0; i < Cls.length; i++) {
				pointer = Cls.unpackers[i](dv, pointer, data);
				item.data[Cls.keys[i]] = data[i];
			}

			items.push(item);

			return pointer;
		}
	}, {
		key: 'unpackMessage',

		// convienience method
		value: function unpackMessage(data) {
			var messages = [],
			    dv = new DataView(data);

			this.unpackMessageInDV(dv, 0, messages);

			return messages.pop();
		}
	}, {
		key: 'unpackMessages',
		value: function unpackMessages(data) {
			var messages = [],
			    dv = new DataView(data),
			    pointer = 0;

			while (pointer < data.byteLength) {
				pointer = this.unpackMessageInDV(dv, pointer, messages);
			}

			return messages;
		}
	}, {
		key: 'packMessages',
		value: function packMessages(messages) {
			var arrayBuffers = [];
			var msgLength = messages.length;
			var totalLength = 0;
			var offset = 0;

			for (var i = 0; i < msgLength; i++) {
				var _packed = messages[i].pack();
				arrayBuffers.push(_packed);
				totalLength += _packed.byteLength;
			}

			var packed = new Uint8Array(totalLength);

			for (var i = 0; i < msgLength; i++) {
				packed.set(new Uint8Array(arrayBuffers[i]), offset);
				offset += arrayBuffers[i].byteLength;
			}

			return packed.buffer;
		}
	}]);

	return MessageFactory;
})();

exports['default'] = MessageFactory;
module.exports = exports['default'];

},{"./message.js":4,"./unpackers.js":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bower_componentsJspackArraybufferStructJs = require('../bower_components/jspack-arraybuffer/struct.js');

var _bower_componentsJspackArraybufferStructJs2 = _interopRequireDefault(_bower_componentsJspackArraybufferStructJs);

var _bower_componentsUtf8Utf8Js = require('../bower_components/utf8/utf8.js');

var _bower_componentsUtf8Utf8Js2 = _interopRequireDefault(_bower_componentsUtf8Utf8Js);

var _stringFormatJs = require('./string-format.js');

var _stringFormatJs2 = _interopRequireDefault(_stringFormatJs);

function MessageBase() {
	this.data = {};
}

MessageBase.prototype.pack = function () {
	var cls = Object.getPrototypeOf(this);
	var format = cls.format;
	var binaryFormat = cls.binaryFormat;
	var keys = cls.keys;
	var stringLengths = [];
	var data = [cls.id];

	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var type = format[key];
		var value = this.data[key];
		if (type === 'enum') {
			value = cls.enums[key][value];
		} else if (type === 'string') {
			value = _bower_componentsUtf8Utf8Js2['default'].encode(value);
			data.push(value.length);
			stringLengths.push(value.length);
		}
		data.push(value);
	}
	binaryFormat = (0, _stringFormatJs2['default'])(binaryFormat, stringLengths);
	return _bower_componentsJspackArraybufferStructJs2['default'].pack(binaryFormat, data);
};

MessageBase.prototype.getBinaryLength = function () {
	var cls = Object.getPrototypeOf(this);
	var format = cls.format;
	var keys = Object.keys(format).sort();
	var binaryFormat = cls.binaryFormat;
	var stringLengths = [];

	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];

		if (format[key] === 'string') {
			stringLengths.push(this.data[key].length);
		}
	}

	binaryFormat = (0, _stringFormatJs2['default'])(binaryFormat, stringLengths);
	return _bower_componentsJspackArraybufferStructJs2['default'].calcLength(binaryFormat);
};

exports['default'] = MessageBase;
module.exports = exports['default'];

},{"../bower_components/jspack-arraybuffer/struct.js":1,"../bower_components/utf8/utf8.js":2,"./string-format.js":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function stringFormat(str, replacements) {
	var counter = 0;
	return str.replace(/\{\}/g, function () {
		return replacements[counter];
	});
}

exports["default"] = stringFormat;
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.unpackBool = unpackBool;
exports.unpackByte = unpackByte;
exports.unpackUbyte = unpackUbyte;
exports.unpackShort = unpackShort;
exports.unpackUshort = unpackUshort;
exports.unpackInt = unpackInt;
exports.unpackUint = unpackUint;
exports.unpackInt64 = unpackInt64;
exports.unpackUint64 = unpackUint64;
exports.unpackFloat = unpackFloat;
exports.unpackDouble = unpackDouble;
exports.unpackString = unpackString;
exports.unpackEnum = unpackEnum;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bower_componentsUtf8Utf8Js = require('../bower_components/utf8/utf8.js');

var _bower_componentsUtf8Utf8Js2 = _interopRequireDefault(_bower_componentsUtf8Utf8Js);

function unpackBool(dv, pointer, extracted) {
	extracted.push(dv.getUInt8(pointer) === 1);
	return pointer + 1;
}

function unpackByte(dv, pointer, extracted) {
	extracted.push(dv.getInt8(pointer));
	return pointer + 1;
}

function unpackUbyte(dv, pointer, extracted) {
	extracted.push(dv.getUint8(pointer));
	return pointer + 1;
}

function unpackShort(dv, pointer, extracted) {
	extracted.push(dv.getInt16(pointer));
	return pointer + 2;
}

function unpackUshort(dv, pointer, extracted) {
	extracted.push(dv.getUint16(pointer));
	return pointer + 2;
}

function unpackInt(dv, pointer, extracted) {
	extracted.push(dv.getInt32(pointer));
	return pointer + 4;
}

function unpackUint(dv, pointer, extracted) {
	extracted.push(dv.getUint32(pointer));
	return pointer + 4;
}

function unpackInt64(dv, pointer, extracted) {
	extracted.push(dv.getInt64(pointer));
	return pointer + 8;
}

function unpackUint64(dv, pointer, extracted) {
	extracted.push(dv.getUint64(pointer));
	return pointer + 8;
}

function unpackFloat(dv, pointer, extracted) {
	extracted.push(dv.getFloat32(pointer));
	return pointer + 4;
}

function unpackDouble(dv, pointer, extracted) {
	extracted.push(dv.getFloat64(pointer));
	return pointer + 8;
}

function unpackString(dv, pointer, extracted) {
	var stringLength = dv.getUint32(pointer),
	    values = [],
	    i;

	pointer += 4;

	for (i = 0; i < stringLength; i++) {
		values.push(dv.getUint8(pointer + i));
	}

	extracted.push(_bower_componentsUtf8Utf8Js2['default'].decode(String.fromCharCode.apply(null, values)));
	return pointer + stringLength;
}

function unpackEnum(reverseEnums, unpacker, dv, pointer, extracted) {
	var rawExtracted = [];
	pointer = unpacker(dv, pointer, rawExtracted);
	extracted.push(reverseEnums[rawExtracted.pop()]);
	return pointer;
}

},{"../bower_components/utf8/utf8.js":2}],7:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jsMessageFactoryJs = require('./js/message-factory.js');

var _jsMessageFactoryJs2 = _interopRequireDefault(_jsMessageFactoryJs);

module.exports = _jsMessageFactoryJs2['default'];

},{"./js/message-factory.js":3}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL2pzcGFjay1hcnJheWJ1ZmZlci9zdHJ1Y3QuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9qcy9zdHJpbmctZm9ybWF0LmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvanMvdW5wYWNrZXJzLmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxZQUNEOzs7QUFHQSxLQUFJLE1BQU0sR0FBRztBQUNaLE1BQUksRUFBRSxjQUFTLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUN6RDtBQUNDLE9BQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUN4QixLQUFLLEdBQUcsQ0FBRSxLQUFLLENBQUUsQ0FBQzs7QUFFbkIsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0dBQ2hEO0FBQ0QsUUFBTSxFQUFFLGdC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QUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0tBQ3ZDLE1BQU0sR0FBRyxFQUFFO0tBQ1gsQ0FBQyxDQUFDOztBQUVILFFBQU8sSUFBSSxDQUFDLENBQUM7O0FBRWIsTUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDakMsUUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RDOztBQUVELFVBQVMsQ0FBQyxJQUFJLENBQUMsd0NBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsUUFBTyxPQUFPLEdBQUcsWUFBWSxDQUFDO0NBQzlCOztBQUVNLFNBQVMsVUFBVSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUU7QUFDMUUsS0FBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQU8sR0FBRyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUM5QyxVQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELFFBQU8sT0FBTyxDQUFDO0NBQ2Y7Ozs7Ozs7a0NDN0UwQix5QkFBeUI7Ozs7QUFFcEQsTUFBTSxDQUFDLE9BQU8sa0NBQWlCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKClcbntcblxuLy8gdXRpbGl0eSBwYWNrIGFuZCB1bnBhY2sgZnVuY3Rpb25zIHRvIHNpbXBsaWZ5IG1hZ2ljXG52YXIgY29tbW9uID0ge1xuXHRwYWNrOiBmdW5jdGlvbihtZXRob2QsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKVxuXHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdGR2W21ldGhvZF0ob2Zmc2V0ICsgaSwgdmFsdWVbaV0sIGxpdHRsZWVuZGlhbik7XG5cdH0sXG5cdHVucGFjazogZnVuY3Rpb24obWV0aG9kLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdHtcblx0XHR2YXIgciA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0ci5wdXNoKGR2W21ldGhvZF0ob2Zmc2V0ICsgaSwgbGl0dGxlZW5kaWFuKSk7XG5cblx0XHRyZXR1cm4gcjtcblx0fVxufTtcblxuLy8gcGFjayBhbmQgdW5wYWNraW5nIGZvciBkaWZmZXJlbnQgdHlwZXNcbnZhciBtYWdpYyA9IHtcblx0Ly8gYnl0ZSBhcnJheVxuXHRBIDoge1xuXHRcdGxlbmd0aDogMSxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRJbnQ4JywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0SW50OCcsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyBwYWRkaW5nIGJ5dGVcblx0eCA6IHtcblx0XHRsZW5ndGg6IDEsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdFx0ZHYuc2V0VWludDgob2Zmc2V0ICsgaSwgMCk7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHR2YXIgciA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHRcdHIucHVzaCgwKTtcblxuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fVxuXHR9LFxuXHQvLyBjaGFyXG5cdGMgOiB7XG5cdFx0bGVuZ3RoOiAxLFxuXHRcdHBhY2s6IGZ1bmN0aW9uKG1ldGhvZCwgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKVxuXHRcdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdFx0ZHYuc2V0VWludDgob2Zmc2V0ICsgaSwgdmFsdWVbaV0uY2hhckNvZGVBdCgwKSk7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKG1ldGhvZCwgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHZhciByID0gW107XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdFx0ci5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoZHYuZ2V0VWludDgob2Zmc2V0ICsgaSkpKTtcblx0XG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9XG5cdH0sXG5cdC8vIHNpZ25lZCBjaGFyXG5cdGIgOiB7XG5cdFx0bGVuZ3RoOiAxLFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldEludDgnLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRJbnQ4JywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIHVuc2lnbmVkIGNoYXJcblx0QiA6IHtcblx0XHRsZW5ndGg6IDEsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0VWludDgnLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRVaW50OCcsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyBzaWduZWQgc2hvcnRcblx0aCA6IHtcblx0XHRsZW5ndGg6IDIsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0SW50MTYnLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRJbnQxNicsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyB1bnNpZ25lZCBzaG9ydFxuXHRIIDoge1xuXHRcdGxlbmd0aDogMixcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRVaW50MTYnLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRVaW50MTYnLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gc2lnbmVkIGxvbmcgXG5cdGkgOiB7XG5cdFx0bGVuZ3RoOiA0LFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldEludDMyJywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0SW50MzInLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gdW5zaWduZWQgbG9uZ1xuXHRJIDoge1xuXHRcdGxlbmd0aDogNCxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRVaW50MzInLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRVaW50MzInLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0bCA6IHtcblx0XHRsZW5ndGg6IDQsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0SW50MzInLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRJbnQzMicsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyB1bnNpZ25lZCBsb25nXG5cdEwgOiB7XG5cdFx0bGVuZ3RoOiA0LFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldFVpbnQzMicsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldFVpbnQzMicsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyBjaGFyW11cblx0cyA6IHtcblx0XHRsZW5ndGg6IDEsIFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0dmFyIHZhbCA9IG5ldyBTdHJpbmcodmFsdWVbMF0pO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGNvZGUgPSAwO1xuXG5cdFx0XHRcdGlmIChpIDwgdmFsLmxlbmd0aClcblx0XHRcdFx0XHRjb2RlID0gdmFsLmNoYXJDb2RlQXQoaSk7XG5cblx0XHRcdFx0ZHYuc2V0VWludDgob2Zmc2V0ICsgaSwgY29kZSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHZhciByID0gW107XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdFx0ci5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoZHYuZ2V0VWludDgob2Zmc2V0ICsgaSkpKTtcblxuXHRcdFx0cmV0dXJuIFsgci5qb2luKCcnKSBdO1xuXHRcdH1cblx0fSxcblx0Ly8gZmxvYXQgXG5cdGYgOiB7XG5cdFx0bGVuZ3RoOiA0LFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldEZsb2F0MzInLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRGbG9hdDMyJywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIGRvdWJsZVxuXHRkIDoge1xuXHRcdGxlbmd0aDogOCxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRGbG9hdDY0JywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0RmxvYXQ2NCcsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9XG59O1xuXG4vLyBwYXR0ZXJuIG9mIHN0dWZmIHdlJ3JlIGxvb2tpbmcgZm9yXG52YXIgcGF0dGVybiA9ICcoXFxcXGQrKT8oW0F4Y2JCaEhzZmRpSWxMXSknO1xuXG4vLyBkZXRlcm1pbmUgdGhlIHNpemUgb2YgYXJyYXlidWZmZXIgd2UnZCBuZWVkXG52YXIgZGV0ZXJtaW5lTGVuZ3RoID0gZnVuY3Rpb24gKGZtdClcbntcblx0dmFyIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpLCBtLCBzdW0gPSAwO1xuXG5cdHdoaWxlIChtID0gcmUuZXhlYyhmbXQpKVxuXHRcdHN1bSArPSAoKChtWzFdID09IHVuZGVmaW5lZCkgfHwgKG1bMV0gPT0gJycpKSA/IDEgOiBwYXJzZUludChtWzFdKSkgKiBtYWdpY1ttWzJdXS5sZW5ndGg7XG5cblx0cmV0dXJuIHN1bTtcbn07XG5cbi8vIHBhY2sgYSBzZXQgb2YgdmFsdWVzLCBzdGFydGluZyBhdCBvZmZzZXQsIGJhc2VkIG9uIGZvcm1hdFxudmFyIHBhY2sgPSBmdW5jdGlvbihmbXQsIHZhbHVlcywgb2Zmc2V0KVxue1xuXHR2YXIgbGl0dGxlZW5kaWFuID0gKGZtdC5jaGFyQXQoMCkgPT0gJzwnKTtcblx0b2Zmc2V0ID0gb2Zmc2V0ID8gb2Zmc2V0IDogMDtcblxuXHR2YXIgYWIgPSBuZXcgQXJyYXlCdWZmZXIoZGV0ZXJtaW5lTGVuZ3RoKGZtdCkpLFxuXHRcdGR2ID0gbmV3IERhdGFWaWV3KGFiKSxcblx0XHRyZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKSxcblx0XHRtLCBjLCBsLCBpID0gMDtcblxuXHR3aGlsZSAobSA9IHJlLmV4ZWMoZm10KSlcblx0e1xuXHRcdGlmIChtYWdpY1ttWzJdXSA9PSB1bmRlZmluZWQpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZm9ybWF0IHR5cGUnKTtcblx0XHRcblx0XHRjID0gKChtWzFdPT11bmRlZmluZWQpIHx8IChtWzFdPT0nJykpID8gMSA6IHBhcnNlSW50KG1bMV0pO1xuXHRcdGwgPSBtYWdpY1ttWzJdXS5sZW5ndGg7XG5cblx0XHRpZiAoKG9mZnNldCArIChjICogbCkpID4gYWIubGVuZ3RoKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dmFyIHZhbHVlID0gdmFsdWVzLnNsaWNlKGksIGkgKyAxKTtcblxuXHRcdG1hZ2ljW21bMl1dLnBhY2soZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cblx0XHRvZmZzZXQgKz0gYyAqIGw7XG5cdFx0aSArPSAxO1xuXHR9XG5cblx0cmV0dXJuIGFiO1xufTtcblxuLy8gdW5wYWNrIGFuIGFycmF5YnVmZmVyLCBzdGFydGluZyBhdCBvZmZzZXQsIGJhc2VkIG9uIGZvcm1hdFxuLy8gcmV0dXJucyBhbiBhcnJheVxudmFyIHVucGFjayA9IGZ1bmN0aW9uKGZtdCwgYWIsIG9mZnNldClcbntcblx0dmFyIGxpdHRsZWVuZGlhbiA9IChmbXQuY2hhckF0KDApID09ICc8JyksXG5cdFx0b2Zmc2V0ID0gb2Zmc2V0ID8gb2Zmc2V0IDogMDtcblxuXHR2YXIgcmVzdWx0cyA9IFtdLFxuXHRcdHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpLFxuXHRcdGR2ID0gbmV3IERhdGFWaWV3KGFiKSxcblx0XHRtLCBjLCBsO1xuXG5cdHdoaWxlIChtID0gcmUuZXhlYyhmbXQpKVxuXHR7XG5cdFx0aWYgKG1hZ2ljW21bMl1dID09IHVuZGVmaW5lZClcblx0XHRcdHRocm93IG5ldyBFcnJvcignVW5rbm93biBmb3JtYXQgdHlwZScpO1xuXHRcdFxuXHRcdGMgPSAoKG1bMV0gPT0gdW5kZWZpbmVkKSB8fCAobVsxXSA9PSAnJykpID8gMSA6IHBhcnNlSW50KG1bMV0pO1xuXHRcdGwgPSBtYWdpY1ttWzJdXS5sZW5ndGg7XG5cblx0XHRpZiAoKG9mZnNldCArIChjICogbCkpID4gYWIubGVuZ3RoKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KG1hZ2ljW21bMl1dLnVucGFjayhkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pKTtcblxuXHRcdG9mZnNldCArPSBjICogbDtcblx0fVxuXG5cdHJldHVybiByZXN1bHRzO1xufTtcblxuLy8gZXh0ZXJuYWwgQVBJXG52YXIgc3RydWN0ID0ge1xuXHRwYWNrOiBwYWNrLFxuXHR1bnBhY2s6IHVucGFjayxcblx0Y2FsY0xlbmd0aDogZGV0ZXJtaW5lTGVuZ3RoLFxuXG5cdC8vIGpzcGFjayBjb21wYXRpYmxlIEFQSVxuXHRQYWNrOiBwYWNrLFxuXHRVbnBhY2s6IHVucGFjayxcblx0Q2FsY0xlbmd0aDogZGV0ZXJtaW5lTGVuZ3RoXG59O1xuXG4vLyBwdWJsaXNoaW5nIHRvIHRoZSBvdXRzaWRlIHdvcmxkXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpXG5cdG1vZHVsZS5leHBvcnRzID0gc3RydWN0O1xuZWxzZVxuXHR0aGlzLnN0cnVjdCA9IHN0cnVjdDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIi8qISBodHRwOi8vbXRocy5iZS91dGY4anMgdjIuMC4wIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWBcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLFxuXHQvLyBhbmQgdXNlIGl0IGFzIGByb290YFxuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5cdC8vIFRha2VuIGZyb20gaHR0cDovL210aHMuYmUvcHVueWNvZGVcblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW107XG5cdFx0dmFyIGNvdW50ZXIgPSAwO1xuXHRcdHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuXHRcdHZhciB2YWx1ZTtcblx0XHR2YXIgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0Ly8gVGFrZW4gZnJvbSBodHRwOi8vbXRocy5iZS9wdW55Y29kZVxuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgaW5kZXggPSAtMTtcblx0XHR2YXIgdmFsdWU7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IGFycmF5W2luZGV4XTtcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHRmdW5jdGlvbiBjcmVhdGVCeXRlKGNvZGVQb2ludCwgc2hpZnQpIHtcblx0XHRyZXR1cm4gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IHNoaWZ0KSAmIDB4M0YpIHwgMHg4MCk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbmNvZGVDb2RlUG9pbnQoY29kZVBvaW50KSB7XG5cdFx0aWYgKChjb2RlUG9pbnQgJiAweEZGRkZGRjgwKSA9PSAwKSB7IC8vIDEtYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0cmV0dXJuIHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQpO1xuXHRcdH1cblx0XHR2YXIgc3ltYm9sID0gJyc7XG5cdFx0aWYgKChjb2RlUG9pbnQgJiAweEZGRkZGODAwKSA9PSAwKSB7IC8vIDItYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0c3ltYm9sID0gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IDYpICYgMHgxRikgfCAweEMwKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoKGNvZGVQb2ludCAmIDB4RkZGRjAwMDApID09IDApIHsgLy8gMy1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gMTIpICYgMHgwRikgfCAweEUwKTtcblx0XHRcdHN5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwgNik7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKChjb2RlUG9pbnQgJiAweEZGRTAwMDAwKSA9PSAwKSB7IC8vIDQtYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0c3ltYm9sID0gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IDE4KSAmIDB4MDcpIHwgMHhGMCk7XG5cdFx0XHRzeW1ib2wgKz0gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIDEyKTtcblx0XHRcdHN5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwgNik7XG5cdFx0fVxuXHRcdHN5bWJvbCArPSBzdHJpbmdGcm9tQ2hhckNvZGUoKGNvZGVQb2ludCAmIDB4M0YpIHwgMHg4MCk7XG5cdFx0cmV0dXJuIHN5bWJvbDtcblx0fVxuXG5cdGZ1bmN0aW9uIHV0ZjhlbmNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIGNvZGVQb2ludHMgPSB1Y3MyZGVjb2RlKHN0cmluZyk7XG5cblx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShjb2RlUG9pbnRzLm1hcChmdW5jdGlvbih4KSB7XG5cdFx0Ly8gXHRyZXR1cm4gJ1UrJyArIHgudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdFx0Ly8gfSkpKTtcblxuXHRcdHZhciBsZW5ndGggPSBjb2RlUG9pbnRzLmxlbmd0aDtcblx0XHR2YXIgaW5kZXggPSAtMTtcblx0XHR2YXIgY29kZVBvaW50O1xuXHRcdHZhciBieXRlU3RyaW5nID0gJyc7XG5cdFx0d2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0XHRcdGNvZGVQb2ludCA9IGNvZGVQb2ludHNbaW5kZXhdO1xuXHRcdFx0Ynl0ZVN0cmluZyArPSBlbmNvZGVDb2RlUG9pbnQoY29kZVBvaW50KTtcblx0XHR9XG5cdFx0cmV0dXJuIGJ5dGVTdHJpbmc7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHRmdW5jdGlvbiByZWFkQ29udGludWF0aW9uQnl0ZSgpIHtcblx0XHRpZiAoYnl0ZUluZGV4ID49IGJ5dGVDb3VudCkge1xuXHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgYnl0ZSBpbmRleCcpO1xuXHRcdH1cblxuXHRcdHZhciBjb250aW51YXRpb25CeXRlID0gYnl0ZUFycmF5W2J5dGVJbmRleF0gJiAweEZGO1xuXHRcdGJ5dGVJbmRleCsrO1xuXG5cdFx0aWYgKChjb250aW51YXRpb25CeXRlICYgMHhDMCkgPT0gMHg4MCkge1xuXHRcdFx0cmV0dXJuIGNvbnRpbnVhdGlvbkJ5dGUgJiAweDNGO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGVuZCB1cCBoZXJlLCBpdOKAmXMgbm90IGEgY29udGludWF0aW9uIGJ5dGVcblx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVjb2RlU3ltYm9sKCkge1xuXHRcdHZhciBieXRlMTtcblx0XHR2YXIgYnl0ZTI7XG5cdFx0dmFyIGJ5dGUzO1xuXHRcdHZhciBieXRlNDtcblx0XHR2YXIgY29kZVBvaW50O1xuXG5cdFx0aWYgKGJ5dGVJbmRleCA+IGJ5dGVDb3VudCkge1xuXHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgYnl0ZSBpbmRleCcpO1xuXHRcdH1cblxuXHRcdGlmIChieXRlSW5kZXggPT0gYnl0ZUNvdW50KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gUmVhZCBmaXJzdCBieXRlXG5cdFx0Ynl0ZTEgPSBieXRlQXJyYXlbYnl0ZUluZGV4XSAmIDB4RkY7XG5cdFx0Ynl0ZUluZGV4Kys7XG5cblx0XHQvLyAxLWJ5dGUgc2VxdWVuY2UgKG5vIGNvbnRpbnVhdGlvbiBieXRlcylcblx0XHRpZiAoKGJ5dGUxICYgMHg4MCkgPT0gMCkge1xuXHRcdFx0cmV0dXJuIGJ5dGUxO1xuXHRcdH1cblxuXHRcdC8vIDItYnl0ZSBzZXF1ZW5jZVxuXHRcdGlmICgoYnl0ZTEgJiAweEUwKSA9PSAweEMwKSB7XG5cdFx0XHR2YXIgYnl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MUYpIDw8IDYpIHwgYnl0ZTI7XG5cdFx0XHRpZiAoY29kZVBvaW50ID49IDB4ODApIHtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gMy1ieXRlIHNlcXVlbmNlIChtYXkgaW5jbHVkZSB1bnBhaXJlZCBzdXJyb2dhdGVzKVxuXHRcdGlmICgoYnl0ZTEgJiAweEYwKSA9PSAweEUwKSB7XG5cdFx0XHRieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRieXRlMyA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRjb2RlUG9pbnQgPSAoKGJ5dGUxICYgMHgwRikgPDwgMTIpIHwgKGJ5dGUyIDw8IDYpIHwgYnl0ZTM7XG5cdFx0XHRpZiAoY29kZVBvaW50ID49IDB4MDgwMCkge1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyA0LWJ5dGUgc2VxdWVuY2Vcblx0XHRpZiAoKGJ5dGUxICYgMHhGOCkgPT0gMHhGMCkge1xuXHRcdFx0Ynl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTQgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MEYpIDw8IDB4MTIpIHwgKGJ5dGUyIDw8IDB4MEMpIHxcblx0XHRcdFx0KGJ5dGUzIDw8IDB4MDYpIHwgYnl0ZTQ7XG5cdFx0XHRpZiAoY29kZVBvaW50ID49IDB4MDEwMDAwICYmIGNvZGVQb2ludCA8PSAweDEwRkZGRikge1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRocm93IEVycm9yKCdJbnZhbGlkIFVURi04IGRldGVjdGVkJyk7XG5cdH1cblxuXHR2YXIgYnl0ZUFycmF5O1xuXHR2YXIgYnl0ZUNvdW50O1xuXHR2YXIgYnl0ZUluZGV4O1xuXHRmdW5jdGlvbiB1dGY4ZGVjb2RlKGJ5dGVTdHJpbmcpIHtcblx0XHRieXRlQXJyYXkgPSB1Y3MyZGVjb2RlKGJ5dGVTdHJpbmcpO1xuXHRcdGJ5dGVDb3VudCA9IGJ5dGVBcnJheS5sZW5ndGg7XG5cdFx0Ynl0ZUluZGV4ID0gMDtcblx0XHR2YXIgY29kZVBvaW50cyA9IFtdO1xuXHRcdHZhciB0bXA7XG5cdFx0d2hpbGUgKCh0bXAgPSBkZWNvZGVTeW1ib2woKSkgIT09IGZhbHNlKSB7XG5cdFx0XHRjb2RlUG9pbnRzLnB1c2godG1wKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVjczJlbmNvZGUoY29kZVBvaW50cyk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgdXRmOCA9IHtcblx0XHQndmVyc2lvbic6ICcyLjAuMCcsXG5cdFx0J2VuY29kZSc6IHV0ZjhlbmNvZGUsXG5cdFx0J2RlY29kZSc6IHV0ZjhkZWNvZGVcblx0fTtcblxuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB1dGY4O1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gdXRmODtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0dmFyIG9iamVjdCA9IHt9O1xuXHRcdFx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0Lmhhc093blByb3BlcnR5O1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHV0ZjgpIHtcblx0XHRcdFx0aGFzT3duUHJvcGVydHkuY2FsbCh1dGY4LCBrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gdXRmOFtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnV0ZjggPSB1dGY4O1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gaW1wb3J0IHN0cnVjdCBmcm9tICcuLi9ib3dlcl9jb21wb25lbnRzL2pzcGFjay1hcnJheWJ1ZmZlci9zdHJ1Y3QuanMnO1xuaW1wb3J0IE1lc3NhZ2VCYXNlIGZyb20gJy4vbWVzc2FnZS5qcyc7XG4vLyBpbXBvcnQgc3RyaW5nRm9ybWF0IGZyb20gJy4vc3RyaW5nLWZvcm1hdC5qcyc7XG4vLyBpbXBvcnQgdXRmOCBmcm9tICcuLi9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyc7XG5pbXBvcnQgKiBhcyB1bnBhY2tlcnMgZnJvbSAnLi91bnBhY2tlcnMuanMnO1xuXG5jb25zdCBNQVhfU1VQUE9SVEVEX05VTUJFUiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSID4gTWF0aC5wb3coMiwgNjQpIC0gMSA/IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIDogTWF0aC5wb3coMiwgNjQpIC0gMTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG5cbmxldCBiaW5hcnlUeXBlcyA9IHtcblx0J2Jvb2wnOiAnPycsXG5cdCdieXRlJzogJ2InLFxuXHQndWJ5dGUnOiAnQicsXG5cdCdjaGFyJzogJ2MnLFxuXHQnc2hvcnQnOiAnaCcsXG5cdCd1c2hvcnQnOiAnSCcsXG5cdCdpbnQnOiAnaScsXG5cdCd1aW50JzogJ0knLFxuXHQnaW50NjQnOiAncScsXG5cdCd1aW50NjQnOiAnUScsXG5cdCdmbG9hdCc6ICdmJyxcblx0J2RvdWJsZSc6ICdkJyxcblx0J3N0cmluZyc6ICdzJ1xufSwgdHlwZUxvb2t1cCA9IHt9O1xuXG5PYmplY3Qua2V5cyhiaW5hcnlUeXBlcykuZm9yRWFjaChmdW5jdGlvbih0eXBlTmFtZSkge1xuXHR0eXBlTG9va3VwW3R5cGVOYW1lXSA9IHVucGFja2Vyc1sndW5wYWNrJyArIHR5cGVOYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHlwZU5hbWUuc2xpY2UoMSldO1xufSk7XG5cbnR5cGVMb29rdXAuZW51bSA9IHVucGFja2Vycy51bnBhY2tFbnVtO1xuXG5sZXQgZ2V0Qnl0ZXNUb1JlcHJlc2VudCA9IGZ1bmN0aW9uKG51bWJlcikge1xuXHRyZXR1cm4gTWF0aC5jZWlsKE1hdGgubG9nKG51bWJlciwgMikgLyA4KTtcbn1cblxubGV0IGdldEJpbmFyeUZvcm1hdFN5bWJvbCA9IGZ1bmN0aW9uKG51bWJlcikge1xuXHRsZXQgYnl0ZXNOZWVkZWQgPSBnZXRCeXRlc1RvUmVwcmVzZW50KG51bWJlcik7XG5cblx0aWYoYnl0ZXNOZWVkZWQgPD0gMSkge1xuXHRcdHJldHVybiAnQic7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA9PT0gMikge1xuXHRcdHJldHVybiAnSCc7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA0KSB7XG5cdFx0cmV0dXJuICdJJztcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDgpIHtcblx0XHRyZXR1cm4gJ1EnO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IGBVbmFibGUgdG8gcmVwcmVzZW50IG51bWJlciAkbnVtYmVyIGluIHBhY2tlZCBzdHJ1Y3R1cmVgO1xuXHR9XG59O1xuXG5sZXQgZ2V0VW5wYWNrZXIgPSBmdW5jdGlvbihudW1iZXIpIHtcblx0bGV0IGJ5dGVzTmVlZGVkID0gZ2V0Qnl0ZXNUb1JlcHJlc2VudChudW1iZXIpO1xuXG5cdGlmKGJ5dGVzTmVlZGVkIDw9IDEpIHtcblx0XHRyZXR1cm4gdW5wYWNrZXJzLnVucGFja1VieXRlO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPT09IDIpIHtcblx0XHRyZXR1cm4gdW5wYWNrZXJzLnVucGFja1VzaG9ydDtcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDQpIHtcblx0XHRyZXR1cm4gdW5wYWNrZXJzLnVucGFja1VpbnQ7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA4KSB7XG5cdFx0cmV0dXJuIHVucGFja2Vycy51bnBhY2tVaW50NjQ7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgYE5vIHN1aXRhYmxlIHVucGFja2VkIGNvdWxkIGJlIGZvdW5kIHRoYXQgY291bGQgdW5wYWNrICRudW1iZXJgO1xuXHR9XG59O1xuXG5jbGFzcyBNZXNzYWdlRmFjdG9yeSB7XG5cdGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuXHRcdGxldCBrZXlzID0gT2JqZWN0LmtleXMoc2NoZW1hKS5zb3J0KCk7XG5cdFx0dGhpcy5tc2dDbGFzc2VzQnlOYW1lID0ge307XG5cdFx0dGhpcy5tc2dDbGFzc2VzQnlJZCA9IHt9O1xuXHRcdHRoaXMuYnl0ZXNOZWVkZWRGb3JJZCA9IE1hdGguY2VpbChNYXRoLmxvZyhrZXlzLmxlbmd0aCArIDEsIDIpIC8gOCk7XG5cdFx0dGhpcy5pZEJpbmFyeUZvcm1hdCA9IGdldEJpbmFyeUZvcm1hdFN5bWJvbChrZXlzLmxlbmd0aCk7XG5cdFx0dGhpcy5pZFVucGFja2VyID0gZ2V0VW5wYWNrZXIoa2V5cy5sZW5ndGgpO1xuXG5cdFx0a2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGNsYXNzTmFtZSwgaW5kZXgpIHtcblx0XHRcdHZhciBlbnVtcyA9IHt9LFxuXHRcdFx0XHRyZXZlcnNlRW51bXMgPSB7fSxcblx0XHRcdFx0bXNna2V5cyA9IE9iamVjdC5rZXlzKHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdCkuc29ydCgpLFxuXHRcdFx0XHRtc2d1bnBhY2tlcnMgPSBbXTtcblxuXG5cdFx0XHRpZihzY2hlbWFbY2xhc3NOYW1lXS5lbnVtcykge1xuXHRcdFx0XHRmb3IobGV0IGVudW1OYW1lIGluIHNjaGVtYVtjbGFzc05hbWVdLmVudW1zKSB7XG5cdFx0XHRcdFx0bGV0IGVudW1WYWx1ZXMgPSBzY2hlbWFbY2xhc3NOYW1lXS5lbnVtc1tlbnVtTmFtZV07XG5cdFx0XHRcdFx0ZW51bXNbZW51bU5hbWVdID0ge307XG5cdFx0XHRcdFx0cmV2ZXJzZUVudW1zW2VudW1OYW1lXSA9IHt9O1xuXHRcdFx0XHRcdGZvcihsZXQgZW51bUtleSBpbiBlbnVtVmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRsZXQgZW51bVZhbHVlID0gZW51bVZhbHVlc1tlbnVtS2V5XTtcblx0XHRcdFx0XHRcdGVudW1zW2VudW1OYW1lXVtlbnVtS2V5XSA9IGVudW1WYWx1ZTtcblx0XHRcdFx0XHRcdHJldmVyc2VFbnVtc1tlbnVtTmFtZV1bZW51bVZhbHVlXSA9IGVudW1LZXk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBNZXNzYWdlQ2xhc3MgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0TWVzc2FnZUJhc2UuY2FsbCh0aGlzKTtcblx0XHRcdH07XG5cblx0XHRcdG1zZ2tleXMuZm9yRWFjaChmdW5jdGlvbihtc2drZXkpIHtcblx0XHRcdFx0dmFyIHVucGFja2VyID0gdHlwZUxvb2t1cFtzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XV07XG5cdFx0XHRcdGlmKHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdFttc2drZXldID09PSAnZW51bScpIHtcblx0XHRcdFx0XHRtc2d1bnBhY2tlcnMucHVzaCh1bnBhY2tlci5iaW5kKE1lc3NhZ2VDbGFzcywgcmV2ZXJzZUVudW1zW21zZ2tleV0sIGdldFVucGFja2VyKE9iamVjdC5rZXlzKGVudW1zKS5sZW5ndGgpKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bXNndW5wYWNrZXJzLnB1c2godW5wYWNrZXIuYmluZChNZXNzYWdlQ2xhc3MpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBwcm9wZXJ0aWVzID0ge1xuXHRcdFx0XHQnbmFtZSc6IHtcblx0XHRcdFx0XHR2YWx1ZTogY2xhc3NOYW1lLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnYmluYXJ5Rm9ybWF0Jzoge1xuXHRcdFx0XHRcdHZhbHVlOiB0aGlzLmdldEJpbmFyeUZvcm1hdChzY2hlbWFbY2xhc3NOYW1lXSksXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdmb3JtYXQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3NjaGVtYSc6IHtcblx0XHRcdFx0XHR2YWx1ZTogc2NoZW1hLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnaWQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IGluZGV4ICsgMSxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2VudW1zJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBlbnVtcyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3JldmVyc2VFbnVtcyc6IHtcblx0XHRcdFx0XHR2YWx1ZTogcmV2ZXJzZUVudW1zLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnbGVuZ3RoJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBtc2drZXlzLmxlbmd0aCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2tleXMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ2tleXMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCd1bnBhY2tlcnMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ3VucGFja2Vycyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gQFRPRE8gcmV2aXNpdCBpZiBzZXR0aW5nIHByb3BlcnRpZXMgbGlrZSB0aGlzIGNhbiBiZSBhdm9pZGVkXG5cdFx0XHRNZXNzYWdlQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNZXNzYWdlQmFzZS5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTWVzc2FnZUNsYXNzLCBwcm9wZXJ0aWVzKTtcblxuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlJZFtpbmRleCArIDFdID0gTWVzc2FnZUNsYXNzO1xuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlOYW1lW2NsYXNzTmFtZV0gPSBNZXNzYWdlQ2xhc3M7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdGdldEJpbmFyeUZvcm1hdChtc2dTY2hlbWEpIHtcblx0XHRsZXQgZmllbGRzID0gT2JqZWN0LmtleXMobXNnU2NoZW1hLmZvcm1hdCkuc29ydCgpO1xuXHRcdGxldCBiaW5hcnlGb3JtYXQgPSAnISc7ICAvLyB3ZSBhbHdheXMgdXNlIG5ldHdvcmsgKGJpZy1lbmRpYW4pIGJ5dGUgb3JkZXJcblx0XHRiaW5hcnlGb3JtYXQgKz0gdGhpcy5pZEJpbmFyeUZvcm1hdDtcblxuXHRcdGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XG5cdFx0XHRpZihtc2dTY2hlbWEuZm9ybWF0W2ZpZWxkXSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0YmluYXJ5Rm9ybWF0ICs9ICdJe31zJztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYobXNnU2NoZW1hLmZvcm1hdFtmaWVsZF0gPT09ICdlbnVtJykge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGJpbmFyeUZvcm1hdCArPSBnZXRCaW5hcnlGb3JtYXRTeW1ib2woT2JqZWN0LmtleXMobXNnU2NoZW1hLmZvcm1hdFtmaWVsZF0pLmxlbmd0aCk7XG5cdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdHRocm93IGBFbnVtIGZpZWxkIGNhbiBjb250YWluIHRoZSBtYXhpbXVtIG51bWJlciBNQVhfU1VQUE9SVEVEX05VTUJFUiBwb3NzaWJsZSB2YWx1ZXMuYDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRiaW5hcnlGb3JtYXQgKz0gYmluYXJ5VHlwZXNbbXNnU2NoZW1hLmZvcm1hdFtmaWVsZF1dO1xuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHR0aHJvdyBgVW5rbm93biBmaWVsZCB0eXBlIG1zZ1NjaGVtYS5mb3JtYXRbZmllbGRdLmA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBiaW5hcnlGb3JtYXQ7XG5cdH1cblxuXHRnZXRCeU5hbWUobmFtZSkge1xuXHRcdHJldHVybiB0aGlzLm1zZ0NsYXNzZXNCeU5hbWVbbmFtZV07XG5cdH1cblxuXHRnZXRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMubXNnQ2xhc3Nlc0J5SWRbaWRdO1xuXHR9XG5cblx0Z2V0KGlkT3JOYW1lKSB7XG5cdFx0aWYoIWlzTmFOKHBhcnNlSW50KGlkT3JOYW1lKSkgJiYgaXNGaW5pdGUoaWRPck5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRCeUlkKGlkT3JOYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QnlOYW1lKGlkT3JOYW1lKTtcblx0XHR9XG5cdH1cblxuXHR1bnBhY2tNZXNzYWdlSW5EVihkdiwgcG9pbnRlciwgaXRlbXMpIHtcblx0XHRsZXQgZGF0YSA9IFtdLFxuXHRcdFx0aWRzID0gW10sXG5cdFx0XHRDbHMsIGl0ZW07XG5cblx0XHRwb2ludGVyID0gdGhpcy5pZFVucGFja2VyKGR2LCBwb2ludGVyLCBpZHMpO1xuXHRcdENscyA9IHRoaXMuZ2V0QnlJZChpZHMucG9wKCkpO1xuXHRcdGl0ZW0gPSBuZXcgQ2xzKCk7XG5cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgQ2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwb2ludGVyID0gQ2xzLnVucGFja2Vyc1tpXShkdiwgcG9pbnRlciwgZGF0YSk7XG5cdFx0XHRpdGVtLmRhdGFbQ2xzLmtleXNbaV1dID0gZGF0YVtpXTtcblx0XHR9XG5cblx0XHRpdGVtcy5wdXNoKGl0ZW0pO1xuXG5cdFx0cmV0dXJuIHBvaW50ZXI7XG5cdH1cblxuXHQvLyBjb252aWVuaWVuY2UgbWV0aG9kXG5cdHVucGFja01lc3NhZ2UoZGF0YSkge1xuXHRcdGxldCBtZXNzYWdlcyA9IFtdLFxuXHRcdFx0ZHYgPSBuZXcgRGF0YVZpZXcoZGF0YSk7XG5cblx0XHR0aGlzLnVucGFja01lc3NhZ2VJbkRWKGR2LCAwLCBtZXNzYWdlcyk7XG5cblx0XHRyZXR1cm4gbWVzc2FnZXMucG9wKCk7XG5cdH1cblxuXHR1bnBhY2tNZXNzYWdlcyhkYXRhKSB7XG5cdFx0bGV0IG1lc3NhZ2VzID0gW10sXG5cdFx0XHRkdiA9IG5ldyBEYXRhVmlldyhkYXRhKSxcblx0XHRcdHBvaW50ZXIgPSAwO1xuXG5cdFx0d2hpbGUocG9pbnRlciA8IGRhdGEuYnl0ZUxlbmd0aCkge1xuXHRcdFx0cG9pbnRlciA9IHRoaXMudW5wYWNrTWVzc2FnZUluRFYoZHYsIHBvaW50ZXIsIG1lc3NhZ2VzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWVzc2FnZXM7XG5cdH1cblxuXHRwYWNrTWVzc2FnZXMobWVzc2FnZXMpIHtcblx0XHRsZXQgYXJyYXlCdWZmZXJzID0gW107XG5cdFx0bGV0IG1zZ0xlbmd0aCA9IG1lc3NhZ2VzLmxlbmd0aDtcblx0XHRsZXQgdG90YWxMZW5ndGggPSAwO1xuXHRcdGxldCBvZmZzZXQgPSAwO1xuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IG1zZ0xlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcGFja2VkID0gbWVzc2FnZXNbaV0ucGFjaygpO1xuXHRcdFx0YXJyYXlCdWZmZXJzLnB1c2gocGFja2VkKTtcblx0XHRcdHRvdGFsTGVuZ3RoICs9IHBhY2tlZC5ieXRlTGVuZ3RoO1xuXHRcdH1cblxuXHRcdGxldCBwYWNrZWQgPSBuZXcgVWludDhBcnJheSh0b3RhbExlbmd0aCk7XG5cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgbXNnTGVuZ3RoOyBpKyspIHtcblx0XHRcdHBhY2tlZC5zZXQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXJzW2ldKSwgb2Zmc2V0KTtcblx0XHRcdG9mZnNldCArPSBhcnJheUJ1ZmZlcnNbaV0uYnl0ZUxlbmd0aDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGFja2VkLmJ1ZmZlcjtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlRmFjdG9yeTtcbiIsImltcG9ydCBzdHJ1Y3QgZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy9qc3BhY2stYXJyYXlidWZmZXIvc3RydWN0LmpzJztcbmltcG9ydCB1dGY4IGZyb20gJy4uL2Jvd2VyX2NvbXBvbmVudHMvdXRmOC91dGY4LmpzJztcbmltcG9ydCBzdHJpbmdGb3JtYXQgZnJvbSAnLi9zdHJpbmctZm9ybWF0LmpzJztcblxuXG5mdW5jdGlvbiBNZXNzYWdlQmFzZSgpIHtcblx0dGhpcy5kYXRhID0ge307XG59XG5cbk1lc3NhZ2VCYXNlLnByb3RvdHlwZS5wYWNrID0gZnVuY3Rpb24oKSB7XG5cdGxldCBjbHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyk7XG5cdGxldCBmb3JtYXQgPSBjbHMuZm9ybWF0O1xuXHRsZXQgYmluYXJ5Rm9ybWF0ID0gY2xzLmJpbmFyeUZvcm1hdDtcblx0bGV0IGtleXMgPSBjbHMua2V5cztcblx0bGV0IHN0cmluZ0xlbmd0aHMgPSBbXTtcblx0bGV0IGRhdGEgPSBbIGNscy5pZCBdO1xuXG5cdGZvcihsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IGtleSA9IGtleXNbaV07XG5cdFx0bGV0IHR5cGUgPSBmb3JtYXRba2V5XTtcblx0XHRsZXQgdmFsdWUgPSB0aGlzLmRhdGFba2V5XTtcblx0XHRpZih0eXBlID09PSAnZW51bScpIHtcblx0XHRcdHZhbHVlID0gY2xzLmVudW1zW2tleV1bdmFsdWVdO1xuXHRcdH0gZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJykge1xuXHRcdFx0dmFsdWUgPSB1dGY4LmVuY29kZSh2YWx1ZSk7XG5cdFx0XHRkYXRhLnB1c2godmFsdWUubGVuZ3RoKTtcblx0XHRcdHN0cmluZ0xlbmd0aHMucHVzaCh2YWx1ZS5sZW5ndGgpO1xuXHRcdH1cblx0XHRkYXRhLnB1c2godmFsdWUpO1xuXHR9XG5cdGJpbmFyeUZvcm1hdCA9IHN0cmluZ0Zvcm1hdChiaW5hcnlGb3JtYXQsIHN0cmluZ0xlbmd0aHMpO1xuXHRyZXR1cm4gc3RydWN0LnBhY2soYmluYXJ5Rm9ybWF0LCBkYXRhKTtcbn07XG5cbk1lc3NhZ2VCYXNlLnByb3RvdHlwZS5nZXRCaW5hcnlMZW5ndGggPSBmdW5jdGlvbigpIHtcblx0bGV0IGNscyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKTtcblx0bGV0IGZvcm1hdCA9IGNscy5mb3JtYXQ7XG5cdGxldCBrZXlzID0gT2JqZWN0LmtleXMoZm9ybWF0KS5zb3J0KCk7XG5cdGxldCBiaW5hcnlGb3JtYXQgPSBjbHMuYmluYXJ5Rm9ybWF0O1xuXHRsZXQgc3RyaW5nTGVuZ3RocyA9IFtdO1xuXG5cdGZvcihsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IGtleSA9IGtleXNbaV07XG5cblx0XHRpZihmb3JtYXRba2V5XSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHN0cmluZ0xlbmd0aHMucHVzaCh0aGlzLmRhdGFba2V5XS5sZW5ndGgpO1xuXHRcdH1cblx0fVxuXG5cdGJpbmFyeUZvcm1hdCA9IHN0cmluZ0Zvcm1hdChiaW5hcnlGb3JtYXQsIHN0cmluZ0xlbmd0aHMpO1xuXHRyZXR1cm4gc3RydWN0LmNhbGNMZW5ndGgoYmluYXJ5Rm9ybWF0KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VCYXNlO1xuIiwiZnVuY3Rpb24gc3RyaW5nRm9ybWF0KHN0ciwgcmVwbGFjZW1lbnRzKSB7XG5cdHZhciBjb3VudGVyID0gMDtcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9cXHtcXH0vZywgZnVuY3Rpb24oKSB7IHJldHVybiByZXBsYWNlbWVudHNbY291bnRlcl07IH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdGb3JtYXQ7XG4iLCJpbXBvcnQgdXRmOCBmcm9tICcuLi9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tCb29sKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VUludDgocG9pbnRlcikgPT09IDEpO1xuXHRyZXR1cm4gcG9pbnRlciArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tCeXRlKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0SW50OChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1VieXRlKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VWludDgocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tTaG9ydChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEludDE2KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrVXNob3J0KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VWludDE2KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrSW50KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0SW50MzIocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tVaW50KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VWludDMyKHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrSW50NjQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRJbnQ2NChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgODtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1VpbnQ2NChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldFVpbnQ2NChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgODtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0Zsb2F0KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0RmxvYXQzMihwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0RvdWJsZShkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEZsb2F0NjQocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tTdHJpbmcoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHR2YXIgc3RyaW5nTGVuZ3RoID0gZHYuZ2V0VWludDMyKHBvaW50ZXIpLFxuXHRcdHZhbHVlcyA9IFtdLFxuXHRcdGk7XG5cblx0cG9pbnRlciArPSA0O1xuXG5cdGZvcihpID0gMDsgaSA8IHN0cmluZ0xlbmd0aDsgaSsrKSB7XG5cdFx0dmFsdWVzLnB1c2goZHYuZ2V0VWludDgocG9pbnRlciArIGkpKTtcblx0fVxuXG5cdGV4dHJhY3RlZC5wdXNoKHV0ZjguZGVjb2RlKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdmFsdWVzKSkpO1xuXHRyZXR1cm4gcG9pbnRlciArIHN0cmluZ0xlbmd0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0VudW0ocmV2ZXJzZUVudW1zLCB1bnBhY2tlciwgZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHR2YXIgcmF3RXh0cmFjdGVkID0gW107XG5cdHBvaW50ZXIgPSB1bnBhY2tlcihkdiwgcG9pbnRlciwgcmF3RXh0cmFjdGVkKTtcblx0ZXh0cmFjdGVkLnB1c2gocmV2ZXJzZUVudW1zW3Jhd0V4dHJhY3RlZC5wb3AoKV0pO1xuXHRyZXR1cm4gcG9pbnRlcjtcbn1cbiIsImltcG9ydCBNZXNzYWdlRmFjdG9yeSBmcm9tICcuL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyc7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZUZhY3Rvcnk7XG5cbiJdfQ==
