// Underscore-Awesomer.js 1.0.1
// (c) 2011 Kevin Malakoff.
// Underscore-Awesomer is freely distributable under the MIT license.
// Underscore-Awesomer are extensions to the Underscore library: http://documentcloud.github.com/underscore
// https://github.com/kmalakoff/underscore-awesomer
//
// Note: some code from Underscore.js is repeated in this file.
// Please see the following for details on Underscore.js and its licensing:
//   https://github.com/documentcloud/underscore
//   https://github.com/documentcloud/underscore/blob/master/LICENSE

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `root` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  if (!root._) throw new Error("Underscore-Awesomer.js requires Underscore.js...please include it before this file.");

  // Create a safe reference to the Underscore object for use below.
  var _ = root._;

  // Dude, the current version is awesome!
  _.AWESOMENESS = '1.0.1';

  // Modifications to Underscore
  // --------------------

  // Convenience version of a common use case of `map`: fetching a property.
  // Optionally removes all copied values from the source if you provide a remove parameter.
  _.pluck = function(obj, key, remove) {
    return remove ? _.map(obj, function(value) { var val = value[key]; delete value[key]; return val; }) :
      _.map(obj, function(value){ return value[key]; });
  };

  // Collection Functions
  // --------------------

  // Removes an value from a collection (array or object).
  // If the matcher is a function, it removes and returns all values that match.
  // If the matcher is an array, it removes and returns all values that match.
  // If the matcher is void 0, it removes and returns all values.
  // If the collection is an object and the matcher is a key, it removes and return the value for that key (unless the 'is\_value' option is provided).
  // Otherwise, it removes and return the value if it finds it.
  // <br/>**Options:**<br/>
  // * `callback` - if you provide a callback, it calls it with the removed value after the value is removed from the collection. Note: if the options are a function, it is set as the callback.<br/>
  // * `values` - used to disambigate between a key or value when removing from a collection that is an object.<br/>
  // * `first_only` - if you provide a first_only flag, it will stop looking for an value when it finds one that matches.<br/>
  // * `preclear` - if you provide a preclear flag, it will clone the passed object, remove all the values, and then remove from the cloned object.
  _.remove = function(obj, matcher, options) {
    if (_.isEmpty(obj)) return (!matcher || _.isFunction(matcher)) ? [] : void 0;
    options || (options = {});
    if (_.isFunction(options)) options = {callback:options};

    // Clone and clear the passed collection before removing. Useful if a callback uses the passed collection.
    var key;
    if (options.preclear) {
      var original_object = obj;
      obj = _.clone(obj);
      if (_.isArray(original_object)) { original_object.length=0; }
      else { for(key in original_object) delete original_object[key]; }
    }

    var removed = [], matcher_value, i, l, single_value=false;
    // Array collection
    if (_.isArray(obj)) {
      // Array: remove and return all values (returns: array of values)
      if (_.isUndefined(matcher)) { removed = _.keys(obj); }

      // Array: remove and return all values passing matcher function test (returns: array of values) or if first_only option, only the first one (returns: value or void 0)
      else if (_.isFunction(matcher)) {
        if (options.first_only) { single_value=true; _.find(obj, function(value, index) { if (matcher(value)) { removed.push(index); return true; } return false; }); }
        else { _.each(obj, function(value, index) { if (matcher(value)) { removed.push(index); } } ); }
      }
      // Array: remove and return all values in the matcher array (returns: array of values)
      else if (_.isArray(matcher)) {
        if (options.first_only) {
          single_value=true;
          var removed_index;
          for (i = matcher.length - 1; i >= 0; i--) {
            matcher_value = matcher[i]; removed_index=-1;
            _.find(obj, function(value, index) { if (matcher_value===value) { removed.push(index); return true; } return false; });
          }
        }
        else {
          for (i = matcher.length - 1; i >= 0; i--) {
            matcher_value = matcher[i];
            _.each(obj, function(value, index) { if (matcher_value===value) { removed.push(index); } } );
          }
        }
      }
      // Array: remove all matching values (returns: array of values) or if first_only option, only the first one (returns: value or void 0).
      else {
        if (options.first_only) { single_value=true; i = _.indexOf(obj, matcher); if (i>=0) removed.push(i); }
        // Array: remove all matching values (array return type).
        else { single_value=true; _.each(obj, function(value, index) { if (matcher===value) { removed.push(index); } } ); }
      }

      // Process the removed values if they exist
      var value;
      if (single_value) {
        if (removed.length) {
          var value_count = 0;
          value = obj[removed[0]];
          removed = removed.sort(function(left, right) { return _.compare(left, right); });
          while (removed.length) {
            value_count++; obj.splice(removed.pop(), 1);
          }
          if (options.callback) { while(value_count>0) { options.callback(value); value_count--; } }
          return value;
        }
        else return void 0;
      }
      else {
        if (removed.length) {
          var values = [], index;
          removed = removed.sort(function(left, right) { return _.compare(left, right); });
          while (removed.length) {
            index = removed.pop(); values.unshift(obj[index]); obj.splice(index, 1);
          }
          if (options.callback) { _.each(values, function(value) { options.callback(value); } ); }
          return _.uniq(values);
        }
        else return [];
      }
    }

    // Object collection
    else {
      var ordered_keys;
      // Object: remove all values (returns: object with keys and values)
      if (_.isUndefined(matcher)) { removed = _.keys(obj); }

      // Object: remove and return all values passing matcher function test (returns: object with keys and values)
      else if (_.isFunction(matcher)) { for (key in obj) { if (matcher(obj[key], key)) removed.push(key); } }

      // Object: remove and return all values by key or by value
      else if (_.isArray(matcher)) {
        // The matcher array contains values (returns: object with keys and values)
        if (options.values) {
          for (i = 0, l = matcher.length; i < l; i++) {
            matcher_value = matcher[i];
            if (options.first_only) { for (key in obj) { if (matcher_value===obj[key]) { removed.push(key); break; } } }
            else { for (key in obj) { if (matcher_value===obj[key]) { removed.push(key); } } }
          }
        }
        // The matcher array contains keys (returns: array of values)
        else {
          ordered_keys = matcher;
          var matcher_key;
          for (i = 0, l = matcher.length; i < l; i++) {
            matcher_key = matcher[i];
            if (obj.hasOwnProperty(matcher_key)) { removed.push(matcher_key); }
          }
        }
      }
      // Object: remove value matching a key (value or void 0 return type)
      else if (_.isString(matcher) && !options.values) {
        single_value = true; ordered_keys = [];
        if (obj.hasOwnProperty(matcher)) { ordered_keys.push(matcher); removed.push(matcher); }
      }
      // Object: remove matching value (array return type)
      else {
        for (key in obj) { if (matcher===obj[key]) { removed.push(key); } }
      }

      // Process the removed values if they exist
      var result;
      if (ordered_keys) {
        if (ordered_keys.length) {
          result = [];
          while (removed.length) {
            key = removed.shift(); result.push(obj[key]); delete obj[key];
          }
          if (options.callback) { _.each(result, function(value, index) { options.callback(value, ordered_keys[index]); } ); }
          return single_value ? result[0] : result;
        }
        else return single_value ? void 0 : [];
      }
      else {
        if (removed.length) {
          result = {};
          while (removed.length) {
            key = removed.shift(); result[key] = obj[key]; delete obj[key];
          }
          if (options.callback) { _.each(result, function(value, key) { options.callback(value, key); } ); }
          return result;
        }
        else return {};
      }
    }
  };

  // Array Functions
  // ---------------

  // Finds an index of an item using a testing function.
  _.findIndex = function(array, fn) {
    for (i = 0, l = array.length; i < l; i++) { if (fn(array[i])) return i; }
    return -1;
  };

  // Object Functions
  // ----------------

  // Does the dot-delimited or array of keys path to a value exist.
  _.hasKeypath = _.keypathExists = function(object, keypath) {
    return !!_.keypathValueOwner(object, keypath);
  };

  // Finds the object that has or 'owns' the value if a dot-delimited or array of keys path to a value exists.
  _.keypathValueOwner = function(object, keypath) {
    var keypath_components = _.isString(keypath) ? keypath.split('.') : keypath;
    if (keypath_components.length===1) return ((object instanceof Object) && (keypath in object)) ? object : void 0; // optimization
    var key, current_object = object;
    for (var i = 0, l = keypath_components.length; i < l;) {
      key = keypath_components[i];
      if (!(key in current_object)) break;
      if (++i === l) return current_object;
      current_object = current_object[key];
      if (!current_object || !(current_object instanceof Object)) break;
    }
    return void 0;
  };

  // Gets (if value parameter void 0) or sets a value if a dot-delimited or array of keys path exists.
  _.keypath = function(object, keypath, value) {
    var keypath_components = _.isString(keypath) ? keypath.split('.') : keypath;
    var value_owner = _.keypathValueOwner(object, keypath_components);
    if (_.isUndefined(value)) {
      if (!value_owner) return void 0;
      return value_owner[keypath_components[keypath_components.length-1]];
    }
    else {
      if (!value_owner) return;
      value_owner[keypath_components[keypath_components.length-1]] = value;
      return value_owner[keypath_components[keypath_components.length-1]];
    }
  };

  // Create a duplicate of a container of objects to any zero-indexed depth.
  _.cloneToDepth = _.containerClone = _.clone = function(obj, depth) {
    if (!obj || (typeof obj !== 'object')) return obj;  // by value
    var clone;
    if (_.isArray(obj)) clone = Array.prototype.slice.call(obj);
    else if (obj.constructor!=={}.constructor) return obj; // by reference
    else clone = _.extend({}, obj);
    if (!_.isUndefined(depth) && (depth > 0)) {
      for (var key in clone) {
        clone[key] = _.clone(clone[key], depth-1);
      }
    }
    return clone;
  };

  // Create a duplicate of all objects to any zero-indexed depth.
  _.deepClone = function(obj, depth) {
    if (!obj || (typeof obj !== 'object')) return obj;  // by value
    else if (_.isString(obj)) return String.prototype.slice.call(obj);
    else if (_.isDate(obj)) return new Date(obj.valueOf());
    else if (_.isFunction(obj.clone)) return obj.clone();
    var clone;
    if (_.isArray(obj)) clone = Array.prototype.slice.call(obj);
    else if (obj.constructor!=={}.constructor) return obj; // by reference
    else clone = _.extend({}, obj);
    if (!_.isUndefined(depth) && (depth > 0)) {
      for (var key in clone) {
        clone[key] = _.deepClone(clone[key], depth-1);
      }
    }
    return clone;
  };

  // Is a given value a constructor?<br/>
  // **Note: this is not guaranteed to work because not all constructors have a name property.**
  _.isConstructor = function(obj) {
    return (_.isFunction(obj) && obj.name);
  };

  // Returns the class constructor (function return type) using a string, keypath or constructor.
  _.resolveConstructor = function(key) {
    var keypath_components = _.isArray(key) ? key : (_.isString(key) ? key.split('.') : void 0);

    if (keypath_components) {
      var constructor = (keypath_components.length===1) ? root[keypath_components[0]] : _.keypath(root, keypath_components);
      return (constructor && _.isConstructor(constructor)) ? constructor : void 0;
    }
    else if (_.isFunction(key) && _.isConstructor(key)) {
      return key;
    }
    return void 0;
  };

  // Determines whether a conversion is possible checking typeof, instanceof, is{SomeType}(), to{SomeType}() using a string, keypath or constructor..
  // Convention for is{SomeType}(), to{SomeType}() with namespaced classes is to remove the namespace (like Javascript does).<br/>
  // **Note: if you pass a constructor, the name property may not exist so use a string if you are relying on is{SomeType}(), to{SomeType}().**
  _.CONVERT_NONE = 0;
  _.CONVERT_IS_TYPE = 1;
  _.CONVERT_TO_METHOD = 2;
  _.conversionPath = function(obj, key) {
    var keypath_components = _.isArray(key) ? key : (_.isString(key) ? key.split('.') : void 0);

    // Built-in type
    var obj_type = typeof(obj), check_name = keypath_components ? keypath_components[keypath_components.length-1] : void 0;
    if (keypath_components && (obj_type === check_name)) return _.CONVERT_IS_TYPE;

    // Resolved a constructor and object is an instance of it.
    var construtor = _.resolveConstructor(keypath_components ? keypath_components : key);
    if (construtor && (obj_type == 'object')) { try { if (obj instanceof construtor) return _.CONVERT_IS_TYPE; } catch (_e) {} }
    check_name = (construtor && construtor.name) ? construtor.name : check_name;
    if (!check_name) return _.CONVERT_NONE;

    // Try the conventions: is{SomeType}(), to{SomeType}()
    if (_['is'+check_name] && _['is'+check_name](obj)) return _.CONVERT_IS_TYPE;
    else if ((obj_type == 'object') && obj['to'+check_name]) return _.CONVERT_TO_METHOD;
    return _.CONVERT_NONE;
  };

  // Helper to checks if a conversion is available including being the actual type
  _.isConvertible = function(obj, key) {
    return (_.conversionPath(obj, key)>0);
  };

  // Converts from one time to another using a string, keypath or constructor if it can find a conversion path.
  _.toType = function(obj, key) {
    var keypath_components = _.isArray(key) ? key : (_.isString(key) ? key.split('.') : void 0);

    switch (_.conversionPath(obj, keypath_components ? keypath_components : key)) {
      /*_.CONVERT_IS_TYPE*/   case 1: return obj;
      /*_.CONVERT_TO_METHOD*/ case 2:
        if (keypath_components) {
          return obj['to'+keypath_components[keypath_components.length-1]]();
        }
        else {
          var constructor = _.resolveConstructor(key);
          return (constructor && constructor.name) ? obj['to'+constructor.name]() : void 0;
        }
    }
    return void 0;
  };

  // Checks if a function exists on an object.
  _.functionExists = function(object, function_name) {
    return (object instanceof Object) && object[function_name] && _.isFunction(object[function_name]);
  };

  // Call a function if it exists on an object.
  _.callIfExists = function(object, function_name) {
    return _.functionExists(object, function_name) ? object[function_name].apply(object, Array.prototype.slice.call(arguments, 2)) : void 0;
  };

  // Get a specific super class function if it exists. Can be useful when dynamically updating a hierarchy.
  _.getSuperFunction = function(object, function_name) {
    var value_owner = _.keypathValueOwner(object, ['constructor','__super__',function_name]);
    return (value_owner && _.isFunction(value_owner[function_name])) ? value_owner[function_name] : void 0;
  };

  // Call a specific super class function with trailing arguments if it exists.
  _.superCall = function(object, function_name) {
    return _.superApply(object, function_name, Array.prototype.slice.call(arguments, 2));
  };

  // Call a specific super class function with an arguments list if it exists.
  _.superApply = function(object, function_name, args) {
    var super_function = _.getSuperFunction(object, function_name);
    return super_function ? super_function.apply(object, args) : void 0;
  };

  // Returns the class of an object, if it exists.<br/>
  // **Note: this is not guaranteed to work because not all constructors have a name property.**
  _.classOf = function(obj) {
    return (obj!=null && Object.getPrototypeOf(Object(obj)).constructor.name) || void 0;
  };

  // Copy selected properties from the source to the destination.
  // Optionally removes copied values from the source if you provide a remove parameter.
  _.copyProperties = function(destination, source, keys, remove) {
    var key, source_keys = keys || _.keys(source);
    var copied_something = false;
    for (var i = 0, l = source_keys.length; i < l; i++) {
      key = source_keys[i];
      if (hasOwnProperty.call(source, key)) {
        destination[key] = source[key]; copied_something = true;
        if (remove) delete source[key];
      }
    }
    return copied_something;
  };

  // Get a value and if it does not exist, return the missing_value.
  // Optionally remove the value if you provide a remove parameter.
  _.getValue = function(obj, key, missing_value, remove) {
    if (hasOwnProperty.call(obj, key)) {
      if (!remove) return obj[key];
      var value = obj[key]; delete obj[key]; return value;
    }
    else return missing_value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return _.compare(a,b);
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      _.compare(iterator(array[mid]), iterator(obj))==_.COMPARE_ASCENDING ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Maps simple comparison operators (< or ===) or custom comparison functions
  // (such as localeCompare) to standardized comparison results.
  _.COMPARE_EQUAL = 0;
  _.COMPARE_ASCENDING = -1;
  _.COMPARE_DESCENDING = 1;
  _.compare = function(value_a, value_b, function_name) {
    // Non-object compare just comparing raw values
    if (typeof(value_a) !== 'object') return (value_a === value_b) ? _.COMPARE_EQUAL : (value_a < value_b) ? _.COMPARE_ASCENDING : _.COMPARE_DESCENDING;

    // Use a compare function, if one exists
    if (!function_name) function_name = 'compare';
    var result;
    if (value_a[function_name] && _.isFunction(value_a[function_name])) {
      result = value_a[function_name](value_b);
      return (result === 0) ? _.COMPARE_EQUAL : (result < 0) ? _.COMPARE_ASCENDING : _.COMPARE_DESCENDING;
    }
    else if (value_b[function_name] && _.isFunction(value_b[function_name])) {
      result = value_b[function_name](value_a);
      return (result === 0) ? _.COMPARE_EQUAL : (result < 0) ? _.COMPARE_DESCENDING : _.COMPARE_ASCENDING;
    }
    return (value_a === value_b) ? _.COMPARE_EQUAL : (value_a < value_b) ? _.COMPARE_ASCENDING : _.COMPARE_DESCENDING;
  };

  // Deduces the type of ownership of an item and if available, it retains it (reference counted) or clones it.
  // <br/>**Options:**<br/>
  // * `properties` - used to disambigate between owning an object and owning _.each property.<br/>
  // * `share_collection` - used to disambigate between owning a collection's items (share) and cloning a collection (don't share).
  // * `prefer_clone` - used to disambigate when both retain and clone exist. By default retain is prefered (eg. sharing for lower memory footprint).
  _.own = function(obj, options) {
    if (!obj || (typeof(obj)!='object')) return obj;
    options || (options = {});
    if (_.isArray(obj)) {
      if (options.share_collection) { _.each(obj, function(value) { _.own(value, {prefer_clone: options.prefer_clone}); }); return obj; }
      else { var a_clone =  []; _.each(obj, function(value) { a_clone.push(_.own(value, {prefer_clone: options.prefer_clone})); }); return a_clone; }
    }
    else if (options.properties) {
      if (options.share_collection) { _.each(obj, function(value, key) { _.own(value, {prefer_clone: options.prefer_clone}); }); return obj; }
      else { var o_clone = {}; _.each(obj, function(value, key) { o_clone[key] = _.own(value, {prefer_clone: options.prefer_clone}); }); return o_clone; }
    }
    else if (obj.retain) {
      if (options.prefer_clone && obj.clone) return obj.clone();
      else obj.retain();
    }
    else if (obj.clone) return obj.clone();
    return obj;
  };

  // Deduces the type of ownership of an item and if available, it releases it (reference counted) or destroys it.
  // <br/>**Options:**<br/>
  // * `properties` - used to disambigate between owning an object and owning _.each property.<br/>
  // * `clear_values` - used to disambigate between clearing disowned items and removing them (by default, they are removed).
  // * `remove_values` - used to indicate that the values should be disowned and removed from the collections.
  _.disown = function(obj, options) {
    if (!obj || (typeof(obj)!='object')) return obj;
    options || (options = {});
    if (_.isArray(obj)) {
      if (options.clear_values) { _.each(obj, function(value, index) { _.disown(value, {clear_values: options.clear_values}); obj[index]=null; }); return obj; }
      else {
        _.each(obj, function(value) { _.disown(value, {remove_values: options.remove_values}); });
        if (options.remove_values) {obj.length=0;}
        return obj;
      }
    }
    else if (options.properties) {
      if (options.clear_values) { _.each(obj, function(value, key) { _.disown(value, {clear_values: options.clear_values}); obj[key]=null; }); return obj; }
      else {
        _.each(obj, function(value) { _.disown(value, {remove_values: options.remove_values}); });
        if (options.remove_values) {for(key in obj) { delete obj[key]; }}
        return obj;
      }
    }
    else if (obj.release) obj.release();
    else if (obj.destroy) obj.destroy();
    return obj;
  };

  // JSON Functions
  // -----------------

  // Convert an array of objects or an object to JSON using the convention that if an
  // object has a toJSON function, it will use it rather than the raw object.
  // <br/>**Options:**<br/>
  //* `properties` - used to disambigate between owning a collection's items and cloning a collection.
  //* `included` - can provide an array to include values or keys.
  //* `excluded` - can provide an array to exclude values or keys.
  _.toJSON = function(obj, options) {
    // Simple type - exit quickly
    if (!obj || (typeof(obj)!=='object')) return obj;

    options||(options={});
    var result;
    if (_.isArray(obj)) {
      if (options.included) {
        var items;
        if (options.excluded) items = _.difference(options.included, options.excluded);
        else items = options.included;
        result = {};
        _.each(items, function(item) { if (_.contains(obj, item)) result.push(_.toJSON(item)); });
        return result;
      }
      else if (options.excluded) {
        result = [];
        _.each(obj, function(value) { if (!_.contains(options.excluded, value)) result.push(_.toJSON(value)); });
        return result;
      }
      else {
        result = [];
        _.each(obj, function(value) { result.push(_.toJSON(value)); });
        return result;
      }
    }
    else {
      if(obj.toJSON) return obj.toJSON();
      else if(options.properties) {
        if (options.included) {
          var keys;
          if (options.excluded) keys = _.difference(options.included, options.excluded);
          else keys = options.included;
          result = {};
          _.each(keys, function(key) { if (obj.hasOwnProperty(key)) result[key] = _.toJSON(obj[key]); });
          return result;
        }
        else if (options.excluded) {
          result = {};
          _.each(obj, function(value, key) { if (!_.contains(options.excluded, key)) result[key] = _.toJSON(value); });
          return result;
        }
        else {
          result = {};
          _.each(obj, function(value, key) { result[key] = _.toJSON(value); });
          return result;
        }
      }
    }

    return obj;
  };

  // Deserialized an array of JSON objects or _.each object individually using the following conventions:
  // 1) if JSON has a recognized type identifier ('\_type' as default), it will try to create an instance.
  // 2) if the class refered to by the type identifier has a parseJSON function, it will try to create an instance.
  // <br/>**Options:**<br/>
  //* `type_field` - the default is '\_type' but you can choose any field name to trigger the search for a parseJSON function.<br/>
  //* `properties` - used to disambigate between owning a collection's items and cloning a collection.
  //* `skip_type` - skip a type check. Useful for if your model is already deserialized and you want to deserialize your properties. See Backbone.Articulation for an example.
  // <br/>**Global settings:**<br/>
  //* `_.PARSE_JSON_TYPE_FIELD` - the field key in the serialized JSON that is used for constructor lookup.<br/>
  //* `_.PARSE_JSON_CONSTRUCTOR_ROOTS` - the array of roots that are used to find the constructor. Useful for reducing global namespace pollution<br/>
  _.PARSE_JSON_TYPE_FIELD = '_type';
  _.PARSE_JSON_CONSTRUCTOR_ROOTS = [root];
  _.parseJSON = function(obj, options) {
    var obj_type = typeof(obj);

    // Simple type - exit quickly
    if ((obj_type!=='object') && (obj_type!=='string')) return obj;

    // The object is still a JSON string, convert to JSON
    if ((obj_type==='string') && obj.length && ((obj[0] === '{')||(obj[0] === '['))) {
      try { var obj_as_JSON = JSON.parse(obj); if (obj_as_JSON) obj = obj_as_JSON; }
      catch (_e) {throw new TypeError("Unable to parse JSON: " + obj);}
    }

    // Parse an array
    var result;
    if (_.isArray(obj)) {
      result = [];
      _.each(obj, function(value) { result.push(_.parseJSON(value, type_field)); });
      return result;
    }

    // Use the type field
    options||(options={}); 
    var type_field = (options.type_field) ? options.type_field : _.PARSE_JSON_TYPE_FIELD;
    if (options.skip_type || !(obj instanceof Object) || !obj.hasOwnProperty(type_field)) {
      // Parse the properties individually
      if(options.properties) {
        result = {};
        _.each(obj, function(value, key) { result[key] = _.parseJSON(value, type_field); });
        return result;
      }
      else return obj;
    }

    // Find and use the parseJSON function
    var type = obj[type_field];
    var current_root, instance;

    // Try searching in the available namespaces
    for (var i=0, l=_.PARSE_JSON_CONSTRUCTOR_ROOTS.length; i<l;i++) {
      current_root = _.PARSE_JSON_CONSTRUCTOR_ROOTS[i];
      constructor_or_root = _.keypath(current_root, type);
      if (constructor_or_root) {
        // class/root parse function
        if (_.isFunction(constructor_or_root.parseJSON)) return constructor_or_root.parseJSON(obj);
        // instance parse function (Backbone.Model and Backbone.Collection style)
        else if (constructor_or_root.prototype && _.isFunction(constructor_or_root.prototype.parse)) {
          instance = new constructor_or_root();
          if (_.isFunction(instance.set)) return instance.set(instance.parse(obj));
          else return instance.parse(obj);
        }
      }
    }

    throw new TypeError("Unable to find a parseJSON function for type: " + type);
  };

  // Add all of the Underscore functions to the previous underscore object.
  _.mixin({
    AWESOMENESS: _.AWESOMENESS,

    // Modifications to Underscore
    // --------------------
    pluck: _.pluck,

    // Collection Functions
    // ----------------
    remove: _.remove,

    // Array Functions
    // ----------------
    findIndex: _.findIndex,

    // Object Functions
    // ----------------
    hasKeypath: _.hasKeypath,
    keypathExists: _.keypathExists,
    keypathValueOwner: _.keypathValueOwner,
    keypath: _.keypath,
    cloneToDepth: _.cloneToDepth,
    clone: _.clone,

    isConstructor: _.isConstructor,
    resolveConstructor: _.resolveConstructor,
    CONVERT_NONE: _.CONVERT_NONE,
    CONVERT_IS_TYPE: _.CONVERT_IS_TYPE,
    CONVERT_TO_METHOD: _.CONVERT_TO_METHOD,
    conversionPath: _.conversionPath,
    isConvertible: _.isConvertible,
    conversionPath: _.conversionPath,
    toType: _.toType,

    functionExists: _.functionExists,
    callIfExists: _.callIfExists,
    getSuperFunction: _.getSuperFunction,
    superCall: _.superCall,
    superApply: _.superApply,
    classOf: _.classOf,

    copyProperties: _.copyProperties,
    getValue: _.getValue,

    COMPARE_EQUAL: _.COMPARE_EQUAL,
    COMPARE_ASCENDING: _.COMPARE_ASCENDING,
    COMPARE_DESCENDING: _.COMPARE_DESCENDING,
    compare: _.compare,

    own: _.own,
    disown: _.disown,

    // JSON Functions
    // -----------------
    toJSON: _.toJSON,
    parseJSON: _.parseJSON

  });

})();
