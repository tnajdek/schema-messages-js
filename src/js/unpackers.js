export function unpackBool(dv, pointer, extracted) {
	extracted.push(dv.getUInt8(pointer) === 1);
	return pointer + 1;
}

export function unpackByte(dv, pointer, extracted) {
	extracted.push(dv.getInt8(pointer));
	return pointer + 1;
}

export function unpackUbyte(dv, pointer, extracted) {
	extracted.push(dv.getUint8(pointer));
	return pointer + 1;
}

export function unpackShort(dv, pointer, extracted) {
	extracted.push(dv.getInt16(pointer));
	return pointer + 2;
}

export function unpackUshort(dv, pointer, extracted) {
	extracted.push(dv.getUint16(pointer));
	return pointer + 2;
}

export function unpackInt(dv, pointer, extracted) {
	extracted.push(dv.getInt32(pointer));
	return pointer + 4;
}

export function unpackUint(dv, pointer, extracted) {
	extracted.push(dv.getUint32(pointer));
	return pointer + 4;
}

export function unpackInt64(dv, pointer, extracted) {
	extracted.push(dv.getInt64(pointer));
	return pointer + 8;
}

export function unpackUint64(dv, pointer, extracted) {
	extracted.push(dv.getUint64(pointer));
	return pointer + 8;
}

export function unpackFloat(dv, pointer, extracted) {
	extracted.push(dv.getFloat32(pointer));
	return pointer + 4;
}

export function unpackDouble(dv, pointer, extracted) {
	extracted.push(dv.getFloat64(pointer));
	return pointer + 8;
}

export function unpackString(dv, pointer, extracted) {
	var stringLength = dv.getUint32(pointer),
		values = [],
		i;

	pointer += 4;

	for(i = 0; i < stringLength; i++) {
		values.push(dv.getUint8(pointer + i));
	}

	extracted.push(String.fromCharCode.apply(null, values));
	return pointer + stringLength;
}

export function unpackEnum(unpacker, dv, pointer, extracted) {
	pointer = unpacker(dv, pointer, extracted);
	return pointer;
}
