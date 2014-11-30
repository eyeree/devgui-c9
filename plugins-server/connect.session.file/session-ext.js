var assert = require("assert");
var path = require("path");
var fs = require("fs");
var Store = require("connect/lib/middleware/session/store");
var exists = fs.existsSync || path.existsSync;

var debug = false;

module.exports = function startup(options, imports, register) {

    assert(options.sessionsPath, "option 'sessionsPath' is required");
    
    if (!exists(path.dirname(options.sessionsPath))) {
        fs.mkdir(path.dirname(options.sessionsPath), 0755);
    }
    if (!exists(options.sessionsPath)) {
        fs.mkdir(options.sessionsPath, 0755);
    }

    var sessionStore = new FileStore({
        basePath: options.sessionsPath,
        reapInterval: options.maxAge || 60 * 60 * 1000    // 1 hour
    });
    
    register(null, {
        "session-store": {
            on: sessionStore.on.bind(sessionStore),
            get: sessionStore.get.bind(sessionStore),
            set: sessionStore.set.bind(sessionStore),
            destroy: sessionStore.destroy.bind(sessionStore),
            createSession: sessionStore.createSession.bind(sessionStore)
        }
    });
    
};


var FileStore = function(options) {
    var self = this;
    self.basePath = options.basePath;
    self.reapInterval = options.reapInterval || -1;
    if (self.reapInterval > 0) {
        setInterval(function() {
            fs.readdir(self.basePath, function(err, files) {
                if (err) {
                    console.error(err);
                    return;
                }
                files.forEach(function(file) {
                    fs.readFile(self.basePath + "/" + file, function(err, data) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        var sess = JSON.parse(data);
                        var expires = (typeof sess.cookie.expires === 'string')
                            ? new Date(sess.cookie.expires)
                            : sess.cookie.expires;
                        if (!expires || new Date < expires) {
                            // session ok
                        } else {
                            self.destroy(file);
                        }                      
                    });
                });
            });
        }, self.reapInterval);
    }
};

FileStore.prototype.__proto__ = Store.prototype;

FileStore.prototype.get = function(sid, fn){
  var self = this;
  var exists = fs.exists || path.exists;
  var sid_name = sid.replace("/", "_");
  if(debug) console.log("get", sid, sid_name);
  exists(self.basePath + "/" + sid_name, function(exists) {
      if (exists) {
          if(debug) console.log("session exists", sid);
          fs.readFile(self.basePath + "/" + sid_name, function(err, data) {
              if (err) {
                  if(debug) console.log("read error", err);
                  fn && fn(err);
              }
              else {
                  if(debug) console.log("read data");
                  var sess;
                  try {
                      sess = JSON.parse(data);
                  } catch(e) {
                      if(debug) console.warn("Error '" + e + "' reading session: " + sid, data);
                      self.destroy(sid, fn);
                      return;
                  }
                  var expires = (typeof sess.cookie.expires === 'string')
                      ? new Date(sess.cookie.expires)
                      : sess.cookie.expires;
                  if (!expires || new Date < expires) {
                      if(debug) console.log('read session', sess);
                      fn(null, sess);
                  } else {
                      if(debug) console.log("session expired");
                      self.destroy(sid, fn);
                  }                      
              }
          });
      }
      else {
          if(debug) console.log("session doesn't exist", sid);
          fn();
      }
  });      
};

FileStore.prototype.set = function(sid, sess, fn){
  if(debug) console.log("session set", sid);
  var self = this;
  var sid_name = sid.replace("/", "_");
  var path = self.basePath + "/" + sid_name;
  var tmpPath = path + "~" + new Date().getTime();
  fs.writeFile(tmpPath, JSON.stringify(sess), function(err) {
      if (err) {
        if(debug) console.log("session write err", err);
          return fn && fn(err);
      }
      if(debug) console.log("session write success");

      fs.rename(tmpPath, path, function(err) {
        if(debug) console.log("session renamed", tmpPath, path, err);
        fn && fn(err);
      });
  });
};

FileStore.prototype.destroy = function(sid, fn){
  if(debug) console.log("session destory", sid);
  var self = this;
  var exists = fs.exists || path.exists;
  var sid_name = sid.replace("/", "_");
  exists(self.basePath + "/" + sid_name, function(exists) {
      if (exists) {
          fs.unlink(self.basePath + "/" + sid_name, function(err) {
              if (err) {
                  fn && fn(err);
              }
              else {
                  fn && fn();
              }
          });              
      } else {
          fn && fn();
      }
  });
};

FileStore.prototype.all = function(fn){
    if(debug) console.log("session all");
    var self = this;
    fs.readdir(self.basePath, function(err, files) {
        if (err) {
            fn && fn(err);
            return;
        }
        var arr = [];
        files.forEach(function(file) {
            // TODO: Make this async.
            arr.push(JSON.parse(fs.readFileSync(self.basePath + "/" + file)));
        });
        fn && fn(arr);
    });
};

FileStore.prototype.clear = function(fn){
    throw new Error("NYI");
/*
  this.sessions = {};
  fn && fn();
*/
};

FileStore.prototype.length = function(fn){
    throw new Error("NYI");
/*
  fn(null, Object.keys(this.sessions).length);
*/
};
