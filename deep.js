

// This basically does an #include
eval(e_file_contents("lib.js"));


// ===========================================================

sessions = new Bag();

function Session()
{
	this.sid = new Date().getTime();
}

function createSession()
{
	var session = new Session();
	sessions.insert(session);
lw("created new session: "+session.sid);
	return session;
}


function input(tags, vals)
{
	// find or create session id
	var sid = "";
	for(var i = 0; i < tags.length; i++)
	{
		if(tags[i] == "sid")
		{
			sid = vals[i];
			break;
		}
	}
	var session = sessions.find(sid);
	if((sid == "") || (session == null))
		session = createSession();
lw("session="+session);

	request(session, tags, vals);
}


w("<html><body>");
w(centered('THE SYSTEM HAS BEEN RESET<br><br>'));
w(centered("<a href=.> Continue </a>"));
w("<br><br>");



// ===========================================================


function request(session, tags, vals)
{

	var cmd = "";
	var obj = "";
	for(var i = 0; i < tags.length; i++)
	{
		if(tags[i] == "cmd")
			cmd = vals[i];
		else
		if(tags[i] == "obj")
			obj = vals[i];
	}

	wbr("<html><body>");
	wbr("Hello!");

	wfile("admin.html");
}

