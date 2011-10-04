$(document).ready( ->
  module("Mixin Integration - AutoUnmix")
  test("TEST DEPENDENCY MISSING", ->
    _.VERSION; _.AWESOMENESS.Underscore_Awesome; Backbone.Backbone
    Mixin.RefCount.RefCount; Mixin.AutoMemory.AutoMemory; Mixin.Timeouts.Timeouts; Mixin.Backbone.Events.Events
  )

  test("Use case: reference counting with Mixin.out on destroy", ->
    class AutoUnmixView
      constructor: ->
        Mixin.in(this, ['RefCount', => Mixin.out(this)], 'AutoMemory', 'Timeouts')
        @loading_el = $('<div class="loading"></div>').appendTo($('body'))[0]; @autoWrappedProperty('loading_el', 'remove')
        @active_el = null; @autoWrappedProperty('active_el', 'remove')
        @addTimeout('Loading Animation', (=>@render()), 100)
      render: ->
        $(@loading_el).remove(); @loading_el=null
        @active_el = $('<div class="active"></div>').appendTo($('body'))

    view1 = new AutoUnmixView()
    equal(view1.refCount(), 1)
    ok(view1.loading_el!=null, 'view1.loading_el'); equal(view1.active_el, null, 'no view1.active_el')
    deepEqual(view1.timeouts(), ['Loading Animation'], 'animation timeout')

    Mixin._statistics.update()
    equal(Mixin._statistics.byInstance_withData().length, 1, '1 instance with data')
    equal(Mixin._statistics.byInstance_getMixins().length, 1, '1 instance')
    equal(_.size(Mixin._statistics.byMixin_getInstances()), 3, '3 live mixins on 1 view')

    view2 = new AutoUnmixView()
    equal(view2.refCount(), 1)
    ok(view2.loading_el!=null); equal(view2.active_el, null)
    deepEqual(view2.timeouts(), ['Loading Animation'], 'animation timeout')

    Mixin._statistics.update()
    equal(Mixin._statistics.byInstance_withData().length, 2, '2 instances with data')
    equal(Mixin._statistics.byInstance_getMixins().length, 2, '2 instances')
    equal(_.size(Mixin._statistics.byMixin_getInstances()), 3, '3 live mixins on 2 views')

    equal($('body').children('.loading').length, 2, 'view1.loading_el X 2')
    equal($('body').children('.active').length, 0, 'view1.active_el X 0')
    view1.release()
    ok(view1.loading_el==null, 'view1 no loading_el'); equal(view1.active_el, null, 'view1 no active_el')
    equal($('body').children('.loading').length, 1, 'view1 still loading_el')

    Mixin._statistics.update()
    equal(Mixin._statistics.byInstance_withData().length, 1, '1 instance with data')
    equal(Mixin._statistics.byInstance_getMixins().length, 1, '1 instance')
    equal(_.size(Mixin._statistics.byMixin_getInstances()), 3, '3 live mixins on 1 view')

    stop()
    setTimeout((->
      equal($('body').children('.loading').length, 0, 'view1 done loading_el')
      equal($('body').children('.active').length, 1, 'view1 now active_el')
      ok(view2.loading_el==null); ok(view2.active_el!=null)
      deepEqual(view2.timeouts(), [], 'Loading Animation timeer finished')

      view2.release()
      equal($('body').children('.active').length, 0, 'view2 no longer active_el')
      ok(view2.loading_el==null); ok(view2.active_el==null)

      Mixin._statistics.update()
      equal(Mixin._statistics.byInstance_withData().length, 0, '0 instances with data')
      equal(Mixin._statistics.byInstance_getMixins().length, 0, '0 instances')
      equal(_.size(Mixin._statistics.byMixin_getInstances()), 0, '0 live mixins')

      start()
    ), 101)
  )
  test("Use case: Backbone.Event 'destroy'", ->
    Mixin.UNMIX_ON_BACKBONE_DESTROY=true

    class SelfDestructructive
      constructor: ->
        Mixin.in(this, 'Backbone.Events', 'AutoMemory', 'Timeouts')
        @addTimeout('Waiting for Godot', (=>), 1000000000)
        @give_this_to_godot = 'time insenstive information'; @autoProperty('give_this_to_godot')

    character1 = new SelfDestructructive()
    character2 = new SelfDestructructive()

    ok(character1.give_this_to_godot!=null, 'something to share')
    ok(character2.give_this_to_godot!=null, 'something to share')
    deepEqual(character1.timeouts(), ['Waiting for Godot'], 'Waiting for Godot')
    deepEqual(character2.timeouts(), ['Waiting for Godot'], 'Waiting for Godot')

    character1.trigger('destroy')
    ok(character1.give_this_to_godot==null, 'it was a dream')
    ok(character2.give_this_to_godot!=null, 'something to share')

    character2.trigger('destroy')
    ok(character2.give_this_to_godot==null, 'it was...')

    # the end
    Mixin._statistics.update()
    equal(Mixin._statistics.byInstance_withData().length, 0, '0 instances with data')
    equal(Mixin._statistics.byInstance_getMixins().length, 0, '0 instances')
    equal(_.size(Mixin._statistics.byMixin_getInstances()), 0, '0 live mixins')
  )
)