###
  mixin-js.js 0.1.3
  (c) 2011, 2012 Kevin Malakoff.
  Mixin is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: None.

  Note: some code from Underscore.js is embedded in this file
  to remove dependencies on the full library. Please see the following for details
  on Underscore.js and its licensing:
    https://github.com/documentcloud/underscore
    https://github.com/documentcloud/underscore/blob/master/LICENSE
###

# export or create Mixin namespace
Mixin = @Mixin = if (typeof(exports) != 'undefined') then exports else {}
Mixin.Core||Mixin.Core={}
Mixin.VERSION = '0.1.3'

#Mixin.DEBUG=true                         # define DEBUG before this file to enable rigorous checks

####################################################
# Remove dependency on underscore, but inline minimally needed
####################################################
# import Underscore
_ = if not @_ and (typeof(require) != 'undefined') then require('underscore')?._ else @_
_ = {} unless _
Mixin._ = _   # publish if needed and not including the full underscore library
(_.isArray = (obj) -> return Object.prototype.toString.call(obj) == '[object Array]') unless _.isArray
(_.isString = (obj) -> return !!(obj == '' || (obj && obj.charCodeAt && obj.substr))) unless _.isString
(_.isFunction = (obj) -> return !!(obj && obj.constructor && obj.call && obj.apply)) unless _.isFunction
(_.isEmpty = (obj) -> return (obj.length==0) if (_.isArray(obj) || _.isString(obj)); return false for key, value of obj; return true) unless _.isEmpty
(_.classOf = (obj) -> return undefined if not (obj instanceof Object); return obj.prototype.constructor.name if (obj.prototype and obj.prototype.constructor and obj.prototype.constructor.name); return obj.constructor.name if (obj.constructor and obj.constructor.name); return undefined) unless _.classOf
(_.size = (obj) -> i=0; i++ for key of obj; return i) unless _.size
(_.find = (obj, iter) -> (return item if iter(item)) for item in obj; return null) unless _.find
(_.remove = (array, item) -> index = array.indexOf(item); return if index<0; array.splice(index, 1); return item) unless _.remove
(_.keypathExists = (object, keypath) -> return !!_.keypathValueOwner(object, keypath)) unless _.keypathExists
(_.keypathValueOwner = (object, keypath) -> (components = if _.isString(keypath) then keypath.split('.') else keypath); ((if(i==components.length-1) then (if object.hasOwnProperty(key) then return object else return) else (return unless object.hasOwnProperty(key); object = object[key])) for key, i in components); return) unless _.keypathValueOwner
(_.keypath = (object, keypath, value) -> components = keypath.split('.'); object = _.keypathValueOwner(object, components); return unless object; if(arguments.length==3) then (object[components[components.length-1]] = value; return value) else return object[components[components.length-1]]) unless _.keypath

