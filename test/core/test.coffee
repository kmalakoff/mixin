$(document).ready( ->
  module("Mixin")

  # import Mixin and Underscore
  Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin-js') else window.Mixin
  unless Mixin
    Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin-js-core') else window.Mixin
  _ = if not window._ and (typeof(require) != 'undefined') then require('underscore')?._ else window._
  _ = Mixin._ unless _

  test("TEST DEPENDENCY MISSING", ->
    ok(!!Mixin)
    ok(!!_)
  )

  test("Mixin availability and basic scenario", ->
    mixin_info =
      mixin_name: 'Test'
      mixin_object:
        sayHello: -> return 'Hello'

    # not registered and then registered
    equal(Mixin.isAvailable('Test'), false, 'Test mixin not registered')
    Mixin.registerMixin(mixin_info)
    equal(Mixin.isAvailable('Test'), true, 'Test mixin now registered')

    # pre-mixin
    class TestClass
    instance = new TestClass()
    equal(Mixin.hasMixin(instance, 'Test'), false, 'TestClass is not yet mixed in')
    ok(not TestClass.prototype.sayHello, 'TestClass does not have the class-level function sayHello')

    # post-mixin
    Mixin.in(instance, 'Test')
    equal(Mixin.hasMixin(instance, 'Test'), true, 'Test now mixed in')
    ok(TestClass.prototype.sayHello, 'TestClass now has the class-level function sayHello')
    equal(instance.sayHello(), 'Hello', 'TestClass sayHello works')

    # post-mixout
    Mixin.out(instance, 'Test')
    equal(Mixin.hasMixin(instance, 'Test'), false, 'TestClass instance no longer reported as mixed in')
    ok(TestClass.prototype.sayHello, 'TestClass still has the class-level function sayHello')
    equal(instance.sayHello(), 'Hello', 'TestClass still works, but you should not call it. If the mixin has instance data, it would throw an exception.')

    # remix, remix
    Mixin.in(instance, 'Test')
    equal(Mixin.hasMixin(instance, 'Test'), true, 'Test now mixed in')
    Mixin.in(instance, 'Test') # fine to mixin multiple times
    equal(Mixin.hasMixin(instance, 'Test'), true, 'Test still mixed in')

    Mixin.out(instance, 'Test') # test cleanup
  )

  test("Mixin scenario with instance data", ->
    mixin_info =
      mixin_name: 'Test2'
      initialize: -> Mixin.instanceData(this, 'Test2', 'Hello')
      mixin_object:
        sayHello2: -> return Mixin.instanceData(this, 'Test2')
    Mixin.registerMixin(mixin_info)

    class TestClass2
    instance = new TestClass2()
    Mixin.in(instance, 'Test2')
    equal(Mixin.hasMixin(instance, 'Test2'), true, 'Test2 now mixed in')
    equal(Mixin.hasInstanceData(instance, 'Test2'), true, 'TestClass2 has Test2 instance data')
    ok(TestClass2.prototype.sayHello2, 'TestClass2 now has the class-level function sayHello2')
    equal(instance.sayHello2(), 'Hello', 'TestClass2 sayHello2 works')

    Mixin.out(instance, 'Test2')
    equal(Mixin.hasMixin(instance, 'Test2'), false, 'TestClass instance no longer reported as mixed in')
    equal(Mixin.hasInstanceData(instance, 'Test2'), false, 'TestClass2 does not have Test2 instance data')
    ok(TestClass2.prototype.sayHello2, 'TestClass still has the class-level function sayHello2')
    raises(instance.sayHello2, Error, "Mixin: no instance data on instance of 'TestClass2'")

    # unknown mixin instance data not available
    Mixin.in(instance, 'Test2')
    equal(Mixin.hasInstanceData(instance, 'Test2'), true, 'TestClass2 has Test2 instance data')
    raises(Mixin.hasInstanceData(instance, 'Unknown'), Error, "Mixin: mixin 'Unknown' instance data not found on instance of 'TestClass2'")

    Mixin.out(instance, 'Test2') # test cleanup
  )

  test("Mixin.registerMixin valid and invalid scenarios", ->
    # valid setup
    equal(Mixin.registerMixin({mixin_name: 'Ok1', mixin_object: {}}), true, "register only requires mixin_name and mixin_object")
    equal(Mixin.registerMixin({mixin_name: 'Ok2', mixin_object: {}, initialize: (->)}), true, "register can provide an initialize function")
    equal(Mixin.registerMixin({mixin_name: 'Ok3', mixin_object: {}, destroy: (->)}), true, "register can provide a destroy function")
    equal(Mixin.registerMixin({mixin_name: 'Ok4', mixin_object: {}, initialize: (->), destroy: (->)}), true, "register can provide an initialize and destroy function")

    # multiple remove
    class SomeClass
    instance = new SomeClass()
    Mixin.in(instance, 'Ok1', 'Ok2', 'Ok3')
    deepEqual(Mixin.mixins(instance), ['Ok1', 'Ok2', 'Ok3'], "'Ok1', 'Ok2', 'Ok3' are mixed in ")
    Mixin.out(instance)
    deepEqual(Mixin.mixins(instance), [], "'Ok1', 'Ok2', 'Ok3' are mixed out ")

    # invalid required parameters
    raises((-> Mixin.registerMixin()), Error, "Mixin: mixin_info missing")
    raises((-> Mixin.registerMixin({mixin_object: {}})), Error, "Mixin: mixin_name missing")
    raises((-> Mixin.registerMixin({mixin_name: {}, mixin_object: {}})), Error, "Mixin: mixin_name invalid")
    raises((-> Mixin.registerMixin({mixin_name: 'NotValid'})), Error, "Mixin: mixin_info 'NotValid' missing mixin_object")
    raises((-> Mixin.registerMixin({mixin_name: 'NotValid', mixin_object: 1})), Error, "Mixin: mixin_info 'NotValid' mixin_object is invalid")

    # invalid initialize and destroy
    raises((-> Mixin.registerMixin({mixin_name: 'NotValid', mixin_object: {}, initialize: {}})), Error, "Mixin: mixin_info 'NotValid' initialize function is invalid")
    raises((-> Mixin.registerMixin({mixin_name: 'NotValid', mixin_object: {}, destroy: {}})), Error, "Mixin: mixin_info 'NotValid' destroy function is invalid")
  )

  test("Mixin instance valid and invalid scenarios", ->
    Mixin.registerMixin({mixin_name: 'MixinType1', mixin_object: {}})
    class MixTarget

    # mixin
    instance = new MixTarget()
    ok(Mixin.in(instance, 'MixinType1')==instance, 'mixin MixinType1')
    Mixin.in(instance, 'MixinType1') # OK to mix in multiple times
    raises((->Mixin.in()), Error, "Mixin.mixin: mix_target missing")
    raises((->Mixin.in(0)), Error, "Mixin.mixin: mix_target invalid")
    raises((->Mixin.in({})), Error, "Mixin.mixin: mix_target invalid")
    raises((->Mixin.in([])), Error, "Mixin.mixin: mix_target invalid")
    raises((->Mixin.in([], 'MixinType1')), Error, "Mixin.mixin: mix_target invalid for for 'MixinType1'")
    raises((->Mixin.in(MixTarget)), Error, "Mixin.mixin: mix_target invalid")
    raises((->Mixin.in(instance)), Error, "Mixin.mixin: mixin_name missing for 'MixTarget'")
    raises((->Mixin.in(instance, 0)), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.in(instance, {})), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.in(instance, [])), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.in(instance, instance)), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.in(instance, MixTarget)), Error, "Mixin.mixin: mixin_name invalid for 'MixTarget'")
    Mixin.out(instance, 'MixinType1') # test cleanup

    # mixout
    instance = new MixTarget()
    Mixin.in(instance, 'MixinType1')
    ok(Mixin.out(instance, 'MixinType1')==instance, 'mixin MixinType1')
    raises((->Mixin.out()), Error, "Mixin.mixout: mix_target missing")
    raises((->Mixin.out(0)), Error, "Mixin.mixout: mix_target invalid")
    raises((->Mixin.out({})), Error, "Mixin.mixout: mix_target invalid")
    raises((->Mixin.out([])), Error, "Mixin.mixout: mix_target invalid")
    raises((->Mixin.out([], 'MixinType1')), Error, "Mixin.mixout: mix_target invalid for for 'MixinType1'")
    raises((->Mixin.out(MixTarget)), Error, "Mixin.mixout: mix_target invalid")
    raises((->Mixin.out(instance, 0)), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.out(instance, {})), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.out(instance, [])), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.out(instance, instance)), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.out(instance, MixTarget)), Error, "Mixin.mixout: mixin_name invalid for 'MixTarget'")

    # hasMixin/exists
    instance = new MixTarget()
    Mixin.in(instance, 'MixinType1')
    equal(Mixin.hasMixin(instance, 'MixinType1'), true, 'mixin MixinType1')
    equal(Mixin.exists(instance, 'MixinType2'), false, 'mixin MixinType1')
    raises((->Mixin.hasMixin()), Error, "Mixin.hasMixin: mix_target missing")
    raises((->Mixin.hasMixin(0)), Error, "Mixin.hasMixin: mix_target invalid")
    raises((->Mixin.hasMixin({})), Error, "Mixin.hasMixin: mix_target invalid")
    raises((->Mixin.hasMixin([])), Error, "Mixin.hasMixin: mix_target invalid")
    raises((->Mixin.hasMixin([], 'MixinType1')), Error, "Mixin.hasMixin: mix_target invalid for for 'MixinType1")
    raises((->Mixin.hasMixin(MixTarget)), Error, "Mixin.hasMixin: mix_target invalid")
    raises((->Mixin.hasMixin(instance, 0)), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasMixin(instance, {})), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasMixin(instance, [])), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasMixin(instance, instance)), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasMixin(instance, MixTarget)), Error, "Mixin.hasMixin: mixin_name invalid for 'MixTarget'")
    Mixin.out(instance, 'MixinType1') # test cleanup

    # mixins
    Mixin.registerMixin({mixin_name: 'MixinType2', mixin_object: {}})
    Mixin.registerMixin({mixin_name: 'MixinType3', mixin_object: {}})
    instance = new MixTarget()
    Mixin.in(instance, 'MixinType1', 'MixinType2')
    deepEqual(Mixin.mixins(instance), ['MixinType1', 'MixinType2'], "mixins ['MixinType1', 'MixinType2']")
    Mixin.out(instance, 'MixinType1', 'MixinType2') # test cleanup
    instance = new MixTarget()
    Mixin.in(instance, 'MixinType1', 'MixinType2', ['MixinType3'])
    deepEqual(Mixin.mixins(instance), ['MixinType1', 'MixinType2', 'MixinType3'], "mixins ['MixinType1', 'MixinType2', 'MixinType3']")
    raises((->Mixin.mixins()), Error, "Mixin.mixins: mix_target missing")
    raises((->Mixin.mixins(0)), Error, "Mixin.mixins: mix_target invalid")
    raises((->Mixin.mixins({})), Error, "Mixin.mixins: mix_target invalid")
    raises((->Mixin.mixins([])), Error, "Mixin.mixins: mix_target invalid")
    raises((->Mixin.mixins([], 'MixinType1')), Error, "Mixin.mixins: mix_target invalid for for 'MixinType1'")
    raises((->Mixin.mixins(MixTarget)), Error, "Mixin.mixins: mix_target invalid")
    Mixin.out(instance, 'MixinType1', 'MixinType2', 'MixinType3') # test cleanup

    # hasInstanceData/hasID
    Mixin.registerMixin({mixin_name: 'MixinWithInstanceData', initialize: (-> Mixin.instanceData(this, 'MixinWithInstanceData', true)), mixin_object: {}})
    instance = new MixTarget()
    Mixin.in(instance, 'MixinWithInstanceData')
    equal(Mixin.hasInstanceData(instance, 'MixinWithInstanceData'), true, 'hasInstanceData MixinWithInstanceData')
    equal(Mixin.hasID(instance, 'MixinWithInstanceData'), true, 'hasID MixinWithInstanceData')
    equal(Mixin.hasInstanceData(instance, 'MixinType1'), false, 'no MixinType1 instance data')
    raises((->Mixin.hasInstanceData()), Error, "Mixin.hasInstanceData: mix_target missing")
    raises((->Mixin.hasInstanceData(0)), Error, "Mixin.hasInstanceData: mix_target invalid")
    raises((->Mixin.hasInstanceData({})), Error, "Mixin.hasInstanceData: mix_target invalid")
    raises((->Mixin.hasInstanceData([])), Error, "Mixin.hasInstanceData: mix_target invalid")
    raises((->Mixin.hasInstanceData([],'MixinWithInstanceData')), Error, "Mixin.hasInstanceData: mix_target invalid for 'MixinWithInstanceData'")
    raises((->Mixin.hasInstanceData(MixTarget)), Error, "Mixin.hasInstanceData: mix_target invalid")
    raises((->Mixin.hasInstanceData(instance, 0)), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasInstanceData(instance, {})), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasInstanceData(instance, [])), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasInstanceData(instance, instance)), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.hasInstanceData(instance, MixTarget)), Error, "Mixin.hasInstanceData: mixin_name invalid for 'MixTarget'")
    Mixin.out(instance, 'MixinWithInstanceData') # test cleanup

    # instanceData/iD - get
    instance = new MixTarget()
    raises((->Mixin.instanceData(instance, 'MixinType1')), Error, "Mixin.instanceData: no instance data on 'MixTarget'")
    Mixin.in(instance, 'MixinWithInstanceData')
    equal(Mixin.instanceData(instance, 'MixinWithInstanceData'), true, 'instanceData MixinWithInstanceData')
    equal(Mixin.iD(instance, 'MixinWithInstanceData'), true, 'hasID MixinWithInstanceData')
    raises((->Mixin.instanceData(instance, 'MixinType2')), Error, "Mixin.instanceData: mixin 'MixinType2' instance data not found on 'MixTarget'")
    raises((->Mixin.instanceData(instance, 'MixinType1')), Error, "Mixin.instanceData: mix_target invalid")
    raises((->Mixin.instanceData()), Error, "Mixin.instanceData: mix_target missing")
    raises((->Mixin.instanceData(0)), Error, "Mixin.instanceData: mix_target invalid")
    raises((->Mixin.instanceData({})), Error, "Mixin.instanceData: mix_target invalid")
    raises((->Mixin.instanceData([])), Error, "Mixin.instanceData: mix_target invalid")
    raises((->Mixin.instanceData([], 'MixinWithInstanceData')), Error, "Mixin.instanceData: mix_target invalid for 'MixinWithInstanceData'")
    raises((->Mixin.instanceData(MixTarget)), Error, "Mixin.instanceData: mix_target invalid")
    raises((->Mixin.instanceData(instance, 0)), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, {})), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, [])), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, instance)), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, MixTarget)), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    Mixin.out(instance, 'MixinWithInstanceData') # test cleanup

    # instanceData/iD - set
    instance = new MixTarget()
    raises((->Mixin.instanceData(instance, 'MixinType1')), Error, "Mixin.instanceData: mixin 'MixinType1' not mixed into 'MixTarget'")
    Mixin.in(instance, 'MixinWithInstanceData')
    equal(Mixin.instanceData(instance, 'MixinWithInstanceData', false), false, 'hasInstanceData MixinWithInstanceData')
    equal(Mixin.iD(instance, 'MixinWithInstanceData', 'Hello'), 'Hello', 'hasID MixinWithInstanceData')
    raises((->Mixin.instanceData(instance, 'MixinType2', 'Set')), Error, "Mixin.instanceData: mixin 'MixinType2' instance data not found on 'MixTarget'")
    raises((->Mixin.instanceData(instance, 'MixinType1', 'Set')), Error, "Mixin.instanceData: mix_target invalid")
    raises((->Mixin.instanceData([], 'MixinWithInstanceData', 'Set')), Error, "Mixin.instanceData: mix_target invalid for 'MixinWithInstanceData'")
    raises((->Mixin.instanceData(MixTarget)), Error, "Mixin.instanceData: mix_target invalid")
    raises((->Mixin.instanceData(instance, 0, 'Set')), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, {}, 'Set')), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, [], 'Set')), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, instance, 'Set')), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    raises((->Mixin.instanceData(instance, MixTarget, 'Set')), Error, "Mixin.instanceData: mixin_name invalid for 'MixTarget'")
    Mixin.out(instance, 'MixinWithInstanceData') # test cleanup
  )

  test("Mixin mix_info with overwrite", ->
    class OverwriteTestPreOverwrite
      constructor: -> Mixin.in(this, 'Overwrite')
      destroy: -> Mixin.out(this, 'Overwrite')

    class OverwriteTestPostOverwrite
      constructor: -> Mixin.in(this, 'Overwrite')
      destroy: -> Mixin.out(this, 'Overwrite')

    equal(Mixin.registerMixin({mixin_name: 'Overwrite', mixin_object: {someFunction: -> return true}}), true, "Overwrite now registered")
    instance_pre_overwrite = new OverwriteTestPreOverwrite()
    equal(instance_pre_overwrite.someFunction(), true, "someFunction from first Overwrite mixin")

    # overwrite failure
    raises((-> Mixin.registerMixin({mixin_name: 'Overwrite', mixin_object: {}})), Error, "Mixin: mixin_info 'Overwrite' already registered")
    equal(instance_pre_overwrite.someFunction(), true, "someFunction from first Overwrite mixin (no change on failed force)")

    # overwrite success
    equal(Mixin.registerMixin({mixin_name: 'Overwrite', mixin_object: {someFunction: -> return false}}, true), true, "overwriting an exisiting mixin is OK")
    equal(instance_pre_overwrite.someFunction(), true, "someFunction from first Overwrite mixin (no change on successful force)")
    instance_pre_overwrite2 = new OverwriteTestPreOverwrite()
    equal(instance_pre_overwrite2.someFunction(), true, "new instances of OverwriteTestPreOverwrite keep the pre-overwrite mixin")
    instance_post_overwrite = new OverwriteTestPostOverwrite()
    equal(instance_post_overwrite.someFunction(), false, "instances of OverwriteTestPostOverwrite that have their first mixin after overwrite use the new mixin")

    # test cleanup
    instance_pre_overwrite.destroy()
    instance_pre_overwrite2.destroy()
    instance_post_overwrite.destroy()
  )

  test("Mixin target validity", ->
    class MixinTarget
      mySpecialFunction: -> return false
    instance = new MixinTarget()

    # attempting to clobber an existing class function
    equal(Mixin.registerMixin({mixin_name: 'Clobber', mixin_object: {mySpecialFunction: -> return true}}), true, "Clobber now registered")
    raises((-> Mixin.in(instance, 'Clobber')), Error, "Mixin: cannot mixin 'Clobber' because 'mySpecialFunction' already exists on 'MixinTarget'")

    # attempting to clobber an existing mixin function
    equal(Mixin.registerMixin({mixin_name: 'Conflict1', mixin_object: {someFunction: -> return true}}), true, "Conflict1 now registered")
    equal(Mixin.registerMixin({mixin_name: 'Conflict2', mixin_object: {someFunction: -> return true}}), true, "Conflict2 now registered")
    Mixin.in(instance, 'Conflict1')
    equal(Mixin.hasMixin(instance, 'Conflict1'), true, 'Conflict1 now mixed in')
    raises((-> Mixin.in(instance, 'Conflict2')), Error, "Mixin: cannot mixin 'Conflict2' because 'someFunction' already exists on 'MixinTarget'")
    Mixin.out(instance, 'Conflict1') # test cleanup

    # attempting to mix into non-classes
    equal(Mixin.registerMixin({mixin_name: 'NonInstance', mixin_object: {}}), true, "NonInstance now registered")
    raises((-> Mixin.in(1, 'NonInstance')), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of 1 is invalid")
    raises((-> Mixin.in([], 'NonInstance')), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of [] is invalid")
    raises((-> Mixin.in({}, 'NonInstance')), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of {} is invalid")
    raises((-> Mixin.in((->), 'NonInstance')), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of function is invalid")
    class AClass
    raises((-> Mixin.in(AClass, 'NonInstance')), Error, "Mixin: cannot mixin 'NonInstance' because mix_target of constructor is invalid (must be an instance)")
  )

  test("Mixin chaining and multiple mixins", ->
    equal(Mixin.registerMixin({mixin_name: 'Multiple1', mixin_object: {}}), true, "Multiple1 now registered")
    equal(Mixin.registerMixin({mixin_name: 'Multiple2', mixin_object: {}}), true, "Multiple2 now registered")
    equal(Mixin.registerMixin({mixin_name: 'Multiple3', mixin_object: {}}), true, "Multiple3 now registered")

    # chaining
    class MixinChainingTarget
    instance = new MixinChainingTarget()
    equal(Mixin.hasMixin(instance, 'Multiple1'), false, 'c: Multiple1 not mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple2'), false, 'c: Multiple2 not mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple3'), false, 'c: Multiple3 not mixed in')
    Mixin.in( Mixin.in( Mixin.in(instance, 'Multiple1'), 'Multiple2'), 'Multiple3')
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'c: Multiple1 now mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple2'), true, 'c: Multiple2 now mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'c: Multiple3 now mixed in')
    Mixin.out(instance, 'Multiple1', 'Multiple2', 'Multiple3') # test cleanup

    # manual mixin
    instance = new MixinChainingTarget()
    equal(Mixin.hasMixin(instance, 'Multiple1'), false, 'mm: Multiple1 not mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple2'), false, 'mm: Multiple2 not mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple3'), false, 'mm: Multiple3 not mixed in')
    Mixin.in(instance, 'Multiple1', 'Multiple2', 'Multiple3')
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'mm: Multiple1 now mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple2'), true, 'mm: Multiple2 now mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'mm: Multiple3 now mixed in')
    deepEqual(Mixin.mixins(instance), ['Multiple1', 'Multiple2', 'Multiple3'], "mm: ['Multiple1', 'Multiple2', 'Multiple3'] now mixed in")
    Mixin.out(instance, 'Multiple1', 'Multiple2', 'Multiple3') # test cleanup

    # constructor mixin
    class MixinMultipleTarget
      constructor: -> Mixin.in(this, 'Multiple1', 'Multiple2', 'Multiple3')
      destroy: -> Mixin.out(this, 'Multiple1', 'Multiple2', 'Multiple3')
    instance = new MixinMultipleTarget()
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'cm: Multiple1 now mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple2'), true, 'cm: Multiple2 now mixed in')
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'cm: Multiple3 now mixed in')
    instance.destroy() # test cleanup

    # constructor mixin with parameters
    parameter_value1 = undefined
    parameter_value2 = undefined
    equal(Mixin.registerMixin({
      mixin_name: 'MultipleInitializationParams'
      initialize: (param1, param2) -> parameter_value1 = param1; parameter_value2 = param2
      mixin_object: {}
    }), true, "MultipleInitializationParams now registered")
    class MixinMultipleTarget
      constructor: -> Mixin.in(this, 'Multiple1', ['MultipleInitializationParams', 'Hello World!'], ['Multiple3'])
      destroy: -> Mixin.out(this, 'Multiple1', 'MultipleInitializationParams', 'Multiple3')
    parameter_value1 = undefined; parameter_value2 = undefined; instance = new MixinMultipleTarget()
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'm,[m,p],m: Multiple1 now mixed in')
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,[m,p],m: MultipleInitializationParams now mixed in')
    equal(parameter_value1, 'Hello World!', 'm,[m,p],m: MultipleInitializationParams received the parameter')
    equal(Mixin.hasMixin(instance, 'Multiple3'), true, 'm,[m,p],m: Multiple3 now mixed in')
    instance.destroy() # test cleanup

    # manual mixin differentiaing types and parameters - Mixin, param1, param2
    parameter_value1 = undefined; parameter_value2 = undefined; instance = new MixinChainingTarget()
    ok(Mixin.in(instance, 'MultipleInitializationParams', 'my_parameter', 2)==instance, 'm,p1,p2: correctly inferered my_parameter and 2 are not mixins')
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,p1,p2: MultipleInitializationParams now mixed in')
    equal(parameter_value1, 'my_parameter', 'm,p1,p2: MultipleInitializationParams received parameter1')
    equal(parameter_value2, 2, 'm,p1,p2: MultipleInitializationParams received parameter2')
    Mixin.out(instance, 'MultipleInitializationParams') # test cleanup

    # manual mixin differentiaing types and parameters - Mixin, [param1, param2]
    parameter_value1 = undefined; parameter_value2 = 'bye bye'; instance = new MixinChainingTarget()
    ok(Mixin.in(instance, 'MultipleInitializationParams', ['my_parameter', 2])==instance, 'm,[p1,p2]: correctly inferered [my_parameter and 2] are not mixins')
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,[p1,p2]: MultipleInitializationParams now mixed in')
    ok(parameter_value1[0]=='my_parameter' and parameter_value1[1]==2, 'm,[p1,p2]: MultipleInitializationParams received parameter1')
    equal(parameter_value2, undefined, 'm,[p1,p2]: MultipleInitializationParams received parameter2')
    Mixin.out(instance, 'MultipleInitializationParams') # test cleanup

    # manual mixin differentiaing types and parameters - Mixin, [Mixin, param2]
    parameter_value1 = undefined; parameter_value2 = 'bye bye'; instance = new MixinChainingTarget()
    ok(Mixin.in(instance, 'Multiple1', ['MultipleInitializationParams', 2])==instance, 'm,[m,p2]: correctly inferered Multiple2 is a mixin')
    equal(Mixin.hasMixin(instance, 'Multiple1'), true, 'm,[m,p2]: MultipleInitializationParams now mixed in')
    equal(Mixin.hasMixin(instance, 'MultipleInitializationParams'), true, 'm,[m,p2]: MultipleInitializationParams now mixed in')
    equal(parameter_value1, 2, 'm,[m,p2]: MultipleInitializationParams received parameter2')
    equal(parameter_value2, undefined, 'm,[m,p2]: MultipleInitializationParams received parameter2')
    Mixin.out(instance, 'Multiple1', 'MultipleInitializationParams') # test cleanup
  )

  test("Mixin ordering", ->
    equal(Mixin.registerMixin({
      mixin_name: 'Ordering'
      initialize: -> Mixin.instanceData(this, 'Ordering', [])
      mixin_object: {}
    }), true, "Ordering now registered")

    # mixing into the super class does not affect existing instances, but does affect new instances
    class SuperClass_1
    class SubClass1_1 extends SuperClass_1
    super_instance = new SuperClass_1()
    sub_instance1 = new SubClass1_1()
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test1: Ordering not mixed in')
    equal(Mixin.hasMixin(sub_instance1, 'Ordering'), false, 'test1: Ordering not mixed in')
    Mixin.in(super_instance, 'Ordering')
    equal(Mixin.hasMixin(super_instance, 'Ordering'), true, 'test1: Ordering is mixed in')
    equal(Mixin.hasMixin(sub_instance1, 'Ordering'), false, 'test1: Ordering is not mixed in because it was created before the super class mixin')
    equal(Mixin.hasInstanceData(sub_instance1, 'Ordering'), false, 'test1: Ordering instance data does not exist because it was created before the super class mixin')
    sub_instance2 = new SubClass1_1()
    equal(Mixin.hasMixin(sub_instance2, 'Ordering'), false, 'test1: Ordering has not yet been initialized')
    equal(Mixin.hasInstanceData(sub_instance2, 'Ordering'), false, 'test1: Ordering instance data does exist because it has not yet been initialized')
    Mixin.out(super_instance, 'Ordering') # test cleanup

    # mixing into the super class affects new instances
    class SuperClass_2
    class SubClass1_2 extends SuperClass_2
    super_instance = new SuperClass_2()
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test2: Ordering not mixed in')
    Mixin.in(super_instance, 'Ordering')
    sub_instance = new SubClass1_2()
    equal(Mixin.hasMixin(super_instance, 'Ordering'), true, 'test2: Ordering is mixed in')
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), false, 'test2: Ordering has not yet been initialized')
    equal(Mixin.hasInstanceData(sub_instance, 'Ordering'), false, 'test2: Ordering instance data does exist because it has not yet been initialized')
    Mixin.out(super_instance, 'Ordering') # test cleanup

    # mixing into the sub class does not affect the super class (mixin before creating super class)
    class SuperClass_3
    class SubClass1_3 extends SuperClass_3
    sub_instance = new SubClass1_3()
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), false, 'test3: Ordering not mixed in')
    Mixin.in(sub_instance, 'Ordering')
    super_instance = new SuperClass_3()
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), true, 'test3: Ordering is mixed in')
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test3: Ordering is mixed in')
    equal(Mixin.hasInstanceData(sub_instance, 'Ordering'), true, 'test3: Ordering instance data does exist')
    equal(Mixin.hasInstanceData(super_instance, 'Ordering'), false, 'test3: Ordering instance data does exist')
    Mixin.out(sub_instance, 'Ordering') # test cleanup

    # mixing into the sub class does not affect the super class (mixin after creating super class)
    class SuperClass_4
    class SubClass1_4 extends SuperClass_4
    sub_instance = new SubClass1_4()
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), false, 'test4: Ordering not mixed in')
    super_instance = new SuperClass_4()
    Mixin.in(sub_instance, 'Ordering')
    equal(Mixin.hasMixin(sub_instance, 'Ordering'), true, 'test4: Ordering is mixed in')
    equal(Mixin.hasMixin(super_instance, 'Ordering'), false, 'test4: Ordering is mixed in')
    equal(Mixin.hasInstanceData(sub_instance, 'Ordering'), true, 'test4: Ordering instance data does exist')
    equal(Mixin.hasInstanceData(super_instance, 'Ordering'), false, 'test4: Ordering instance data does exist')
    Mixin.out(sub_instance, 'Ordering') # test cleanup

    # mixin into a sibling class does not affect the other sibling class (mixin before creating instance)
    class SuperClass_5
    class SubClass1_5 extends SuperClass_5
    class SubClass2_5 extends SuperClass_5
    sibling_instance1 = new SubClass1_5()
    equal(Mixin.hasMixin(sibling_instance1, 'Ordering'), false, 'test5: Ordering not mixed in')
    Mixin.in(sibling_instance1, 'Ordering')
    equal(Mixin.hasMixin(sibling_instance1, 'Ordering'), true, 'test5: Ordering mixed in')
    equal(Mixin.hasInstanceData(sibling_instance1, 'Ordering'), true, 'test5: Ordering instance data exists')
    sibling_instance2 = new SubClass2_5()
    equal(Mixin.hasMixin(sibling_instance2, 'Ordering'), false, 'test5: Ordering not mixed in')
    equal(Mixin.hasInstanceData(sibling_instance2, 'Ordering'), false, 'test5: Ordering instance data exists')
    Mixin.out(sibling_instance1, 'Ordering') # test cleanup
  )

  test("TEST CLEANUP", ->
    Mixin._statistics.update()
    mixins_with_instances = Mixin._statistics.byMixin_getInstances()
    equal(_.size(mixins_with_instances), 0, 'No mixed instances: Memory is clean')
    equal(Mixin._statistics.byInstance_withData().length, 0, 'No instance data: Memory is clean')
  )
)