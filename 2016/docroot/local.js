
show_elem = function(elem) { elem.style.display = "block"; }
hide_elem = function(elem) { elem.style.display = "none"; }

e_place_name = I("place_name");
e_place_desc = I("place_desc");
e_show_place = I("show_place");

hide_pages = function() {
	hide_elem(e_show_place);
}


game = null;

redraw = function() {
	log("redrawing");
	title.innerHTML = game.title;
	replicate("tpl_places", game.world.places, function(e, d, i) {
		e.onclick = function() {
			place = d;
			show_place();
		}
	});
}



new_place = function() {
	conn.send({msg:"new_place"}, function(r) {
		game = r;
		redraw();
	})
}


show_place = function() {
	replicate("tpl_place", [place]);
	replicate("tpl_exit", place.exits, function(e, d, i) {
		// ...
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
				game = r;
				redraw();
			});
		});
		return
	}
}

conn = MAWS.connect(cb_msg, cb_ctrl)


