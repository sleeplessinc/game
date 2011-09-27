// Swords 
// Copyright 2002 
// Sleepless Software Inc.
// All Rights Reserved



// Support code ===========================================================

var trace = true;

function w(s)
{
	e_output(s);
}

/////////////////////////

function color(clr, s)
{
	w("<font color="+clr+">"+s+"</font>");
}

/////////////////////////

function red(s)
{
	color("#ff0000", "", s);
}

function green(s)
{
	color("#00ff00", s);
}

/////////////////////////

function err(s)
{
	red("## ERROR ## ", s);
}

function T(s)
{
	if(trace)
		color("#0088ff", s);
}



function List()
{
	// Contained sub-objects
	this.items = new Array();


	// Returns true if 'what' was placed inside of this thing
	this.insert = function(what)
	{
		var c = this.items;
		for(var i = 0; i < c.length; i++)
		{
			if(c[i] == what)
				return false;
		}
		c.push(what);
		return true;
	}

	// Returns true if 'what' was removed from inside of this thing
	this.remove = function(what)
	{
		var c = this.items;
		for(var i = 0; i < c.length; i++)
		{
			if(c[i] == what)
			{
				if(c.length > 1)
				{
					c[i] = c[c.length - 1];
				}
				c.pop();
				return true;
			}
		}
		return false;
	}

	// Returns the object with the given name that is inside of this thing
	// or null of there is no such object inside.
	this.find = function(name)
	{
		var c = this.items;
		for(var i = 0; i < c.length; i++)
		{
			if(c[i].name() == name)
			{
				return c[i];
			}
		}
		return null;
	}

}


//////////////////////////////////////////////////////////////////////////
// Things

function Thing()
{
	// Returns the name of the object
	this.name = function() { return "Thing"; }

	// Returns detailed description of object
	this.desc = function() { return "The "+this.name()+" seems unremarkable."; }

	// Return true allows object to be taken
	this.mayTake = function(who) { return true; }

	// Return true allows object to be dropped
	this.mayDrop = function(who) { return true; }

	// Called when this thing is taken by the player
	this.taken = function() { return; }

	// Called when this thing is dropped by the player
	this.dropped = function() { }

	// Called when this thing is examined by the player
	this.examined = function() { }

	// List of Things that are contained within this thing
	this.contents = new List();

	// List of alternate actions that this thing will react to
	this.actions = [];

	// General function that receives actions directed at this thing.
	// 'a' is the action that's being performed on the thing.
	this.act = function(w, a) { return; }
}


/////////////////////////////

function Weapon()
{
	this.name = function() { return "Weapon"; }

	this.insert = function() { return false; }	// Not a container

}
Weapon.prototype = new Thing();


function Sword()
{
	this.name = function() { return "Sword"; }
}
Sword.prototype = new Weapon();


//////////////////////////////////////////////////////////////////////////
// Places

function Exit()
{
	this.name = function() { return "Death"; }
	this.place = function() { return "Limbo"; }
}

function Place()
{
	// Returns the name of the object
	this.name = function() { return "Place"; }

	// Returns a detailed description of object
	this.desc = function() { return "The "+this.name()+" seems unremarkable."; }

	// Returns true if this place allows you to enter.
	this.mayEnter = function(who, fromdir) { return true; }

	// Returns true if this place allows you to leave.
	this.mayLeave = function(who, todir) { return true; }

	// Called when the player has entered this place.
	this.entered = function(who, fromdir) { this.visited += 1; };

	// Called when the player has left this place.
	this.left = function(who, todir) { };

	// A list of the ways out of this place.
	this.exits = new List();

	// A list of the Things that are present in this place.
	this.things = new List();

	// Will normally be set to true the first time the player enters this place
	this.visited = 0;
}



