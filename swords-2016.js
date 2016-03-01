

require("sleepless");
require("g")("log5");


wrt = function(s) {
	process.stdout.write(s);
}

game = {};
game.player = {};
game.player.has_visited = {};
game.inventory = [];
game.world = {};
game.world.places = [];
game.world.places.push({
	name: "Home",
	enter: function(){
		wrt("\nYou see your home.\n")
	},
	look: function() {
		wrt( "\n"+
			"Your home is located high in the mountains nestled in an alpine "+
			"canyon and surrounded by majestic trees.  "+
			"A meadow stretches out in front of your cabin and down the canyon.  "+
			"You have always been at home in these woods and the "+
			"birds are always singing in this peaceful place.  "+
			"\n");
	},
	exits: {south: "trail"},
});
game.world.places.push({
	name: "Trail",
	enter: function() {
		wrt("\nYou are on the river trail.\n");
	},
	look: function() {
		wrt( "\n"+
			"You are on what you call the 'river trail'.  "+
			"There is good fishing in some spots here.  "+
			"It runs along the north bank of the Hoopty river.  "+
			"There is good fishing in some spots here.  "+
			"\n");
	},
	exits: {north: "home"},
});


//here = game.world.places[0];


look = function(args) {

	here.look();

	var a = []
	for(var k in here.exits) {
		a.push(k);
	};
	wrt("\nYou can go "+a.join(", ")+".\n");
}


enter_place = function(place) {
	here = place;
	here.enter([]);
	if(!game.player.has_visited[here.name]) {
		look([]);
		game.player.has_visited[here.name] = true;
	}
}

go = function(args) {
	var where = args[1];	
	if(!where) {
		wrt("Go where?\n");
		return;
	}
	var there = here.exits[where];
	if(!there) {
		wrt("Can't go there.\n");
		return;
	}
	for(var i = 0; i < game.world.places.length; i++) {
		var place = game.world.places[i];
		if(place.name.ucase() == there.ucase()) {
			enter_place(place);
			return;
		}
	};
	wrt("bad link: "+there+"\n");
}


parse = function(line) {
	line = line.trim();

	var args = line.split(/\s/);
	//I("args="+o2j(args));
	var cmd = args[0];
	if(!cmd) {
		return;
	}

	var fun = global[cmd];
	if(typeof fun === "function") {
		fun(args);
	}
	else {
		wrt("What?\n");
	}
}


enter_place(game.world.places[0]);
//here.enter([]);
//look([]);


prompt = function() {
	process.stdout.write("\nSwords > ");
}

prompt();
require("chopper");
stream = process.stdin
var chopper = new StreamChopper(stream, "\n", function(line) {
    chopper.pause();
	parse(line);
	prompt();
	chopper.resume();
});
