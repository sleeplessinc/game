
place_with_id = function(id) {
	var places = game.world.places;
	var l = places.length;
	for(var i = 0; i < l; i++) {
		if(places[i].id == id) {
			return places[i];
		}
	}
	return null;
}

index_of_place_with_id = function(id) {
	var places = game.world.places;
	var l = places.length;
	for(var i = 0; i < l; i++) {
		if(places[i].id == id) {
			return i;
		}
	}
	return -1;
}


if(typeof process !== "undefined") {
	// node.js
	module.exports.place_with_id = place_with_id;
}

