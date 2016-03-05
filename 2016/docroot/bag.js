
// Bag is just an object, but has a prototype function forEach() so you can iterate over it's properties.
function Bag() { }
Bag.prototype = {
	toArray: function() {
		var t = this;
		var a = [];
		for(var k in t) {
			if(t.hasOwnProperty(k)) {
				a.push(t[k]);
			}
		}
		return a;
	},
	forEach: function(cb) {
		this.toArray().forEach(cb);
	}
}


