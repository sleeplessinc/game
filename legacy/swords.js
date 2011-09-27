
//var http = require("http")


function jsend(a, o, l)
{
	return "<a href='javascript:send(\""+a+"\",\""+o+"\")'>"+l+"</a>\n";
}

function Thing(tag, desc)
{
	this.tag = tag;
	this.toString = function() { return this.tag; }
	this.name = function(who) { return this.tag; }
}

// An examinable thing
function ExThing(tag, desc) { this.base = Thing; this.base(tag);
	this.desc = "<p>The "+this+" appears unremarkable.";
	if(desc != undefined)
		this.desc = desc;
	this.onExamine = function(who) { wbr(desc); }
}

function Exit(tag, dest) { this.base = Thing; this.base(tag);
	this.dest = dest;
	this.traverse = function(who) {
		var nplace = world.places.find(dest);
		if(nplace == null) throw "No such place: "+dest;
		world.player.place = nplace;
		wbr("You go "+this.tag+" ...");
		wbr("");
		world.player.onLook(who);
		wbr("");
	}
}

function Place(tag, desc) { this.base = Thing; this.base(tag);

	this.onLook = function(who) { wbr(desc); }
	this.exits = new Bag();
	this.things = new Bag();
}

function Player(tag, world) { this.base = Thing; this.base(tag);

	this.world = world;

	this.place = this.world.places.find("Home");

	this.onLook = function(who) { this.place.onLook(this); }

	this.menu = function()
	{
		w("<div class=where>"+this.place.name()+"</div>");

		table(); tr();


		td();
			w(beg_box("You"));
			table();
				tr();
					td(); w("HP"); _td();
					td(); w("10/10"); _td();
				_tr();
				tr();
					td(); w("Exp"); _td();
					td(); w("1"); _td();
				_tr();
				tr();
					td(); w("Arm"); _td();
					td(); w("0"); _td();
				_tr();
			_table();
			w(end_box());
			w("<br>");
		_td();


		var len;
		
		td();
			w(beg_box("Things You Can See"));
			table();
			len = this.place.things.items.length;
			var items = this.place.things.items;
			for(var i = 0; i < len; i++)
			{
				var t = items[i];
				tr();
				td();
				w(""+t+" - ");
				for(var f in t)
				{
					if((typeof t[f] == "function") && (f.substring(0,2) == "on"))
					{
						var h = f;
						var d = f.substring(2);
						var l = "<a href='javascript:send(\""+h+"\",\""+t+"\")'>"+d+"</a>";
						w(jsend(h, t, d));
					}
				}
				_td();
				_tr();
			}
			_table();
			w(end_box());
		_td();


		/*
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
		*/


		td();
			w(beg_box("What You Can Do"));
			table();
			for(var f in this)
			{
				if((typeof this[f] == "function") && (f.substring(0,2) == "on"))
				{
					tr();
					td();

					//var h = f;
					//var d = f.substring(2);
					//var l = "<a href='javascript:send(\""+h+"\",\"\")'>"+d+"</a>";
					w(jsend(f, "", f.substring(2)));
					//w(l);

					_td();
					_tr();
				}
			}
			_table();
			w(end_box());
		_td();


		td();
			w(beg_box("Where You Can Go"));
			table();
			len = this.place.exits.items.length;
			var items = this.place.exits.items;
			for(var i = 0; i < len; i++)
			{
				tr();
				td();
				var dir = items[i].name();
				w(jsend("go", dir, dir));
				_td();
				_tr();
			}
			_table();
			w(end_box());
		_td();




		_tr(); _table();
	}

}

function uniLoad(file, places)
{
	var plc = null;
	var ext = null;
	var thg = null;

	var con = e_file_contents(file);
	var lines = con.split("\n");
	for(var i = 0; i < lines.length; i++)
	{
		var line = trim(lines[i]);	// remove leading and trailing whitespace
		line = crush(line);			// compress whitespace
		//w("line: '"+line+"'<br>\n");
		var words = line.split(" ");
		var cmd = words[0].toLowerCase();
		for(var j = 0; j < words.length; j++)
		{
			words[j] = trim(words[j]);
			words[j] = words[j].replace(/_/g, " ");
		}
		if(words[0] == "place")
		{
			var dsc = "";
			i++;
			while(i < lines.length)
			{
				var l2 = trim(lines[i]);
				//w("l2: '"+l2+"'<br>\n");
				if(l2 == "")
					break;
				dsc = dsc + " " + l2;
				i++;
			}
			plc = new Place(words[1], dsc);
			//w("-- created place: "+plc+"<br>\n"); 
			places.insert(plc);
		}
		else
		if(words[0] == "exthing")
		{
			if(plc == null) throw "No place to store new exthing!";
			var dsc = "";
			i++;
			while(i < lines.length)
			{
				var l2 = trim(lines[i]);
				//w("l2: '"+l2+"'<br>\n");
				if(l2 == "")
					break;
				dsc = dsc + " " + l2;
				i++;
			}
			thg = new ExThing(words[1], dsc);
			plc.things.insert(thg);
			//w("-- created exthing: "+thg+"<br>\n"); 
		}
		else
		if(words[0] == "exit")
		{
			if(plc == null) throw "No place to store new exthing!";
			ext = new Exit(words[1], words[2]);
			plc.exits.insert(ext);
			//w("-- created exit: "+ext+"<br>\n"); 
		}
	}
}

function createPlaces()
{
	var places = new Bag();
	uniLoad("swords.uni", places);
	return places;
}


function World(session)
{
	this.session = session;
	this.places = createPlaces(this);
	this.player = new Player("Player", this);

	this.input = function(tags, vals)
	{
		var plyr = this.player;

		var cmd = "";
		var obj = "";
		for(var i = 0; i < tags.length; i++)
		{
			if(tags[i] == "cmd")
				cmd = vals[i];
			else
			if(tags[i] == "obj")
				obj = vals[i];
		}

		//T("cmd="+cmd+" obj="+obj);

		if(cmd != "")
		{
			if(cmd == "go")
			{
				// Attempting to "go" somewhere.  Look for specified exit.
				var plc = plyr.place;
				var len = plc.exits.items.length;
				var items = plc.exits.items;
				for(var i = 0; i < len; i++)
				{
					if(obj == items[i].name())
						items[i].traverse(plyr);
				}
			}
			else
			if(obj != "")
			{
				// We're operating on an object.
				// Look for an object with the given name and if found, 
				// call the action handler on that object.
				var t = null; // XXX plyr.pack.find(obj);
				if(t == null)
				{
					t = plyr.place.things.find(obj);
					if(t != null)
					{
						//T("(found in place)");
					}
				}
				else
				{
					//T("(found in pack)");
				}

				if(t != null)
				{
					//T("(got obj to operate on: "+t+")");
					wbr("");
					t[cmd](plyr);
					wbr("");
				}

			}
			else
			{
				// No object to operate on.
				// Look for action handler in player object.
				wbr("");
				plyr[cmd]();
				wbr("");
			}
		}

		if(plyr.place.name() == "Death")
		{
			sessions.remove(session);
			wbr("");
			wbr(centered("<a href=\".\">Play Again</a>"));
			wbr("");
		}
		else
		{
			plyr.menu();
		}

		w("<script> sid='"+session.tag+"'; </script>\n");
	}

	wbr("");
	wbr(centered("Welcome brave adventurer."));
	wbr("");
}


