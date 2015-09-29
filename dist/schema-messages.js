(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.schemaMessages = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.getEnumAccessors = getEnumAccessors;
exports.getStringAccessors = getStringAccessors;
exports.getRawAccessor = getRawAccessor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bower_componentsUtf8Utf8Js = require('../bower_components/utf8/utf8.js');

var _bower_componentsUtf8Utf8Js2 = _interopRequireDefault(_bower_componentsUtf8Utf8Js);

function getEnumAccessors(msgkey) {
	return {
		get: function get() {
			return this.Cls.reverseEnums[msgkey][this.raw[msgkey]];
		},
		set: function set(newValue) {
			this.raw[msgkey] = this.Cls.enums[msgkey][newValue];
		}
	};
}

function getStringAccessors(msgkey) {
	return {
		get: function get() {
			return _bower_componentsUtf8Utf8Js2['default'].decode(this.raw[msgkey]);
		},
		set: function set(newValue) {
			this.binaryLength -= this.raw[msgkey] && this.raw[msgkey].length || 0;
			this.raw[msgkey] = _bower_componentsUtf8Utf8Js2['default'].encode(newValue);
			this.binaryLength += this.raw[msgkey].length;
		}
	};
}

function getRawAccessor(msgkey) {
	return {
		get: function get() {
			return this.raw[msgkey];
		},
		set: function set(newValue) {
			this.raw[msgkey] = newValue;
		}
	};
}

},{"../bower_components/utf8/utf8.js":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.unpackMessageInDV = unpackMessageInDV;
exports.unpackMessage = unpackMessage;
exports.unpackMessages = unpackMessages;
exports.packMessageInDV = packMessageInDV;
exports.packMessage = packMessage;
exports.packMessages = packMessages;

function unpackMessageInDV(dv, pointer, items, factory) {
	var data = [],
	    ids = [],
	    Cls = undefined,
	    item = undefined;

	pointer = factory.idUnpacker(dv, pointer, ids);
	Cls = factory.getById(ids.pop());
	item = new Cls();

	for (var i = 0; i < Cls.length; i++) {
		pointer = Cls.unpackers[i](dv, pointer, data);
		item.raw[Cls.keys[i]] = data[i];
	}

	items.push(item);

	return pointer;
}

function unpackMessage(data, factory) {
	var messages = [],
	    dv = new DataView(data);

	unpackMessageInDV(dv, 0, messages, factory);

	return messages.pop();
}

function unpackMessages(data, factory) {
	var messages = [],
	    dv = new DataView(data),
	    pointer = 0;

	while (pointer < data.byteLength) {
		pointer = unpackMessageInDV(dv, pointer, messages, factory);
	}

	return messages;
}

function packMessageInDV(dv, pointer, msg, factory, TypeCls) {
	var Cls = TypeCls || Object.getPrototypeOf(msg);

	pointer = factory.idPacker(dv, pointer, Cls.id);

	for (var i = 0; i < Cls.length; i++) {
		pointer = Cls.packers[i](dv, pointer, msg.raw[Cls.keys[i]]);
	}

	return pointer;
}

function packMessage(message, factory) {
	var buffer = new ArrayBuffer(message.binaryLength),
	    dv = new DataView(buffer);

	packMessageInDV(dv, 0, message, factory);

	return buffer;
}

function packMessages(messages, factory) {
	var totalBinaryLength = 0,
	    pointer = 0,
	    buffer = undefined,
	    dv = undefined;

	for (var i = 0, len = messages.length; i < len; i++) {
		totalBinaryLength += messages[i].binaryLength;
	}

	buffer = new ArrayBuffer(totalBinaryLength);
	dv = new DataView(buffer);

	for (var i = 0, len = messages.length; i < len; i++) {
		pointer = packMessageInDV(dv, pointer, messages[i], factory);
	}

	return buffer;
}

},{}],4:[function(require,module,exports){
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

var _accessorsJs = require('./accessors.js');

var _unpackersJs = require('./unpackers.js');

var unpackers = _interopRequireWildcard(_unpackersJs);

var _packersJs = require('./packers.js');

var packers = _interopRequireWildcard(_packersJs);

var _utilsJs = require('./utils.js');

var MAX_SUPPORTED_NUMBER = Number.MAX_SAFE_INTEGER > Math.pow(2, 64) - 1 ? Number.MAX_SAFE_INTEGER : Math.pow(2, 64) - 1; //eslint-disable-line

var sizeLookup = {
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

Object.keys(sizeLookup).forEach(function (typeName) {
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

			msgkeys.forEach(function (msgkey) {
				switch (schema[className].format[msgkey]) {
					case 'enum':
						msgunpackers.push((0, _utilsJs.getUnpacker)(Object.keys(enums).length));
						msgpackers.push((0, _utilsJs.getPacker)(Object.keys(enums).length));
						baseBinaryLength += (0, _utilsJs.getBytesToRepresent)(Object.keys(enums).length);
						msgProperties[msgkey] = (0, _accessorsJs.getEnumAccessors)(msgkey);
						break;

					case 'string':
						msgProperties[msgkey] = (0, _accessorsJs.getStringAccessors)(msgkey);
						msgunpackers.push(unpackerLookup[schema[className].format[msgkey]]);
						msgpackers.push(packerLookup[schema[className].format[msgkey]]);
						baseBinaryLength += sizeLookup[schema[className].format[msgkey]];
						break;

					default:
						msgProperties[msgkey] = (0, _accessorsJs.getRawAccessor)(msgkey);
						msgunpackers.push(unpackerLookup[schema[className].format[msgkey]]);
						msgpackers.push(packerLookup[schema[className].format[msgkey]]);
						baseBinaryLength += sizeLookup[schema[className].format[msgkey]];
						break;
				}
			});

			var properties = {
				'name': {
					value: className,
					writable: false
				},
				'format': {
					value: schema[className].format,
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

			var MessageClass = function MessageClass() {
				_messageJs2['default'].call(this);
			};

			MessageClass.prototype = Object.create({}, properties);
			Object.defineProperties(MessageClass, properties);

			this.msgClassesById[index + 1] = MessageClass;
			this.msgClassesByName[className] = MessageClass;
		}).bind(this));
	}

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

},{"./accessors.js":2,"./message.js":5,"./packers.js":6,"./unpackers.js":7,"./utils.js":8}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

function packEnum(packer, dv, pointer, value) {
	return packer(dv, pointer, value);
}

},{}],7:[function(require,module,exports){
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

function unpackEnum(unpacker, dv, pointer, extracted) {
	pointer = unpacker(dv, pointer, extracted);
	return pointer;
}

},{}],8:[function(require,module,exports){
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

},{"./packers.js":6,"./unpackers.js":7}],9:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jsMessageFactoryJs = require('./js/message-factory.js');

var _jsMessageFactoryJs2 = _interopRequireDefault(_jsMessageFactoryJs);

var _srcJsInterfaceJs = require('../src/js/interface.js');

var schemaMessages = {
	'MessageFactory': _jsMessageFactoryJs2['default'],
	'unpackMessage': _srcJsInterfaceJs.unpackMessage,
	'unpackMessages': _srcJsInterfaceJs.unpackMessages,
	'packMessage': _srcJsInterfaceJs.packMessage,
	'packMessages': _srcJsInterfaceJs.packMessages
};

