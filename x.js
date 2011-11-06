
var log = console.log
var util = require("util")

log("\n\n");

// a thing for holding stuff
function Bag() {
	this.put = function(o) {
		var i = this.find(o)
		if(i != -1) 
			return false		// already present 
		this.push(o)			// append to array
		return true
	}
	this.get = function(o) {
		var i = this.find(o)
		if(i < 0)
			return null			// not present
		this.splice(i,1)		// remove from array
		return o
	}
	this.find = function(o) {
		for(var i = 0; i < this.length; i++) {
			if(this[i] === o)
				return i		// found. return index
		}
		return -1				// not found
	}
}
Bag.prototype = new Array()


function Thing(name) {
	log("Thing("+name+")")

	var t = new Object()

	// set type by walking up the caller chain
	// the function that creates things must be an unnamed function for this to work
	var caller = arguments.callee.caller
	while(caller.name) {
		t.type = caller.name
		caller = caller.caller
	}

	t.name = name || "thing"

	t.react = function(action, actor) {
		var a = action[0].toUpperCase() + action.substr(1)
		var f = this["on"+a]
		return f.call(this, actor)
	}

	t.onStudy = function(it) {
		log(t.name+" appears to be an ordinary "+t.type)
	}

	return t
}


function Place(name, desc) {
	var t = new Thing(name)
	//Thing.apply(this, arguments)

	t.desc = desc
	t.things = new Bag()

	t.onStudy = function(it) {
		log("You are in a place called "+t.name)
		log(t.desc)
		log("You see "+t.things.length+" things:")
		t.things.forEach(function(t, i) {
			log("    "+(i+1)+": A "+t.type+" named "+t.name)
		})
	}

	return t
}


function Adventurer(name) {
	var t = new Thing(name)
	//Thing.apply(this, arguments)

	t.place = null
	t.pack = new Bag()
	t.armor = null
	t.weapon = null

	t.study = function(it) {
		log("study("+it.type+")")
		it.react("study", t)
	}

	t.read = function(it) {
		log("read("+it.type+")")
		it.react("read", t)
	}

	t.attack = function(it) {
		log("attack("+it.type+")")
		it.react("attack", t)
	}

	t.wear = function(it) {
		log("wear("+it.type+")")
		it.react("wear", t)
	}

	t.wield = function(it) {
		log("wield("+it.type+")")
		it.react("wield", t)
	}

	t.take = function(it) {
		log("take("+it.type+")")
		it.react("take", t)
		t.showPack()
	}

	t.drop = function(it) {
		log("drop("+it.type+")")
		it.react("drop", t)
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
	//Thing.apply(this, arguments)

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
	//Treasure.apply(this, arguments)

	t.onRead = function(actor) {
		log("Nothing happens")
	}

	return t
}


function Armor(name) {
	var t = new Treasure(name)
	//Treasure.apply(this, arguments)

	t.onWear = function(actor) {
		actor.armor = t
		log("Wearing "+t.type)
	}

	return t
}


function Weapon(name) {
	var t = new Treasure(name)
	//Treasure.apply(this, arguments)

	t.onWield = function(actor) {
		actor.weapon = t
		log("Wielding "+t.type)
	}

	return t
}


function Monster(name) {
	var t = new Thing(name)
	//Thing.apply(this, arguments)

	t.onAttack = function(it) {
		log(t.name+" laughs at your feeble aggression")
	}

	return t
}


log("---- creating stuff ---")
foo = function() {
	you = new Adventurer("Joe")
	place = new Place("Home", "A cabin in a meadow")
	you.place = place
	monster = new Monster("Glarnmaggle")
	scroll = new Scroll("Aclirew")
	treasure = new Treasure("Gem")
	armor = new Armor("Leather armor")
	weapon = new Weapon("Rusty sword")
} ; foo()

place.things.put(monster)
place.things.put(treasure)
place.things.put(scroll)
place.things.put(armor)
place.things.put(weapon)

log("---- doing stuff ---")
you.study(you)
you.study(place)
you.study(monster)

you.attack(monster)

you.take(scroll)
you.read(scroll)

you.take(treasure)
you.study(treasure)

you.drop(treasure)

you.take(armor)
you.take(weapon)
you.take(weapon)
you.wield(weapon)
you.wear(armor)



/*
World
	A collection of Places.
	Worlds contain Places.

Place
	Represents a physical location in space where the adventurer currently "is".
	Places contain Things.
	Exits are "associated" with Places.
	Example, a town, a road, a room, etc.

Exit
	Represents a link from one place to another.
	There may be many associated with a Place leading to other Places.
	The adventurer uses Exits to move around the World
	Example: Trapdoor, pathway, tunnel

Thing
	A Thing is something that can:
		* Be taken
		* Be dropped
	Example: Rock, sword, potion

Monster
	A Monster is something that can:
		* Move around the world using Exits
		* Attack 
		* Be attacked
		* Be killed
	Monsters have properties:
		* Strength ?
		* HP ... ?

Person
	A Person is something that can:
		* Move around the world using Exits
		* Respond to questions

Adventurer
	A Adventurer is you.
	You can:
		* Move around the world using Exits
		* Attack 
		* Be attacked
		* Be killed
		* Take Things
		* Drop Things
		* Wield Weapons
		* Wear Armor
		* Read Scrolls
		* Quaff Potions
		* Utter Words

Weapon
	A Weapon is a Thing that can be wielded.
	Wielding a weapon cause "attacking" to inflict greater damage on Monsters.
	Example: Sword, Rock, Wand

Armor
	An Armor is a Thing that can be worn.
	Wearing an Armor causes attack from Monsters to take less damage on you.
	Example: Steel armor, Leather armor, Chain mail

Potion
	A Potion is a Thing that can be Quaffed.
	Quaffing a potion will cause some sort of magical thing to happen to the adventurer.
	Example: A green potion, A stinky potion.

Scroll
	A Scroll is a Thing that can be read.
	Reading a scroll invokes a spell, which can have almost any affect on anything.
	Example: Scroll called "Xlivik", Tattered scroll.

Word
	Words are not Things because they can not be Taken or Dropped.
	They are simply text representing something that the adventurer can choose to say to a Person.
	Words are associated with Persons.
	Example: "Do you know where I can find a cursed dagger?", "Hello."


*/

