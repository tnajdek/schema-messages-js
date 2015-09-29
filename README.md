#Schema Messages

[![Build Status](https://travis-ci.org/tnajdek/schema-messages-js.svg?branch=master)](https://travis-ci.org/tnajdek/schema-messages-js)
[![Coverage Status](https://coveralls.io/repos/tnajdek/schema-messages-js/badge.svg?branch=master&service=github)](https://coveralls.io/github/tnajdek/schema-messages-js?branch=master)

This is a JavaScript implementation of Schema Messages for modern browsers. 

Schema Messages creates binary representation of structured data that can be efficiently transmitted over network. Anticipated for use in applications where identical structure messages are transmitted repeatively, e.g. in multiplayer/online games. For example sending the following message:

	{
		'player_id': 42,
		'position_x': 123.45,
		'position_y': 6789.21
	}

Would take 64 bytes to transfer using raw json, 52 bytes using [msgpack](http://msgpack.org/) and only 10 bytes using Schema Messages which would look something like this:

	01 2A 42 F6 E6 66 45 D4 29 AE

However bear in mind that to encode/decode the message on either end, one needs a schema which would look something like this:

	{
			"FrameMessage": {
					"format": {
							"position_x": "float",
							"position_y": "float",
							"player_id": "ubyte"
					 }
			 }
	 }

Schemas **must** be pre-shared on both ends for communication to works.

#Installation

Schema Messages can be installed using either bower:

    bower i schema-messages

or npm:

    npm i schema-messages

#Usage

Schema Messages are distributed using Universal Module Definition and can be included directly using a script tag, or as a part of your AMD or Common JS application. It can also be used in Node:

    var schemaMessages = require('schema-messages');

First thing you need is to define schema describing every possible message that your application will ever need to pack/unpack. Here is an example of a Message Factory with a schema containing one simple message:

    var factory = new schemaMessages.MessageFactory({
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
        }
    }

With factory created you can prepare your message:

    var FooMessage = factory.get('FooMessage')
    var msg = new FooMessage();
    msg.direction = 'south';
    msg.x = 123;
    msg.y = 456;

Now message can be packed into an ArrayBuffer:

    var bytes = schemaMessages.packMessage(msg);

And bytes can be sent over the WebSocket. On the other end you will also need a factory with exactly the same schema. Equiped with that you can unpack your message:

    var msg = schemaMessages.unpackMessage(bytes);

For more examples see [tests](https://github.com/tnajdek/schema-messages-js/blob/master/test/src/message.spec.js) and [demo app](https://github.com/tnajdek/schema-messages-demo)

#Message Types

Schema Messages can pack/unpack the following types:

**bool**
Boolean type (true/false), packed into 1 byte

**byte**
A number between -127 and 127, packed into 1 byte

**ubyte**
A number between 0 and 255, packed into 1 byte

**short**
A number between -32,768 and 32,767, packed into 2 bytes

**ushort**
A number between 0 and 65,535, packed into 2 bytes

**int**
A number between -2,147,483,648 and 2,147,483,647, packed into 4 bytes

**uint**
A number between 0 and 4,294,967,295, packed into 4 bytes

**int64**
A number between –9,223,372,036,854,775,808 to 9,223,372,036,854,775,807, packed into 8 bytes. This is not handled very well in JavaScript because it only supports 53 bit integers.

**uint64**
A number between 0 and 18,446,744,073,709,551,615, packed into 8 bytes. JavaScript might not handle this very well. This is not handled very well in JavaScript because it only supports 53 bit integers.

**float**
A 32 to bit floating-point value, packed into 4 bytes

**double**
A 64-bit floating-point value, packed into 8 bytes

**string**
A string value, unicode is supported. Total binary length is: binary length of the string + 4 bytes overhead.

**enum**
The enum is used to declare an enumeration, values for which need to be specified in the schema. Binary length is chosen to be as small as possible based on the number of values within the enumeration.