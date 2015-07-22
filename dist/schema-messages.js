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
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bower_componentsJspackArraybufferStructJs = require('../bower_components/jspack-arraybuffer/struct.js');

var _bower_componentsJspackArraybufferStructJs2 = _interopRequireDefault(_bower_componentsJspackArraybufferStructJs);

var _messageJs = require('./message.js');

var _messageJs2 = _interopRequireDefault(_messageJs);

var _stringFormatJs = require('./string-format.js');

var _stringFormatJs2 = _interopRequireDefault(_stringFormatJs);

var _bower_componentsUtf8Utf8Js = require('../bower_components/utf8/utf8.js');

var _bower_componentsUtf8Utf8Js2 = _interopRequireDefault(_bower_componentsUtf8Utf8Js);

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
	'double': 'd'
};

var getBinaryFormatSymbol = function getBinaryFormatSymbol(number) {
	var bytesNeeded = Math.ceil(Math.log(number, 2) / 8);

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

var MessageFactory = (function () {
	function MessageFactory(schema) {
		_classCallCheck(this, MessageFactory);

		var keys = Object.keys(schema).sort();
		this.msgClassesByName = {};
		this.msgClassesById = {};
		this.bytesNeededForId = Math.ceil(Math.log(keys.length + 1, 2) / 8);
		this.idBinaryFormat = getBinaryFormatSymbol(keys.length);

		keys.forEach((function (className, index) {
			var enums = {},
			    reverseEnums = {};

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
		key: 'unpackMessage',
		value: function unpackMessage(data) {
			var bufferDV = new DataView(data);
			var msgId = bufferDV['getUint' + this.bytesNeededForId * 8](0);
			var cls = this.getById(msgId);
			var item = new cls();
			var keys = Object.keys(cls.format).sort();
			var stringLengths = [];
			var indexestoRemove = [];

			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var type = cls.format[key];
				if (type === 'string') {
					var offset = this.bytesNeededForId + i;
					var stringLength = bufferDV.getUint32(offset);
					stringLengths.push(stringLength);
					indexestoRemove.push(i);
				}
			}

			var binaryFormat = (0, _stringFormatJs2['default'])(cls.binaryFormat, stringLengths);
			var msgData = _bower_componentsJspackArraybufferStructJs2['default'].unpack(binaryFormat, data);
			msgData.shift(); //remove the id

			for (var i = 0; i < indexestoRemove.length; i++) {
				msgData.splice(indexestoRemove[i], 1);
			}

			// item.data = {};

			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var type = cls.format[key];
				item.data[key] = msgData[i];
				if (type === 'string') {
					item.data[key] = _bower_componentsUtf8Utf8Js2['default'].decode(item.data[key]);
				}
				if (type === 'enum') {
					item.data[key] = cls.reverseEnums[key][item.data[key]];
				}
			}

			return item;
		}
	}, {
		key: 'unpackMessages',
		value: function unpackMessages(data) {
			var messages = [];

			while (data.byteLength) {
				var msg = this.unpackMessage(data);
				data = data.slice(msg.getBinaryLength());
				messages.push(msg);
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

},{"../bower_components/jspack-arraybuffer/struct.js":1,"../bower_components/utf8/utf8.js":2,"./message.js":4,"./string-format.js":5}],4:[function(require,module,exports){
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
	var keys = Object.keys(format).sort();
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jsMessageFactoryJs = require('./js/message-factory.js');

var _jsMessageFactoryJs2 = _interopRequireDefault(_jsMessageFactoryJs);

module.exports = _jsMessageFactoryJs2['default'];

},{"./js/message-factory.js":3}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL2pzcGFjay1hcnJheWJ1ZmZlci9zdHJ1Y3QuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9qcy9zdHJpbmctZm9ybWF0LmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxZQUNEOzs7QUFHQSxLQUFJLE1BQU0sR0FBRztBQUNaLE1BQUksRUFBRSxjQUFTLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUN6RDtBQUNDLE9BQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUN4QixLQUFLLEdBQUcsQ0FBRSxLQUFLLENBQUUsQ0FBQzs7QUFFbkIsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0dBQ2hEO0FBQ0QsUUFBTSxFQUFFLGdCQUFTLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxZQUFZLEVB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dXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpXG57XG5cbi8vIHV0aWxpdHkgcGFjayBhbmQgdW5wYWNrIGZ1bmN0aW9ucyB0byBzaW1wbGlmeSBtYWdpY1xudmFyIGNvbW1vbiA9IHtcblx0cGFjazogZnVuY3Rpb24obWV0aG9kLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHR7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSlcblx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHRkdlttZXRob2RdKG9mZnNldCArIGksIHZhbHVlW2ldLCBsaXR0bGVlbmRpYW4pO1xuXHR9LFxuXHR1bnBhY2s6IGZ1bmN0aW9uKG1ldGhvZCwgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHR7XG5cdFx0dmFyIHIgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdHIucHVzaChkdlttZXRob2RdKG9mZnNldCArIGksIGxpdHRsZWVuZGlhbikpO1xuXG5cdFx0cmV0dXJuIHI7XG5cdH1cbn07XG5cbi8vIHBhY2sgYW5kIHVucGFja2luZyBmb3IgZGlmZmVyZW50IHR5cGVzXG52YXIgbWFnaWMgPSB7XG5cdC8vIGJ5dGUgYXJyYXlcblx0QSA6IHtcblx0XHRsZW5ndGg6IDEsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0SW50OCcsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldEludDgnLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gcGFkZGluZyBieXRlXG5cdHggOiB7XG5cdFx0bGVuZ3RoOiAxLFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHRcdGR2LnNldFVpbnQ4KG9mZnNldCArIGksIDApO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0dmFyIHIgPSBbXTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0XHRyLnB1c2goMCk7XG5cblx0XHRcdHJldHVybiByO1xuXHRcdH1cblx0fSxcblx0Ly8gY2hhclxuXHRjIDoge1xuXHRcdGxlbmd0aDogMSxcblx0XHRwYWNrOiBmdW5jdGlvbihtZXRob2QsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSlcblx0XHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cdFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHRcdGR2LnNldFVpbnQ4KG9mZnNldCArIGksIHZhbHVlW2ldLmNoYXJDb2RlQXQoMCkpO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihtZXRob2QsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHR2YXIgciA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHRcdHIucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGR2LmdldFVpbnQ4KG9mZnNldCArIGkpKSk7XG5cdFxuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fVxuXHR9LFxuXHQvLyBzaWduZWQgY2hhclxuXHRiIDoge1xuXHRcdGxlbmd0aDogMSxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRJbnQ4JywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0SW50OCcsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyB1bnNpZ25lZCBjaGFyXG5cdEIgOiB7XG5cdFx0bGVuZ3RoOiAxLFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldFVpbnQ4JywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0VWludDgnLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gc2lnbmVkIHNob3J0XG5cdGggOiB7XG5cdFx0bGVuZ3RoOiAyLFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldEludDE2JywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0SW50MTYnLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gdW5zaWduZWQgc2hvcnRcblx0SCA6IHtcblx0XHRsZW5ndGg6IDIsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0VWludDE2JywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0VWludDE2JywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIHNpZ25lZCBsb25nIFxuXHRpIDoge1xuXHRcdGxlbmd0aDogNCxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRJbnQzMicsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldEludDMyJywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIHVuc2lnbmVkIGxvbmdcblx0SSA6IHtcblx0XHRsZW5ndGg6IDQsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0VWludDMyJywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0VWludDMyJywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdGwgOiB7XG5cdFx0bGVuZ3RoOiA0LFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldEludDMyJywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0SW50MzInLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gdW5zaWduZWQgbG9uZ1xuXHRMIDoge1xuXHRcdGxlbmd0aDogNCxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRVaW50MzInLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRVaW50MzInLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gY2hhcltdXG5cdHMgOiB7XG5cdFx0bGVuZ3RoOiAxLCBcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHZhciB2YWwgPSBuZXcgU3RyaW5nKHZhbHVlWzBdKTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBjb2RlID0gMDtcblxuXHRcdFx0XHRpZiAoaSA8IHZhbC5sZW5ndGgpXG5cdFx0XHRcdFx0Y29kZSA9IHZhbC5jaGFyQ29kZUF0KGkpO1xuXG5cdFx0XHRcdGR2LnNldFVpbnQ4KG9mZnNldCArIGksIGNvZGUpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHR2YXIgciA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHRcdHIucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGR2LmdldFVpbnQ4KG9mZnNldCArIGkpKSk7XG5cblx0XHRcdHJldHVybiBbIHIuam9pbignJykgXTtcblx0XHR9XG5cdH0sXG5cdC8vIGZsb2F0IFxuXHRmIDoge1xuXHRcdGxlbmd0aDogNCxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRGbG9hdDMyJywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0RmxvYXQzMicsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyBkb3VibGVcblx0ZCA6IHtcblx0XHRsZW5ndGg6IDgsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0RmxvYXQ2NCcsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldEZsb2F0NjQnLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fVxufTtcblxuLy8gcGF0dGVybiBvZiBzdHVmZiB3ZSdyZSBsb29raW5nIGZvclxudmFyIHBhdHRlcm4gPSAnKFxcXFxkKyk/KFtBeGNiQmhIc2ZkaUlsTF0pJztcblxuLy8gZGV0ZXJtaW5lIHRoZSBzaXplIG9mIGFycmF5YnVmZmVyIHdlJ2QgbmVlZFxudmFyIGRldGVybWluZUxlbmd0aCA9IGZ1bmN0aW9uIChmbXQpXG57XG5cdHZhciByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKSwgbSwgc3VtID0gMDtcblxuXHR3aGlsZSAobSA9IHJlLmV4ZWMoZm10KSlcblx0XHRzdW0gKz0gKCgobVsxXSA9PSB1bmRlZmluZWQpIHx8IChtWzFdID09ICcnKSkgPyAxIDogcGFyc2VJbnQobVsxXSkpICogbWFnaWNbbVsyXV0ubGVuZ3RoO1xuXG5cdHJldHVybiBzdW07XG59O1xuXG4vLyBwYWNrIGEgc2V0IG9mIHZhbHVlcywgc3RhcnRpbmcgYXQgb2Zmc2V0LCBiYXNlZCBvbiBmb3JtYXRcbnZhciBwYWNrID0gZnVuY3Rpb24oZm10LCB2YWx1ZXMsIG9mZnNldClcbntcblx0dmFyIGxpdHRsZWVuZGlhbiA9IChmbXQuY2hhckF0KDApID09ICc8Jyk7XG5cdG9mZnNldCA9IG9mZnNldCA/IG9mZnNldCA6IDA7XG5cblx0dmFyIGFiID0gbmV3IEFycmF5QnVmZmVyKGRldGVybWluZUxlbmd0aChmbXQpKSxcblx0XHRkdiA9IG5ldyBEYXRhVmlldyhhYiksXG5cdFx0cmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sICdnJyksXG5cdFx0bSwgYywgbCwgaSA9IDA7XG5cblx0d2hpbGUgKG0gPSByZS5leGVjKGZtdCkpXG5cdHtcblx0XHRpZiAobWFnaWNbbVsyXV0gPT0gdW5kZWZpbmVkKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGZvcm1hdCB0eXBlJyk7XG5cdFx0XG5cdFx0YyA9ICgobVsxXT09dW5kZWZpbmVkKSB8fCAobVsxXT09JycpKSA/IDEgOiBwYXJzZUludChtWzFdKTtcblx0XHRsID0gbWFnaWNbbVsyXV0ubGVuZ3RoO1xuXG5cdFx0aWYgKChvZmZzZXQgKyAoYyAqIGwpKSA+IGFiLmxlbmd0aClcblx0XHRcdHJldHVybjtcblxuXHRcdHZhciB2YWx1ZSA9IHZhbHVlcy5zbGljZShpLCBpICsgMSk7XG5cblx0XHRtYWdpY1ttWzJdXS5wYWNrKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXG5cdFx0b2Zmc2V0ICs9IGMgKiBsO1xuXHRcdGkgKz0gMTtcblx0fVxuXG5cdHJldHVybiBhYjtcbn07XG5cbi8vIHVucGFjayBhbiBhcnJheWJ1ZmZlciwgc3RhcnRpbmcgYXQgb2Zmc2V0LCBiYXNlZCBvbiBmb3JtYXRcbi8vIHJldHVybnMgYW4gYXJyYXlcbnZhciB1bnBhY2sgPSBmdW5jdGlvbihmbXQsIGFiLCBvZmZzZXQpXG57XG5cdHZhciBsaXR0bGVlbmRpYW4gPSAoZm10LmNoYXJBdCgwKSA9PSAnPCcpLFxuXHRcdG9mZnNldCA9IG9mZnNldCA/IG9mZnNldCA6IDA7XG5cblx0dmFyIHJlc3VsdHMgPSBbXSxcblx0XHRyZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKSxcblx0XHRkdiA9IG5ldyBEYXRhVmlldyhhYiksXG5cdFx0bSwgYywgbDtcblxuXHR3aGlsZSAobSA9IHJlLmV4ZWMoZm10KSlcblx0e1xuXHRcdGlmIChtYWdpY1ttWzJdXSA9PSB1bmRlZmluZWQpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZm9ybWF0IHR5cGUnKTtcblx0XHRcblx0XHRjID0gKChtWzFdID09IHVuZGVmaW5lZCkgfHwgKG1bMV0gPT0gJycpKSA/IDEgOiBwYXJzZUludChtWzFdKTtcblx0XHRsID0gbWFnaWNbbVsyXV0ubGVuZ3RoO1xuXG5cdFx0aWYgKChvZmZzZXQgKyAoYyAqIGwpKSA+IGFiLmxlbmd0aClcblx0XHRcdHJldHVybjtcblxuXHRcdHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChtYWdpY1ttWzJdXS51bnBhY2soZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKSk7XG5cblx0XHRvZmZzZXQgKz0gYyAqIGw7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0cztcbn07XG5cbi8vIGV4dGVybmFsIEFQSVxudmFyIHN0cnVjdCA9IHtcblx0cGFjazogcGFjayxcblx0dW5wYWNrOiB1bnBhY2ssXG5cdGNhbGNMZW5ndGg6IGRldGVybWluZUxlbmd0aCxcblxuXHQvLyBqc3BhY2sgY29tcGF0aWJsZSBBUElcblx0UGFjazogcGFjayxcblx0VW5wYWNrOiB1bnBhY2ssXG5cdENhbGNMZW5ndGg6IGRldGVybWluZUxlbmd0aFxufTtcblxuLy8gcHVibGlzaGluZyB0byB0aGUgb3V0c2lkZSB3b3JsZFxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKVxuXHRtb2R1bGUuZXhwb3J0cyA9IHN0cnVjdDtcbmVsc2Vcblx0dGhpcy5zdHJ1Y3QgPSBzdHJ1Y3Q7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIvKiEgaHR0cDovL210aHMuYmUvdXRmOGpzIHYyLjAuMCBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYFxuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgXG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSxcblx0Ly8gYW5kIHVzZSBpdCBhcyBgcm9vdGBcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgc3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuXHQvLyBUYWtlbiBmcm9tIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdO1xuXHRcdHZhciBjb3VudGVyID0gMDtcblx0XHR2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcblx0XHR2YXIgdmFsdWU7XG5cdFx0dmFyIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8vIFRha2VuIGZyb20gaHR0cDovL210aHMuYmUvcHVueWNvZGVcblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIHZhbHVlO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBhcnJheVtpbmRleF07XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0ZnVuY3Rpb24gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIHNoaWZ0KSB7XG5cdFx0cmV0dXJuIHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiBzaGlmdCkgJiAweDNGKSB8IDB4ODApO1xuXHR9XG5cblx0ZnVuY3Rpb24gZW5jb2RlQ29kZVBvaW50KGNvZGVQb2ludCkge1xuXHRcdGlmICgoY29kZVBvaW50ICYgMHhGRkZGRkY4MCkgPT0gMCkgeyAvLyAxLWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHJldHVybiBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50KTtcblx0XHR9XG5cdFx0dmFyIHN5bWJvbCA9ICcnO1xuXHRcdGlmICgoY29kZVBvaW50ICYgMHhGRkZGRjgwMCkgPT0gMCkgeyAvLyAyLWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiA2KSAmIDB4MUYpIHwgMHhDMCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKChjb2RlUG9pbnQgJiAweEZGRkYwMDAwKSA9PSAwKSB7IC8vIDMtYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0c3ltYm9sID0gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IDEyKSAmIDB4MEYpIHwgMHhFMCk7XG5cdFx0XHRzeW1ib2wgKz0gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIDYpO1xuXHRcdH1cblx0XHRlbHNlIGlmICgoY29kZVBvaW50ICYgMHhGRkUwMDAwMCkgPT0gMCkgeyAvLyA0LWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiAxOCkgJiAweDA3KSB8IDB4RjApO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCAxMik7XG5cdFx0XHRzeW1ib2wgKz0gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIDYpO1xuXHRcdH1cblx0XHRzeW1ib2wgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKChjb2RlUG9pbnQgJiAweDNGKSB8IDB4ODApO1xuXHRcdHJldHVybiBzeW1ib2w7XG5cdH1cblxuXHRmdW5jdGlvbiB1dGY4ZW5jb2RlKHN0cmluZykge1xuXHRcdHZhciBjb2RlUG9pbnRzID0gdWNzMmRlY29kZShzdHJpbmcpO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoY29kZVBvaW50cy5tYXAoZnVuY3Rpb24oeCkge1xuXHRcdC8vIFx0cmV0dXJuICdVKycgKyB4LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuXHRcdC8vIH0pKSk7XG5cblx0XHR2YXIgbGVuZ3RoID0gY29kZVBvaW50cy5sZW5ndGg7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIGNvZGVQb2ludDtcblx0XHR2YXIgYnl0ZVN0cmluZyA9ICcnO1xuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0XHRjb2RlUG9pbnQgPSBjb2RlUG9pbnRzW2luZGV4XTtcblx0XHRcdGJ5dGVTdHJpbmcgKz0gZW5jb2RlQ29kZVBvaW50KGNvZGVQb2ludCk7XG5cdFx0fVxuXHRcdHJldHVybiBieXRlU3RyaW5nO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0ZnVuY3Rpb24gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKSB7XG5cdFx0aWYgKGJ5dGVJbmRleCA+PSBieXRlQ291bnQpIHtcblx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGJ5dGUgaW5kZXgnKTtcblx0XHR9XG5cblx0XHR2YXIgY29udGludWF0aW9uQnl0ZSA9IGJ5dGVBcnJheVtieXRlSW5kZXhdICYgMHhGRjtcblx0XHRieXRlSW5kZXgrKztcblxuXHRcdGlmICgoY29udGludWF0aW9uQnl0ZSAmIDB4QzApID09IDB4ODApIHtcblx0XHRcdHJldHVybiBjb250aW51YXRpb25CeXRlICYgMHgzRjtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBlbmQgdXAgaGVyZSwgaXTigJlzIG5vdCBhIGNvbnRpbnVhdGlvbiBieXRlXG5cdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZVN5bWJvbCgpIHtcblx0XHR2YXIgYnl0ZTE7XG5cdFx0dmFyIGJ5dGUyO1xuXHRcdHZhciBieXRlMztcblx0XHR2YXIgYnl0ZTQ7XG5cdFx0dmFyIGNvZGVQb2ludDtcblxuXHRcdGlmIChieXRlSW5kZXggPiBieXRlQ291bnQpIHtcblx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGJ5dGUgaW5kZXgnKTtcblx0XHR9XG5cblx0XHRpZiAoYnl0ZUluZGV4ID09IGJ5dGVDb3VudCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIFJlYWQgZmlyc3QgYnl0ZVxuXHRcdGJ5dGUxID0gYnl0ZUFycmF5W2J5dGVJbmRleF0gJiAweEZGO1xuXHRcdGJ5dGVJbmRleCsrO1xuXG5cdFx0Ly8gMS1ieXRlIHNlcXVlbmNlIChubyBjb250aW51YXRpb24gYnl0ZXMpXG5cdFx0aWYgKChieXRlMSAmIDB4ODApID09IDApIHtcblx0XHRcdHJldHVybiBieXRlMTtcblx0XHR9XG5cblx0XHQvLyAyLWJ5dGUgc2VxdWVuY2Vcblx0XHRpZiAoKGJ5dGUxICYgMHhFMCkgPT0gMHhDMCkge1xuXHRcdFx0dmFyIGJ5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGNvZGVQb2ludCA9ICgoYnl0ZTEgJiAweDFGKSA8PCA2KSB8IGJ5dGUyO1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDgwKSB7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDMtYnl0ZSBzZXF1ZW5jZSAobWF5IGluY2x1ZGUgdW5wYWlyZWQgc3Vycm9nYXRlcylcblx0XHRpZiAoKGJ5dGUxICYgMHhGMCkgPT0gMHhFMCkge1xuXHRcdFx0Ynl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MEYpIDw8IDEyKSB8IChieXRlMiA8PCA2KSB8IGJ5dGUzO1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDA4MDApIHtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gNC1ieXRlIHNlcXVlbmNlXG5cdFx0aWYgKChieXRlMSAmIDB4RjgpID09IDB4RjApIHtcblx0XHRcdGJ5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGJ5dGUzID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGJ5dGU0ID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGNvZGVQb2ludCA9ICgoYnl0ZTEgJiAweDBGKSA8PCAweDEyKSB8IChieXRlMiA8PCAweDBDKSB8XG5cdFx0XHRcdChieXRlMyA8PCAweDA2KSB8IGJ5dGU0O1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDAxMDAwMCAmJiBjb2RlUG9pbnQgPD0gMHgxMEZGRkYpIHtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBVVEYtOCBkZXRlY3RlZCcpO1xuXHR9XG5cblx0dmFyIGJ5dGVBcnJheTtcblx0dmFyIGJ5dGVDb3VudDtcblx0dmFyIGJ5dGVJbmRleDtcblx0ZnVuY3Rpb24gdXRmOGRlY29kZShieXRlU3RyaW5nKSB7XG5cdFx0Ynl0ZUFycmF5ID0gdWNzMmRlY29kZShieXRlU3RyaW5nKTtcblx0XHRieXRlQ291bnQgPSBieXRlQXJyYXkubGVuZ3RoO1xuXHRcdGJ5dGVJbmRleCA9IDA7XG5cdFx0dmFyIGNvZGVQb2ludHMgPSBbXTtcblx0XHR2YXIgdG1wO1xuXHRcdHdoaWxlICgodG1wID0gZGVjb2RlU3ltYm9sKCkpICE9PSBmYWxzZSkge1xuXHRcdFx0Y29kZVBvaW50cy5wdXNoKHRtcCk7XG5cdFx0fVxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKGNvZGVQb2ludHMpO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIHV0ZjggPSB7XG5cdFx0J3ZlcnNpb24nOiAnMi4wLjAnLFxuXHRcdCdlbmNvZGUnOiB1dGY4ZW5jb2RlLFxuXHRcdCdkZWNvZGUnOiB1dGY4ZGVjb2RlXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdXRmODtcblx0XHR9KTtcblx0fVx0ZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHV0Zjg7XG5cdFx0fSBlbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdHZhciBvYmplY3QgPSB7fTtcblx0XHRcdHZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdC5oYXNPd25Qcm9wZXJ0eTtcblx0XHRcdGZvciAodmFyIGtleSBpbiB1dGY4KSB7XG5cdFx0XHRcdGhhc093blByb3BlcnR5LmNhbGwodXRmOCwga2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHV0Zjhba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC51dGY4ID0gdXRmODtcblx0fVxuXG59KHRoaXMpKTtcbiIsImltcG9ydCBzdHJ1Y3QgZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy9qc3BhY2stYXJyYXlidWZmZXIvc3RydWN0LmpzJztcbmltcG9ydCBNZXNzYWdlQmFzZSBmcm9tICcuL21lc3NhZ2UuanMnO1xuaW1wb3J0IHN0cmluZ0Zvcm1hdCBmcm9tICcuL3N0cmluZy1mb3JtYXQuanMnO1xuaW1wb3J0IHV0ZjggZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy91dGY4L3V0ZjguanMnO1xuXG5jb25zdCBNQVhfU1VQUE9SVEVEX05VTUJFUiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSID4gTWF0aC5wb3coMiwgNjQpIC0gMSA/IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIDogTWF0aC5wb3coMiwgNjQpIC0gMTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG5cbmxldCBiaW5hcnlUeXBlcyA9IHtcblx0J2Jvb2wnOiAnPycsXG5cdCdieXRlJzogJ2InLFxuXHQndWJ5dGUnOiAnQicsXG5cdCdjaGFyJzogJ2MnLFxuXHQnc2hvcnQnOiAnaCcsXG5cdCd1c2hvcnQnOiAnSCcsXG5cdCdpbnQnOiAnaScsXG5cdCd1aW50JzogJ0knLFxuXHQnaW50NjQnOiAncScsXG5cdCd1aW50NjQnOiAnUScsXG5cdCdmbG9hdCc6ICdmJyxcblx0J2RvdWJsZSc6ICdkJ1xufTtcblxuXG5sZXQgZ2V0QmluYXJ5Rm9ybWF0U3ltYm9sID0gZnVuY3Rpb24obnVtYmVyKSB7XG5cdGxldCBieXRlc05lZWRlZCA9IE1hdGguY2VpbChNYXRoLmxvZyhudW1iZXIsIDIpIC8gOCk7XG5cblx0aWYoYnl0ZXNOZWVkZWQgPD0gMSkge1xuXHRcdHJldHVybiAnQic7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA9PT0gMikge1xuXHRcdHJldHVybiAnSCc7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA0KSB7XG5cdFx0cmV0dXJuICdJJztcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDgpIHtcblx0XHRyZXR1cm4gJ1EnO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IGBVbmFibGUgdG8gcmVwcmVzZW50IG51bWJlciAkbnVtYmVyIGluIHBhY2tlZCBzdHJ1Y3R1cmVgO1xuXHR9XG59O1xuXG5jbGFzcyBNZXNzYWdlRmFjdG9yeSB7XG5cdGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuXHRcdGxldCBrZXlzID0gT2JqZWN0LmtleXMoc2NoZW1hKS5zb3J0KCk7XG5cdFx0dGhpcy5tc2dDbGFzc2VzQnlOYW1lID0ge307XG5cdFx0dGhpcy5tc2dDbGFzc2VzQnlJZCA9IHt9O1xuXHRcdHRoaXMuYnl0ZXNOZWVkZWRGb3JJZCA9IE1hdGguY2VpbChNYXRoLmxvZyhrZXlzLmxlbmd0aCArIDEsIDIpIC8gOCk7XG5cdFx0dGhpcy5pZEJpbmFyeUZvcm1hdCA9IGdldEJpbmFyeUZvcm1hdFN5bWJvbChrZXlzLmxlbmd0aCk7XG5cblx0XHRrZXlzLmZvckVhY2goZnVuY3Rpb24oY2xhc3NOYW1lLCBpbmRleCkge1xuXHRcdFx0dmFyIGVudW1zID0ge30sIHJldmVyc2VFbnVtcyA9IHt9O1xuXG5cdFx0XHRpZihzY2hlbWFbY2xhc3NOYW1lXS5lbnVtcykge1xuXHRcdFx0XHRmb3IobGV0IGVudW1OYW1lIGluIHNjaGVtYVtjbGFzc05hbWVdLmVudW1zKSB7XG5cdFx0XHRcdFx0bGV0IGVudW1WYWx1ZXMgPSBzY2hlbWFbY2xhc3NOYW1lXS5lbnVtc1tlbnVtTmFtZV07XG5cdFx0XHRcdFx0ZW51bXNbZW51bU5hbWVdID0ge307XG5cdFx0XHRcdFx0cmV2ZXJzZUVudW1zW2VudW1OYW1lXSA9IHt9O1xuXHRcdFx0XHRcdGZvcihsZXQgZW51bUtleSBpbiBlbnVtVmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRsZXQgZW51bVZhbHVlID0gZW51bVZhbHVlc1tlbnVtS2V5XTtcblx0XHRcdFx0XHRcdGVudW1zW2VudW1OYW1lXVtlbnVtS2V5XSA9IGVudW1WYWx1ZTtcblx0XHRcdFx0XHRcdHJldmVyc2VFbnVtc1tlbnVtTmFtZV1bZW51bVZhbHVlXSA9IGVudW1LZXk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBNZXNzYWdlQ2xhc3MgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0TWVzc2FnZUJhc2UuY2FsbCh0aGlzKTtcblx0XHRcdH07XG5cblx0XHRcdGxldCBwcm9wZXJ0aWVzID0ge1xuXHRcdFx0XHQnbmFtZSc6IHtcblx0XHRcdFx0XHR2YWx1ZTogY2xhc3NOYW1lLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnYmluYXJ5Rm9ybWF0Jzoge1xuXHRcdFx0XHRcdHZhbHVlOiB0aGlzLmdldEJpbmFyeUZvcm1hdChzY2hlbWFbY2xhc3NOYW1lXSksXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdmb3JtYXQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3NjaGVtYSc6IHtcblx0XHRcdFx0XHR2YWx1ZTogc2NoZW1hLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnaWQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IGluZGV4ICsgMSxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2VudW1zJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBlbnVtcyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3JldmVyc2VFbnVtcyc6IHtcblx0XHRcdFx0XHR2YWx1ZTogcmV2ZXJzZUVudW1zLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBAVE9ETyByZXZpc2l0IGlmIHNldHRpbmcgcHJvcGVydGllcyBsaWtlIHRoaXMgY2FuIGJlIGF2b2lkZWRcblx0XHRcdE1lc3NhZ2VDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE1lc3NhZ2VCYXNlLnByb3RvdHlwZSwgcHJvcGVydGllcyk7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhNZXNzYWdlQ2xhc3MsIHByb3BlcnRpZXMpO1xuXG5cdFx0XHR0aGlzLm1zZ0NsYXNzZXNCeUlkW2luZGV4ICsgMV0gPSBNZXNzYWdlQ2xhc3M7XG5cdFx0XHR0aGlzLm1zZ0NsYXNzZXNCeU5hbWVbY2xhc3NOYW1lXSA9IE1lc3NhZ2VDbGFzcztcblx0XHR9LmJpbmQodGhpcykpO1xuXHR9XG5cblx0Z2V0QmluYXJ5Rm9ybWF0KG1zZ1NjaGVtYSkge1xuXHRcdGxldCBmaWVsZHMgPSBPYmplY3Qua2V5cyhtc2dTY2hlbWEuZm9ybWF0KS5zb3J0KCk7XG5cdFx0bGV0IGJpbmFyeUZvcm1hdCA9ICchJzsgIC8vIHdlIGFsd2F5cyB1c2UgbmV0d29yayAoYmlnLWVuZGlhbikgYnl0ZSBvcmRlclxuXHRcdGJpbmFyeUZvcm1hdCArPSB0aGlzLmlkQmluYXJ5Rm9ybWF0O1xuXG5cdFx0ZmllbGRzLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcblx0XHRcdGlmKG1zZ1NjaGVtYS5mb3JtYXRbZmllbGRdID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRiaW5hcnlGb3JtYXQgKz0gJ0l7fXMnO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihtc2dTY2hlbWEuZm9ybWF0W2ZpZWxkXSA9PT0gJ2VudW0nKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0YmluYXJ5Rm9ybWF0ICs9IGdldEJpbmFyeUZvcm1hdFN5bWJvbChPYmplY3Qua2V5cyhtc2dTY2hlbWEuZm9ybWF0W2ZpZWxkXSkubGVuZ3RoKTtcblx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0dGhyb3cgYEVudW0gZmllbGQgY2FuIGNvbnRhaW4gdGhlIG1heGltdW0gbnVtYmVyIE1BWF9TVVBQT1JURURfTlVNQkVSIHBvc3NpYmxlIHZhbHVlcy5gO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGJpbmFyeUZvcm1hdCArPSBiaW5hcnlUeXBlc1ttc2dTY2hlbWEuZm9ybWF0W2ZpZWxkXV07XG5cdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdHRocm93IGBVbmtub3duIGZpZWxkIHR5cGUgbXNnU2NoZW1hLmZvcm1hdFtmaWVsZF0uYDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGJpbmFyeUZvcm1hdDtcblx0fVxuXG5cdGdldEJ5TmFtZShuYW1lKSB7XG5cdFx0cmV0dXJuIHRoaXMubXNnQ2xhc3Nlc0J5TmFtZVtuYW1lXTtcblx0fVxuXG5cdGdldEJ5SWQoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5tc2dDbGFzc2VzQnlJZFtpZF07XG5cdH1cblxuXHRnZXQoaWRPck5hbWUpIHtcblx0XHRpZighaXNOYU4ocGFyc2VJbnQoaWRPck5hbWUpKSAmJiBpc0Zpbml0ZShpZE9yTmFtZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldEJ5SWQoaWRPck5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRCeU5hbWUoaWRPck5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdHVucGFja01lc3NhZ2UoZGF0YSkge1xuXHRcdGxldCBidWZmZXJEViA9IG5ldyBEYXRhVmlldyhkYXRhKTtcblx0XHRsZXQgbXNnSWQgPSBidWZmZXJEVlsnZ2V0VWludCcgKyAodGhpcy5ieXRlc05lZWRlZEZvcklkICogOCldKDApO1xuXHRcdGxldCBjbHMgPSB0aGlzLmdldEJ5SWQobXNnSWQpO1xuXHRcdGxldCBpdGVtID0gbmV3IGNscygpO1xuXHRcdGxldCBrZXlzID0gT2JqZWN0LmtleXMoY2xzLmZvcm1hdCkuc29ydCgpO1xuXHRcdGxldCBzdHJpbmdMZW5ndGhzID0gW107XG5cdFx0bGV0IGluZGV4ZXN0b1JlbW92ZSA9IFtdO1xuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBrZXkgPSBrZXlzW2ldO1xuXHRcdFx0bGV0IHR5cGUgPSBjbHMuZm9ybWF0W2tleV07XG5cdFx0XHRpZih0eXBlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRsZXQgb2Zmc2V0ID0gdGhpcy5ieXRlc05lZWRlZEZvcklkICsgaTtcblx0XHRcdFx0bGV0IHN0cmluZ0xlbmd0aCA9IGJ1ZmZlckRWLmdldFVpbnQzMihvZmZzZXQpO1xuXHRcdFx0XHRzdHJpbmdMZW5ndGhzLnB1c2goc3RyaW5nTGVuZ3RoKTtcblx0XHRcdFx0aW5kZXhlc3RvUmVtb3ZlLnB1c2goaSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGJpbmFyeUZvcm1hdCA9IHN0cmluZ0Zvcm1hdChjbHMuYmluYXJ5Rm9ybWF0LCBzdHJpbmdMZW5ndGhzKTtcblx0XHRsZXQgbXNnRGF0YSA9IHN0cnVjdC51bnBhY2soYmluYXJ5Rm9ybWF0LCBkYXRhKTtcblx0XHRtc2dEYXRhLnNoaWZ0KCk7IC8vcmVtb3ZlIHRoZSBpZFxuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IGluZGV4ZXN0b1JlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0bXNnRGF0YS5zcGxpY2UoaW5kZXhlc3RvUmVtb3ZlW2ldLCAxKTtcblx0XHR9XG5cblx0XHQvLyBpdGVtLmRhdGEgPSB7fTtcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQga2V5ID0ga2V5c1tpXTtcblx0XHRcdGxldCB0eXBlID0gY2xzLmZvcm1hdFtrZXldO1xuXHRcdFx0aXRlbS5kYXRhW2tleV0gPSBtc2dEYXRhW2ldO1xuXHRcdFx0aWYodHlwZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0aXRlbS5kYXRhW2tleV0gPSB1dGY4LmRlY29kZShpdGVtLmRhdGFba2V5XSk7XG5cdFx0XHR9XG5cdFx0XHRpZih0eXBlID09PSAnZW51bScpIHtcblx0XHRcdFx0aXRlbS5kYXRhW2tleV0gPSBjbHMucmV2ZXJzZUVudW1zW2tleV1baXRlbS5kYXRhW2tleV1dO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBpdGVtO1xuXHR9XG5cblx0dW5wYWNrTWVzc2FnZXMoZGF0YSkge1xuXHRcdGxldCBtZXNzYWdlcyA9IFtdO1xuXG5cdFx0d2hpbGUoZGF0YS5ieXRlTGVuZ3RoKSB7XG5cdFx0XHRsZXQgbXNnID0gdGhpcy51bnBhY2tNZXNzYWdlKGRhdGEpO1xuXHRcdFx0ZGF0YSA9IGRhdGEuc2xpY2UobXNnLmdldEJpbmFyeUxlbmd0aCgpKTtcblx0XHRcdG1lc3NhZ2VzLnB1c2gobXNnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWVzc2FnZXM7XG5cdH1cblxuXHRwYWNrTWVzc2FnZXMobWVzc2FnZXMpIHtcblx0XHRsZXQgYXJyYXlCdWZmZXJzID0gW107XG5cdFx0bGV0IG1zZ0xlbmd0aCA9IG1lc3NhZ2VzLmxlbmd0aDtcblx0XHRsZXQgdG90YWxMZW5ndGggPSAwO1xuXHRcdGxldCBvZmZzZXQgPSAwO1xuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IG1zZ0xlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcGFja2VkID0gbWVzc2FnZXNbaV0ucGFjaygpO1xuXHRcdFx0YXJyYXlCdWZmZXJzLnB1c2gocGFja2VkKTtcblx0XHRcdHRvdGFsTGVuZ3RoICs9IHBhY2tlZC5ieXRlTGVuZ3RoO1xuXHRcdH1cblxuXHRcdGxldCBwYWNrZWQgPSBuZXcgVWludDhBcnJheSh0b3RhbExlbmd0aCk7XG5cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgbXNnTGVuZ3RoOyBpKyspIHtcblx0XHRcdHBhY2tlZC5zZXQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXJzW2ldKSwgb2Zmc2V0KTtcblx0XHRcdG9mZnNldCArPSBhcnJheUJ1ZmZlcnNbaV0uYnl0ZUxlbmd0aDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGFja2VkLmJ1ZmZlcjtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlRmFjdG9yeTtcbiIsImltcG9ydCBzdHJ1Y3QgZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy9qc3BhY2stYXJyYXlidWZmZXIvc3RydWN0LmpzJztcbmltcG9ydCB1dGY4IGZyb20gJy4uL2Jvd2VyX2NvbXBvbmVudHMvdXRmOC91dGY4LmpzJztcbmltcG9ydCBzdHJpbmdGb3JtYXQgZnJvbSAnLi9zdHJpbmctZm9ybWF0LmpzJztcblxuXG5mdW5jdGlvbiBNZXNzYWdlQmFzZSgpIHtcblx0dGhpcy5kYXRhID0ge307XG59XG5cbk1lc3NhZ2VCYXNlLnByb3RvdHlwZS5wYWNrID0gZnVuY3Rpb24oKSB7XG5cdGxldCBjbHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyk7XG5cdGxldCBmb3JtYXQgPSBjbHMuZm9ybWF0O1xuXHRsZXQgYmluYXJ5Rm9ybWF0ID0gY2xzLmJpbmFyeUZvcm1hdDtcblx0bGV0IGtleXMgPSBPYmplY3Qua2V5cyhmb3JtYXQpLnNvcnQoKTtcblx0bGV0IHN0cmluZ0xlbmd0aHMgPSBbXTtcblx0bGV0IGRhdGEgPSBbIGNscy5pZCBdO1xuXG5cdGZvcihsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IGtleSA9IGtleXNbaV07XG5cdFx0bGV0IHR5cGUgPSBmb3JtYXRba2V5XTtcblx0XHRsZXQgdmFsdWUgPSB0aGlzLmRhdGFba2V5XTtcblx0XHRpZih0eXBlID09PSAnZW51bScpIHtcblx0XHRcdHZhbHVlID0gY2xzLmVudW1zW2tleV1bdmFsdWVdO1xuXHRcdH0gZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJykge1xuXHRcdFx0dmFsdWUgPSB1dGY4LmVuY29kZSh2YWx1ZSk7XG5cdFx0XHRkYXRhLnB1c2godmFsdWUubGVuZ3RoKTtcblx0XHRcdHN0cmluZ0xlbmd0aHMucHVzaCh2YWx1ZS5sZW5ndGgpO1xuXHRcdH1cblx0XHRkYXRhLnB1c2godmFsdWUpO1xuXHR9XG5cdGJpbmFyeUZvcm1hdCA9IHN0cmluZ0Zvcm1hdChiaW5hcnlGb3JtYXQsIHN0cmluZ0xlbmd0aHMpO1xuXHRyZXR1cm4gc3RydWN0LnBhY2soYmluYXJ5Rm9ybWF0LCBkYXRhKTtcbn07XG5cbk1lc3NhZ2VCYXNlLnByb3RvdHlwZS5nZXRCaW5hcnlMZW5ndGggPSBmdW5jdGlvbigpIHtcblx0bGV0IGNscyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKTtcblx0bGV0IGZvcm1hdCA9IGNscy5mb3JtYXQ7XG5cdGxldCBrZXlzID0gT2JqZWN0LmtleXMoZm9ybWF0KS5zb3J0KCk7XG5cdGxldCBiaW5hcnlGb3JtYXQgPSBjbHMuYmluYXJ5Rm9ybWF0O1xuXHRsZXQgc3RyaW5nTGVuZ3RocyA9IFtdO1xuXG5cdGZvcihsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IGtleSA9IGtleXNbaV07XG5cblx0XHRpZihmb3JtYXRba2V5XSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHN0cmluZ0xlbmd0aHMucHVzaCh0aGlzLmRhdGFba2V5XS5sZW5ndGgpO1xuXHRcdH1cblx0fVxuXG5cdGJpbmFyeUZvcm1hdCA9IHN0cmluZ0Zvcm1hdChiaW5hcnlGb3JtYXQsIHN0cmluZ0xlbmd0aHMpO1xuXHRyZXR1cm4gc3RydWN0LmNhbGNMZW5ndGgoYmluYXJ5Rm9ybWF0KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VCYXNlO1xuIiwiZnVuY3Rpb24gc3RyaW5nRm9ybWF0KHN0ciwgcmVwbGFjZW1lbnRzKSB7XG5cdHZhciBjb3VudGVyID0gMDtcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9cXHtcXH0vZywgZnVuY3Rpb24oKSB7IHJldHVybiByZXBsYWNlbWVudHNbY291bnRlcl07IH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdGb3JtYXQ7XG4iLCJpbXBvcnQgTWVzc2FnZUZhY3RvcnkgZnJvbSAnLi9qcy9tZXNzYWdlLWZhY3RvcnkuanMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VGYWN0b3J5O1xuXG4iXX0=
