export function packBool(dv, pointer, value) {
	dv.setUInt8(pointer, value);
	return pointer + 1;
}

export function packByte(dv, pointer, value) {
	dv.setInt8(pointer, value);
	return pointer + 1;
}

export function packUbyte(dv, pointer, value) {
	dv.setUint8(pointer, value);
	return pointer + 1;
}

export function packShort(dv, pointer, value) {
	dv.setInt16(pointer, value);
	return pointer + 2;
}

export function packUshort(dv, pointer, value) {
	dv.setUint16(pointer, value);
	return pointer + 2;
}

export function packInt(dv, pointer, value) {
	dv.setInt32(pointer, value);
	return pointer + 4;
}

export function packUint(dv, pointer, value) {
	dv.setUint32(pointer, value);
	return pointer + 4;
}

export function packInt64(dv, pointer, value) {
	dv.setInt64(pointer, value);
	return pointer + 8;
}

export function packUint64(dv, pointer, value) {
	dv.setUint64(pointer, value);
	return pointer + 8;
}

export function packFloat(dv, pointer, value) {
	dv.setFloat32(pointer, value);
	return pointer + 4;
}

export function packDouble(dv, pointer, value) {
	dv.setFloat64(pointer, value);
	return pointer + 8;
}

export function packString(dv, pointer, value) {
	let stringLength = value.length;

	pointer = packUint(dv, pointer, stringLength);

	for(let i = 0; i < stringLength; i++) {
		pointer = packUbyte(dv, pointer, value.charCodeAt(i));
	}

	return pointer;
}

export function packEnum(enums, packer, dv, pointer, value) {
	return packer(dv, pointer, enums[value]);
}
