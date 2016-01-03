/**
 * @fileOverview
 <h2>About Atomic Plugins</h2>
 <p>Atomic Plugins provide an elegant and minimalist API and are designed with portability in mind from the beginning. Framework dependencies are avoided by design so the plugins can run on any platform and can be integrated with any app framework or game engine.
 <br/><p>You can contribute and help to create more awesome plugins. </p>
 <h2>Atomic Plugins - Cocoon Common</h2>
 <p>All the features described in Cocoon namespace are available for all the plugins listed below. Cocoon Commons are included in cocoon.js file that is required for running any of those plugins in JavaScript.</p>
 <ul>
 <li><a href="https://github.com/ludei/atomic-plugins-ads">Atomic Plugins for Ads</a></li>
 <li><a href="https://github.com/ludei/atomic-plugins-inapps">Atomic Plugins for In-App Purchases</a></li>
 <li><a href="https://github.com/ludei/atomic-plugins-social">Atomic Plugins for Social integration</a></li>
 <li><a href="https://github.com/ludei/atomic-plugins-share">Atomic Plugins Share</a></li>
 <li><a href="https://github.com/CocoonIO/cocoon-canvasplus">Canvas+ legacies</a></li>
 </ul>
 <h3>Documentation</h3>
 <p>Select the specific namespace below to open the relevant documentation section:</p>
 <ul>
 <li><a href="Cocoon.html">Cocoon</a></li>
 <li><a href="http://ludei.github.io/atomic-plugins-ads/dist/doc/js/Cocoon.Ad.html">Ads</a></li>
 <li><a href="http://ludei.github.io/atomic-plugins-inapps/dist/doc/js/Cocoon.InApp.html">InApps</a></li>
 <li><a href="http://ludei.github.io/atomic-plugins-social/dist/doc/js/Cocoon.Social.html">Social</a></li>
 <li><a href="http://ludei.github.io/atomic-plugins-share/dist/doc/js/Cocoon.Share.html">Share</a></li>
 <li><a href="http://cocoonio.github.io/cocoon-canvasplus/dist/doc/js/index.html">Canvas+ legacies</a></li>
 </ul>
 <p> We hope you find everything you need to get going here, but if you stumble on any problems with the docs or the plugins,
 just drop us a line at our forum and we will do our best to help you out.</p>
 <h3>Tools</h3>
 <a href="http://support.ludei.com/hc/communities/public/topics"><img src="img/cocoon-tools-1.png" /></a>
 <a href="https://cocoon.io/doc"><img src="img/cocoon-tools-2.png" /></a>
 <a href="http://cocoon.io/"><img src="img/cocoon-tools-3.png" /></a>
 * @version 1.0
 */
