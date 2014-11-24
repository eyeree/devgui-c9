"use strict";

var util = require("util");
var c9util = require("../cloud9.core/util");
var NodeDebugProxy = require("./nodedebugproxy");

/**
 * debug node scripts with restricted user rights
 */

var exports = module.exports = function (url, listenHint, vfs, pm, sandbox, runNode, usePortFlag, nodePath, nodemonPath, debugPort, callback) {
    var NodeRunner = runNode.Runner;

    debugPort = parseInt(debugPort);

    // create methods on exports, that take a reference from NodeRunner
    setup(NodeRunner);

    sandbox.getProjectDir(function(err, projectDir) {
        if (err) return callback(err);

        init(projectDir, url);
    });

    function init(projectDir, url) {
        pm.addRunner("node-debug", exports.factory(vfs, sandbox, projectDir, url, listenHint, usePortFlag, nodePath, nodemonPath, debugPort));

        callback();
    }
};

function setup (NodeRunner) {
    exports.factory = function(vfs, sandbox, root, url, listenHint, usePortFlag, nodePath, nodemonPath, debugPort) {
        return function(args, eventEmitter, eventName, callback) {
            var options = {};
            c9util.extend(options, args);
            options.root = root;
            options.file = args.file;
            options.args = args.args;
            options.cwd = args.cwd;
            options.env = args.env;
            options.debugPort = debugPort;
            options.nodePath = args.monitor ? nodemonPath : nodePath;
            options.encoding = args.encoding;
            options.breakOnStart = args.breakOnStart;
            options.eventEmitter = eventEmitter;
            options.eventName = eventName;
            options.url = url;
            options.usePortFlag = usePortFlag;
            options.sandbox = sandbox;
            options.listenHint = listenHint;

            return new Runner(vfs, options, callback);
        };
    };

    var Runner = exports.Runner = function(vfs, options, callback) {
        
        this.breakOnStart = options.breakOnStart;
        this.msgQueue = [];
        
        if(options.debugPort == -1) {
            
            var self = this;
        
            options.sandbox.getPort(function (err, port) {
                if (err) {
                    return console.error("getPort failed");
                }
                self.debugPort = port;
                NodeRunner.call(self, vfs, options, callback);
            });
            
        } else {
            this.debugPort = options.debugPort;
            NodeRunner.call(this, vfs, options, callback);
        }
        
    };

    util.inherits(Runner, NodeRunner);
    mixin(Runner, NodeRunner);

    function mixin(Class, Parent) {
        
        Class.prototype = Class.prototype || {};
        var proto = Class.prototype;

        proto.name = "node-debug";

        proto.createChild = function(callback) {
             
            var _self = this;

            var port = this.debugPort;

            if (_self.breakOnStart)
                _self.nodeArgs.push("--debug-brk=" + port);
            else
                _self.nodeArgs.push("--debug=" + port);
                
            // force v8 to complile so breakpoints line numbers match the code
            _self.nodeArgs.push("--nolazy"); 
            
            Parent.prototype.createChild.call(_self, callback);

            this.msgQueue = [];
            if (!this.nodeDebugProxy)
                _self._startDebug(port);
        };

        proto.debugCommand = function(msg) {
            this.msgQueue.push(msg);

            if (!this.nodeDebugProxy || !this.nodeDebugProxy.connected) {
                return;
            }

            this._flushSendQueue();
        };

        proto._flushSendQueue = function() {
            if (this.msgQueue.length && this.nodeDebugProxy.connected) {
                for (var i = 0; i < this.msgQueue.length; i++) {
                    // console.log("SEND", this.msgQueue[i])
                    try {
                        this.nodeDebugProxy.send(this.msgQueue[i]);
                    } catch(e) {
                        console.log("Sending node debug message failed: " + e.message);
                        // do not silently discard unsent messages
                        this.msgQueue.splice(0, i);
                        return;
                    }
                }
            }

            this.msgQueue = [];
        };

        proto._startDebug = function(port) {
            var _self = this;
            function send(msg) {
                _self.eventEmitter.emit(_self.eventName, msg);
            }

            this.nodeDebugProxy = new NodeDebugProxy(this.vfs, port);
            this.nodeDebugProxy.on("message", function(body) {
                // console.log("REC", body)
                send({
                    "type": "node-debug",
                    "pid": _self.pid,
                    "body": body,
                    "extra": _self.extra
                });
            });

            this.nodeDebugProxy.on("connection", function() {
                // console.log("Debug proxy connected");
                send({
                    "type": "node-debug-ready",
                    "pid": _self.pid,
                    "extra": _self.extra
                });
                _self._flushSendQueue();
            });

            this.nodeDebugProxy.on("end", function(err) {
                // console.log("nodeDebugProxy terminated");
                if (err) {
                    // TODO send the error message back to the client
                    // _self.send({"type": "jvm-exit-with-error", errorMessage: err}, null, _self.name);
                    console.error(err);
                }
                if (_self.nodeDebugProxy)
                    delete _self.nodeDebugProxy;
            });

            this.nodeDebugProxy.connect();
        };
    }

    exports.mixin = mixin;
}
