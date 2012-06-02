###
  mixin_ref_count.js
  (c) 2011 Kevin Malakoff.
  Mixin.RefCount is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
###

this.Mixin = require('mixin_core').Mixin if not Mixin and (typeof(exports) != 'undefined')

Mixin.RefCount||Mixin.RefCount={}

Mixin.RefCount._mixin_info =
  mixin_name: 'RefCount'

  initialize: (release_callback) ->
    Mixin.instanceData(this, 'RefCount', {ref_count: 1, release_callback: release_callback})

  mixin_object: {
    retain: ->
      instance_data = Mixin.instanceData(this, 'RefCount')
      throw new Error("Mixin.RefCount: ref_count is corrupt: #{instance_data.ref_count}") if instance_data.ref_count<=0
      instance_data.ref_count++
      return this

    release: ->
      instance_data = Mixin.instanceData(this, 'RefCount')
      throw new Error("Mixin.RefCount: ref_count is corrupt: #{instance_data.ref_count}") if instance_data.ref_count<=0
      instance_data.ref_count--
      instance_data.release_callback(this) if (instance_data.ref_count==0) and instance_data.release_callback
      return this

    refCount: -> return Mixin.instanceData(this, 'RefCount').ref_count
  }

####################################################
# Make mixin available
####################################################
Mixin.registerMixin(Mixin.RefCount._mixin_info)