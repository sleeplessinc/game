

fs = require("fs");

maws = require("maws");
require("sleepless");
require("g")("log5");


seq = 0;

DS = require("ds").DS;
ds = new DS();
ds.load("world.json");
if(true) { //!ds.game) {
	ds.game = {
		title: "Untitled Game",
		last_saved: 0,
		pack: [],
		has_visited: {},
		world: {
			seq: 0,
			title: "A World",
			places: [ {
				id: "nowhere",
				name: "Nowhere",
				desc: "You see nothing.",
				exits: [],
			} ],
		},
	};
	ds.save();
}


msg_new_place = function(m, name) {
	var name = "New place #"+(ds.game.world.seq += 1);
	var place = {
		id: name.toId(),
		name: name,
		desc: "You see nothing.",
		exits: [],
	};
	ds.game.world.places.push(place);
	ds.save();
	m.reply(ds.game);
}

msg_load = function(m, name) {
	m.reply( ds.game );
}

msg_hello = function(m, name) {
	m.reply({msg:"welcome", name:name})
	conn.send({msg:"ping"}, function(r) {
		log(o2j(r));
	})
}

connect = function(req, cb_accept) {

	var name = "client-"+(seq += 1);
	log("connect: "+name);

	var cb_msg = function(m) {
		log(name+": "+o2j(m));

		var fun = global["msg_"+m.msg];
		if(typeof fun === "function") {
			fun(m, name);
		}
		else {
			W("bad msg");
		}
	}

	var cb_ctrl = function(s, xtra) {
		log("[CTRL] "+name+": "+s+", ["+o2j(xtra)+"]")
	}

	conn = cb_accept(cb_msg, cb_ctrl)

}

maws.listen( 12345, connect, "docroot")
maws.dbg = true;





