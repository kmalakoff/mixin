###
  mixin_auto_memory.js
  (c) 2011 Kevin Malakoff.
  Mixin.AutoMemory is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Underscore-Awesomer.js
###

this.Mixin = require('mixin_core').Mixin if not Mixin and (typeof(exports) != 'undefined')
throw new Error("Mixin.AutoMemory: Dependency alert! Mixin is missing. Please ensure it is included") if not Mixin
throw new Error("Mixin.AutoMemory: Dependency alert! Underscore.js must be included before this file") if not _.VERSION
throw new Error("Mixin.AutoMemory: Dependency alert! Underscore-Awesomer.js must be included before this file") if not _.AWESOMENESS

Mixin.AutoMemory||Mixin.AutoMemory={}
Mixin.AutoMemory.root = this
Mixin.AutoMemory.WRAPPER = if (Mixin.AutoMemory.root['$']) then $ else '$'

class Mixin.AutoMemory.Property
  constructor: (@owner, @key, @fn_ref, @args) ->
    return this if not Mixin.DEBUG
    throw new Error("Mixin.AutoMemory: missing key") if not @key
    if _.isArray(@key)
      (throw new Error("Mixin.AutoMemory: property '#{key}' doesn't exist on '#{_.className(@owner)}'") if not _.keypathExists(@owner, key)) for key in @key
    else
      throw new Error("Mixin.AutoMemory: property '#{@key}' doesn't exist on '#{_.className(@owner)}'") if not _.keypathExists(@owner, @key)
    throw new Error("Mixin.AutoMemory: unexpected function reference for property '#{@key}' on '#{_.className(@owner)}'") if @fn_ref and not (_.isFunction(@fn_ref) or _.isString(@fn_ref))
  destroy: ->
    if _.isArray(@key) then (@_destroyKey(key) for key in @key) else @_destroyKey(@key)

  _destroyKey: (key) ->
    (_.keypath(@owner, key, null); return) if not @fn_ref
    value = _.keypath(@owner, key)
    return if not value
    if (_.isFunction(@fn_ref))
      @fn_ref.apply(@owner,[value].concat(if @args then @args.slice() else []))
    else
      throw new Error("Mixin.AutoMemory: function '#{@fn_ref}' missing for property '#{key}' on '#{_.className(@owner)}'") if Mixin.DEBUG and not _.isFunction(value[@fn_ref])
      value[@fn_ref].apply(value, @args) if _.isFunction(value[@fn_ref])
    _.keypath(@owner, key, null)

class Mixin.AutoMemory.WrappedProperty
  constructor: (@owner, @key, @fn_ref, @wrapper) ->
    if @fn_ref and _.isArray(@fn_ref)
      throw new Error("Mixin.AutoMemory: unexpected function reference") if Mixin.DEBUG and not @fn_ref.length
      @args=@fn_ref.splice(1); @fn_ref=@fn_ref[0]
    return this if not Mixin.DEBUG
    throw new Error("Mixin.AutoMemory: missing key") if not @key
    if _.isArray(@key)
      (throw new Error("Mixin.AutoMemory: property '#{key}' doesn't exist on '#{_.className(@owner)}'") if not _.keypathExists(@owner, key)) for key in @key
    else
      throw new Error("Mixin.AutoMemory: property '#{@key}' doesn't exist on '#{_.className(@owner)}'") if not _.keypathExists(@owner, @key)
    throw new Error("Mixin.AutoMemory: unexpected function reference") if @fn_ref and not (_.isFunction(@fn_ref) or _.isString(@fn_ref))
    throw new Error("Mixin.AutoMemory: missing wrapper") if not @wrapper

  destroy: ->
    if _.isArray(@key) then (@_destroyKey(key) for key in @key) else @_destroyKey(@key)

  _destroyKey: (key) ->
    (_.keypath(@owner, key, null); return) if not @fn_ref
    value = _.keypath(@owner, key)
    return if not value
    wrapper = if _.isString(@wrapper) then Mixin.AutoMemory.root[@wrapper] else @wrapper
    wrapped_value =  wrapper(value)
    if (_.isFunction(@fn_ref))
      @fn_ref.apply(@owner,[wrapped_value].concat(if @args then @args.slice() else []))
    else
      throw new Error("Mixin.AutoMemory: function '#{@fn_ref}' missing for wrapped property '#{key}' on '#{_.className(@owner)}'") if Mixin.DEBUG and not _.isFunction(wrapped_value[@fn_ref])
      wrapped_value[@fn_ref].apply(wrapped_value, @args)
    _.keypath(@owner, key, null)

class Mixin.AutoMemory.Function
  constructor: (@object, @fn_ref, @args) ->
    return this if not Mixin.DEBUG
    throw new Error("Mixin.AutoMemory: missing fn_ref") if not @fn_ref
    throw new Error("Mixin.AutoMemory: unexpected function reference") if not _.isFunction(@fn_ref) and not (@object and _.isString(@fn_ref) and _.isFunction(@object[@fn_ref]))
  destroy: ->
    (@fn_ref.apply(null, @args); return) if not @object
    (@object[@fn_ref].apply(@object, @args); return) if not _.isFunction(@fn_ref)
    @fn_ref.apply(@object,[@object].concat(if @args then @args.slice() else []))

Mixin.AutoMemory._mixin_info =
  mixin_name: 'AutoMemory'

  initialize: -> Mixin.instanceData(this, 'AutoMemory', [])
  destroy: ->
    # call the auto clean ups
    callbacks = Mixin.instanceData(this, 'AutoMemory'); Mixin.instanceData(this, 'AutoMemory', [])
    callback.destroy() for callback in callbacks

  mixin_object: {
    autoProperty: (key, fn_ref) ->
      Mixin.instanceData(this, 'AutoMemory').push(new Mixin.AutoMemory.Property(this, key, fn_ref, Array.prototype.slice.call(arguments, 2)))
      return this
    autoWrappedProperty: (key, fn_ref, wrapper) ->
      wrapper=Mixin.AutoMemory.WRAPPER if (wrapper==undefined)
      Mixin.instanceData(this, 'AutoMemory').push(new Mixin.AutoMemory.WrappedProperty(this, key, fn_ref, wrapper))
      return this
    autoFunction: (object, fn_ref) ->
      Mixin.instanceData(this, 'AutoMemory').push(new Mixin.AutoMemory.Function(object, fn_ref, Array.prototype.slice.call(arguments, 2)))
      return this
  }

####################################################
# Make mixin available
####################################################
Mixin.registerMixin(Mixin.AutoMemory._mixin_info)