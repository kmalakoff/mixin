/*
  mixin.js 0.1.0
  (c) 2011 Kevin Malakoff.
  Mixin is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: None.
    - Dependencies with Mixin.UNMIX_ON_BACKBONE_DESTROY enabled: Underscore.js, Backbone.js

  Note: some code from Underscore.js is embedded in this file
  to remove dependencies on the full library. Please see the following for details
  on Underscore.js and its licensing:
    https://github.com/documentcloud/underscore
    https://github.com/documentcloud/underscore/blob/master/LICENSE
*/
var _;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
this.Mixin || (this.Mixin = {});
this.Mixin.Core || (this.Mixin.Core = {});
Mixin.VERSION = '0.1.0';
_ || (_ = {});
if (!_.isArray) {
  _.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };
}
if (!_.isString) {
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };
}
if (!_.isFunction) {
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };
}
if (!_.isEmpty) {
  _.isEmpty = function(obj) {
    var key, value;
    if (_.isArray(obj) || _.isString(obj)) {
      return obj.length === 0;
    }
    for (key in obj) {
      value = obj[key];
      return false;
    }
    return true;
  };
}
if (!_.classOf) {
  _.classOf = function(obj) {
    if (!(obj instanceof Object)) {
      return;
    }
    if (obj.prototype && obj.prototype.constructor && obj.prototype.constructor.name) {
      return obj.prototype.constructor.name;
    }
    if (obj.constructor && obj.constructor.name) {
      return obj.constructor.name;
    }
  };
}
if (!_.size) {
  _.size = function(obj) {
    var i, key;
    i = 0;
    for (key in obj) {
      i++;
    }
    return i;
  };
}
Mixin.Core._Validate = (function() {
  function _Validate() {}
  _Validate.mixinInfo = function(mixin_info, overwrite, mixin_and_function) {
    if (!mixin_info) {
      throw new Error("" + mixin_and_function + ": mixin_info missing");
    }
    _Validate.string(mixin_info.mixin_name, mixin_and_function, 'mixin_name');
    if (!overwrite && Mixin.Core._Manager.available_mixins.hasOwnProperty(mixin_info.mixin_name)) {
      throw new Error("" + mixin_and_function + ": mixin_info '" + mixin_info.mixin_name + "' already registered");
    }
    if (!mixin_info.mixin_object) {
      throw new Error("" + mixin_and_function + ": mixin_info '" + mixin_info.mixin_name + "' missing mixin_object");
    }
    if (!(mixin_info.mixin_object instanceof Object)) {
      throw new Error("" + mixin_and_function + ": mixin_info '" + mixin_info.mixin_name + "' mixin_object is invalid");
    }
    if (mixin_info.initialize && !_.isFunction(mixin_info.initialize)) {
      throw new Error("" + mixin_and_function + ": mixin_info '" + mixin_info.mixin_name + "' initialize function is invalid");
    }
    if (mixin_info.destroy && !_.isFunction(mixin_info.destroy)) {
      throw new Error("" + mixin_and_function + ": mixin_info '" + mixin_info.mixin_name + "' destroy function is invalid");
    }
  };
  _Validate.instanceAndMixinName = function(mix_target, mixin_name, mixin_and_function) {
    if (!mix_target) {
      throw new Error("" + mixin_and_function + ": mix_target missing");
    }
    _Validate.string(mixin_name, mixin_and_function, 'mixin_name');
    return _Validate.instanceOrArray(mix_target, mixin_and_function, 'mix_target', mixin_name);
  };
  _Validate.classConstructorAndMixinName = function(constructor, mixin_name, mixin_and_function) {
    if (!constructor) {
      throw new Error("" + mixin_and_function + ": class constructor missing");
    }
    _Validate.string(mixin_name, mixin_and_function, 'mixin_name');
    if (!_.isFunction(constructor)) {
      throw new Error("" + mixin_and_function + ": class constructor invalid for '" + mixin_name + "'");
    }
  };
  _Validate.exists = function(parameter, mixin_and_function, parameter_name) {
    if (parameter === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
  };
  _Validate.object = function(obj, mixin_and_function, parameter_name) {
    if (obj === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
    if ((typeof obj !== 'object') || _.isArray(obj)) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
    }
  };
  _Validate.uint = function(uint, mixin_and_function, parameter_name) {
    if (uint === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
    if (!(typeof uint !== 'number') || (uint < 0) || (Math.floor(uint) !== uint)) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
    }
  };
  _Validate.string = function(string, mixin_and_function, parameter_name) {
    if (string === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
    if (!_.isString(string)) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
    }
  };
  _Validate.stringArrayOrNestedStringArray = function(array, mixin_and_function, parameter_name) {
    var item, _i, _len, _results;
    if (array === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
    if (!_.isArray(array)) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
    }
    _results = [];
    for (_i = 0, _len = string_or_array.length; _i < _len; _i++) {
      item = string_or_array[_i];
      _results.push(((function() {
        if (_.isArray(item) && (!item.length || !_.isString(item[0])) || !_.isString(item)) {
          throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
        }
      })()));
    }
    return _results;
  };
  _Validate.callback = function(callback, mixin_and_function, parameter_name) {
    if (callback === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
    if (!_.isFunction(callback)) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
    }
  };
  _Validate.instance = function(obj, mixin_and_function, parameter_name) {
    if (obj === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
    if ((typeof obj !== 'object' || _.isArray(obj)) || !_.isFunction(obj.constructor) || (obj.constructor.name === 'Object')) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
    }
  };
  _Validate.instanceOrArray = function(obj, mixin_and_function, parameter_name, mixin_name) {
    if (obj === void 0) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing");
    }
    if ((typeof obj !== 'object') || !_.isFunction(obj.constructor) || (obj.constructor.name === 'Object') || _.isArray(obj)) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " invalid");
    }
  };
  _Validate.instanceWithMixin = function(obj, mixin_name, mixin_and_function, parameter_name) {
    _Validate.instance(obj, mixin_and_function, parameter_name);
    if (!Mixin.hasMixin(obj, mixin_name)) {
      throw new Error("" + mixin_and_function + ": " + parameter_name + " missing mixin '" + mixin_name + "' on " + (_.classOf(obj)));
    }
  };
  _Validate.noKey = function(obj, key, mixin_and_function, parameter_name) {
    if (obj.hasOwnProperty(key)) {
      throw new Error("" + mixin_and_function + ": " + key + " already exists for " + parameter_name);
    }
  };
  _Validate.hasKey = function(obj, key, mixin_and_function, parameter_name) {
    if (!obj.hasOwnProperty(key)) {
      throw new Error("" + mixin_and_function + ": " + key + " does not exist for " + parameter_name);
    }
  };
  return _Validate;
})();
Mixin.Core._InstanceRecord = (function() {
  function _InstanceRecord(mix_target) {
    this.mix_target = mix_target;
    this.initialized_mixins = {};
  }
  _InstanceRecord.prototype.destroy = function() {
    if (!_.isEmpty(this.initialized_mixins)) {
      throw new Error('Mixin: non-empty instance record being destroyed');
    }
    if (this.backbone_destroy_fn) {
      this.mix_target.bind('destroy', this.backbone_destroy_fn);
      this.backbone_destroy_fn = null;
    }
    return this.mix_target = null;
  };
  _InstanceRecord.prototype.hasMixin = function(mixin_name, mark_as_mixed) {
    var has_mixin;
    has_mixin = this.initialized_mixins.hasOwnProperty(mixin_name);
    if (has_mixin || !mark_as_mixed) {
      return has_mixin;
    }
    this.initialized_mixins[mixin_name] = {
      is_destroyed: false
    };
    if (Mixin.UNMIX_ON_BACKBONE_DESTROY && (mixin_info.mixin_name === 'Backbone.Events') && !this.backbone_destroy_fn) {
      this.backbone_destroy_fn = this._bindBackboneDestroyFn(this.mix_target);
      this.mix_target.bind('destroy', this.backbone_destroy_fn);
    }
    return true;
  };
  _InstanceRecord.prototype.collectMixins = function(mixins) {
    var key, mixin_info, _ref, _results;
    _ref = this.initialized_mixins;
    _results = [];
    for (key in _ref) {
      mixin_info = _ref[key];
      _results.push(mixins.push(key));
    }
    return _results;
  };
  _InstanceRecord.prototype.initializeMixin = function(mixin_info, args) {
    this.initialized_mixins[mixin_info.mixin_name] = {
      is_destroyed: false,
      destroy: mixin_info.destroy
    };
    if (mixin_info.initialize) {
      mixin_info.initialize.apply(this.mix_target, args);
    }
    if (Mixin.UNMIX_ON_BACKBONE_DESTROY && (mixin_info.mixin_name === 'Backbone.Events') && !this.backbone_destroy_fn) {
      this.backbone_destroy_fn = this._bindBackboneDestroyFn(this.mix_target);
      return this.mix_target.bind('destroy', this.backbone_destroy_fn);
    }
  };
  _InstanceRecord.prototype.destroyMixin = function(mixin_name) {
    var key, mixin_existed, value, _ref;
    if (mixin_name) {
      if (!this.initialized_mixins.hasOwnProperty(mixin_name)) {
        return false;
      }
      return this._destroyMixinInfo(mixin_name);
    } else {
      mixin_existed = false;
      _ref = this.initialized_mixins;
      for (key in _ref) {
        value = _ref[key];
        mixin_existed = true;
        this._destroyMixinInfo(key);
      }
      return mixin_existed;
    }
  };
  _InstanceRecord.prototype._destroyMixinInfo = function(mixin_name) {
    var mixin_info;
    mixin_info = this.initialized_mixins[mixin_name];
    if (mixin_info.is_destroyed) {
      return true;
    }
    mixin_info.is_destroyed = true;
    if (mixin_info.destroy) {
      mixin_info.destroy.apply(this.mix_target);
      mixin_info.destroy = null;
    }
    Mixin.Core._Manager._destroyInstanceData(this.mix_target, mixin_name);
    delete this.initialized_mixins[mixin_name];
    return true;
  };
  _InstanceRecord.prototype._bindBackboneDestroyFn = function(mix_target) {
    return __bind(function() {
      return Mixin.out(mix_target);
    }, this);
  };
  return _InstanceRecord;
})();
Mixin.Core._ClassRecord = (function() {
  function _ClassRecord() {
    this.mixins = {};
    this.instance_records = [];
  }
  _ClassRecord.prototype.mixIntoClass = function(mix_target, mixin_info) {
    var key, value, _ref;
    if (this.mixins.hasOwnProperty(mixin_info.mixin_name)) {
      return;
    }
    this.mixins[mixin_info.mixin_name] = mixin_info;
    if (!mixin_info.force) {
      _ref = mixin_info.mixin_object;
      for (key in _ref) {
        value = _ref[key];
        if (key in mix_target) {
          throw new Error("Mixin: property '" + key + "' clashes with existing property on '" + (_.classOf(mix_target)));
        }
      }
    }
    return __extends(mix_target.constructor.prototype, mixin_info.mixin_object);
  };
  _ClassRecord.prototype.classHasMixin = function(mixin_name) {
    return this.mixins.hasOwnProperty(mixin_name);
  };
  _ClassRecord.prototype.instanceHasMixin = function(mix_target, mixin_name, mark_as_mixed) {
    var instance_record;
    instance_record = this._getInstanceRecord(mix_target);
    if (mark_as_mixed) {
      if (!this.mixins.hasOwnProperty(mixin_name)) {
        this.mixins[mixin_name] = Mixin.Core._Manager._getMixinInfo(mixin_name);
      }
      if (!instance_record) {
        instance_record = new Mixin.Core._InstanceRecord(mix_target);
        this.instance_records.push(instance_record);
      }
      return instance_record.hasMixin(mixin_name, mark_as_mixed);
    } else {
      if (instance_record) {
        return instance_record.hasMixin(mixin_name);
      } else {
        return false;
      }
    }
  };
  _ClassRecord.prototype.collectMixinsForInstance = function(mixins, mix_target) {
    var instance_record;
    instance_record = this._getInstanceRecord(mix_target);
    if (!instance_record) {
      return;
    }
    return instance_record.collectMixins(mixins);
  };
  _ClassRecord.prototype.initializeInstance = function(mix_target, mixin_info, args) {
    var instance_record;
    instance_record = this._getInstanceRecord(mix_target);
    if (instance_record) {
      instance_record.initializeMixin(mixin_info, args);
      return;
    }
    instance_record = new Mixin.Core._InstanceRecord(mix_target);
    this.instance_records.push(instance_record);
    return instance_record.initializeMixin(mixin_info, args);
  };
  _ClassRecord.prototype.destroyInstance = function(mix_target, mixin_name) {
    var i, instance_record, mixin_existed;
    if (mixin_name && !this.mixins.hasOwnProperty(mixin_name)) {
      return false;
    }
    mixin_existed = false;
    i = this.instance_records.length - 1;
    while (i >= 0) {
      instance_record = this.instance_records[i];
      if ((instance_record.mix_target === mix_target) && instance_record.destroyMixin(mixin_name)) {
        mixin_existed = true;
        if (_.isEmpty(instance_record.initialized_mixins)) {
          instance_record.destroy();
          this.instance_records.splice(i, 1);
        }
        if (mixin_name) {
          return true;
        }
      }
      i--;
    }
    return mixin_existed;
  };
  _ClassRecord.prototype._getInstanceRecord = function(mix_target) {
    var instance_record, _i, _len, _ref;
    _ref = this.instance_records;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance_record = _ref[_i];
      if (instance_record.mix_target === mix_target) {
        return instance_record;
      }
    }
  };
  return _ClassRecord;
})();
Mixin.Core._Manager = (function() {
  function _Manager() {}
  _Manager.available_mixins = {};
  _Manager.registerMixin = function(mixin_info, overwrite) {
    if (Mixin.DEBUG) {
      Mixin.Core._Validate.mixinInfo(mixin_info, overwrite, 'Mixin.registerMixin');
    }
    _Manager.available_mixins[mixin_info.mixin_name] = mixin_info;
    return true;
  };
  _Manager.isAvailable = function(mixin_name) {
    return _Manager.available_mixins.hasOwnProperty(mixin_name);
  };
  _Manager._getMixinInfo = function(mixin_name) {
    return _Manager.available_mixins[mixin_name];
  };
  _Manager.mixin = function(mix_target) {
    var args, check_arg, parameter, _doMixin, _i, _len;
    _doMixin = __bind(function(mix_target, mixin_name, params) {
      var class_record, mixin_info;
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.mixin', 'mix_target');
        if (!this.isAvailable(mixin_name)) {
          throw new Error("Mixin.mixin: '" + mixin_name + "' not found");
        }
      }
      mixin_info = _Manager.available_mixins[mixin_name];
      if (!mixin_info) {
        throw new Error("Mixin.mixin: '" + mixin_name + "' not found");
      }
      if (this.hasMixin(mix_target, mixin_info.mixin_name)) {
        return;
      }
      class_record = _Manager._findOrCreateClassRecord(mix_target, mixin_info);
      class_record.mixIntoClass(mix_target, mixin_info);
      return class_record.initializeInstance(mix_target, mixin_info, Array.prototype.slice.call(arguments, 2));
    }, this);
    args = Array.prototype.slice.call(arguments, 1);
    if (!args.length) {
      throw new Error("Mixin: mixin_name missing");
    }
    if (args.length > 1) {
      check_arg = args[1];
      if (!((_.isString(check_arg) && _Manager.isAvailable(check_arg)) || (_.isArray(check_arg) && (check_arg.length >= 1) && _.isString(check_arg[0]) && _Manager.isAvailable(check_arg[0])))) {
        _doMixin.apply(this, arguments);
        return mix_target;
      }
    }
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      parameter = args[_i];
      if (_.isArray(parameter)) {
        _doMixin.apply(this, [mix_target].concat(parameter));
      } else {
        _doMixin(mix_target, parameter);
      }
    }
    return mix_target;
  };
  _Manager.mixout = function(mix_target, mixin_name_or_names) {
    var constructor, parameter, _doMixout, _i, _len, _ref;
    if (Mixin.DEBUG) {
      Mixin.Core._Validate.instance(mix_target, 'Mixin.mixin', 'mix_target');
    }
    _doMixout = __bind(function(mix_target, mixin_name) {
      var constructor;
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.string(mixin_name, 'Mixin.mixin.mixout', 'mixin_name');
      }
      constructor = mix_target.constructor;
      while (constructor) {
        if (constructor._mixin_class_record) {
          if (constructor._mixin_class_record.destroyInstance(mix_target, mixin_name)) {
            return mix_target;
          }
        }
        constructor = constructor.__super__ && (constructor.__super__.constructor !== constructor) ? constructor.__super__.constructor : void 0;
      }
      return mix_target;
    }, this);
    if (arguments.length > 1) {
      _ref = Array.prototype.slice.call(arguments, 1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        parameter = _ref[_i];
        _doMixout(mix_target, parameter);
      }
    } else {
      constructor = mix_target.constructor;
      while (constructor) {
        if (constructor._mixin_class_record) {
          if (constructor._mixin_class_record.destroyInstance(mix_target)) {
            return mix_target;
          }
        }
        constructor = constructor.__super__ && (constructor.__super__.constructor !== constructor) ? constructor.__super__.constructor : void 0;
      }
    }
    return mix_target;
  };
  _Manager.hasMixin = function(mix_target, mixin_name, mark_as_mixed) {
    var class_record, mixin_info;
    if (mark_as_mixed) {
      if (_Manager.hasMixin(mix_target, mixin_name)) {
        return true;
      }
      mixin_info = _Manager.available_mixins[mixin_name];
      if (!mixin_info) {
        return false;
      }
      class_record = _Manager._findOrCreateClassRecord(mix_target, mixin_info);
      return class_record.instanceHasMixin(mix_target, mixin_name, mark_as_mixed);
    } else {
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.hasMixin', 'mix_target');
      }
      if (_Manager.hasInstanceData(mix_target, mixin_name)) {
        return true;
      }
      class_record = _Manager._findClassRecord(mix_target.constructor, mixin_name);
      if (!class_record) {
        return false;
      }
      return class_record.instanceHasMixin(mix_target, mixin_name);
    }
  };
  _Manager.mixins = function(mix_target) {
    var constructor, mixins;
    if (Mixin.DEBUG) {
      Mixin.Core._Validate.instance(mix_target, mixins, 'Mixin.mixins', 'mix_target');
    }
    mixins = [];
    constructor = mix_target.constructor;
    while (constructor) {
      if (constructor._mixin_class_record) {
        constructor._mixin_class_record.collectMixinsForInstance(mixins, mix_target);
      }
      constructor = constructor.__super__ && (constructor.__super__.constructor !== constructor) ? constructor.__super__.constructor : void 0;
    }
    return mixins;
  };
  _Manager.classHasMixin = function(constructor, mixin_name) {
    if (Mixin.DEBUG) {
      Mixin.Core._Validate.classConstructorAndMixinName(constructor, mixin_name, 'classHasMixin');
    }
    return !!_Manager._findClassRecord(constructor, mixin_name);
  };
  _Manager._findClassRecord = function(constructor, mixin_name) {
    while (constructor) {
      if (constructor._mixin_class_record && constructor._mixin_class_record.classHasMixin(mixin_name)) {
        return constructor._mixin_class_record;
      }
      constructor = constructor.__super__ && (constructor.__super__.constructor !== constructor) ? constructor.__super__.constructor : void 0;
    }
  };
  _Manager._findOrCreateClassRecord = function(mix_target, mixin_info) {
    var class_record;
    class_record = _Manager._findClassRecord(mix_target.constructor, mixin_info.mixin_name);
    if (class_record) {
      return class_record;
    }
    if (!mix_target.constructor._mixin_class_record) {
      mix_target.constructor._mixin_class_record = new Mixin.Core._ClassRecord();
      if (Mixin._statistics) {
        Mixin._statistics.addConstructor(mix_target.constructor);
      }
    }
    class_record = mix_target.constructor._mixin_class_record;
    return class_record;
  };
  _Manager.hasInstanceData = function(mix_target, mixin_name) {
    if (Mixin.DEBUG) {
      Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.hasInstanceData', 'mix_target');
    }
    return !!(mix_target._mixin_data && mix_target._mixin_data.hasOwnProperty(mixin_name));
  };
  _Manager.instanceData = function(mix_target, mixin_name, data) {
    if (Mixin.DEBUG) {
      Mixin.Core._Validate.instanceAndMixinName(mix_target, mixin_name, 'Mixin.instanceData', 'mix_target');
      if (data === void 0) {
        if (!('_mixin_data' in mix_target)) {
          throw new Error("Mixin.instanceData: no instance data on '" + (_.classOf(mix_target)) + "'");
        }
        if (!mix_target._mixin_data.hasOwnProperty(mixin_name)) {
          throw new Error("Mixin.instanceData: mixin '" + mixin_name + "' instance data not found on '" + (_.classOf(mix_target)) + "'");
        }
      } else {
        if (!_Manager.hasMixin(mix_target, mixin_name)) {
          throw new Error("Mixin.instanceData: mixin '" + mixin_name + "' not mixed into '" + (_.classOf(mix_target)) + "'");
        }
      }
    }
    if (!(data === void 0)) {
      if (!mix_target._mixin_data) {
        mix_target._mixin_data = {};
      }
      mix_target._mixin_data[mixin_name] = data;
    }
    return mix_target._mixin_data[mixin_name];
  };
  _Manager._destroyInstanceData = function(mix_target, mixin_name) {
    var data;
    if (!mix_target._mixin_data) {
      return;
    }
    data = mix_target._mixin_data[mixin_name];
    delete mix_target._mixin_data[mixin_name];
    if (_.isEmpty(mix_target._mixin_data)) {
      return delete mix_target['_mixin_data'];
    }
  };
  return _Manager;
})();
Mixin.registerMixin = Mixin.Core._Manager.registerMixin;
Mixin.isAvailable = Mixin.Core._Manager.isAvailable;
Mixin.mixin = Mixin["in"] = Mixin.Core._Manager.mixin;
Mixin.mixout = Mixin.out = Mixin.Core._Manager.mixout;
Mixin.hasMixin = Mixin.exists = Mixin.Core._Manager.hasMixin;
Mixin.mixins = Mixin.Core._Manager.mixins;
Mixin.hasInstanceData = Mixin.hasID = Mixin.Core._Manager.hasInstanceData;
Mixin.instanceData = Mixin.iD = Mixin.Core._Manager.instanceData;
Mixin.classHasMixin = Mixin.Core._Manager.classHasMixin;
if (typeof exports !== 'undefined') {
  exports.Mixin = Mixin;
}
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
/*
  mixin_ref_count.js
  (c) 2011 Kevin Malakoff.
  Mixin.RefCount is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.RefCount: Dependency alert! Mixin is missing. Please ensure it is included");
}
Mixin.RefCount || (Mixin.RefCount = {});
Mixin.RefCount._mixin_info = {
  mixin_name: 'RefCount',
  initialize: function(release_callback) {
    return Mixin.instanceData(this, 'RefCount', {
      ref_count: 1,
      release_callback: release_callback
    });
  },
  mixin_object: {
    retain: function() {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'RefCount');
      if (instance_data.ref_count <= 0) {
        throw new Error("Mixin.RefCount: ref_count is corrupt: " + instance_data.ref_count);
      }
      instance_data.ref_count++;
      return this;
    },
    release: function() {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'RefCount');
      if (instance_data.ref_count <= 0) {
        throw new Error("Mixin.RefCount: ref_count is corrupt: " + instance_data.ref_count);
      }
      instance_data.ref_count--;
      if ((instance_data.ref_count === 0) && instance_data.release_callback) {
        instance_data.release_callback(this);
      }
      return this;
    },
    refCount: function() {
      return Mixin.instanceData(this, 'RefCount').ref_count;
    }
  }
};
Mixin.registerMixin(Mixin.RefCount._mixin_info);
/*
  mixin_flags.js
  (c) 2011 Kevin Malakoff.
  Mixin.Flags is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Flags: Dependency alert! Mixin is missing. Please ensure it is included");
}
Mixin.Flags || (Mixin.Flags = {});
Mixin.Flags._mixin_info = {
  mixin_name: 'Flags',
  initialize: function(flags, change_callback) {
    if (flags == null) {
      flags = 0;
    }
    return Mixin.instanceData(this, 'Flags', {
      flags: flags,
      change_callback: change_callback
    });
  },
  mixin_object: {
    flags: function(flags) {
      var instance_data, previous_flags;
      instance_data = Mixin.instanceData(this, 'Flags');
      if (flags !== void 0) {
        previous_flags = instance_data.flags;
        instance_data.flags = flags;
        if (instance_data.change_callback && (previous_flags !== instance_data.flags)) {
          instance_data.change_callback(instance_data.flags);
        }
      }
      return instance_data.flags;
    },
    hasFlags: function(flags) {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'Flags');
      return !!(instance_data.flags & flags);
    },
    setFlags: function(flags) {
      var instance_data, previous_flags;
      instance_data = Mixin.instanceData(this, 'Flags');
      previous_flags = instance_data.flags;
      instance_data.flags |= flags;
      if (instance_data.change_callback && (previous_flags !== instance_data.flags)) {
        instance_data.change_callback(instance_data.flags);
      }
      return instance_data.flags;
    },
    resetFlags: function(flags) {
      var instance_data, previous_flags;
      instance_data = Mixin.instanceData(this, 'Flags');
      previous_flags = instance_data.flags;
      instance_data.flags &= ~flags;
      if (instance_data.change_callback && (previous_flags !== instance_data.flags)) {
        instance_data.change_callback(instance_data.flags);
      }
      return instance_data.flags;
    }
  }
};
Mixin.registerMixin(Mixin.Flags._mixin_info);
/*
  mixin_auto_memory.js
  (c) 2011 Kevin Malakoff.
  Mixin.AutoMemory is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Underscore-Awesomer.js
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.AutoMemory: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (!_.VERSION) {
  throw new Error("Mixin.AutoMemory: Dependency alert! Underscore.js must be included before this file");
}
if (!_.AWESOMENESS) {
  throw new Error("Mixin.AutoMemory: Dependency alert! Underscore-Awesomer.js must be included before this file");
}
Mixin.AutoMemory || (Mixin.AutoMemory = {});
Mixin.AutoMemory.root = this;
Mixin.AutoMemory.WRAPPER = Mixin.AutoMemory.root['$'] ? $ : '$';
Mixin.AutoMemory.Property = (function() {
  function Property(owner) {
    this.owner = owner;
  }
  Property.prototype.setArgs = function() {
    var key_or_array, _i, _len, _ref, _results;
    if (!arguments.length) {
      throw new Error("Mixin.AutoMemory: missing key");
    }
    this.args = Array.prototype.slice.call(arguments);
    if (!Mixin.DEBUG) {
      return this;
    }
    if (_.isArray(this.args[0])) {
      _ref = this.args;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key_or_array = _ref[_i];
        _results.push(this._validateEntry(key_or_array));
      }
      return _results;
    } else {
      return this._validateEntry(this.args);
    }
  };
  Property.prototype.destroy = function() {
    var key_or_array, _i, _len, _ref, _results;
    if (_.isArray(this.args[0])) {
      _ref = this.args;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key_or_array = _ref[_i];
        _results.push(this._destroyEntry(key_or_array));
      }
      return _results;
    } else {
      return this._destroyEntry(this.args);
    }
  };
  Property.prototype._validateEntry = function(entry) {
    var fn_ref, key;
    key = entry[0];
    fn_ref = entry.length > 1 ? entry[1] : void 0;
    if (!_.keypathExists(this.owner, key)) {
      throw new Error("Mixin.AutoMemory: property '" + key + "' doesn't exist on '" + (_.classOf(this.owner)) + "'");
    }
    if (fn_ref && !(_.isFunction(fn_ref) || _.isString(fn_ref))) {
      throw new Error("Mixin.AutoMemory: unexpected function reference for property '" + key + "' on '" + (_.classOf(this.owner)) + "'");
    }
  };
  Property.prototype._destroyEntry = function(entry) {
    var fn_ref, key, property, value, _i, _len, _ref;
    key = entry[0];
    fn_ref = entry.length > 1 ? entry[1] : void 0;
    if (!fn_ref) {
      _.keypath(this.owner, key, null);
      return;
    }
    value = _.keypath(this.owner, key);
    if (!value) {
      return;
    }
    if (_.isFunction(fn_ref)) {
      fn_ref.apply(this.owner, [value].concat(entry.length > 2 ? entry.slice(2) : []));
    } else {
      if (_.isFunction(value[fn_ref])) {
        value[fn_ref].apply(value, entry.length > 2 ? entry.slice(2) : []);
      } else {
        _ref = entry.slice(1);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          property = _ref[_i];
          this._destroyEntry([property]);
        }
      }
    }
    return _.keypath(this.owner, key, null);
  };
  return Property;
})();
Mixin.AutoMemory.WrappedProperty = (function() {
  function WrappedProperty(owner, key, fn_ref, wrapper) {
    var _i, _len, _ref;
    this.owner = owner;
    this.key = key;
    this.fn_ref = fn_ref;
    this.wrapper = wrapper;
    if (this.fn_ref && _.isArray(this.fn_ref)) {
      if (Mixin.DEBUG && !this.fn_ref.length) {
        throw new Error("Mixin.AutoMemory: unexpected function reference");
      }
      this.args = this.fn_ref.splice(1);
      this.fn_ref = this.fn_ref[0];
    }
    if (!Mixin.DEBUG) {
      return this;
    }
    if (!this.key) {
      throw new Error("Mixin.AutoMemory: missing key");
    }
    if (_.isArray(this.key)) {
      _ref = this.key;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if (!_.keypathExists(this.owner, key)) {
          throw new Error("Mixin.AutoMemory: property '" + key + "' doesn't exist on '" + (_.classOf(this.owner)) + "'");
        }
      }
    } else {
      if (!_.keypathExists(this.owner, this.key)) {
        throw new Error("Mixin.AutoMemory: property '" + this.key + "' doesn't exist on '" + (_.classOf(this.owner)) + "'");
      }
    }
    if (this.fn_ref && !(_.isFunction(this.fn_ref) || _.isString(this.fn_ref))) {
      throw new Error("Mixin.AutoMemory: unexpected function reference");
    }
    if (!this.wrapper) {
      throw new Error("Mixin.AutoMemory: missing wrapper");
    }
  }
  WrappedProperty.prototype.destroy = function() {
    var key, _i, _len, _ref, _results;
    if (_.isArray(this.key)) {
      _ref = this.key;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(this._destroyKey(key));
      }
      return _results;
    } else {
      return this._destroyKey(this.key);
    }
  };
  WrappedProperty.prototype._destroyKey = function(key) {
    var value, wrapped_value, wrapper;
    if (!this.fn_ref) {
      _.keypath(this.owner, key, null);
      return;
    }
    value = _.keypath(this.owner, key);
    if (!value) {
      return;
    }
    wrapper = _.isString(this.wrapper) ? Mixin.AutoMemory.root[this.wrapper] : this.wrapper;
    wrapped_value = wrapper(value);
    if (_.isFunction(this.fn_ref)) {
      this.fn_ref.apply(this.owner, [wrapped_value].concat(this.args ? this.args.slice() : []));
    } else {
      if (Mixin.DEBUG && !_.isFunction(wrapped_value[this.fn_ref])) {
        throw new Error("Mixin.AutoMemory: function '" + this.fn_ref + "' missing for wrapped property '" + key + "' on '" + (_.classOf(this.owner)) + "'");
      }
      wrapped_value[this.fn_ref].apply(wrapped_value, this.args);
    }
    return _.keypath(this.owner, key, null);
  };
  return WrappedProperty;
})();
Mixin.AutoMemory.Function = (function() {
  function Function(object, fn_ref, args) {
    this.object = object;
    this.fn_ref = fn_ref;
    this.args = args;
    if (!Mixin.DEBUG) {
      return this;
    }
    if (!this.fn_ref) {
      throw new Error("Mixin.AutoMemory: missing fn_ref");
    }
    if (!_.isFunction(this.fn_ref) && !(this.object && _.isString(this.fn_ref) && _.isFunction(this.object[this.fn_ref]))) {
      throw new Error("Mixin.AutoMemory: unexpected function reference");
    }
  }
  Function.prototype.destroy = function() {
    if (!this.object) {
      this.fn_ref.apply(null, this.args);
      return;
    }
    if (!_.isFunction(this.fn_ref)) {
      this.object[this.fn_ref].apply(this.object, this.args);
      return;
    }
    return this.fn_ref.apply(this.object, [this.object].concat(this.args ? this.args.slice() : []));
  };
  return Function;
})();
Mixin.AutoMemory._mixin_info = {
  mixin_name: 'AutoMemory',
  initialize: function() {
    return Mixin.instanceData(this, 'AutoMemory', []);
  },
  destroy: function() {
    var callback, callbacks, _i, _len, _results;
    callbacks = Mixin.instanceData(this, 'AutoMemory');
    Mixin.instanceData(this, 'AutoMemory', []);
    _results = [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      callback = callbacks[_i];
      _results.push(callback.destroy());
    }
    return _results;
  },
  mixin_object: {
    autoProperty: function(key, fn_ref) {
      var auto_property;
      auto_property = new Mixin.AutoMemory.Property(this);
      auto_property.setArgs.apply(auto_property, arguments);
      Mixin.instanceData(this, 'AutoMemory').push(auto_property);
      return this;
    },
    autoWrappedProperty: function(key, fn_ref, wrapper) {
      if (wrapper === void 0) {
        wrapper = Mixin.AutoMemory.WRAPPER;
      }
      Mixin.instanceData(this, 'AutoMemory').push(new Mixin.AutoMemory.WrappedProperty(this, key, fn_ref, wrapper));
      return this;
    },
    autoFunction: function(object, fn_ref) {
      Mixin.instanceData(this, 'AutoMemory').push(new Mixin.AutoMemory.Function(object, fn_ref, Array.prototype.slice.call(arguments, 2)));
      return this;
    }
  }
};
Mixin.registerMixin(Mixin.AutoMemory._mixin_info);
/*
  mixin_backbone_local_collection.js
  (c) 2011 Kevin Malakoff.
  Mixin.Backbone.LocalCollection is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Backbone.js
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Backbone.LocalCollection: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (!_.VERSION) {
  throw new Error("Mixin.Backbone.LocalCollection: Dependency alert! Underscore.js must be included before this file");
}
if (!this.Backbone) {
  throw new Error('Mixin.Backbone.LocalCollection: Dependency alert! Backbone.js must be included before this file');
}
Mixin.Backbone || (Mixin.Backbone = {});
Mixin.Backbone.LocalCollection || (Mixin.Backbone.LocalCollection = {});
Mixin.Backbone.LocalCollection._mixin_info = {
  mixin_name: 'Backbone.LocalCollection',
  force: true,
  initialize: function() {
    if (!(this instanceof Backbone.Collection)) {
      throw new Error("Mixin.Backbone.LocalCollection: the mix_target '" + (_.classOf(this)) + "' is not a Backbone.Collection");
    }
  },
  mixin_object: {
    _add: function(model, options) {
      if (!model.id && model.cid) {
        model.id = model.cid;
      }
      return this.constructor.__super__._add.apply(this, arguments);
    },
    url: function() {
      throw new Error("Mixin.Backbone.LocalCollection: url is not available for local collection '" + (_.classOf(this)) + "'");
    },
    parse: function(response) {
      throw new Error("Mixin.Backbone.LocalCollection: parse is not available for local collection '" + (_.classOf(this)) + "'");
    },
    fetch: function() {
      throw new Error("Mixin.Backbone.LocalCollection: fetch is not available for local collection '" + (_.classOf(this)) + "'");
    }
  }
};
Mixin.registerMixin(Mixin.Backbone.LocalCollection._mixin_info);
/*
  mixin_timeouts.js
  (c) 2011 Kevin Malakoff.
  Mixin.Timeouts is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
*/
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Timeouts: Dependency alert! Mixin is missing. Please ensure it is included");
}
Mixin.Timeouts || (Mixin.Timeouts = {});
Mixin.Timeouts._mixin_info = {
  mixin_name: 'Timeouts',
  initialize: function() {
    return Mixin.instanceData(this, 'Timeouts', {
      timeouts: {}
    });
  },
  destroy: function() {
    return this.killAllTimeouts();
  },
  mixin_object: {
    addTimeout: function(timeout_name, callback, wait) {
      var callback_args, instance_data, timeout;
      Mixin.Core._Validate.string(timeout_name, 'Mixin.Timeouts.addTimeout', 'timeout_name');
      Mixin.Core._Validate.callback(callback, 'Mixin.Timeouts.addTimeout', 'callback');
      if (wait === void 0) {
        throw new Error("Mixin.Timeouts: missing wait on '" + (_.classOf(this)) + "'");
      }
      if ((typeof wait !== 'number') || (wait < 0) || (Math.floor(wait) !== wait)) {
        throw new Error("Mixin.Timeouts: wait invalid on '" + (_.classOf(this)) + "'");
      }
      instance_data = Mixin.instanceData(this, 'Timeouts');
      if (this.hasTimeout(timeout_name)) {
        throw new Error("Mixin.Timeouts: timeout '" + timeout_name + "' already exists on '" + (_.classOf(this)) + "'");
      }
      callback_args = Array.prototype.slice.call(arguments, 3);
      timeout = setTimeout((__bind(function() {
        this.killTimeout(timeout_name);
        return callback.apply(this, callback_args);
      }, this)), wait);
      instance_data.timeouts[timeout_name] = timeout;
      return this;
    },
    hasTimeout: function(timeout_name) {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'Timeouts');
      return timeout_name in instance_data.timeouts;
    },
    timeoutCount: function() {
      var count, instance_data, key, timeout, _ref;
      instance_data = Mixin.instanceData(this, 'Timeouts');
      count = 0;
      _ref = instance_data.timeouts;
      for (key in _ref) {
        timeout = _ref[key];
        count++;
      }
      return count;
    },
    timeouts: function() {
      var instance_data, key, result, timeout, _ref;
      instance_data = Mixin.instanceData(this, 'Timeouts');
      result = [];
      _ref = instance_data.timeouts;
      for (key in _ref) {
        timeout = _ref[key];
        result.push(key);
      }
      return result;
    },
    killTimeout: function(timeout_name) {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'Timeouts');
      if (!this.hasTimeout(timeout_name)) {
        throw new Error("Mixin.Timeouts: timeout '" + timeout_name + "' does not exist. For a less-strict check, use killTimeoutIfExists");
      }
      this.killTimeoutIfExists(timeout_name);
      return this;
    },
    killTimeoutIfExists: function(timeout_name) {
      var instance_data, timeout;
      instance_data = Mixin.instanceData(this, 'Timeouts');
      timeout = instance_data.timeouts[timeout_name];
      if (timeout) {
        clearTimeout(timeout);
      }
      delete instance_data.timeouts[timeout_name];
      return this;
    },
    killAllTimeouts: function() {
      var callback, instance_data, timeout_name, _ref;
      instance_data = Mixin.instanceData(this, 'Timeouts');
      _ref = instance_data.timeouts;
      for (timeout_name in _ref) {
        callback = _ref[timeout_name];
        this.killTimeoutIfExists(timeout_name);
      }
      return this;
    }
  }
};
Mixin.registerMixin(Mixin.Timeouts._mixin_info);
/*
  mixin_subscriptions.js
  (c) 2011 Kevin Malakoff.
  Mixin.Subscriptions is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Underscore-Awesomer.js
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Subscriptions: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (!_.VERSION) {
  throw new Error('Mixin.Subscriptions: Dependency alert! Underscore.js must be included before this file');
}
if (!_.AWESOMENESS) {
  throw new Error("Mixin.Subscriptions: Dependency alert! Underscore-Awesomer.js must be included before this file");
}
Mixin.Subscriptions || (Mixin.Subscriptions = {});
Mixin.Subscriptions._SubscriptionLink = (function() {
  function _SubscriptionLink(subscription, subscriber, notification_callback, options) {
    var subscriber_instance_data;
    this.subscription = subscription;
    this.subscriber = subscriber;
    this.notification_callback = notification_callback;
    this.options = _.clone(options || {});
    subscriber_instance_data = Mixin.instanceData(this.subscriber, 'Subscriber');
    subscriber_instance_data.subscription_backlinks.push(this);
  }
  _SubscriptionLink.prototype.mustKeepUntilDestroyed = function() {
    return (this.options.keep_until_destroyed === void 0) || !this.options.keep_until_destroyed;
  };
  _SubscriptionLink.prototype.destroy = function() {
    var subscriber_instance_data;
    if (!this.subscription) {
      throw new Error("Mixin.Subscriptions: _SubscriptionLink destroyed multiple times");
    }
    if (this.options.destroy) {
      this.options.destroy();
      this.options.destroy = null;
    }
    subscriber_instance_data = Mixin.instanceData(this.subscriber, 'Subscriber');
    _.remove(subscriber_instance_data.subscription_backlinks, this);
    _.remove(this.subscription.subscription_links, this);
    this.subscription = null;
    this.subscriber = null;
    this.notification_callback = null;
    return this.options = null;
  };
  return _SubscriptionLink;
})();
Mixin.Subscription || (Mixin.Subscription = {});
Mixin.Subscription.TYPE = {};
Mixin.Subscription.TYPE.MULTIPLE = 0;
Mixin.Subscription.TYPE.EXCLUSIVE = 1;
Mixin.Subscriptions._Subscription = (function() {
  function _Subscription(observable, subscription_type) {
    this.observable = observable;
    this.subscription_type = subscription_type;
    if (Mixin.DEBUG) {
      if ((typeof this.subscription_type !== 'number') || (this.subscription_type < Mixin.Subscription.TYPE.MULTIPLE) || (this.subscription_type > Mixin.Subscription.TYPE.EXCLUSIVE)) {
        throw new Error("Mixin.Subscriptions: Mixin.Subscription.TYPE is invalid");
      }
    }
    this.subscription_links = [];
  }
  _Subscription.prototype.addSubscriber = function(subscriber, notification_callback, options) {
    if (this.subscription_type === Mixin.Subscription.TYPE.EXCLUSIVE) {
      this.removeSubscribers(function(test_subscription) {
        return test_subscription.mustKeepUntilDestroyed();
      });
    }
    return this.subscription_links.push(new Mixin.Subscriptions._SubscriptionLink(this, subscriber, notification_callback, options));
  };
  _Subscription.prototype.removeSubscriber = function(subscriber, notification_callback, subscription_name) {
    var subscription_link;
    subscription_link = _.find(this.subscription_links, function(test) {
      return (subscriber === test.subscriber) && (notification_callback === test.notification_callback);
    });
    if (!subscription_link) {
      throw new Error("Mixin.Subscriptions.removeSubscriber: subscription '" + subscription_name + "' does not exist for '" + (_.classOf(subscriber)) + "'");
    }
    _.remove(this.subscription_links, subscription_link);
    return subscription_link.destroy();
  };
  _Subscription.prototype.subscribers = function(subscribers) {
    var subscription_link, _i, _len, _ref, _results;
    _ref = this.subscription_links;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription_link = _ref[_i];
      _results.push(subscribers.push(subscription_link.subscriber));
    }
    return _results;
  };
  _Subscription.prototype.notifySubscribers = function() {
    var args, subscription_link, _i, _len, _ref, _results;
    args = Array.prototype.slice.call(arguments);
    _ref = this.subscription_links;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription_link = _ref[_i];
      _results.push(subscription_link.notification_callback.apply(subscription_link.subscriber, args));
    }
    return _results;
  };
  _Subscription.prototype.removeSubscribers = function(test_fn) {
    var removed_subscription_links, subscription_link, _i, _j, _len, _len2, _results, _results2;
    if (test_fn) {
      removed_subscription_links = _.select(this.subscription_links, test_fn);
      if (removed_subscription_links.length === 0) {
        return;
      }
      this.subscription_links = _.difference(this.subscription_links, removed_subscription_links);
      _results = [];
      for (_i = 0, _len = removed_subscription_links.length; _i < _len; _i++) {
        subscription_link = removed_subscription_links[_i];
        _results.push(subscription_link.destroy());
      }
      return _results;
    } else {
      removed_subscription_links = this.subscription_links;
      this.subscription_links = [];
      _results2 = [];
      for (_j = 0, _len2 = removed_subscription_links.length; _j < _len2; _j++) {
        subscription_link = removed_subscription_links[_j];
        _results2.push(subscription_link.destroy());
      }
      return _results2;
    }
  };
  _Subscription.prototype.destroy = function() {
    return _.remove(this.subscription_links, void 0, {
      callback: _.disown,
      preclear: true
    });
  };
  return _Subscription;
})();
Mixin.Subscriptions.Observable || (Mixin.Subscriptions.Observable = {});
Mixin.Subscriptions.Observable._mixin_info = {
  mixin_name: 'Observable',
  initialize: function() {
    var arg, _i, _len, _results;
    Mixin.instanceData(this, 'Observable', {
      subscriptions: {},
      is_destroyed: false
    });
    _results = [];
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      _results.push(this.addSubscription.apply(this, _.isArray(arg) ? arg : [arg]));
    }
    return _results;
  },
  destroy: function() {
    var instance_data;
    instance_data = Mixin.instanceData(this, 'Observable');
    if (instance_data.is_destroyed) {
      throw new Error("Mixin.Observable.destroy: already destroyed");
    }
    instance_data.is_destroyed = true;
    return _.remove(instance_data.subscriptions, void 0, {
      callback: _.disown
    });
  },
  mixin_object: {
    hasSubscription: function(subscription_name) {
      var instance_data;
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.hasSubscription', 'subscription_name');
      }
      instance_data = Mixin.instanceData(this, 'Observable');
      return instance_data.subscriptions.hasOwnProperty(subscription_name);
    },
    addSubscription: function(subscription_name, subscription_type) {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'Observable');
      if (subscription_type === void 0) {
        subscription_type = Mixin.Subscription.TYPE.MULTIPLE;
      }
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.addSubscription', 'subscription_name');
        Mixin.Core._Validate.noKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.addSubscription', 'subscription_name');
      }
      instance_data.subscriptions[subscription_name] = new Mixin.Subscriptions._Subscription(this, subscription_type);
      return this;
    },
    subscriptions: function() {
      var instance_data, key, subscriptions, value, _ref;
      instance_data = Mixin.instanceData(this, 'Observable');
      subscriptions = [];
      _ref = instance_data.subscriptions;
      for (key in _ref) {
        value = _ref[key];
        subscriptions.push(key);
      }
      return subscriptions;
    },
    subscribers: function(subscription_name) {
      var instance_data, key, subscribers, subscription, _ref, _ref2;
      subscribers = [];
      instance_data = Mixin.instanceData(this, 'Observable');
      if (subscription_name === void 0) {
        _ref = instance_data.subscriptions;
        for (key in _ref) {
          subscription = _ref[key];
          subscription.subscribers(subscribers);
        }
      } else {
        if (!instance_data.subscriptions.hasOwnProperty(subscription_name)) {
          throw new Error("Mixin.Observable.subscribers: subscriber '" + (_classOf(this)) + "' does not recognize '" + subscription_name + "'");
        }
        _ref2 = instance_data.subscriptions;
        for (key in _ref2) {
          subscription = _ref2[key];
          if (subscription.subscription_name === subscription_name) {
            subscription.subscribers(subscribers);
          }
        }
      }
      return _.uniq(subscribers);
    },
    addSubscriber: function(subscriber, subscription_parameters) {
      var args, check_arg, instance_data, parameter, _doSubscribe, _i, _len;
      instance_data = Mixin.instanceData(this, 'Observable');
      _doSubscribe = function(subscription_name, notification_callback, options) {
        var subscription;
        options || (options = {});
        if (Mixin.DEBUG) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.addSubscriber', 'subscription_name');
          Mixin.Core._Validate.callback(notification_callback, 'Mixin.Observable.addSubscriber', 'notification_callback');
          Mixin.Core._Validate.object(options, 'Mixin.Observable.addSubscriber', 'options');
          if (options.destroy !== void 0) {
            Mixin.Core._Validate.callback(options.destroy, 'Mixin.Observable.addSubscriber', 'options.destroy');
          }
        }
        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.addSubscriber', 'subscription_name');
        subscription = instance_data.subscriptions[subscription_name];
        return subscription.addSubscriber(subscriber, notification_callback, options);
      };
      args = Array.prototype.slice.call(arguments, 1);
      Mixin.Core._Validate.instanceWithMixin(subscriber, 'Subscriber', 'Mixin.Observable.addSubscriber', 'subscriber');
      if (args.length > 1) {
        check_arg = args[1];
        if (!((_.isString(check_arg) && this.hasSubscription(check_arg)) || (_.isArray(check_arg) && (check_arg.length >= 1) && _.isString(check_arg[0]) && this.hasSubscription(check_arg[0])))) {
          _doSubscribe.apply(this, Array.prototype.slice.call(arguments, 1));
          return this;
        }
      }
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        parameter = args[_i];
        if (_.isArray(parameter)) {
          _doSubscribe.apply(this, parameter);
        } else {
          _doSubscribe.apply(parameter);
        }
      }
      return this;
    },
    notifySubscribers: function(subscription_name) {
      var instance_data, subscription;
      instance_data = Mixin.instanceData(this, 'Observable');
      if (instance_data.is_destroyed) {
        return;
      }
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.notifySubscribers', 'subscription_name');
        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.notifySubscribers');
      }
      subscription = instance_data.subscriptions[subscription_name];
      if (!subscription) {
        return;
      }
      subscription.notifySubscribers.apply(subscription, Array.prototype.slice.call(arguments, 1));
      return this;
    },
    removeSubscriber: function(subscriber, subscription_name, notification_callback) {
      var args, check_arg, instance_data, parameter, _doUnsubscribe, _i, _len;
      instance_data = Mixin.instanceData(this, 'Observable');
      _doUnsubscribe = function(subscription_name, notification_callback) {
        var subscription;
        if (Mixin.DEBUG) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.removeSubscriber', 'subscription_name');
          Mixin.Core._Validate.callback(notification_callback, 'Mixin.Observable.removeSubscriber', 'notification_callback');
        }
        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.removeSubscriber', 'subscription_name');
        subscription = instance_data.subscriptions[subscription_name];
        return subscription.removeSubscriber(subscriber, notification_callback, subscription_name);
      };
      args = Array.prototype.slice.call(arguments, 1);
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.instanceWithMixin(subscriber, 'Subscriber', 'Mixin.Observable.removeSubscriber', 'subscriber');
      }
      if (args.length > 1) {
        check_arg = args[1];
        if (!((_.isString(check_arg) && this.hasSubscription(check_arg)) || (_.isArray(check_arg) && (check_arg.length >= 1) && _.isString(check_arg[0]) && this.hasSubscription(check_arg[0])))) {
          _doUnsubscribe.apply(this, Array.prototype.slice.call(arguments, 1));
          return this;
        }
      }
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        parameter = args[_i];
        if (_.isArray(parameter)) {
          _doUnsubscribe.apply(this, parameter);
        } else {
          _doUnsubscribe.apply(parameter);
        }
      }
      return this;
    },
    removeSubscribers: function(subscription_name, test_fn) {
      var instance_data, key, subscription, _ref;
      instance_data = Mixin.instanceData(this, 'Observable');
      if (Mixin.DEBUG) {
        if (subscription_name !== void 0) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.removeSubscribers', 'subscription_name');
          Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.removeSubscribers');
        }
        if (test_fn !== void 0) {
          Mixin.Core._Validate.callback(test_fn, 'Mixin.Observable.removeSubscribers', 'test_fn');
        }
      }
      if (subscription_name) {
        subscription = instance_data.subscriptions[subscription_name];
        if (!subscription) {
          return;
        }
        subscription.removeSubscribers(test_fn);
      } else {
        _ref = instance_data.subscriptions;
        for (key in _ref) {
          subscription = _ref[key];
          subscription.removeSubscribers(test_fn);
        }
      }
      return this;
    }
  }
};
Mixin.Subscriptions.Subscriber || (Mixin.Subscriptions.Subscriber = {});
Mixin.Subscriptions.Subscriber._mixin_info = {
  mixin_name: 'Subscriber',
  initialize: function() {
    return Mixin.instanceData(this, 'Subscriber', {
      subscription_backlinks: [],
      is_destroyed: false
    });
  },
  destroy: function() {
    var instance_data;
    instance_data = Mixin.instanceData(this, 'Subscriber');
    if (instance_data.is_destroyed) {
      throw new Error("Mixin.Subscriber.destroy: already destroyed");
    }
    instance_data.is_destroyed = true;
    return _.remove(instance_data.subscription_backlinks, void 0, {
      callback: _.disown,
      preclear: true
    });
  },
  mixin_object: {
    observables: function(subscription_name) {
      var instance_data, obserables, subscription_link, _i, _j, _len, _len2, _ref, _ref2;
      instance_data = Mixin.instanceData(this, 'Subscriber');
      obserables = [];
      if (subscription_name === void 0) {
        _ref = instance_data.subscription_backlinks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subscription_link = _ref[_i];
          if (subscription_link.subscription && (subscription_link.subscription.subscription_name === subscription_name)) {
            obserables.push(subscription_link.subscription.observable);
          }
        }
      } else {
        if (Mixin.DEBUG) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Subscriptions.observables', 'subscription_name');
        }
        _ref2 = instance_data.subscription_backlinks;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          subscription_link = _ref2[_j];
          if (subscription_link.subscription) {
            obserables.push(subscription_link.subscription.observable);
          }
        }
      }
      return _.uniq(obserables);
    }
  }
};
Mixin.Subscriptions.ObservableSubscriber || (Mixin.Subscriptions.ObservableSubscriber = {});
Mixin.Subscriptions.ObservableSubscriber._mixin_info = {
  mixin_name: 'ObservableSubscriber',
  mixin_object: {},
  initialize: function() {
    return Mixin["in"](this, 'Subscriber', ['Observable'].concat(Array.prototype.slice.call(arguments)));
  },
  destroy: function() {
    return Mixin.out(this, 'Subscriber', 'Observable');
  }
};
Mixin.registerMixin(Mixin.Subscriptions.Observable._mixin_info);
Mixin.registerMixin(Mixin.Subscriptions.Subscriber._mixin_info);
Mixin.registerMixin(Mixin.Subscriptions.ObservableSubscriber._mixin_info);