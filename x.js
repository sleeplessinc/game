
var log = console.log
var util = require("util")

log("-----------------");


function Bag() {
	this.put = function(o) {
		this.push(o)
		return this.length
	}
	this.get = function(o) {
		if(typeof o == "number") {
			return (o >= 0 && o < s.length) ? this[o] : null
		}
		var i = this.find(o)
		if(i >= 0) {
			this.splice(i,1)
			return o
		}
		return null
	}
	this.find = function(o) {
		for(var i = 0; i < this.length; i++) {
			if(this[i] === o)
				return i
		}
		return -1
	}
}
Bag.prototype = new Array()


function Thing(name) {
	this.name = name || "thing"

	this.react = function(action, actor) {
		var a = action[0].toUpperCase() + action.substr(1)
		var f = this["on"+a]
		if(f)
			return f.call(this, actor)
		return null
	}

	this.onStudy = function(it) {
		log(this.name+" appears to be an ordinary "+this.type)
	}

}

function init(a) {
	this.type = a.callee.name.toLowerCase()
	a = Array.prototype.slice.call(a)
	this.ctorArgs = a
	Thing.apply(this, a)
}


function Place(name, desc) {
	init.call(this, arguments)

	this.desc = desc
	this.things = new Bag()

	this.onStudy = function(it) {
		log("You are in a place called "+this.name)
		log(this.desc)
		log("You see "+this.things.length+" things:")
		this.things.forEach(function(t, i) {
			log("    "+(i+1)+": A "+t.type+" named "+t.name)
		})
	}

}


function Adventurer(name) {
	init.call(this, arguments)

	this.pack = new Bag()
	this.armor = null
	this.weapon = null

	this.study = function(it) {
		log("study("+it.type+")")
		it.react("study", this)
	}

	this.read = function(it) {
		log("read("+it.type+")")
		it.react("read", this)
	}

	this.attack = function(it) {
		log("attack("+it.type+")")
		it.react("attack", this)
	}

	this.wear = function(it) {
		log("wear("+it.type+")")
		it.react("wear", this)
	}

	this.wield = function(it) {
		log("wield("+it.type+")")
		it.react("wield", this)
	}

	this.take = function(it) {
		log("take("+it.type+")")
		it.react("take", this)
		this.showPack()
	}

	this.drop = function(it) {
		log("drop("+it.type+")")
		it.react("drop", this)
		this.showPack()
	}

	this.showPack = function() {
		log("Your pack contains "+this.pack.length+" thing(s):")
		this.pack.forEach(function(o, i) {
			log("    "+(i+1)+": A "+o.type+" named "+o.name)
		})
	}

}


function Treasure(name) {
	init.call(this, arguments)

	this.onTake = function(actor) {
		actor.pack.put(this)
		log(this.type+" taken")
	}

	this.onDrop = function(actor) {
		actor.pack.get(this)
		log(this.type+" dropped")
	}

}


function Scroll(name) {
	init.call(this, arguments)

	this.onRead = function(it) {
		log("Nothing happens")
	}

}


function Armor(name) {
	init.call(this, arguments)

	this.onWear = function(actor) {
		actor.armor = this
		log("Wearing "+this.type)
	}

}


function Weapon(name) {
	init.call(this, arguments)

	this.onWield = function(actor) {
		actor.weapon = this
		log("Wielding "+this.type)
	}

}
Weapon.prototype = new Treasure()


function Monster(name) {
	init.call(this, arguments)

	this.onAttack = function(it) {
		log(this.name+" laughs at your feeble aggression")
	}

}
Monster.prototype = new Thing()



adventurer = new Adventurer("Joe")
place = new Place("Home", "A cabin in a meadow")
monster = new Monster("Glarnmaggle")
scroll = new Scroll("Aclirew")
treasure = new Treasure("Gem")
armor = new Armor("Leather armor")
weapon = new Weapon("Rusty sword")

place.things.put(monster)
place.things.put(treasure)
place.things.put(scroll)
place.things.put(armor)
place.things.put(weapon)

adventurer.study(adventurer)
adventurer.study(place)
adventurer.study(monster)
adventurer.read(scroll)
adventurer.attack(monster)
adventurer.take(treasure)
adventurer.study(treasure)
adventurer.drop(treasure)


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

