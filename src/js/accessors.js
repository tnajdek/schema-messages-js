import utf8 from '../bower_components/utf8/utf8.js';

export function getEnumAccessors(msgkey) {
	return {
		get: function() {
			return this.Cls.reverseEnums[msgkey][this.raw[msgkey]];
		},
		set: function(newValue) {
			this.raw[msgkey] = this.Cls.enums[msgkey][newValue];
		}
	};
}

export function getStringAccessors(msgkey) {
	return {
		get: function() {
			return utf8.decode(this.raw[msgkey]);
		},
		set: function(newValue) {
			this.binaryLength -= this.raw[msgkey] && this.raw[msgkey].length || 0;
			this.raw[msgkey] = utf8.encode(newValue);
			this.binaryLength += this.raw[msgkey].length;
		}
	};
}

export function getRawAccessor(msgkey) {
	return {
		get: function() {
			return this.raw[msgkey];
		},
		set: function(newValue) {
			this.raw[msgkey] = newValue;
		}
	};
}
