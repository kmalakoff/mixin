$(document).ready( ->
  module("Mixin.AutoMemory")
  test("TEST DEPENDENCY MISSING", ->
    _.VERSION; _.AWESOMENESS.Underscore_Awesome
    Mixin.AutoMemory.AutoMemory
  )

  test("Use case: autoProperty common usage", ->
    some_property_destroy_count = 0
    class SomeProperty
      destroy: -> some_property_destroy_count++
    class AutoPropertyCommon
      constructor: ->
        Mixin.in(this, 'AutoMemory')
        @hello = new SomeProperty(); @autoProperty('hello', 'destroy')
        @$el = null; @autoProperty('$el', 'remove')
        @render()

      destroy: ->
        Mixin.out(this, 'AutoMemory')

      render: ->
        @$el = $('<div id="hello"></div>').appendTo($('body'))

    instance = new AutoPropertyCommon()
    ok(!!instance.hello, "instance.hello exists")
    ok(!!instance.$el, "instance.$el exists")
    $el = $('body').children('div#hello')
    equal($el[0], instance.$el[0], "element was found in the DOM")
    instance.destroy()
    ok(!instance.hello, "instance.hello does not exist")
    ok(!instance.$el, "instance.$el does not exist")
    $el = $('body').children('div#hello')
    equal($el.length, 0, "element was not found in the DOM")

    class AutoPropertyByArray
      constructor: ->
        Mixin.in(this, 'AutoMemory')
        @you = 'you'; @are = 'are'; @here = 'here'
        @autoProperty(['you', 'are', 'here'])
      destroy: ->
        Mixin.out(this, 'AutoMemory')

    instance = new AutoPropertyByArray()
    ok(instance.you and instance.are and instance.here, "you are here")
    instance.destroy()
    ok(not (instance.you and instance.are and instance.here), "you are not here")
  )

  test("autoProperty valid and invalid", ->
    class AutoProperty
      constructor: ->
        Mixin.in(this, 'AutoMemory')
      destroy: ->
        Mixin.out(this, 'AutoMemory')

    # property clear
    instance = new AutoProperty()
    instance.prop1 = 'Hello'; instance.autoProperty('prop1')
    prop_2_cleared = false
    instance.prop2 = 'World'; instance.autoProperty('prop2', (prop2) -> prop_2_cleared=true if (prop2==instance.prop2) )
    instance.prop3 = $('<div></div>'); instance.autoProperty('prop3')
    instance.prop4 = null; instance.autoProperty('prop4')
    instance.destroy()
    equal(instance.prop1, null, "instance.prop1 cleared")
    equal(instance.prop2, null, "instance.prop2 cleared")
    equal(prop_2_cleared, true, "instance.prop2 cleared true")
    equal(instance.prop3, null, "instance.prop3 cleared - breaking DOM reference")
    equal(instance.prop4, null, "instance.prop4 ignored")

    # property function
    some_property_destroy_count = 0
    some_property_param1 = undefined
    some_property_param2 = undefined
    class SomeProperty
      destroy: -> some_property_destroy_count++
      destroy_with_params: (param1, param2) -> some_property_destroy_count++; some_property_param1=param1; some_property_param2=param2
    instance = new AutoProperty()
    instance.some_prop1 = new SomeProperty(); instance.autoProperty('some_prop1', 'destroy')
    instance.some_prop2 = new SomeProperty(); instance.autoProperty('some_prop2', 'destroy')
    instance.some_prop3 = new SomeProperty(); instance.autoProperty('some_prop3', 'destroy_with_params', 'Hello', 42)
    instance.destroy()
    equal(some_property_destroy_count, 3, "3 destroyed")
    equal(instance.some_prop1, null, "instance.some_prop1 destroyed")
    equal(instance.some_prop2, null, "instance.some_prop2 destroyed")
    equal(instance.some_prop3, null, "instance.some_prop3 destroyed")
    equal(some_property_param1, 'Hello', "instance.some_prop3 destroy function received 'Hello'")
    equal(some_property_param2, 42, "instance.some_prop3 destroy function received 42")

    # invalid
    instance = new AutoProperty()
    raises((->instance.autoProperty()), Error, "Mixin.AutoMemory: missing key on 'AutoProperty'")
    raises((->instance.autoProperty('prop1')), Error, "Mixin.AutoMemory: property 'prop1' doesn't exist on 'AutoProperty'")
    instance.prop1 = 'Hello'; instance.autoProperty('prop1')
    raises((->instance.autoProperty('prop1', 43)), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoProperty'")
    raises((->instance.autoProperty('prop1', {})), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoProperty'")
    raises((->instance.autoProperty('prop1', [])), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoProperty'")
    instance.prop2 = new SomeProperty(); instance.autoProperty('prop1', 'imaginaryFunction')
    raises(instance.destroy, Error, "Mixin.AutoMemory: function 'imaginaryFunction' missing for property 'prop1' on 'AutoProperty'")

    class AutoWrappedPropertyByArray
      constructor: ->
        Mixin.in(this, 'AutoMemory')
        @you = 'you'; @are = 'are'; @here = 'here'
        @autoWrappedProperty(['you', 'are', 'here'])
      destroy: ->
        Mixin.out(this, 'AutoMemory')

    instance = new AutoWrappedPropertyByArray()
    ok(instance.you and instance.are and instance.here, "you are here")
    instance.destroy()
    ok(not (instance.you and instance.are and instance.here), "you are not here")
  )

  test("autoWrappedProperty common usage", ->
    class AutoWrappedPropertyCommon
      constructor: ->
        Mixin.in(this, 'AutoMemory')
        @el = null; @autoWrappedProperty('el', 'remove')
        @el_waiting = null; @autoWrappedProperty('el_waiting', ['appendTo', $('body')])
        @render()

      destroy: ->
        Mixin.out(this, 'AutoMemory')

      render: ->
        @el = $('<div id="hello2"></div>').appendTo($('body'))[0]
        @el_waiting = $('<div id="waiting"></div>').remove()[0]

    instance = new AutoWrappedPropertyCommon()
    ok(!!instance.el, "instance.el #hello2 exists")
    $el = $('body').children('div#hello2')
    equal($el[0], instance.el, "element #hello2 was found in the DOM")
    ok(!!instance.el_waiting, "instance.el #waiting exists")
    $el_waiting = $('body').children('div#waiting')
    equal($el_waiting.length, 0, "element #waiting was not found in the DOM")
    equal(instance.el_waiting.parentNode, null, "element #waiting has no parent")
    instance.destroy()
    ok(!instance.el, "instance.el #hello2 does not exist")
    ok(!instance.el_waiting, "instance.el_waiting #waiting does not exist")
    $el = $('body').children('div#hello2')
    equal($el.length, 0, "element was not found in the DOM")
    $el_waiting = $('body').children('div#waiting')
    equal($el_waiting.length, 1, "element was found in the DOM")
    $el_waiting.remove()
  )

  test("Use case: autoWrappedProperty valid and invalid", ->
    class AutoWrappedProperty
      constructor: ->
        Mixin.in(this, 'AutoMemory')
      destroy: ->
        Mixin.out(this, 'AutoMemory')

    # property clear
    instance = new AutoWrappedProperty()
    instance.prop1 = 'Hello'; instance.autoWrappedProperty('prop1')
    instance.prop2 = $('<div></div>'); instance.autoWrappedProperty('prop2')
    instance.prop3 = $('<div></div>'); instance.autoWrappedProperty('prop3', 'remove')
    instance.prop4 = $('<div></div>'); instance.autoWrappedProperty('prop4', ['appendTo', $('body')])
    # instance.prop5 = $('<div></div>'); instance.autoWrappedProperty('prop5', 'remove', jQuery)
    prop_6_cleared = false
    instance.prop6 = $('<div></div>'); instance.autoWrappedProperty('prop6', (prop6) -> prop_6_cleared=true if (prop6[0]==instance.prop6[0]))
    instance.prop7 = null; instance.autoWrappedProperty('prop6')
    instance.destroy()
    equal(instance.prop1, null, "instance.prop1 cleared")
    equal(instance.prop2, null, "instance.prop2 cleared - breaking DOM reference")
    equal(instance.prop3, null, "instance.prop3 cleared - breaking DOM reference")
    equal(instance.prop4, null, "instance.prop4 cleared - breaking DOM reference")
    # equal(instance.prop5, null, "instance.prop5 cleared - breaking DOM reference")
    equal(instance.prop6, null, "instance.prop6 cleared")
    equal(prop_6_cleared, true, "instance.prop6 cleared true")
    equal(instance.prop7, null, "instance.prop7 ignored")

    # invalid
    instance = new AutoWrappedProperty()
    raises((->instance.autoWrappedProperty()), Error, "Mixin.AutoMemory: missing key on 'AutoWrappedProperty'")
    raises((->instance.autoWrappedProperty('prop1')), Error, "Mixin.AutoMemory: property 'prop1' doesn't exist on 'AutoWrappedProperty'")
    instance.prop1 = 'Hello'; instance.autoWrappedProperty('prop1')
    raises((->instance.autoWrappedProperty('prop1', 43)), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoWrappedProperty'")
    raises((->instance.autoWrappedProperty('prop1', {})), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoWrappedProperty'")
    raises((->instance.autoWrappedProperty('prop1', [])), Error, "Mixin.AutoMemory: unexpected function reference for property 'prop1' on 'AutoWrappedProperty'")
    class SomeProperty
    instance.prop2 = new SomeProperty(); instance.autoWrappedProperty('prop1', 'imaginaryFunction')
    raises(instance.destroy, Error, "Mixin.AutoMemory: function 'imaginaryFunction' missing for property 'prop1' on 'AutoWrappedProperty'")
  )

  test("autoFunction common usage", ->
    property_function_call_count = 0
    special_function_call_count = 0
    special_function_param1 = undefined
    special_function_param2 = undefined
    class SomePropertyWithSpecialFunction
      specialFunction: (param1, param2) ->
        special_function_call_count++
        special_function_param1 = param1
        special_function_param2 = param2

    instance_function_call_count = 0
    custom_cleanup_call_count = 0
    custom_cleanup_param1 = undefined
    custom_cleanup_param2 = undefined
    class AutoFunctionCommon
      constructor: ->
        Mixin.in(this, 'AutoMemory')
        this.prop1 = new SomePropertyWithSpecialFunction(); @autoFunction(this.prop1, 'specialFunction').autoFunction(this.prop1, 'specialFunction').autoFunction(this.prop1, 'specialFunction')
        this.prop2 = new SomePropertyWithSpecialFunction(); @autoFunction(this.prop2, 'specialFunction', 'Hello', 'World!')
        @autoFunction(this.prop2, (prop) => throw new Error("Oh no") if (prop!=this.prop2); property_function_call_count++)
        @autoFunction(this, 'customCleanup').autoFunction(this, 'customCleanup').autoFunction(this, 'customCleanup', 'Hi', 'Universe!')
        @autoFunction(this, (that) => throw new Error("Now this is unexpected") if (that!=this); instance_function_call_count++)
      destroy: ->
        Mixin.out(this, 'AutoMemory')
      customCleanup: (param1, param2) ->
        custom_cleanup_call_count++
        custom_cleanup_param1 = param1
        custom_cleanup_param2 = param2
    instance = new AutoFunctionCommon()

    instance.destroy()
    equal(property_function_call_count, 1, "property_function_call_count 1")
    equal(special_function_call_count, 4, "special_function_call_count 4")
    equal(special_function_param1, 'Hello', "special_function_param1 'Hello'")
    equal(special_function_param2, 'World!', "special_function_param2 'World!'")

    equal(instance_function_call_count, 1, "instance_function_call_count 1")
    equal(custom_cleanup_call_count, 3, "custom_cleanup_call_count 3")
    equal(custom_cleanup_param1, 'Hi', "custom_cleanup_param1 'Hi'")
    equal(custom_cleanup_param2, 'Universe!', "custom_cleanup_param2 'Universe!'")

    function_call_count = 0
    function_param1 = undefined
    function_param2 = undefined
    class AutoFunctionCommon
      constructor: ->
        Mixin.in(this, 'AutoMemory')
        @autoFunction(null, (->function_call_count++))
        @autoFunction(null, ((param1,param2)->function_call_count++; function_param1=param1; function_param2=param2), 'Was', 'called!')
      destroy: ->
        Mixin.out(this, 'AutoMemory')

    instance = new AutoFunctionCommon()
    instance.destroy()
    equal(function_call_count, 2, "function_call_count 2")
    equal(function_param1, 'Was', "function_param1 'Was'")
    equal(function_param2, 'called!', "function_param2 'called!'")
  )

  test("Use case: autoFunction valid and invalid", ->
    class AutoFunction
      constructor: ->
        Mixin.in(this, 'AutoMemory')
      destroy: ->
        Mixin.out(this, 'AutoMemory')

    # invalid - object functions
    instance = new AutoFunction()
    raises((->instance.autoFunction(instance, 43)), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(instance, {})), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(instance, [])), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(instance, 'imaginaryFunction')), Error, "Mixin.AutoMemory: unexpected function reference")

    # invalid - functions
    instance = new AutoFunction()
    raises((->instance.autoFunction(null)), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(null, 43)), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(null, {})), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(null, [])), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(undefined, 43)), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(undefined, {})), Error, "Mixin.AutoMemory: unexpected function reference")
    raises((->instance.autoFunction(undefined, [])), Error, "Mixin.AutoMemory: unexpected function reference")
  )

  test("Use case: chaining", ->
    call_count = 0
    class Chaining
      constructor: ->
        Mixin.in(this, 'AutoMemory')
        @prop1 = 'chainer'; @prop2 = 'hello'
        @el = $('<div></div>')
        @autoProperty('prop1').autoWrappedProperty('el').autoFunction(null, (->call_count++)).autoProperty('prop2')

      destroy: ->
        Mixin.out(this, 'AutoMemory')
      instance = new Chaining()
      instance.destroy()
      ok(!instance.prop1 and !instance.prop2 and !instance.el and (call_count==1), "chaining cleared everything")
  )
)