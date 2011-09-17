// Swords 
// Copyright 2003
// Sleepless Software Inc.
// All Rights Reserved



// Support code ===========================================================

var trace = true;


var isadmin = false;
function admin()
{
	isadmin = true;
}


function w(s)
{
	e_output(s);
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


///////////////////////// /////////////////////////


w("<html><head>");
//w("<meta http-equiv='refresh' content='0;URL=/index.html'></meta>");
w("</head><body bgcolor=#ff6655>");
green(centered('SYSTEM RESET<br><br>'));
green("<a href=index.html> Home </a>");
w("<br><br>");



///////////////////////// /////////////////////////


function Bag()
{
	// Contained sub-objects
	this.items = []; //new Array();


//	this.length = function() { return this.items.length; }


	this.toString = function()
	{ 
		return this.items.toString();
	}


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


function Thing(n, d)
{
	this.name = n;
	this.desc = d;

	this.toString = function() { return "A Thing called "+this.name+", "+this.desc; };
}

function Exit(n, d)
{
	this.name = n;
	this.dest = d;

	this.toString = function() { return "An Exit "+this.name+" that leads to "+this.dest; };
}

function Place(n, d)
{
	this.name = n;
	this.desc = d;
	this.exits = new Bag();
	this.things = new Bag();

	this.toString = function() { return "A Place called "+this.name+", "+this.desc; };
}

function World(n)
{
	this.name = n;
	this.places = new Bag();
	this.add = function(p) { places.insert(p); }

	this.toString = function() { return "The World known as "+this.name; };
}


// things
sword = new Thing("Sword", "Your old and rusty, yet still sharp sword");
//sword.acts = ["take", "examine",];
sword.onTake = function(who)
{
	//who.pack.insert(this);
	w("You take the sword!<br>\n");
}
sword.onExamine = function(who)
{
		w("A close examination of the sword reveals a sturdy, though not particularly graceful weapon.  The blade is worn, and rusty with many chips along the edge.  The hilt is tightly wrapped in old, worn leather.  A small, crude rendering of your family crest is stamped into the guard.<br>\n");
}

// places
death = new Place("Death", "The aferlife");
home = new Place("Home", "Your mountain cabin");
home.things.insert(sword);
home.exits.insert(new Exit("Over cliff", "Death"));

// the world
earth = new World("Earth");
earth.places.insert(death);
earth.places.insert(home);




function classof(o)
{
	return (""+( (""+o.constructor).match(/function [^\(]*/i))).replace(/function /, "");
}


w("<pre>\n");
w(""+earth+"\n");
for(var i = 0; i < earth.places.items.length; i++)
{
	var p = earth.places.items[i];
	w("  "+p+"\n");
	for(var j = 0; j < p.things.items.length; j++)
	{
		var t = p.things.items[j];
		w("    "+t+"\n");
		for(var f in t) //a = 0; a < t.acts.length; a++)
		{
			if((typeof t[f] == "function") && (f.substring(0,2) == "on"))
			{
				//w("Found an action handler called "+f+"\n");
				t[f]();
			}
		}
	}
	for(var j = 0; j < p.exits.items.length; j++)
	{
		var e = p.exits.items[j];
		w("    "+e+"\n");
	}
}
w("</pre>\n");

/*
eval("venus = "+e_file_contents("foo.js"));
w("<pre>\n");
w(""+classof(venus)+" "+venus.name+"\n");
for(var i = 0; i < venus.places.items.length; i++)
{
	var p = venus.places.items[i];
	w("  "+classof(p)+" "+p.name+" ("+p.desc+")\n");
	for(var j = 0; j < p.things.items.length; j++)
	{
		t = p.things.items[j];
		w("    "+classof(t)+" "+t.name+" ("+t.desc+")\n");
	}
}
w("</pre>\n");
*/

//w("<br>");
//w(earth.toSource());
//w("<br>");


// ====================================================================



//////////////////////////////////////////////



/*
function Bag()
{
	this.contents = [];

	this.len = function() { return this.contents.length; }

	this.insert = function(item) { return this.contents.push(item); }
	this.remove = function(item) { this.contents.pop(item); }

}


stuff = new Bag;

w("stuff.length = "+stuff.len()+"<br>");
stuff.insert("one");
w("stuff.length = "+stuff.len()+"<br>");
stuff.insert("two");
w("stuff.length = "+stuff.len()+"<br>");
stuff.insert("three");
w("stuff.length = "+stuff.len()+"<br>");
stuff.remove("two");
w("stuff.length = "+stuff.len()+"<br>");
w("stuff = "+stuff.contents+"<br>");

w("two in stuff: "+("two" in stuff.contents)+"<br>");
*/

w("----------------<br>");

things = [];
w("things.length = "+things.length+"<br>");



w("----------------<br>");

function ww(s)
{
	w(s+"<br>");
}



function Employee()
{
	this.dept = "general";
	this.name = "";
}

function Manager()
{
	this.underlings = [];
}
Manager.prototype = new Employee;


function Bee()
{
	this.projects = [];
}
Bee.prototype = new Employee;

function Sales()
{
	this.dept = "sales";
	this.quota = 100;
}
Sales.prototype = new Bee;

function Engineer()
{
	this.dept = "engineering";
	this.machine = "";
}
Engineer.prototype = new Bee;

jim = new Employee;
sally = new Manager;
mark = new Bee;
fred = new Sales;
jane = new Engineer;

function describe(who, o)
{
	w(""+who+"<br>");
	for (var i in o)
	{
		var s = typeof o[i];
		w("o."+i+" is a "+s+" whose value is "+o[i]+"<br>");
	}
	w("<br>");
}


function dump(p)
{
	if(p.__proto__ != null)
		dump(p.__proto__);
	w(""+p.constructor+" - "+p.toSource()+"<br>");
}

dump(sally);

w("----------------<br>");


describe("jim", jim);
describe("sally", sally);
describe("mark", mark);
describe("fred", fred);
describe("jane", jane);

function isa(who, what)
{
	while (who != null)
	{
		if(who == what.prototype)
			return true;
		who = who.__proto__;
	}
	return false;
}

w("jane is an Employee? "+isa(jane, Employee)+"<br>");
w("jane is an Bee? "+isa(jane, Bee)+"<br>");
w("jane is a Salesperson? "+isa(jane, Sales)+"<br>");
w("jane is a Manager? "+isa(jane, Manager)+"<br>");
w("sally is an Employee? "+isa(sally, Employee)+"<br>");
w("sally is an Bee? "+isa(sally, Bee)+"<br>");
w("sally is a Salesperson? "+isa(sally, Sales)+"<br>");
w("sally is a Manager? "+isa(sally, Manager)+"<br>");



function foo()
{
	this.name = function() { return "Mr. Foo"; }
	this.desc = "a guy";
	this.age = 10;
	//this.enter = function() { return true; }
}

w("<br><br>----------------<br>");


var mr = new foo();

foo.prototype.blab = "blark";

w("toSource = "+(mr.toSource())+"<br>");
w("valueOf mr = "+(mr.valueOf)+"<br>");

w(" mr is a "+(typeof mr)+"<br>");
var st1 = (mr = new foo());
w("st1 = '"+st1+"'<br>");

w("----------------<br>");


w("typeof foo.prototype is "+(typeof foo.prototype)+"<br>");
for (var i in foo.prototype)
{
	var s = typeof foo.prototype[i];
	w("foo.prototype."+i+" is a "+s+" whose value is '"+foo.prototype[i]+"'<br>");
}

var mrs = new foo();
w("mrs.blab = "+mrs.blab+"<br>");
w("mrs.desc = "+mrs.desc+"<br>");

w("----------------<br>");

if(typeof mr["enter"] == "function")
	w("I can enter mr!<br>");
else
	w("I can NOT enter mr.<br>");

w("----------------<br>");

w("mr is a "+(typeof mr)+"<br>");
w("mr.prototype is a "+(typeof mr.prototype)+"<br>");
for (var i in mr)
{
	var s = typeof mr[i];
	w("mr."+i+" is a "+s+" whose value is '"+mr[i]+"'<br>");
}
w("----------------<br>");

w("typeof mr = "+(typeof mr)+"<br>\n");
w("typeof foo = "+(typeof foo)+"<br>\n");
w("typeof mr.name = "+(typeof mr.name)+"<br>\n");
w("typeof mr.desc = "+(typeof mr.desc)+"<br>\n");
w("typeof mr.smeg = "+(typeof mr.smeg)+"<br>\n");

w("foo.bar = "+mr.name()+"<br>\n");
w("name in mr = "+("name" in mr)+"<br>\n");
w("age in mr = "+("age" in mr)+"<br>\n");

w("mr instanceof foo = "+(mr instanceof foo)+"<br>\n");
w("mr instanceof Place = "+(mr instanceof Place)+"<br>\n");


w("----------------<br>");

var bar = 10;
var o = { a: "foo", b: face(), c: bar, d: "return 'ark'" };

w("<br>");
w("o.a = "+o.a+"<br>");
w("o.b = "+o.b+"<br>");
w("o.c = "+o.c+"<br>");
w("o.d = "+o.d+"<br>");


