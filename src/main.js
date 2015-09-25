import MessageFactory from './js/message-factory.js';
import {
	unpackMessage,
	unpackMessages,
	packMessage,
	packMessages
} from '../src/js/interface.js';

var schemaMessages = {
	'MessageFactory': MessageFactory,
	'unpackMessage': unpackMessage,
	'unpackMessages': unpackMessages,
	'packMessage': packMessage,
	'packMessages': packMessages
};

module.exports = schemaMessages;