(function() {

    /**
     * The "Cocoon" object holds all the Cocoon Extensions and other stuff needed for the Cocoon environment.
     * @namespace Cocoon
     */
    var Cocoon = window.Cocoon || (window.Cocoon = {});
    if (window.cordova && typeof module !== 'undefined') {
        module.exports = Cocoon;
    }

    /**
     * @property {string} version Current version of the library.
     * @memberOf Cocoon
     * @example
     * console.log(Cocoon.version);
     */
    Cocoon.version = "1.0";

    /**
     * This utility function allows to create an object oriented like hierarchy between two functions using their prototypes.
     * This function adds a "superclass" and a "__super" attributes to the subclass and it's functions to reference the super class.
     * @memberof Cocoon
     * @private
     * @static
     * @param {function} subc The subclass function.
     * @param {function} superc The superclass function.
     */
    Cocoon.extend = function(subc, superc) {
        var subcp = subc.prototype;

        var CocoonJSExtendHierarchyChainClass = function() {};
        CocoonJSExtendHierarchyChainClass.prototype = superc.prototype;

        subc.prototype = new CocoonJSExtendHierarchyChainClass();
        subc.superclass = superc.prototype;
        subc.prototype.constructor = subc;

        if (superc.prototype.constructor === Object.prototype.constructor) {
            superc.prototype.constructor = superc;
        }

        for (var method in subcp) {
            if (subcp.hasOwnProperty(method)) {
                subc.prototype[method] = subcp[method];
            }
        }
    };

    /**
     * Bridge function to call native functions from JavaScript
     * @static
     * @private
     * @param {string} serviceName The name of native extension service
     * @param {string} functionName The name of the function to be called inside the native extension object.
     * @param {array} args The arguments of the function to be called
     */
    Cocoon.exec = function(serviceName, functionName, args, succeesCallback, failCallback) {
        if (window.cordova) {
            window.cordova.exec(succeesCallback, failCallback, serviceName, functionName, args);
        } else {
            console.error("window.cordova not found");
        }
    };

    /**
     * This function is used to create extensions in the global namespace of the "Cocoon" object.
     * @memberof Cocoon
     * @private
     * @static
     * @param {string} namespace The extensions namespace, ex: Cocoon.App.Settings.
     * @param {object} callback The callback which holds the declaration of the new extension.
     * @example
     * Cocoon.define("Cocoon.namespace" , function(extension){
     * "use strict";
     *
     * return extension;
     * });
     */
    Cocoon.define = function(extName, ext, exportToModule) {

        var namespace = (extName.substring(0, 7) == "Cocoon.") ? extName.substr(7) : extName;

        var base = window.Cocoon;
        var parts = namespace.split(".");
        var object = base;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (!object[part]) {
                console.log("Created namespace: " + extName);
            } else {
                console.log("Updated namespace: - " + extName);
            }
            object = object[part] = (i == (parts.length - 1)) ? ext((object[part] || {})) : {};
            if (!object) {
                throw "Unable to create class " + extName;
            }
        }

        if (arguments.length < 2) {
            exportToModule = true;
        }
        if (exportToModule && typeof module !== 'undefined') {
            module.exports = object;
        }

        return true;
    };


    /**
     * This constructor creates a new Signal that holds and emits different events that are specified inside each extension.
     * @constructor Cocoon.Signal
     * @memberof Cocoon
     */
    Cocoon.Signal = function() {
        this.signals = {};
    };

    Cocoon.Signal.prototype = {

        on: function(eventName, handler) {

            if (!eventName || !handler) {
                throw new Error("Can't create signal " + (eventName || ""));
            }
            var listeners = this.signals[eventName];
            if (!listeners) {
                listeners = [];
                this.signals[eventName] = listeners;
            }
            listeners.push(handler);
        },

        emit: function(eventName, functionName, args) {
            var listeners = this.signals[eventName];
            if (!listeners) {
                return;
            }

            for (var i = 0; i < listeners.length; ++i) {

                var func = listeners[i];
                if (functionName) {
                    func = func[functionName];
                }
                if (func) {
                    func.apply(null, args || []);
                }
            }
        },
        remove: function(eventName, handler) {
            var listeners = this.signals[eventName];
            if (!listeners) {
                return;
            }
            if (!handler) {
                listeners.lenght = 0;
            } else {
                for (var i = 0; i < listeners.lenght; ++i) {
                    if (listeners[i] === handler) {
                        listeners.splice(i, 1);
                        --i;
                    }
                }
            }

        },
        expose: function() {
            return this.on.bind(this);
        }

    };

    /**
     * Defines the platform where the app is running.
     * @name Cocoon.PlatformType
     * @memberOf Cocoon
     * @property {string} ANDROID Android.
     * @property {string} IOS iOS.
     * @property {string} AMAZON Amazon.
     * @property {string} WINDOWS_PHONE Windows phone.
     * @property {string} BLACKBERRY Blackberry.
     * @property {string} OTHER Other.
     */
    Cocoon.PlatformType = {
        ANDROID: "android",
        IOS: "ios",
        AMAZON: "amazon",
        WINDOWS_PHONE: "wp",
        BLACKBERRY: "blackberry",
        OTHER: "other"
    };

    var cachedPlatform;

    /**
     * Returns the platform where the app is running.
     * @function getPlatform
     * @memberOf Cocoon
     * @returns {Cocoon.PlatformType} The platform where the app is running.
     * @example
     * var platform = Cocoon.getPlatform();
     */
    Cocoon.getPlatform = function() {

        if (cachedPlatform) {
            return cachedPlatform;
        }

        var ua = navigator.userAgent;

        if (navigator.isCocoonJS) {
            if (/ios/ig.test(ua)) {
                cachedPlatform = Cocoon.PlatformType.IOS;
            } else {
                cachedPlatform = Cocoon.PlatformType.ANDROID;
            }
            return cachedPlatform;
        }


        if (/(iPad|iPhone|iPod)/g.test(ua)) {
            cachedPlatform = Cocoon.PlatformType.IOS;
        } else if (/Kindle/i.test(ua) || /Silk/i.test(ua) || /KFTT/i.test(ua) || /KFOT/i.test(ua) ||
            /KFJWA/i.test(ua) || /KFJWI/i.test(ua) || /KFSOWI/i.test(ua) || /KFTHWA/i.test(ua) ||
            /KFTHWI/i.test(ua) || /KFAPWA/i.test(ua) || /KFAPWI/i.test(ua)) {

            cachedPlatform = Cocoon.PlatformType.AMAZON;
        } else if (/Android/i.test(ua)) {
            cachedPlatform = Cocoon.PlatformType.ANDROID;
        } else if (/BlackBerry/i.test(navigator.userAgent)) {
            cachedPlatform = Cocoon.PlatformType.BLACKBERRY;
        } else if (/IEMobile/i.test(navigator.userAgent)) {
            cachedPlatform = Cocoon.PlatformType.WINDOWS_PHONE;
        } else {
            cachedPlatform = Cocoon.PlatformType.OTHER;
        }
        return cachedPlatform;
    };

    console.log("Created namespace: Cocoon");

})();
