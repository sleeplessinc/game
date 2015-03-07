
var log = console.log
var util = require("util")


// a thing for holding stuff
function Bag() {
	this.put = function(o) {
		var i = this.find(o)
		if(i != -1) 
			return false		// already present 
		this.push(o)
		return true
	}
	this.get = function(o) {
		var i = this.find(o)
		if(i < 0)
			return null			// not present
		this.splice(i,1)
		return o
	}
	this.find = function(o) {
		for(var i = 0; i < this.length; i++) {
			if(this[i] === o)
				return i		// found
		}
		return -1				// not found
	}
}
Bag.prototype = new Array()



var places = {}


function Thing(name) {
	var t = new Object()

	// set type by walking up the caller chain
	// the function that creates things must be an unnamed function for this to work
	var c = arguments.callee.caller
	while(c.name) {
		t.type = c.name
		c = c.caller
	}
	t.type = (t.type || "thing").toLowerCase()

	t.name = name || "thing"

	t.react = function(action, args) {
		var a = action[0].toUpperCase() + action.substr(1)
		var f = this["on"+a]
		return f.apply(this, args)
	}

	t.onStudy = function(actor) {
		log(t.name+" appears to be an ordinary "+t.type)
	}

	return t
}


function Place(name, desc) {
	var t = new Thing(name)

	t.desc = desc
	t.things = new Bag()
	t.exits = {}

	t.onStudy = function(actor) {
		//log("You are in a place called "+t.name)
		log(t.desc)
		log("You see "+t.things.length+" things:")
		t.things.forEach(function(t, i) {
			log("    "+(i+1)+": A "+t.type+" named "+t.name)
		})
		log("You see these exits:")
		for(k in t.exits) {
			var e = t.exits[k]
			log("    "+e.name)
		}
	}

	places[name] = t

	return t
}

function Exit(name, dest) {
	var t = new Thing(name)

	t.dir = name.toLowerCase()
	t.dest = dest

	t.onGo = function(traveler) {
		var newPlace = places[t.dest]
		newPlace.traveler = traveler
		traveler.place = newPlace
		log("Location: "+newPlace.name)
	}

	return t
}


function Adventurer(name) {
	var t = new Thing(name)

	t.hp = 100	

	t.place = null
	t.pack = new Bag()
	t.armor = null
	t.weapon = null

	t.look = function() {
		t.study(t.place)
	}

	t.study = function(it) {
		//log("study("+it.type+")")
		it.react("study", [t])
	}

	t.go = function(dir) {
		dir = dir.trim().toLowerCase()
		var it = t.place.exits[dir]
		if(!it) {
			log("No exit "+dir)
			return
		}
		//log("go("+it.type+")")
		it.react("go", [t])
	}

	t.read = function(it) {
		//log("read("+it.type+")")
		it.react("read", [t])
	}

	t.quaff = function(it) {
		//log("quaff("+it.type+")")
		it.react("quaff", [t])
	}

	t.attack = function(it) {
		//log("attack("+it.type+")")
		it.react("attack", [t])
	}

	t.wear = function(it) {
		//log("wear("+it.type+")")
		it.react("wear", [t])
	}

	t.wield = function(it) {
		//log("wield("+it.type+")")
		it.react("wield", [t])
	}

	t.take = function(it) {
		//log("take("+it.type+")")
		it.react("take", [t])
		t.showPack()
	}

	t.drop = function(it) {
		//log("drop("+it.type+")")
		it.react("drop", [t])
		t.showPack()
	}

	t.showPack = function() {
		log("Your pack contains "+t.pack.length+" thing(s):")
		t.pack.forEach(function(o, i) {
			log("    "+(i+1)+": A "+o.type+" named "+o.name)
		})
	}

	return t
}


function Treasure(name) {
	var t = new Thing(name)

	t.onTake = function(actor) {
		if(actor.place.things.get(t)) {
			if(actor.pack.put(t))
				log(t.type+" taken")
		}
	}

	t.onDrop = function(actor) {
		if(actor.pack.get(t)) {
			if(actor.place.things.put(t))
				log(t.type+" dropped")
		}
	}

	return t
}


function Scroll(name) {
	var t = new Treasure(name)

	t.onRead = function(actor) {
		log("Nothing happens")
	}

	return t
}


function Potion(name) {
	var t = new Treasure(name)

	t.onQuaff = function(actor) {
		log("You get the hiccups")
	}

	return t
}


function Armor(name) {
	var t = new Treasure(name)

	t.onWear = function(actor) {
		actor.armor = t
		log("Wearing "+t.type)
	}

	return t
}


function Weapon(name) {
	var t = new Treasure(name)

	t.onWield = function(actor) {
		actor.weapon = t
		log("Wielding "+t.type)
	}

	return t
}


function Monster(name) {
	var t = new Thing(name)

	t.onAttack = function(attacker) {
		log("The "+t.name+" runs off, unharmed ")
	}

	return t
}


log("\n\n");

init = function() {

	log("---- creating stuff ---")

	place = new Place("The stream", "A clear, cold, mountain stream")
	north = new Exit("North", "Home")
	place.exits[north.dir] = north

	place = new Place("Home", "A cabin in a meadow")
	south = new Exit("south", "The stream")
	place.exits[south.dir] = south

	you = new Adventurer("Joe")
	you.place = place
	place.traveler = you

	monster = new Monster("Glarnmaggle")
	place.things.put(monster)

	scroll = new Scroll("Aclirew")
	place.things.put(scroll)

	potion = new Potion("Blue potion")
	place.things.put(potion)

	treasure = new Treasure("Gem")
	place.things.put(treasure)

	armor = new Armor("Leather armor")
	place.things.put(armor)

	weapon = new Weapon("Rusty sword")
	place.things.put(weapon)

} ; init()


/*
log("---- doing stuff ---")
you.study(you)
you.study(place)
you.study(monster)

you.attack(monster)

you.take(scroll)
you.read(scroll)

you.take(potion)
you.quaff(potion)

you.take(treasure)
you.study(treasure)

you.drop(treasure)

you.take(armor)
you.take(weapon)
you.take(weapon)
you.wield(weapon)
you.wear(armor)


you.go("south")
you.go("north")
*/


var readline = require('readline')
var rl = readline.createInterface(process.stdin, process.stdout)
var prefix = '\nSwords > '
rl.setPrompt(prefix, prefix.length);

function input(line) {
	line = line.trim()
	if(!line)
		return

	var m = line.match(/^([^\s]+)(\s([^\s]+))?/)

	if(m) {
		var verb = m[1]
		var obj = m[2]

		var f = you[verb]
		if(f) {
			f.call(you, obj)
			return
		}
	}

	log("What?")
}

function loop(line) {
	input(line)
	rl.prompt();
}

rl.on('line', function(line) {
	loop(line)
}).on('close', function() {
	process.exit(0);
});


log("Swords - Copyright 2011 Sleepless Inc. - All Rights Reserved")
loop("look")



