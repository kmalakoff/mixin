/*
  mixin-js-flags.js 0.1.5
  (c) 2011, 2012 Kevin Malakoff - http://kmalakoff.github.com/mixin/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Dependencies: Mixin.Core
*/
(function() {
  return (function(factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
      return define('mixin-js-flags', ['mixin-js'], factory);
    }
    // CommonJS/NodeJS or No Loader
    else {
      return factory.call(this);
    }
  })(function() {// Generated by CoffeeScript 1.6.2
var Mixin, _;

Mixin = !window.Mixin && (typeof require !== 'undefined') ? require('mixin-js') : window.Mixin;

_ = Mixin._;

/*
  mixin-js-flags.js 0.1.5
  (c) 2011, 2012 Kevin Malakoff - http://kmalakoff.github.com/mixin/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Dependencies: Mixin.Core
*/


Mixin.Flags || (Mixin.Flags = {});

Mixin.Flags._mixin_info = {
  mixin_name: 'Flags',
  initialize: function(flags, change_callback) {
    if (flags == null) {
      flags = 0;
    }
    return Mixin.instanceData(this, 'Flags', {
      flags: flags,
      change_callback: change_callback
    });
  },
  mixin_object: {
    flags: function(flags) {
      var instance_data, previous_flags;

      instance_data = Mixin.instanceData(this, 'Flags');
      if (flags !== void 0) {
        previous_flags = instance_data.flags;
        instance_data.flags = flags;
        if (instance_data.change_callback && (previous_flags !== instance_data.flags)) {
          instance_data.change_callback(instance_data.flags);
        }
      }
      return instance_data.flags;
    },
    hasFlags: function(flags) {
      var instance_data;

      instance_data = Mixin.instanceData(this, 'Flags');
      return !!(instance_data.flags & flags);
    },
    setFlags: function(flags) {
      var instance_data, previous_flags;

      instance_data = Mixin.instanceData(this, 'Flags');
      previous_flags = instance_data.flags;
      instance_data.flags |= flags;
      if (instance_data.change_callback && (previous_flags !== instance_data.flags)) {
        instance_data.change_callback(instance_data.flags);
      }
      return instance_data.flags;
    },
    resetFlags: function(flags) {
      var instance_data, previous_flags;

      instance_data = Mixin.instanceData(this, 'Flags');
      previous_flags = instance_data.flags;
      instance_data.flags &= ~flags;
      if (instance_data.change_callback && (previous_flags !== instance_data.flags)) {
        instance_data.change_callback(instance_data.flags);
      }
      return instance_data.flags;
    }
  }
};

Mixin.registerMixin(Mixin.Flags._mixin_info);
; return Mixin;});
}).call(this);