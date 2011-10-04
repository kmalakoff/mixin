/*
  mixin_backbone_local_collection.js
  (c) 2011 Kevin Malakoff.
  Mixin.Backbone.LocalCollection is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Backbone.js
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Backbone.LocalCollection: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (!_.VERSION) {
  throw new Error("Mixin.Backbone.LocalCollection: Dependency alert! Underscore.js must be included before this file");
}
if (!this.Backbone) {
  throw new Error('Mixin.Backbone.LocalCollection: Dependency alert! Backbone.js must be included before this file');
}
Mixin.Backbone || (Mixin.Backbone = {});
Mixin.Backbone.LocalCollection || (Mixin.Backbone.LocalCollection = {});
Mixin.Backbone.LocalCollection._mixin_info = {
  mixin_name: 'Backbone.LocalCollection',
  force: true,
  initialize: function() {
    if (!(this instanceof Backbone.Collection)) {
      throw new Error("Mixin.Backbone.LocalCollection: the mix_target '" + (_.classOf(this)) + "' is not a Backbone.Collection");
    }
  },
  mixin_object: {
    _add: function(model, options) {
      if (!model.id && model.cid) {
        model.id = model.cid;
      }
      return this.constructor.__super__._add.apply(this, arguments);
    },
    url: function() {
      throw new Error("Mixin.Backbone.LocalCollection: url is not available for local collection '" + (_.classOf(this)) + "'");
    },
    parse: function(response) {
      throw new Error("Mixin.Backbone.LocalCollection: parse is not available for local collection '" + (_.classOf(this)) + "'");
    },
    fetch: function() {
      throw new Error("Mixin.Backbone.LocalCollection: fetch is not available for local collection '" + (_.classOf(this)) + "'");
    }
  }
};
Mixin.registerMixin(Mixin.Backbone.LocalCollection._mixin_info);