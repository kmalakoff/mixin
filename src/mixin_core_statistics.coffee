###
  mixin_core_statistics.js
  (c) 2011 Kevin Malakoff.
  Mixin.Core.Statistics is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
###

this.Mixin = require('mixin_core').Mixin if not Mixin and (typeof(exports) != 'undefined')
throw new Error("Mixin.Core.Statistics: Dependency alert! Mixin is missing. Please ensure it is included") if not Mixin

# statistics by default - they just store the constructors in an array
this.Mixin.STATISTICS=true if (this.Mixin.STATISTICS==undefined)

####################################################
# Statistic Helpers to help validate and trackdown memory usage.
# Use these when Mixin.DEBUG mode is true.
####################################################
class Mixin.Core.Statistics
  constructor: -> @constructors = []
  addConstructor: (constructor) -> @constructors.push(constructor)
  purge: -> @constructors = []; @clear()
  clear: ->
    @by_instance_with_data = null; @by_instance_get_mixins = null;
    @by_mixin_get_instances = null; @by_mixin_get_constructors = null
    @by_constructor_get_instances = null
  update: ->
    @clear()
    @byInstance_getMixins(); @byInstance_withData()
    @byMixin_getInstances(); @byMixin_getConstructors()
    @byConstructor_getInstances()

  byInstance_getMixins: -> (@by_instance_get_mixins = []; @constructorIterateClassRecords(constructor, => @constructorGetMixinsByInstance(constructor, @by_instance_get_mixins)) for constructor in @constructors) if not @by_instance_get_mixins; return @by_instance_get_mixins
  byInstance_withData: -> (@by_instance_with_data = []; @constructorIterateClassRecords(constructor, => @constructorGetInstancesWithData(constructor, @by_instance_with_data)) for constructor in @constructors) if not @by_instance_with_data; return @by_instance_with_data
  byMixin_getInstances: -> (@by_mixin_get_instances = {}; @constructorIterateClassRecords(constructor, => @constructorGetInstancesByMixin(constructor, @by_mixin_get_instances)) for constructor in @constructors) if not @by_mixin_get_instances; return @by_mixin_get_instances
  byMixin_getConstructors: -> (@by_mixin_get_constructors = {}; @constructorIterateClassRecords(constructor, => @constructorGetMixins(constructor, @by_mixin_get_constructors)) for constructor in @constructors) if not @by_mixin_get_constructors; return @by_mixin_get_constructors
  byConstructor_getInstances: -> (@by_constructor_get_instances = {}; @constructorIterateClassRecords(constructor, => @constructorGroupInstances(constructor, @by_constructor_get_instances)) for constructor in @constructors) if not @by_constructor_get_instances; return @by_constructor_get_instances

  constructorIterateClassRecords: (constructor, fn) ->
    while (constructor)
      fn(constructor) if constructor._mixin_class_record
      constructor = if (constructor.__super__ and (constructor.__super__.constructor!=constructor)) then constructor.__super__.constructor else undefined
  constructorGetInstancesWithData: (constructor, instances) ->
    ((instances.push(instance_record.mix_target) if (instance_record.mix_target and instance_record.mix_target._mixin_data)) for instance_record in constructor._mixin_class_record.instance_records)
  constructorGetInstancesByMixin: (constructor, mixins) ->
    return if not constructor._mixin_class_record.instance_records.length
    (((mixins[key]=[] if not mixins.hasOwnProperty(key)); mixins[key].push(instance_record.mix_target)) for key, mixin_info of instance_record.initialized_mixins) for instance_record in constructor._mixin_class_record.instance_records
  constructorGetMixinsByInstance: (constructor, instances) ->
    for instance_record in constructor._mixin_class_record.instance_records
      do (instance_record) ->
        mixins = []; mixins.push(key) for key, mixin_info of instance_record.initialized_mixins
        instances.push({instance: instance_record.mix_target, mixins: mixins})
  constructorGroupInstances: (constructor, constructors) ->
    return if not constructor._mixin_class_record.instance_records.length
    constructors[constructor] = [] if not constructors.hasOwnProperty(constructor.name)
    constructors[constructor].push(instance_record.mix_target) for instance_record in constructor._mixin_class_record.instance_records
  constructorGetMixins: (constructor, mixins, only_with_instances) ->
    (mixins[key]=[] if not mixins.hasOwnProperty(key); mixins[key].push(constructor)) for key, mixin_info of constructor._mixin_class_record.mixins

Mixin._statistics = new Mixin.Core.Statistics() if this.Mixin.STATISTICS