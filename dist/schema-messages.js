(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MessageFactory = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

var _bower_componentsUtf8Utf8Js = require('../bower_components/utf8/utf8.js');

var _bower_componentsUtf8Utf8Js2 = _interopRequireDefault(_bower_componentsUtf8Utf8Js);

var _unpackersJs = require('./unpackers.js');

var unpackers = _interopRequireWildcard(_unpackersJs);

var _packersJs = require('./packers.js');

var packers = _interopRequireWildcard(_packersJs);

var _utilsJs = require('./utils.js');

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
    sizeLookup = {
	'bool': 1,
	'byte': 1,
	'ubyte': 1,
	'char': 1,
	'short': 2,
	'ushort': 2,
	'int': 4,
	'uint': 4,
	'int64': 8,
	'uint64': 8,
	'float': 4,
	'double': 8,
	'string': 4
},
    unpackerLookup = {},
    packerLookup = {};

// @TODO: we don't need binaryTypes any more, simplify
Object.keys(binaryTypes).forEach(function (typeName) {
	unpackerLookup[typeName] = unpackers['unpack' + typeName.charAt(0).toUpperCase() + typeName.slice(1)];
	packerLookup[typeName] = packers['pack' + typeName.charAt(0).toUpperCase() + typeName.slice(1)];
});

unpackerLookup['enum'] = unpackers.unpackEnum;
packerLookup['enum'] = packers.packEnum;

var MessageFactory = (function () {
	function MessageFactory(schema) {
		_classCallCheck(this, MessageFactory);

		var keys = Object.keys(schema).sort();
		this.msgClassesByName = {};
		this.msgClassesById = {};
		this.bytesNeededForId = (0, _utilsJs.getBytesToRepresent)(keys.length);
		this.idBinaryFormat = (0, _utilsJs.getBinaryFormatSymbol)(keys.length);
		this.idUnpacker = (0, _utilsJs.getUnpacker)(keys.length);
		this.idPacker = (0, _utilsJs.getPacker)(keys.length);

		keys.forEach((function (className, index) {
			var enums = {},
			    reverseEnums = {},
			    msgkeys = Object.keys(schema[className].format).sort(),
			    baseBinaryLength = this.bytesNeededForId,
			    msgunpackers = [],
			    msgpackers = [],
			    dynamicFieldsIndexes = [],
			    msgProperties = {};

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

			msgkeys.forEach(function (msgkey, msgkeyindex) {
				var unpacker = unpackerLookup[schema[className].format[msgkey]],
				    packer = packerLookup[schema[className].format[msgkey]];

				if (schema[className].format[msgkey] === 'enum') {
					msgunpackers.push(unpacker.bind(MessageClass, reverseEnums[msgkey], (0, _utilsJs.getUnpacker)(Object.keys(enums).length)));
					msgpackers.push(packer.bind(MessageClass, enums[msgkey], (0, _utilsJs.getPacker)(Object.keys(enums).length)));
					baseBinaryLength += (0, _utilsJs.getBytesToRepresent)(Object.keys(enums).length);
					msgProperties[msgkey] = {
						get: function get() {
							return this.Cls.reverseEnums[msgkey][this.raw[msgkey]];
						},
						set: function set(newValue) {
							this.raw[msgkey] = this.Cls.enums[msgkey][newValue];
						}
					};
				} else {
					msgunpackers.push(unpacker.bind(MessageClass));
					msgpackers.push(packer.bind(MessageClass));
					baseBinaryLength += sizeLookup[schema[className].format[msgkey]];

					if (schema[className].format[msgkey] === 'string') {
						dynamicFieldsIndexes.push(msgkeyindex);
						msgProperties[msgkey] = {
							get: function get() {
								return _bower_componentsUtf8Utf8Js2['default'].decode(this.raw[msgkey]);
							},
							set: function set(newValue) {
								this.binaryLength -= this.raw[msgkey].length;
								this.raw[msgkey] = _bower_componentsUtf8Utf8Js2['default'].encode(newValue);
								this.binaryLength += this.raw[msgkey].length;
							}
						};
					} else {
						msgProperties[msgkey] = {
							get: function get() {
								return this.raw[msgkey];
							},
							set: function set(newValue) {
								this.raw[msgkey] = newValue;
							}
						};
					}
				}
			});

			var properties = {
				'name': {
					value: className,
					writable: false
				},
				// 'binaryFormat': {
				// 	value: this.getBinaryFormat(schema[className]),
				// 	writable: false
				// },
				'format': {
					value: schema[className].format,
					writable: false
				},
				// 'schema': {
				// 	value: schema,
				// 	writable: false
				// },
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
				},
				'packers': {
					value: msgpackers,
					writable: false
				},
				'baseBinaryLength': {
					value: baseBinaryLength,
					writable: false
				},
				'msgProperties': {
					value: msgProperties,
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

	// getBinaryFormat(msgSchema) {
	// 	let fields = Object.keys(msgSchema.format).sort();
	// 		let binaryFormat = '!';  // we always use network (big-endian) byte order
	// 		binaryFormat += this.idBinaryFormat;

	// 		fields.forEach(function(field) {
	// 			if(msgSchema.format[field] === 'string') {
	// 				binaryFormat += 'I{}s';
	// 			}
	// 			else if(msgSchema.format[field] === 'enum') {
	// 				try {
	// 					binaryFormat += getBinaryFormatSymbol(Object.keys(msgSchema.format[field]).length);
	// 				} catch(e) {
	// 					throw `Enum field can contain the maximum number MAX_SUPPORTED_NUMBER possible values.`;
	// 				}
	// 			} else {
	// 				try {
	// 					binaryFormat += binaryTypes[msgSchema.format[field]];
	// 				} catch(e) {
	// 					throw `Unknown field type msgSchema.format[field].`;
	// 				}
	// 			}
	// 		});

	// 		return binaryFormat;
	// 	}

	_createClass(MessageFactory, [{
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
	}]);

	return MessageFactory;
})();

exports['default'] = MessageFactory;
module.exports = exports['default'];

},{"../bower_components/utf8/utf8.js":1,"./message.js":3,"./packers.js":4,"./unpackers.js":5,"./utils.js":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function MessageBase() {
	this.Cls = Object.getPrototypeOf(this);
	this.binaryLength = this.Cls.baseBinaryLength;
	this.raw = {};

	Object.defineProperties(this, this.Cls.msgProperties);
}

exports["default"] = MessageBase;
module.exports = exports["default"];

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.packBool = packBool;
exports.packByte = packByte;
exports.packUbyte = packUbyte;
exports.packShort = packShort;
exports.packUshort = packUshort;
exports.packInt = packInt;
exports.packUint = packUint;
exports.packInt64 = packInt64;
exports.packUint64 = packUint64;
exports.packFloat = packFloat;
exports.packDouble = packDouble;
exports.packString = packString;
exports.packEnum = packEnum;

function packBool(dv, pointer, value) {
	dv.setUInt8(pointer, value);
	return pointer + 1;
}

function packByte(dv, pointer, value) {
	dv.setInt8(pointer, value);
	return pointer + 1;
}

function packUbyte(dv, pointer, value) {
	dv.setUint8(pointer, value);
	return pointer + 1;
}

function packShort(dv, pointer, value) {
	dv.setInt16(pointer, value);
	return pointer + 2;
}

function packUshort(dv, pointer, value) {
	dv.setUint16(pointer, value);
	return pointer + 2;
}

function packInt(dv, pointer, value) {
	dv.setInt32(pointer, value);
	return pointer + 4;
}

function packUint(dv, pointer, value) {
	dv.setUint32(pointer, value);
	return pointer + 4;
}

function packInt64(dv, pointer, value) {
	dv.setInt64(pointer, value);
	return pointer + 8;
}

function packUint64(dv, pointer, value) {
	dv.setUint64(pointer, value);
	return pointer + 8;
}

function packFloat(dv, pointer, value) {
	dv.setFloat32(pointer, value);
	return pointer + 4;
}

function packDouble(dv, pointer, value) {
	dv.setFloat64(pointer, value);
	return pointer + 8;
}

function packString(dv, pointer, value) {
	var stringLength = value.length;

	pointer = packUint(dv, pointer, stringLength);

	for (var i = 0; i < stringLength; i++) {
		pointer = packUbyte(dv, pointer, value.charCodeAt(i));
	}

	return pointer;
}

function packEnum(enums, packer, dv, pointer, value) {
	return packer(dv, pointer, enums[value]);
}

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
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

	extracted.push(String.fromCharCode.apply(null, values));
	return pointer + stringLength;
}

function unpackEnum(reverseEnums, unpacker, dv, pointer, extracted) {
	var rawExtracted = [];
	pointer = unpacker(dv, pointer, rawExtracted);
	extracted.push(reverseEnums[rawExtracted.pop()]);
	return pointer;
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.getBytesToRepresent = getBytesToRepresent;
exports.getBinaryFormatSymbol = getBinaryFormatSymbol;
exports.getUnpacker = getUnpacker;
exports.getPacker = getPacker;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _unpackersJs = require('./unpackers.js');

var unpackers = _interopRequireWildcard(_unpackersJs);

var _packersJs = require('./packers.js');

var packers = _interopRequireWildcard(_packersJs);

function getBytesToRepresent(number) {
	return Math.ceil(Math.log(number + 1, 2) / 8);
}

function getBinaryFormatSymbol(number) {
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
}

function getUnpacker(number) {
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
}

function getPacker(number) {
	var bytesNeeded = getBytesToRepresent(number);

	if (bytesNeeded <= 1) {
		return packers.packUbyte;
	} else if (bytesNeeded === 2) {
		return packers.packUshort;
	} else if (bytesNeeded <= 4) {
		return packers.packUint;
	} else if (bytesNeeded <= 8) {
		return packers.packUint64;
	} else {
		throw 'No suitable unpacked could be found that could unpack $number';
	}
}

},{"./packers.js":4,"./unpackers.js":5}],7:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jsMessageFactoryJs = require('./js/message-factory.js');

var _jsMessageFactoryJs2 = _interopRequireDefault(_jsMessageFactoryJs);

module.exports = _jsMessageFactoryJs2['default'];

},{"./js/message-factory.js":2}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9qcy9wYWNrZXJzLmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvanMvdW5wYWNrZXJzLmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvanMvdXRpbHMuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0NBLENBQUMsQUFBQyxDQUFBLFVBQVMsSUFBSSxFQUFFOzs7QUFHaEIsS0FBSSxXQUFXLEdBQUcsT0FBTyxPQUFPLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQzs7O0FBR3hELEtBQUksVUFBVSxHQUFHLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLElBQ25ELE1BQU0sQ0FBQyxPQUFPLElBQUksV0FBVyxJQUFJLE1BQU0sQ0FBQzs7OztBQUl6QyxLQUFJLFVBQVUsR0FBRyxPQUFPLE1BQU0sSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDO0FBQ3JELEtBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7QUFDekUsTUFBSSxHQUFHLFVBQVUsQ0FBQztFQUNsQjs7OztBQUlELEtBQUksa0JBQWtCLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQzs7O0FBRzdDLFVBQVMsVUFBVSxD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NUMsR0FBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUIsUUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0NBQ25COztBQUVNLFNBQVMsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzVDLEdBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNCLFFBQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztDQUNuQjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUM3QyxHQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QixRQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDN0MsR0FBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUIsUUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0NBQ25COztBQUVNLFNBQVMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzlDLEdBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFFBQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztDQUNuQjs7QUFFTSxTQUFTLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUMzQyxHQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QixRQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDNUMsR0FBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDN0IsUUFBTyxPQUFPLEdB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SUFBSSxDQUFDLEVBQUU7QUFDcEIsU0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDO0VBQ3pCLE1BQU0sSUFBRyxXQUFXLEtBQUssQ0FBQyxFQUFFO0FBQzVCLFNBQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQztFQUMxQixNQUFNLElBQUcsV0FBVyxJQUFJLENBQUMsRUFBRTtBQUMzQixTQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUM7RUFDeEIsTUFBTSxJQUFHLFdBQVcsSUFBSSxDQUFDLEVBQUU7QUFDM0IsU0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDO0VBQzFCLE1BQU07QUFDTix3RUFBc0U7RUFDdEU7Q0FDRDs7Ozs7OztrQ0NyRDBCLHlCQUF5Qjs7OztBQUVwRCxNQUFNLENBQUMsT0FBTyxrQ0FBaUIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiEgaHR0cDovL210aHMuYmUvdXRmOGpzIHYyLjAuMCBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYFxuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgXG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSxcblx0Ly8gYW5kIHVzZSBpdCBhcyBgcm9vdGBcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgc3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuXHQvLyBUYWtlbiBmcm9tIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdO1xuXHRcdHZhciBjb3VudGVyID0gMDtcblx0XHR2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcblx0XHR2YXIgdmFsdWU7XG5cdFx0dmFyIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8vIFRha2VuIGZyb20gaHR0cDovL210aHMuYmUvcHVueWNvZGVcblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIHZhbHVlO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBhcnJheVtpbmRleF07XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0ZnVuY3Rpb24gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIHNoaWZ0KSB7XG5cdFx0cmV0dXJuIHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiBzaGlmdCkgJiAweDNGKSB8IDB4ODApO1xuXHR9XG5cblx0ZnVuY3Rpb24gZW5jb2RlQ29kZVBvaW50KGNvZGVQb2ludCkge1xuXHRcdGlmICgoY29kZVBvaW50ICYgMHhGRkZGRkY4MCkgPT0gMCkgeyAvLyAxLWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHJldHVybiBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50KTtcblx0XHR9XG5cdFx0dmFyIHN5bWJvbCA9ICcnO1xuXHRcdGlmICgoY29kZVBvaW50ICYgMHhGRkZGRjgwMCkgPT0gMCkgeyAvLyAyLWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiA2KSAmIDB4MUYpIHwgMHhDMCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKChjb2RlUG9pbnQgJiAweEZGRkYwMDAwKSA9PSAwKSB7IC8vIDMtYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0c3ltYm9sID0gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IDEyKSAmIDB4MEYpIHwgMHhFMCk7XG5cdFx0XHRzeW1ib2wgKz0gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIDYpO1xuXHRcdH1cblx0XHRlbHNlIGlmICgoY29kZVBvaW50ICYgMHhGRkUwMDAwMCkgPT0gMCkgeyAvLyA0LWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiAxOCkgJiAweDA3KSB8IDB4RjApO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCAxMik7XG5cdFx0XHRzeW1ib2wgKz0gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIDYpO1xuXHRcdH1cblx0XHRzeW1ib2wgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKChjb2RlUG9pbnQgJiAweDNGKSB8IDB4ODApO1xuXHRcdHJldHVybiBzeW1ib2w7XG5cdH1cblxuXHRmdW5jdGlvbiB1dGY4ZW5jb2RlKHN0cmluZykge1xuXHRcdHZhciBjb2RlUG9pbnRzID0gdWNzMmRlY29kZShzdHJpbmcpO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoY29kZVBvaW50cy5tYXAoZnVuY3Rpb24oeCkge1xuXHRcdC8vIFx0cmV0dXJuICdVKycgKyB4LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuXHRcdC8vIH0pKSk7XG5cblx0XHR2YXIgbGVuZ3RoID0gY29kZVBvaW50cy5sZW5ndGg7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIGNvZGVQb2ludDtcblx0XHR2YXIgYnl0ZVN0cmluZyA9ICcnO1xuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0XHRjb2RlUG9pbnQgPSBjb2RlUG9pbnRzW2luZGV4XTtcblx0XHRcdGJ5dGVTdHJpbmcgKz0gZW5jb2RlQ29kZVBvaW50KGNvZGVQb2ludCk7XG5cdFx0fVxuXHRcdHJldHVybiBieXRlU3RyaW5nO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0ZnVuY3Rpb24gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKSB7XG5cdFx0aWYgKGJ5dGVJbmRleCA+PSBieXRlQ291bnQpIHtcblx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGJ5dGUgaW5kZXgnKTtcblx0XHR9XG5cblx0XHR2YXIgY29udGludWF0aW9uQnl0ZSA9IGJ5dGVBcnJheVtieXRlSW5kZXhdICYgMHhGRjtcblx0XHRieXRlSW5kZXgrKztcblxuXHRcdGlmICgoY29udGludWF0aW9uQnl0ZSAmIDB4QzApID09IDB4ODApIHtcblx0XHRcdHJldHVybiBjb250aW51YXRpb25CeXRlICYgMHgzRjtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBlbmQgdXAgaGVyZSwgaXTigJlzIG5vdCBhIGNvbnRpbnVhdGlvbiBieXRlXG5cdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZVN5bWJvbCgpIHtcblx0XHR2YXIgYnl0ZTE7XG5cdFx0dmFyIGJ5dGUyO1xuXHRcdHZhciBieXRlMztcblx0XHR2YXIgYnl0ZTQ7XG5cdFx0dmFyIGNvZGVQb2ludDtcblxuXHRcdGlmIChieXRlSW5kZXggPiBieXRlQ291bnQpIHtcblx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGJ5dGUgaW5kZXgnKTtcblx0XHR9XG5cblx0XHRpZiAoYnl0ZUluZGV4ID09IGJ5dGVDb3VudCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIFJlYWQgZmlyc3QgYnl0ZVxuXHRcdGJ5dGUxID0gYnl0ZUFycmF5W2J5dGVJbmRleF0gJiAweEZGO1xuXHRcdGJ5dGVJbmRleCsrO1xuXG5cdFx0Ly8gMS1ieXRlIHNlcXVlbmNlIChubyBjb250aW51YXRpb24gYnl0ZXMpXG5cdFx0aWYgKChieXRlMSAmIDB4ODApID09IDApIHtcblx0XHRcdHJldHVybiBieXRlMTtcblx0XHR9XG5cblx0XHQvLyAyLWJ5dGUgc2VxdWVuY2Vcblx0XHRpZiAoKGJ5dGUxICYgMHhFMCkgPT0gMHhDMCkge1xuXHRcdFx0dmFyIGJ5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGNvZGVQb2ludCA9ICgoYnl0ZTEgJiAweDFGKSA8PCA2KSB8IGJ5dGUyO1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDgwKSB7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDMtYnl0ZSBzZXF1ZW5jZSAobWF5IGluY2x1ZGUgdW5wYWlyZWQgc3Vycm9nYXRlcylcblx0XHRpZiAoKGJ5dGUxICYgMHhGMCkgPT0gMHhFMCkge1xuXHRcdFx0Ynl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MEYpIDw8IDEyKSB8IChieXRlMiA8PCA2KSB8IGJ5dGUzO1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDA4MDApIHtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gNC1ieXRlIHNlcXVlbmNlXG5cdFx0aWYgKChieXRlMSAmIDB4RjgpID09IDB4RjApIHtcblx0XHRcdGJ5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGJ5dGUzID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGJ5dGU0ID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGNvZGVQb2ludCA9ICgoYnl0ZTEgJiAweDBGKSA8PCAweDEyKSB8IChieXRlMiA8PCAweDBDKSB8XG5cdFx0XHRcdChieXRlMyA8PCAweDA2KSB8IGJ5dGU0O1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDAxMDAwMCAmJiBjb2RlUG9pbnQgPD0gMHgxMEZGRkYpIHtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBVVEYtOCBkZXRlY3RlZCcpO1xuXHR9XG5cblx0dmFyIGJ5dGVBcnJheTtcblx0dmFyIGJ5dGVDb3VudDtcblx0dmFyIGJ5dGVJbmRleDtcblx0ZnVuY3Rpb24gdXRmOGRlY29kZShieXRlU3RyaW5nKSB7XG5cdFx0Ynl0ZUFycmF5ID0gdWNzMmRlY29kZShieXRlU3RyaW5nKTtcblx0XHRieXRlQ291bnQgPSBieXRlQXJyYXkubGVuZ3RoO1xuXHRcdGJ5dGVJbmRleCA9IDA7XG5cdFx0dmFyIGNvZGVQb2ludHMgPSBbXTtcblx0XHR2YXIgdG1wO1xuXHRcdHdoaWxlICgodG1wID0gZGVjb2RlU3ltYm9sKCkpICE9PSBmYWxzZSkge1xuXHRcdFx0Y29kZVBvaW50cy5wdXNoKHRtcCk7XG5cdFx0fVxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKGNvZGVQb2ludHMpO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIHV0ZjggPSB7XG5cdFx0J3ZlcnNpb24nOiAnMi4wLjAnLFxuXHRcdCdlbmNvZGUnOiB1dGY4ZW5jb2RlLFxuXHRcdCdkZWNvZGUnOiB1dGY4ZGVjb2RlXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdXRmODtcblx0XHR9KTtcblx0fVx0ZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHV0Zjg7XG5cdFx0fSBlbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdHZhciBvYmplY3QgPSB7fTtcblx0XHRcdHZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdC5oYXNPd25Qcm9wZXJ0eTtcblx0XHRcdGZvciAodmFyIGtleSBpbiB1dGY4KSB7XG5cdFx0XHRcdGhhc093blByb3BlcnR5LmNhbGwodXRmOCwga2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHV0Zjhba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC51dGY4ID0gdXRmODtcblx0fVxuXG59KHRoaXMpKTtcbiIsIi8vIGltcG9ydCBzdHJ1Y3QgZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy9qc3BhY2stYXJyYXlidWZmZXIvc3RydWN0LmpzJztcbmltcG9ydCBNZXNzYWdlQmFzZSBmcm9tICcuL21lc3NhZ2UuanMnO1xuLy8gaW1wb3J0IHN0cmluZ0Zvcm1hdCBmcm9tICcuL3N0cmluZy1mb3JtYXQuanMnO1xuaW1wb3J0IHV0ZjggZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy91dGY4L3V0ZjguanMnO1xuaW1wb3J0ICogYXMgdW5wYWNrZXJzIGZyb20gJy4vdW5wYWNrZXJzLmpzJztcbmltcG9ydCAqIGFzIHBhY2tlcnMgZnJvbSAnLi9wYWNrZXJzLmpzJztcblxuaW1wb3J0IHtcblx0Z2V0Qnl0ZXNUb1JlcHJlc2VudCxcblx0Z2V0QmluYXJ5Rm9ybWF0U3ltYm9sLFxuXHRnZXRVbnBhY2tlcixcblx0Z2V0UGFja2VyXG59IGZyb20gJy4vdXRpbHMuanMnO1xuXG5cbmNvbnN0IE1BWF9TVVBQT1JURURfTlVNQkVSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgPiBNYXRoLnBvdygyLCA2NCkgLSAxID8gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgOiBNYXRoLnBvdygyLCA2NCkgLSAxOyAvL2VzbGludC1kaXNhYmxlLWxpbmVcblxubGV0IGJpbmFyeVR5cGVzID0ge1xuXHRcdCdib29sJzogJz8nLFxuXHRcdCdieXRlJzogJ2InLFxuXHRcdCd1Ynl0ZSc6ICdCJyxcblx0XHQnY2hhcic6ICdjJyxcblx0XHQnc2hvcnQnOiAnaCcsXG5cdFx0J3VzaG9ydCc6ICdIJyxcblx0XHQnaW50JzogJ2knLFxuXHRcdCd1aW50JzogJ0knLFxuXHRcdCdpbnQ2NCc6ICdxJyxcblx0XHQndWludDY0JzogJ1EnLFxuXHRcdCdmbG9hdCc6ICdmJyxcblx0XHQnZG91YmxlJzogJ2QnLFxuXHRcdCdzdHJpbmcnOiAncydcblx0fSxcblx0c2l6ZUxvb2t1cCA9IHtcblx0XHQnYm9vbCc6IDEsXG5cdFx0J2J5dGUnOiAxLFxuXHRcdCd1Ynl0ZSc6IDEsXG5cdFx0J2NoYXInOiAxLFxuXHRcdCdzaG9ydCc6IDIsXG5cdFx0J3VzaG9ydCc6IDIsXG5cdFx0J2ludCc6IDQsXG5cdFx0J3VpbnQnOiA0LFxuXHRcdCdpbnQ2NCc6IDgsXG5cdFx0J3VpbnQ2NCc6IDgsXG5cdFx0J2Zsb2F0JzogNCxcblx0XHQnZG91YmxlJzogOCxcblx0XHQnc3RyaW5nJzogNFxuXHR9LFxuXHR1bnBhY2tlckxvb2t1cCA9IHt9LFxuXHRwYWNrZXJMb29rdXAgPSB7fTtcblxuLy8gQFRPRE86IHdlIGRvbid0IG5lZWQgYmluYXJ5VHlwZXMgYW55IG1vcmUsIHNpbXBsaWZ5XG5PYmplY3Qua2V5cyhiaW5hcnlUeXBlcykuZm9yRWFjaChmdW5jdGlvbih0eXBlTmFtZSkge1xuXHR1bnBhY2tlckxvb2t1cFt0eXBlTmFtZV0gPSB1bnBhY2tlcnNbJ3VucGFjaycgKyB0eXBlTmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR5cGVOYW1lLnNsaWNlKDEpXTtcblx0cGFja2VyTG9va3VwW3R5cGVOYW1lXSA9IHBhY2tlcnNbJ3BhY2snICsgdHlwZU5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eXBlTmFtZS5zbGljZSgxKV07XG59KTtcblxudW5wYWNrZXJMb29rdXAuZW51bSA9IHVucGFja2Vycy51bnBhY2tFbnVtO1xucGFja2VyTG9va3VwLmVudW0gPSBwYWNrZXJzLnBhY2tFbnVtO1xuXG5jbGFzcyBNZXNzYWdlRmFjdG9yeSB7XG5cdGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuXHRcdGxldCBrZXlzID0gT2JqZWN0LmtleXMoc2NoZW1hKS5zb3J0KCk7XG5cdFx0dGhpcy5tc2dDbGFzc2VzQnlOYW1lID0ge307XG5cdFx0dGhpcy5tc2dDbGFzc2VzQnlJZCA9IHt9O1xuXHRcdHRoaXMuYnl0ZXNOZWVkZWRGb3JJZCA9IGdldEJ5dGVzVG9SZXByZXNlbnQoa2V5cy5sZW5ndGgpO1xuXHRcdHRoaXMuaWRCaW5hcnlGb3JtYXQgPSBnZXRCaW5hcnlGb3JtYXRTeW1ib2woa2V5cy5sZW5ndGgpO1xuXHRcdHRoaXMuaWRVbnBhY2tlciA9IGdldFVucGFja2VyKGtleXMubGVuZ3RoKTtcblx0XHR0aGlzLmlkUGFja2VyID0gZ2V0UGFja2VyKGtleXMubGVuZ3RoKTtcblxuXHRcdGtleXMuZm9yRWFjaChmdW5jdGlvbihjbGFzc05hbWUsIGluZGV4KSB7XG5cdFx0XHR2YXIgZW51bXMgPSB7fSxcblx0XHRcdFx0cmV2ZXJzZUVudW1zID0ge30sXG5cdFx0XHRcdG1zZ2tleXMgPSBPYmplY3Qua2V5cyhzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXQpLnNvcnQoKSxcblx0XHRcdFx0YmFzZUJpbmFyeUxlbmd0aCA9IHRoaXMuYnl0ZXNOZWVkZWRGb3JJZCxcblx0XHRcdFx0bXNndW5wYWNrZXJzID0gW10sXG5cdFx0XHRcdG1zZ3BhY2tlcnMgPSBbXSxcblx0XHRcdFx0ZHluYW1pY0ZpZWxkc0luZGV4ZXMgPSBbXSxcblx0XHRcdFx0bXNnUHJvcGVydGllcyA9IHt9O1xuXG5cblxuXHRcdFx0aWYoc2NoZW1hW2NsYXNzTmFtZV0uZW51bXMpIHtcblx0XHRcdFx0Zm9yKGxldCBlbnVtTmFtZSBpbiBzY2hlbWFbY2xhc3NOYW1lXS5lbnVtcykge1xuXHRcdFx0XHRcdGxldCBlbnVtVmFsdWVzID0gc2NoZW1hW2NsYXNzTmFtZV0uZW51bXNbZW51bU5hbWVdO1xuXHRcdFx0XHRcdGVudW1zW2VudW1OYW1lXSA9IHt9O1xuXHRcdFx0XHRcdHJldmVyc2VFbnVtc1tlbnVtTmFtZV0gPSB7fTtcblx0XHRcdFx0XHRmb3IobGV0IGVudW1LZXkgaW4gZW51bVZhbHVlcykge1xuXHRcdFx0XHRcdFx0bGV0IGVudW1WYWx1ZSA9IGVudW1WYWx1ZXNbZW51bUtleV07XG5cdFx0XHRcdFx0XHRlbnVtc1tlbnVtTmFtZV1bZW51bUtleV0gPSBlbnVtVmFsdWU7XG5cdFx0XHRcdFx0XHRyZXZlcnNlRW51bXNbZW51bU5hbWVdW2VudW1WYWx1ZV0gPSBlbnVtS2V5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgTWVzc2FnZUNsYXNzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdE1lc3NhZ2VCYXNlLmNhbGwodGhpcyk7XG5cdFx0XHR9O1xuXG5cdFx0XHRtc2drZXlzLmZvckVhY2goZnVuY3Rpb24obXNna2V5LCBtc2drZXlpbmRleCkge1xuXHRcdFx0XHRsZXQgdW5wYWNrZXIgPSB1bnBhY2tlckxvb2t1cFtzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XV0sXG5cdFx0XHRcdHBhY2tlciA9IHBhY2tlckxvb2t1cFtzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XV07XG5cblx0XHRcdFx0aWYoc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0W21zZ2tleV0gPT09ICdlbnVtJykge1xuXHRcdFx0XHRcdG1zZ3VucGFja2Vycy5wdXNoKHVucGFja2VyLmJpbmQoTWVzc2FnZUNsYXNzLCByZXZlcnNlRW51bXNbbXNna2V5XSwgZ2V0VW5wYWNrZXIoT2JqZWN0LmtleXMoZW51bXMpLmxlbmd0aCkpKTtcblx0XHRcdFx0XHRtc2dwYWNrZXJzLnB1c2gocGFja2VyLmJpbmQoTWVzc2FnZUNsYXNzLCBlbnVtc1ttc2drZXldLCBnZXRQYWNrZXIoT2JqZWN0LmtleXMoZW51bXMpLmxlbmd0aCkpKTtcblx0XHRcdFx0XHRiYXNlQmluYXJ5TGVuZ3RoICs9IGdldEJ5dGVzVG9SZXByZXNlbnQoT2JqZWN0LmtleXMoZW51bXMpLmxlbmd0aCk7XG5cdFx0XHRcdFx0bXNnUHJvcGVydGllc1ttc2drZXldID0ge1xuXHRcdFx0XHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuQ2xzLnJldmVyc2VFbnVtc1ttc2drZXldW3RoaXMucmF3W21zZ2tleV1dO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHNldDogZnVuY3Rpb24obmV3VmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yYXdbbXNna2V5XSA9IHRoaXMuQ2xzLmVudW1zW21zZ2tleV1bbmV3VmFsdWVdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bXNndW5wYWNrZXJzLnB1c2godW5wYWNrZXIuYmluZChNZXNzYWdlQ2xhc3MpKTtcblx0XHRcdFx0XHRtc2dwYWNrZXJzLnB1c2gocGFja2VyLmJpbmQoTWVzc2FnZUNsYXNzKSk7XG5cdFx0XHRcdFx0YmFzZUJpbmFyeUxlbmd0aCArPSBzaXplTG9va3VwW3NjaGVtYVtjbGFzc05hbWVdLmZvcm1hdFttc2drZXldXTtcblxuXHRcdFx0XHRcdGlmKHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdFttc2drZXldID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdFx0ZHluYW1pY0ZpZWxkc0luZGV4ZXMucHVzaChtc2drZXlpbmRleCk7XG5cdFx0XHRcdFx0XHRtc2dQcm9wZXJ0aWVzW21zZ2tleV0gPSB7XG5cdFx0XHRcdFx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHV0ZjguZGVjb2RlKHRoaXMucmF3W21zZ2tleV0pO1xuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5iaW5hcnlMZW5ndGggLT0gdGhpcy5yYXdbbXNna2V5XS5sZW5ndGg7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5yYXdbbXNna2V5XSA9IHV0ZjguZW5jb2RlKG5ld1ZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmJpbmFyeUxlbmd0aCArPSB0aGlzLnJhd1ttc2drZXldLmxlbmd0aDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bXNnUHJvcGVydGllc1ttc2drZXldID0ge1xuXHRcdFx0XHRcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0aGlzLnJhd1ttc2drZXldO1xuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5yYXdbbXNna2V5XSA9IG5ld1ZhbHVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBwcm9wZXJ0aWVzID0ge1xuXHRcdFx0XHQnbmFtZSc6IHtcblx0XHRcdFx0XHR2YWx1ZTogY2xhc3NOYW1lLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQvLyAnYmluYXJ5Rm9ybWF0Jzoge1xuXHRcdFx0XHQvLyBcdHZhbHVlOiB0aGlzLmdldEJpbmFyeUZvcm1hdChzY2hlbWFbY2xhc3NOYW1lXSksXG5cdFx0XHRcdC8vIFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdC8vIH0sXG5cdFx0XHRcdCdmb3JtYXQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly8gJ3NjaGVtYSc6IHtcblx0XHRcdFx0Ly8gXHR2YWx1ZTogc2NoZW1hLFxuXHRcdFx0XHQvLyBcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHQvLyB9LFxuXHRcdFx0XHQnaWQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IGluZGV4ICsgMSxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2VudW1zJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBlbnVtcyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3JldmVyc2VFbnVtcyc6IHtcblx0XHRcdFx0XHR2YWx1ZTogcmV2ZXJzZUVudW1zLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnbGVuZ3RoJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBtc2drZXlzLmxlbmd0aCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2tleXMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ2tleXMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCd1bnBhY2tlcnMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ3VucGFja2Vycyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3BhY2tlcnMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ3BhY2tlcnMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdiYXNlQmluYXJ5TGVuZ3RoJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBiYXNlQmluYXJ5TGVuZ3RoLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnbXNnUHJvcGVydGllcyc6IHtcblx0XHRcdFx0XHR2YWx1ZTogbXNnUHJvcGVydGllcyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gQFRPRE8gcmV2aXNpdCBpZiBzZXR0aW5nIHByb3BlcnRpZXMgbGlrZSB0aGlzIGNhbiBiZSBhdm9pZGVkXG5cdFx0XHRNZXNzYWdlQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNZXNzYWdlQmFzZS5wcm90b3R5cGUsIHByb3BlcnRpZXMpO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTWVzc2FnZUNsYXNzLCBwcm9wZXJ0aWVzKTtcblxuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlJZFtpbmRleCArIDFdID0gTWVzc2FnZUNsYXNzO1xuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlOYW1lW2NsYXNzTmFtZV0gPSBNZXNzYWdlQ2xhc3M7XG5cdFx0fS5iaW5kKHRoaXMpKTtcbn1cblxuLy8gZ2V0QmluYXJ5Rm9ybWF0KG1zZ1NjaGVtYSkge1xuLy8gXHRsZXQgZmllbGRzID0gT2JqZWN0LmtleXMobXNnU2NoZW1hLmZvcm1hdCkuc29ydCgpO1xuLy8gXHRcdGxldCBiaW5hcnlGb3JtYXQgPSAnISc7ICAvLyB3ZSBhbHdheXMgdXNlIG5ldHdvcmsgKGJpZy1lbmRpYW4pIGJ5dGUgb3JkZXJcbi8vIFx0XHRiaW5hcnlGb3JtYXQgKz0gdGhpcy5pZEJpbmFyeUZvcm1hdDtcblxuLy8gXHRcdGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XG4vLyBcdFx0XHRpZihtc2dTY2hlbWEuZm9ybWF0W2ZpZWxkXSA9PT0gJ3N0cmluZycpIHtcbi8vIFx0XHRcdFx0YmluYXJ5Rm9ybWF0ICs9ICdJe31zJztcbi8vIFx0XHRcdH1cbi8vIFx0XHRcdGVsc2UgaWYobXNnU2NoZW1hLmZvcm1hdFtmaWVsZF0gPT09ICdlbnVtJykge1xuLy8gXHRcdFx0XHR0cnkge1xuLy8gXHRcdFx0XHRcdGJpbmFyeUZvcm1hdCArPSBnZXRCaW5hcnlGb3JtYXRTeW1ib2woT2JqZWN0LmtleXMobXNnU2NoZW1hLmZvcm1hdFtmaWVsZF0pLmxlbmd0aCk7XG4vLyBcdFx0XHRcdH0gY2F0Y2goZSkge1xuLy8gXHRcdFx0XHRcdHRocm93IGBFbnVtIGZpZWxkIGNhbiBjb250YWluIHRoZSBtYXhpbXVtIG51bWJlciBNQVhfU1VQUE9SVEVEX05VTUJFUiBwb3NzaWJsZSB2YWx1ZXMuYDtcbi8vIFx0XHRcdFx0fVxuLy8gXHRcdFx0fSBlbHNlIHtcbi8vIFx0XHRcdFx0dHJ5IHtcbi8vIFx0XHRcdFx0XHRiaW5hcnlGb3JtYXQgKz0gYmluYXJ5VHlwZXNbbXNnU2NoZW1hLmZvcm1hdFtmaWVsZF1dO1xuLy8gXHRcdFx0XHR9IGNhdGNoKGUpIHtcbi8vIFx0XHRcdFx0XHR0aHJvdyBgVW5rbm93biBmaWVsZCB0eXBlIG1zZ1NjaGVtYS5mb3JtYXRbZmllbGRdLmA7XG4vLyBcdFx0XHRcdH1cbi8vIFx0XHRcdH1cbi8vIFx0XHR9KTtcblxuLy8gXHRcdHJldHVybiBiaW5hcnlGb3JtYXQ7XG4vLyBcdH1cblxuXHRnZXRCeU5hbWUobmFtZSkge1xuXHRcdHJldHVybiB0aGlzLm1zZ0NsYXNzZXNCeU5hbWVbbmFtZV07XG5cdH1cblxuXHRnZXRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMubXNnQ2xhc3Nlc0J5SWRbaWRdO1xuXHR9XG5cblx0Z2V0KGlkT3JOYW1lKSB7XG5cdFx0aWYoIWlzTmFOKHBhcnNlSW50KGlkT3JOYW1lKSkgJiYgaXNGaW5pdGUoaWRPck5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRCeUlkKGlkT3JOYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QnlOYW1lKGlkT3JOYW1lKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUZhY3Rvcnk7XG4iLCJmdW5jdGlvbiBNZXNzYWdlQmFzZSgpIHtcblx0dGhpcy5DbHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyk7XG5cdHRoaXMuYmluYXJ5TGVuZ3RoID0gdGhpcy5DbHMuYmFzZUJpbmFyeUxlbmd0aDtcblx0dGhpcy5yYXcgPSB7fTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB0aGlzLkNscy5tc2dQcm9wZXJ0aWVzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUJhc2U7XG4iLCJleHBvcnQgZnVuY3Rpb24gcGFja0Jvb2woZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVJbnQ4KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja0J5dGUoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldEludDgocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrVWJ5dGUoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVpbnQ4KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1Nob3J0KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRJbnQxNihwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tVc2hvcnQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVpbnQxNihwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tJbnQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldEludDMyKHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1VpbnQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVpbnQzMihwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tJbnQ2NChkdiwgcG9pbnRlciwgdmFsdWUpIHtcblx0ZHYuc2V0SW50NjQocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrVWludDY0KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRVaW50NjQocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrRmxvYXQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldEZsb2F0MzIocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrRG91YmxlKGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRGbG9hdDY0KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1N0cmluZyhkdiwgcG9pbnRlciwgdmFsdWUpIHtcblx0bGV0IHN0cmluZ0xlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblxuXHRwb2ludGVyID0gcGFja1VpbnQoZHYsIHBvaW50ZXIsIHN0cmluZ0xlbmd0aCk7XG5cblx0Zm9yKGxldCBpID0gMDsgaSA8IHN0cmluZ0xlbmd0aDsgaSsrKSB7XG5cdFx0cG9pbnRlciA9IHBhY2tVYnl0ZShkdiwgcG9pbnRlciwgdmFsdWUuY2hhckNvZGVBdChpKSk7XG5cdH1cblxuXHRyZXR1cm4gcG9pbnRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tFbnVtKGVudW1zLCBwYWNrZXIsIGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRyZXR1cm4gcGFja2VyKGR2LCBwb2ludGVyLCBlbnVtc1t2YWx1ZV0pO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHVucGFja0Jvb2woZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRVSW50OChwb2ludGVyKSA9PT0gMSk7XG5cdHJldHVybiBwb2ludGVyICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0J5dGUoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRJbnQ4KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrVWJ5dGUoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRVaW50OChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1Nob3J0KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0SW50MTYocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tVc2hvcnQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRVaW50MTYocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tJbnQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRJbnQzMihwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1VpbnQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRVaW50MzIocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tJbnQ2NChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEludDY0KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrVWludDY0KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VWludDY0KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrRmxvYXQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRGbG9hdDMyKHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrRG91YmxlKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0RmxvYXQ2NChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgODtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1N0cmluZyhkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdHZhciBzdHJpbmdMZW5ndGggPSBkdi5nZXRVaW50MzIocG9pbnRlciksXG5cdFx0dmFsdWVzID0gW10sXG5cdFx0aTtcblxuXHRwb2ludGVyICs9IDQ7XG5cblx0Zm9yKGkgPSAwOyBpIDwgc3RyaW5nTGVuZ3RoOyBpKyspIHtcblx0XHR2YWx1ZXMucHVzaChkdi5nZXRVaW50OChwb2ludGVyICsgaSkpO1xuXHR9XG5cblx0ZXh0cmFjdGVkLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB2YWx1ZXMpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyBzdHJpbmdMZW5ndGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tFbnVtKHJldmVyc2VFbnVtcywgdW5wYWNrZXIsIGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0dmFyIHJhd0V4dHJhY3RlZCA9IFtdO1xuXHRwb2ludGVyID0gdW5wYWNrZXIoZHYsIHBvaW50ZXIsIHJhd0V4dHJhY3RlZCk7XG5cdGV4dHJhY3RlZC5wdXNoKHJldmVyc2VFbnVtc1tyYXdFeHRyYWN0ZWQucG9wKCldKTtcblx0cmV0dXJuIHBvaW50ZXI7XG59XG4iLCJpbXBvcnQgKiBhcyB1bnBhY2tlcnMgZnJvbSAnLi91bnBhY2tlcnMuanMnO1xuaW1wb3J0ICogYXMgcGFja2VycyBmcm9tICcuL3BhY2tlcnMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qnl0ZXNUb1JlcHJlc2VudChudW1iZXIpIHtcblx0cmV0dXJuIE1hdGguY2VpbChNYXRoLmxvZyhudW1iZXIgKyAxLCAyKSAvIDgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluYXJ5Rm9ybWF0U3ltYm9sKG51bWJlcikge1xuXHRsZXQgYnl0ZXNOZWVkZWQgPSBnZXRCeXRlc1RvUmVwcmVzZW50KG51bWJlcik7XG5cblx0aWYoYnl0ZXNOZWVkZWQgPD0gMSkge1xuXHRcdHJldHVybiAnQic7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA9PT0gMikge1xuXHRcdHJldHVybiAnSCc7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA0KSB7XG5cdFx0cmV0dXJuICdJJztcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDgpIHtcblx0XHRyZXR1cm4gJ1EnO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IGBVbmFibGUgdG8gcmVwcmVzZW50IG51bWJlciAkbnVtYmVyIGluIHBhY2tlZCBzdHJ1Y3R1cmVgO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbnBhY2tlcihudW1iZXIpIHtcblx0bGV0IGJ5dGVzTmVlZGVkID0gZ2V0Qnl0ZXNUb1JlcHJlc2VudChudW1iZXIpO1xuXG5cdGlmKGJ5dGVzTmVlZGVkIDw9IDEpIHtcblx0XHRyZXR1cm4gdW5wYWNrZXJzLnVucGFja1VieXRlO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPT09IDIpIHtcblx0XHRyZXR1cm4gdW5wYWNrZXJzLnVucGFja1VzaG9ydDtcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDQpIHtcblx0XHRyZXR1cm4gdW5wYWNrZXJzLnVucGFja1VpbnQ7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA4KSB7XG5cdFx0cmV0dXJuIHVucGFja2Vycy51bnBhY2tVaW50NjQ7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgYE5vIHN1aXRhYmxlIHVucGFja2VkIGNvdWxkIGJlIGZvdW5kIHRoYXQgY291bGQgdW5wYWNrICRudW1iZXJgO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYWNrZXIobnVtYmVyKSB7XG5cdGxldCBieXRlc05lZWRlZCA9IGdldEJ5dGVzVG9SZXByZXNlbnQobnVtYmVyKTtcblxuXHRpZihieXRlc05lZWRlZCA8PSAxKSB7XG5cdFx0cmV0dXJuIHBhY2tlcnMucGFja1VieXRlO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPT09IDIpIHtcblx0XHRyZXR1cm4gcGFja2Vycy5wYWNrVXNob3J0O1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPD0gNCkge1xuXHRcdHJldHVybiBwYWNrZXJzLnBhY2tVaW50O1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPD0gOCkge1xuXHRcdHJldHVybiBwYWNrZXJzLnBhY2tVaW50NjQ7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgYE5vIHN1aXRhYmxlIHVucGFja2VkIGNvdWxkIGJlIGZvdW5kIHRoYXQgY291bGQgdW5wYWNrICRudW1iZXJgO1xuXHR9XG59XG4iLCJpbXBvcnQgTWVzc2FnZUZhY3RvcnkgZnJvbSAnLi9qcy9tZXNzYWdlLWZhY3RvcnkuanMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VGYWN0b3J5O1xuXG4iXX0=
