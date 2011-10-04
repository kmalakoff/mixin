###
  mixin_backbone_local_collection.js
  (c) 2011 Kevin Malakoff.
  Mixin.Backbone.LocalCollection is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Backbone.js
###

this.Mixin = require('mixin_core').Mixin if not Mixin and (typeof(exports) != 'undefined')
throw new Error("Mixin.Backbone.LocalCollection: Dependency alert! Mixin is missing. Please ensure it is included") if not Mixin
throw new Error("Mixin.Backbone.LocalCollection: Dependency alert! Underscore.js must be included before this file") if not _.VERSION
throw new Error('Mixin.Backbone.LocalCollection: Dependency alert! Backbone.js must be included before this file') if not this.Backbone
Mixin.Backbone||Mixin.Backbone={}
Mixin.Backbone.LocalCollection||Mixin.Backbone.LocalCollection={}

Mixin.Backbone.LocalCollection._mixin_info =
  mixin_name: 'Backbone.LocalCollection'
  force: true

  initialize: ->
    throw new Error("Mixin.Backbone.LocalCollection: the mix_target '#{_.classOf(this)}' is not a Backbone.Collection") if not (this instanceof Backbone.Collection)

  mixin_object: {
    _add: (model, options)  ->
      model.id = model.cid if (not model.id and model.cid)
      this.constructor.__super__._add.apply(this, arguments)

    url:                    -> throw new Error("Mixin.Backbone.LocalCollection: url is not available for local collection '#{_.classOf(this)}'")
    parse: (response)       -> throw new Error("Mixin.Backbone.LocalCollection: parse is not available for local collection '#{_.classOf(this)}'")
    fetch:                  -> throw new Error("Mixin.Backbone.LocalCollection: fetch is not available for local collection '#{_.classOf(this)}'")
  }

####################################################
# Make mixin available
####################################################
Mixin.registerMixin(Mixin.Backbone.LocalCollection._mixin_info)
