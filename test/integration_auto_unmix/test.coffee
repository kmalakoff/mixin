$(document).ready( ->
  module("Mixin Integration - AutoUnmix")

  # import Mixin and Underscore
  Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin') else window.Mixin
  _ = if not window._ and (typeof(require) != 'undefined') then require('underscore') else window._
  _ = Mixin._ unless _

  test("TEST DEPENDENCY MISSING", ->
    ok(!!Mixin); ok(!!Mixin.RefCount); ok(!!Mixin.AutoMemory); ok(!!Mixin.Timeouts)
    ok(!!_)
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
)