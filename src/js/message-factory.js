import MessageBase from './message.js';
import {
	getEnumAccessors,
	getStringAccessors,
	getRawAccessor
} from './accessors.js';
import * as unpackers from './unpackers.js';
import * as packers from './packers.js';

import {
	getBytesToRepresent,
	getUnpacker,
	getPacker
} from './utils.js';


const MAX_SUPPORTED_NUMBER = Number.MAX_SAFE_INTEGER > Math.pow(2, 64) - 1 ? Number.MAX_SAFE_INTEGER : Math.pow(2, 64) - 1; //eslint-disable-line

let sizeLookup = {
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

Object.keys(sizeLookup).forEach(function(typeName) {
	unpackerLookup[typeName] = unpackers['unpack' + typeName.charAt(0).toUpperCase() + typeName.slice(1)];
	packerLookup[typeName] = packers['pack' + typeName.charAt(0).toUpperCase() + typeName.slice(1)];
});

unpackerLookup.enum = unpackers.unpackEnum;
packerLookup.enum = packers.packEnum;

/**
 * Parses Schema and creates Message classes
 * @constructor
 * @param {Object} schena
 */
class MessageFactory {
	constructor(schema) {
		let keys = Object.keys(schema).sort();
		this.msgClassesByName = {};
		this.msgClassesById = {};
		this.bytesNeededForId = getBytesToRepresent(keys.length);
		this.idUnpacker = getUnpacker(keys.length);
		this.idPacker = getPacker(keys.length);

		keys.forEach(function(className, index) {
			var enums = {},
				reverseEnums = {},
				msgkeys = Object.keys(schema[className].format).sort(),
				baseBinaryLength = this.bytesNeededForId,
				msgunpackers = [],
				msgpackers = [],
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

			msgkeys.forEach(function(msgkey) {
				switch(schema[className].format[msgkey]) {
					case 'enum':
						msgunpackers.push(getUnpacker(Object.keys(enums).length));
						msgpackers.push(getPacker(Object.keys(enums).length));
						baseBinaryLength += getBytesToRepresent(Object.keys(enums).length);
						msgProperties[msgkey] = getEnumAccessors(msgkey);
					break;

					case 'string':
						msgProperties[msgkey] = getStringAccessors(msgkey);
						msgunpackers.push(unpackerLookup[schema[className].format[msgkey]]);
						msgpackers.push(packerLookup[schema[className].format[msgkey]]);
						baseBinaryLength += sizeLookup[schema[className].format[msgkey]];
					break;

					default:
						msgProperties[msgkey] = getRawAccessor(msgkey);
						msgunpackers.push(unpackerLookup[schema[className].format[msgkey]]);
						msgpackers.push(packerLookup[schema[className].format[msgkey]]);
						baseBinaryLength += sizeLookup[schema[className].format[msgkey]];
					break;
				}
			});

			let properties = {
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

			let MessageClass = function() {
				MessageBase.call(this);
			};

			MessageClass.prototype = Object.create({}, properties);
			Object.defineProperties(MessageClass, properties);

			this.msgClassesById[index + 1] = MessageClass;
			this.msgClassesByName[className] = MessageClass;
		}.bind(this));
}

	/**
	 * Obtain Message Class by name
	 * @param  {string} name - The name of the class to obtain
	 * @return {Object} -  Message Class
	 */
	getByName(name) {
		return this.msgClassesByName[name];
	}

	/**
	 * Obtain Message Class by id
	 * @param  {number} id - the id of the class to obtaim
	 * @return {Object} - Message Class
	 */
	getById(id) {
		return this.msgClassesById[id];
	}

	/**
	 * Obtain Message Class either by name or id.
	 * Convienient but slightly slower than getByName or getById
	 * @param  {string|number} idOrName - the id or name of the class to obtain
	 * @return {Object} - Message Class
	 */
	get(idOrName) {
		if(!isNaN(parseInt(idOrName)) && isFinite(idOrName)) {
			return this.getById(idOrName);
		} else {
			return this.getByName(idOrName);
		}
	}
}

export default MessageFactory;