function Player(wrld)
{
	this.sid = new Date().getTime();
	this.isDead = false;
	this.world = wrld;
	this.place = this.world.find("Home");
	this.pack = new Thing();

	this.name = function()
	{
		return this.sid;
	}

	this.take = function(name)
	{
		var thing;
		
		thing = this.pack.contents.find(name);
		if(thing != null)
		{
			err(thing.name()+" already in pack\n\n");
			return;
		}

		thing = this.place.things.find(name);
		if(thing == null)
		{
			err(thing.name()+" not found in this place\n\n");
			return;
		}

		if(!thing.mayTake(this))
		{
			w("The "+thing.name()+" can't be taken!\n");
			return;
		}

		this.place.things.remove(thing);
		this.pack.contents.insert(thing);
		thing.taken();

		w(thing.name() + " taken.\n");
	}

	this.drop = function(name)
	{
		var thing;

		thing = this.pack.contents.find(name);
		if(thing == null)
		{
			err(name+" not in pack\n");
			return;
		}
		if(!thing.mayDrop(this))
		{
			w("The "+thing.name()+" can't be dropped!\n");
			return;
		}
		
		this.pack.contents.remove(thing);
		this.place.things.insert(thing);

		w(thing.name()+" dropped.\n");

		thing.dropped();
	}

	this.examine = function(name)
	{
		var thing;

		// First look in pack
		thing = this.pack.contents.find(name);
		if(thing != null)
		{
			w(thing.desc()+"\n");
			thing.examined();
			return;
		}

		thing = this.place.things.find(name);
		if(thing != null)
		{
			w(thing.desc()+"\n");
			thing.examined();
			return;
		}

		err("The "+name+" is nowhere to be found.\n");
	}

	
	// This generates the text describing where the player is and what
	// he/she sees.
	this.look = function()
	{
		w(this.place.desc() + "\n");
	}


	this.inventory = function()
	{
		var stuff = this.pack.contents;
		var len = stuff.items.length;
		if(len < 1)
		{
//			w("You aren't carrying anything.\n");
			return;
		}
		
		w("Your pack contains:\n");
		w("<blockquote>\n");
		var name;
		for(var i = 0; i < len; i++)
		{
			name = stuff.items[i].name();
			w("        "+name);
			w(" [ <a href='javascript:send(\"drop\",\""+name+"\")'>Drop</a> ]");
			w(" [ <a href='javascript:send(\"exam\",\""+name+"\")'>Examine</a> ]");

			var actions = stuff.items[i].actions;
			for(var j = 0; j < actions.length; j++)
			{
				w(" [ <a href='javascript:send(\""+actions[j]+"\",\""+name+"\")'>"+actions[j]+"</a> ]");
			}
			w("<br>\n");
		}
		w("</blockquote>\n");
	}


	this.menu = function()
	{
		var len;
		
		len = this.place.things.items.length;
		if(len > 0)
		{
			w("Objects you see:\n");
			w("<blockquote>");
			var items = this.place.things.items;
			for(var i = 0; i < len; i++)
			{
				var name = items[i].name();
				w("        "+name);
				if(items[i].mayTake(this))
					w(" [ <a href='javascript:send(\"take\",\""+name+"\")'>Take</a> ]");
				w(" [ <a href='javascript:send(\"exam\",\""+name+"\")'>Examine</a> ]");

				var actions = items[i].actions;
				for(var j = 0; j < actions.length; j++)
				{
					w(" [ <a href='javascript:send(\""+actions[j]+"\",\""+name+"\")'>"+actions[j]+"</a> ]");
				}

				w("<br>\n");
			}
			w("</blockquote>");
		}

		len = this.place.exits.items.length;
		if(len > 0)
		{
			w("Exits from here:\n");
			w("<blockquote>");
			var items = this.place.exits.items;
			for(var i = 0; i < len; i++)
			{
				var dir = items[i].name();
				w("        <a href='javascript:send(\"go\",\""+dir+"\")'>"+dir+"</a>\n");
				w("<br>\n");
			}
			w("</blockquote>");
		}

		this.inventory();

		dumpFile("menubar");

	}

	this.go = function(dir)
	{
		var exit = this.place.exits.find(dir);
		if(exit == null)
		{
			err(dir+" not a direction you can go.");
			return;
		}

		if(!this.place.mayLeave(this, dir))
		{
			w("You are unable to leave "+this.place.name()+".\n");
			return;
		}

		var nplace = this.world.find(exit.place());
		if(nplace == null)
		{
			err("no such place as "+exit.place());
			return;
		}

		if(!nplace.mayEnter(this))
		{
			w("You are unable to go "+dir+".\n");
			return;
		}

		this.place.left(this);
		this.place = nplace;
		w("You go "+dir+" ...<p>\n");

		nplace.entered(this);

	}

}



