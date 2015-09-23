export function unpackMessageInDV(dv, pointer, items, factory) {
	let data = [],
	ids = [],
	Cls, item;

	pointer = factory.idUnpacker(dv, pointer, ids);
	Cls = this.getById(ids.pop());
	item = new Cls();

	for(let i = 0; i < Cls.length; i++) {
		pointer = Cls.unpackers[i](dv, pointer, data);
		item.data[Cls.keys[i]] = data[i];
	}

	items.push(item);

	return pointer;
}

export function unpackMessage(data, factory) {
	let messages = [],
	dv = new DataView(data);

	unpackMessageInDV(dv, 0, messages, factory);

	return messages.pop();
}

export function unpackMessages(data, factory) {
	let messages = [],
	dv = new DataView(data),
	pointer = 0;

	while(pointer < data.byteLength) {
		pointer = unpackMessageInDV(dv, pointer, messages, factory);
	}

	return messages;
}

export function packMessageInDV(dv, pointer, msg, factory, TypeCls) {
	let Cls = TypeCls || Object.getPrototypeOf(msg);

	pointer = factory.idPacker(dv, pointer, Cls.id);

	for(let i = 0; i < Cls.length; i++) {
		pointer = Cls.packers[i](dv, pointer, msg[Cls.keys[i]]);
	}

	return pointer;
}

export function packMessage(message, factory) {
	let buffer = new ArrayBuffer(message.binaryLength),
		dv = new DataView(buffer);

	packMessageInDV(dv, 0, message, factory);

	return buffer;
}

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
