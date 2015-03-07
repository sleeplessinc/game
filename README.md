
## Swords

This is a game that I started to build many years ago.
Before Node.js existed.

The idea was an http 'server' written in javascript,
with the game logic on the server side.
The server presented pages to the browser,
processed the results of the user's chosen action,
and then returned a new page with the results.

The game itself was basically a Zork-style text adventure.

The original game was built using the JS engine from Mozilla.
I compiled the engine and provide a couple of native functions
so that the JS could consume input and emit output and the
rest was done inside the JS context.

It was cool, but I never pursued it.

I dug it out recently, and spent about 1 hour converting it to
use Node.js instead of the Mozilla engine.

This is the result of that conversion.

I'm still hoping to flesh it out some more.



