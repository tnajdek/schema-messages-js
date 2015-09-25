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

			var MessageClass = function MessageClass() {
				_messageJs2['default'].call(this);
			};

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

			// @TODO revisit if setting properties like this can be avoided
			MessageClass.prototype = Object.create(_messageJs2['default'].prototype, properties);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9ib3dlcl9jb21wb25lbnRzL3V0ZjgvdXRmOC5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL2FjY2Vzc29ycy5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL2ludGVyZmFjZS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyIsIi9zcnYvaHR0cC9zY2hlbWEtbWVzc2FnZXMtanMvc3JjL2pzL21lc3NhZ2UuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9qcy9wYWNrZXJzLmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvanMvdW5wYWNrZXJzLmpzIiwiL3Nydi9odHRwL3NjaGVtYS1tZXNzYWdlcy1qcy9zcmMvanMvdXRpbHMuanMiLCIvc3J2L2h0dHAvc2NoZW1hLW1lc3NhZ2VzLWpzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0NBLENBQUMsQUFBQyxDQUFBLFVBQVMsSUFBSSxFQUFFOzs7QUFHaEIsS0FBSSxXQUFXLEdBQUcsT0FBTyxPQUFPLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQzs7O0FBR3hELEtBQUksVUFBVSxHQUFHLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLElBQ25ELE1BQU0sQ0FBQyxPQUFPLElBQUksV0FBVyxJQUFJLE1BQU0sQ0FBQzs7OztBQUl6QyxLQUFJLFVBQVUsR0FBRyxPQUFPLE1BQU0sSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDO0FBQ3JELEtBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxVQUFV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QUNuQjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUM3QyxHQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QixRQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDN0MsR0FBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUIsUUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0NBQ25COztBQUVNLFNBQVMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzlDLEdBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFFBQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztDQUNuQjs7QUFFTSxTQUFTLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUMzQyxHQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QixRQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDNUMsR0FBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDN0IsUUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0NBQ25COztBQUVNLFNBQVMsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzdDLEdBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFFBQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztDQUNuQjs7QUFFTSxTQUFTLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUM5QyxHQUFF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QUFnQjtBQUNoQyxnQkFBZSxpQ0FBZTtBQUM5QixpQkFBZ0Isa0NBQWdCO0FBQ2hDLGNBQWEsK0JBQWE7QUFDMUIsZUFBYyxnQ0FBYztDQUM1QixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qISBodHRwOi8vbXRocy5iZS91dGY4anMgdjIuMC4wIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWBcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLFxuXHQvLyBhbmQgdXNlIGl0IGFzIGByb290YFxuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5cdC8vIFRha2VuIGZyb20gaHR0cDovL210aHMuYmUvcHVueWNvZGVcblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW107XG5cdFx0dmFyIGNvdW50ZXIgPSAwO1xuXHRcdHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuXHRcdHZhciB2YWx1ZTtcblx0XHR2YXIgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0Ly8gVGFrZW4gZnJvbSBodHRwOi8vbXRocy5iZS9wdW55Y29kZVxuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgaW5kZXggPSAtMTtcblx0XHR2YXIgdmFsdWU7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IGFycmF5W2luZGV4XTtcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHRmdW5jdGlvbiBjcmVhdGVCeXRlKGNvZGVQb2ludCwgc2hpZnQpIHtcblx0XHRyZXR1cm4gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IHNoaWZ0KSAmIDB4M0YpIHwgMHg4MCk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbmNvZGVDb2RlUG9pbnQoY29kZVBvaW50KSB7XG5cdFx0aWYgKChjb2RlUG9pbnQgJiAweEZGRkZGRjgwKSA9PSAwKSB7IC8vIDEtYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0cmV0dXJuIHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQpO1xuXHRcdH1cblx0XHR2YXIgc3ltYm9sID0gJyc7XG5cdFx0aWYgKChjb2RlUG9pbnQgJiAweEZGRkZGODAwKSA9PSAwKSB7IC8vIDItYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0c3ltYm9sID0gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IDYpICYgMHgxRikgfCAweEMwKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoKGNvZGVQb2ludCAmIDB4RkZGRjAwMDApID09IDApIHsgLy8gMy1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gMTIpICYgMHgwRikgfCAweEUwKTtcblx0XHRcdHN5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwgNik7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKChjb2RlUG9pbnQgJiAweEZGRTAwMDAwKSA9PSAwKSB7IC8vIDQtYnl0ZSBzZXF1ZW5jZVxuXHRcdFx0c3ltYm9sID0gc3RyaW5nRnJvbUNoYXJDb2RlKCgoY29kZVBvaW50ID4+IDE4KSAmIDB4MDcpIHwgMHhGMCk7XG5cdFx0XHRzeW1ib2wgKz0gY3JlYXRlQnl0ZShjb2RlUG9pbnQsIDEyKTtcblx0XHRcdHN5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwgNik7XG5cdFx0fVxuXHRcdHN5bWJvbCArPSBzdHJpbmdGcm9tQ2hhckNvZGUoKGNvZGVQb2ludCAmIDB4M0YpIHwgMHg4MCk7XG5cdFx0cmV0dXJuIHN5bWJvbDtcblx0fVxuXG5cdGZ1bmN0aW9uIHV0ZjhlbmNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIGNvZGVQb2ludHMgPSB1Y3MyZGVjb2RlKHN0cmluZyk7XG5cblx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShjb2RlUG9pbnRzLm1hcChmdW5jdGlvbih4KSB7XG5cdFx0Ly8gXHRyZXR1cm4gJ1UrJyArIHgudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdFx0Ly8gfSkpKTtcblxuXHRcdHZhciBsZW5ndGggPSBjb2RlUG9pbnRzLmxlbmd0aDtcblx0XHR2YXIgaW5kZXggPSAtMTtcblx0XHR2YXIgY29kZVBvaW50O1xuXHRcdHZhciBieXRlU3RyaW5nID0gJyc7XG5cdFx0d2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0XHRcdGNvZGVQb2ludCA9IGNvZGVQb2ludHNbaW5kZXhdO1xuXHRcdFx0Ynl0ZVN0cmluZyArPSBlbmNvZGVDb2RlUG9pbnQoY29kZVBvaW50KTtcblx0XHR9XG5cdFx0cmV0dXJuIGJ5dGVTdHJpbmc7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHRmdW5jdGlvbiByZWFkQ29udGludWF0aW9uQnl0ZSgpIHtcblx0XHRpZiAoYnl0ZUluZGV4ID49IGJ5dGVDb3VudCkge1xuXHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgYnl0ZSBpbmRleCcpO1xuXHRcdH1cblxuXHRcdHZhciBjb250aW51YXRpb25CeXRlID0gYnl0ZUFycmF5W2J5dGVJbmRleF0gJiAweEZGO1xuXHRcdGJ5dGVJbmRleCsrO1xuXG5cdFx0aWYgKChjb250aW51YXRpb25CeXRlICYgMHhDMCkgPT0gMHg4MCkge1xuXHRcdFx0cmV0dXJuIGNvbnRpbnVhdGlvbkJ5dGUgJiAweDNGO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGVuZCB1cCBoZXJlLCBpdOKAmXMgbm90IGEgY29udGludWF0aW9uIGJ5dGVcblx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVjb2RlU3ltYm9sKCkge1xuXHRcdHZhciBieXRlMTtcblx0XHR2YXIgYnl0ZTI7XG5cdFx0dmFyIGJ5dGUzO1xuXHRcdHZhciBieXRlNDtcblx0XHR2YXIgY29kZVBvaW50O1xuXG5cdFx0aWYgKGJ5dGVJbmRleCA+IGJ5dGVDb3VudCkge1xuXHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgYnl0ZSBpbmRleCcpO1xuXHRcdH1cblxuXHRcdGlmIChieXRlSW5kZXggPT0gYnl0ZUNvdW50KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gUmVhZCBmaXJzdCBieXRlXG5cdFx0Ynl0ZTEgPSBieXRlQXJyYXlbYnl0ZUluZGV4XSAmIDB4RkY7XG5cdFx0Ynl0ZUluZGV4Kys7XG5cblx0XHQvLyAxLWJ5dGUgc2VxdWVuY2UgKG5vIGNvbnRpbnVhdGlvbiBieXRlcylcblx0XHRpZiAoKGJ5dGUxICYgMHg4MCkgPT0gMCkge1xuXHRcdFx0cmV0dXJuIGJ5dGUxO1xuXHRcdH1cblxuXHRcdC8vIDItYnl0ZSBzZXF1ZW5jZVxuXHRcdGlmICgoYnl0ZTEgJiAweEUwKSA9PSAweEMwKSB7XG5cdFx0XHR2YXIgYnl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MUYpIDw8IDYpIHwgYnl0ZTI7XG5cdFx0XHRpZiAoY29kZVBvaW50ID49IDB4ODApIHtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gMy1ieXRlIHNlcXVlbmNlIChtYXkgaW5jbHVkZSB1bnBhaXJlZCBzdXJyb2dhdGVzKVxuXHRcdGlmICgoYnl0ZTEgJiAweEYwKSA9PSAweEUwKSB7XG5cdFx0XHRieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRieXRlMyA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7XG5cdFx0XHRjb2RlUG9pbnQgPSAoKGJ5dGUxICYgMHgwRikgPDwgMTIpIHwgKGJ5dGUyIDw8IDYpIHwgYnl0ZTM7XG5cdFx0XHRpZiAoY29kZVBvaW50ID49IDB4MDgwMCkge1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyA0LWJ5dGUgc2VxdWVuY2Vcblx0XHRpZiAoKGJ5dGUxICYgMHhGOCkgPT0gMHhGMCkge1xuXHRcdFx0Ynl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTQgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MEYpIDw8IDB4MTIpIHwgKGJ5dGUyIDw8IDB4MEMpIHxcblx0XHRcdFx0KGJ5dGUzIDw8IDB4MDYpIHwgYnl0ZTQ7XG5cdFx0XHRpZiAoY29kZVBvaW50ID49IDB4MDEwMDAwICYmIGNvZGVQb2ludCA8PSAweDEwRkZGRikge1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRocm93IEVycm9yKCdJbnZhbGlkIFVURi04IGRldGVjdGVkJyk7XG5cdH1cblxuXHR2YXIgYnl0ZUFycmF5O1xuXHR2YXIgYnl0ZUNvdW50O1xuXHR2YXIgYnl0ZUluZGV4O1xuXHRmdW5jdGlvbiB1dGY4ZGVjb2RlKGJ5dGVTdHJpbmcpIHtcblx0XHRieXRlQXJyYXkgPSB1Y3MyZGVjb2RlKGJ5dGVTdHJpbmcpO1xuXHRcdGJ5dGVDb3VudCA9IGJ5dGVBcnJheS5sZW5ndGg7XG5cdFx0Ynl0ZUluZGV4ID0gMDtcblx0XHR2YXIgY29kZVBvaW50cyA9IFtdO1xuXHRcdHZhciB0bXA7XG5cdFx0d2hpbGUgKCh0bXAgPSBkZWNvZGVTeW1ib2woKSkgIT09IGZhbHNlKSB7XG5cdFx0XHRjb2RlUG9pbnRzLnB1c2godG1wKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVjczJlbmNvZGUoY29kZVBvaW50cyk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgdXRmOCA9IHtcblx0XHQndmVyc2lvbic6ICcyLjAuMCcsXG5cdFx0J2VuY29kZSc6IHV0ZjhlbmNvZGUsXG5cdFx0J2RlY29kZSc6IHV0ZjhkZWNvZGVcblx0fTtcblxuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB1dGY4O1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gdXRmODtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0dmFyIG9iamVjdCA9IHt9O1xuXHRcdFx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0Lmhhc093blByb3BlcnR5O1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHV0ZjgpIHtcblx0XHRcdFx0aGFzT3duUHJvcGVydHkuY2FsbCh1dGY4LCBrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gdXRmOFtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnV0ZjggPSB1dGY4O1xuXHR9XG5cbn0odGhpcykpO1xuIiwiaW1wb3J0IHV0ZjggZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy91dGY4L3V0ZjguanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW51bUFjY2Vzc29ycyhtc2drZXkpIHtcblx0cmV0dXJuIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuQ2xzLnJldmVyc2VFbnVtc1ttc2drZXldW3RoaXMucmF3W21zZ2tleV1dO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuXHRcdFx0dGhpcy5yYXdbbXNna2V5XSA9IHRoaXMuQ2xzLmVudW1zW21zZ2tleV1bbmV3VmFsdWVdO1xuXHRcdH1cblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0cmluZ0FjY2Vzc29ycyhtc2drZXkpIHtcblx0cmV0dXJuIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHV0ZjguZGVjb2RlKHRoaXMucmF3W21zZ2tleV0pO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuXHRcdFx0dGhpcy5iaW5hcnlMZW5ndGggLT0gdGhpcy5yYXdbbXNna2V5XSAmJiB0aGlzLnJhd1ttc2drZXldLmxlbmd0aCB8fCAwO1xuXHRcdFx0dGhpcy5yYXdbbXNna2V5XSA9IHV0ZjguZW5jb2RlKG5ld1ZhbHVlKTtcblx0XHRcdHRoaXMuYmluYXJ5TGVuZ3RoICs9IHRoaXMucmF3W21zZ2tleV0ubGVuZ3RoO1xuXHRcdH1cblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhd0FjY2Vzc29yKG1zZ2tleSkge1xuXHRyZXR1cm4ge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5yYXdbbXNna2V5XTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24obmV3VmFsdWUpIHtcblx0XHRcdHRoaXMucmF3W21zZ2tleV0gPSBuZXdWYWx1ZTtcblx0XHR9XG5cdH07XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gdW5wYWNrTWVzc2FnZUluRFYoZHYsIHBvaW50ZXIsIGl0ZW1zLCBmYWN0b3J5KSB7XG5cdGxldCBkYXRhID0gW10sXG5cdGlkcyA9IFtdLFxuXHRDbHMsIGl0ZW07XG5cblx0cG9pbnRlciA9IGZhY3RvcnkuaWRVbnBhY2tlcihkdiwgcG9pbnRlciwgaWRzKTtcblx0Q2xzID0gZmFjdG9yeS5nZXRCeUlkKGlkcy5wb3AoKSk7XG5cdGl0ZW0gPSBuZXcgQ2xzKCk7XG5cblx0Zm9yKGxldCBpID0gMDsgaSA8IENscy5sZW5ndGg7IGkrKykge1xuXHRcdHBvaW50ZXIgPSBDbHMudW5wYWNrZXJzW2ldKGR2LCBwb2ludGVyLCBkYXRhKTtcblx0XHRpdGVtLnJhd1tDbHMua2V5c1tpXV0gPSBkYXRhW2ldO1xuXHR9XG5cblx0aXRlbXMucHVzaChpdGVtKTtcblxuXHRyZXR1cm4gcG9pbnRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja01lc3NhZ2UoZGF0YSwgZmFjdG9yeSkge1xuXHRsZXQgbWVzc2FnZXMgPSBbXSxcblx0ZHYgPSBuZXcgRGF0YVZpZXcoZGF0YSk7XG5cblx0dW5wYWNrTWVzc2FnZUluRFYoZHYsIDAsIG1lc3NhZ2VzLCBmYWN0b3J5KTtcblxuXHRyZXR1cm4gbWVzc2FnZXMucG9wKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tNZXNzYWdlcyhkYXRhLCBmYWN0b3J5KSB7XG5cdGxldCBtZXNzYWdlcyA9IFtdLFxuXHRkdiA9IG5ldyBEYXRhVmlldyhkYXRhKSxcblx0cG9pbnRlciA9IDA7XG5cblx0d2hpbGUocG9pbnRlciA8IGRhdGEuYnl0ZUxlbmd0aCkge1xuXHRcdHBvaW50ZXIgPSB1bnBhY2tNZXNzYWdlSW5EVihkdiwgcG9pbnRlciwgbWVzc2FnZXMsIGZhY3RvcnkpO1xuXHR9XG5cblx0cmV0dXJuIG1lc3NhZ2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja01lc3NhZ2VJbkRWKGR2LCBwb2ludGVyLCBtc2csIGZhY3RvcnksIFR5cGVDbHMpIHtcblx0bGV0IENscyA9IFR5cGVDbHMgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG1zZyk7XG5cblx0cG9pbnRlciA9IGZhY3RvcnkuaWRQYWNrZXIoZHYsIHBvaW50ZXIsIENscy5pZCk7XG5cblx0Zm9yKGxldCBpID0gMDsgaSA8IENscy5sZW5ndGg7IGkrKykge1xuXHRcdHBvaW50ZXIgPSBDbHMucGFja2Vyc1tpXShkdiwgcG9pbnRlciwgbXNnLnJhd1tDbHMua2V5c1tpXV0pO1xuXHR9XG5cblx0cmV0dXJuIHBvaW50ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrTWVzc2FnZShtZXNzYWdlLCBmYWN0b3J5KSB7XG5cdGxldCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobWVzc2FnZS5iaW5hcnlMZW5ndGgpLFxuXHRcdGR2ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG5cblx0cGFja01lc3NhZ2VJbkRWKGR2LCAwLCBtZXNzYWdlLCBmYWN0b3J5KTtcblxuXHRyZXR1cm4gYnVmZmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja01lc3NhZ2VzKG1lc3NhZ2VzLCBmYWN0b3J5KSB7XG5cdGxldCB0b3RhbEJpbmFyeUxlbmd0aCA9IDAsXG5cdFx0cG9pbnRlciA9IDAsXG5cdFx0YnVmZmVyLCBkdjtcblxuXHRmb3IobGV0IGkgPSAwLCBsZW4gPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdHRvdGFsQmluYXJ5TGVuZ3RoICs9IG1lc3NhZ2VzW2ldLmJpbmFyeUxlbmd0aDtcblx0fVxuXG5cdGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcih0b3RhbEJpbmFyeUxlbmd0aCk7XG5cdGR2ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG5cblx0Zm9yKGxldCBpID0gMCwgbGVuID0gbWVzc2FnZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRwb2ludGVyID0gcGFja01lc3NhZ2VJbkRWKGR2LCBwb2ludGVyLCBtZXNzYWdlc1tpXSwgZmFjdG9yeSk7XG5cdH1cblxuXHRyZXR1cm4gYnVmZmVyO1xufVxuIiwiaW1wb3J0IE1lc3NhZ2VCYXNlIGZyb20gJy4vbWVzc2FnZS5qcyc7XG5pbXBvcnQge1xuXHRnZXRFbnVtQWNjZXNzb3JzLFxuXHRnZXRTdHJpbmdBY2Nlc3NvcnMsXG5cdGdldFJhd0FjY2Vzc29yXG59IGZyb20gJy4vYWNjZXNzb3JzLmpzJztcbmltcG9ydCAqIGFzIHVucGFja2VycyBmcm9tICcuL3VucGFja2Vycy5qcyc7XG5pbXBvcnQgKiBhcyBwYWNrZXJzIGZyb20gJy4vcGFja2Vycy5qcyc7XG5cbmltcG9ydCB7XG5cdGdldEJ5dGVzVG9SZXByZXNlbnQsXG5cdGdldEJpbmFyeUZvcm1hdFN5bWJvbCxcblx0Z2V0VW5wYWNrZXIsXG5cdGdldFBhY2tlclxufSBmcm9tICcuL3V0aWxzLmpzJztcblxuXG5jb25zdCBNQVhfU1VQUE9SVEVEX05VTUJFUiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSID4gTWF0aC5wb3coMiwgNjQpIC0gMSA/IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIDogTWF0aC5wb3coMiwgNjQpIC0gMTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG5cbmxldCBzaXplTG9va3VwID0ge1xuXHRcdCdib29sJzogMSxcblx0XHQnYnl0ZSc6IDEsXG5cdFx0J3VieXRlJzogMSxcblx0XHQnY2hhcic6IDEsXG5cdFx0J3Nob3J0JzogMixcblx0XHQndXNob3J0JzogMixcblx0XHQnaW50JzogNCxcblx0XHQndWludCc6IDQsXG5cdFx0J2ludDY0JzogOCxcblx0XHQndWludDY0JzogOCxcblx0XHQnZmxvYXQnOiA0LFxuXHRcdCdkb3VibGUnOiA4LFxuXHRcdCdzdHJpbmcnOiA0XG5cdH0sXG5cdHVucGFja2VyTG9va3VwID0ge30sXG5cdHBhY2tlckxvb2t1cCA9IHt9O1xuXG5PYmplY3Qua2V5cyhzaXplTG9va3VwKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGVOYW1lKSB7XG5cdHVucGFja2VyTG9va3VwW3R5cGVOYW1lXSA9IHVucGFja2Vyc1sndW5wYWNrJyArIHR5cGVOYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHlwZU5hbWUuc2xpY2UoMSldO1xuXHRwYWNrZXJMb29rdXBbdHlwZU5hbWVdID0gcGFja2Vyc1sncGFjaycgKyB0eXBlTmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR5cGVOYW1lLnNsaWNlKDEpXTtcbn0pO1xuXG51bnBhY2tlckxvb2t1cC5lbnVtID0gdW5wYWNrZXJzLnVucGFja0VudW07XG5wYWNrZXJMb29rdXAuZW51bSA9IHBhY2tlcnMucGFja0VudW07XG5cbmNsYXNzIE1lc3NhZ2VGYWN0b3J5IHtcblx0Y29uc3RydWN0b3Ioc2NoZW1hKSB7XG5cdFx0bGV0IGtleXMgPSBPYmplY3Qua2V5cyhzY2hlbWEpLnNvcnQoKTtcblx0XHR0aGlzLm1zZ0NsYXNzZXNCeU5hbWUgPSB7fTtcblx0XHR0aGlzLm1zZ0NsYXNzZXNCeUlkID0ge307XG5cdFx0dGhpcy5ieXRlc05lZWRlZEZvcklkID0gZ2V0Qnl0ZXNUb1JlcHJlc2VudChrZXlzLmxlbmd0aCk7XG5cdFx0dGhpcy5pZEJpbmFyeUZvcm1hdCA9IGdldEJpbmFyeUZvcm1hdFN5bWJvbChrZXlzLmxlbmd0aCk7XG5cdFx0dGhpcy5pZFVucGFja2VyID0gZ2V0VW5wYWNrZXIoa2V5cy5sZW5ndGgpO1xuXHRcdHRoaXMuaWRQYWNrZXIgPSBnZXRQYWNrZXIoa2V5cy5sZW5ndGgpO1xuXG5cdFx0a2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGNsYXNzTmFtZSwgaW5kZXgpIHtcblx0XHRcdHZhciBlbnVtcyA9IHt9LFxuXHRcdFx0XHRyZXZlcnNlRW51bXMgPSB7fSxcblx0XHRcdFx0bXNna2V5cyA9IE9iamVjdC5rZXlzKHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdCkuc29ydCgpLFxuXHRcdFx0XHRiYXNlQmluYXJ5TGVuZ3RoID0gdGhpcy5ieXRlc05lZWRlZEZvcklkLFxuXHRcdFx0XHRtc2d1bnBhY2tlcnMgPSBbXSxcblx0XHRcdFx0bXNncGFja2VycyA9IFtdLFxuXHRcdFx0XHRtc2dQcm9wZXJ0aWVzID0ge307XG5cblx0XHRcdGlmKHNjaGVtYVtjbGFzc05hbWVdLmVudW1zKSB7XG5cdFx0XHRcdGZvcihsZXQgZW51bU5hbWUgaW4gc2NoZW1hW2NsYXNzTmFtZV0uZW51bXMpIHtcblx0XHRcdFx0XHRsZXQgZW51bVZhbHVlcyA9IHNjaGVtYVtjbGFzc05hbWVdLmVudW1zW2VudW1OYW1lXTtcblx0XHRcdFx0XHRlbnVtc1tlbnVtTmFtZV0gPSB7fTtcblx0XHRcdFx0XHRyZXZlcnNlRW51bXNbZW51bU5hbWVdID0ge307XG5cdFx0XHRcdFx0Zm9yKGxldCBlbnVtS2V5IGluIGVudW1WYWx1ZXMpIHtcblx0XHRcdFx0XHRcdGxldCBlbnVtVmFsdWUgPSBlbnVtVmFsdWVzW2VudW1LZXldO1xuXHRcdFx0XHRcdFx0ZW51bXNbZW51bU5hbWVdW2VudW1LZXldID0gZW51bVZhbHVlO1xuXHRcdFx0XHRcdFx0cmV2ZXJzZUVudW1zW2VudW1OYW1lXVtlbnVtVmFsdWVdID0gZW51bUtleTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IE1lc3NhZ2VDbGFzcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRNZXNzYWdlQmFzZS5jYWxsKHRoaXMpO1xuXHRcdFx0fTtcblxuXHRcdFx0bXNna2V5cy5mb3JFYWNoKGZ1bmN0aW9uKG1zZ2tleSkge1xuXHRcdFx0XHRzd2l0Y2goc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0W21zZ2tleV0pIHtcblx0XHRcdFx0XHRjYXNlICdlbnVtJzpcblx0XHRcdFx0XHRcdG1zZ3VucGFja2Vycy5wdXNoKGdldFVucGFja2VyKE9iamVjdC5rZXlzKGVudW1zKS5sZW5ndGgpKTtcblx0XHRcdFx0XHRcdG1zZ3BhY2tlcnMucHVzaChnZXRQYWNrZXIoT2JqZWN0LmtleXMoZW51bXMpLmxlbmd0aCkpO1xuXHRcdFx0XHRcdFx0YmFzZUJpbmFyeUxlbmd0aCArPSBnZXRCeXRlc1RvUmVwcmVzZW50KE9iamVjdC5rZXlzKGVudW1zKS5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0bXNnUHJvcGVydGllc1ttc2drZXldID0gZ2V0RW51bUFjY2Vzc29ycyhtc2drZXkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRcdG1zZ1Byb3BlcnRpZXNbbXNna2V5XSA9IGdldFN0cmluZ0FjY2Vzc29ycyhtc2drZXkpO1xuXHRcdFx0XHRcdFx0bXNndW5wYWNrZXJzLnB1c2godW5wYWNrZXJMb29rdXBbc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0W21zZ2tleV1dKTtcblx0XHRcdFx0XHRcdG1zZ3BhY2tlcnMucHVzaChwYWNrZXJMb29rdXBbc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0W21zZ2tleV1dKTtcblx0XHRcdFx0XHRcdGJhc2VCaW5hcnlMZW5ndGggKz0gc2l6ZUxvb2t1cFtzY2hlbWFbY2xhc3NOYW1lXS5mb3JtYXRbbXNna2V5XV07XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0bXNnUHJvcGVydGllc1ttc2drZXldID0gZ2V0UmF3QWNjZXNzb3IobXNna2V5KTtcblx0XHRcdFx0XHRcdG1zZ3VucGFja2Vycy5wdXNoKHVucGFja2VyTG9va3VwW3NjaGVtYVtjbGFzc05hbWVdLmZvcm1hdFttc2drZXldXSk7XG5cdFx0XHRcdFx0XHRtc2dwYWNrZXJzLnB1c2gocGFja2VyTG9va3VwW3NjaGVtYVtjbGFzc05hbWVdLmZvcm1hdFttc2drZXldXSk7XG5cdFx0XHRcdFx0XHRiYXNlQmluYXJ5TGVuZ3RoICs9IHNpemVMb29rdXBbc2NoZW1hW2NsYXNzTmFtZV0uZm9ybWF0W21zZ2tleV1dO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0bGV0IHByb3BlcnRpZXMgPSB7XG5cdFx0XHRcdCduYW1lJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBjbGFzc05hbWUsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdmb3JtYXQnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IHNjaGVtYVtjbGFzc05hbWVdLmZvcm1hdCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2lkJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBpbmRleCArIDEsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdlbnVtcyc6IHtcblx0XHRcdFx0XHR2YWx1ZTogZW51bXMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdyZXZlcnNlRW51bXMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IHJldmVyc2VFbnVtcyxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J2xlbmd0aCc6IHtcblx0XHRcdFx0XHR2YWx1ZTogbXNna2V5cy5sZW5ndGgsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdrZXlzJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBtc2drZXlzLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQndW5wYWNrZXJzJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBtc2d1bnBhY2tlcnMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdwYWNrZXJzJzoge1xuXHRcdFx0XHRcdHZhbHVlOiBtc2dwYWNrZXJzLFxuXHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnYmFzZUJpbmFyeUxlbmd0aCc6IHtcblx0XHRcdFx0XHR2YWx1ZTogYmFzZUJpbmFyeUxlbmd0aCxcblx0XHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0J21zZ1Byb3BlcnRpZXMnOiB7XG5cdFx0XHRcdFx0dmFsdWU6IG1zZ1Byb3BlcnRpZXMsXG5cdFx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdC8vIEBUT0RPIHJldmlzaXQgaWYgc2V0dGluZyBwcm9wZXJ0aWVzIGxpa2UgdGhpcyBjYW4gYmUgYXZvaWRlZFxuXHRcdFx0TWVzc2FnZUNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWVzc2FnZUJhc2UucHJvdG90eXBlLCBwcm9wZXJ0aWVzKTtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE1lc3NhZ2VDbGFzcywgcHJvcGVydGllcyk7XG5cblx0XHRcdHRoaXMubXNnQ2xhc3Nlc0J5SWRbaW5kZXggKyAxXSA9IE1lc3NhZ2VDbGFzcztcblx0XHRcdHRoaXMubXNnQ2xhc3Nlc0J5TmFtZVtjbGFzc05hbWVdID0gTWVzc2FnZUNsYXNzO1xuXHRcdH0uYmluZCh0aGlzKSk7XG59XG5cblx0Z2V0QnlOYW1lKG5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5tc2dDbGFzc2VzQnlOYW1lW25hbWVdO1xuXHR9XG5cblx0Z2V0QnlJZChpZCkge1xuXHRcdHJldHVybiB0aGlzLm1zZ0NsYXNzZXNCeUlkW2lkXTtcblx0fVxuXG5cdGdldChpZE9yTmFtZSkge1xuXHRcdGlmKCFpc05hTihwYXJzZUludChpZE9yTmFtZSkpICYmIGlzRmluaXRlKGlkT3JOYW1lKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QnlJZChpZE9yTmFtZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmdldEJ5TmFtZShpZE9yTmFtZSk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VGYWN0b3J5O1xuIiwiZnVuY3Rpb24gTWVzc2FnZUJhc2UoKSB7XG5cdHRoaXMuQ2xzID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xuXHR0aGlzLmJpbmFyeUxlbmd0aCA9IHRoaXMuQ2xzLmJhc2VCaW5hcnlMZW5ndGg7XG5cdHRoaXMucmF3ID0ge307XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywgdGhpcy5DbHMubXNnUHJvcGVydGllcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VCYXNlO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHBhY2tCb29sKGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRVSW50OChwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tCeXRlKGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRJbnQ4KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1VieXRlKGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRVaW50OChwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTaG9ydChkdiwgcG9pbnRlciwgdmFsdWUpIHtcblx0ZHYuc2V0SW50MTYocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrVXNob3J0KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRVaW50MTYocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrSW50KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRJbnQzMihwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tVaW50KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRVaW50MzIocG9pbnRlciwgdmFsdWUpO1xuXHRyZXR1cm4gcG9pbnRlciArIDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrSW50NjQoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGR2LnNldEludDY0KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1VpbnQ2NChkdiwgcG9pbnRlciwgdmFsdWUpIHtcblx0ZHYuc2V0VWludDY0KHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja0Zsb2F0KGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRkdi5zZXRGbG9hdDMyKHBvaW50ZXIsIHZhbHVlKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja0RvdWJsZShkdiwgcG9pbnRlciwgdmFsdWUpIHtcblx0ZHYuc2V0RmxvYXQ2NChwb2ludGVyLCB2YWx1ZSk7XG5cdHJldHVybiBwb2ludGVyICsgODtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTdHJpbmcoZHYsIHBvaW50ZXIsIHZhbHVlKSB7XG5cdGxldCBzdHJpbmdMZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cblx0cG9pbnRlciA9IHBhY2tVaW50KGR2LCBwb2ludGVyLCBzdHJpbmdMZW5ndGgpO1xuXG5cdGZvcihsZXQgaSA9IDA7IGkgPCBzdHJpbmdMZW5ndGg7IGkrKykge1xuXHRcdHBvaW50ZXIgPSBwYWNrVWJ5dGUoZHYsIHBvaW50ZXIsIHZhbHVlLmNoYXJDb2RlQXQoaSkpO1xuXHR9XG5cblx0cmV0dXJuIHBvaW50ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrRW51bShwYWNrZXIsIGR2LCBwb2ludGVyLCB2YWx1ZSkge1xuXHRyZXR1cm4gcGFja2VyKGR2LCBwb2ludGVyLCB2YWx1ZSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gdW5wYWNrQm9vbChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldFVJbnQ4KHBvaW50ZXIpID09PSAxKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrQnl0ZShkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEludDgocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tVYnl0ZShkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldFVpbnQ4KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrU2hvcnQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRJbnQxNihwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja1VzaG9ydChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldFVpbnQxNihwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0ludChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEludDMyKHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrVWludChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldFVpbnQzMihwb2ludGVyKSk7XG5cdHJldHVybiBwb2ludGVyICsgNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0ludDY0KGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0ZXh0cmFjdGVkLnB1c2goZHYuZ2V0SW50NjQocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tVaW50NjQoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRVaW50NjQocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tGbG9hdChkdiwgcG9pbnRlciwgZXh0cmFjdGVkKSB7XG5cdGV4dHJhY3RlZC5wdXNoKGR2LmdldEZsb2F0MzIocG9pbnRlcikpO1xuXHRyZXR1cm4gcG9pbnRlciArIDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2tEb3VibGUoZHYsIHBvaW50ZXIsIGV4dHJhY3RlZCkge1xuXHRleHRyYWN0ZWQucHVzaChkdi5nZXRGbG9hdDY0KHBvaW50ZXIpKTtcblx0cmV0dXJuIHBvaW50ZXIgKyA4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrU3RyaW5nKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0dmFyIHN0cmluZ0xlbmd0aCA9IGR2LmdldFVpbnQzMihwb2ludGVyKSxcblx0XHR2YWx1ZXMgPSBbXSxcblx0XHRpO1xuXG5cdHBvaW50ZXIgKz0gNDtcblxuXHRmb3IoaSA9IDA7IGkgPCBzdHJpbmdMZW5ndGg7IGkrKykge1xuXHRcdHZhbHVlcy5wdXNoKGR2LmdldFVpbnQ4KHBvaW50ZXIgKyBpKSk7XG5cdH1cblxuXHRleHRyYWN0ZWQucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHZhbHVlcykpO1xuXHRyZXR1cm4gcG9pbnRlciArIHN0cmluZ0xlbmd0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVucGFja0VudW0odW5wYWNrZXIsIGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpIHtcblx0cG9pbnRlciA9IHVucGFja2VyKGR2LCBwb2ludGVyLCBleHRyYWN0ZWQpO1xuXHRyZXR1cm4gcG9pbnRlcjtcbn1cbiIsImltcG9ydCAqIGFzIHVucGFja2VycyBmcm9tICcuL3VucGFja2Vycy5qcyc7XG5pbXBvcnQgKiBhcyBwYWNrZXJzIGZyb20gJy4vcGFja2Vycy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCeXRlc1RvUmVwcmVzZW50KG51bWJlcikge1xuXHRyZXR1cm4gTWF0aC5jZWlsKE1hdGgubG9nKG51bWJlciArIDEsIDIpIC8gOCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCaW5hcnlGb3JtYXRTeW1ib2wobnVtYmVyKSB7XG5cdGxldCBieXRlc05lZWRlZCA9IGdldEJ5dGVzVG9SZXByZXNlbnQobnVtYmVyKTtcblxuXHRpZihieXRlc05lZWRlZCA8PSAxKSB7XG5cdFx0cmV0dXJuICdCJztcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkID09PSAyKSB7XG5cdFx0cmV0dXJuICdIJztcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDQpIHtcblx0XHRyZXR1cm4gJ0knO1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPD0gOCkge1xuXHRcdHJldHVybiAnUSc7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgYFVuYWJsZSB0byByZXByZXNlbnQgbnVtYmVyICRudW1iZXIgaW4gcGFja2VkIHN0cnVjdHVyZWA7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVucGFja2VyKG51bWJlcikge1xuXHRsZXQgYnl0ZXNOZWVkZWQgPSBnZXRCeXRlc1RvUmVwcmVzZW50KG51bWJlcik7XG5cblx0aWYoYnl0ZXNOZWVkZWQgPD0gMSkge1xuXHRcdHJldHVybiB1bnBhY2tlcnMudW5wYWNrVWJ5dGU7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA9PT0gMikge1xuXHRcdHJldHVybiB1bnBhY2tlcnMudW5wYWNrVXNob3J0O1xuXHR9IGVsc2UgaWYoYnl0ZXNOZWVkZWQgPD0gNCkge1xuXHRcdHJldHVybiB1bnBhY2tlcnMudW5wYWNrVWludDtcblx0fSBlbHNlIGlmKGJ5dGVzTmVlZGVkIDw9IDgpIHtcblx0XHRyZXR1cm4gdW5wYWNrZXJzLnVucGFja1VpbnQ2NDtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBgTm8gc3VpdGFibGUgdW5wYWNrZWQgY291bGQgYmUgZm91bmQgdGhhdCBjb3VsZCB1bnBhY2sgJG51bWJlcmA7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhY2tlcihudW1iZXIpIHtcblx0bGV0IGJ5dGVzTmVlZGVkID0gZ2V0Qnl0ZXNUb1JlcHJlc2VudChudW1iZXIpO1xuXG5cdGlmKGJ5dGVzTmVlZGVkIDw9IDEpIHtcblx0XHRyZXR1cm4gcGFja2Vycy5wYWNrVWJ5dGU7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA9PT0gMikge1xuXHRcdHJldHVybiBwYWNrZXJzLnBhY2tVc2hvcnQ7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA0KSB7XG5cdFx0cmV0dXJuIHBhY2tlcnMucGFja1VpbnQ7XG5cdH0gZWxzZSBpZihieXRlc05lZWRlZCA8PSA4KSB7XG5cdFx0cmV0dXJuIHBhY2tlcnMucGFja1VpbnQ2NDtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBgTm8gc3VpdGFibGUgdW5wYWNrZWQgY291bGQgYmUgZm91bmQgdGhhdCBjb3VsZCB1bnBhY2sgJG51bWJlcmA7XG5cdH1cbn1cbiIsImltcG9ydCBNZXNzYWdlRmFjdG9yeSBmcm9tICcuL2pzL21lc3NhZ2UtZmFjdG9yeS5qcyc7XG5pbXBvcnQge1xuXHR1bnBhY2tNZXNzYWdlLFxuXHR1bnBhY2tNZXNzYWdlcyxcblx0cGFja01lc3NhZ2UsXG5cdHBhY2tNZXNzYWdlc1xufSBmcm9tICcuLi9zcmMvanMvaW50ZXJmYWNlLmpzJztcblxudmFyIHNjaGVtYU1lc3NhZ2VzID0ge1xuXHQnTWVzc2FnZUZhY3RvcnknOiBNZXNzYWdlRmFjdG9yeSxcblx0J3VucGFja01lc3NhZ2UnOiB1bnBhY2tNZXNzYWdlLFxuXHQndW5wYWNrTWVzc2FnZXMnOiB1bnBhY2tNZXNzYWdlcyxcblx0J3BhY2tNZXNzYWdlJzogcGFja01lc3NhZ2UsXG5cdCdwYWNrTWVzc2FnZXMnOiBwYWNrTWVzc2FnZXNcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2NoZW1hTWVzc2FnZXM7XG4iXX0=
