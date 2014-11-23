Makes a node.js application editable via web browser. It is based on a fork of https://github.com/ajaxorg/cloud9.

# Installation and Usage

    npm install --save-dev weditable
    wedit
    
This will start a web server on port 3131. You can access it by
pointing your browser to: [http://localhost:3131](http://localhost:3131). You
can specify a different port using `-p PORT` flag.

    wedit -p 1234

By default the servife will only listen to localhost.
To listen to a different IP or hostname, use the `-l HOSTNAME` flag.
If you want to listen to all IP's:

    wedit -l 0.0.0.0

If you are listening to all IPs it is adviced to add authentication to the IDE.
You can either do this by adding a reverse proxy in front of the service,
or use the built in basic authentication through the `--username` and `--password` flags.

    wedit --username SOMEUSER --password SOMEPW

You may also specify the directory that contains your node.js application using the workspace,
`-w DIRECTORY`, flag. By default the service assumes your project is in the current working
directory when run the wedit command.

    wedit -w ~/git/myproject

# Cloud9 IDE

Cloud9 is an open source IDE built with [Node.JS] on the back-end and JavaScript/HTML5 on the client. 
It is one component of the hosted service at [c9.io](http://c9.io). The version available here runs on 
your local system.

Cloud9 balances the power of traditional desktop IDEs with the simplicity and elegance of editors
like TextMate and Sublime.

Cloud9 is built entirely on a web stack, making it the most hacker-friendly IDE today.
Fork it, hack it, and if you think others would benefit, issue a pull request on this repo
and we'll take a look. If you have any questions, meet us in #cloud9ide on irc.freenode.net
or ask us on Twitter [@Cloud9IDE](http://twitter.com/#!/Cloud9IDE).

Happy Coding!

## Features

  * High performance ACE text editor with bundled syntax highlighting support for JS, HTML, CSS and mixed modes.
  * Integrated debugger for [Node.JS] applications with views of the call stack, variables, live code execution and live inspector
  * Advanced Javascript language analysis marking unused variables, globals, syntax errors and allowing for variable rename
  * Local filesystem is exposed through [WebDAV](http://en.wikipedia.org/wiki/WebDAV) to the IDE, which makes it possible to connect to remote workspaces as well
  * Highly extensible through both client-side and server-side plugins
  * Sophisticated process management on the server with evented messaging

## Browser Support

We support the newer versions of Chrome, Firefox and Safari.

## Open Source Projects Used

The Cloud9 IDE couldn't be this cool if it weren't for the wildly productive
[Node.JS] community producing so many high quality software.
Main projects that we use as building blocks:

  * [async.js] by [fjakobs]
  * [jsDAV] by [mikedeboer]
  * [connect] by [senchalabs](http://github.com/senchalabs)
  * [engine.io] by [LearnBoost](http://github.com/LearnBoost)
  * [smith.io](http://github.com/c9/smith.io) by [creationix](http://github.com/creationix) & [cadorn](http://github.com/cadorn)
  * [ace](http://github.com/ajaxorg/ace) by [fjakobs]
  * [apf](http://www.ajax.org) by [ajax.org]
  * and of course [Node.JS]!

Thanks to all developers and contributors of these projects!

[fjakobs]: http://github.com/fjakobs
[javruben]: http://github.com/javruben
[mikedeboer]: http://github.com/mikedeboer
[ajax.org]: http://www.ajax.org/
[async.js]: http://github.com/fjakobs/async.js
[jsDAV]: http://github.com/mikedeboer/jsdav
[connect]: http://github.com/senchalabs/connect
[engine.io]: http://github.com/LearnBoost/engine.io
[requireJS]: http://requirejs.org/
[Node.JS]: http://nodejs.org/

# License

The GPL version 3, read it at [http://www.gnu.org/licenses/gpl.txt](http://www.gnu.org/licenses/gpl.txt)