####################################################
# Validation Helpers to check parameters and throw Errors if invalid.
# Use these when Mixin.DEBUG mode is true.
####################################################
class Mixin.Core._Validate
  @mixinInfo: (mixin_info, overwrite, mixin_and_function) ->
    throw new Error("#{mixin_and_function}: mixin_info missing") if not mixin_info
    _Validate.string(mixin_info.mixin_name, mixin_and_function, 'mixin_name')
    throw new Error("#{mixin_and_function}: mixin_info '#{mixin_info.mixin_name}' already registered") if not overwrite and Mixin.Core._Manager.available_mixins.hasOwnProperty(mixin_info.mixin_name)
    throw new Error("#{mixin_and_function}: mixin_info '#{mixin_info.mixin_name}' missing mixin_object") if not mixin_info.mixin_object
    throw new Error("#{mixin_and_function}: mixin_info '#{mixin_info.mixin_name}' mixin_object is invalid") if not (mixin_info.mixin_object instanceof Object)
    throw new Error("#{mixin_and_function}: mixin_info '#{mixin_info.mixin_name}' initialize function is invalid") if mixin_info.initialize and not _.isFunction(mixin_info.initialize)
    throw new Error("#{mixin_and_function}: mixin_info '#{mixin_info.mixin_name}' destroy function is invalid") if mixin_info.destroy and not _.isFunction(mixin_info.destroy)
  @instanceAndMixinName: (mix_target, mixin_name, mixin_and_function) ->
    throw new Error("#{mixin_and_function}: mix_target missing") if not mix_target
    _Validate.string(mixin_name, mixin_and_function, 'mixin_name')
    _Validate.instanceOrArray(mix_target, mixin_and_function, 'mix_target', mixin_name)
  @classConstructorAndMixinName: (constructor, mixin_name, mixin_and_function) ->
    throw new Error("#{mixin_and_function}: class constructor missing") if not constructor
    _Validate.string(mixin_name, mixin_and_function, 'mixin_name')
    throw new Error("#{mixin_and_function}: class constructor invalid for '#{mixin_name}'") if not _.isFunction(constructor)

  @exists: (parameter, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if parameter == undefined
  @object: (obj, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if obj  == undefined
    throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if (typeof(obj)!='object') or _.isArray(obj)
  @uint: (uint, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if uint == undefined
    throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if not (typeof(uint) != 'number') or (uint<0) or (Math.floor(uint)!=uint)
  @string: (string, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if string == undefined
    throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if not _.isString(string)
  @stringArrayOrNestedStringArray: (array, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if array == undefined
    throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if not _.isArray(array)
    (throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if _.isArray(item) and (not item.length or not _.isString(item[0])) or not _.isString(item)) for item in string_or_array
  @callback: (callback, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if callback == undefined
    throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if not _.isFunction(callback)
  @instance: (obj, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if obj == undefined
    throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if (typeof(obj)!='object' or _.isArray(obj)) or not _.isFunction(obj.constructor) or (obj.constructor.name=='Object')
  @instanceOrArray: (obj, mixin_and_function, parameter_name, mixin_name) ->
    throw new Error("#{mixin_and_function}: #{parameter_name} missing") if obj == undefined
    throw new Error("#{mixin_and_function}: #{parameter_name} invalid") if (typeof(obj)!='object') or not _.isFunction(obj.constructor) or (obj.constructor.name=='Object') or _.isArray(obj)
  @instanceWithMixin: (obj, mixin_name, mixin_and_function, parameter_name) ->
    _Validate.instance(obj, mixin_and_function, parameter_name)
    throw new Error("#{mixin_and_function}: #{parameter_name} missing mixin '#{mixin_name}' on #{_.classOf(obj)}") if not Mixin.hasMixin(obj, mixin_name)
  @noKey: (obj, key, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{key} already exists for #{parameter_name}") if obj.hasOwnProperty(key)
  @hasKey: (obj, key, mixin_and_function, parameter_name) ->
    throw new Error("#{mixin_and_function}: #{key} does not exist for #{parameter_name}") if not obj.hasOwnProperty(key)

####################################################
# Stored in the Mixin.Core._ClassRecord in the constructors of the mixed in classes
####################################################
class Mixin.Core._InstanceRecord
  constructor: (@mix_target) ->
    @initialized_mixins = {}       # stores hash of data per mixin

  destroy: ->
    throw new Error('Mixin: non-empty instance record being destroyed') if not _.isEmpty(@initialized_mixins)
    @mix_target = null

  hasMixin: (mixin_name, mark_as_mixed) ->
    has_mixin = @initialized_mixins.hasOwnProperty(mixin_name)
    return has_mixin if has_mixin or not mark_as_mixed
    @initialized_mixins[mixin_name] = {is_destroyed: false}

    return true

  collectMixins: (mixins) -> mixins.push(key) for key, mixin_info of @initialized_mixins

  initializeMixin: (mixin_info, args) ->
    # initialize
    @initialized_mixins[mixin_info.mixin_name] = {is_destroyed: false, destroy: mixin_info.destroy}
    mixin_info.initialize.apply(@mix_target, args) if mixin_info.initialize

  destroyMixin: (mixin_name) ->
    if mixin_name
      return false if not @initialized_mixins.hasOwnProperty(mixin_name)
      return @_destroyMixinInfo(mixin_name)
    else
      mixin_existed = false
      (mixin_existed=true; @_destroyMixinInfo(key)) for key, value of @initialized_mixins
      return mixin_existed

  _destroyMixinInfo: (mixin_name) ->
    mixin_info = @initialized_mixins[mixin_name]
    return true if (mixin_info.is_destroyed) # already destroyed (for example, both manual and event-based auto destroy)
    mixin_info.is_destroyed = true

    # call mixin destroy function
    (mixin_info.destroy.apply(@mix_target); mixin_info.destroy = null) if mixin_info.destroy

    # cleanup any stored data and instance data
    Mixin.Core._Manager._destroyInstanceData(@mix_target, mixin_name)
    delete @initialized_mixins[mixin_name]
    return true

####################################################
# Stored in the constructors of the mixed in classes
####################################################
class Mixin.Core._ClassRecord
  constructor: (@constructor) ->
    @mixins = {}
    @instance_records = []

  # mixin_info
  #   force - in other words, over-write existing functions and properties (if they exist)
  mixIntoClass: (mix_target, mixin_info) ->
    return if @mixins.hasOwnProperty(mixin_info.mixin_name) # already mixed into the class
    @mixins[mixin_info.mixin_name] = mixin_info

    # check for property clashes before mixing in
    if not mixin_info.force
      (throw new Error("Mixin: property '#{key}' clashes with existing property on '#{_.classOf(mix_target)}") if (key of mix_target)) for key, value of mixin_info.mixin_object

    # now, add the mixin methods and possibly data
    (mix_target.constructor.prototype extends mixin_info.mixin_object)

  classHasMixin: (mixin_name) -> return @mixins.hasOwnProperty(mixin_name)
  instanceHasMixin: (mix_target, mixin_name, mark_as_mixed) ->
    instance_record = @_getInstanceRecord(mix_target)
    # You're telling me
    if mark_as_mixed
      @mixins[mixin_name] = Mixin.Core._Manager._getMixinInfo(mixin_name) if not @mixins.hasOwnProperty(mixin_name)
      (instance_record = new Mixin.Core._InstanceRecord(mix_target); @instance_records.push(instance_record)) if not instance_record
      return instance_record.hasMixin(mixin_name, mark_as_mixed)

    # I'm telling you
    else
      return if instance_record then instance_record.hasMixin(mixin_name) else false

  collectMixinsForInstance: (mixins, mix_target) ->
    instance_record = @_getInstanceRecord(mix_target)
    return if not instance_record
    instance_record.collectMixins(mixins)

  initializeInstance: (mix_target, mixin_info, args) ->
    instance_record = @_getInstanceRecord(mix_target)
    (instance_record.initializeMixin(mixin_info, args); return) if instance_record
    instance_record = new Mixin.Core._InstanceRecord(mix_target); @instance_records.push(instance_record)
    instance_record.initializeMixin(mixin_info, args)

  destroyInstance: (mix_target, mixin_name) ->
    return false if mixin_name and not @mixins.hasOwnProperty(mixin_name)
    mixin_existed = false
    i=@instance_records.length-1
    while (i>=0)
      instance_record = @instance_records[i]
      if (instance_record.mix_target==mix_target) and instance_record.destroyMixin(mixin_name)
        mixin_existed = true
        (instance_record.destroy(); @instance_records.splice(i, 1)) if _.isEmpty(instance_record.initialized_mixins)
        return true if mixin_name
      i--

    return mixin_existed

  _getInstanceRecord: (mix_target) ->
    (return instance_record if (instance_record.mix_target == mix_target)) for instance_record in @instance_records
    return undefined

####################################################
# mixin_info:
#   mixin_name
#   initialize
#   destroy
#   force
#   suppress_destroy_event
#   mixin_object
class Mixin.Core._Manager
  @available_mixins = {}

  ####################################################
  # Mixin Management Methods
  ####################################################
  # mixin_info properties
  #   mixin_name - string (required)
  #   mixin_object - object with properties to mixin (required)
  #   initialize - function called on each instance when Mixin.in is called
  #   destroy - function called on each instance when Mixin.out is called
  #   Note: initialize and destroy are called with the mixin bound to 'this'.

  @registerMixin: (mixin_info, overwrite) ->
    Mixin.Core._Validate.mixinInfo(mixin_info, overwrite, 'Mixin.registerMixin') if Mixin.DEBUG
    _Manager.available_mixins[mixin_info.mixin_name] = mixin_info
    return true

  @isAvailable: (mixin_name) -> return _Manager.available_mixins.hasOwnProperty(mixin_name)
  @_getMixinInfo: (mixin_name) -> return _Manager.available_mixins[mixin_name]

  ####################################################
  # Mix Target Methods
  ####################################################
  # accepts:
  #   in(mix_target, 'SomeMixin')
  #   in(mix_target, 'SomeMixin', 'AnotherMixin', etc)
  #   in(mix_target, 'SomeMixin', ['AMixinWithParameters', param1, param2, etc], etc)
  @mixin: (mix_target) ->
    _doMixin =  (mix_target, mixin_name, params) =>
      if Mixin.DEBUG
        Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.mixin', 'mix_target')
        throw new Error("Mixin.mixin: '#{mixin_name}' not found") if not @isAvailable(mixin_name)
      mixin_info = _Manager.available_mixins[mixin_name]
      throw new Error("Mixin.mixin: '#{mixin_name}' not found") if not mixin_info

      # already mixed in
      return if @hasMixin(mix_target, mixin_info.mixin_name)   # already initialized

      # initialize instance (if needed)
      class_record = _Manager._findOrCreateClassRecord(mix_target, mixin_info)
      class_record.mixIntoClass(mix_target, mixin_info)
      class_record.initializeInstance(mix_target, mixin_info, Array.prototype.slice.call(arguments, 2))

    # check for infering parameters
    args = Array.prototype.slice.call(arguments, 1)
    throw new Error("Mixin: mixin_name missing") if not args.length
    if (args.length>1)
      check_arg = args[1]
      # the next parameter after the first mixin is not a mixin
      if not ((_.isString(check_arg) and _Manager.isAvailable(check_arg)) or (_.isArray(check_arg) and (check_arg.length>=1) and _.isString(check_arg[0]) and _Manager.isAvailable(check_arg[0])))
        _doMixin.apply(this, arguments)
        return mix_target

    (if _.isArray(parameter) then _doMixin.apply(this, [mix_target].concat(parameter)) else _doMixin(mix_target, parameter)) for parameter in args
    return mix_target

  @mixout: (mix_target, mixin_name_or_names) ->
    if Mixin.DEBUG
      Mixin.Core._Validate.instance(mix_target, 'Mixin.mixout', 'mix_target')

    _doMixout = (mix_target, mixin_name) =>
      if Mixin.DEBUG
        Mixin.Core._Validate.string(mixin_name, 'Mixin.mixout', 'mixin_name')

      if mix_target.constructor._mixin_class_records
        (return mix_target if class_record.destroyInstance(mix_target, mixin_name)) for class_record in mix_target.constructor._mixin_class_records
      return mix_target

    # process one or an array
    if arguments.length>1
      _doMixout(mix_target, parameter) for parameter in Array.prototype.slice.call(arguments, 1)
    # clear all mixins
    else
      if mix_target.constructor._mixin_class_records
        (return mix_target if class_record.destroyInstance(mix_target)) for class_record in mix_target.constructor._mixin_class_records
    return mix_target

  @hasMixin: (mix_target, mixin_name, mark_as_mixed) ->
    # You're telling me
    if mark_as_mixed
      return true if _Manager.hasMixin(mix_target, mixin_name) # already mixed in
      mixin_info = _Manager.available_mixins[mixin_name]
      return false if not mixin_info
      class_record = _Manager._findOrCreateClassRecord(mix_target, mixin_info)
      class_record.instanceHasMixin(mix_target, mixin_name, mark_as_mixed)

    # I'm telling you
    else
      Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.hasMixin', 'mix_target') if Mixin.DEBUG
      return true if _Manager.hasInstanceData(mix_target, mixin_name) # shortcut
      class_record = _Manager._findClassRecord(mix_target, mixin_name)
      return false if not class_record
      return class_record.instanceHasMixin(mix_target, mixin_name)

  @mixins: (mix_target) ->
    Mixin.Core._Validate.instance(mix_target, mixins, 'Mixin.mixins', 'mix_target') if Mixin.DEBUG
    mixins = []
    if mix_target.constructor._mixin_class_records
      class_record.collectMixinsForInstance(mixins, mix_target) for class_record in mix_target.constructor._mixin_class_records
    return mixins

  @_getClassRecords: (mix_target) ->
    class_records = []
    constructor = mix_target.constructor
    while (constructor)
      if constructor._mixin_class_records
        (class_records.push(class_record) if (mix_target instanceof class_record.constructor)) for class_record in constructor._mixin_class_records
      constructor = if (constructor.__super__ and (constructor.__super__.constructor!=constructor)) then constructor.__super__.constructor else undefined
    return class_records

  @_findClassRecord: (mix_target, mixin_name) ->
    class_records = @_getClassRecords(mix_target)
    (return class_record if class_record.classHasMixin(mixin_name)) for class_record in class_records
    return undefined

  @_findOrCreateClassRecord: (mix_target, mixin_info) ->
    # look for an existing class record
    class_record = _Manager._findClassRecord(mix_target, mixin_info.mixin_name)
    return class_record if class_record

    # not already mixed at this level
    class_record = _.find(mix_target.constructor._mixin_class_records, (test)-> return test.constructor==mix_target.constructor) if (mix_target.constructor._mixin_class_records)
    if not class_record
      class_record = new Mixin.Core._ClassRecord(mix_target.constructor)
      if mix_target.constructor._mixin_class_records
        was_added = false
        # put it before its super class
        i=0; l=mix_target.constructor._mixin_class_records.length
        while (i<l)
          other_class_record = mix_target.constructor._mixin_class_records[i]
          if (mix_target instanceof other_class_record.constructor)
            mix_target.constructor._mixin_class_records.splice(i, 0, class_record); was_added = true
            break;
          i++
        mix_target.constructor._mixin_class_records.push(class_record) if not was_added
      else
        mix_target.constructor._mixin_class_records = [class_record]
      Mixin._statistics.addClassRecord(class_record) if Mixin._statistics
    return class_record

  ####################################################
  # Mix Target Instance Data Methods
  ####################################################
  @hasInstanceData: (mix_target, mixin_name) ->
    Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.hasInstanceData', 'mix_target') if Mixin.DEBUG
    return !!(mix_target._mixin_data and mix_target._mixin_data.hasOwnProperty(mixin_name))

  @instanceData: (mix_target, mixin_name, data) ->
    if Mixin.DEBUG
      Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.instanceData', 'mix_target')
      if (data==undefined)
        throw new Error("Mixin.instanceData: no instance data on '#{_.classOf(mix_target)}'") if not ('_mixin_data' of mix_target)
        throw new Error("Mixin.instanceData: mixin '#{mixin_name}' instance data not found on '#{_.classOf(mix_target)}'") if not mix_target._mixin_data.hasOwnProperty(mixin_name)
      else
        throw new Error("Mixin.instanceData: mixin '#{mixin_name}' not mixed into '#{_.classOf(mix_target)}'") if not _Manager.hasMixin(mix_target, mixin_name)

    # set
    if not (data==undefined)
      mix_target._mixin_data = {} if not mix_target._mixin_data
      mix_target._mixin_data[mixin_name] = data
    return mix_target._mixin_data[mixin_name]

  @_destroyInstanceData: (mix_target, mixin_name) ->
    return undefined if not mix_target._mixin_data
    data = mix_target._mixin_data[mixin_name]
    delete mix_target._mixin_data[mixin_name]
    delete mix_target['_mixin_data'] if _.isEmpty(mix_target._mixin_data)

# create the manager and expose public interface in Mixin namespace
Mixin.registerMixin = Mixin.Core._Manager.registerMixin
Mixin.isAvailable = Mixin.Core._Manager.isAvailable

Mixin.mixin = Mixin.in = Mixin.Core._Manager.mixin
Mixin.mixout = Mixin.out = Mixin.Core._Manager.mixout
Mixin.hasMixin = Mixin.exists = Mixin.Core._Manager.hasMixin
Mixin.mixins = Mixin.Core._Manager.mixins
Mixin.hasInstanceData = Mixin.hasID = Mixin.Core._Manager.hasInstanceData
Mixin.instanceData = Mixin.iD = Mixin.Core._Manager.instanceData

exports.Mixin = Mixin if (typeof(exports) != 'undefined')