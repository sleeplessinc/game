

game = {
	title: "Untitled Game",
	last_saved: 0,
	pack: {},
	has_visited: {},
	world: {
		places: [{
			name: "Nowhere",
			desc: "You see nothing.",
			exits: {},
		}],
	},
};


here = game.world.places[0];

e_loc = I("location");
e_desc = I("description");

e_edit_place = I("edit_place");


show_elem = function(elem) { elem.style.display = "block"; }
hide_elem = function(elem) { elem.style.display = "none"; }


hide_pages = function() {
	hide_elem(edit_place);
}


redraw = function() {

	title.innerHTML = game.title;

	var s = "(Unsaved)";
	var ts = game.last_saved;
	if(ts != 0) {
		s = agoStr(ts) + " ("+ts2us_mdyhm(game.last_saved)+")";
	}
	last_saved.innerHTML = s;

	var a = [];
	for(var k in game.world.places) {
		a.push(game.world.places[k]);
	}
	replicate("tpl_place", a, function(e, d, i) {
		e.onclick = function() {
			I("place_name").value = d.name;
			I("place_desc").value = d.desc;
			hide_pages();
			show_elem(edit_place);
		}
	});

}

save = function() {
	conn.send({msg:"save", game:game, name:"game"}, function(r) {
		if(r.error) {
			alert(o2j(r.error));
		}
		else {
			game = r.game;
			here = game.world.places[0];
		}
		redraw();
	});
}


redraw();


//	-	-	-	-	-	-	-	-

cb_msg = function(m) {
	if(m.msg == "ping") {
		m.reply({msg:"pong"});
		return
	}
}

cb_ctrl = function(m, x) {
	log("CTRL: "+m+", ["+o2j(x)+"]")

	if(m === "disconnected") {
		log("reconnecting ...");
		setTimeout(function() {
			conn = MAWS.connect(cb_msg, cb_ctrl)
		}, 5000);
		return
	}

	if(m === "connected") {
		conn.send({msg:"hello"}, function(r) {
			log("I've been welcomed as "+r.name)
		});
		return
	}
}

conn = MAWS.connect(cb_msg, cb_ctrl)


