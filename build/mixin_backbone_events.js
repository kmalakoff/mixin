/*
  mixin_backbone_events.js
  (c) 2011 Kevin Malakoff.
  Mixin.Backbone.Events is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Backbone.js
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Backbone.Events: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (!_.VERSION) {
  throw new Error("Mixin.Backbone.Events: Dependency alert! Underscore.js must be included before this file");
}
if (!this.Backbone || !this.Backbone.Events) {
  throw new Error('Mixin.Backbone.Events: Dependency alert! Backbone.js must be included before this file');
}
Mixin.Backbone || (Mixin.Backbone = {});
Mixin.Backbone.Events || (Mixin.Backbone.Events = {});
Mixin.Backbone.Events._mixin_info = {
  mixin_name: 'Backbone.Events',
  mixin_object: Backbone.Events
};
Mixin.Backbone.Events.autoMarkNative = function() {
  var native_collection_initialize, native_model_initialize, native_router_initialize, native_view_initialize;
  native_collection_initialize = Backbone.Collection.prototype.initialize;
  Backbone.Collection.prototype.initialize = function() {
    Mixin.hasMixin(this, 'Backbone.Events', true);
    return native_collection_initialize.apply(this, arguments);
  };
  native_model_initialize = Backbone.Model.prototype.initialize;
  Backbone.Model.prototype.initialize = function() {
    Mixin.hasMixin(this, 'Backbone.Events', true);
    return native_model_initialize.apply(this, arguments);
  };
  native_view_initialize = Backbone.View.prototype.initialize;
  Backbone.View.prototype.initialize = function() {
    Mixin.hasMixin(this, 'Backbone.Events', true);
    return native_view_initialize.apply(this, arguments);
  };
  native_router_initialize = Backbone.Router.prototype.initialize;
  return Backbone.Router.prototype.initialize = function() {
    Mixin.hasMixin(this, 'Backbone.Events', true);
    return native_router_initialize.apply(this, arguments);
  };
};
Mixin.registerMixin(Mixin.Backbone.Events._mixin_info);