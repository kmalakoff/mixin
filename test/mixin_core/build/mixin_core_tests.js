var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
$(document).ready(function() {
  module("Mixin");
  test("TEST DEPENDENCY MISSING", function() {
    return Mixin.Mixin;
  });
  test("Mixin availability and basic scenario", function() {
    var TestClass, instance, mixin_info;
    mixin_info = {
      mixin_name: 'Test',
      mixin_object: {
        sayHello: function() {
          return 'Hello';
        }
      }
    };
    equal(Mixin.isAvailable('Test'), false, 'Test mixin not registered');
    Mixin.registerMixin(mixin_info);
    equal(Mixin.isAvailable('Test'), true, 'Test mixin now registered');
    TestClass = (function() {
      function TestClass() {}
      return TestClass;
    })();
    instance = new TestClass();
    equal(Mixin.hasMixin(instance, 'Test'), false, 'TestClass is not yet mixed in');
    ok(!TestClass.prototype.sayHello, 'TestClass does not have the class-level function sayHello');
    Mixin["in"](instance, 'Test');
    equal(Mixin.hasMixin(instance, 'Test'), true, 'Test now mixed in');
    ok(TestClass.prototype.sayHello, 'TestClass now has the class-level function sayHello');
    equal(instance.sayHello(), 'Hello', 'TestClass sayHello works');
    Mixin.out(instance, 'Test');
    equal(Mixin.hasMixin(instance, 'Test'), false, 'TestClass instance no longer reported as mixed in');
    equal(Mixin.classHasMixin(TestClass, 'Test'), true, 'TestClass still has the mixed in properties');
    ok(TestClass.prototype.sayHello, 'TestClass still has the class-level function sayHello');
    equal(instance.sayHello(), 'Hello', 'TestClass still works, but you should not call it. If the mixin has instance data, it would throw an exception.');
    Mixin["in"](instance, 'Test');
    equal(Mixin.hasMixin(instance, 'Test'), true, 'Test now mixed in');
    Mixin["in"](instance, 'Test');
    equal(Mixin.hasMixin(instance, 'Test'), true, 'Test still mixed in');
    return Mixin.out(instance, 'Test');
  });
  test("Mixin scenario with instance data", function() {
    var TestClass2, instance, mixin_info;
    mixin_info = {
      mixin_name: 'Test2',
      initialize: function() {
        return Mixin.instanceData(this, 'Test2', 'Hello');
      },
      mixin_object: {
        sayHello2: function() {
          return Mixin.instanceData(this, 'Test2');
        }
      }
    };
    Mixin.registerMixin(mixin_info);
    TestClass2 = (function() {
      function TestClass2() {}
      return TestClass2;
    })();
    instance = new TestClass2();
    Mixin["in"](instance, 'Test2');
    equal(Mixin.hasMixin(instance, 'Test2'), true, 'Test2 now mixed in');
    equal(Mixin.hasInstanceData(instance, 'Test2'), true, 'TestClass2 has Test2 instance data');
    ok(TestClass2.prototype.sayHello2, 'TestClass2 now has the class-level function sayHello2');
    equal(instance.sayHello2(), 'Hello', 'TestClass2 sayHello2 works');
    Mixin.out(instance, 'Test2');
    equal(Mixin.hasMixin(instance, 'Test2'), false, 'TestClass instance no longer reported as mixed in');
    equal(Mixin.classHasMixin(TestClass2, 'Test2'), true, 'TestClass still has the mixed in properties');
    equal(Mixin.hasInstanceData(instance, 'Test2'), false, 'TestClass2 does not have Test2 instance data');
    ok(TestClass2.prototype.sayHello2, 'TestClass still has the class-level function sayHello2');
    raises(instance.sayHello2, Error, "Mixin: no instance data on instance of 'TestClass2'");
    Mixin["in"](instance, 'Test2');
    equal(Mixin.hasInstanceData(instance, 'Test2'), true, 'TestClass2 has Test2 instance data');
    raises(Mixin.hasInstanceData(instance, 'Unknown'), Error, "Mixin: mixin 'Unknown' instance data not found on instance of 'TestClass2'");
    return Mixin.out(instance, 'Test2');
  });
  test("Mixin.registerMixin valid and invalid scenarios", function() {
    var SomeClass, instance;
    equal(Mixin.registerMixin({
      mixin_name: 'Ok1',
      mixin_object: {}
    }), true, "register only requires mixin_name and mixin_object");
    equal(Mixin.registerMixin({
      mixin_name: 'Ok2',
      mixin_object: {},
      initialize: (function() {})
    }), true, "register can provide an initialize function");
    equal(Mixin.registerMixin({
      mixin_name: 'Ok3',
      mixin_object: {},
      destroy: (function() {})
    }), true, "register can provide a destroy function");
    equal(Mixin.registerMixin({
      mixin_name: 'Ok4',
      mixin_object: {},
      initialize: (function() {}),
      destroy: (function() {})
    }), true, "register can provide an initialize and destroy function");
    SomeClass = (function() {
      function SomeClass() {}
      return SomeClass;
    })();
    instance = new SomeClass();
    Mixin["in"](instance, 'Ok1', 'Ok2', 'Ok3');
    deepEqual(Mixin.mixins(instance), ['Ok1', 'Ok2', 'Ok3'], "'Ok1', 'Ok2', 'Ok3' are mixed in ");
    Mixin.out(instance);
    deepEqual(Mixin.mixins(instance), [], "'Ok1', 'Ok2', 'Ok3' are mixed out ");
    raises((function() {
      return Mixin.registerMixin();
    }), Error, "Mixin: mixin_info missing");
    raises((function() {
      return Mixin.registerMixin({
        mixin_object: {}
      });
    }), Error, "Mixin: mixin_name missing");
    raises((function() {
      return Mixin.registerMixin({
        mixin_name: {},
        mixin_object: {}
      });
    }), Error, "Mixin: mixin_name invalid");
    raises((function() {
      return Mixin.registerMixin({
        mixin_name: 'NotValid'
      });
    }), Error, "Mixin: mixin_info 'NotValid' missing mixin_object");
    raises((function() {
      return Mixin.registerMixin({
        mixin_name: 'NotValid',
        mixin_object: 1
      });
    }), Error, "Mixin: mixin_info 'NotValid' mixin_object is invalid");
    raises((function() {
      return Mixin.registerMixin({
        mixin_name: 'NotValid',
        mixin_object: {},
        initialize: {}
      });
    }), Error, "Mixin: mixin_info 'NotValid' initialize function is invalid");
    return raises((function() {
      return Mixin.registerMixin({
        mixin_name: 'NotValid',
        mixin_object: {},
        destroy: {}
      });
    }), Error, "Mixin: mixin_info 'NotValid' destroy function is invalid");
  });
  test("Mixin instance valid and invalid scenarios", function() {
    var MixTarget, instance;
    Mixin.registerMixin({
      mixin_name: 'MixinType1',
      mixin_object: {}
    });
    MixTarget = (function() {
      function MixTarget() {}
      return MixTarget;
    })();
    instance = new MixTarget();
    ok(Mixin["in"](instance, 'MixinType1') === instance, 'mixin MixinType1');
    Mixin["in"](instance, 'MixinType1');
    raises((function() {
      return Mixin["in"]();
    }), Error, "Mixin.mixin: mix_target missing");
    raises((function() {
      return Mixin["in"](0);
    }), Error, "Mixin.mixin: mix_target invalid");
    raises((function() {
      return Mixin["in"]({});
    }), Error, "Mixin.mixin: mix_target invalid");
    raises((function() {
      return Mixin["in"]([]);
    }), Error, "Mixin.mixin: mix_target invalid");
    raises((function() {
      return Mixin["in"]([], 'MixinType1');
    }), Error, "Mixin.mixin: mix_target invalid for for 'MixinType1'");
    raises((function() {
      return Mixin["in"](MixTarget);
    }), Error, "Mixin.mixin: mix_target invalid");
    raises((function() {
      return Mixin["in"](instance);
    }), Error, "Mixin.mixin: mixin_name missing for 'MixTarget'");
    raises((function() {
      return Mixin["in"](instance, 0);
    }), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin["in"](instance, {});
    }), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin["in"](instance, []);
    }), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin["in"](instance, instance);
    }), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin["in"](instance, MixTarget);
    }), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'");
    Mixin.out(instance, 'MixinType1');
    instance = new MixTarget();
    Mixin["in"](instance, 'MixinType1');
    ok(Mixin.out(instance, 'MixinType1') === instance, 'mixin MixinType1');
    raises((function() {
      return Mixin.out();
    }), Error, "Mixin.mixout: mix_target missing");
    raises((function() {
      return Mixin.out(0);
    }), Error, "Mixin.mixout: mix_target invalid");
    raises((function() {
      return Mixin.out({});
    }), Error, "Mixin.mixout: mix_target invalid");
    raises((function() {
      return Mixin.out([]);
    }), Error, "Mixin.mixout: mix_target invalid");
    raises((function() {
      return Mixin.out([], 'MixinType1');
    }), Error, "Mixin.mixout: mix_target invalid for for 'MixinType1'");
    raises((function() {
      return Mixin.out(MixTarget);
    }), Error, "Mixin.mixout: mix_target invalid");
    raises((function() {
      return Mixin.out(instance, 0);
    }), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.out(instance, {});
    }), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.out(instance, []);
    }), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.out(instance, instance);
    }), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.out(instance, MixTarget);
    }), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'");
    instance = new MixTarget();
    Mixin["in"](instance, 'MixinType1');
    equal(Mixin.hasMixin(instance, 'MixinType1'), true, 'mixin MixinType1');
    equal(Mixin.exists(instance, 'MixinType2'), false, 'mixin MixinType1');
    raises((function() {
      return Mixin.hasMixin();
    }), Error, "Mixin.hasMixin: mix_target missing");
    raises((function() {
      return Mixin.hasMixin(0);
    }), Error, "Mixin.hasMixin: mix_target invalid");
    raises((function() {
      return Mixin.hasMixin({});
    }), Error, "Mixin.hasMixin: mix_target invalid");
    raises((function() {
      return Mixin.hasMixin([]);
    }), Error, "Mixin.hasMixin: mix_target invalid");
    raises((function() {
      return Mixin.hasMixin([], 'MixinType1');
    }), Error, "Mixin.hasMixin: mix_target invalid for for 'MixinType1");
    raises((function() {
      return Mixin.hasMixin(MixTarget);
    }), Error, "Mixin.hasMixin: mix_target invalid");
    raises((function() {
      return Mixin.hasMixin(instance, 0);
    }), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasMixin(instance, {});
    }), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasMixin(instance, []);
    }), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasMixin(instance, instance);
    }), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasMixin(instance, MixTarget);
    }), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'");
    Mixin.out(instance, 'MixinType1');
    Mixin.registerMixin({
      mixin_name: 'MixinType2',
      mixin_object: {}
    });
    Mixin.registerMixin({
      mixin_name: 'MixinType3',
      mixin_object: {}
    });
    instance = new MixTarget();
    Mixin["in"](instance, 'MixinType1', 'MixinType2');
    deepEqual(Mixin.mixins(instance), ['MixinType1', 'MixinType2'], "mixins ['MixinType1', 'MixinType2']");
    Mixin.out(instance, 'MixinType1', 'MixinType2');
    instance = new MixTarget();
    Mixin["in"](instance, 'MixinType1', 'MixinType2', ['MixinType3']);
    deepEqual(Mixin.mixins(instance), ['MixinType1', 'MixinType2', 'MixinType3'], "mixins ['MixinType1', 'MixinType2', 'MixinType3']");
    raises((function() {
      return Mixin.mixins();
    }), Error, "Mixin.mixins: mix_target missing");
    raises((function() {
      return Mixin.mixins(0);
    }), Error, "Mixin.mixins: mix_target invalid");
    raises((function() {
      return Mixin.mixins({});
    }), Error, "Mixin.mixins: mix_target invalid");
    raises((function() {
      return Mixin.mixins([]);
    }), Error, "Mixin.mixins: mix_target invalid");
    raises((function() {
      return Mixin.mixins([], 'MixinType1');
    }), Error, "Mixin.mixins: mix_target invalid for for 'MixinType1'");
    raises((function() {
      return Mixin.mixins(MixTarget);
    }), Error, "Mixin.mixins: mix_target invalid");
    Mixin.out(instance, 'MixinType1', 'MixinType2', 'MixinType3');
    equal(Mixin.classHasMixin(MixTarget, 'MixinType1'), true, 'classHasMixin MixinType1');
    equal(Mixin.classHasMixin(MixTarget, 'MixinType2'), true, 'classHasMixin MixinType2');
    equal(Mixin.classHasMixin(MixTarget, 'MixinType3'), true, 'classHasMixin MixinType3');
    raises((function() {
      return Mixin.classHasMixin();
    }), Error, "Mixin.classHasMixin: class constructor missing");
    raises((function() {
      return Mixin.classHasMixin(0);
    }), Error, "Mixin.classHasMixin: class constructor invalid");
    raises((function() {
      return Mixin.classHasMixin({});
    }), Error, "Mixin.classHasMixin: class constructor invalid");
    raises((function() {
      return Mixin.classHasMixin([]);
    }), Error, "Mixin.classHasMixin: class constructor invalid");
    raises((function() {
      return Mixin.classHasMixin([], 'MixinType1');
    }), Error, "Mixin.classHasMixin: class constructor invalid for for 'MixinType1'");
    raises((function() {
      return Mixin.classHasMixin(instance);
    }), Error, "Mixin.classHasMixin: class constructor invalid");
    Mixin.registerMixin({
      mixin_name: 'MixinWithInstanceData',
      initialize: (function() {
        return Mixin.instanceData(this, 'MixinWithInstanceData', true);
      }),
      mixin_object: {}
    });
    instance = new MixTarget();
    Mixin["in"](instance, 'MixinWithInstanceData');
    equal(Mixin.hasInstanceData(instance, 'MixinWithInstanceData'), true, 'hasInstanceData MixinWithInstanceData');
    equal(Mixin.hasID(instance, 'MixinWithInstanceData'), true, 'hasID MixinWithInstanceData');
    equal(Mixin.hasInstanceData(instance, 'MixinType1'), false, 'no MixinType1 instance data');
    raises((function() {
      return Mixin.hasInstanceData();
    }), Error, "Mixin.hasInstanceData: mix_target missing");
    raises((function() {
      return Mixin.hasInstanceData(0);
    }), Error, "Mixin.hasInstanceData: mix_target invalid");
    raises((function() {
      return Mixin.hasInstanceData({});
    }), Error, "Mixin.hasInstanceData: mix_target invalid");
    raises((function() {
      return Mixin.hasInstanceData([]);
    }), Error, "Mixin.hasInstanceData: mix_target invalid");
    raises((function() {
      return Mixin.hasInstanceData([], 'MixinWithInstanceData');
    }), Error, "Mixin.hasInstanceData: mix_target invalid for 'MixinWithInstanceData'");
    raises((function() {
      return Mixin.hasInstanceData(MixTarget);
    }), Error, "Mixin.hasInstanceData: mix_target invalid");
    raises((function() {
      return Mixin.hasInstanceData(instance, 0);
    }), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasInstanceData(instance, {});
    }), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasInstanceData(instance, []);
    }), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasInstanceData(instance, instance);
    }), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.hasInstanceData(instance, MixTarget);
    }), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'");
    Mixin.out(instance, 'MixinWithInstanceData');
    instance = new MixTarget();
    raises((function() {
      return Mixin.instanceData(instance, 'MixinType1');
    }), Error, "Mixin.instanceData: no instance data on 'MixTarget'");
    Mixin["in"](instance, 'MixinWithInstanceData');
    equal(Mixin.instanceData(instance, 'MixinWithInstanceData'), true, 'instanceData MixinWithInstanceData');
    equal(Mixin.iD(instance, 'MixinWithInstanceData'), true, 'hasID MixinWithInstanceData');
    raises((function() {
      return Mixin.instanceData(instance, 'MixinType2');
    }), Error, "Mixin.instanceData: mixin 'MixinType2' instance data not found on 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, 'MixinType1');
    }), Error, "Mixin.instanceData: mix_target invalid");
    raises((function() {
      return Mixin.instanceData();
    }), Error, "Mixin.instanceData: mix_target missing");
    raises((function() {
      return Mixin.instanceData(0);
    }), Error, "Mixin.instanceData: mix_target invalid");
    raises((function() {
      return Mixin.instanceData({});
    }), Error, "Mixin.instanceData: mix_target invalid");
    raises((function() {
      return Mixin.instanceData([]);
    }), Error, "Mixin.instanceData: mix_target invalid");
    raises((function() {
      return Mixin.instanceData([], 'MixinWithInstanceData');
    }), Error, "Mixin.instanceData: mix_target invalid for 'MixinWithInstanceData'");
    raises((function() {
      return Mixin.instanceData(MixTarget);
    }), Error, "Mixin.instanceData: mix_target invalid");
    raises((function() {
      return Mixin.instanceData(instance, 0);
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, {});
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, []);
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, instance);
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, MixTarget);
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    Mixin.out(instance, 'MixinWithInstanceData');
    instance = new MixTarget();
    raises((function() {
      return Mixin.instanceData(instance, 'MixinType1');
    }), Error, "Mixin.instanceData: mixin 'MixinType1' not mixed into 'MixTarget'");
    Mixin["in"](instance, 'MixinWithInstanceData');
    equal(Mixin.instanceData(instance, 'MixinWithInstanceData', false), false, 'hasInstanceData MixinWithInstanceData');
    equal(Mixin.iD(instance, 'MixinWithInstanceData', 'Hello'), 'Hello', 'hasID MixinWithInstanceData');
    raises((function() {
      return Mixin.instanceData(instance, 'MixinType2', 'Set');
    }), Error, "Mixin.instanceData: mixin 'MixinType2' instance data not found on 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, 'MixinType1', 'Set');
    }), Error, "Mixin.instanceData: mix_target invalid");
    raises((function() {
      return Mixin.instanceData([], 'MixinWithInstanceData', 'Set');
    }), Error, "Mixin.instanceData: mix_target invalid for 'MixinWithInstanceData'");
    raises((function() {
      return Mixin.instanceData(MixTarget);
    }), Error, "Mixin.instanceData: mix_target invalid");
    raises((function() {
      return Mixin.instanceData(instance, 0, 'Set');
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, {}, 'Set');
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, [], 'Set');
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, instance, 'Set');
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    raises((function() {
      return Mixin.instanceData(instance, MixTarget, 'Set');
    }), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'");
    return Mixin.out(instance, 'MixinWithInstanceData');
  });
  test("Mixin mix_info with overwrite", function() {
    var OverwriteTestPostOverwrite, OverwriteTestPreOverwrite, instance_post_overwrite, instance_pre_overwrite, instance_pre_overwrite2;
    OverwriteTestPreOverwrite = (function() {
      function OverwriteTestPreOverwrite() {
        Mixin["in"](this, 'Overwrite');
      }
      OverwriteTestPreOverwrite.prototype.destroy = function() {
        return Mixin.out(this, 'Overwrite');
      };
      return OverwriteTestPreOverwrite;
    })();
    OverwriteTestPostOverwrite = (function() {
      function OverwriteTestPostOverwrite() {
        Mixin["in"](this, 'Overwrite');
      }
      OverwriteTestPostOverwrite.prototype.destroy = function() {
        return Mixin.out(this, 'Overwrite');
      };
      return OverwriteTestPostOverwrite;
    })();
    equal(Mixin.registerMixin({
      mixin_name: 'Overwrite',
      mixin_object: {
        someFunction: function() {
          return true;
        }
      }
    }), true, "Overwrite now registered");
    instance_pre_overwrite = new OverwriteTestPreOverwrite();
    equal(instance_pre_overwrite.someFunction(), true, "someFunction from first Overwrite mixin");
    raises((function() {
      return Mixin.registerMixin({
        mixin_name: 'Overwrite',
        mixin_object: {}
      });
    }), Error, "Mixin: mixin_info 'Overwrite' already registered");
    equal(instance_pre_overwrite.someFunction(), true, "someFunction from first Overwrite mixin (no change on failed force)");
    equal(Mixin.registerMixin({
      mixin_name: 'Overwrite',
      mixin_object: {
        someFunction: function() {
          return false;
        }
      }
    }, true), true, "overwriting an exisiting mixin is OK");
    equal(instance_pre_overwrite.someFunction(), true, "someFunction from first Overwrite mixin (no change on successful force)");
    instance_pre_overwrite2 = new OverwriteTestPreOverwrite();
    equal(instance_pre_overwrite2.someFunction(), true, "new instances of OverwriteTestPreOverwrite keep the pre-overwrite mixin");
    instance_post_overwrite = new OverwriteTestPostOverwrite();
    equal(instance_post_overwrite.someFunction(), false, "instances of OverwriteTestPostOverwrite that have their first mixin after overwrite use the new mixin");
    instance_pre_overwrite.destroy();
    instance_pre_overwrite2.destroy();
    return instance_post_overwrite.destroy();
  });
  test("Mixin target validity", function() {
    var AClass, MixinTarget, instance;
    MixinTarget = (function() {
      function MixinTarget() {}
      MixinTarget.prototype.mySpecialFunction = function() {
        return false;
      };
      return MixinTarget;
    })();
    instance = new MixinTarget();
    equal(Mixin.registerMixin({
      mixin_name: 'Clobber',
      mixin_object: {
        mySpecialFunction: function() {
          return true;
        }
      }
    }), true, "Clobber now registered");
    raises((function() {
      return Mixin["in"](instance, 'Clobber');
    }), Error, "Mixin: cannot mixin 'Clobber' because 'mySpecialFunction' already exists on 'MixinTarget'");
    equal(Mixin.registerMixin({
      mixin_name: 'Conflict1',
      mixin_object: {
        someFunction: function() {
          return true;
        }
      }
    }), true, "Conflict1 now registered");
    equal(Mixin.registerMixin({
      mixin_name: 'Conflict2',
      mixin_object: {
        someFunction: function() {
          return true;
        }
      }
    }), true, "Conflict2 now registered");
    Mixin["in"](instance, 'Conflict1');
    equal(Mixin.hasMixin(instance, 'Conflict1'), true, 'Conflict1 now mixed in');
    raises((function() {
      return Mixin["in"](instance, 'Conflict2');
    }), Error, "Mixin: cannot mixin 'Conflict2' because 'someFunction' already exists on 'MixinTarget'");
    Mixin.out(instance, 'Conflict1');
    equal(Mixin.registerMixin({
      mixin_name: 'NonInstance',
      mixin_object: {}
    }), true, "NonInstance now registered");
    raises((function() {
      return Mixin["in"](1, 'NonInstance');
    }), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of 1 is invalid");
    raises((function() {
      return Mixin["in"]([], 'NonInstance');
    }), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of [] is invalid");
    raises((function() {
      return Mixin["in"]({}, 'NonInstance');
    }), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of {} is invalid");
    raises((function() {
      return Mixin["in"]((function() {}), 'NonInstance');
    }), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of function is invalid");
    AClass = (function() {
      function AClass() {}
      return AClass;
    })();
    return raises((function() {
      return Mixin["in"](AClass, 'NonInstance');
    }), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of constructor is invalid (must be an instance)");
  });
  test("Mixin chaining and multiple mixins", function() {
    var MixinChainingTarget, MixinMultipleTarget, instance, parameter_value1, parameter_value2;
    equal(Mixin.registerMixin({
      mixin_name: 'Multiple1',
      mixin_object: {}
    }), true, "Multiple1 now registered");
    equal(Mixin.registerMixin({
      mixin_name: 'Multiple2',
      mixin_object: {}
    }), true, "Multiple2 now registered");
    equal(Mixin.registerMixin({
      mixin_name: 'Multiple3',
      mixin_object: {}
    }), true, "Multiple3 now registered");
    MixinChainingTarget = (function() {
      function MixinChainingTarget() {}
      return MixinChainingTarget;
    })();
    instance = new MixinChainingTarget();
    equal(Mixin.hasMixin(instance, 'Multiple1'), false, 'c: Multiple1 not mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple2'), false, 'c: Multiple2 not mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple3'), false, 'c: Multiple3 not mixed in');
    Mixin["in"](Mixin["in"](Mixin["in"](instance, 'Multiple1'), 'Multiple2'), 'Multiple3');
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'c: Multiple1 now mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple2'), true, 'c: Multiple2 now mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'c: Multiple3 now mixed in');
    Mixin.out(instance, 'Multiple1', 'Multiple2', 'Multiple3');
    instance = new MixinChainingTarget();
    equal(Mixin.hasMixin(instance, 'Multiple1'), false, 'mm: Multiple1 not mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple2'), false, 'mm: Multiple2 not mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple3'), false, 'mm: Multiple3 not mixed in');
    Mixin["in"](instance, 'Multiple1', 'Multiple2', 'Multiple3');
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'mm: Multiple1 now mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple2'), true, 'mm: Multiple2 now mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'mm: Multiple3 now mixed in');
    deepEqual(Mixin.mixins(instance), ['Multiple1', 'Multiple2', 'Multiple3'], "mm: ['Multiple1', 'Multiple2', 'Multiple3'] now mixed in");
    Mixin.out(instance, 'Multiple1', 'Multiple2', 'Multiple3');
    MixinMultipleTarget = (function() {
      function MixinMultipleTarget() {
        Mixin["in"](this, 'Multiple1', 'Multiple2', 'Multiple3');
      }
      MixinMultipleTarget.prototype.destroy = function() {
        return Mixin.out(this, 'Multiple1', 'Multiple2', 'Multiple3');
      };
      return MixinMultipleTarget;
    })();
    instance = new MixinMultipleTarget();
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'cm: Multiple1 now mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple2'), true, 'cm: Multiple2 now mixed in');
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'cm: Multiple3 now mixed in');
    instance.destroy();
    parameter_value1 = void 0;
    parameter_value2 = void 0;
    equal(Mixin.registerMixin({
      mixin_name: 'MultipleInitializationParams',
      initialize: function(param1, param2) {
        parameter_value1 = param1;
        return parameter_value2 = param2;
      },
      mixin_object: {}
    }), true, "MultipleInitializationParams now registered");
    MixinMultipleTarget = (function() {
      function MixinMultipleTarget() {
        Mixin["in"](this, 'Multiple1', ['MultipleInitializationParams', 'Hello World!'], ['Multiple3']);
      }
      MixinMultipleTarget.prototype.destroy = function() {
        return Mixin.out(this, 'Multiple1', 'MultipleInitializationParams', 'Multiple3');
      };
      return MixinMultipleTarget;
    })();
    parameter_value1 = void 0;
    parameter_value2 = void 0;
    instance = new MixinMultipleTarget();
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'm,[m,p],m: Multiple1 now mixed in');
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,[m,p],m: MultipleInitializationParams now mixed in');
    equal(parameter_value1, 'Hello World!', 'm,[m,p],m: MultipleInitializationParams received the parameter');
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'm,[m,p],m: Multiple3 now mixed in');
    instance.destroy();
    parameter_value1 = void 0;
    parameter_value2 = void 0;
    instance = new MixinChainingTarget();
    ok(Mixin["in"](instance, 'MultipleInitializationParams', 'my_parameter', 2) === instance, 'm,p1,p2: correctly inferered my_parameter and 2 are not mixins');
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,p1,p2: MultipleInitializationParams now mixed in');
    equal(parameter_value1, 'my_parameter', 'm,p1,p2: MultipleInitializationParams received parameter1');
    equal(parameter_value2, 2, 'm,p1,p2: MultipleInitializationParams received parameter2');
    Mixin.out(instance, 'MultipleInitializationParams');
    parameter_value1 = void 0;
    parameter_value2 = 'bye bye';
    instance = new MixinChainingTarget();
    ok(Mixin["in"](instance, 'MultipleInitializationParams', ['my_parameter', 2]) === instance, 'm,[p1,p2]: correctly inferered [my_parameter and 2] are not mixins');
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,[p1,p2]: MultipleInitializationParams now mixed in');
    ok(parameter_value1[0] === 'my_parameter' && parameter_value1[1] === 2, 'm,[p1,p2]: MultipleInitializationParams received parameter1');
    equal(parameter_value2, void 0, 'm,[p1,p2]: MultipleInitializationParams received parameter2');
    Mixin.out(instance, 'MultipleInitializationParams');
    parameter_value1 = void 0;
    parameter_value2 = 'bye bye';
    instance = new MixinChainingTarget();
    ok(Mixin["in"](instance, 'Multiple1', ['MultipleInitializationParams', 2]) === instance, 'm,[m,p2]: correctly inferered Multiple2 is a mixin');
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'm,[m,p2]: MultipleInitializationParams now mixed in');
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,[m,p2]: MultipleInitializationParams now mixed in');
    equal(parameter_value1, 2, 'm,[m,p2]: MultipleInitializationParams received parameter2');
    equal(parameter_value2, void 0, 'm,[m,p2]: MultipleInitializationParams received parameter2');
    return Mixin.out(instance, 'Multiple1', 'MultipleInitializationParams');
  });
  test("Mixin ordering", function() {
    var SubClass1_1, SubClass1_2, SubClass1_3, SubClass1_4, SubClass1_5, SubClass2_5, SuperClass_1, SuperClass_2, SuperClass_3, SuperClass_4, SuperClass_5, sibling_instance1, sibling_instance2, sub_instance, sub_instance1, sub_instance2, super_instance;
    equal(Mixin.registerMixin({
      mixin_name: 'Ordering',
      initialize: function() {
        return Mixin.instanceData(this, 'Ordering', []);
      },
      mixin_object: {}
    }), true, "Ordering now registered");
    SuperClass_1 = (function() {
      function SuperClass_1() {}
      return SuperClass_1;
    })();
    SubClass1_1 = (function() {
      __extends(SubClass1_1, SuperClass_1);
      function SubClass1_1() {
        SubClass1_1.__super__.constructor.apply(this, arguments);
      }
      return SubClass1_1;
    })();
    super_instance = new SuperClass_1();
    sub_instance1 = new SubClass1_1();
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test1: Ordering not mixed in');
    equal(Mixin.hasMixin(sub_instance1, 'Ordering'), false, 'test1: Ordering not mixed in');
    Mixin["in"](super_instance, 'Ordering');
    equal(Mixin.hasMixin(super_instance, 'Ordering'), true, 'test1: Ordering is mixed in');
    equal(Mixin.classHasMixin(SubClass1_1, 'Ordering'), true, 'test1: Ordering class has the mixin but it is not initialized');
    equal(Mixin.hasMixin(sub_instance1, 'Ordering'), false, 'test1: Ordering is not mixed in because it was created before the super class mixin');
    equal(Mixin.hasInstanceData(sub_instance1, 'Ordering'), false, 'test1: Ordering instance data does not exist because it was created before the super class mixin');
    sub_instance2 = new SubClass1_1();
    equal(Mixin.classHasMixin(SubClass1_1, 'Ordering'), true, 'test1: Ordering class has the mixin but it is not initialized');
    equal(Mixin.hasMixin(sub_instance2, 'Ordering'), false, 'test1: Ordering has not yet been initialized');
    equal(Mixin.hasInstanceData(sub_instance2, 'Ordering'), false, 'test1: Ordering instance data does exist because it has not yet been initialized');
    Mixin.out(super_instance, 'Ordering');
    SuperClass_2 = (function() {
      function SuperClass_2() {}
      return SuperClass_2;
    })();
    SubClass1_2 = (function() {
      __extends(SubClass1_2, SuperClass_2);
      function SubClass1_2() {
        SubClass1_2.__super__.constructor.apply(this, arguments);
      }
      return SubClass1_2;
    })();
    super_instance = new SuperClass_2();
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test2: Ordering not mixed in');
    Mixin["in"](super_instance, 'Ordering');
    sub_instance = new SubClass1_2();
    equal(Mixin.hasMixin(super_instance, 'Ordering'), true, 'test2: Ordering is mixed in');
    equal(Mixin.classHasMixin(SubClass1_2, 'Ordering'), true, 'test2: Ordering class has the mixin but it is not initialized');
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), false, 'test2: Ordering has not yet been initialized');
    equal(Mixin.hasInstanceData(sub_instance, 'Ordering'), false, 'test2: Ordering instance data does exist because it has not yet been initialized');
    Mixin.out(super_instance, 'Ordering');
    SuperClass_3 = (function() {
      function SuperClass_3() {}
      return SuperClass_3;
    })();
    SubClass1_3 = (function() {
      __extends(SubClass1_3, SuperClass_3);
      function SubClass1_3() {
        SubClass1_3.__super__.constructor.apply(this, arguments);
      }
      return SubClass1_3;
    })();
    sub_instance = new SubClass1_3();
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), false, 'test3: Ordering not mixed in');
    Mixin["in"](sub_instance, 'Ordering');
    equal(Mixin.classHasMixin(SuperClass_3, 'Ordering'), false, 'test1: Ordering class has the mixin but it is not initialized');
    equal(Mixin.classHasMixin(SubClass1_3, 'Ordering'), true, 'test1: Ordering class has the mixin but it is not initialized');
    super_instance = new SuperClass_3();
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), true, 'test3: Ordering is mixed in');
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test3: Ordering is mixed in');
    equal(Mixin.hasInstanceData(sub_instance, 'Ordering'), true, 'test3: Ordering instance data does exist');
    equal(Mixin.hasInstanceData(super_instance, 'Ordering'), false, 'test3: Ordering instance data does exist');
    Mixin.out(sub_instance, 'Ordering');
    SuperClass_4 = (function() {
      function SuperClass_4() {}
      return SuperClass_4;
    })();
    SubClass1_4 = (function() {
      __extends(SubClass1_4, SuperClass_4);
      function SubClass1_4() {
        SubClass1_4.__super__.constructor.apply(this, arguments);
      }
      return SubClass1_4;
    })();
    sub_instance = new SubClass1_4();
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), false, 'test4: Ordering not mixed in');
    super_instance = new SuperClass_4();
    Mixin["in"](sub_instance, 'Ordering');
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), true, 'test4: Ordering is mixed in');
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test4: Ordering is mixed in');
    equal(Mixin.hasInstanceData(sub_instance, 'Ordering'), true, 'test4: Ordering instance data does exist');
    equal(Mixin.hasInstanceData(super_instance, 'Ordering'), false, 'test4: Ordering instance data does exist');
    Mixin.out(sub_instance, 'Ordering');
    SuperClass_5 = (function() {
      function SuperClass_5() {}
      return SuperClass_5;
    })();
    SubClass1_5 = (function() {
      __extends(SubClass1_5, SuperClass_5);
      function SubClass1_5() {
        SubClass1_5.__super__.constructor.apply(this, arguments);
      }
      return SubClass1_5;
    })();
    SubClass2_5 = (function() {
      __extends(SubClass2_5, SuperClass_5);
      function SubClass2_5() {
        SubClass2_5.__super__.constructor.apply(this, arguments);
      }
      return SubClass2_5;
    })();
    sibling_instance1 = new SubClass1_5();
    equal(Mixin.hasMixin(sibling_instance1, 'Ordering'), false, 'test5: Ordering not mixed in');
    Mixin["in"](sibling_instance1, 'Ordering');
    equal(Mixin.hasMixin(sibling_instance1, 'Ordering'), true, 'test5: Ordering mixed in');
    equal(Mixin.hasInstanceData(sibling_instance1, 'Ordering'), true, 'test5: Ordering instance data exists');
    sibling_instance2 = new SubClass2_5();
    equal(Mixin.hasMixin(sibling_instance2, 'Ordering'), false, 'test5: Ordering not mixed in');
    equal(Mixin.hasInstanceData(sibling_instance2, 'Ordering'), false, 'test5: Ordering instance data exists');
    return Mixin.out(sibling_instance1, 'Ordering');
  });
  return test("TEST CLEANUP", function() {
    var mixins_with_instances;
    Mixin._statistics.update();
    mixins_with_instances = Mixin._statistics.byMixin_getInstances();
    equal(_.size(mixins_with_instances), 0, 'No mixed instances: Memory is clean');
    return equal(Mixin._statistics.byInstance_withData().length, 0, 'No instance data: Memory is clean');
  });
});