

maws = require("maws");
require("sleepless");

seq = 0

connect = function(req, cb_accept) {

	var name = "client-"+(seq += 1)

	var cb_msg = function(m) {
		log(name+": "+o2j(m))

		if(m.msg == "hello") {
			m.reply({msg:"welcome", name:name})
			conn.send({msg:"ping"}, function(r) {
				log(o2j(r));
			})
		}
	}

	var cb_ctrl = function(s, xtra) {
		log("[CTRL] "+name+": "+s+", ["+o2j(xtra)+"]")
	}

	conn = cb_accept(cb_msg, cb_ctrl)

}

maws.listen( 12345, connect, "docroot")





