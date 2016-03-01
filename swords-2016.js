

require("sleepless");
require("g")("log5");


wrt = function(s) {
	process.stdout.write(s);
}

game = {};
game.inventory = [];
game.world = {};
game.world.places = [];
game.world.places.push({
	name: "Home",
	desc: "Your home",
	look: function(){
		wrt("You see your home.\n")
	}
});


here = game.world.places[0];


look = function(args) {
	here.look();
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
