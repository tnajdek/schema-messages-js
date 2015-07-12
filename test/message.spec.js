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
	});
});
