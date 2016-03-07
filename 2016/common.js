

exit_with_id = function(id) {
	var places = game.world.places;
	var l = places.length;
	for(var i = 0; i < l; i++) {
		var place = places[i];
		for(var j = 0; j < place.exits.length; j++) {
			if(place.exits[j].id == id) {
				return place.exits[j];
			}
		}
	}
	return null;
}

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

