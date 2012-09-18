###
  mixin-js_statistics.js
  (c) 2011, 2012 Kevin Malakoff.
  Mixin.Core.Statistics is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
###

# import Mixin and Underscore
this.Mixin = require('mixin-js').Mixin if not Mixin and (typeof(exports) != 'undefined')

# statistics by default - they just store the constructors in an array
this.Mixin.STATISTICS=true if (this.Mixin.STATISTICS==undefined)

####################################################
# Statistic Helpers to help validate and trackdown memory usage.
# Use these when Mixin.DEBUG mode is true.
####################################################
class Mixin.Core.Statistics
  constructor: -> @class_records = []
  addClassRecord: (class_record) -> @class_records.push(class_record)
  purge: -> @class_records = []; @clear()
  clear: ->
    @by_instance_with_data = null; @by_instance_get_mixins = null;
    @by_mixin_get_instances = null; @by_mixin_get_constructors = null
    @by_constructor_get_instances = null
  update: ->
    @clear()
    @byInstance_getMixins(); @byInstance_withData()
    @byMixin_getInstances(); @byMixin_getConstructors()
    @byConstructor_getInstances()

  byInstance_getMixins: -> (@by_instance_get_mixins = []; @classRecordGetMixinsByInstance(class_record, @by_instance_get_mixins) for class_record in @class_records) if not @by_instance_get_mixins; return @by_instance_get_mixins
  byInstance_withData: -> (@by_instance_with_data = []; @classRecordGetInstancesWithData(class_record, @by_instance_with_data) for class_record in @class_records) if not @by_instance_with_data; return @by_instance_with_data
  byMixin_getInstances: -> (@by_mixin_get_instances = {}; @classRecordGetInstancesByMixin(class_record, @by_mixin_get_instances) for class_record in @class_records) if not @by_mixin_get_instances; return @by_mixin_get_instances
  byMixin_getConstructors: -> (@by_mixin_get_constructors = {}; @classRecordGetMixins(class_record, @by_mixin_get_constructors) for class_record in @class_records) if not @by_mixin_get_constructors; return @by_mixin_get_constructors
  byConstructor_getInstances: -> (@by_constructor_get_instances = {}; @classRecordGroupInstances(class_record, @by_constructor_get_instances) for class_record in @class_records) if not @by_constructor_get_instances; return @by_constructor_get_instances

  classRecordGetInstancesWithData: (class_record, instances) ->
    ((instances.push(instance_record.mix_target) if (instance_record.mix_target and instance_record.mix_target._mixin_data)) for instance_record in class_record.instance_records)
    return
  classRecordGetInstancesByMixin: (class_record, mixins) ->
    return if not class_record.instance_records.length
    (((mixins[key]=[] if not mixins.hasOwnProperty(key)); mixins[key].push(instance_record.mix_target)) for key, mixin_info of instance_record.initialized_mixins) for instance_record in class_record.instance_records
    return
  classRecordGetMixinsByInstance: (class_record, instances) ->
    for instance_record in class_record.instance_records
      mixins = []; mixins.push(key) for key, mixin_info of instance_record.initialized_mixins
      instances.push({instance: instance_record.mix_target, mixins: mixins})
    return
  classRecordGroupInstances: (class_record, constructors) ->
    return if not class_record.instance_records.length
    constructors[class_record.constructor] = [] if not constructors.hasOwnProperty(class_record.constructor.name)
    constructors[class_record.constructor].push(instance_record.mix_target) for instance_record in class_record.instance_records
    return
  classRecordGetMixins: (class_record, mixins, only_with_instances) ->
    (mixins[key]=[] if not mixins.hasOwnProperty(key); mixins[key].push(class_record.constructor)) for key, mixin_info of class_record.mixins
    return

Mixin._statistics = new Mixin.Core.Statistics() if this.Mixin.STATISTICS