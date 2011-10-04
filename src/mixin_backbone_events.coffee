###
  mixin_backbone_events.js
  (c) 2011 Kevin Malakoff.
  Mixin.Backbone.Events is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Backbone.js
###

this.Mixin = require('mixin_core').Mixin if not Mixin and (typeof(exports) != 'undefined')
throw new Error("Mixin.Backbone.Events: Dependency alert! Mixin is missing. Please ensure it is included") if not Mixin
throw new Error("Mixin.Backbone.Events: Dependency alert! Underscore.js must be included before this file") if not _.VERSION
throw new Error('Mixin.Backbone.Events: Dependency alert! Backbone.js must be included before this file') if not this.Backbone or not this.Backbone.Events
Mixin.Backbone||Mixin.Backbone={}
Mixin.Backbone.Events||Mixin.Backbone.Events={}

Mixin.Backbone.Events._mixin_info =
  mixin_name: 'Backbone.Events'
  mixin_object: Backbone.Events

# autoMarkNative overrides the initialize methods and marks the events as pre-mixed in
Mixin.Backbone.Events.autoMarkNative = ->
  native_collection_initialize = Backbone.Collection::initialize
  Backbone.Collection::initialize = ->
    Mixin.hasMixin(this, 'Backbone.Events', true)
    native_collection_initialize.apply(this, arguments)

  native_model_initialize = Backbone.Model::initialize
  Backbone.Model::initialize = ->
    Mixin.hasMixin(this, 'Backbone.Events', true)
    native_model_initialize.apply(this, arguments)

  native_view_initialize = Backbone.View::initialize
  Backbone.View::initialize = ->
    Mixin.hasMixin(this, 'Backbone.Events', true)
    native_view_initialize.apply(this, arguments)

  native_router_initialize = Backbone.Router::initialize
  Backbone.Router::initialize = ->
    Mixin.hasMixin(this, 'Backbone.Events', true)
    native_router_initialize.apply(this, arguments)

####################################################
# Make mixin available
####################################################
Mixin.registerMixin(Mixin.Backbone.Events._mixin_info)