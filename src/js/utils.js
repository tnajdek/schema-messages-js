import * as unpackers from './unpackers.js';
import * as packers from './packers.js';

export function getBytesToRepresent(number) {
	return Math.ceil(Math.log(number + 1, 2) / 8);
}

export function getBinaryFormatSymbol(number) {
	let bytesNeeded = getBytesToRepresent(number);

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
}

export function getUnpacker(number) {
	let bytesNeeded = getBytesToRepresent(number);

	if(bytesNeeded <= 1) {
		return unpackers.unpackUbyte;
	} else if(bytesNeeded === 2) {
		return unpackers.unpackUshort;
	} else if(bytesNeeded <= 4) {
		return unpackers.unpackUint;
	} else if(bytesNeeded <= 8) {
		return unpackers.unpackUint64;
	} else {
		throw `No suitable unpacked could be found that could unpack $number`;
	}
}

export function getPacker(number) {
	let bytesNeeded = getBytesToRepresent(number);

	if(bytesNeeded <= 1) {
		return packers.packUbyte;
	} else if(bytesNeeded === 2) {
		return packers.packUshort;
	} else if(bytesNeeded <= 4) {
		return packers.packUint;
	} else if(bytesNeeded <= 8) {
		return packers.packUint64;
	} else {
		throw `No suitable unpacked could be found that could unpack $number`;
	}
}