// The world ============================================================


function createPlace(n, d)
{
	var place = new Place();
	place.name = function() { return n; };
	place.desc = function() { return d; };
	return place;
}

function createExit(n, p)
{
	var exit = new Exit();
	exit.name = function() { return n; };
	exit.place = function() { return p; };
	return exit;
}

function createThing(n, d, tf)
{
	var thing = new Thing();
	thing.name = function() { return n; };
	thing.desc = function() { return d; };
	thing.mayTake = function(who) { return tf; };
	return thing;
}


function createWorld()
{
	var world;
	var place;
	var exit;
	var thing;

	world = new List(); //"Earth", "Always changing, always the same.");


	// Home ==========================

	place = createPlace(
		"Home",
		"This is your home.\nYou have always been at home in the woods.\nThe birds are always singing in this peaceful place."
		);

	place.exits.insert(createExit("North", "Lookout"));
	place.exits.insert(createExit("South", "River trail"));
	place.exits.insert(createExit("East", "Town road"));
	place.exits.insert(createExit("Into cabin", "Cabin"));

	place.things.insert(createThing(
		"cabin",
		"The cabin in which you live is small, but comfortable.\nIt is made of wood and has a thatched roof.\nYou built it yourself 5 years previously.",
		false
		));

	place.things.insert(createThing(
		"A carved stone",
		"It's a headstone.\nYour father is buried here.\nThe stone reads, \"Chadral Hendud.  Strong to the last.\"",
		false
		));


	world.insert(place);


	// cabin ==========================

	place = createPlace(
		"Cabin",
		"The inside of your cabin is dry and\ncomfortable, but somewhat spare."
		);

	place.exits.insert(createExit("Out", "Home"));

	thing = createThing(
		"A small cloth bag",
		"The cloth bag contains the few genlos you've managed to save up.",
		true
		);
	thing.value = 6;
	place.things.insert(thing);


	thing = new Weapon();
	thing.name = function() { return "Your old rusty sword"; };
	thing.desc = function() { return "The sword is rusty and pitted.\nThe construction is sturdy and servicable,\nbut it isn't much to look at.\nThe blade was given to you by your father long ago, before he died."; };
	place.things.insert(thing);

	world.insert(place);


	// River trail ==========================

	place = createPlace(
		"River trail",
		"You are on what you call the 'river trail'.\nIt runs along the north bank of the Hoopty river.\nThere is good fishing in some spots here."
	);

	place.exits.insert(createExit("North", "Home"));
	place.exits.insert(createExit("East", "Town road"));

	place.things.insert(createThing(
		"Tree stump",
		"The stump is old and mostly rotten away.\nYou used to play on and around it as a child.\nThose were happy times.",
		false
		));
	
	world.insert(place);


	// Town road ==========================

	place = createPlace(
		"Town road",
		"You're on Town Road.\nTo the East the road leads up to the nearby town of Uzeem.\nTo the West is your home."
		);
	place.exits.insert(createExit("South", "Stuggum bridge"));
	place.exits.insert(createExit("East", "Uzeem"));
	place.exits.insert(createExit("West", "Home"));

	world.insert(place);

	// Stuggum bridge ==========================

	place = createPlace(
		"Stuggum bridge",
		"You are on the Stuggum Bridge which crosses the Hoopty river.\nThe bridge is large enough to carry a horse and cart.\nThe water below is clear, clean and cold.\nThere is a refreshing breeze coming over the bridge."
		);

	place.exits.insert(createExit("North", "Town road"));
	place.exits.insert(createExit("South", "Rustwood entrance"));
	place.exits.insert(createExit("West", "River trail"));

	thing = createThing(
		"Tollman",
		"The tollman's name is Valdred and he is very old.\nHe's been working on this bridge for as long as you can remember.\nHe is wearing an orange coat and a moldy hat.\nThere is a sign above him that reads, \"5 G\".",
		false
		);
	thing.actions = [ "Pay" ];
	thing.paid = false;
	thing.warnedme = false;
	thing.act = function(who, action) {
		if(action == "Pay")
		{
			var bag = who.pack.contents.find("A small cloth bag");
			if(bag)
			{
				var genlos = bag.value;
				if(genlos >= 5)
				{
					w("Valdred takes the 5 Genlos you offer,\ntesting it first on his teeth,\nand waves you past.\n");
					this.paid = true;
					bag.value -= 5;
				}
				else
				{
					w("You don't have enough genlos to pay the toll.\n");
				}
			}
			else
			{
				w("You don't have any money.\n");
			}
		}
	}
	place.things.insert(thing);

	place.mayLeave = function(who, todir)
	{
		var tollman = this.things.find("Tollman");

		if(todir != "South")
			return true;

		if(!tollman.paid)
		{
			w("The Tollman raises his leathery hand to block your progress\n");
			w("and says, \"Five Genlos for passage friend.\"\n");
			w("<p>\n");
			return false;
		}

		if(tollman.warnedme)
			return true;
		  
		w("Valdred touches your arm and gives you a very odd look.\n");
		w("  \"Do not go far, friend.  You are marked.  There is\n");
		w("    naught but terror and death in the south for you.\"\n");
		w("Valdred watches with concern as you cross out of sight.\n");
		w("<p>\n");
		tollman.warnedme = true;
		 
		return true;
	}

	world.insert(place);


	// Rustwood entrance ==========================

	place = createPlace(
		"Rustwood entrance",
		"You are at the entrance to Rustwood.\nFew people venture into the wood and those who do tell\nmany stories of fantastic apparitions and monsters within.\nThe trees are dense and rise up to a great height.\nYou can not see very far into the trees because of the darkness within."
		);
	place.exits.insert(createExit("North", "Stuggum bridge"));
	place.exits.insert(createExit("South", "Rustwood"));

	world.insert(place);


	// rustwood ==========================

	place = createPlace(
		"Rustwood",
		"You are deep in the forest of Rustwood.\nThe light is dim and you hear all manner of curious\ncreatures scurrying about in the trees, out of sight.\nthe air is cool and wet."
		);

	place.exits.insert(createExit("North", "Rustwood entrance"));
	place.exits.insert(createExit("South", "Vonhorn keep"));
	place.exits.insert(createExit("West", "Faenglin"));

	place.things.insert(
		thing = createThing(
			"Goblin",
			"The goblin looks grumpy.",
			false
			)
		);

	world.insert(place);


	// lookout ==========================

	place = createPlace(
		"Lookout",
		"You are at a place you call the 'lookout'.\nIt's your favorite place to think.\nIt is high up on a ridge overlooking your house.\nYou can see for miles around from here."
		);

	place.exits.insert(createExit("South", "Home"));
	place.exits.insert(createExit("Over the edge of the cliff", "Death"));

	world.insert(place);

	// uzeem ==========================

	place = createPlace(
		"Uzeem",
		"You're in the central square of Uzeem.\nThere is a fountain in the center of the square and many of the town's people are here, going about their Uzeemian affairs."
		);

	place.exits.insert(createExit("West", "Town road"));

	world.insert(place);


	// faenglin ==========================

	place = createPlace(
		"Faenglin",
		"This place is known as Faenglin.\nYou recognize it from stories you've heard told in Uzeem.\nThe trees are thinner and lighter.\nThe air less oppressive and warmer.\nThe stones and vegetation have a yellowish tint to them.\nThere are small insects fluttering lazily in the\nshafts of light filtering through the tree branches."
		);

	place.exits.insert(createExit("East", "Rustwood"));

	thing = createThing(
		"A shiny silver sword",
		"The sword is long and slender with tiny green jewels running up in a scattered\npattern up the blade.\nIt looks like it has magical properties.",
		true);
	place.things.insert(thing);

	world.insert(place);


	// vonhornkeep ==========================

	place = createPlace(
		"Vonhorn keep",
		"You are standing at the base of a steep incline.\nThe hillside is heavily overgrown with thorny vines and short\nragged trees.\nLooking up, you see a structure of some kind.\nClearly abandoned, but not entirely in ruins.\nThere is a rough trail leading upward toward the structure."
		);

	place.exits.insert(createExit("North", "Rustwood"));
	place.exits.insert(createExit("Up", "Death"));

	world.insert(place);


	// Death ==========================

	place = createPlace(
		"Death",
		"You are lost to the world.");
	place.entered = function(who)
	{
		w("You fall and your head hits a rock. You're dead.\n");
		who.isDead = true;
	}

	world.insert(place);

	// =======================================

	return world;
}




