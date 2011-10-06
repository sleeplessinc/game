

var fs = require("fs");
var http = require("http");
var util = require("util");
var url = require("url");
var paperboy = require("paperboy");
global.log = console.log;


var output = [];

global.e_file_contents = function(path) {
	var s = fs.readFileSync(path, "utf8")
	//log("e_file_contents: "+path+":\n-----------\n"+s+"\n----------------")
	return s
}

global.e_output = function(s) {
	log("output: "+s)
	output.unshift(s);
}

// Static pages delivered using paperboy
boy = require("paperboy")
function www(req, res, docroot) {
	boy
		.deliver(docroot, req, res)
		.before(function() {
		})
		.after(function() {
			log(3, "PB OK "+req.method+req.url)
		})
		.error(function(c, s) {
			log("PB Error "+c+" "+s+": "+req.url)
			wwwErr(req, res, 500) 
		})
		.otherwise(function() {
			wwwErr(req, res, 404) 
		})
}

function wwwErr(req, res, r) {
	res.writeHead(r, {'Content-Type': 'text/plain'})
	res.end("Error "+r)
	log(r+" "+req.method+" "+req.url)
}

function accept(req, res) {
	log("accept "+req.method+" "+req.url)

	if(req.url.match(/^\/hags/i)) {
		// game
		var u = url.parse(req.url, true)
		var query = u.query

		var tags = [], vals = []
		for(k in query) {
			tags.push(k)
			vals.push(query[k])
		}

		input(tags, vals)

		res.writeHead(200, {
			"Content-Type": "text/html",
		})

		while(output.length > 0) {
			res.write(output.pop());
		}

		res.end()
	}
	else {
		// paperboy
		www(req, res, "docroot");
	}
}


eval(e_file_contents("boot.js"))


var server = http.createServer(accept).listen(8800)
log("listening")





