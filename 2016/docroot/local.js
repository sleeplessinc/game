
show_elem = function(elem) { elem.style.display = "block"; }
hide_elem = function(elem) { elem.style.display = "none"; }

e_place_name = I("place_name");
e_place_desc = I("place_desc");
e_show_place = I("show_place");

//	-	-	-	-	-	-	-	-	-	-

game = {
	title: "Untitled Game",
	last_saved: 0,
	pack: [],
	has_visited: {},
	world: {
		places: [],
	},
};
game.world.places.push({
	id: "nowhere",
	name: "Nowhere",
	desc: "You see nothing.",
	exits: [],
});

//	-	-	-	-	-	-	-	-	-	-

get_obj = function(id, arr) {
	for(var i = 0; i < arr.length; i++) {
		var obj = arr[i];
		if(obj.id === id || obj.name.toLowerCase() === id.toLowerCase()) {
			return obj;
		}
	};
	return null;
}

get_place = function(id) {
	return get_obj(id, game.world.places);
}

get_exit = function(id) {
	return get_obj(id, here.exits);
}

//	-	-	-	-	-	-	-	-	-	-

place = get_place("nowhere");

hide_pages = function() {
	hide_elem(e_show_place);
}

show_place = function() {
	I("place_name").value = place.name;
	I("place_desc").value = place.desc;
	replicate("tpl_exit", place.exits, function(e, d, i) {
		// ...
	});
	hide_pages();
	show_elem(e_show_place);
}

exit_seq = 0;
new_exit = function() {
	exit_seq += 1;
	var name = "Exit "+exit_seq;
	place.exits.push({
		id: name.toId(),
		name: name,
		dest: "",
	});
	show_place();
}


redraw = function() {

	title.innerHTML = game.title;

	var s = "(Unsaved)";
	var ts = game.last_saved;
	if(ts != 0) {
		s = agoStr(ts) + " ("+ts2us_mdyhm(game.last_saved)+")";
	}
	last_saved.innerHTML = s;

	replicate("tpl_place", game.world.places, function(e, d, i) {
		e.onclick = function() {
			place = d;
			show_place();
		}
	});

}

save_world = function() {
	var where = here.id;
	conn.send({msg:"save", game:game, name:"game"}, function(r) {
		if(r.error) {
			alert(o2j(r.error));
		}
		else {
			game = r.game;
			here = get_place(where ? where : "nowhere");
		}
		redraw();
	});
}

save_place = function() {
	place.name = e_place_name.value;
	place.desc = e_place_desc.value;
	place.id = place.name.toId();
	redraw();
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


