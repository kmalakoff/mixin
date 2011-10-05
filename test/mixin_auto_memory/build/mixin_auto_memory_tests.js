var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).ready(function() {
  module("Mixin.AutoMemory");
  test("TEST DEPENDENCY MISSING", function() {
    _.VERSION;
    _.AWESOMENESS.Underscore_Awesome;
    return Mixin.AutoMemory.AutoMemory;
  });
  test("Use case: autoProperty common usage", function() {
    var $el, AutoPropertyByArray, AutoPropertyByKeypath, AutoPropertyByKeypathWithFunction, AutoPropertyCommon, SomeProperty, embedded1_embedded, embedded2_embedded, instance, some_property_destroy_count;
    some_property_destroy_count = 0;
    SomeProperty = (function() {
      function SomeProperty() {}
      SomeProperty.prototype.destroy = function() {
        return some_property_destroy_count++;
      };
      return SomeProperty;
    })();
    AutoPropertyCommon = (function() {
      function AutoPropertyCommon() {
        Mixin["in"](this, 'AutoMemory');
        this.hello = new SomeProperty();
        this.autoProperty('hello', 'destroy');
        this.$el = null;
        this.autoProperty('$el', 'remove');
        this.render();
      }
      AutoPropertyCommon.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      AutoPropertyCommon.prototype.render = function() {
        return this.$el = $('<div id="hello"></div>').appendTo($('body'));
      };
      return AutoPropertyCommon;
    })();
    instance = new AutoPropertyCommon();
    ok(!!instance.hello, "instance.hello exists");
    ok(!!instance.$el, "instance.$el exists");
    $el = $('body').children('div#hello');
    equal($el[0], instance.$el[0], "element was found in the DOM");
    instance.destroy();
    ok(!instance.hello, "instance.hello does not exist");
    ok(!instance.$el, "instance.$el does not exist");
    $el = $('body').children('div#hello');
    equal($el.length, 0, "element was not found in the DOM");
    AutoPropertyByArray = (function() {
      function AutoPropertyByArray() {
        Mixin["in"](this, 'AutoMemory');
        this.you = 'you';
        this.are = 'are';
        this.here = 'here';
        this.autoProperty(['you', 'are', 'here']);
      }
      AutoPropertyByArray.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoPropertyByArray;
    })();
    instance = new AutoPropertyByArray();
    ok(instance.you && instance.are && instance.here, "you are here");
    instance.destroy();
    ok(!(instance.you && instance.are && instance.here), "you are not here");
    AutoPropertyByKeypath = (function() {
      function AutoPropertyByKeypath() {
        Mixin["in"](this, 'AutoMemory');
        this.embedded = new AutoPropertyByArray();
        this.autoProperty(['embedded.you', 'embedded.are', 'embedded.here']);
      }
      AutoPropertyByKeypath.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoPropertyByKeypath;
    })();
    instance = new AutoPropertyByKeypath();
    ok(instance.embedded.you && instance.embedded.are && instance.embedded.here, "keypath: you are here");
    instance.destroy();
    ok(!(instance.embedded.you && instance.embedded.are && instance.embedded.here), "keypath: you are not here");
    AutoPropertyByKeypathWithFunction = (function() {
      function AutoPropertyByKeypathWithFunction() {
        Mixin["in"](this, 'AutoMemory');
        this.embedded1 = new AutoPropertyByKeypath();
        this.embedded2 = new AutoPropertyByKeypath();
        this.autoProperty(['embedded1.embedded', 'destroy'], [
          'embedded2.embedded', (function(embedded2, param1, param2) {
            embedded2.destroy();
            equal(param1, 'test_param1', 'test_param1');
            return equal(param2, 'test_param2', 'test_param2');
          }), 'test_param1', 'test_param2'
        ]);
      }
      AutoPropertyByKeypathWithFunction.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoPropertyByKeypathWithFunction;
    })();
    instance = new AutoPropertyByKeypathWithFunction();
    embedded1_embedded = instance.embedded1.embedded;
    embedded2_embedded = instance.embedded2.embedded;
    ok(instance.embedded1.embedded.you && instance.embedded1.embedded.are && instance.embedded1.embedded.here, "keypath embedded1: you are here");
    ok(instance.embedded2.embedded.you && instance.embedded2.embedded.are && instance.embedded2.embedded.here, "keypath embedded2: you are here");
    instance.destroy();
    ok(!(instance.embedded1.embedded && instance.embedded2.embedded), "keypath embedded: embedded1.embedded and embedded2.embedded were cleared");
    ok(!(embedded1_embedded.you && embedded1_embedded.are && embedded1_embedded.here), "keypath embedded1_embedded: you are not here");
    return ok(!(embedded2_embedded.you && embedded2_embedded.are && embedded2_embedded.here), "keypath embedded2_embedded: you are not here");
  });
  test("autoProperty valid and invalid", function() {
    var AutoProperty, AutoWrappedPropertyByArray, SomeProperty, instance, prop_2_cleared, some_property_destroy_count, some_property_param1, some_property_param2;
    AutoProperty = (function() {
      function AutoProperty() {
        Mixin["in"](this, 'AutoMemory');
      }
      AutoProperty.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoProperty;
    })();
    instance = new AutoProperty();
    instance.prop1 = 'Hello';
    instance.autoProperty('prop1');
    prop_2_cleared = false;
    instance.prop2 = 'World';
    instance.autoProperty('prop2', function(prop2) {
      if (prop2 === instance.prop2) {
        return prop_2_cleared = true;
      }
    });
    instance.prop3 = $('<div></div>');
    instance.autoProperty('prop3');
    instance.prop4 = null;
    instance.autoProperty('prop4');
    instance.destroy();
    equal(instance.prop1, null, "instance.prop1 cleared");
    equal(instance.prop2, null, "instance.prop2 cleared");
    equal(prop_2_cleared, true, "instance.prop2 cleared true");
    equal(instance.prop3, null, "instance.prop3 cleared - breaking DOM reference");
    equal(instance.prop4, null, "instance.prop4 ignored");
    some_property_destroy_count = 0;
    some_property_param1 = void 0;
    some_property_param2 = void 0;
    SomeProperty = (function() {
      function SomeProperty() {}
      SomeProperty.prototype.destroy = function() {
        return some_property_destroy_count++;
      };
      SomeProperty.prototype.destroy_with_params = function(param1, param2) {
        some_property_destroy_count++;
        some_property_param1 = param1;
        return some_property_param2 = param2;
      };
      return SomeProperty;
    })();
    instance = new AutoProperty();
    instance.some_prop1 = new SomeProperty();
    instance.autoProperty('some_prop1', 'destroy');
    instance.some_prop2 = new SomeProperty();
    instance.autoProperty('some_prop2', 'destroy');
    instance.some_prop3 = new SomeProperty();
    instance.autoProperty('some_prop3', 'destroy_with_params', 'Hello', 42);
    instance.destroy();
    equal(some_property_destroy_count, 3, "3 destroyed");
    equal(instance.some_prop1, null, "instance.some_prop1 destroyed");
    equal(instance.some_prop2, null, "instance.some_prop2 destroyed");
    equal(instance.some_prop3, null, "instance.some_prop3 destroyed");
    equal(some_property_param1, 'Hello', "instance.some_prop3 destroy function received 'Hello'");
    equal(some_property_param2, 42, "instance.some_prop3 destroy function received 42");
    instance = new AutoProperty();
    raises((function() {
      return instance.autoProperty();
    }), Error, "Mixin.AutoMemory: missing key on 'AutoProperty'");
    raises((function() {
      return instance.autoProperty('prop1');
    }), Error, "Mixin.AutoMemory: property 'prop1' doesn't exist on 'AutoProperty'");
    instance.prop1 = 'Hello';
    instance.autoProperty('prop1');
    raises((function() {
      return instance.autoProperty('prop1', 43);
    }), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoProperty'");
    raises((function() {
      return instance.autoProperty('prop1', {});
    }), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoProperty'");
    raises((function() {
      return instance.autoProperty('prop1', []);
    }), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoProperty'");
    instance.prop2 = new SomeProperty();
    instance.autoProperty('prop1', 'imaginaryFunction');
    raises(instance.destroy, Error, "Mixin.AutoMemory: function 'imaginaryFunction' missing for property 'prop1' on 'AutoProperty'");
    AutoWrappedPropertyByArray = (function() {
      function AutoWrappedPropertyByArray() {
        Mixin["in"](this, 'AutoMemory');
        this.you = 'you';
        this.are = 'are';
        this.here = 'here';
        this.autoWrappedProperty(['you', 'are', 'here']);
      }
      AutoWrappedPropertyByArray.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoWrappedPropertyByArray;
    })();
    instance = new AutoWrappedPropertyByArray();
    ok(instance.you && instance.are && instance.here, "you are here");
    instance.destroy();
    return ok(!(instance.you && instance.are && instance.here), "you are not here");
  });
  test("autoWrappedProperty common usage", function() {
    var $el, $el_waiting, AutoWrappedPropertyCommon, instance;
    AutoWrappedPropertyCommon = (function() {
      function AutoWrappedPropertyCommon() {
        Mixin["in"](this, 'AutoMemory');
        this.el = null;
        this.autoWrappedProperty('el', 'remove');
        this.el_waiting = null;
        this.autoWrappedProperty('el_waiting', ['appendTo', $('body')]);
        this.render();
      }
      AutoWrappedPropertyCommon.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      AutoWrappedPropertyCommon.prototype.render = function() {
        this.el = $('<div id="hello2"></div>').appendTo($('body'))[0];
        return this.el_waiting = $('<div id="waiting"></div>').remove()[0];
      };
      return AutoWrappedPropertyCommon;
    })();
    instance = new AutoWrappedPropertyCommon();
    ok(!!instance.el, "instance.el #hello2 exists");
    $el = $('body').children('div#hello2');
    equal($el[0], instance.el, "element #hello2 was found in the DOM");
    ok(!!instance.el_waiting, "instance.el #waiting exists");
    $el_waiting = $('body').children('div#waiting');
    equal($el_waiting.length, 0, "element #waiting was not found in the DOM");
    equal(instance.el_waiting.parentNode, null, "element #waiting has no parent");
    instance.destroy();
    ok(!instance.el, "instance.el #hello2 does not exist");
    ok(!instance.el_waiting, "instance.el_waiting #waiting does not exist");
    $el = $('body').children('div#hello2');
    equal($el.length, 0, "element was not found in the DOM");
    $el_waiting = $('body').children('div#waiting');
    equal($el_waiting.length, 1, "element was found in the DOM");
    return $el_waiting.remove();
  });
  test("Use case: autoWrappedProperty valid and invalid", function() {
    var AutoWrappedProperty, SomeProperty, instance, prop_6_cleared;
    AutoWrappedProperty = (function() {
      function AutoWrappedProperty() {
        Mixin["in"](this, 'AutoMemory');
      }
      AutoWrappedProperty.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoWrappedProperty;
    })();
    instance = new AutoWrappedProperty();
    instance.prop1 = 'Hello';
    instance.autoWrappedProperty('prop1');
    instance.prop2 = $('<div></div>');
    instance.autoWrappedProperty('prop2');
    instance.prop3 = $('<div></div>');
    instance.autoWrappedProperty('prop3', 'remove');
    instance.prop4 = $('<div></div>');
    instance.autoWrappedProperty('prop4', ['appendTo', $('body')]);
    prop_6_cleared = false;
    instance.prop6 = $('<div></div>');
    instance.autoWrappedProperty('prop6', function(prop6) {
      if (prop6[0] === instance.prop6[0]) {
        return prop_6_cleared = true;
      }
    });
    instance.prop7 = null;
    instance.autoWrappedProperty('prop6');
    instance.destroy();
    equal(instance.prop1, null, "instance.prop1 cleared");
    equal(instance.prop2, null, "instance.prop2 cleared - breaking DOM reference");
    equal(instance.prop3, null, "instance.prop3 cleared - breaking DOM reference");
    equal(instance.prop4, null, "instance.prop4 cleared - breaking DOM reference");
    equal(instance.prop6, null, "instance.prop6 cleared");
    equal(prop_6_cleared, true, "instance.prop6 cleared true");
    equal(instance.prop7, null, "instance.prop7 ignored");
    instance = new AutoWrappedProperty();
    raises((function() {
      return instance.autoWrappedProperty();
    }), Error, "Mixin.AutoMemory: missing key on 'AutoWrappedProperty'");
    raises((function() {
      return instance.autoWrappedProperty('prop1');
    }), Error, "Mixin.AutoMemory: property 'prop1' doesn't exist on 'AutoWrappedProperty'");
    instance.prop1 = 'Hello';
    instance.autoWrappedProperty('prop1');
    raises((function() {
      return instance.autoWrappedProperty('prop1', 43);
    }), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoWrappedProperty'");
    raises((function() {
      return instance.autoWrappedProperty('prop1', {});
    }), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoWrappedProperty'");
    raises((function() {
      return instance.autoWrappedProperty('prop1', []);
    }), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoWrappedProperty'");
    SomeProperty = (function() {
      function SomeProperty() {}
      return SomeProperty;
    })();
    instance.prop2 = new SomeProperty();
    instance.autoWrappedProperty('prop1', 'imaginaryFunction');
    return raises(instance.destroy, Error, "Mixin.AutoMemory: function 'imaginaryFunction' missing for property 'prop1' on 'AutoWrappedProperty'");
  });
  test("autoFunction common usage", function() {
    var AutoFunctionCommon, SomePropertyWithSpecialFunction, custom_cleanup_call_count, custom_cleanup_param1, custom_cleanup_param2, function_call_count, function_param1, function_param2, instance, instance_function_call_count, property_function_call_count, special_function_call_count, special_function_param1, special_function_param2;
    property_function_call_count = 0;
    special_function_call_count = 0;
    special_function_param1 = void 0;
    special_function_param2 = void 0;
    SomePropertyWithSpecialFunction = (function() {
      function SomePropertyWithSpecialFunction() {}
      SomePropertyWithSpecialFunction.prototype.specialFunction = function(param1, param2) {
        special_function_call_count++;
        special_function_param1 = param1;
        return special_function_param2 = param2;
      };
      return SomePropertyWithSpecialFunction;
    })();
    instance_function_call_count = 0;
    custom_cleanup_call_count = 0;
    custom_cleanup_param1 = void 0;
    custom_cleanup_param2 = void 0;
    AutoFunctionCommon = (function() {
      function AutoFunctionCommon() {
        Mixin["in"](this, 'AutoMemory');
        this.prop1 = new SomePropertyWithSpecialFunction();
        this.autoFunction(this.prop1, 'specialFunction').autoFunction(this.prop1, 'specialFunction').autoFunction(this.prop1, 'specialFunction');
        this.prop2 = new SomePropertyWithSpecialFunction();
        this.autoFunction(this.prop2, 'specialFunction', 'Hello', 'World!');
        this.autoFunction(this.prop2, __bind(function(prop) {
          if (prop !== this.prop2) {
            throw new Error("Oh no");
          }
          return property_function_call_count++;
        }, this));
        this.autoFunction(this, 'customCleanup').autoFunction(this, 'customCleanup').autoFunction(this, 'customCleanup', 'Hi', 'Universe!');
        this.autoFunction(this, __bind(function(that) {
          if (that !== this) {
            throw new Error("Now this is unexpected");
          }
          return instance_function_call_count++;
        }, this));
      }
      AutoFunctionCommon.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      AutoFunctionCommon.prototype.customCleanup = function(param1, param2) {
        custom_cleanup_call_count++;
        custom_cleanup_param1 = param1;
        return custom_cleanup_param2 = param2;
      };
      return AutoFunctionCommon;
    })();
    instance = new AutoFunctionCommon();
    instance.destroy();
    equal(property_function_call_count, 1, "property_function_call_count 1");
    equal(special_function_call_count, 4, "special_function_call_count 4");
    equal(special_function_param1, 'Hello', "special_function_param1 'Hello'");
    equal(special_function_param2, 'World!', "special_function_param2 'World!'");
    equal(instance_function_call_count, 1, "instance_function_call_count 1");
    equal(custom_cleanup_call_count, 3, "custom_cleanup_call_count 3");
    equal(custom_cleanup_param1, 'Hi', "custom_cleanup_param1 'Hi'");
    equal(custom_cleanup_param2, 'Universe!', "custom_cleanup_param2 'Universe!'");
    function_call_count = 0;
    function_param1 = void 0;
    function_param2 = void 0;
    AutoFunctionCommon = (function() {
      function AutoFunctionCommon() {
        Mixin["in"](this, 'AutoMemory');
        this.autoFunction(null, (function() {
          return function_call_count++;
        }));
        this.autoFunction(null, (function(param1, param2) {
          function_call_count++;
          function_param1 = param1;
          return function_param2 = param2;
        }), 'Was', 'called!');
      }
      AutoFunctionCommon.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoFunctionCommon;
    })();
    instance = new AutoFunctionCommon();
    instance.destroy();
    equal(function_call_count, 2, "function_call_count 2");
    equal(function_param1, 'Was', "function_param1 'Was'");
    return equal(function_param2, 'called!', "function_param2 'called!'");
  });
  test("Use case: autoFunction valid and invalid", function() {
    var AutoFunction, instance;
    AutoFunction = (function() {
      function AutoFunction() {
        Mixin["in"](this, 'AutoMemory');
      }
      AutoFunction.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      return AutoFunction;
    })();
    instance = new AutoFunction();
    raises((function() {
      return instance.autoFunction(instance, 43);
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(instance, {});
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(instance, []);
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(instance, 'imaginaryFunction');
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    instance = new AutoFunction();
    raises((function() {
      return instance.autoFunction(null);
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(null, 43);
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(null, {});
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(null, []);
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(void 0, 43);
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    raises((function() {
      return instance.autoFunction(void 0, {});
    }), Error, "Mixin.AutoMemory: unexpected function reference");
    return raises((function() {
      return instance.autoFunction(void 0, []);
    }), Error, "Mixin.AutoMemory: unexpected function reference");
  });
  return test("Use case: chaining", function() {
    var Chaining, call_count;
    call_count = 0;
    return Chaining = (function() {
      var instance;
      function Chaining() {
        Mixin["in"](this, 'AutoMemory');
        this.prop1 = 'chainer';
        this.prop2 = 'hello';
        this.el = $('<div></div>');
        this.autoProperty('prop1').autoWrappedProperty('el').autoFunction(null, (function() {
          return call_count++;
        })).autoProperty('prop2');
      }
      Chaining.prototype.destroy = function() {
        return Mixin.out(this, 'AutoMemory');
      };
      instance = new Chaining();
      instance.destroy();
      ok(!instance.prop1 && !instance.prop2 && !instance.el && (call_count === 1), "chaining cleared everything");
      return Chaining;
    })();
  });
});