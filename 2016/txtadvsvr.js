

fs = require("fs");

maws = require("maws");
require("sleepless");
require("g")("log5");


require("g")(require("./common.js"));


seq = 0;

DS = require("ds").DS;
ds = new DS();
ds.load("world.json");
if(!ds.game) {
	ds.game = {
		title: "Untitled Game",
		last_saved: 0,
		pack: [],
		has_visited: {},
		world: {
			seq: 1,
			title: "A World",
			places: [ {
				id: 1,
				name: "Nowhere",
				desc: "You see nothing.",
				exits: [],
			} ],
		},
	};
	ds.save();
}

game = ds.game;


msg_delete_place = function(m, name) {
	var id = m.id;
	var i = index_of_place_with_id(id);
	if(i != -1) {
		ds.game.world.places.splice(i, 1);
		ds.save();
		m.reply({game:ds.game});
	}
	else {
		m.error(o2j(m));
	}
}

msg_change_place_details = function(m, name) {
	var id = m.id;
	var name = m.name;
	var desc = m.desc;
	var place = place_with_id(id);
	if(place) {
		place.name = name;
		place.desc = desc;
		ds.save();
		m.reply({game:ds.game});
	}
	else {
		m.error(o2j(m));
	}
}

msg_new_place = function(m, name) {
	var id = (ds.game.world.seq += 1);
	var name = "New place #"+id;
	var place = {
		id: id,
		name: name,
		desc: "You see nothing.",
		exits: [],
	};
	ds.game.world.places.push(place);
	ds.save();
	m.reply({game:ds.game, id:id});
}

msg_load = function(m, name) {
	m.reply( {game:ds.game} );
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





