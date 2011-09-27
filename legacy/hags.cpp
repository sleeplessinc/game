
/* Copyright 2004 Sleepless Software Inc.  All Rights Reserved */


// HTTP Adventure Game Server


#include <ctype.h>
#include <stdlib.h>

#include "../lib/mthttpd.cpp"
#include "../lib/file.cpp"
#include "../lib/str.cpp"
#include "../lib/taglist.cpp"
#include "../lib/assert.cpp"


#define NUM_THREADS		5
#define MAX_RESP_SIZE	50000


#define RESP_CPY(s)		Str::copy(g_resp, s, MAX_RESP_SIZE)
#define RESP_APP(s)		Str::append(g_resp, s, MAX_RESP_SIZE)


static TagList	config;

static Mutex	mutex;
static char		*g_resp = 0;

static char bootScript[1024] = "boot.js";



// Javascript stuff =========================================================

#define XP_UNIX
#include "../3rdparty/js/jsapi.h"

static const unsigned long MIN_HEAP_SIZE = 10000L;
static const unsigned long MAX_HEAP_SIZE = 1000000L;
static const unsigned long DEFAULT_HEAP_SIZE = 50000L;
static const unsigned int STACK_CHUNK_SIZE = 8192;
static unsigned long heapSize = DEFAULT_HEAP_SIZE;

static JSRuntime *rt = 0;
static JSContext *cx = 0;
static JSObject *glob = 0;


static JSBool e_output(JSContext *cx, JSObject *obj, uintN argc, jsval *argv, jsval *rval)
{

    uintN i, n;
    JSString *str;

    for(i = n = 0; i < argc; i++)
	{
		str = JS_ValueToString(cx, argv[i]);
		if(!str)
		{
			return JS_FALSE;
		}
		char *s = JS_GetStringBytes(str);
		RESP_APP(s);
    }

    return JS_TRUE;
}


static JSBool e_file_contents(JSContext *cx, JSObject *obj, uintN argc, jsval *argv, jsval *rval)
{
	*rval = JSVAL_NULL;

	JSString *str = JS_ValueToString(cx, argv[0]);
	if(!str)
	{
		return JS_TRUE;
	}
	
	char *fname = JS_GetStringBytes(str);
	File file(fname);
	if(!file.isFile())
	{
		return JS_TRUE;
	}

	int sz = file.getSize();
	if(sz < 1)
	{
		return JS_TRUE;
	}

	char *contents = (char *)JS_malloc(cx, sz + 1);
	if(!contents)
	{
		return JS_TRUE;
	}

	strncpy(contents, (char *)file.getBytes(), sz);
	contents[sz] = 0;
	*rval = STRING_TO_JSVAL(JS_NewString(cx, contents, sz));

    return JS_TRUE;
}


static JSFunctionSpec functions[] = {
    {"e_output", 		    e_output,			1},
    {"e_file_contents",		e_file_contents,	1},
    {0}
};

static JSClass global_class = {
    "global", 0,
    JS_PropertyStub,  JS_PropertyStub,  JS_PropertyStub,  JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,   JS_ConvertStub,   JS_FinalizeStub
};


void errorReporter(JSContext *cx, const char *message, JSErrorReport *report)
{
	char buf[300];

	STR_CPY(buf, "\n############\n");

	if(!report)
	{
		STR_CPY(buf, message);
	}
	else
	{
		if(report->filename)
		{
			STR_APP(buf, "File: ");
			STR_APP(buf, report->filename);
			STR_APP(buf, "\n");
		}

		if(report->lineno)
		{
			STR_APP(buf, "Line: ");
			STR_APP(buf, (int)report->lineno);
			STR_APP(buf, "\n");
		}

		if(JSREPORT_IS_WARNING(report->flags))
		{
			if(JSREPORT_IS_STRICT(report->flags))
				STR_APP(buf, "strict ");
			STR_APP(buf, "warning\n");
		}

		STR_APP(buf, message);
		STR_APP(buf, "\n");
//		if(report->linebuf)
//		{
//			STR_APP(buf, report->linebuf);
//			STR_APP(buf, "\n");
//		}
	}

	STR_APP(buf, "############\n");

	RESP_APP("<pre>");
	RESP_APP(buf);
	RESP_APP("</pre>");
}
 

