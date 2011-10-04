$(document).ready( ->
  module("Mixin.Backbone.Events")
  test("TEST DEPENDENCY MISSING", ->
    _.VERSION; Backbone.Backbone
    Mixin.Backbone.Events.Events
  )

  test("Use case: mixin to new classes", ->
    class Eventful
      constructor: ->
        Mixin.in(this, 'Backbone.Events')
      destroy: ->
        Mixin.out(this, 'Backbone.Events')

    instance = new Eventful()
    ok(instance.bind and instance.unbind and instance.trigger, 'Backbone.Events are a go')
    call_count = 0
    instance.bind('some_event', -> call_count++)
    instance.trigger('some_event'); instance.trigger('some_event')
    equal(call_count, 2, 'trigger called twice')

    # mixout and then mixin again
    equal(Mixin.hasMixin(instance, 'Backbone.Events'), true, 'Backbone.Events are mixed in')
    Mixin.out(instance, 'Backbone.Events')
    equal(Mixin.hasMixin(instance, 'Backbone.Events'), false, 'Backbone.Events are not mixed in')
    Mixin.in(instance, 'Backbone.Events')

    # mixout not neccessary since Backbone.Events is a pure object (although _callbacks cold cause memory leaks), but you can if you want
    equal(Mixin.hasMixin(instance, 'Backbone.Events'), true, 'Backbone.Events are mixed in')
    instance.destroy()
    equal(Mixin.hasMixin(instance, 'Backbone.Events'), false, 'Backbone.Events are not mixed in')
  )

  test("Use case: mark on native classes", ->
    unmarked_collection = new Backbone.Collection()
    unmarked_model = new Backbone.Model()
    unmarked_view = new Backbone.View()
    unmarked_router = new Backbone.Router()

    Mixin.Backbone.Events.autoMarkNative()
    marked_collection = new Backbone.Collection()
    marked_model = new Backbone.Model()
    marked_view = new Backbone.View()
    marked_router = new Backbone.Router()

    equal(Mixin.hasMixin(marked_collection, 'Backbone.Events'), true, 'Backbone.Events are mixed in')
    equal(Mixin.hasMixin(marked_model, 'Backbone.Events'), true, 'Backbone.Events are mixed in')
    equal(Mixin.hasMixin(marked_view, 'Backbone.Events'), true, 'Backbone.Events are mixed in')
    equal(Mixin.hasMixin(marked_router, 'Backbone.Events'), true, 'Backbone.Events are mixed in')

    equal(Mixin.hasMixin(unmarked_collection, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in')
    equal(Mixin.hasMixin(unmarked_model, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in')
    equal(Mixin.hasMixin(unmarked_view, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in')
    equal(Mixin.hasMixin(unmarked_router, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in')

    class MyCollection extends Backbone.Collection
    my_collection_instance = new MyCollection()
    equal(Mixin.hasMixin(my_collection_instance, 'Backbone.Events'), true, 'Backbone.Events are mixed into MyCollection')
  )
)