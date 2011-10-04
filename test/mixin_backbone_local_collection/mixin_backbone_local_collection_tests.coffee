$(document).ready( ->
  module("Mixin.Backbone.LocalCollection")
  test("TEST DEPENDENCY MISSING", ->
    _.VERSION; Backbone.Backbone
    Mixin.Backbone.LocalCollection.LocalCollection
  )

  test("Use case: basic usage and invalid target", ->
    # local collection assigning id
    class LocalCollection extends Backbone.Collection
      constructor: ->
        Mixin.in(this, 'Backbone.LocalCollection')
        super
    remote_collection = new Backbone.Collection(); remote_model = new Backbone.Model()
    remote_collection.add(remote_model)
    ok(!remote_model.id, 'remote model has no id on add')
    local_collection = new LocalCollection(); local_model = new Backbone.Model()
    local_collection.add(local_model)
    ok(!!local_model.id, 'local model is assigned an id on add')

    # local collection obvious remote methods are blocked
    raises(local_collection.url, Error, "Mixin.Backbone.LocalCollection: url is not available for local collection 'LocalCollection'")
    raises(local_collection.parse, Error, "Mixin.Backbone.LocalCollection: parse is not available for local collection 'LocalCollection'")
    raises(local_collection.fetch, Error, "Mixin.Backbone.LocalCollection: fetch is not available for local collection 'LocalCollection'")

    # not a valid target
    class NotABackboneCollection
      constructor: ->
        Mixin.in(this, 'Backbone.LocalCollection')
    raises((->new NotABackboneCollection()), Error, "Mixin.Backbone.LocalCollection: the mix_target 'NotABackboneCollection' is not a Backbone.Collection")
  )
)