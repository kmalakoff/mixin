/*
  mixin_flags.js
  (c) 2011 Kevin Malakoff.
  Mixin.Flags is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Flags: Dependency alert! Mixin is missing. Please ensure it is included");
}
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