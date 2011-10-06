// HAGS js lib code 
// Copyright 2004
// Sleepless Software Inc.
// All Rights Reserved


///////////////////////////

function crush(s) {
	s = s.replace(/\s+/g, " ");		// crush out excessive spaces
	return s;
}

function trim(s) {
	s = s.replace(/^\s+/g, "");		// remove leading whitespac3
	s = s.replace(/\s+$/g, "");		// remove trailing whitespac3
	return s;
}

function startsWith(s1, s2) {
	if(s1.substr(0, s2.length) == s2)
		return true;
	return false;
}

///////////////////////////

function w(s)
{
	e_output(s);
}

function wbr(s)
{
	w(s);
	w("<br>\n");
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
function clr(c, s) { return "<font color="+c+">"+s+"</font>"; }
function red(s) { return clr("#ff0000", "", s); }
function green(s) { return clr("#00ff00", s); }


///////////////


var trace = true;
function T(s)
{
	if(trace)
		wbr(clr("#0088ff", s));
}

/////////////////////////

function beg_box(t)
{
	return "<div class=boxtop>"+t+"</div><div class=boxguts>\n";
	// return "<table bgcolor=#bbaa99 width=100% cellspacing=1 cellpadding=4>\n<tr>\n<td bgcolor=#665544>\n<font face="+face()+">\n"+t+"\n</td>\n</tr>\n<tr>\n<td bgcolor=#000000>\n<table border=0>\n<tr>\n<td valign=top>\n<font face="+face()+">\n";
}


/*
function col_box(t)
{
	return "</td>\n<td border=0 valign=top>\n<font face="+face()+">\n";
}
*/

function end_box(t)
{
	return "</div>\n";
	//return "</td>\n</tr>\n</table>\n</td>\n</tr>\n</table>\n";
}

function table() { w("<table>\n"); }
function _table() { w("</table>\n"); }
function tr() { w("<tr>\n"); }
function _tr() { w("</tr>\n"); }
function td() { w("<td>\n"); }
function _td() { w("</td>\n"); }

///////////////////////////////////////////////////

function Bag()
{
	this.items = [];

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

	// Returns the object with the given tag that is inside of this thing
	// or null of there is no such object inside.
	this.find = function(tag)
	{
		var c = this.items;
		for(var i = 0; i < c.length; i++)
		{
			var nn = ""+c[i];
			if(c[i].tag == tag)
			{
				return c[i];
			}
		}
		return null;
	}
}





// Game specific code
// Must define a "World" constructor with an "input" function
world = null;
eval(e_file_contents("swords.js"));



// Session handling
sessions = new Bag();
function Session(g)
{
	this.tag = new Date().getTime();		// a unique session id
}


// Main input function
function input(tags, vals)
{
	//T("input("+tags+","+vals+")");

	wfile("head.html");
	wfile("admin.html");


	var sid = "";
	var cmd = "";
	var obj = "";
	for(var i = 0; i < tags.length; i++)
	{
		if(tags[i] == "sid")
		{
			sid = vals[i];
			break;
		}
	}

	var session = sessions.find(sid);
	if((sid == "") || (session == null))
	{
		session = new Session();
		session.world = new World(session);
		sessions.insert(session);
		sid = session.tag;
		//T("new session: "+sid);
	}
	else
	{
		//T("found session: "+sid);
	}
	world = session.world;


	// pass input on to the game world
	session.world.input(tags, vals);


	wfile("tail.html");

}


// one-time init code
w("<html><head>");
w("</head><body bgcolor=#ffaaaa>");
wbr(centered('SYSTEM RESET'));
wbr("");
wbr(centered("<a href=index.html> Start </a>"));



