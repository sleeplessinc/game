

fs = require("fs");

maws = require("maws");
require("sleepless");
require("g")("log5");

seq = 0

connect = function(req, cb_accept) {

	var name = "client-"+(seq += 1);
	log("connect: "+name);

	var cb_msg = function(m) {
		log(name+": "+o2j(m));

		if(m.msg == "hello") {
			m.reply({msg:"welcome", name:name})
			conn.send({msg:"ping"}, function(r) {
				log(o2j(r));
			})
		}
		else
		if(m.msg == "save") {
			var path = m.name+".json";
			var game = m.game;
			fs.writeFile(path, o2j(game), "utf8", function(err) {
				if(err) {
					W(o2j(err));
					m.error("Unable to save");
				}
				else {
					log("saved to \""+path+"\"");
					game.last_saved = time();
					m.reply({game:game})
				}
			});
		}
		else {
			m.error("what?");
		}

	}

	var cb_ctrl = function(s, xtra) {
		log("[CTRL] "+name+": "+s+", ["+o2j(xtra)+"]")
	}

	conn = cb_accept(cb_msg, cb_ctrl)

}

maws.listen( 12345, connect, "docroot")





