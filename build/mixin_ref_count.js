/*
  mixin_ref_count.js
  (c) 2011 Kevin Malakoff.
  Mixin.RefCount is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.RefCount: Dependency alert! Mixin is missing. Please ensure it is included");
}
Mixin.RefCount || (Mixin.RefCount = {});
Mixin.RefCount._mixin_info = {
  mixin_name: 'RefCount',
  initialize: function(release_callback) {
    return Mixin.instanceData(this, 'RefCount', {
      ref_count: 1,
      release_callback: release_callback
    });
  },
  mixin_object: {
    retain: function() {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'RefCount');
      if (instance_data.ref_count <= 0) {
        throw new Error("Mixin.RefCount: ref_count is corrupt: " + instance_data.ref_count);
      }
      instance_data.ref_count++;
      return this;
    },
    release: function() {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'RefCount');
      if (instance_data.ref_count <= 0) {
        throw new Error("Mixin.RefCount: ref_count is corrupt: " + instance_data.ref_count);
      }
      instance_data.ref_count--;
      if ((instance_data.ref_count === 0) && instance_data.release_callback) {
        instance_data.release_callback(this);
      }
      return this;
    },
    refCount: function() {
      return Mixin.instanceData(this, 'RefCount').ref_count;
    }
  }
};
Mixin.registerMixin(Mixin.RefCount._mixin_info);