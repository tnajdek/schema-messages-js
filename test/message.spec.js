/* eslint-env node, jasmine */
'use strict';

import MessageFactory from 'js/message-factory.js';

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
		msg.x = x || 1;
		msg.y = y || 3;
		msg.direction = direction || 'south';
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


});
