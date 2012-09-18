/*
  mixin-js-auto-memory.js 0.1.5
  (c) 2011, 2012 Kevin Malakoff - http://kmalakoff.github.com/mixin/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Dependencies: Mixin.Core
*/
(function() {
  return (function(factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
      return define('mixin-js-auto-memory', ['mixin-js'], factory);
    }
    // CommonJS/NodeJS or No Loader
    else {
      return factory.call(this);
    }
  })(function() {'__REPLACE__'; return Mixin;});
}).call(this);