import * as unpackers from './unpackers.js';
import * as packers from './packers.js';

/**
 * Returns number of bytes required to store integer number
 * @param  {number} number - integer number to be represented
 * @return {number} - number of bytes required to represent a number
 */
export function getBytesToRepresent(number) {
	return Math.ceil(Math.log(number + 1, 2) / 8);
}

/**
 * Returns unpacker suitable for unpacking given integer number
 * Used internally when parsing schema for selecting how many
 * bytes should be allocated  for ids and enums
 * @param  {number} number - a number to be unpacked
 * @return {Function} - unpacker
 */
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

/**
 * Returns packer suitable for packing given integer number
 * Used internally when parsing schema for selecting how many
 * bytes should be allocated for ids and enums
 * @param  {number} number - a number to be packed
 * @return {Function} - packer
 */
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