int eval(const char *script)
{
	//TRACE("eval('%s')\n", script);
	jsval r;
	return JS_EvaluateScript(cx, glob, script, strlen(script), "mem", 1, &r);
}


int boot()
{
	TRACE("Booting new JS context: heapSize=%d\n", heapSize);
	rt = JS_Init(heapSize);
	ASSERT(rt);
	cx = JS_NewContext(rt, STACK_CHUNK_SIZE);

	glob = JS_NewObject(cx, &global_class, 0, 0);
	JS_InitStandardClasses(cx, glob);

	int r = JS_DefineFunctions(cx, glob, functions);
	ASSERT(r);

	JS_SetErrorReporter(cx, errorReporter);

	TRACE("Loading boot code: %s\n", bootScript);
	File sf(bootScript); 
	char *gb = (char *)sf.getBytes();
	ASSERT(gb);

	eval(gb);

	return 0;
}


// =========================================================================

struct HagsTransaction : Transaction
{
	char response[MAX_RESP_SIZE];
	char input[4100];


	void respond()
	{
		if(!Str::equals(method, "get"))
		{
			respond404();
			return;
		}

		if(!Str::equals(path, title))
		{
			Transaction::respond();		// Pass request up to parent.
			return;
		}


		mutex.lock(); // ------------------------------------------

		response[0] = 0;
		g_resp = response;

		const char *func = item("func");

		if((cx == 0) || Str::equalsCase(func, "reset"))
		{
			TRACE("RESET\n");

			// Destroy old js context 
			if(cx)
				JS_DestroyContext(cx);
			if(rt)
				JS_Finish(rt);

			// Create a new js context.
			int hs = itemInt("heapsize");
			if(hs != 0)
			{
				heapSize = hs;
				if(heapSize < MIN_HEAP_SIZE)
					heapSize = MIN_HEAP_SIZE;
				if(heapSize > MAX_HEAP_SIZE)
					heapSize = MAX_HEAP_SIZE;
			}

			boot();
		}
		else
		{
			if(func[0] != 0)
			{
				STR_CPY(input, func);
				STR_APP(input, "( [ ");
				int i;
				for(i = 0; i < queryArgs; i++)
				{
					STR_APP(input, "\"");
					STR_APP(input, queryTags[i]);
					STR_APP(input, "\" ");
					if(i != queryArgs - 1)
						STR_APP(input, ", ");
				}
				STR_APP(input, " ] , [ ");
				for(i = 0; i < queryArgs; i++)
				{
					STR_APP(input, "\"");
					STR_APP(input, queryVals[i]);
					STR_APP(input, "\" ");
					if(i != queryArgs - 1)
						STR_APP(input, ", ");
				}
				STR_APP(input, " ] )");

				eval(input);
			}
		}
	

		g_resp = 0;

		mutex.unlock(); // ------------------------------------------


		TRACE("response: %s\n", response);

		sock->writeStr("HTTP/1.0 200\n");
		sock->writeStr("Content-Type: text/html\n");
		sock->writeStr("Content-Length: ");
		sock->writeInt(strlen(response));
		sock->writeStr("\n");
		sock->writeStr("\n");

		sock->writeStr(response);

	}

};


struct Hags : MTHTTPDaemon
{
	Hags(int p) : MTHTTPDaemon(p, 10, NUM_THREADS, 0, 0, 0)
	{
		title = "Hags";
	}

	Transaction *createTransaction()
	{
		return new HagsTransaction();
	}

};


// =========================================================================

int main(int argc, char **argv)
{
	int port = 7447;

	for(int i = 1; i < argc; i++)
	{
		char *a = argv[i];
		if(a[0] == '-')
		{
			if(a[1] == 'p')
				port = atoi(a + 2);
			else
			if(a[1] == 't')
				TRACEON();
		}
		else
		{
			Str::copy(bootScript, a, sizeof(bootScript));
		}
	}

	Hags hags(port);
	hags.start();

	return 0;
}




