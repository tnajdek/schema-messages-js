/**
 * Unpack message within a DataView at given pointer
 * Used internally by other unpacking functions
 * @param  {DataView} dv - View on the packed messages
 * @param  {number} pointer - Points on which byte the message starts
 * @param  {Object[]} items - an array where unpacked message will be pushed
 * @param  {MessageFactory} factory
 * @return {number} - Points at the first byte after the message
 */
export function unpackMessageInDV(dv, pointer, items, factory) {
	let data = [],
	ids = [],
	Cls, item;

	pointer = factory.idUnpacker(dv, pointer, ids);
	Cls = factory.getById(ids.pop());
	item = new Cls();

	for(let i = 0; i < Cls.length; i++) {
		pointer = Cls.unpackers[i](dv, pointer, data);
		item.raw[Cls.keys[i]] = data[i];
	}

	items.push(item);

	return pointer;
}

/**
 * Unpack a message from binary to object
 * @param  {ArrayBuffer} data - Single packed message
 * @param  {MessageFactory} factory
 * @return {Object} - unpacked message
 */
export function unpackMessage(data, factory) {
	let messages = [],
	dv = new DataView(data);

	unpackMessageInDV(dv, 0, messages, factory);

	return messages.pop();
}

/**
 * Unpack multiple messages from binary to an array of objects
 * @param  {ArrayBuffer} data - Packed messages
 * @param  {MessageFactory} factory
 * @return {Object} - unpacked message
 */
export function unpackMessages(data, factory) {
	let messages = [],
	dv = new DataView(data),
	pointer = 0;

	while(pointer < data.byteLength) {
		pointer = unpackMessageInDV(dv, pointer, messages, factory);
	}

	return messages;
}

/**
 * Pack message within DataView at a given pointer
 * Used internally to by other packing functions
 * @param  {DataView} dv - View on the buffer messages are packed into
 * @param  {number} pointer - Points on where the message should start
 * @param  {Object} msg - message object for packing
 * @param  {MessageFactory} factory
 * @param  {Object} [TypeCls] - Message Class
 * @return {number} Points at the first byte after the message
 */
export function packMessageInDV(dv, pointer, msg, factory, TypeCls) {
	let Cls = TypeCls || Object.getPrototypeOf(msg);

	pointer = factory.idPacker(dv, pointer, Cls.id);

	for(let i = 0; i < Cls.length; i++) {
		pointer = Cls.packers[i](dv, pointer, msg.raw[Cls.keys[i]]);
	}

	return pointer;
}

/**
 * Pack single message
 * @param  {Object} message
 * @param  {MessageFactory} factory
 * @return {ArrayBuffer} - packed message
 */
export function packMessage(message, factory) {
	let buffer = new ArrayBuffer(message.binaryLength),
		dv = new DataView(buffer);

	packMessageInDV(dv, 0, message, factory);

	return buffer;
}

/**
 * Pack an array of messages
 * @param  {Object[]} messages
 * @param  {MessageFactory} factory
 * @return {ArrayBuffer} - packed messages
 */
export function packMessages(messages, factory) {
	let totalBinaryLength = 0,
		pointer = 0,
		buffer, dv;

	for(let i = 0, len = messages.length; i < len; i++) {
		totalBinaryLength += messages[i].binaryLength;
	}

	buffer = new ArrayBuffer(totalBinaryLength);
	dv = new DataView(buffer);

	for(let i = 0, len = messages.length; i < len; i++) {
		pointer = packMessageInDV(dv, pointer, messages[i], factory);
	}

	return buffer;
}
