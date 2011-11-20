/*
  mixin_core_statistics.js
  (c) 2011 Kevin Malakoff.
  Mixin.Core.Statistics is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Core.Statistics: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (this.Mixin.STATISTICS === void 0) {
  this.Mixin.STATISTICS = true;
}
Mixin.Core.Statistics = (function() {
  function Statistics() {
    this.class_records = [];
  }
  Statistics.prototype.addClassRecord = function(class_record) {
    return this.class_records.push(class_record);
  };
  Statistics.prototype.purge = function() {
    this.class_records = [];
    return this.clear();
  };
  Statistics.prototype.clear = function() {
    this.by_instance_with_data = null;
    this.by_instance_get_mixins = null;
    this.by_mixin_get_instances = null;
    this.by_mixin_get_constructors = null;
    return this.by_constructor_get_instances = null;
  };
  Statistics.prototype.update = function() {
    this.clear();
    this.byInstance_getMixins();
    this.byInstance_withData();
    this.byMixin_getInstances();
    this.byMixin_getConstructors();
    return this.byConstructor_getInstances();
  };
  Statistics.prototype.byInstance_getMixins = function() {
    var class_record, _i, _len, _ref;
    if (!this.by_instance_get_mixins) {
      this.by_instance_get_mixins = [];
      _ref = this.class_records;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        class_record = _ref[_i];
        this.classRecordGetMixinsByInstance(class_record, this.by_instance_get_mixins);
      }
    }
    return this.by_instance_get_mixins;
  };
  Statistics.prototype.byInstance_withData = function() {
    var class_record, _i, _len, _ref;
    if (!this.by_instance_with_data) {
      this.by_instance_with_data = [];
      _ref = this.class_records;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        class_record = _ref[_i];
        this.classRecordGetInstancesWithData(class_record, this.by_instance_with_data);
      }
    }
    return this.by_instance_with_data;
  };
  Statistics.prototype.byMixin_getInstances = function() {
    var class_record, _i, _len, _ref;
    if (!this.by_mixin_get_instances) {
      this.by_mixin_get_instances = {};
      _ref = this.class_records;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        class_record = _ref[_i];
        this.classRecordGetInstancesByMixin(class_record, this.by_mixin_get_instances);
      }
    }
    return this.by_mixin_get_instances;
  };
  Statistics.prototype.byMixin_getConstructors = function() {
    var class_record, _i, _len, _ref;
    if (!this.by_mixin_get_constructors) {
      this.by_mixin_get_constructors = {};
      _ref = this.class_records;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        class_record = _ref[_i];
        this.classRecordGetMixins(class_record, this.by_mixin_get_constructors);
      }
    }
    return this.by_mixin_get_constructors;
  };
  Statistics.prototype.byConstructor_getInstances = function() {
    var class_record, _i, _len, _ref;
    if (!this.by_constructor_get_instances) {
      this.by_constructor_get_instances = {};
      _ref = this.class_records;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        class_record = _ref[_i];
        this.classRecordGroupInstances(class_record, this.by_constructor_get_instances);
      }
    }
    return this.by_constructor_get_instances;
  };
  Statistics.prototype.classRecordGetInstancesWithData = function(class_record, instances) {
    var instance_record, _i, _len, _ref, _results;
    _ref = class_record.instance_records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      _results.push((instance_record.mix_target && instance_record.mix_target._mixin_data ? instances.push(instance_record.mix_target) : void 0));
    }
    return _results;
  };
  Statistics.prototype.classRecordGetInstancesByMixin = function(class_record, mixins) {
    var instance_record, key, mixin_info, _i, _len, _ref, _results;
    if (!class_record.instance_records.length) {
      return;
    }
    _ref = class_record.instance_records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      _results.push((function() {
        var _ref2, _results2;
        _ref2 = instance_record.initialized_mixins;
        _results2 = [];
        for (key in _ref2) {
          mixin_info = _ref2[key];
          _results2.push((!mixins.hasOwnProperty(key) ? mixins[key] = [] : void 0, mixins[key].push(instance_record.mix_target)));
        }
        return _results2;
      })());
    }
    return _results;
  };
  Statistics.prototype.classRecordGetMixinsByInstance = function(class_record, instances) {
    var instance_record, key, mixin_info, mixins, _i, _len, _ref, _ref2, _results;
    _ref = class_record.instance_records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      mixins = [];
      _ref2 = instance_record.initialized_mixins;
      for (key in _ref2) {
        mixin_info = _ref2[key];
        mixins.push(key);
      }
      _results.push(instances.push({
        instance: instance_record.mix_target,
        mixins: mixins
      }));
    }
    return _results;
  };
  Statistics.prototype.classRecordGroupInstances = function(class_record, constructors) {
    var instance_record, _i, _len, _ref, _results;
    if (!class_record.instance_records.length) {
      return;
    }
    if (!constructors.hasOwnProperty(class_record.constructor.name)) {
      constructors[class_record.constructor] = [];
    }
    _ref = class_record.instance_records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      _results.push(constructors[class_record.constructor].push(instance_record.mix_target));
    }
    return _results;
  };
  Statistics.prototype.classRecordGetMixins = function(class_record, mixins, only_with_instances) {
    var key, mixin_info, _ref, _results;
    _ref = class_record.mixins;
    _results = [];
    for (key in _ref) {
      mixin_info = _ref[key];
      _results.push((!mixins.hasOwnProperty(key) ? mixins[key] = [] : void 0, mixins[key].push(class_record.constructor)));
    }
    return _results;
  };
  return Statistics;
})();
if (this.Mixin.STATISTICS) {
  Mixin._statistics = new Mixin.Core.Statistics();
}