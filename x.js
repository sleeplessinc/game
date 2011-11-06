
var log = console.log
var util = require("util")


function Thing() {
	var self = this
	self.type = arguments.callee.name.toLowerCase()

	self.name = "thing"

	self.react = function(action, actor) {
		var a = action[0].toUpperCase() + action.substr(1)
		var f = this["on"+a]
		if(f)
			return f.call(this, actor)
		return null
	}

	self.onStudy = function(it) {
		return this.name+" appears to be an ordinary "+this.type
	}

}


function Place(name, description) {
	var self = this
	self.type = arguments.callee.name.toLowerCase()
	
	self.name = name

	self.things = []

	self.insert = function(it) {
		self.things.push(it)
	}

	self.onList = function(it) {
		var t = self.things
		var l = t.length
		var s = ""
		for(var i = 0; i < l; i++) {
			s += t[i].name + "\n"
		}
		return s
	}

}
Place.prototype = new Thing()


function Player(name) {
	var self = this
	self.type = "adventurer"
	
	self.name = name

	self.study = function(it) {
		log("study("+it.type+"): "+it.react("study", self))
	}
	self.read = function(it) {
		log("read("+it.type+"): "+it.react("read", self))
	}

}
Player.prototype = new Thing()


function Scroll(name) {
	var self = this
	self.type = arguments.callee.name.toLowerCase()

	self.name = name

	self.onRead = function(it) {
		return "nothing happens"
	}

}
Scroll.prototype = new Thing()


function Monster(name) {
	var self = this
	self.type = arguments.callee.name.toLowerCase()

	self.name = name

	self.onRead = function(it) {
		return "nothing happens"
	}

}
Monster.prototype = new Thing()



player = new Player("Joe")
place = new Place("Home", "A cabin in a meadow")
scroll = new Scroll("Aclirew")
monster = new Monster("Glarnmaggle")

place.insert(scroll)

player.study(player)
player.study(place)
player.study(monster)
player.read(scroll)


/*
World
	A collection of Places.
	Worlds contain Places.

Place
	Represents a physical location in space where the player currently "is".
	Places contain Things.
	Exits are "associated" with Places.
	Example, a town, a road, a room, etc.

Exit
	Represents a link from one place to another.
	There may be many associated with a Place leading to other Places.
	The player uses Exits to move around the World
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

Player
	A Player is you.
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
	Quaffing a potion will cause some sort of magical thing to happen to the player.
	Example: A green potion, A stinky potion.

Scroll
	A Scroll is a Thing that can be read.
	Reading a scroll invokes a spell, which can have almost any affect on anything.
	Example: Scroll called "Xlivik", Tattered scroll.

Word
	Words are not Things because they can not be Taken or Dropped.
	They are simply text representing something that the player can choose to say to a Person.
	Words are associated with Persons.
	Example: "Do you know where I can find a cursed dagger?", "Hello."


*/

