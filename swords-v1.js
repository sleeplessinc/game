// Swords 
// Copyright 2003
// Sleepless Software Inc.
// All Rights Reserved


eval(e_file_contents("lib.js"));


//////////////////////////////////////////////////////////

w("<html><head>");
//w("<meta http-equiv='refresh' content='15;URL=/index.html'></meta>");
w("</head><body bgcolor=#ffaaaa>");
w(centered('SYSTEM RESET<br><br>'));
w(centered("<a href=index.html> Start </a>"));
w("<br><br>");

//////////////////////////////////////////////////////////


var trace = true;

function w(s)
{
	e_output(s);
}

function wbr(s)
{
	w(s+"<br>");
}


function wfile(f)
{
	w(e_file_contents(f));
}


function face() { return "'helvetica'"; }
function centered(s) { return "<center>"+s+"</center>"; }
function bold(s) { return "<b>"+s+"</b>"; }
function italic(s) { return "<i>"+s+"</i>"; }
function huge(s) { return "<font face="+face()+" size=+2>"+s+"</font>"; }
function big(s) { return "<font face="+face()+" size=+1>"+s+"</font>"; }
function small(s) { return "<font face="+face()+" size=-1>"+s+"</font>"; }
function tiny(s) { return "<font size=-2>"+s+"</font>"; }

/////////////////////////

function beg_box(t)
{
	return "<table bgcolor=#bbaa99 width=100% cellspacing=1 cellpadding=4>\n<tr>\n<td bgcolor=#665544>\n<font face="+face()+">\n"+t+"\n</td>\n</tr>\n<tr>\n<td bgcolor=#000000>\n<table border=0>\n<tr>\n<td valign=top>\n<font face="+face()+">\n";
}

function col_box(t)
{
	return "</td>\n<td border=0 valign=top>\n<font face="+face()+">\n";
}

