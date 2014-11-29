/**
 * Help menu for the Cloud 9 IDE
 *
 * @author Garen J. Torikian
 *
 * @copyright 2011, Cloud9 IDE, Inc
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function(require, exports, module) {

    var ide = require("core/ide");
    var ext = require("core/ext");
    var menus = require("ext/menus/menus");
    var markup = require("text!ext/help/help.xml");
    var css = require("text!ext/help/style.css");
    var skin = require("text!ext/help/skin.xml");

    module.exports = ext.register("ext/help/help", {
        name: "Help Menu",
        dev: "Cloud9 IDE, Inc.",
        alone: true,
        type: ext.GENERAL,
        nodes: [],
        markup: markup,
        css: css,
        panels: {},
        skin: {
            id: "help-skin",
            data: skin,
            "media-path": ide.staticPrefix + "/ext/help/images/"
        },
        showingAll: true,

        hook : function(){
            var _self = this;

            var mnuHelp = new apf.menu();

            this.nodes.push(
                menus.addItemByPath("Help/", mnuHelp, 100000)
            );


            var c = 0;
            menus.addItemByPath("Help/About", new apf.item({ onclick : function(){ _self.showAbout(); }}), c += 100);
            var mnuChangelog = menus.addItemByPath("Help/Changelog", new apf.item({ onclick : function(){ window.open('https://github.com/eyeree/devgui/commits/master'); }}), c += 100);

            menus.addItemByPath("Help/~", new apf.divider(), c += 100);
            ide.addEventListener("hook.ext/keybindings_default/keybindings_default", function(c, e) {
                menus.addItemByPath("Help/Keyboard Shortcuts", new apf.item({ onclick : function(){ e.ext.keybindings(); }}), c);
            }.bind(this, c += 100));

        },

        init: function(amlNode) {
            apf.importCssString((this.css || ""));
        },

        showAbout: function() {
            ext.initExtension(this);

            aboutDialog.show();
            document.getElementById("c9Version").innerHTML = apf.escapeXML("Version " + window.cloud9config.version);
        },

        launchTwitter: function() {
            alert("Let's go to Twitter!");
        }
    });

});