module.exports = schemaMessages;

},{"../src/js/interface.js":3,"./js/message-factory.js":4}]},{},[9])(9)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL2FjY2Vzc29ycy5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL2ludGVyZmFjZS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9qcy9wYWNrZXJzLmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvanMvdW5wYWNrZXJzLmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvanMvdXRpbHMuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0NBLENBQUMsQUFBQyxDQUFBLFVBQVMsSUFBSSxFQUFFOzs7QUFHaEIsS0FBSSxXQUFXLEdBQUcsT0FBTyxPQUFPLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQzs7O0FBR3hELEtBQUksVUFBVSxHQUFHLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLElBQ25ELE1BQU0sQ0FBQyxPQUFPLElBQUksV0FBVyxJQUFJLE1BQU0sQ0FBQzs7OztBQUl6QyxLQUFJLFVBQVUsR0FBRyxPQUFPLE1BQU0sSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDO0FBQ3JELEtBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7QUFDekUsTUFBSSxHQUFHLFVBQVUsQ0FBQztFQUNsQjs7OztBQUlELEtBQUksa0JBQWtCLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQzs7O0FBRzdDLFVBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUMzQixNQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsTUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLE1BQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDM0IsTUFBSSxLQUFLLENBQUM7QUFDVixNQUFJLEtBQUssQ0FBQztBQUNWLFNBQU8sT0FBTyxHQUFHLE1BQU0sRUFBRTtBQUN4QixRQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLE9BQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUU7O0FBRTNELFNBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDckMsUUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUEsSUFBSyxNQUFNLEVBQUU7O0FBQy9CLFdBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUEsSUFBSyxFQUFFLENBQUEsSUFBSyxLQUFLLEdBQUcsS0FBSyxDQUFBLEFBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztLQUNqRSxNQUFNOzs7QUFHTixXQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25CLFlBQU8sRUFBRSxDQUFDO0tBQ1Y7SUFDRCxNQUFNO0FBQ04sVUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQjtHQUNEO0FBQ0QsU0FBTyxNQUFNLENBQUM7RUFDZDs7O0FBR0QsVUFBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0FBQzFCLE1BQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDMUIsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDZixNQUFJLEtBQUssQ0FBQztBQUNWLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixTQUFPLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRTtBQUN4QixRQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JCLE9BQUksS0FBSyxHQUFHLE1BQU0sRUFBRTtBQUNuQixTQUFLLElBQUksT0FBTyxDQUFDO0FBQ2pCLFVBQU0sSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEtBQUssRUFBRSxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztBQUM1RCxTQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDL0I7QUFDRCxTQUFNLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDcEM7QUFDRCxTQUFPLE1BQU0sQ0FBQztFQUNkOzs7O0FBSUQsVUFBUyxVQUFVLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRTtBQUNyQyxTQUFPLGtCQUFrQixDQUFDLEFBQUMsQUFBQyxTQUFTLElBQUksS0FBSyxHQUFJLElBQUksR0FBSSxJQUFJLENBQUMsQ0FBQztFQUNoRTs7QUFFRCxVQUFTLGVBQWUsQ0FBQyxTQUFTLEVBQUU7QUFDbkMsTUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUEsSUFBSyxDQUFDLEVBQUU7O0FBQ2xDLFVBQU8sa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDckM7QUFDRCxNQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUEsSUFBSyxDQUFDLEVBQUU7O0FBQ2xDLFNBQU0sR0FBRyxrQkFBa0IsQ0FBQyxBQUFDLEFBQUMsU0FBUyxJQUFJLENBQUMsR0FBSSxJQUFJLEdBQUksSUFBSSxDQUFDLENBQUM7R0FDOUQsTUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQSxJQUFLLENBQUMsRUFBRTs7QUFDdkMsU0FBTSxHQUFHLGtCQUFrQixDQUFDLEFBQUMsQUFBQyxTQUFTLElBQUksRUFBRSxHQUFJLElBQUksR0FBSSxJQUFJLENBQUMsQ0FBQztBQUMvRCxTQUFNLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNuQyxNQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFBLElBQUssQ0FBQyxFQUFFOztBQUN2QyxTQUFNLEdBQUcsa0JBQWtCLENBQUMsQUFBQyxBQUFDLFNBQVMsSUFBSSxFQUFFLEdBQUksSUFBSSxHQUFJLElBQUksQ0FBQyxDQUFDO0FBQy9ELFNBQU0sSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLFNBQU0sSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQ25DO0FBQ0QsUUFBTSxJQUFJLGtCQUFrQixDQUFDLEFBQUMsU0FBUyxHQUFHLElBQUksR0FBSSxJQUFJLENBQUMsQ0FBQztBQUN4RCxTQUFPLE1BQU0sQ0FBQztFQUNkOztBQUVELFVBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUMzQixNQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7OztBQU1wQyxNQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQy9CLE1BQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2YsTUFBSSxTQUFTLENBQUM7QUFDZCxNQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDcEIsU0FBTyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUU7QUFDeEIsWUFBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QixhQUFVLElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3pDO0FBQ0QsU0FBTyxVQUFVLENBQUM7RUFDbEI7Ozs7QUFJRCxVQUFTLG9CQUFvQixHQUFHO0FBQy9CLE1BQUksU0FBUyxJQUFJLFNBQVMsRUFBRTtBQUMzQixTQUFNLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0dBQ2xDOztBQUVELE1BQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNuRCxXQUFTLEVBQUUsQ0FBQzs7QUFFWixNQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBLElBQUssSUFBSSxFQUFFO0FBQ3RDLFVBQU8sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0dBQy9COzs7QUFHRCxRQUFNLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0VBQ3pDOztBQUVELFVBQVMsWUFBWSxHQUFHO0FBQ3ZCLE1BQUksS0FBSyxDQUFDO0FBQ1YsTUFBSSxLQUFLLENBQUM7QUFDVixNQUFJLEtBQUssQ0FBQztBQUNWLE1BQUksS0FBSyxDQUFDO0FBQ1YsTUFBSSxTQUFTLENBQUM7O0FBRWQsTUFBSSxTQUFTLEdBQUcsU0FBUyxFQUFFO0FBQzFCLFNBQU0sS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7R0FDbEM7O0FBRUQsTUFBSSxTQUFTLElBQUksU0FBUyxFQUFFO0FBQzNCLFVBQU8sS0FBSyxDQUFDO0dBQ2I7OztBQUdELE9BQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLFdBQVMsRUFBRSxDQUFDOzs7QUFHWixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQSxJQUFLLENBQUMsRUFBRTtBQUN4QixVQUFPLEtBQUssQ0FBQztHQUNiOzs7QUFHRCxNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQSxJQUFLLElBQUksRUFBRTtBQUMzQixPQUFJLEtBQUssR0FBRyxvQkFBb0IsRUFBRSxDQUFDO0FBQ25DLFlBQVMsR0FBRyxBQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQSxJQUFLLENBQUMsR0FBSSxLQUFLLENBQUM7QUFDMUMsT0FBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3RCLFdBQU8sU0FBUyxDQUFDO0lBQ2pCLE1BQU07QUFDTixVQUFNLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQ3pDO0dBQ0Q7OztBQUdELE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBLElBQUssSUFBSSxFQUFFO0FBQzNCLFFBQUssR0FBRyxvQkFBb0IsRUFBRSxDQUFDO0FBQy9CLFFBQUssR0FBRyxvQkFBb0IsRUFBRSxDQUFDO0FBQy9CLFlBQVMsR0FBRyxBQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQSxJQUFLLEVBQUUsR0FBSyxLQUFLLElBQUksQ0FBQyxBQUFDLEdBQUcsS0FBSyxDQUFDO0FBQzFELE9BQUksU0FBUyxJQUFJLE1BQU0sRUFBRTtBQUN4QixXQUFPLFNBQVMsQ0FBQztJQUNqQixNQUFNO0FBQ04sVUFBTSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUN6QztHQUNEOzs7QUFHRCxNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQSxJQUFLLElBQUksRUFBRTtBQUMzQixRQUFLLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztBQUMvQixRQUFLLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztBQUMvQixRQUFLLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztBQUMvQixZQUFTLEdBQUcsQUFBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUEsSUFBSyxJQUFJLEdBQUssS0FBSyxJQUFJLElBQUksQUFBQyxHQUNwRCxLQUFLLElBQUksSUFBSSxBQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLE9BQUksU0FBUyxJQUFJLFFBQVEsSUFBSSxTQUFTLElBQUksUUFBUSxFQUFFO0FBQ25ELFdBQU8sU0FBUyxDQUFDO0lBQ2pCO0dBQ0Q7O0FBRUQsUUFBTSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztFQUN0Qzs7QUFFRCxLQUFJLFNBQVMsQ0FBQztBQUNkLEtBQUksU0FBUyxDQUFDO0FBQ2QsS0FBSSxTQUFTLENBQUM7QUFDZCxVQUFTLFVBQVUsQ0FBQyxVQUFVLEVBQUU7QUFDL0IsV0FBUyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxXQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUM3QixXQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQUksR0FBRyxDQUFDO0FBQ1IsU0FBTyxDQUFDLEdBQUcsR0FBRyxZQUFZLEVBQUUsQ0FBQSxLQUFNLEtBQUssRUFBRTtBQUN4QyxhQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ3JCO0FBQ0QsU0FBTyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDOUI7Ozs7QUFJRCxLQUFJLElBQUksR0FBRztBQUNWLFdBQVMsRUFBRSxPQUFPO0FBQ2xCLFVBQVEsRUFBRSxVQUFVO0FBQ3BCLFVBQVEsRUFBRSxVQUFVO0VBQ3BCLENBQUM7Ozs7QUFJRixLQUNDLE9BQU8sTUFBTSxJQUFJLFVBQVUsSUFDM0IsT0FBTyxNQUFNLENBQUMsR0FBRyxJQUFJLFFBQVEsSUFDN0IsTUFBTSxDQUFDLEdBQUcsRUFDVDtBQUNELFFBQU0sQ0FBQyxZQUFXO0FBQ2pCLFVBQU8sSUFBSSxDQUFDO0dBQ1osQ0FBQyxDQUFDO0VBQ0gsTUFBTSxJQUFJLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUU7QUFDaEQsTUFBSSxVQUFVLEVBQUU7O0FBQ2YsYUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7R0FDMUIsTUFBTTs7QUFDTixPQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsT0FBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUMzQyxRQUFLLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtBQUNyQixrQkFBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUM7SUFDakU7R0FDRDtFQUNELE1BQU07O0FBQ04sTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7RUFDakI7Q0FFRCxDQUFBLFdBQU0sQ0FBRTs7Ozs7Ozs7Ozs7Ozs7OzswQ0M5T1Esa0NBQWtDOzs7O0FBRTVDLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0FBQ3hDLFFBQU87QUFDTixLQUFHLEVBQUUsZUFBVztBQUNmLFVBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0dBQ3ZEO0FBQ0QsS0FBRyxFQUFFLGFBQVMsUUFBUSxFQUFFO0FBQ3ZCLE9BQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDcEQ7RUFDRCxDQUFDO0NBQ0Y7O0FBRU0sU0FBUyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7QUFDMUMsUUFBTztBQUNOLEtBQUcsRUFBRSxlQUFXO0FBQ2YsVUFBTyx3Q0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0dBQ3JDO0FBQ0QsS0FBRyxFQUFFLGFBQVMsUUFBUSxFQUFFO0FBQ3ZCLE9BQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7QUFDdEUsT0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyx3Q0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsT0FBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQztHQUM3QztFQUNELENBQUM7Q0FDRjs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDdEMsUUFBTztBQUNOLEtBQUcsRUFBRSxlQUFXO0FBQ2YsVUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3hCO0FBQ0QsS0FBRyxFQUFFLGFBQVMsUUFBUSxFQUFFO0FBQ3ZCLE9BQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDO0dBQzVCO0VBQ0QsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7QUNuQ00sU0FBUyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDOUQsS0FBSSxJQUFJLEdBQUcsRUFBRTtLQUNiLEdBQUcsR0FBRyxFQUFFO0tBQ1IsR0FBRyxZQUFBO0tBQUUsSUFBSSxZQUFBLENBQUM7O0FBRVYsUUFBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMvQyxJQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNqQyxLQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsTUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkMsU0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5QyxNQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEM7O0FBRUQsTUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFakIsUUFBTyxPQUFPLENBQUM7Q0FDZjs7QUFFTSxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQzVDLEtBQUksUUFBUSxHQUFHLEVBQUU7S0FDakIsRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV4QixrQkFBaUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFNUMsUUFBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDdEI7O0FBRU0sU0FBUyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUM3QyxLQUFJLFFBQVEsR0FBRyxFQUFFO0tBQ2pCLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUM7S0FDdkIsT0FBTyxHQUFHLENBQUMsQ0FBQzs7QUFFWixRQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2hDLFNBQU8sR0FBRyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztFQUM1RDs7QUFFRCxRQUFPLFFBQVEsQ0FBQztDQUNoQjs7QUFFTSxTQUFTLGVBQWUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ25FLEtBQUksR0FBRyxHQUFHLE9BQU8sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVoRCxRQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFaEQsTUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkMsU0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzVEOztBQUVELFFBQU8sT0FBTyxDQUFDO0NBQ2Y7O0FBRU0sU0FBUyxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUM3QyxLQUFJLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO0tBQ2pELEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFM0IsZ0JBQWUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFekMsUUFBTyxNQUFNLENBQUM7Q0FDZDs7QUFFTSxTQUFTLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQy9DLEtBQUksaUJBQWlCLEdBQUcsQ0FBQztLQUN4QixPQUFPLEdBQUcsQ0FBQztLQUNYLE1BQU0sWUFBQTtLQUFFLEVBQUUsWUFBQSxDQUFDOztBQUVaLE1BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkQsbUJBQWlCLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztFQUM5Qzs7QUFFRCxPQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM1QyxHQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTFCLE1BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkQsU0FBTyxHQUFHLGVBQWUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztFQUM3RDs7QUFFRCxRQUFPLE1BQU0sQ0FBQztDQUNkOzs7Ozs7Ozs7Ozs7Ozs7Ozt5QkM5RXVCLGNBQWM7Ozs7MkJBSy9CLGdCQUFnQjs7MkJBQ0ksZ0JBQWdCOztJQUEvQixTQUFTOzt5QkFDSSxjQUFjOztJQUEzQixPQUFPOzt1QkFPWixZQUFZOztBQUduQixJQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFM0gsSUFBSSxVQUFVLEdBQUc7QUFDZixPQUFNLEVBQUUsQ0FBQztBQUNULE9BQU0sRUFBRSxDQUFDO0FBQ1QsUUFBTyxFQUFFLENBQUM7QUFDVixPQUFNLEVBQUUsQ0FBQztBQUNULFFBQU8sRUFBRSxDQUFDO0FBQ1YsU0FBUSxFQUFFLENBQUM7QUFDWCxNQUFLLEVBQUUsQ0FBQztBQUNSLE9BQU0sRUFBRSxDQUFDO0FBQ1QsUUFBTyxFQUFFLENBQUM7QUFDVixTQUFRLEVBQUUsQ0FBQztBQUNYLFFBQU8sRUFBRSxDQUFDO0FBQ1YsU0FBUSxFQUFFLENBQUM7QUFDWCxTQUFRLEVBQUUsQ0FBQztDQUNYO0lBQ0QsY0FBYyxHQUFHLEVBQUU7SUFDbkIsWUFBWSxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBUyxRQUFRLEVBQUU7QUFDbEQsZUFBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsYUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDaEcsQ0FBQyxDQUFDOztBQUVILGNBQWMsUUFBSyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFDM0MsWUFBWSxRQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQzs7SUFFL0IsY0FBYztBQUNSLFVBRE4sY0FBYyxDQUNQLE1BQU0sRUFBRTt3QkFEZixjQUFjOztBQUVsQixNQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3RDLE1BQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDM0IsTUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsTUFBSSxDQUFDLGdCQUFnQixHQUFHLGtDQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekQsTUFBSSxDQUFDLGNBQWMsR0FBRyxvQ0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pELE1BQUksQ0FBQyxVQUFVLEdBQUcsMEJBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLE1BQUksQ0FBQyxRQUFRLEdBQUcsd0JBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV2QyxNQUFJLENBQUMsT0FBTyxDQUFDLENBQUEsVUFBUyxTQUFTLEVBQUUsS0FBSyxFQUFFO0FBQ3ZDLE9BQUksS0FBSyxHQUFHLEVBQUU7T0FDYixZQUFZLEdBQUcsRUFBRTtPQUNqQixPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFO09BQ3RELGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0I7T0FDeEMsWUFBWSxHQUFHLEVBQUU7T0FDakIsVUFBVSxHQUFHLEVBQUU7T0FDZixhQUFhLEdBQUcsRUFBRSxDQUFDOztBQUVwQixPQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUU7QUFDM0IsU0FBSSxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFO0FBQzVDLFNBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsVUFBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQixpQkFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM1QixVQUFJLElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRTtBQUM5QixVQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsV0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNyQyxrQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztNQUM1QztLQUNEO0lBQ0Q7O0FBRUQsVUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFTLE1BQU0sRUFBRTtBQUNoQyxZQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3RDLFVBQUssTUFBTTtBQUNWLGtCQUFZLENBQUMsSUFBSSxDQUFDLDBCQUFZLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMxRCxnQkFBVSxDQUFDLElBQUksQ0FBQyx3QkFBVSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEQsc0JBQWdCLElBQUksa0NBQW9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkUsbUJBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxtQ0FBaUIsTUFBTSxDQUFDLENBQUM7QUFDbEQsWUFBTTs7QUFBQSxBQUVOLFVBQUssUUFBUTtBQUNaLG1CQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcscUNBQW1CLE1BQU0sQ0FBQyxDQUFDO0FBQ25ELGtCQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRSxnQkFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEUsc0JBQWdCLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsRSxZQUFNOztBQUFBLEFBRU47QUFDQyxtQkFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGlDQUFlLE1BQU0sQ0FBQyxDQUFDO0FBQy9DLGtCQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRSxnQkFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEUsc0JBQWdCLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsRSxZQUFNO0FBQUEsS0FDTjtJQUNELENBQUMsQ0FBQzs7QUFFSCxPQUFJLFVBQVUsR0FBRztBQUNoQixVQUFNLEVBQUU7QUFDUCxVQUFLLEVBQUUsU0FBUztBQUNoQixhQUFRLEVBQUUsS0FBSztLQUNmO0FBQ0QsWUFBUSxFQUFFO0FBQ1QsVUFBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNO0FBQy9CLGFBQVEsRUFBRSxLQUFLO0tBQ2Y7QUFDRCxRQUFJLEVBQUU7QUFDTCxVQUFLLEVBQUUsS0FBSyxHQUFHLENBQUM7QUFDaEIsYUFBUSxFQUFFLEtBQUs7S0FDZjtBQUNELFdBQU8sRUFBRTtBQUNSLFVBQUssRUFBRSxLQUFLO0FBQ1osYUFBUSxFQUFFLEtBQUs7S0FDZjtBQUNELGtCQUFjLEVBQUU7QUFDZixVQUFLLEVBQUUsWUFBWTtBQUNuQixhQUFRLEVBQUUsS0FBSztLQUNmO0FBQ0QsWUFBUSxFQUFFO0FBQ1QsVUFBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0FBQ3JCLGFBQVEsRUFBRSxLQUFLO0tBQ2Y7QUFDRCxVQUFNLEVBQUU7QUFDUCxVQUFLLEVBQUUsT0FBTztBQUNkLGFBQVEsRUFBRSxLQUFLO0tBQ2Y7QUFDRCxlQUFXLEVBQUU7QUFDWixVQUFLLEVBQUUsWUFBWTtBQUNuQixhQUFRLEVBQUUsS0FBSztLQUNmO0FBQ0QsYUFBUyxFQUFFO0FBQ1YsVUFBSyxFQUFFLFVBQVU7QUFDakIsYUFBUSxFQUFFLEtBQUs7S0FDZjtBQUNELHNCQUFrQixFQUFFO0FBQ25CLFVBQUssRUFBRSxnQkFBZ0I7QUFDdkIsYUFBUSxFQUFFLEtBQUs7S0FDZjtBQUNELG1CQUFlLEVBQUU7QUFDaEIsVUFBSyxFQUFFLGFBQWE7QUFDcEIsYUFBUSxFQUFFLEtBQUs7S0FDZjtJQUNELENBQUM7O0FBRUYsT0FBSSxZQUFZLEdBQUcsU0FBZixZQUFZLEdBQWM7QUFDN0IsMkJBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7O0FBRUYsZUFBWSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxTQUFNLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUVsRCxPQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7QUFDOUMsT0FBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUFHLFlBQVksQ0FBQztHQUNoRCxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDZjs7Y0FsSEssY0FBYzs7U0FvSFYsbUJBQUMsSUFBSSxFQUFFO0FBQ2YsVUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDbkM7OztTQUVNLGlCQUFDLEVBQUUsRUFBRTtBQUNYLFVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUMvQjs7O1NBRUUsYUFBQyxRQUFRLEVBQUU7QUFDYixPQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNwRCxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsTUFBTTtBQUNOLFdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoQztHQUNEOzs7UUFsSUksY0FBYzs7O3FCQXFJTCxjQUFjOzs7Ozs7Ozs7QUNsTDdCLFNBQVMsV0FBVyxHQUFHO0FBQ3RCLEtBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxLQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7QUFDOUMsS0FBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7O0FBRWQsT0FBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0NBQ3REOztxQkFFYyxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1JuQixTQUFTLFFBQVEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUM1QyxHQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QixRQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDNUMsR0FBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDM0IsUUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0NBQ25COztBQUVNLFNBQVMsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzdDLEdBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFFBQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztDQUNuQjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUM3QyxHQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QixRQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDOUMsR0FBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDN0IsUUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0NBQ25COztBQUVNLFNBQVMsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzNDLEdBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFFBQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztDQUNuQjs7QUFFTSxTQUFTLFFBQVEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUM1QyxHQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QixRQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDN0MsR0FBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUIsUUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0NBQ25COztBQUVNLFNBQVMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzlDLEdBQUUsQ0FBQyxT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Q2hDLGdCQUFlLGlDQUFlO0FBQzlCLGlCQUFnQixrQ0FBZ0I7QUFDaEMsY0FBYSwrQkFBYTtBQUMxQixlQUFjLGdDQUFjO0NBQzVCLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohIGh0dHA6Ly9tdGhzLmJlL3V0ZjhqcyB2Mi4wLjAgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlcyBgZXhwb3J0c2Bcblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYFxuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgLCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUsXG5cdC8vIGFuZCB1c2UgaXQgYXMgYHJvb3RgXG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cblx0Ly8gVGFrZW4gZnJvbSBodHRwOi8vbXRocy5iZS9wdW55Y29kZVxuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXTtcblx0XHR2YXIgY291bnRlciA9IDA7XG5cdFx0dmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG5cdFx0dmFyIHZhbHVlO1xuXHRcdHZhciBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvLyBUYWtlbiBmcm9tIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciBpbmRleCA9IC0xO1xuXHRcdHZhciB2YWx1ZTtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0d2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZUJ5dGUoY29kZVBvaW50LCBzaGlmdCkge1xuXHRcdHJldHVybiBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gc2hpZnQpICYgMHgzRikgfCAweDgwKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuY29kZUNvZGVQb2ludChjb2RlUG9pbnQpIHtcblx0XHRpZiAoKGNvZGVQb2ludCAmIDB4RkZGRkZGODApID09IDApIHsgLy8gMS1ieXRlIHNlcXVlbmNlXG5cdFx0XHRyZXR1cm4gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7XG5cdFx0fVxuXHRcdHZhciBzeW1ib2wgPSAnJztcblx0XHRpZiAoKGNvZGVQb2ludCAmIDB4RkZGRkY4MDApID09IDApIHsgLy8gMi1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gNikgJiAweDFGKSB8IDB4QzApO1xuXHRcdH1cblx0XHRlbHNlIGlmICgoY29kZVBvaW50ICYgMHhGRkZGMDAwMCkgPT0gMCkgeyAvLyAzLWJ5dGUgc2VxdWVuY2Vcblx0XHRcdHN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiAxMikgJiAweDBGKSB8IDB4RTApO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCA2KTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoKGNvZGVQb2ludCAmIDB4RkZFMDAwMDApID09IDApIHsgLy8gNC1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gMTgpICYgMHgwNykgfCAweEYwKTtcblx0XHRcdHN5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwgMTIpO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCA2KTtcblx0XHR9XG5cdFx0c3ltYm9sICs9IHN0cmluZ0Zyb21DaGFyQ29kZSgoY29kZVBvaW50ICYgMHgzRikgfCAweDgwKTtcblx0XHRyZXR1cm4gc3ltYm9sO1xuXHR9XG5cblx0ZnVuY3Rpb24gdXRmOGVuY29kZShzdHJpbmcpIHtcblx0XHR2YXIgY29kZVBvaW50cyA9IHVjczJkZWNvZGUoc3RyaW5nKTtcblxuXHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGNvZGVQb2ludHMubWFwKGZ1bmN0aW9uKHgpIHtcblx0XHQvLyBcdHJldHVybiAnVSsnICsgeC50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblx0XHQvLyB9KSkpO1xuXG5cdFx0dmFyIGxlbmd0aCA9IGNvZGVQb2ludHMubGVuZ3RoO1xuXHRcdHZhciBpbmRleCA9IC0xO1xuXHRcdHZhciBjb2RlUG9pbnQ7XG5cdFx0dmFyIGJ5dGVTdHJpbmcgPSAnJztcblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0Y29kZVBvaW50ID0gY29kZVBvaW50c1tpbmRleF07XG5cdFx0XHRieXRlU3RyaW5nICs9IGVuY29kZUNvZGVQb2ludChjb2RlUG9pbnQpO1xuXHRcdH1cblx0XHRyZXR1cm4gYnl0ZVN0cmluZztcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdGZ1bmN0aW9uIHJlYWRDb250aW51YXRpb25CeXRlKCkge1xuXHRcdGlmIChieXRlSW5kZXggPj0gYnl0ZUNvdW50KSB7XG5cdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBieXRlIGluZGV4Jyk7XG5cdFx0fVxuXG5cdFx0dmFyIGNvbnRpbnVhdGlvbkJ5dGUgPSBieXRlQXJyYXlbYnl0ZUluZGV4XSAmIDB4RkY7XG5cdFx0Ynl0ZUluZGV4Kys7XG5cblx0XHRpZiAoKGNvbnRpbnVhdGlvbkJ5dGUgJiAweEMwKSA9PSAweDgwKSB7XG5cdFx0XHRyZXR1cm4gY29udGludWF0aW9uQnl0ZSAmIDB4M0Y7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZW5kIHVwIGhlcmUsIGl04oCZcyBub3QgYSBjb250aW51YXRpb24gYnl0ZVxuXHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWNvZGVTeW1ib2woKSB7XG5cdFx0dmFyIGJ5dGUxO1xuXHRcdHZhciBieXRlMjtcblx0XHR2YXIgYnl0ZTM7XG5cdFx0dmFyIGJ5dGU0O1xuXHRcdHZhciBjb2RlUG9pbnQ7XG5cblx0XHRpZiAoYnl0ZUluZGV4ID4gYnl0ZUNvdW50KSB7XG5cdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBieXRlIGluZGV4Jyk7XG5cdFx0fVxuXG5cdFx0aWYgKGJ5dGVJbmRleCA9PSBieXRlQ291bnQpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBSZWFkIGZpcnN0IGJ5dGVcblx0XHRieXRlMSA9IGJ5dGVBcnJheVtieXRlSW5kZXhdICYgMHhGRjtcblx0XHRieXRlSW5kZXgrKztcblxuXHRcdC8vIDEtYnl0ZSBzZXF1ZW5jZSAobm8gY29udGludWF0aW9uIGJ5dGVzKVxuXHRcdGlmICgoYnl0ZTEgJiAweDgwKSA9PSAwKSB7XG5cdFx0XHRyZXR1cm4gYnl0ZTE7XG5cdFx0fVxuXG5cdFx0Ly8gMi1ieXRlIHNlcXVlbmNlXG5cdFx0aWYgKChieXRlMSAmIDB4RTApID09IDB4QzApIHtcblx0XHRcdHZhciBieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRjb2RlUG9pbnQgPSAoKGJ5dGUxICYgMHgxRikgPDwgNikgfCBieXRlMjtcblx0XHRcdGlmIChjb2RlUG9pbnQgPj0gMHg4MCkge1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyAzLWJ5dGUgc2VxdWVuY2UgKG1heSBpbmNsdWRlIHVucGFpcmVkIHN1cnJvZ2F0ZXMpXG5cdFx0aWYgKChieXRlMSAmIDB4RjApID09IDB4RTApIHtcblx0XHRcdGJ5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGJ5dGUzID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGNvZGVQb2ludCA9ICgoYnl0ZTEgJiAweDBGKSA8PCAxMikgfCAoYnl0ZTIgPDwgNikgfCBieXRlMztcblx0XHRcdGlmIChjb2RlUG9pbnQgPj0gMHgwODAwKSB7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDQtYnl0ZSBzZXF1ZW5jZVxuXHRcdGlmICgoYnl0ZTEgJiAweEY4KSA9PSAweEYwKSB7XG5cdFx0XHRieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRieXRlMyA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRieXRlNCA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRjb2RlUG9pbnQgPSAoKGJ5dGUxICYgMHgwRikgPDwgMHgxMikgfCAoYnl0ZTIgPDwgMHgwQykgfFxuXHRcdFx0XHQoYnl0ZTMgPDwgMHgwNikgfCBieXRlNDtcblx0XHRcdGlmIChjb2RlUG9pbnQgPj0gMHgwMTAwMDAgJiYgY29kZVBvaW50IDw9IDB4MTBGRkZGKSB7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgVVRGLTggZGV0ZWN0ZWQnKTtcblx0fVxuXG5cdHZhciBieXRlQXJyYXk7XG5cdHZhciBieXRlQ291bnQ7XG5cdHZhciBieXRlSW5kZXg7XG5cdGZ1bmN0aW9uIHV0ZjhkZWNvZGUoYnl0ZVN0cmluZykge1xuXHRcdGJ5dGVBcnJheSA9IHVjczJkZWNvZGUoYnl0ZVN0cmluZyk7XG5cdFx0Ynl0ZUNvdW50ID0gYnl0ZUFycmF5Lmxlbmd0aDtcblx0XHRieXRlSW5kZXggPSAwO1xuXHRcdHZhciBjb2RlUG9pbnRzID0gW107XG5cdFx0dmFyIHRtcDtcblx0XHR3aGlsZSAoKHRtcCA9IGRlY29kZVN5bWJvbCgpKSAhPT0gZmFsc2UpIHtcblx0XHRcdGNvZGVQb2ludHMucHVzaCh0bXApO1xuXHRcdH1cblx0XHRyZXR1cm4gdWNzMmVuY29kZShjb2RlUG9pbnRzKTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciB1dGY4ID0ge1xuXHRcdCd2ZXJzaW9uJzogJzIuMC4wJyxcblx0XHQnZW5jb2RlJzogdXRmOGVuY29kZSxcblx0XHQnZGVjb2RlJzogdXRmOGRlY29kZVxuXHR9O1xuXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHV0Zjg7XG5cdFx0fSk7XG5cdH1cdGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7IC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSB1dGY4O1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHR2YXIgb2JqZWN0ID0ge307XG5cdFx0XHR2YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3QuaGFzT3duUHJvcGVydHk7XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gdXRmOCkge1xuXHRcdFx0XHRoYXNPd25Qcm9wZXJ0eS5jYWxsKHV0ZjgsIGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSB1dGY4W2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QudXRmOCA9IHV0Zjg7XG5cdH1cblxufSh0aGlzKSk7XG4iLCJpbXBvcnQgdXRmOCBmcm9tICcuLi9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnVtQWNjZXNzb3JzKG1zZ2tleSkge1xuXHRyZXR1cm4ge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5DbHMucmV2ZXJzZUVudW1zW21zZ2tleV1bdGhpcy5yYXdbbXNna2V5XV07XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG5cdFx0XHR0aGlzLnJhd1ttc2drZXldID0gdGhpcy5DbHMuZW51bXNbbXNna2V5XVtuZXdWYWx1ZV07XG5cdFx0fVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RyaW5nQWNjZXNzb3JzKG1zZ2tleSkge1xuXHRyZXR1cm4ge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdXRmOC5kZWNvZGUodGhpcy5yYXdbbXNna2V5XSk7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG5cdFx0XHR0aGlzLmJpbmFyeUxlbmd0aCAtPSB0aGlzLnJhd1ttc2drZXldICYmIHRoaXMucmF3W21zZ2tleV0ubGVuZ3RoIHx8IDA7XG5cdFx0XHR0aGlzLnJhd1ttc2drZXldID0gdXRmOC5lbmNvZGUobmV3VmFsdWUpO1xuXHRcdFx0dGhpcy5iaW5hcnlMZW5ndGggKz0gdGhpcy5yYXdbbXNna2V5XS5sZW5ndGg7XG5cdFx0fVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmF3QWNjZXNzb3IobXNna2V5KSB7XG5cdHJldHVybiB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnJhd1ttc2drZXldO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuXHRcdFx0dGhpcy5yYXdbbXNna2V5XSA9IG5ld1ZhbHVlO1xuXHRcdH1cblx0fTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiB1bnBhY2tNZXNzYWdlSW5EVihkdiwgcG9pbnRlciwgaXRlbXMsIGZhY3RvcnkpIHtcblx0bGV0IGRhdGEgPSBbXSxcblx0aWRzID0gW10sXG5cdENscywgaXRlbTtcblxuXHRwb2ludGVyID0gZmFjdG9yeS5pZFVucGFja2VyKGR2LCBwb2ludGVyLCBpZHMpO1xuXHRDbHMgPSBmYWN0b3J5LmdldEJ5SWQoaWRzLnBvcCgpKTtcblx0aXRlbSA9IG5ldyBDbHMoKTtcblxuXHRmb3IobGV0IGkgPSAwOyBpIDwgQ2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0cG9pbnRlciA9IENscy51bnBhY2tlcnNbaV0oZHYsIHBvaW50ZXIsIGRhdGEpO1xuXHRcdGl0ZW0ucmF3W0Nscy5rZXlzW2ldXSA9IGRhdGFbaV07XG5cdH1cblxuXHRpdGVtcy5wdXNoKGl0ZW0pO1xuXG5cdHJldHVybiBwb2ludGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrTWVzc2FnZShkYXRhLCBmYWN0b3J5KSB7XG5cdGxldCBtZXNzYWdlcyA9IFtdLFxuXHRkdiA9IG5ldyBEYXRhVmlldyhkYXRhKTtcblxuXHR1bnBhY2tNZXNzYWdlSW5EVihkdiwgMCwgbWVzc2FnZXMsIGZhY3RvcnkpO1xuXG5cdHJldHVybiBtZXNzYWdlcy5wb3AoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja01lc3NhZ2VzKGRhdGEsIGZhY3RvcnkpIHtcblx0bGV0IG1lc3NhZ2VzID0gW10sXG5cdGR2ID0gbmV3IERhdGFWaWV3KGRhdGEpLFxuXHRwb2ludGVyID0gMDtcblxuXHR3aGlsZShwb2ludGVyIDwgZGF0YS5ieXRlTGVuZ3RoKSB7XG5cdFx0cG9pbnRlciA9IHVucGFja01lc3NhZ2VJbkRWKGR2LCBwb2ludGVyLCBtZXNzYWdlcywgZmFjdG9yeSk7XG5cdH1cblxuXHRyZXR1cm4gbWVzc2FnZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrTWVzc2FnZUluRFYoZHYsIHBvaW50ZXIsIG1zZywgZmFjdG9yeSwgVHlwZUNscykge1xuXHRsZXQgQ2xzID0gVHlwZUNscyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YobXNnKTtcblxuXHRwb2ludGVyID0gZmFjdG9yeS5pZFBhY2tlcihkdiwgcG9pbnRlciwgQ2xzLmlkKTtcblxuXHRmb3IobGV0IGkgPSAwOyBpIDwgQ2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0cG9pbnRlciA9IENscy5wYWNrZXJzW2ldKGR2LCBwb2ludGVyLCBtc2cucmF3W0Nscy5rZXlzW2ldXSk7XG5cdH1cblxuXHRyZXR1cm4gcG9pbnRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tNZXNzYWdlKG1lc3NhZ2UsIGZhY3RvcnkpIHtcblx0bGV0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihtZXNzYWdlLmJpbmFyeUxlbmd0aCksXG5cdFx0ZHYgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcblxuXHRwYWNrTWVzc2FnZUluRFYoZHYsIDAsIG1lc3NhZ2UsIGZhY3RvcnkpO1xuXG5cdHJldHVybiBidWZmZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrTWVzc2FnZXMobWVzc2FnZXMsIGZhY3RvcnkpIHtcblx0bGV0IHRvdGFsQmluYXJ5TGVuZ3RoID0gMCxcblx0XHRwb2ludGVyID0gMCxcblx0XHRidWZmZXIsIGR2O1xuXG5cdGZvcihsZXQgaSA9IDAsIGxlbiA9IG1lc3NhZ2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0dG90YWxCaW5hcnlMZW5ndGggKz0gbWVzc2FnZXNbaV0uYmluYXJ5TGVuZ3RoO1xuXHR9XG5cblx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHRvdGFsQmluYXJ5TGVuZ3RoKTtcblx0ZHYgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcblxuXHRmb3IobGV0IGkgPSAwLCBsZW4gPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdHBvaW50ZXIgPSBwYWNrTWVzc2FnZUluRFYoZHYsIHBvaW50ZXIsIG1lc3NhZ2VzW2ldLCBmYWN0b3J5KTtcblx0fVxuXG5cdHJldHVybiBidWZmZXI7XG59XG4iLCJpbXBvcnQgTWVzc2FnZUJhc2UgZnJvbSAnLi9tZXNzYWdlLmpzJztcbmltcG9ydCB7XG5cdGdldEVudW1BY2Nlc3NvcnMsXG5cdGdldFN0cmluZ0FjY2Vzc29ycyxcblx0Z2V0UmF3QWNjZXNzb3Jcbn0gZnJvbSAnLi9hY2Nlc3NvcnMuanMnO1xuaW1wb3J0ICogYXMgdW5wYWNrZXJzIGZyb20gJy4vdW5wYWNrZXJzLmpzJztcbmltcG9ydCAqIGFzIHBhY2tlcnMgZnJvbSAnLi9wYWNrZXJzLmpzJztcblxuaW1wb3J0IHtcblx0Z2V0Qnl0ZXNUb1JlcHJlc2VudCxcblx0Z2V0QmluYXJ5Rm9ybWF0U3ltYm9sLFxuXHRnZXRVbnBhY2tlcixcblx0Z2V0UGFja2VyXG59IGZyb20gJy4vdXRpbHMuanMnO1xuXG5cbmNvbnN0IE1BWF9TVVBQT1JURURfTlVNQkVSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgPiBNYXRoLnBvdygyLCA2NCkgLSAxID8gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgOiBNYXRoLnBvdygyLCA2NCkgLSAxOyAvL2VzbGludC1kaXNhYmxlLWxpbmVcblxubGV0IHNpemVMb29rdXAgPSB7XG5cdFx0J2Jvb2wnOiAxLFxuXHRcdCdieXRlJzogMSxcblx0XHQndWJ5dGUnOiAxLFxuXHRcdCdjaGFyJzogMSxcblx0XHQnc2hvcnQnOiAyLFxuXHRcdCd1c2hvcnQnOiAyLFxuXHRcdCdpbnQnOiA0LFxuXHRcdCd1aW50JzogNCxcblx0XHQnaW50NjQnOiA4LFxuXHRcdCd1aW50NjQnOiA4LFxuXHRcdCdmbG9hdCc6IDQsXG5cdFx0J2RvdWJsZSc6IDgsXG5cdFx0J3N0cmluZyc6IDRcblx0fSxcblx0dW5wYWNrZXJMb29rdXAgPSB7fSxcblx0cGFja2VyTG9va3VwID0ge307XG5cbk9iamVjdC5rZXlzKHNpemVMb29rdXApLmZvckVhY2goZnVuY3Rpb24odHlwZU5hbWUpIHtcblx0dW5wYWNrZXJMb29rdXBbdHlwZU5hbWVdID0gdW5wYWNrZXJzWyd1bnBhY2snICsgdHlwZU5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eXBlTmFtZS5zbGljZSgxKV07XG5cdHBhY2tlckxvb2t1cFt0eXBlTmFtZV0gPSBwYWNrZXJzWydwYWNrJyArIHR5cGVOYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHlwZU5hbWUuc2xpY2UoMSldO1xufSk7XG5cbnVucGFja2VyTG9va3VwLmVudW0gPSB1bnBhY2tlcnMudW5wYWNrRW51bTtcbnBhY2tlckxvb2t1cC5lbnVtID0gcGFja2Vycy5wYWNrRW51bTtcblxuY2xhc3MgTWVzc2FnZUZhY3Rvcnkge1xuXHRjb25zdHJ1Y3RvcihzY2hlbWEpIHtcblx0XHRsZXQga2V5cyA9IE9iamVjdC5rZXlzKHNjaGVtYSkuc29ydCgpO1xuXHRcdHRoaXMubXNnQ2xhc3Nlc0J5TmFtZSA9IHt9O1xuXHRcdHRoaXMubXNnQ2xhc3Nlc0J5SWQgPSB7fTtcblx0XHR0aGlzLmJ5dGVzTmVlZGVkRm9ySWQgPSBnZXRCeXRlc1RvUmVwcmVzZW50KGtleXMubGVuZ3RoKTtcblx0XHR0aGlzLmlkQmluYXJ5Rm9ybWF0ID0gZ2V0QmluYXJ5Rm9ybWF0U3ltYm9sKGtleXMubGVuZ3RoKTtcblx0XHR0aGlzLmlkVW5wYWNrZXIgPSBnZXRVbnBhY2tlcihrZXlzLmxlbmd0aCk7XG5cdFx0dGhpcy5pZFBhY2tlciA9IGdldFBhY2tlcihrZXlzLmxlbmd0aCk7XG5cblx0XHRrZXlzLmZvckVhY2goZnVuY3Rpb24oY2xhc3NOYW1lLCBpbmRleCkge1xuXHRcdFx0dmFyIGVudW1zID0ge30sXG5cdFx0XHRcdHJldmVyc2VFbnVtcyA9IHt9LFxuXHRcdFx0XHRtc2drZXlzID0gT2JqZWN0LmtleXMoc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0KS5zb3J0KCksXG5cdFx0XHRcdGJhc2VCaW5hcnlMZW5ndGggPSB0aGlzLmJ5dGVzTmVlZGVkRm9ySWQsXG5cdFx0XHRcdG1zZ3VucGFja2VycyA9IFtdLFxuXHRcdFx0XHRtc2dwYWNrZXJzID0gW10sXG5cdFx0XHRcdG1zZ1Byb3BlcnRpZXMgPSB7fTtcblxuXHRcdFx0aWYoc2NoZW1hW2NsYXNzTmFtZV0uZW51bXMpIHtcblx0XHRcdFx0Zm9yKGxldCBlbnVtTmFtZSBpbiBzY2hlbWFbY2xhc3NOYW1lXS5lbnVtcykge1xuXHRcdFx0XHRcdGxldCBlbnVtVmFsdWVzID0gc2NoZW1hW2NsYXNzTmFtZV0uZW51bXNbZW51bU5hbWVdO1xuXHRcdFx0XHRcdGVudW1zW2VudW1OYW1lXSA9IHt9O1xuXHRcdFx0XHRcdHJldmVyc2VFbnVtc1tlbnVtTmFtZV0gPSB7fTtcblx0XHRcdFx0XHRmb3IobGV0IGVudW1LZXkgaW4gZW51bVZhbHVlcykge1xuXHRcdFx0XHRcdFx0bGV0IGVudW1WYWx1ZSA9IGVudW1WYWx1ZXNbZW51bUtleV07XG5cdFx0XHRcdFx0XHRlbnVtc1tlbnVtTmFtZV1bZW51bUtleV0gPSBlbnVtVmFsdWU7XG5cdFx0XHRcdFx0XHRyZXZlcnNlRW51bXNbZW51bU5hbWVdW2VudW1WYWx1ZV0gPSBlbnVtS2V5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRtc2drZXlzLmZvckVhY2goZnVuY3Rpb24obXNna2V5KSB7XG5cdFx0XHRcdHN3aXRjaChzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XSkge1xuXHRcdFx0XHRcdGNhc2UgJ2VudW0nOlxuXHRcdFx0XHRcdFx0bXNndW5wYWNrZXJzLnB1c2goZ2V0VW5wYWNrZXIoT2JqZWN0LmtleXMoZW51bXMpLmxlbmd0aCkpO1xuXHRcdFx0XHRcdFx0bXNncGFja2Vycy5wdXNoKGdldFBhY2tlcihPYmplY3Qua2V5cyhlbnVtcykubGVuZ3RoKSk7XG5cdFx0XHRcdFx0XHRiYXNlQmluYXJ5TGVuZ3RoICs9IGdldEJ5dGVzVG9SZXByZXNlbnQoT2JqZWN0LmtleXMoZW51bXMpLmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRtc2dQcm9wZXJ0aWVzW21zZ2tleV0gPSBnZXRFbnVtQWNjZXNzb3JzKG1zZ2tleSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0XHRcdFx0bXNnUHJvcGVydGllc1ttc2drZXldID0gZ2V0U3RyaW5nQWNjZXNzb3JzKG1zZ2tleSk7XG5cdFx0XHRcdFx0XHRtc2d1bnBhY2tlcnMucHVzaCh1bnBhY2tlckxvb2t1cFtzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XV0pO1xuXHRcdFx0XHRcdFx0bXNncGFja2Vycy5wdXNoKHBhY2tlckxvb2t1cFtzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XV0pO1xuXHRcdFx0XHRcdFx0YmFzZUJpbmFyeUxlbmd0aCArPSBzaXplTG9va3VwW3NjaGVtYVtjbGFzc05hbWVdLmZvcm1hdFttc2drZXldXTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRtc2dQcm9wZXJ0aWVzW21zZ2tleV0gPSBnZXRSYXdBY2Nlc3Nvcihtc2drZXkpO1xuXHRcdFx0XHRcdFx0bXNndW5wYWNrZXJzLnB1c2godW5wYWNrZXJMb29rdXBbc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0W21zZ2tleV1dKTtcblx0XHRcdFx0XHRcdG1zZ3BhY2tlcnMucHVzaChwYWNrZXJMb29rdXBbc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0W21zZ2tleV1dKTtcblx0XHRcdFx0XHRcdGJhc2VCaW5hcnlMZW5ndGggKz0gc2l6ZUxvb2t1cFtzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XV07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgcHJvcGVydGllcyA9IHtcblx0XHRcdFx0J25hbWUnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IGNsYXNzTmFtZSxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2Zvcm1hdCc6IHtcblx0XHRcdFx0XHR2YWx1ZTogc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0LFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnaWQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IGluZGV4ICsgMSxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2VudW1zJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBlbnVtcyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3JldmVyc2VFbnVtcyc6IHtcblx0XHRcdFx0XHR2YWx1ZTogcmV2ZXJzZUVudW1zLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnbGVuZ3RoJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBtc2drZXlzLmxlbmd0aCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2tleXMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ2tleXMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCd1bnBhY2tlcnMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ3VucGFja2Vycyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J3BhY2tlcnMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ3BhY2tlcnMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdiYXNlQmluYXJ5TGVuZ3RoJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBiYXNlQmluYXJ5TGVuZ3RoLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnbXNnUHJvcGVydGllcyc6IHtcblx0XHRcdFx0XHR2YWx1ZTogbXNnUHJvcGVydGllcyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0bGV0IE1lc3NhZ2VDbGFzcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRNZXNzYWdlQmFzZS5jYWxsKHRoaXMpO1xuXHRcdFx0fTtcblxuXHRcdFx0TWVzc2FnZUNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30sIHByb3BlcnRpZXMpO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTWVzc2FnZUNsYXNzLCBwcm9wZXJ0aWVzKTtcblxuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlJZFtpbmRleCArIDFdID0gTWVzc2FnZUNsYXNzO1xuXHRcdFx0dGhpcy5tc2dDbGFzc2VzQnlOYW1lW2NsYXNzTmFtZV0gPSBNZXNzYWdlQ2xhc3M7XG5cdFx0fS5iaW5kKHRoaXMpKTtcbn1cblxuXHRnZXRCeU5hbWUobmFtZSkge1xuXHRcdHJldHVybiB0aGlzLm1zZ0NsYXNzZXNCeU5hbWVbbmFtZV07XG5cdH1cblxuXHRnZXRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMubXNnQ2xhc3Nlc0J5SWRbaWRdO1xuXHR9XG5cblx0Z2V0KGlkT3JOYW1lKSB7XG5cdFx0aWYoIWlzTmFOKHBhcnNlSW50KGlkT3JOYW1lKSkgJiYgaXNGaW5pdGUoaWRPck5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRCeUlkKGlkT3JOYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QnlOYW1lKGlkT3JOYW1lKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUZhY3Rvcnk7XG4iLCJmdW5jdGlvbiBNZXNzYWdlQmFzZSgpIHtcblx0dGhpcy5DbHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyk7XG5cdHRoaXMuYmluYXJ5TGVuZ3RoID0gdGhpcy5DbHMuYmFzZUJpbmFyeUxlbmd0aDtcblx0dGhpcy5yYXcgPSB7fTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB0aGlzLkNscy5tc2dQcm9wZXJ0aWVzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUJhc2U7XG4iLCJleHBvcnQgZnVuY3Rpb24gcGFja0Jvb2woZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVJbnQ4KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja0J5dGUoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldEludDgocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrVWJ5dGUoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVpbnQ4KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1Nob3J0KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRJbnQxNihwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tVc2hvcnQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVpbnQxNihwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tJbnQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldEludDMyKHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1VpbnQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldFVpbnQzMihwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tJbnQ2NChkdiwgcG9pbnRlciwgdmFsdWUpIHtcblx0ZHYuc2V0SW50NjQocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrVWludDY0KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRVaW50NjQocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrRmxvYXQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldEZsb2F0MzIocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrRG91YmxlKGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRGbG9hdDY0KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1N0cmluZyhkdiwgcG9pbnRlciwgdmFsdWUpIHtcblx0bGV0IHN0cmluZ0xlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblxuXHRwb2ludGVyID0gcGFja1VpbnQoZHYsIHBvaW50ZXIsIHN0cmluZ0xlbmd0aCk7XG5cblx0Zm9yKGxldCBpID0gMDsgaSA8IHN0cmluZ0xlbmd0aDsgaSsrKSB7XG5cdFx0cG9pbnRlciA9IHBhY2tVYnl0ZShkdiwgcG9pbnRlciwgdmFsdWUuY2hhckNvZGVBdChpKSk7XG5cdH1cblxuXHRyZXR1cm4gcG9pbnRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tFbnVtKHBhY2tlciwgZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdHJldHVybiBwYWNrZXIoZHYsIHBvaW50ZXIsIHZhbHVlKTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiB1bnBhY2tCb29sKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VUludDgocG9pbnRlcikgPT09IDEpO1xuXHRyZXR1cm4gcG9pbnRlciArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tCeXRlKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0SW50OChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1VieXRlKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VWludDgocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tTaG9ydChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEludDE2KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrVXNob3J0KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VWludDE2KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrSW50KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0SW50MzIocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tVaW50KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0VWludDMyKHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrSW50NjQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRJbnQ2NChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgODtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1VpbnQ2NChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldFVpbnQ2NChwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgODtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0Zsb2F0KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0RmxvYXQzMihwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0RvdWJsZShkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEZsb2F0NjQocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tTdHJpbmcoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHR2YXIgc3RyaW5nTGVuZ3RoID0gZHYuZ2V0VWludDMyKHBvaW50ZXIpLFxuXHRcdHZhbHVlcyA9IFtdLFxuXHRcdGk7XG5cblx0cG9pbnRlciArPSA0O1xuXG5cdGZvcihpID0gMDsgaSA8IHN0cmluZ0xlbmd0aDsgaSsrKSB7XG5cdFx0dmFsdWVzLnB1c2goZHYuZ2V0VWludDgocG9pbnRlciArIGkpKTtcblx0fVxuXG5cdGV4dHJhY3RlZC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdmFsdWVzKSk7XG5cdHJldHVybiBwb2ludGVyICsgc3RyaW5nTGVuZ3RoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrRW51bSh1bnBhY2tlciwgZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRwb2ludGVyID0gdW5wYWNrZXIoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCk7XG5cdHJldHVybiBwb2ludGVyO1xufVxuIiwiaW1wb3J0ICogYXMgdW5wYWNrZXJzIGZyb20gJy4vdW5wYWNrZXJzLmpzJztcbmltcG9ydCAqIGFzIHBhY2tlcnMgZnJvbSAnLi9wYWNrZXJzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJ5dGVzVG9SZXByZXNlbnQobnVtYmVyKSB7XG5cdHJldHVybiBNYXRoLmNlaWwoTWF0aC5sb2cobnVtYmVyICsgMSwgMikgLyA4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmFyeUZvcm1hdFN5bWJvbChudW1iZXIpIHtcblx0bGV0IGJ5dGVzTmVlZGVkID0gZ2V0Qnl0ZXNUb1JlcHJlc2VudChudW1iZXIpO1xuXG5cdGlmKGJ5dGVzTmVlZGVkIDw9IDEpIHtcblx0XHRyZXR1cm4gJ0InO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPT09IDIpIHtcblx0XHRyZXR1cm4gJ0gnO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPD0gNCkge1xuXHRcdHJldHVybiAnSSc7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA4KSB7XG5cdFx0cmV0dXJuICdRJztcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBgVW5hYmxlIHRvIHJlcHJlc2VudCBudW1iZXIgJG51bWJlciBpbiBwYWNrZWQgc3RydWN0dXJlYDtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5wYWNrZXIobnVtYmVyKSB7XG5cdGxldCBieXRlc05lZWRlZCA9IGdldEJ5dGVzVG9SZXByZXNlbnQobnVtYmVyKTtcblxuXHRpZihieXRlc05lZWRlZCA8PSAxKSB7XG5cdFx0cmV0dXJuIHVucGFja2Vycy51bnBhY2tVYnl0ZTtcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkID09PSAyKSB7XG5cdFx0cmV0dXJuIHVucGFja2Vycy51bnBhY2tVc2hvcnQ7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA0KSB7XG5cdFx0cmV0dXJuIHVucGFja2Vycy51bnBhY2tVaW50O1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPD0gOCkge1xuXHRcdHJldHVybiB1bnBhY2tlcnMudW5wYWNrVWludDY0O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IGBObyBzdWl0YWJsZSB1bnBhY2tlZCBjb3VsZCBiZSBmb3VuZCB0aGF0IGNvdWxkIHVucGFjayAkbnVtYmVyYDtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFja2VyKG51bWJlcikge1xuXHRsZXQgYnl0ZXNOZWVkZWQgPSBnZXRCeXRlc1RvUmVwcmVzZW50KG51bWJlcik7XG5cblx0aWYoYnl0ZXNOZWVkZWQgPD0gMSkge1xuXHRcdHJldHVybiBwYWNrZXJzLnBhY2tVYnl0ZTtcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkID09PSAyKSB7XG5cdFx0cmV0dXJuIHBhY2tlcnMucGFja1VzaG9ydDtcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDQpIHtcblx0XHRyZXR1cm4gcGFja2Vycy5wYWNrVWludDtcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDgpIHtcblx0XHRyZXR1cm4gcGFja2Vycy5wYWNrVWludDY0O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IGBObyBzdWl0YWJsZSB1bnBhY2tlZCBjb3VsZCBiZSBmb3VuZCB0aGF0IGNvdWxkIHVucGFjayAkbnVtYmVyYDtcblx0fVxufVxuIiwiaW1wb3J0IE1lc3NhZ2VGYWN0b3J5IGZyb20gJy4vanMvbWVzc2FnZS1mYWN0b3J5LmpzJztcbmltcG9ydCB7XG5cdHVucGFja01lc3NhZ2UsXG5cdHVucGFja01lc3NhZ2VzLFxuXHRwYWNrTWVzc2FnZSxcblx0cGFja01lc3NhZ2VzXG59IGZyb20gJy4uL3NyYy9qcy9pbnRlcmZhY2UuanMnO1xuXG52YXIgc2NoZW1hTWVzc2FnZXMgPSB7XG5cdCdNZXNzYWdlRmFjdG9yeSc6IE1lc3NhZ2VGYWN0b3J5LFxuXHQndW5wYWNrTWVzc2FnZSc6IHVucGFja01lc3NhZ2UsXG5cdCd1bnBhY2tNZXNzYWdlcyc6IHVucGFja01lc3NhZ2VzLFxuXHQncGFja01lc3NhZ2UnOiBwYWNrTWVzc2FnZSxcblx0J3BhY2tNZXNzYWdlcyc6IHBhY2tNZXNzYWdlc1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY2hlbWFNZXNzYWdlcztcbiJdfQ==
