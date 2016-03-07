
show_elem = function(elem) { elem.style.display = "block"; }
hide_elem = function(elem) { elem.style.display = "none"; }

e_glass = I("glass");
e_dialog_edit_place = I("dialog_edit_place");
e_dialog_edit_exit = I("dialog_edit_exit");
e_exit_name = I("exit_name");
e_exit_dest = I("exit_dest");
e_place_name = I("place_name");
e_place_desc = I("place_desc");
e_show_place = I("show_place");

hide_pages = function() {
	hide_elem(e_show_place);
}

hide_dialogs = function() {
	hide_elem(e_dialog_edit_exit);
	hide_elem(e_dialog_edit_place);
	hide_elem(e_glass);
}

game = null;

redraw = function() {
	log("redrawing");
	title.innerHTML = game.title;
	game.world.places.sort(function(a, b) { if(a.name < b.name) { return -1; } if(a.name > b.name) { return 1; } return 0; });
	replicate("tpl_places", game.world.places, function(e, d, i) {
		e.onclick = function() {
			place = d;
			show_place();
		}
	});
}


delete_exit = function(id) {
	exit = exit_with_id(id);
	if(confirm("Are you sure you want to delete this exit named \""+exit.name+"\"?")) {
		conn.send({msg:"delete_exit", id:exit.id}, function(r) {
			game = r.game;
			place = place_with_id(place.id);
			redraw();
			show_place();
			hide_dialogs();
			hide_elem(e_glass);
		});
	}
}

edit_exit = function(id) {

	exit = exit_with_id(id);

	e_exit_name.value = exit.name;
	e_exit_dest.value = exit.dest_id;

	replicate("tpl_exit_dest", game.world.places, function(e, d, i) {
		// ...
	});
	e_exit_dest.value = exit.dest_id;

	cancel = hide_dialogs;
	okay = function() {
		hide_elem(e_dialog_edit_exit);
		conn.send({msg:"change_exit_details", id:exit.id, name:e_exit_name.value, dest_id:e_exit_dest.value}, function(r) {
			game = r.game;
			place = place_with_id(place.id);
			redraw();
			show_place();
			hide_dialogs();
			hide_elem(e_glass);
		});
	}

	show_elem(e_glass);
	show_elem(e_dialog_edit_exit);
	e_exit_name.select();
}

new_exit = function() {
	conn.send({msg:"new_exit", place_id:place.id}, function(r) {
		game = r.game;
		place = place_with_id(place.id);
		redraw();
		show_place();
		edit_exit(r.exit_id);
	})
}


delete_place = function() {
	var id = place.id;
	if(confirm("Are you sure you want to delete this place named \""+place.name+"\"?")) {
		conn.send({msg:"delete_place", id: id}, function(r) {
			game = r.game;
			hide_pages();
			redraw();
			hide_elem(e_glass);
		});
	}
}

edit_place = function() {
	var id = place.id;

	e_place_name.value = place.name;
	e_place_desc.value = place.desc;

	cancel = hide_dialogs;
	okay = function() {
		hide_elem(e_dialog_edit_place);
		conn.send({msg:"change_place_details", id: id, name: e_place_name.value, desc: e_place_desc.value}, function(r) {
			game = r.game;
			place = place_with_id(id);
			redraw();
			show_place();
			hide_elem(e_glass);
		});
	}
	show_elem(e_glass);
	show_elem(e_dialog_edit_place);
	e_place_name.select();
}

new_place = function() {
	conn.send({msg:"new_place"}, function(r) {
		game = r.game;
		place = place_with_id(r.id);
		redraw();
		show_place();
		edit_place();
	})
}


show_place = function(id) {

	if(id) {
		place = place_with_id(id);
		if(!place) {
			return;
		}
	}

	replicate("tpl_place", [place]);
	place.exits.forEach(function(exit) {
		var p = place_with_id(exit.dest_id);
		exit.dest_name = p ? p.name : "";
	});
	replicate("tpl_exit", place.exits, function(e, d, i) {
		e.onclick = function() {
			console.log("foo");
		}
	});
	hide_pages();
	show_elem(e_show_place);
}


//	-	-	-	-	-	-	-	-	-	-


msg_ping = function(m) {
	m.reply({msg:"pong"});
}


//	-	-	-	-	-	-	-	-	-	-

cb_msg = function(m) {
	log(o2j(m));
	var fun = global["msg_"+m.msg];
	if(typeof fun === "function") {
		fun(m);
	}
	else {
		log("bad msg: "+o2j(m));
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
			conn.send({msg:"load"}, function(r) {
				game = r.game;
				redraw();
			});
		});
		return
	}
}

conn = MAWS.connect(cb_msg, cb_ctrl)


