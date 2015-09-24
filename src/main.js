import MessageFactory from './js/message-factory.js';
import {
	unpackMessage,
	unpackMessages,
	packMessage,
	packMessages
} from '../src/js/interface.js';

module.exports = {
	'MessageFactory': MessageFactory,
	'unpackMessage': unpackMessage,
	'unpackMessages': unpackMessages,
	'packMessage': packMessage,
	'packMessages': packMessages
};
