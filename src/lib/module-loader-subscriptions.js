/*
  backbone-articulation.js 0.3.4
  (c) 2011, 2012 Kevin Malakoff - http://kmalakoff.github.com/backbone-articulation/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Dependencies: Backbone.js, and Underscore.js.
*/
(function() {
  return (function(factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
      return define('backbone-articulation', ['underscore', 'backbone', 'json-serialize', 'lifecycle'], factory);
    }
    // CommonJS/NodeJS or No Loader
    else {
      return factory.call(this);
    }
  })(function() {'__REPLACE__'; return Backbone.Articulation;});
}).call(this);