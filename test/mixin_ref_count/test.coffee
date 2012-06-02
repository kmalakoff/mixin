$(document).ready( ->
  module("Mixin.RefCount")
  test("TEST DEPENDENCY MISSING", ->
    ok(!!Mixin); ok(!!Mixin.RefCount)
  )

  test("Use case: adding ref counting to a class", ->
    class SomeClass
      constructor: ->
        Mixin.in(this, 'RefCount')
      destroy: ->
        Mixin.out(this, 'RefCount')

    # expected scenario
    instance = new SomeClass()
    equal(instance.refCount(), 1, 'refcount is started at 1')
    instance.retain()
    equal(instance.refCount(), 2, 'retain: ref count is now 2')
    instance.release()
    equal(instance.refCount(), 1, 'release: ref count is now 1')
    instance.release()
    equal(instance.refCount(), 0, 'release: ref count is now 0')

    # right into the danger zone
    raises(instance.retain, Error, 'Mixin.RefCount: ref_count is corrupt: 0')
    equal(instance.refCount(), 0, 'release: ref count is still 0')
    raises(instance.release, Error, 'Mixin.RefCount: ref_count is corrupt: 0')
    equal(instance.refCount(), 0, 'release: ref count is still 0')

    # cleanup to avoid memory leaks
    instance.destroy()
  )

  test("Use case: adding ref counting to a class with auto destroy", ->
    class ClassWithAutoDestroy
      constructor: ->
        Mixin.in(this, 'RefCount', => @destroy())
        @is_destroyed = false
      destroy: ->
        throw new Error('already destroyed') if @is_destroyed
        @is_destroyed = true

    # expected scenario
    instance = new ClassWithAutoDestroy()
    equal(instance.refCount(), 1, 'refcount is started at 1')
    instance.retain()
    equal(instance.refCount(), 2, 'retain: ref count is now 2')
    instance.release()
    equal(instance.refCount(), 1, 'release: ref count is now 1')
    equal(instance.is_destroyed, false, 'release: not destroyed')
    instance.release()
    equal(instance.refCount(), 0, 'release: ref count is now 0')
    equal(instance.is_destroyed, true, 'release: now destroyed')

    # highway to the danger zone
    raises(instance.retain, Error, 'Mixin.RefCount: ref_count is corrupt: 0')
    equal(instance.refCount(), 0, 'release: ref count is still 0')
    raises(instance.release, Error, 'Mixin.RefCount: ref_count is corrupt: 0')
    equal(instance.refCount(), 0, 'release: ref count is still 0')

    # cleanup to avoid memory leaks
    Mixin.out(instance, 'RefCount')
  )
)