/**
 * node debugger Module for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
define(function(require, exports, module) {
"use strict";

var Util = require("v8debug/util");
var EventEmitter = Util.EventEmitter;
var ide = require("core/ide");

var DebuggerService = module.exports = function(pid, runner) {
    //console.log("Creating DebuggerService for PID", pid);
    this.$pid = pid;
    this.$runner = runner;
    this.$onMessageHandler = this.$onMessage.bind(this);
};

(function() {

    Util.implement(this, EventEmitter);

    this.connect = function() {
        console.log("DebuggerService connect", this.$pid);
        if (this.state != "connected")
            ide.addEventListener("socketMessage", this.$onMessageHandler);
        this.state = "connected";
    };

    this.disconnect = function() {
        console.log("DebuggerService disconnect", this.$pid);
        ide.removeEventListener("socketMessage", this.$onMessageHandler);
        this.state = null;
    };

    this.$onMessage = function(data) {
        var message = data.message;
        if (message.type == "node-debug" && message.pid == this.$pid) {
            console.log("REC ", message.body.request_seq, message.body.seq, message.body.type, message.body.command || message.body.event, message.body.success);
            this.emit("debugger_command_0", {data: message.body});
        }
    };

    this.debuggerCommand = function(tabId, v8Command) {
        var msgJson = JSON.parse(v8Command);
        console.log("SEND", msgJson.seq, msgJson.type, msgJson.command);
        ide.send({
            command: "debugNode",
            pid: this.$pid,
            runner: this.$runner,
            body: JSON.parse(v8Command)
        });
    };

}).call(DebuggerService.prototype);

});