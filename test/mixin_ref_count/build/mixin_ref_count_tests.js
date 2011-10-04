var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).ready(function() {
  module("Mixin.RefCount");
  test("TEST DEPENDENCY MISSING", function() {
    return Mixin.RefCount.RefCount;
  });
  test("Use case: adding ref counting to a class", function() {
    var SomeClass, instance;
    SomeClass = (function() {
      function SomeClass() {
        Mixin["in"](this, 'RefCount');
      }
      SomeClass.prototype.destroy = function() {
        return Mixin.out(this, 'RefCount');
      };
      return SomeClass;
    })();
    instance = new SomeClass();
    equal(instance.refCount(), 1, 'refcount is started at 1');
    instance.retain();
    equal(instance.refCount(), 2, 'retain: ref count is now 2');
    instance.release();
    equal(instance.refCount(), 1, 'release: ref count is now 1');
    instance.release();
    equal(instance.refCount(), 0, 'release: ref count is now 0');
    raises(instance.retain, Error, 'Mixin.RefCount: ref_count is corrupt: 0');
    equal(instance.refCount(), 0, 'release: ref count is still 0');
    raises(instance.release, Error, 'Mixin.RefCount: ref_count is corrupt: 0');
    equal(instance.refCount(), 0, 'release: ref count is still 0');
    return instance.destroy();
  });
  return test("Use case: adding ref counting to a class with auto destroy", function() {
    var ClassWithAutoDestroy, instance;
    ClassWithAutoDestroy = (function() {
      function ClassWithAutoDestroy() {
        Mixin["in"](this, 'RefCount', __bind(function() {
          return this.destroy();
        }, this));
        this.is_destroyed = false;
      }
      ClassWithAutoDestroy.prototype.destroy = function() {
        if (this.is_destroyed) {
          throw new Error('already destroyed');
        }
        return this.is_destroyed = true;
      };
      return ClassWithAutoDestroy;
    })();
    instance = new ClassWithAutoDestroy();
    equal(instance.refCount(), 1, 'refcount is started at 1');
    instance.retain();
    equal(instance.refCount(), 2, 'retain: ref count is now 2');
    instance.release();
    equal(instance.refCount(), 1, 'release: ref count is now 1');
    equal(instance.is_destroyed, false, 'release: not destroyed');
    instance.release();
    equal(instance.refCount(), 0, 'release: ref count is now 0');
    equal(instance.is_destroyed, true, 'release: now destroyed');
    raises(instance.retain, Error, 'Mixin.RefCount: ref_count is corrupt: 0');
    equal(instance.refCount(), 0, 'release: ref count is still 0');
    raises(instance.release, Error, 'Mixin.RefCount: ref_count is corrupt: 0');
    equal(instance.refCount(), 0, 'release: ref count is still 0');
    return Mixin.out(instance, 'RefCount');
  });
});