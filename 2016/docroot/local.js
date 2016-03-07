
show_elem = function(elem) { elem.style.display = "block"; }
hide_elem = function(elem) { elem.style.display = "none"; }

e_place_name = I("place_name");
e_place_desc = I("place_desc");
e_show_place = I("show_place");

//	-	-	-	-	-	-	-	-	-	-


msg_ping = function(m) {
	m.reply({msg:"pong"});
}


//	-	-	-	-	-	-	-	-	-	-

game = null;


cb_msg = function(m) {
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
			});
		});
		return
	}
}

conn = MAWS.connect(cb_msg, cb_ctrl)


