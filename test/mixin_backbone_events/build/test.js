var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
$(document).ready(function() {
  module("Mixin.Backbone.Events");
  test("TEST DEPENDENCY MISSING", function() {
    _.VERSION;
    Backbone.Backbone;
    return Mixin.Backbone.Events.Events;
  });
  test("Use case: mixin to new classes", function() {
    var Eventful, call_count, instance;
    Eventful = (function() {
      function Eventful() {
        Mixin["in"](this, 'Backbone.Events');
      }
      Eventful.prototype.destroy = function() {
        return Mixin.out(this, 'Backbone.Events');
      };
      return Eventful;
    })();
    instance = new Eventful();
    ok(instance.bind && instance.unbind && instance.trigger, 'Backbone.Events are a go');
    call_count = 0;
    instance.bind('some_event', function() {
      return call_count++;
    });
    instance.trigger('some_event');
    instance.trigger('some_event');
    equal(call_count, 2, 'trigger called twice');
    equal(Mixin.hasMixin(instance, 'Backbone.Events'), true, 'Backbone.Events are mixed in');
    Mixin.out(instance, 'Backbone.Events');
    equal(Mixin.hasMixin(instance, 'Backbone.Events'), false, 'Backbone.Events are not mixed in');
    Mixin["in"](instance, 'Backbone.Events');
    equal(Mixin.hasMixin(instance, 'Backbone.Events'), true, 'Backbone.Events are mixed in');
    instance.destroy();
    return equal(Mixin.hasMixin(instance, 'Backbone.Events'), false, 'Backbone.Events are not mixed in');
  });
  return test("Use case: mark on native classes", function() {
    var MyCollection, marked_collection, marked_model, marked_router, marked_view, my_collection_instance, unmarked_collection, unmarked_model, unmarked_router, unmarked_view;
    unmarked_collection = new Backbone.Collection();
    unmarked_model = new Backbone.Model();
    unmarked_view = new Backbone.View();
    unmarked_router = new Backbone.Router();
    Mixin.Backbone.Events.autoMarkNative();
    marked_collection = new Backbone.Collection();
    marked_model = new Backbone.Model();
    marked_view = new Backbone.View();
    marked_router = new Backbone.Router();
    equal(Mixin.hasMixin(marked_collection, 'Backbone.Events'), true, 'Backbone.Events are mixed in');
    equal(Mixin.hasMixin(marked_model, 'Backbone.Events'), true, 'Backbone.Events are mixed in');
    equal(Mixin.hasMixin(marked_view, 'Backbone.Events'), true, 'Backbone.Events are mixed in');
    equal(Mixin.hasMixin(marked_router, 'Backbone.Events'), true, 'Backbone.Events are mixed in');
    equal(Mixin.hasMixin(unmarked_collection, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in');
    equal(Mixin.hasMixin(unmarked_model, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in');
    equal(Mixin.hasMixin(unmarked_view, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in');
    equal(Mixin.hasMixin(unmarked_router, 'Backbone.Events'), false, 'Backbone.Events are not marked as mixed in');
    MyCollection = (function() {
      __extends(MyCollection, Backbone.Collection);
      function MyCollection() {
        MyCollection.__super__.constructor.apply(this, arguments);
      }
      return MyCollection;
    })();
    my_collection_instance = new MyCollection();
    return equal(Mixin.hasMixin(my_collection_instance, 'Backbone.Events'), true, 'Backbone.Events are mixed into MyCollection');
  });
});