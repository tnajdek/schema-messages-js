/* eslint-env node, jasmine */
'use strict';

import utf8 from '../src/bower_components/utf8/utf8.js';
import MessageFactory from '../src/js/message-factory.js';

var schema = {
	'FooMessage': {
		'enums': {
			'direction': {
				'north': 1,
				'south': 2,
				'east': 3,
				'west': 4
			}
		},
		'format': {
			'x': 'uint',
			'y': 'uint',
			'direction': 'enum'
		}
	},
	'BarMessage': {
		'format': {
			'name': 'string',
			'score': 'ushort'
		}
	},
	'VectorMessage': {
		'format': {
			'x': 'float',
			'y': 'float'
		}
	}
};

describe('Message Factory', function() {
	var factory;

	beforeEach(function() {
		factory = new MessageFactory(schema);
	});

	function getFooMsg(x, y, direction) {
		let msg = Object.create(factory.get('FooMessage'));
		msg.data.x = x || 1;
		msg.data.y = y || 3;
		msg.data.direction = direction || 'south';
		return msg;
	}

	function getBarMsg(name, score) {
		let msg = Object.create(factory.get('BarMessage'));
		msg.data.name = name || 'Yoda';
		msg.data.score = score || 42;
		return msg;
	}

	function getVectorMsg(name, x, y) {
		let msg = Object.create(factory.get('VectorMessage'));
		msg.data.x = x || 1;
		msg.data.y = y || 7.77;
		return msg;
	}

	it('It should generate correct class', function() {
		let FooMessage = factory.get('FooMessage');
		let BarMessage = factory.get('BarMessage');
		expect(FooMessage.name).toBe('FooMessage');
		expect(BarMessage.name).toBe('BarMessage');
		expect(FooMessage.binaryFormat).toBe('!BBII');
		expect(FooMessage.id).toBe(2);
		expect(FooMessage.schema).toBe(schema);
		expect(BarMessage.binaryFormat).toBe('!BI{}sH');
		expect(BarMessage.id).toBe(1);

		// this would be sweet!
		// let fooMsg = getFooMsg();
		// expect(fooMsg instanceof FooMessage).toBe(true);
	});

	it('It should pack messages', function() {
		let msg = getFooMsg(2, 4, 'east');
		let packed = msg.pack();
		expect(packed instanceof ArrayBuffer).toBe(true);
		let packedDV = new DataView(packed);
		expect(packedDV.byteLength).toBe(1 + 1 + 4 + 4);
		expect(packedDV.getUint8(0)).toBe(2); // msg id
		expect(packedDV.getUint8(1)).toBe(3); // direction
		expect(packedDV.getUint32(2)).toBe(2); // x
		expect(packedDV.getUint32(6)).toBe(4); // y
	});

	it('It should pack messages with a string', function() {
		let msg = getBarMsg('Mr ☃');
		let packed = msg.pack();
		packed = msg.pack();
		let packedDV = new DataView(packed);
		expect(packedDV.byteLength).toBe(1 + 2 + 4 + 6);
		expect(packedDV.getUint8(0)).toBe(1); // msg id
		expect(packedDV.getUint32(1)).toBe(6); // length of the following string

		let extractedString = '';
		for(let i = 5; i < 11; i++) {
			extractedString += String.fromCharCode(packedDV.getUint8(i));
		}

		expect(utf8.decode(extractedString)).toBe('Mr ☃'); // there is the string back!
		expect(packedDV.getUint16(11)).toBe(42); // score
	});

	it('It should unpack messages', function() {
		let packed = new ArrayBuffer(9);
		let packedDV = new DataView(packed);
		packedDV.setUint8(0, 3);
		packedDV.setFloat32(1, 1);
		packedDV.setFloat32(5, 7.77);

		let unpackedMsg = factory.unpackMessage(packed);
		expect(unpackedMsg.data.x).toBe(1);
		/* Yo Jasmine, no almost equal? meh */
		expect(Math.round(unpackedMsg.data.y * 100) / 100).toBe(7.77);
	});

	it('It should unpack messages with a string', function() {
		let packed = new ArrayBuffer(13);
		let packedDV = new DataView(packed);
		let encodedString = utf8.encode('Mr ☃');
		packedDV.setUint8(0, 1);
		packedDV.setUint32(1, 6);
		for (let i = 0, len = encodedString.length; i < len; i++) {
			packedDV.setUint8(5 + i, encodedString.charCodeAt(i));
		}
		packedDV.setUint16(11, 42);
		let unpackedMsg = factory.unpackMessage(packed);
		expect(unpackedMsg.data.name).toBe('Mr ☃');
		expect(unpackedMsg.data.score).toBe(42);
	});

	it('It should eat own dog food', function() {
		let msg = getFooMsg(null, 1.0);
		let packedMsg = msg.pack();
		let unpacked = factory.unpackMessage(packedMsg);

		expect(msg.data.x).toBe(unpacked.data.x);
		expect(msg.data.y).toBe(unpacked.data.y);
		expect(msg.data.direction).toBe(unpacked.data.direction);
	});

	it('It should unpack many messages', function() {
		let msg = getFooMsg();
		let packed = new ArrayBuffer(30);
		let packedDV = new DataView(packed);
		packedDV.setUint8(0, Object.getPrototypeOf(msg).id);
		packedDV.setUint8(1, Object.getPrototypeOf(msg).enums.direction.south);
		packedDV.setUint32(2, 1);
		packedDV.setUint32(6, 3);

		msg = getBarMsg();
		packedDV.setUint8(10, Object.getPrototypeOf(msg).id);
		packedDV.setUint32(11, 4);
		for (let i = 0; i < 4; i++) {
			packedDV.setUint8(15 + i, 'Yoda'.charCodeAt(i));
		}
		packedDV.setUint16(19, 42);

		msg = getVectorMsg();
		packedDV.setUint8(21, Object.getPrototypeOf(msg).id);
		packedDV.setFloat32(22, 1);
		packedDV.setFloat32(26, 7.77);

		let unpackedMsgs = factory.unpackMessages(packed);
		expect(Object.getPrototypeOf(unpackedMsgs[0]).name, 'FooMessage');
		expect(Object.getPrototypeOf(unpackedMsgs[1]).name, 'BarMessage');
		expect(Object.getPrototypeOf(unpackedMsgs[2]).name, 'VectorMessage');
		expect(unpackedMsgs[0].data.direction).toBe('south');
		expect(unpackedMsgs[0].data.x).toBe(1);
		expect(unpackedMsgs[0].data.y).toBe(3);
		expect(unpackedMsgs[1].data.name).toBe('Yoda');
		expect(unpackedMsgs[1].data.score).toBe(42);
		expect(unpackedMsgs[2].data.x).toBe(1);
		expect(Math.round(unpackedMsgs[2].data.y * 100) / 100).toBe(7.77);
	});

	it('It should pack many messages', function() {
		let messages = [];
		let ourPacked = new ArrayBuffer(30);
		let packedDV = new DataView(ourPacked);

		let msg1 = getFooMsg();
		packedDV.setUint8(0, Object.getPrototypeOf(msg1).id);
		packedDV.setUint8(1, Object.getPrototypeOf(msg1).enums.direction.south);
		packedDV.setUint32(2, 1);
		packedDV.setUint32(6, 3);

		let msg2 = getBarMsg();
		packedDV.setUint8(10, Object.getPrototypeOf(msg2).id);
		packedDV.setUint32(11, 4);
		for (let i = 0; i < 4; i++) {
			packedDV.setUint8(15 + i, 'Yoda'.charCodeAt(i));
		}
		packedDV.setUint16(19, 42);

		let msg3 = getBarMsg();
		packedDV.setUint8(21, Object.getPrototypeOf(msg3).id);
		packedDV.setFloat32(22, 1);
		packedDV.setFloat32(26, 7.77);

		messages = [msg1, msg2, msg3];
		let theirPacked = factory.packMessages(messages);

		expect(ourPacked).toEqual(theirPacked);

		let ourPackedU8 = new Uint8Array(ourPacked);
		let theirPackedU8 = new Uint8Array(theirPacked);

		for(let i of ourPackedU8) {
			expect(ourPackedU8[i]).toBe(theirPackedU8[i]);
		}

	});
});
