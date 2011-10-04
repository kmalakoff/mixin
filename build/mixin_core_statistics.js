/*
  mixin_core_statistics.js
  (c) 2011 Kevin Malakoff.
  Mixin.Core.Statistics is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
*/
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
if (!Mixin && (typeof exports !== 'undefined')) {
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
    this.constructors = [];
  }
  Statistics.prototype.addConstructor = function(constructor) {
    return this.constructors.push(constructor);
  };
  Statistics.prototype.purge = function() {
    this.constructors = [];
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
    var constructor, _i, _len, _ref;
    if (!this.by_instance_get_mixins) {
      this.by_instance_get_mixins = [];
      _ref = this.constructors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constructor = _ref[_i];
        this.constructorIterateClassRecords(constructor, __bind(function() {
          return this.constructorGetMixinsByInstance(constructor, this.by_instance_get_mixins);
        }, this));
      }
    }
    return this.by_instance_get_mixins;
  };
  Statistics.prototype.byInstance_withData = function() {
    var constructor, _i, _len, _ref;
    if (!this.by_instance_with_data) {
      this.by_instance_with_data = [];
      _ref = this.constructors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constructor = _ref[_i];
        this.constructorIterateClassRecords(constructor, __bind(function() {
          return this.constructorGetInstancesWithData(constructor, this.by_instance_with_data);
        }, this));
      }
    }
    return this.by_instance_with_data;
  };
  Statistics.prototype.byMixin_getInstances = function() {
    var constructor, _i, _len, _ref;
    if (!this.by_mixin_get_instances) {
      this.by_mixin_get_instances = {};
      _ref = this.constructors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constructor = _ref[_i];
        this.constructorIterateClassRecords(constructor, __bind(function() {
          return this.constructorGetInstancesByMixin(constructor, this.by_mixin_get_instances);
        }, this));
      }
    }
    return this.by_mixin_get_instances;
  };
  Statistics.prototype.byMixin_getConstructors = function() {
    var constructor, _i, _len, _ref;
    if (!this.by_mixin_get_constructors) {
      this.by_mixin_get_constructors = {};
      _ref = this.constructors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constructor = _ref[_i];
        this.constructorIterateClassRecords(constructor, __bind(function() {
          return this.constructorGetMixins(constructor, this.by_mixin_get_constructors);
        }, this));
      }
    }
    return this.by_mixin_get_constructors;
  };
  Statistics.prototype.byConstructor_getInstances = function() {
    var constructor, _i, _len, _ref;
    if (!this.by_constructor_get_instances) {
      this.by_constructor_get_instances = {};
      _ref = this.constructors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constructor = _ref[_i];
        this.constructorIterateClassRecords(constructor, __bind(function() {
          return this.constructorGroupInstances(constructor, this.by_constructor_get_instances);
        }, this));
      }
    }
    return this.by_constructor_get_instances;
  };
  Statistics.prototype.constructorIterateClassRecords = function(constructor, fn) {
    var _results;
    _results = [];
    while (constructor) {
      if (constructor._mixin_class_record) {
        fn(constructor);
      }
      _results.push(constructor = constructor.__super__ && (constructor.__super__.constructor !== constructor) ? constructor.__super__.constructor : void 0);
    }
    return _results;
  };
  Statistics.prototype.constructorGetInstancesWithData = function(constructor, instances) {
    var instance_record, _i, _len, _ref, _results;
    _ref = constructor._mixin_class_record.instance_records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      _results.push((instance_record.mix_target && instance_record.mix_target._mixin_data ? instances.push(instance_record.mix_target) : void 0));
    }
    return _results;
  };
  Statistics.prototype.constructorGetInstancesByMixin = function(constructor, mixins) {
    var instance_record, key, mixin_info, _i, _len, _ref, _results;
    if (!constructor._mixin_class_record.instance_records.length) {
      return;
    }
    _ref = constructor._mixin_class_record.instance_records;
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
  Statistics.prototype.constructorGetMixinsByInstance = function(constructor, instances) {
    var instance_record, _i, _len, _ref, _results;
    _ref = constructor._mixin_class_record.instance_records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      _results.push((function(instance_record) {
        var key, mixin_info, mixins, _ref2;
        mixins = [];
        _ref2 = instance_record.initialized_mixins;
        for (key in _ref2) {
          mixin_info = _ref2[key];
          mixins.push(key);
        }
        return instances.push({
          instance: instance_record.mix_target,
          mixins: mixins
        });
      })(instance_record));
    }
    return _results;
  };
  Statistics.prototype.constructorGroupInstances = function(constructor, constructors) {
    var instance_record, _i, _len, _ref, _results;
    if (!constructor._mixin_class_record.instance_records.length) {
      return;
    }
    if (!constructors.hasOwnProperty(constructor.name)) {
      constructors[constructor] = [];
    }
    _ref = constructor._mixin_class_record.instance_records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      _results.push(constructors[constructor].push(instance_record.mix_target));
    }
    return _results;
  };
  Statistics.prototype.constructorGetMixins = function(constructor, mixins, only_with_instances) {
    var key, mixin_info, _ref, _results;
    _ref = constructor._mixin_class_record.mixins;
    _results = [];
    for (key in _ref) {
      mixin_info = _ref[key];
      _results.push((!mixins.hasOwnProperty(key) ? mixins[key] = [] : void 0, mixins[key].push(constructor)));
    }
    return _results;
  };
  return Statistics;
})();
if (this.Mixin.STATISTICS) {
  Mixin._statistics = new Mixin.Core.Statistics();
}