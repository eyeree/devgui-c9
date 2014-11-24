"use strict";

var assert = require("assert");
var EventEmitter = require("events").EventEmitter;
var shell = require("./shell");
var vfsLocal = require("vfs-local");

module.exports = {

    setUp: function() {
        this.eventEmitter = new EventEmitter();
        var vfs = vfsLocal({ root: "/" });
        this.factory = shell.factory(vfs);
    },

    "test spawn ls": function(next) {
        var child = this.factory({
            command: "ls",
            args: ["-l"],
            cwd: __dirname,
            env: {}
        }, this.eventEmitter, "shell", function () {});

        var self = this;
        var pid;

        child.spawn(function(err, _pid) {
            pid = _pid;
            assert.equal(err, null);
            assert.ok(pid);
        });

        var events = ["shell-start", "shell-data", "shell-exit"];
        self.eventEmitter.on("shell", function(msg) {

            var i = events.indexOf(msg.type);
            assert.ok(i !== -1);
            events.splice(i, 1);
            
            if(msg.type === "shell-start") {
                assert.equal(msg.pid, pid);
            }

            if(msg.type === "shell-data") {            
                assert.equal(msg.stream, "stdout");
                assert.ok(msg.data.toString().indexOf(__filename.split("/").pop()) !== -1);
                assert.equal(msg.pid, pid);
            }
            
            if(msg.type === "shell-exit") {
                assert.equal(msg.code, 0);
                assert.equal(msg.pid, pid);
            }
            
            if(events.length === 0) {
                next();
            }
            
        });
    },

    "test exec ls": function(next) {
        var child = this.factory({
            command: "ls",
            args: ["-l"],
            cwd: __dirname,
            env: {}
        }, this.eventEmitter, "shell", function () {});

        child.exec(function(err, pid) {
            assert.equal(err, null);
            assert.ok(pid);
        }, function(code, stdout, stderr) {
            assert.equal(code, 0);
            assert.ok(stdout.indexOf(__filename.split("/").pop()) !== -1);
            assert.equal(stderr, "");
            next();
        });
    }
};

!module.parent && require("asyncjs").test.testcase(module.exports).exec();