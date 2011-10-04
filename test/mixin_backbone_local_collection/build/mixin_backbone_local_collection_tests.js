var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
$(document).ready(function() {
  module("Mixin.Backbone.LocalCollection");
  test("TEST DEPENDENCY MISSING", function() {
    _.VERSION;
    Backbone.Backbone;
    return Mixin.Backbone.LocalCollection.LocalCollection;
  });
  return test("Use case: basic usage and invalid target", function() {
    var LocalCollection, NotABackboneCollection, local_collection, local_model, remote_collection, remote_model;
    LocalCollection = (function() {
      __extends(LocalCollection, Backbone.Collection);
      function LocalCollection() {
        Mixin["in"](this, 'Backbone.LocalCollection');
        LocalCollection.__super__.constructor.apply(this, arguments);
      }
      return LocalCollection;
    })();
    remote_collection = new Backbone.Collection();
    remote_model = new Backbone.Model();
    remote_collection.add(remote_model);
    ok(!remote_model.id, 'remote model has no id on add');
    local_collection = new LocalCollection();
    local_model = new Backbone.Model();
    local_collection.add(local_model);
    ok(!!local_model.id, 'local model is assigned an id on add');
    raises(local_collection.url, Error, "Mixin.Backbone.LocalCollection: url is not available for local collection 'LocalCollection'");
    raises(local_collection.parse, Error, "Mixin.Backbone.LocalCollection: parse is not available for local collection 'LocalCollection'");
    raises(local_collection.fetch, Error, "Mixin.Backbone.LocalCollection: fetch is not available for local collection 'LocalCollection'");
    NotABackboneCollection = (function() {
      function NotABackboneCollection() {
        Mixin["in"](this, 'Backbone.LocalCollection');
      }
      return NotABackboneCollection;
    })();
    return raises((function() {
      return new NotABackboneCollection();
    }), Error, "Mixin.Backbone.LocalCollection: the mix_target 'NotABackboneCollection' is not a Backbone.Collection");
  });
});