function end_box(t)
{
	return "</td>\n</tr>\n</table>\n</td>\n</tr>\n</table>\n";
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


/////////////////////////
/////////////////////////
/////////////////////////
/////////////////////////





// This is basically a general purpose container for tagged objects

function Thing(n)
{
	this.name = n;
	this.toString = function() { return this.name; }
}


function Exit(n, d)
{
	this.base = Thing;
	this.base(n);
	this.dest = d;
}


function Place(n)
{
	this.base = Thing;
	this.base(n);
	this.exits = new Bag();
	this.things = new Bag();
}


function World(n)
{
	this.base = Thing;
	this.base(n);
	this.places = new Bag();
}



function createWorld()
{

	// earth /////////////////////////////////////////////
	var earth = new World("Earth");



	// death ////////////////////////////////////////////
	death = new Place("Death");
	earth.places.insert(death);



	// home ////////////////////////////////////////////
	home = new Place("Home");
	home.onLook = function(who)
	{
		wbr("The cabin where you live is located high in the mountains nestled in an alpine canyon and surrounded by majestic trees.  A meadow stretches out in front of the cabin and down the canyon.  The cabin itself is a wooden structure, on a stone foundation.  Your father built it when you were a young lad.");
	}

	home.exits.insert(new Exit("Over cliff", "Death"));

	var t = new Thing("Sword");
	t.onTake = function(who)
	{
		who.place.things.remove(this);
		who.pack.insert(this);
		wbr("You take the sword!");
	}
	t.onExamine = function(who)
	{
		wbr("A close examination of the sword reveals a sturdy, though not particularly graceful weapon.  The blade is worn, and rusty with many chips along the edge.  The hilt is tightly wrapped in old, worn leather.  A small, crude rendering of your family crest is stamped into the guard.");
	}
	home.things.insert(t);

	earth.places.insert(home);


//wbr("home instanceof Place: "+(home instanceof Place));
//wbr("home instanceof Exit: "+(home instanceof Exit));
//wbr("home instanceof Thing: "+(home instanceof Thing));
//wbr("t instanceof Thing: "+(t instanceof Thing));

	return earth;
}


function Player()
{
	this.sid = new Date().getTime();
	this.base = Thing;
	this.base(this.sid);

	this.world = createWorld();
	this.place = this.world.places.find("Home");

	this.pack = new Bag();


/*
	this.onTake = function(name)
	{
	}

	this.onDrop = function(name)
	{
	}

	this.onExamine = function(name)
	{
	}
*/
	
	this.onLook = function()
	{
		this.place.onLook(this);
	}

/*
	this.onInventory = function()
	{
	}

	this.onMenu = function()
	{
	}

	this.onGo = function(dir)
	{
	}
*/

	this.menu = function()
	{

		w(beg_box(centered(huge(this.place.name))));


		var len;
		
		w(beg_box("Things You Can See"));
		len = this.place.things.items.length;
		var items = this.place.things.items;
		for(var i = 0; i < len; i++)
		{
			var t = items[i];
			w(small(t.name)+" - ");
			for(var f in t)
			{
				if((typeof t[f] == "function") && (f.substring(0,2) == "on"))
				{
					var h = f;
					var d = f.substring(2);
					var l = "<a href='javascript:send(\""+h+"\",\""+t+"\")'>"+d+"</a>";
					w(small("["+l+"] "));
				}
			}
			w("<br>\n");
		}
		w(end_box());


		w(col_box());


		w(beg_box("Where You Can Go"));
		len = this.place.exits.items.length;
		var items = this.place.exits.items;
		for(var i = 0; i < len; i++)
		{
			var dir = items[i].name;
			w(small("<a href='javascript:send(\"go\",\""+dir+"\")'>"+dir+"</a>\n"));
			w("<br>\n");
		}
		w(end_box());


		w(col_box());


		w(beg_box("Things in Your Pack"));
		var len = this.pack.items.length;
		for(var i = 0; i < len; i++)
		{
			var t = this.pack.items[i];
			w(small(t.name)+" - ");
			for(var f in t)
			{
				if((typeof t[f] == "function") && (f.substring(0,2) == "on"))
				{
					var h = f;
					var d = f.substring(2);
					var l = "<a href='javascript:send(\""+h+"\",\""+t+"\")'>"+d+"</a>";
					w(small("["+l+"] "));
				}
			}
			w("<br>\n");
		}
		w(end_box());


		w(col_box());


		w(beg_box("What You Can Do"));
		for(var f in this)
		{
			if((typeof this[f] == "function") && (f.substring(0,2) == "on"))
			{
				var h = f;
				var d = f.substring(2);
				var l = "<a href='javascript:send(\""+h+"\",\"\")'>"+d+"</a>";
				w(small(l));
				w("<br>");
				//this[f]();
			}
		}
		w(end_box());


		w(end_box());

	}
}






// ===========================================================

// global set of all players. 
players = new Bag();


function login()
{

//wbr("logging in ...");
	var player = new Player();
	players.insert(player);

	w("<center>");
	w("<br><br>Welcome brave adventurer.<br><br>");
	w("<br><br>");

	return player;
}



// ====================================================================


function input(tags, vals)
{
	wfile("head.html");

wfile("admin.html");
	//	wbr("input("+tags+","+vals+")");
	//	wbr("");

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
//wbr("player="+player);

	if((sid == "") || (player == null))
	{
		player = login();
	}


	if(cmd != "")
	{
		if(obj != "")
		{
			// We're operating on an object.
			// Look for an object with the given name and if found, 
			// call the action handler on that object.
			var t = player.pack.find(obj);
			if(t == null)
			{
				t = player.place.things.find(obj);
				if(t != null)
				{
//wbr("(found in place)");
				}
			}
			else
			{
//wbr("(found in pack)");
			}

			if(t != null)
			{
//wbr("(got obj to operate on: "+t+")");
				wbr("");
				t[cmd](player);
				wbr("");
			}

		}
		else
		{
			// No object to operate on.
			// Look for action handler in player object.
			wbr("");
			player[cmd]();
			wbr("");
		}
	}


/*

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
	*/


	player.menu();


	if((""+player.place) == "Death")
		players.remove(player);

	w("<script> sid='"+player.sid+"'; </script>\n");


	wfile("tail.html");

}



