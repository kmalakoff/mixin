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