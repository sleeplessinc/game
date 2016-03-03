

require("sleepless");
require("g")("log5");

var DS = require("ds").DS
ds = new DS()

if(!ds.game) {
	ds.game = {};
	ds.game.pack = {};
	ds.game.has_visited = {};
	ds.game.world = {};
	ds.game.world.places = [];
	ds.game.world.places[0] = {
		name: "Nowhere",
		desc: "You see nothing.\n",
		exits: {},
	}
	//ds.save();
}

wrt = function(s) {
	process.stdout.write(s);
}

game = ds.game;
/*
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
*/


here = null;


look = function(args, cb) {

	wrt("____ "+here.name+" ____\n");

	wrt(here.desc);

	var a = []
	for(var k in here.exits) {
		a.push(k);
	};
	if(a.length > 0) {
		wrt("\nYou can go "+a.join(", ")+".\n");
	}

	if(cb) {
		cb();
	}
}


go_place = function(place) {
	here = place;
	if(!game.has_visited[here.id]) {
		look([]);
		game.has_visited[here.id] = true;
	}
}


get_place = function(name) {
	var len = game.world.places.length;
	for(var i = 0; i < len; i++) {
		var place = game.world.places[i];
		if(place.name.ucase() == name.ucase()) {
			return place;
		}
	}
	return null;
}

go = function(args, cb) {
	var where = args[1] || "";
	if(where) {
		var name = here.exits[where];
		if(name) {
			var place = get_place(name);
			if(place) {
				go_place(place);
				cb();
				return;
			}
			else {
				wrt("broken link");
			}
		}
		else {
			wrt("Can't go \""+where+"\"\n");
		}
	}
	else {
		wrt("Usage: go EXIT\n");
	}
	cb();
}


make_place = function(args, cb) {
	get_line("Name: ", function(name) {
		get_line("Description: ", function(desc) {
			it = { id: name.toId(), name: name, desc: desc+"\n", exits: {} };
			game.world.places.push(it);
			log("Created place with id="+it.id);
			cb();
		});
	});
}

make_exit = function(args, cb) {
	var dir = args[2];
	if(dir) {
		if(it) {
			here.exits[dir] = it.name;
			log("I made an exit called \""+dir+"\" that leads to \""+it.name+"\"\n");
		}
		else {
			wrt("no it");
		}
	}
	else {
		wrt("Usage: make exit DIRECTION\n");
	}
	cb();
}


make = function(args, cb) {
	var what = args[1];
	var fun = global["make_"+what];
	if(what && typeof fun === "function") {
		fun(args, cb);
	}
	else {
		wrt("Usage: make place\n");
		cb();
	}
}



find = function(args, cb) {
	var what = args[1];

	var fun = global["find_"+what];
	if(what && typeof fun === "function") {
		fun(args, cb);
	}
	else {
		wrt("Usage: find WHAT\n");
		cb();
	}
}



normal_prompt = "\n> ";

main_parse = function(line) {
	var args = line.split(/\s/);
	//I("args="+o2j(args));
	var cmd = args[0];
	if(cmd) {
		var fun = global[cmd];
		if(typeof fun === "function") {
			fun(args, function() {
				get_line(normal_prompt, main_parse);
			});
			return;
		}
		else {
			wrt("What?\n");
		}
	}
	get_line(normal_prompt, main_parse);
}


//	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	

require("chopper");
var chopper = new StreamChopper(process.stdin, "\n", function(line) {
	line = line.trim();
	var p = current_parser;
	if(p) {
		current_parser = null;
		p(line);
	}
});


current_parser = null;

get_line = function(prompt, receiver) {
	if(prompt) {
		process.stdout.write(prompt);
	}
	current_parser = function(line) {
		// incoming line
		chopper.pause();	// stop input
		receiver(line);		// pass the line on
	}
	chopper.resume();		// allow  input
}


wrt("+-------------------------+\n");
wrt("|    Welcome to Swords    |\n");
wrt("+-------------------------+\n");
wrt("\n");
go_place(game.world.places[0]);

get_line(normal_prompt, main_parse);


