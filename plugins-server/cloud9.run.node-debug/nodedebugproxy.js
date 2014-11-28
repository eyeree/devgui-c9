/**
 * @copyright 2010, Ajax.org Services B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

"use strict";

var util = require("util");
var VfsSocket = require("./vfs_socket");
var StandaloneV8DebuggerService = require("v8debug").StandaloneV8DebuggerService;

var debug = false;

var DebugProxy = module.exports = function(vfs, port) {
    process.EventEmitter.call(this);
    var _self = this;

    this.connected = false;

    var socket = new VfsSocket(vfs, port);
    socket.on("end", function(errorInfo) {
        if(debug) console.log("PROXY END");
        _self.service.detach(0, function() {});
        _self.connected = false;
        _self.emit("end", errorInfo);
    });
    this.service = new StandaloneV8DebuggerService(socket);

    this.service.addEventListener("connect", function() {
        if(debug) console.log("PROXY CONNECTED");
        _self.connected = true;
        _self.emit("connection");
    });
    this.service.addEventListener("debugger_command_0", function(msg) {
        if(debug) console.log("PROXY REC ", JSON.stringify(msg.data).substring(0,200));
        _self.emit("message", msg.data);
    });
};

util.inherits(DebugProxy, process.EventEmitter);

(function() {

    this.connect = function() {
        if(debug) console.log("PROXY CONNECT");
        this.service.attach(0, function(err) {
            if(err) {
                console.log("PROXY ATTACH ERR", err);
            }
        });
    };

    this.send = function(msgJson) {
        if(debug) console.log("PROXY SEND", JSON.stringify(msgJson).substring(0,200));
        this.service.debuggerCommand(0, JSON.stringify(msgJson));
    };

}).call(DebugProxy.prototype);