// The code ===========================================================

// List of all players. 
players = new List();

// Current player
// player = null;


function dumpFile(file)
{
	w(e_file_contents(file));
}



function login()
{

	var player = new Player(createWorld());
	players.insert(player);

	dumpFile("head.html");

	w("<center>");
	w("<br><br>Welcome brave adventurer.<br><br>");
	w("<br><br>");
	w("<a href='/hags?sid="+player.sid+"&func=input&cmd=look'>Play</a>");
	w("<br><br>");

	dumpFile("tail.html");
}



// ====================================================================


function input(tags, vals)
{
	var sid = "";
	var cmd = "";
	var obj = "";
	for(var i = 0; i < tags.length; i++)
	{
		if(tags[i] == "sid")
			sid = vals[i];
		else
		if(tags[i] == "cmd")
			cmd = vals[i];
		else
		if(tags[i] == "obj")
			obj = vals[i];
	}

	var player = players.find(sid);

	if((sid == "") || (player == null))
	{
		login();
		return;
	}

	//////////////////////////////////////////
	
	dumpFile("head.html");

	if(cmd == "look")
	{
		player.look();
	}
	else
	if(cmd == "drop")
	{
		player.drop(obj);
	}
	else
	if(cmd == "exam")
	{
		player.examine(obj);
	}
	else
	if(cmd == "take")
	{
		player.take(obj);
	}
	else
	if(cmd == "go")
	{
		player.go(obj);
		if(player.place.visited < 2)
			player.look();
	}
	else
	{
		var thing = player.pack.contents.find(obj);
		if(thing != null)
		{
			thing.act(player, cmd);
		}
		else
		{
			thing = player.place.things.find(obj);
			if(thing != null)
			{
				thing.act(player, cmd);
			}
		}
	}
	w("<p>");

	w("<center><font size=+1><u>"+player.place.name()+"</font></u></center><p>");

	player.menu();

	if(player.isDead)
		players.remove(player);

	w("<script> sid='"+player.sid+"'; </script>\n");

	dumpFile("tail.html");
}


w("<html><head>");
w("<meta http-equiv='refresh' content='0;URL=/index.html'></meta>");
w("</head><body bgcolor=#880000>");
green('<center>SYSTEM RESET<br><br>');
green("<a href=index.html> Home </a>");




