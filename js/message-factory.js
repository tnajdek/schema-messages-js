import struct from 'bower_components/jspack-arraybuffer/struct.js';
import MessageBase from 'js/message.js';
import stringFormat from 'js/string-format.js';
import utf8 from 'bower_components/utf8/utf8.js';

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
	'double': 'd'
};


let getBinaryFormatSymbol = function(number) {
	let bytesNeeded = Math.ceil(Math.log(number, 2) / 8);

	if(bytesNeeded <= 1) {
		return 'B';
	} else if(bytesNeeded === 2) {
		return 'H';
	} else if(bytesNeeded <= 4) {
		return 'I';
	} else if(bytesNeeded <= 8) {
		return 'Q';
	} else {
		throw `Unable to represent number $number in packed structure`;
	}
};

export default class {
	constructor(schema) {
		let keys = Object.keys(schema).sort();
		this.msgClassesByName = {};
		this.msgClassesById = {};
		this.bytesNeededForId = Math.ceil(Math.log(keys.length + 1, 2) / 8);
		this.idBinaryFormat = getBinaryFormatSymbol(keys.length);

		keys.forEach(function(className, index) {
			var enums = {}, reverseEnums = {};

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
			let MessageClass = Object.create(MessageBase.prototype, {
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
		}.bind(this));
	}

	getBinaryFormat(msgSchema) {
		let fields = Object.keys(msgSchema.format).sort();
		let binaryFormat = '!';  // we always use network (big-endian) byte order
		binaryFormat += this.idBinaryFormat;

		fields.forEach(function(field) {
			if(msgSchema.format[field] === 'string') {
				binaryFormat += 'I{}s';
			}
			else if(msgSchema.format[field] === 'enum') {
				try {
					binaryFormat += getBinaryFormatSymbol(Object.keys(msgSchema.format[field]).length);
				} catch(e) {
					throw `Enum field can contain the maximum number MAX_SUPPORTED_NUMBER possible values.`;
				}
			} else {
				try {
					binaryFormat += binaryTypes[msgSchema.format[field]];
				} catch(e) {
					throw `Unknown field type msgSchema.format[field].`;
				}
			}
		});

		return binaryFormat;
	}

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

	unpackMessage(data) {
		let bufferDV = new DataView(data);
		let msgId = bufferDV['getUint' + (this.bytesNeededForId * 8)](0);
		let cls = this.getById(msgId);
		let item = Object.create(cls);
		let keys = Object.keys(cls.format).sort();
		let stringLengths = [];
		let indexestoRemove = [];

		for(let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let type = cls.format[key];
			if(type === 'string') {
				let offset = this.bytesNeededForId + i;
				let stringLength = bufferDV.getUint32(offset);
				stringLengths.push(stringLength);
				indexestoRemove.push(i);
			}
		}

		let binaryFormat = stringFormat(cls.binaryFormat, stringLengths);
		let msgData = struct.unpack(binaryFormat, data);
		msgData.shift(); //remove the id

		for(let i = 0; i < indexestoRemove.length; i++) {
			msgData.splice(indexestoRemove[i], 1);
		}

		for(let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let type = cls.format[key];
			item.data[key] = msgData[i];
			if(type === 'string') {
				item.data[key] = utf8.decode(item.data[key]);
			}
			if(type === 'enum') {
				item.data[key] = cls.reverseEnums[key][item.data[key]];
			}
		}

		return item;
	}

	unpackMessages(data) {
		let messages = [];

		while(data.byteLength) {
			let msg = this.unpackMessage(data);
			data = data.slice(msg.getBinaryLength());
			messages.push(msg);
		}

		return messages;
	}

}
