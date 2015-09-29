/**
 * Base for every Class Message
 * @constructor
 */
function MessageBase() {
	this.Cls = Object.getPrototypeOf(this);
	this.binaryLength = this.Cls.baseBinaryLength;
	this.raw = {};

	Object.defineProperties(this, this.Cls.msgProperties);
}

export default MessageBase;
