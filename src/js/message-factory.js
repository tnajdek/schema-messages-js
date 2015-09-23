// import struct from '../bower_components/jspack-arraybuffer/struct.js';
import MessageBase from './message.js';
// import stringFormat from './string-format.js';
import utf8 from '../bower_components/utf8/utf8.js';
import * as unpackers from './unpackers.js';
import * as packers from './packers.js';

import {
	getBytesToRepresent,
	getBinaryFormatSymbol,
	getUnpacker,
	getPacker
} from './utils.js';


const MAX_SUPPORTED_NUMBER = Number.MAX_SAFE_INTEGER > Math.pow(2, 64) - 1 ? Number.MAX_SAFE_INTEGER : Math.pow(2, 64) - 1; //eslint-disable-line

let binaryTypes = {
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
Object.keys(binaryTypes).forEach(function(typeName) {
	unpackerLookup[typeName] = unpackers['unpack' + typeName.charAt(0).toUpperCase() + typeName.slice(1)];
	packerLookup[typeName] = packers['pack' + typeName.charAt(0).toUpperCase() + typeName.slice(1)];
});

unpackerLookup.enum = unpackers.unpackEnum;
packerLookup.enum = packers.packEnum;

class MessageFactory {
	constructor(schema) {
		let keys = Object.keys(schema).sort();
		this.msgClassesByName = {};
		this.msgClassesById = {};
		this.bytesNeededForId = getBytesToRepresent(keys.length);
		this.idBinaryFormat = getBinaryFormatSymbol(keys.length);
		this.idUnpacker = getUnpacker(keys.length);
		this.idPacker = getPacker(keys.length);

		keys.forEach(function(className, index) {
			var enums = {},
				reverseEnums = {},
				msgkeys = Object.keys(schema[className].format).sort(),
				baseBinaryLength = this.bytesNeededForId,
				msgunpackers = [],
				msgpackers = [],
				dynamicFieldsIndexes = [],
				msgProperties = {};



			if(schema[className].enums) {
				for(let enumName in schema[className].enums) {
					let enumValues = schema[className].enums[enumName];
					enums[enumName] = {};
					reverseEnums[enumName] = {};
					for(let enumKey in enumValues) {
						let enumValue = enumValues[enumKey];
						enums[enumName][enumKey] = enumValue;
						reverseEnums[enumName][enumValue] = enumKey;
					}
				}
			}

			let MessageClass = function() {
				MessageBase.call(this);
			};

			msgkeys.forEach(function(msgkey, msgkeyindex) {
				let unpacker = unpackerLookup[schema[className].format[msgkey]],
				packer = packerLookup[schema[className].format[msgkey]];

				if(schema[className].format[msgkey] === 'enum') {
					msgunpackers.push(unpacker.bind(MessageClass, reverseEnums[msgkey], getUnpacker(Object.keys(enums).length)));
					msgpackers.push(packer.bind(MessageClass, enums[msgkey], getPacker(Object.keys(enums).length)));
					baseBinaryLength += getBytesToRepresent(Object.keys(enums).length);
					msgProperties[msgkey] = {
						get: function() {
							return this.Cls.reverseEnums[msgkey][this.raw[msgkey]];
						},
						set: function(newValue) {
							this.raw[msgkey] = this.Cls.enums[msgkey][newValue];
						}
					};
				} else {
					msgunpackers.push(unpacker.bind(MessageClass));
					msgpackers.push(packer.bind(MessageClass));
					baseBinaryLength += sizeLookup[schema[className].format[msgkey]];

					if(schema[className].format[msgkey] === 'string') {
						dynamicFieldsIndexes.push(msgkeyindex);
						msgProperties[msgkey] = {
							get: function() {
								return utf8.decode(this.raw[msgkey]);
							},
							set: function(newValue) {
								this.binaryLength -= this.raw[msgkey].length;
								this.raw[msgkey] = utf8.encode(newValue);
								this.binaryLength += this.raw[msgkey].length;
							}
						};
					} else {
						msgProperties[msgkey] = {
							get: function() {
								return this.raw[msgkey];
							},
							set: function(newValue) {
								this.raw[msgkey] = newValue;
							}
						};
					}
				}
			});

			let properties = {
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
			MessageClass.prototype = Object.create(MessageBase.prototype, properties);
			Object.defineProperties(MessageClass, properties);

			this.msgClassesById[index + 1] = MessageClass;
			this.msgClassesByName[className] = MessageClass;
		}.bind(this));
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

	getByName(name) {
		return this.msgClassesByName[name];
	}

	getById(id) {
		return this.msgClassesById[id];
	}

	get(idOrName) {
		if(!isNaN(parseInt(idOrName)) && isFinite(idOrName)) {
			return this.getById(idOrName);
		} else {
			return this.getByName(idOrName);
		}
	}
}

export default MessageFactory;
