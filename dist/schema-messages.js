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
			var MessageClass = Object.create(_messageJs2['default'].prototype, {
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
				'data': {
					value: {},
					writable: true
				}
			});

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
			var item = Object.create(cls);
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bower_componentsJspackArraybufferStructJs = require('../bower_components/jspack-arraybuffer/struct.js');

var _bower_componentsJspackArraybufferStructJs2 = _interopRequireDefault(_bower_componentsJspackArraybufferStructJs);

var _bower_componentsUtf8Utf8Js = require('../bower_components/utf8/utf8.js');

var _bower_componentsUtf8Utf8Js2 = _interopRequireDefault(_bower_componentsUtf8Utf8Js);

var _stringFormatJs = require('./string-format.js');

var _stringFormatJs2 = _interopRequireDefault(_stringFormatJs);

var MessageBase = (function () {
	function MessageBase() {
		_classCallCheck(this, MessageBase);
	}

	_createClass(MessageBase, [{
		key: 'pack',
		value: function pack() {
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
		}
	}, {
		key: 'getBinaryLength',
		value: function getBinaryLength() {
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
		}
	}]);

	return MessageBase;
})();

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL2pzcGFjay1hcnJheWJ1ZmZlci9zdHJ1Y3QuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9qcy9zdHJpbmctZm9ybWF0LmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxZQUNEOzs7QUFHQSxLQUFJLE1BQU0sR0FBRztBQUNaLE1BQUksRUFBRSxjQUFTLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUN6RDtBQUNDLE9BQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUN4QixLQUFLLEdBQUcsQ0FBRSxLQUFLLENBQUUsQ0FBQzs7QUFFbkIsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0dBQ2hEO0FBQ0QsUUFBTSxFQUFFLGdCQUFTLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxZQUFZLEVB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QyxPQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDO0FBQ3BDLE9BQUksYUFBYSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkIsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEMsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVsQixRQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxRQUFRLEVBQUU7QUFDNUIsa0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQztJQUNEOztBQUVELGVBQVksR0FBRyxpQ0FBYSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDekQsVUFBTyx1REFBTyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDdkM7OztRQTNDSSxXQUFXOzs7cUJBOENGLFdBQVc7Ozs7Ozs7OztBQ25EMUIsU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRTtBQUN4QyxLQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxZQUFXO0FBQUUsU0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7RUFBRSxDQUFDLENBQUM7Q0FDMUU7O3FCQUVjLFlBQVk7Ozs7Ozs7O2tDQ0xBLHlCQUF5Qjs7OztBQUVwRCxNQUFNLENBQUMsT0FBTyxrQ0FBaUIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKVxue1xuXG4vLyB1dGlsaXR5IHBhY2sgYW5kIHVucGFjayBmdW5jdGlvbnMgdG8gc2ltcGxpZnkgbWFnaWNcbnZhciBjb21tb24gPSB7XG5cdHBhY2s6IGZ1bmN0aW9uKG1ldGhvZCwgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0ZHZbbWV0aG9kXShvZmZzZXQgKyBpLCB2YWx1ZVtpXSwgbGl0dGxlZW5kaWFuKTtcblx0fSxcblx0dW5wYWNrOiBmdW5jdGlvbihtZXRob2QsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0e1xuXHRcdHZhciByID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjOyBpKyspXG5cdFx0XHRyLnB1c2goZHZbbWV0aG9kXShvZmZzZXQgKyBpLCBsaXR0bGVlbmRpYW4pKTtcblxuXHRcdHJldHVybiByO1xuXHR9XG59O1xuXG4vLyBwYWNrIGFuZCB1bnBhY2tpbmcgZm9yIGRpZmZlcmVudCB0eXBlc1xudmFyIG1hZ2ljID0ge1xuXHQvLyBieXRlIGFycmF5XG5cdEEgOiB7XG5cdFx0bGVuZ3RoOiAxLFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldEludDgnLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRJbnQ4JywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIHBhZGRpbmcgYnl0ZVxuXHR4IDoge1xuXHRcdGxlbmd0aDogMSxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0XHRkdi5zZXRVaW50OChvZmZzZXQgKyBpLCAwKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHZhciByID0gW107XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGM7IGkrKylcblx0XHRcdFx0ci5wdXNoKDApO1xuXG5cdFx0XHRyZXR1cm4gcjtcblx0XHR9XG5cdH0sXG5cdC8vIGNoYXJcblx0YyA6IHtcblx0XHRsZW5ndGg6IDEsXG5cdFx0cGFjazogZnVuY3Rpb24obWV0aG9kLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG5cdFx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXHRcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0XHRkdi5zZXRVaW50OChvZmZzZXQgKyBpLCB2YWx1ZVtpXS5jaGFyQ29kZUF0KDApKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24obWV0aG9kLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0dmFyIHIgPSBbXTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0XHRyLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShkdi5nZXRVaW50OChvZmZzZXQgKyBpKSkpO1xuXHRcblx0XHRcdHJldHVybiByO1xuXHRcdH1cblx0fSxcblx0Ly8gc2lnbmVkIGNoYXJcblx0YiA6IHtcblx0XHRsZW5ndGg6IDEsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0SW50OCcsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldEludDgnLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gdW5zaWduZWQgY2hhclxuXHRCIDoge1xuXHRcdGxlbmd0aDogMSxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRVaW50OCcsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldFVpbnQ4JywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIHNpZ25lZCBzaG9ydFxuXHRoIDoge1xuXHRcdGxlbmd0aDogMixcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRJbnQxNicsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldEludDE2JywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIHVuc2lnbmVkIHNob3J0XG5cdEggOiB7XG5cdFx0bGVuZ3RoOiAyLFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldFVpbnQxNicsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldFVpbnQxNicsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyBzaWduZWQgbG9uZyBcblx0aSA6IHtcblx0XHRsZW5ndGg6IDQsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0SW50MzInLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRJbnQzMicsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHQvLyB1bnNpZ25lZCBsb25nXG5cdEkgOiB7XG5cdFx0bGVuZ3RoOiA0LFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldFVpbnQzMicsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldFVpbnQzMicsIGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fVxuXHR9LFxuXHRsIDoge1xuXHRcdGxlbmd0aDogNCxcblx0XHRwYWNrOiBmdW5jdGlvbihkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdGNvbW1vbi5wYWNrKCdzZXRJbnQzMicsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldEludDMyJywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIHVuc2lnbmVkIGxvbmdcblx0TCA6IHtcblx0XHRsZW5ndGg6IDQsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0VWludDMyJywgZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbik7XG5cdFx0fSxcblx0XHR1bnBhY2s6IGZ1bmN0aW9uKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRyZXR1cm4gY29tbW9uLnVucGFjaygnZ2V0VWludDMyJywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH0sXG5cdC8vIGNoYXJbXVxuXHRzIDoge1xuXHRcdGxlbmd0aDogMSwgXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHR2YXIgdmFsID0gbmV3IFN0cmluZyh2YWx1ZVswXSk7XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgY29kZSA9IDA7XG5cblx0XHRcdFx0aWYgKGkgPCB2YWwubGVuZ3RoKVxuXHRcdFx0XHRcdGNvZGUgPSB2YWwuY2hhckNvZGVBdChpKTtcblxuXHRcdFx0XHRkdi5zZXRVaW50OChvZmZzZXQgKyBpLCBjb2RlKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0dmFyIHIgPSBbXTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYzsgaSsrKVxuXHRcdFx0XHRyLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShkdi5nZXRVaW50OChvZmZzZXQgKyBpKSkpO1xuXG5cdFx0XHRyZXR1cm4gWyByLmpvaW4oJycpIF07XG5cdFx0fVxuXHR9LFxuXHQvLyBmbG9hdCBcblx0ZiA6IHtcblx0XHRsZW5ndGg6IDQsXG5cdFx0cGFjazogZnVuY3Rpb24oZHYsIHZhbHVlLCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbilcblx0XHR7XG5cdFx0XHRjb21tb24ucGFjaygnc2V0RmxvYXQzMicsIGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH0sXG5cdFx0dW5wYWNrOiBmdW5jdGlvbihkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNvbW1vbi51bnBhY2soJ2dldEZsb2F0MzInLCBkdiwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pO1xuXHRcdH1cblx0fSxcblx0Ly8gZG91YmxlXG5cdGQgOiB7XG5cdFx0bGVuZ3RoOiA4LFxuXHRcdHBhY2s6IGZ1bmN0aW9uKGR2LCB2YWx1ZSwgb2Zmc2V0LCBjLCBsaXR0bGVlbmRpYW4pXG5cdFx0e1xuXHRcdFx0Y29tbW9uLnBhY2soJ3NldEZsb2F0NjQnLCBkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9LFxuXHRcdHVucGFjazogZnVuY3Rpb24oZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKVxuXHRcdHtcblx0XHRcdHJldHVybiBjb21tb24udW5wYWNrKCdnZXRGbG9hdDY0JywgZHYsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblx0XHR9XG5cdH1cbn07XG5cbi8vIHBhdHRlcm4gb2Ygc3R1ZmYgd2UncmUgbG9va2luZyBmb3JcbnZhciBwYXR0ZXJuID0gJyhcXFxcZCspPyhbQXhjYkJoSHNmZGlJbExdKSc7XG5cbi8vIGRldGVybWluZSB0aGUgc2l6ZSBvZiBhcnJheWJ1ZmZlciB3ZSdkIG5lZWRcbnZhciBkZXRlcm1pbmVMZW5ndGggPSBmdW5jdGlvbiAoZm10KVxue1xuXHR2YXIgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sICdnJyksIG0sIHN1bSA9IDA7XG5cblx0d2hpbGUgKG0gPSByZS5leGVjKGZtdCkpXG5cdFx0c3VtICs9ICgoKG1bMV0gPT0gdW5kZWZpbmVkKSB8fCAobVsxXSA9PSAnJykpID8gMSA6IHBhcnNlSW50KG1bMV0pKSAqIG1hZ2ljW21bMl1dLmxlbmd0aDtcblxuXHRyZXR1cm4gc3VtO1xufTtcblxuLy8gcGFjayBhIHNldCBvZiB2YWx1ZXMsIHN0YXJ0aW5nIGF0IG9mZnNldCwgYmFzZWQgb24gZm9ybWF0XG52YXIgcGFjayA9IGZ1bmN0aW9uKGZtdCwgdmFsdWVzLCBvZmZzZXQpXG57XG5cdHZhciBsaXR0bGVlbmRpYW4gPSAoZm10LmNoYXJBdCgwKSA9PSAnPCcpO1xuXHRvZmZzZXQgPSBvZmZzZXQgPyBvZmZzZXQgOiAwO1xuXG5cdHZhciBhYiA9IG5ldyBBcnJheUJ1ZmZlcihkZXRlcm1pbmVMZW5ndGgoZm10KSksXG5cdFx0ZHYgPSBuZXcgRGF0YVZpZXcoYWIpLFxuXHRcdHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpLFxuXHRcdG0sIGMsIGwsIGkgPSAwO1xuXG5cdHdoaWxlIChtID0gcmUuZXhlYyhmbXQpKVxuXHR7XG5cdFx0aWYgKG1hZ2ljW21bMl1dID09IHVuZGVmaW5lZClcblx0XHRcdHRocm93IG5ldyBFcnJvcignVW5rbm93biBmb3JtYXQgdHlwZScpO1xuXHRcdFxuXHRcdGMgPSAoKG1bMV09PXVuZGVmaW5lZCkgfHwgKG1bMV09PScnKSkgPyAxIDogcGFyc2VJbnQobVsxXSk7XG5cdFx0bCA9IG1hZ2ljW21bMl1dLmxlbmd0aDtcblxuXHRcdGlmICgob2Zmc2V0ICsgKGMgKiBsKSkgPiBhYi5sZW5ndGgpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR2YXIgdmFsdWUgPSB2YWx1ZXMuc2xpY2UoaSwgaSArIDEpO1xuXG5cdFx0bWFnaWNbbVsyXV0ucGFjayhkdiwgdmFsdWUsIG9mZnNldCwgYywgbGl0dGxlZW5kaWFuKTtcblxuXHRcdG9mZnNldCArPSBjICogbDtcblx0XHRpICs9IDE7XG5cdH1cblxuXHRyZXR1cm4gYWI7XG59O1xuXG4vLyB1bnBhY2sgYW4gYXJyYXlidWZmZXIsIHN0YXJ0aW5nIGF0IG9mZnNldCwgYmFzZWQgb24gZm9ybWF0XG4vLyByZXR1cm5zIGFuIGFycmF5XG52YXIgdW5wYWNrID0gZnVuY3Rpb24oZm10LCBhYiwgb2Zmc2V0KVxue1xuXHR2YXIgbGl0dGxlZW5kaWFuID0gKGZtdC5jaGFyQXQoMCkgPT0gJzwnKSxcblx0XHRvZmZzZXQgPSBvZmZzZXQgPyBvZmZzZXQgOiAwO1xuXG5cdHZhciByZXN1bHRzID0gW10sXG5cdFx0cmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sICdnJyksXG5cdFx0ZHYgPSBuZXcgRGF0YVZpZXcoYWIpLFxuXHRcdG0sIGMsIGw7XG5cblx0d2hpbGUgKG0gPSByZS5leGVjKGZtdCkpXG5cdHtcblx0XHRpZiAobWFnaWNbbVsyXV0gPT0gdW5kZWZpbmVkKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGZvcm1hdCB0eXBlJyk7XG5cdFx0XG5cdFx0YyA9ICgobVsxXSA9PSB1bmRlZmluZWQpIHx8IChtWzFdID09ICcnKSkgPyAxIDogcGFyc2VJbnQobVsxXSk7XG5cdFx0bCA9IG1hZ2ljW21bMl1dLmxlbmd0aDtcblxuXHRcdGlmICgob2Zmc2V0ICsgKGMgKiBsKSkgPiBhYi5sZW5ndGgpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRyZXN1bHRzID0gcmVzdWx0cy5jb25jYXQobWFnaWNbbVsyXV0udW5wYWNrKGR2LCBvZmZzZXQsIGMsIGxpdHRsZWVuZGlhbikpO1xuXG5cdFx0b2Zmc2V0ICs9IGMgKiBsO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vLyBleHRlcm5hbCBBUElcbnZhciBzdHJ1Y3QgPSB7XG5cdHBhY2s6IHBhY2ssXG5cdHVucGFjazogdW5wYWNrLFxuXHRjYWxjTGVuZ3RoOiBkZXRlcm1pbmVMZW5ndGgsXG5cblx0Ly8ganNwYWNrIGNvbXBhdGlibGUgQVBJXG5cdFBhY2s6IHBhY2ssXG5cdFVucGFjazogdW5wYWNrLFxuXHRDYWxjTGVuZ3RoOiBkZXRlcm1pbmVMZW5ndGhcbn07XG5cbi8vIHB1Ymxpc2hpbmcgdG8gdGhlIG91dHNpZGUgd29ybGRcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cylcblx0bW9kdWxlLmV4cG9ydHMgPSBzdHJ1Y3Q7XG5lbHNlXG5cdHRoaXMuc3RydWN0ID0gc3RydWN0O1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiLyohIGh0dHA6Ly9tdGhzLmJlL3V0ZjhqcyB2Mi4wLjAgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlcyBgZXhwb3J0c2Bcblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYFxuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgLCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUsXG5cdC8vIGFuZCB1c2UgaXQgYXMgYHJvb3RgXG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cblx0Ly8gVGFrZW4gZnJvbSBodHRwOi8vbXRocy5iZS9wdW55Y29kZVxuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXTtcblx0XHR2YXIgY291bnRlciA9IDA7XG5cdFx0dmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG5cdFx0dmFyIHZhbHVlO1xuXHRcdHZhciBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvLyBUYWtlbiBmcm9tIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciBpbmRleCA9IC0xO1xuXHRcdHZhciB2YWx1ZTtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0d2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZUJ5dGUoY29kZVBvaW50LCBzaGlmdCkge1xuXHRcdHJldHVybiBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gc2hpZnQpICYgMHgzRikgfCAweDgwKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuY29kZUNvZGVQb2ludChjb2RlUG9pbnQpIHtcblx0XHRpZiAoKGNvZGVQb2ludCAmIDB4RkZGRkZGODApID09IDApIHsgLy8gMS1ieXRlIHNlcXVlbmNlXG5cdFx0XHRyZXR1cm4gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7XG5cdFx0fVxuXHRcdHZhciBzeW1ib2wgPSAnJztcblx0XHRpZiAoKGNvZGVQb2ludCAmIDB4RkZGRkY4MDApID09IDApIHsgLy8gMi1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gNikgJiAweDFGKSB8IDB4QzApO1xuXHRcdH1cblx0XHRlbHNlIGlmICgoY29kZVBvaW50ICYgMHhGRkZGMDAwMCkgPT0gMCkgeyAvLyAzLWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiAxMikgJiAweDBGKSB8IDB4RTApO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCA2KTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoKGNvZGVQb2ludCAmIDB4RkZFMDAwMDApID09IDApIHsgLy8gNC1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gMTgpICYgMHgwNykgfCAweEYwKTtcblx0XHRcdHN5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwgMTIpO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCA2KTtcblx0XHR9XG5cdFx0c3ltYm9sICs9IHN0cmluZ0Zyb21DaGFyQ29kZSgoY29kZVBvaW50ICYgMHgzRikgfCAweDgwKTtcblx0XHRyZXR1cm4gc3ltYm9sO1xuXHR9XG5cblx0ZnVuY3Rpb24gdXRmOGVuY29kZShzdHJpbmcpIHtcblx0XHR2YXIgY29kZVBvaW50cyA9IHVjczJkZWNvZGUoc3RyaW5nKTtcblxuXHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGNvZGVQb2ludHMubWFwKGZ1bmN0aW9uKHgpIHtcblx0XHQvLyBcdHJldHVybiAnVSsnICsgeC50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblx0XHQvLyB9KSkpO1xuXG5cdFx0dmFyIGxlbmd0aCA9IGNvZGVQb2ludHMubGVuZ3RoO1xuXHRcdHZhciBpbmRleCA9IC0xO1xuXHRcdHZhciBjb2RlUG9pbnQ7XG5cdFx0dmFyIGJ5dGVTdHJpbmcgPSAnJztcblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0Y29kZVBvaW50ID0gY29kZVBvaW50c1tpbmRleF07XG5cdFx0XHRieXRlU3RyaW5nICs9IGVuY29kZUNvZGVQb2ludChjb2RlUG9pbnQpO1xuXHRcdH1cblx0XHRyZXR1cm4gYnl0ZVN0cmluZztcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdGZ1bmN0aW9uIHJlYWRDb250aW51YXRpb25CeXRlKCkge1xuXHRcdGlmIChieXRlSW5kZXggPj0gYnl0ZUNvdW50KSB7XG5cdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBieXRlIGluZGV4Jyk7XG5cdFx0fVxuXG5cdFx0dmFyIGNvbnRpbnVhdGlvbkJ5dGUgPSBieXRlQXJyYXlbYnl0ZUluZGV4XSAmIDB4RkY7XG5cdFx0Ynl0ZUluZGV4Kys7XG5cblx0XHRpZiAoKGNvbnRpbnVhdGlvbkJ5dGUgJiAweEMwKSA9PSAweDgwKSB7XG5cdFx0XHRyZXR1cm4gY29udGludWF0aW9uQnl0ZSAmIDB4M0Y7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZW5kIHVwIGhlcmUsIGl04oCZcyBub3QgYSBjb250aW51YXRpb24gYnl0ZVxuXHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWNvZGVTeW1ib2woKSB7XG5cdFx0dmFyIGJ5dGUxO1xuXHRcdHZhciBieXRlMjtcblx0XHR2YXIgYnl0ZTM7XG5cdFx0dmFyIGJ5dGU0O1xuXHRcdHZhciBjb2RlUG9pbnQ7XG5cblx0XHRpZiAoYnl0ZUluZGV4ID4gYnl0ZUNvdW50KSB7XG5cdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBieXRlIGluZGV4Jyk7XG5cdFx0fVxuXG5cdFx0aWYgKGJ5dGVJbmRleCA9PSBieXRlQ291bnQpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBSZWFkIGZpcnN0IGJ5dGVcblx0XHRieXRlMSA9IGJ5dGVBcnJheVtieXRlSW5kZXhdICYgMHhGRjtcblx0XHRieXRlSW5kZXgrKztcblxuXHRcdC8vIDEtYnl0ZSBzZXF1ZW5jZSAobm8gY29udGludWF0aW9uIGJ5dGVzKVxuXHRcdGlmICgoYnl0ZTEgJiAweDgwKSA9PSAwKSB7XG5cdFx0XHRyZXR1cm4gYnl0ZTE7XG5cdFx0fVxuXG5cdFx0Ly8gMi1ieXRlIHNlcXVlbmNlXG5cdFx0aWYgKChieXRlMSAmIDB4RTApID09IDB4QzApIHtcblx0XHRcdHZhciBieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRjb2RlUG9pbnQgPSAoKGJ5dGUxICYgMHgxRikgPDwgNikgfCBieXRlMjtcblx0XHRcdGlmIChjb2RlUG9pbnQgPj0gMHg4MCkge1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyAzLWJ5dGUgc2VxdWVuY2UgKG1heSBpbmNsdWRlIHVucGFpcmVkIHN1cnJvZ2F0ZXMpXG5cdFx0aWYgKChieXRlMSAmIDB4RjApID09IDB4RTApIHtcblx0XHRcdGJ5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGJ5dGUzID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGNvZGVQb2ludCA9ICgoYnl0ZTEgJiAweDBGKSA8PCAxMikgfCAoYnl0ZTIgPDwgNikgfCBieXRlMztcblx0XHRcdGlmIChjb2RlUG9pbnQgPj0gMHgwODAwKSB7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDQtYnl0ZSBzZXF1ZW5jZVxuXHRcdGlmICgoYnl0ZTEgJiAweEY4KSA9PSAweEYwKSB7XG5cdFx0XHRieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRieXRlMyA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRieXRlNCA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRjb2RlUG9pbnQgPSAoKGJ5dGUxICYgMHgwRikgPDwgMHgxMikgfCAoYnl0ZTIgPDwgMHgwQykgfFxuXHRcdFx0XHQoYnl0ZTMgPDwgMHgwNikgfCBieXRlNDtcblx0XHRcdGlmIChjb2RlUG9pbnQgPj0gMHgwMTAwMDAgJiYgY29kZVBvaW50IDw9IDB4MTBGRkZGKSB7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgVVRGLTggZGV0ZWN0ZWQnKTtcblx0fVxuXG5cdHZhciBieXRlQXJyYXk7XG5cdHZhciBieXRlQ291bnQ7XG5cdHZhciBieXRlSW5kZXg7XG5cdGZ1bmN0aW9uIHV0ZjhkZWNvZGUoYnl0ZVN0cmluZykge1xuXHRcdGJ5dGVBcnJheSA9IHVjczJkZWNvZGUoYnl0ZVN0cmluZyk7XG5cdFx0Ynl0ZUNvdW50ID0gYnl0ZUFycmF5Lmxlbmd0aDtcblx0XHRieXRlSW5kZXggPSAwO1xuXHRcdHZhciBjb2RlUG9pbnRzID0gW107XG5cdFx0dmFyIHRtcDtcblx0XHR3aGlsZSAoKHRtcCA9IGRlY29kZVN5bWJvbCgpKSAhPT0gZmFsc2UpIHtcblx0XHRcdGNvZGVQb2ludHMucHVzaCh0bXApO1xuXHRcdH1cblx0XHRyZXR1cm4gdWNzMmVuY29kZShjb2RlUG9pbnRzKTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciB1dGY4ID0ge1xuXHRcdCd2ZXJzaW9uJzogJzIuMC4wJyxcblx0XHQnZW5jb2RlJzogdXRmOGVuY29kZSxcblx0XHQnZGVjb2RlJzogdXRmOGRlY29kZVxuXHR9O1xuXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHV0Zjg7XG5cdFx0fSk7XG5cdH1cdGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7IC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSB1dGY4O1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHR2YXIgb2JqZWN0ID0ge307XG5cdFx0XHR2YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3QuaGFzT3duUHJvcGVydHk7XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gdXRmOCkge1xuXHRcdFx0XHRoYXNPd25Qcm9wZXJ0eS5jYWxsKHV0ZjgsIGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSB1dGY4W2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QudXRmOCA9IHV0Zjg7XG5cdH1cblxufSh0aGlzKSk7XG4iLCJpbXBvcnQgc3RydWN0IGZyb20gJy4uL2Jvd2VyX2NvbXBvbmVudHMvanNwYWNrLWFycmF5YnVmZmVyL3N0cnVjdC5qcyc7XG5pbXBvcnQgTWVzc2FnZUJhc2UgZnJvbSAnLi9tZXNzYWdlLmpzJztcbmltcG9ydCBzdHJpbmdGb3JtYXQgZnJvbSAnLi9zdHJpbmctZm9ybWF0LmpzJztcbmltcG9ydCB1dGY4IGZyb20gJy4uL2Jvd2VyX2NvbXBvbmVudHMvdXRmOC91dGY4LmpzJztcblxuY29uc3QgTUFYX1NVUFBPUlRFRF9OVU1CRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiA+IE1hdGgucG93KDIsIDY0KSAtIDEgPyBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiA6IE1hdGgucG93KDIsIDY0KSAtIDE7IC8vZXNsaW50LWRpc2FibGUtbGluZVxuXG5sZXQgYmluYXJ5VHlwZXMgPSB7XG5cdCdib29sJzogJz8nLFxuXHQnYnl0ZSc6ICdiJyxcblx0J3VieXRlJzogJ0InLFxuXHQnY2hhcic6ICdjJyxcblx0J3Nob3J0JzogJ2gnLFxuXHQndXNob3J0JzogJ0gnLFxuXHQnaW50JzogJ2knLFxuXHQndWludCc6ICdJJyxcblx0J2ludDY0JzogJ3EnLFxuXHQndWludDY0JzogJ1EnLFxuXHQnZmxvYXQnOiAnZicsXG5cdCdkb3VibGUnOiAnZCdcbn07XG5cblxubGV0IGdldEJpbmFyeUZvcm1hdFN5bWJvbCA9IGZ1bmN0aW9uKG51bWJlcikge1xuXHRsZXQgYnl0ZXNOZWVkZWQgPSBNYXRoLmNlaWwoTWF0aC5sb2cobnVtYmVyLCAyKSAvIDgpO1xuXG5cdGlmKGJ5dGVzTmVlZGVkIDw9IDEpIHtcblx0XHRyZXR1cm4gJ0InO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPT09IDIpIHtcblx0XHRyZXR1cm4gJ0gnO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPD0gNCkge1xuXHRcdHJldHVybiAnSSc7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA4KSB7XG5cdFx0cmV0dXJuICdRJztcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBgVW5hYmxlIHRvIHJlcHJlc2VudCBudW1iZXIgJG51bWJlciBpbiBwYWNrZWQgc3RydWN0dXJlYDtcblx0fVxufTtcblxuY2xhc3MgTWVzc2FnZUZhY3Rvcnkge1xuXHRjb25zdHJ1Y3RvcihzY2hlbWEpIHtcblx0XHRsZXQga2V5cyA9IE9iamVjdC5rZXlzKHNjaGVtYSkuc29ydCgpO1xuXHRcdHRoaXMubXNnQ2xhc3Nlc0J5TmFtZSA9IHt9O1xuXHRcdHRoaXMubXNnQ2xhc3Nlc0J5SWQgPSB7fTtcblx0XHR0aGlzLmJ5dGVzTmVlZGVkRm9ySWQgPSBNYXRoLmNlaWwoTWF0aC5sb2coa2V5cy5sZW5ndGggKyAxLCAyKSAvIDgpO1xuXHRcdHRoaXMuaWRCaW5hcnlGb3JtYXQgPSBnZXRCaW5hcnlGb3JtYXRTeW1ib2woa2V5cy5sZW5ndGgpO1xuXG5cdFx0a2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGNsYXNzTmFtZSwgaW5kZXgpIHtcblx0XHRcdHZhciBlbnVtcyA9IHt9LCByZXZlcnNlRW51bXMgPSB7fTtcblxuXHRcdFx0aWYoc2NoZW1hW2NsYXNzTmFtZV0uZW51bXMpIHtcblx0XHRcdFx0Zm9yKGxldCBlbnVtTmFtZSBpbiBzY2hlbWFbY2xhc3NOYW1lXS5lbnVtcykge1xuXHRcdFx0XHRcdGxldCBlbnVtVmFsdWVzID0gc2NoZW1hW2NsYXNzTmFtZV0uZW51bXNbZW51bU5hbWVdO1xuXHRcdFx0XHRcdGVudW1zW2VudW1OYW1lXSA9IHt9O1xuXHRcdFx0XHRcdHJldmVyc2VFbnVtc1tlbnVtTmFtZV0gPSB7fTtcblx0XHRcdFx0XHRmb3IobGV0IGVudW1LZXkgaW4gZW51bVZhbHVlcykge1xuXHRcdFx0XHRcdFx0bGV0IGVudW1WYWx1ZSA9IGVudW1WYWx1ZXNbZW51bUtleV07XG5cdFx0XHRcdFx0XHRlbnVtc1tlbnVtTmFtZV1bZW51bUtleV0gPSBlbnVtVmFsdWU7XG5cdFx0XHRcdFx0XHRyZXZlcnNlRW51bXNbZW51bU5hbWVdW2VudW1WYWx1ZV0gPSBlbnVtS2V5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bGV0IE1lc3NhZ2VDbGFzcyA9IE9iamVjdC5jcmVhdGUoTWVzc2FnZUJhc2UucHJvdG90eXBlLCB7XG5cdFx0XHRcdCduYW1lJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBjbGFzc05hbWUsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdiaW5hcnlGb3JtYXQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IHRoaXMuZ2V0QmluYXJ5Rm9ybWF0KHNjaGVtYVtjbGFzc05hbWVdKSxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2Zvcm1hdCc6IHtcblx0XHRcdFx0XHR2YWx1ZTogc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0LFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnc2NoZW1hJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBzY2hlbWEsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdpZCc6IHtcblx0XHRcdFx0XHR2YWx1ZTogaW5kZXggKyAxLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnZW51bXMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IGVudW1zLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQncmV2ZXJzZUVudW1zJzoge1xuXHRcdFx0XHRcdHZhbHVlOiByZXZlcnNlRW51bXMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdkYXRhJzoge1xuXHRcdFx0XHRcdHZhbHVlOiB7fSxcblx0XHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlJZFtpbmRleCArIDFdID0gTWVzc2FnZUNsYXNzO1xuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlOYW1lW2NsYXNzTmFtZV0gPSBNZXNzYWdlQ2xhc3M7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdGdldEJpbmFyeUZvcm1hdChtc2dTY2hlbWEpIHtcblx0XHRsZXQgZmllbGRzID0gT2JqZWN0LmtleXMobXNnU2NoZW1hLmZvcm1hdCkuc29ydCgpO1xuXHRcdGxldCBiaW5hcnlGb3JtYXQgPSAnISc7ICAvLyB3ZSBhbHdheXMgdXNlIG5ldHdvcmsgKGJpZy1lbmRpYW4pIGJ5dGUgb3JkZXJcblx0XHRiaW5hcnlGb3JtYXQgKz0gdGhpcy5pZEJpbmFyeUZvcm1hdDtcblxuXHRcdGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XG5cdFx0XHRpZihtc2dTY2hlbWEuZm9ybWF0W2ZpZWxkXSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0YmluYXJ5Rm9ybWF0ICs9ICdJe31zJztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYobXNnU2NoZW1hLmZvcm1hdFtmaWVsZF0gPT09ICdlbnVtJykge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGJpbmFyeUZvcm1hdCArPSBnZXRCaW5hcnlGb3JtYXRTeW1ib2woT2JqZWN0LmtleXMobXNnU2NoZW1hLmZvcm1hdFtmaWVsZF0pLmxlbmd0aCk7XG5cdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdHRocm93IGBFbnVtIGZpZWxkIGNhbiBjb250YWluIHRoZSBtYXhpbXVtIG51bWJlciBNQVhfU1VQUE9SVEVEX05VTUJFUiBwb3NzaWJsZSB2YWx1ZXMuYDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRiaW5hcnlGb3JtYXQgKz0gYmluYXJ5VHlwZXNbbXNnU2NoZW1hLmZvcm1hdFtmaWVsZF1dO1xuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHR0aHJvdyBgVW5rbm93biBmaWVsZCB0eXBlIG1zZ1NjaGVtYS5mb3JtYXRbZmllbGRdLmA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBiaW5hcnlGb3JtYXQ7XG5cdH1cblxuXHRnZXRCeU5hbWUobmFtZSkge1xuXHRcdHJldHVybiB0aGlzLm1zZ0NsYXNzZXNCeU5hbWVbbmFtZV07XG5cdH1cblxuXHRnZXRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMubXNnQ2xhc3Nlc0J5SWRbaWRdO1xuXHR9XG5cblx0Z2V0KGlkT3JOYW1lKSB7XG5cdFx0aWYoIWlzTmFOKHBhcnNlSW50KGlkT3JOYW1lKSkgJiYgaXNGaW5pdGUoaWRPck5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRCeUlkKGlkT3JOYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QnlOYW1lKGlkT3JOYW1lKTtcblx0XHR9XG5cdH1cblxuXHR1bnBhY2tNZXNzYWdlKGRhdGEpIHtcblx0XHRsZXQgYnVmZmVyRFYgPSBuZXcgRGF0YVZpZXcoZGF0YSk7XG5cdFx0bGV0IG1zZ0lkID0gYnVmZmVyRFZbJ2dldFVpbnQnICsgKHRoaXMuYnl0ZXNOZWVkZWRGb3JJZCAqIDgpXSgwKTtcblx0XHRsZXQgY2xzID0gdGhpcy5nZXRCeUlkKG1zZ0lkKTtcblx0XHRsZXQgaXRlbSA9IE9iamVjdC5jcmVhdGUoY2xzKTtcblx0XHRsZXQga2V5cyA9IE9iamVjdC5rZXlzKGNscy5mb3JtYXQpLnNvcnQoKTtcblx0XHRsZXQgc3RyaW5nTGVuZ3RocyA9IFtdO1xuXHRcdGxldCBpbmRleGVzdG9SZW1vdmUgPSBbXTtcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQga2V5ID0ga2V5c1tpXTtcblx0XHRcdGxldCB0eXBlID0gY2xzLmZvcm1hdFtrZXldO1xuXHRcdFx0aWYodHlwZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0bGV0IG9mZnNldCA9IHRoaXMuYnl0ZXNOZWVkZWRGb3JJZCArIGk7XG5cdFx0XHRcdGxldCBzdHJpbmdMZW5ndGggPSBidWZmZXJEVi5nZXRVaW50MzIob2Zmc2V0KTtcblx0XHRcdFx0c3RyaW5nTGVuZ3Rocy5wdXNoKHN0cmluZ0xlbmd0aCk7XG5cdFx0XHRcdGluZGV4ZXN0b1JlbW92ZS5wdXNoKGkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBiaW5hcnlGb3JtYXQgPSBzdHJpbmdGb3JtYXQoY2xzLmJpbmFyeUZvcm1hdCwgc3RyaW5nTGVuZ3Rocyk7XG5cdFx0bGV0IG1zZ0RhdGEgPSBzdHJ1Y3QudW5wYWNrKGJpbmFyeUZvcm1hdCwgZGF0YSk7XG5cdFx0bXNnRGF0YS5zaGlmdCgpOyAvL3JlbW92ZSB0aGUgaWRcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBpbmRleGVzdG9SZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdG1zZ0RhdGEuc3BsaWNlKGluZGV4ZXN0b1JlbW92ZVtpXSwgMSk7XG5cdFx0fVxuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBrZXkgPSBrZXlzW2ldO1xuXHRcdFx0bGV0IHR5cGUgPSBjbHMuZm9ybWF0W2tleV07XG5cdFx0XHRpdGVtLmRhdGFba2V5XSA9IG1zZ0RhdGFbaV07XG5cdFx0XHRpZih0eXBlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRpdGVtLmRhdGFba2V5XSA9IHV0ZjguZGVjb2RlKGl0ZW0uZGF0YVtrZXldKTtcblx0XHRcdH1cblx0XHRcdGlmKHR5cGUgPT09ICdlbnVtJykge1xuXHRcdFx0XHRpdGVtLmRhdGFba2V5XSA9IGNscy5yZXZlcnNlRW51bXNba2V5XVtpdGVtLmRhdGFba2V5XV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW07XG5cdH1cblxuXHR1bnBhY2tNZXNzYWdlcyhkYXRhKSB7XG5cdFx0bGV0IG1lc3NhZ2VzID0gW107XG5cblx0XHR3aGlsZShkYXRhLmJ5dGVMZW5ndGgpIHtcblx0XHRcdGxldCBtc2cgPSB0aGlzLnVucGFja01lc3NhZ2UoZGF0YSk7XG5cdFx0XHRkYXRhID0gZGF0YS5zbGljZShtc2cuZ2V0QmluYXJ5TGVuZ3RoKCkpO1xuXHRcdFx0bWVzc2FnZXMucHVzaChtc2cpO1xuXHRcdH1cblxuXHRcdHJldHVybiBtZXNzYWdlcztcblx0fVxuXG5cdHBhY2tNZXNzYWdlcyhtZXNzYWdlcykge1xuXHRcdGxldCBhcnJheUJ1ZmZlcnMgPSBbXTtcblx0XHRsZXQgbXNnTGVuZ3RoID0gbWVzc2FnZXMubGVuZ3RoO1xuXHRcdGxldCB0b3RhbExlbmd0aCA9IDA7XG5cdFx0bGV0IG9mZnNldCA9IDA7XG5cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgbXNnTGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBwYWNrZWQgPSBtZXNzYWdlc1tpXS5wYWNrKCk7XG5cdFx0XHRhcnJheUJ1ZmZlcnMucHVzaChwYWNrZWQpO1xuXHRcdFx0dG90YWxMZW5ndGggKz0gcGFja2VkLmJ5dGVMZW5ndGg7XG5cdFx0fVxuXG5cdFx0bGV0IHBhY2tlZCA9IG5ldyBVaW50OEFycmF5KHRvdGFsTGVuZ3RoKTtcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBtc2dMZW5ndGg7IGkrKykge1xuXHRcdFx0cGFja2VkLnNldChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcnNbaV0pLCBvZmZzZXQpO1xuXHRcdFx0b2Zmc2V0ICs9IGFycmF5QnVmZmVyc1tpXS5ieXRlTGVuZ3RoO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYWNrZWQuYnVmZmVyO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VGYWN0b3J5O1xuIiwiaW1wb3J0IHN0cnVjdCBmcm9tICcuLi9ib3dlcl9jb21wb25lbnRzL2pzcGFjay1hcnJheWJ1ZmZlci9zdHJ1Y3QuanMnO1xuaW1wb3J0IHV0ZjggZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy91dGY4L3V0ZjguanMnO1xuaW1wb3J0IHN0cmluZ0Zvcm1hdCBmcm9tICcuL3N0cmluZy1mb3JtYXQuanMnO1xuXG5cbmNsYXNzIE1lc3NhZ2VCYXNlIHtcblx0cGFjaygpIHtcblx0XHRsZXQgY2xzID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xuXHRcdGxldCBmb3JtYXQgPSBjbHMuZm9ybWF0O1xuXHRcdGxldCBiaW5hcnlGb3JtYXQgPSBjbHMuYmluYXJ5Rm9ybWF0O1xuXHRcdGxldCBrZXlzID0gT2JqZWN0LmtleXMoZm9ybWF0KS5zb3J0KCk7XG5cdFx0bGV0IHN0cmluZ0xlbmd0aHMgPSBbXTtcblx0XHRsZXQgZGF0YSA9IFsgY2xzLmlkIF07XG5cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IGtleSA9IGtleXNbaV07XG5cdFx0XHRsZXQgdHlwZSA9IGZvcm1hdFtrZXldO1xuXHRcdFx0bGV0IHZhbHVlID0gdGhpcy5kYXRhW2tleV07XG5cdFx0XHRpZih0eXBlID09PSAnZW51bScpIHtcblx0XHRcdFx0dmFsdWUgPSBjbHMuZW51bXNba2V5XVt2YWx1ZV07XG5cdFx0XHR9IGVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0dmFsdWUgPSB1dGY4LmVuY29kZSh2YWx1ZSk7XG5cdFx0XHRcdGRhdGEucHVzaCh2YWx1ZS5sZW5ndGgpO1xuXHRcdFx0XHRzdHJpbmdMZW5ndGhzLnB1c2godmFsdWUubGVuZ3RoKTtcblx0XHRcdH1cblx0XHRcdGRhdGEucHVzaCh2YWx1ZSk7XG5cdFx0fVxuXHRcdGJpbmFyeUZvcm1hdCA9IHN0cmluZ0Zvcm1hdChiaW5hcnlGb3JtYXQsIHN0cmluZ0xlbmd0aHMpO1xuXHRcdHJldHVybiBzdHJ1Y3QucGFjayhiaW5hcnlGb3JtYXQsIGRhdGEpO1xuXHR9XG5cblx0Z2V0QmluYXJ5TGVuZ3RoKCkge1xuXHRcdGxldCBjbHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyk7XG5cdFx0bGV0IGZvcm1hdCA9IGNscy5mb3JtYXQ7XG5cdFx0bGV0IGtleXMgPSBPYmplY3Qua2V5cyhmb3JtYXQpLnNvcnQoKTtcblx0XHRsZXQgYmluYXJ5Rm9ybWF0ID0gY2xzLmJpbmFyeUZvcm1hdDtcblx0XHRsZXQgc3RyaW5nTGVuZ3RocyA9IFtdO1xuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBrZXkgPSBrZXlzW2ldO1xuXG5cdFx0XHRpZihmb3JtYXRba2V5XSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0c3RyaW5nTGVuZ3Rocy5wdXNoKHRoaXMuZGF0YVtrZXldLmxlbmd0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YmluYXJ5Rm9ybWF0ID0gc3RyaW5nRm9ybWF0KGJpbmFyeUZvcm1hdCwgc3RyaW5nTGVuZ3Rocyk7XG5cdFx0cmV0dXJuIHN0cnVjdC5jYWxjTGVuZ3RoKGJpbmFyeUZvcm1hdCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUJhc2U7XG4iLCJmdW5jdGlvbiBzdHJpbmdGb3JtYXQoc3RyLCByZXBsYWNlbWVudHMpIHtcblx0dmFyIGNvdW50ZXIgPSAwO1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL1xce1xcfS9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIHJlcGxhY2VtZW50c1tjb3VudGVyXTsgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ0Zvcm1hdDtcbiIsImltcG9ydCBNZXNzYWdlRmFjdG9yeSBmcm9tICcuL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyc7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZUZhY3Rvcnk7XG5cbiJdfQ==
