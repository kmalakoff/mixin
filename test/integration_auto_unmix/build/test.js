var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).ready(function() {
  module("Mixin Integration - AutoUnmix");
  test("TEST DEPENDENCY MISSING", function() {
    _.VERSION;
    _.AWESOMENESS.Underscore_Awesome;
    Backbone.Backbone;
    Mixin.RefCount.RefCount;
    Mixin.AutoMemory.AutoMemory;
    Mixin.Timeouts.Timeouts;
    return Mixin.Backbone.Events.Events;
  });
  test("Use case: reference counting with Mixin.out on destroy", function() {
    var AutoUnmixView, view1, view2;
    AutoUnmixView = (function() {
      function AutoUnmixView() {
        Mixin["in"](this, [
          'RefCount', __bind(function() {
            return Mixin.out(this);
          }, this)
        ], 'AutoMemory', 'Timeouts');
        this.loading_el = $('<div class="loading"></div>').appendTo($('body'))[0];
        this.autoWrappedProperty('loading_el', 'remove');
        this.active_el = null;
        this.autoWrappedProperty('active_el', 'remove');
        this.addTimeout('Loading Animation', (__bind(function() {
          return this.render();
        }, this)), 100);
      }
      AutoUnmixView.prototype.render = function() {
        $(this.loading_el).remove();
        this.loading_el = null;
        return this.active_el = $('<div class="active"></div>').appendTo($('body'));
      };
      return AutoUnmixView;
    })();
    view1 = new AutoUnmixView();
    equal(view1.refCount(), 1);
    ok(view1.loading_el !== null, 'view1.loading_el');
    equal(view1.active_el, null, 'no view1.active_el');
    deepEqual(view1.timeouts(), ['Loading Animation'], 'animation timeout');
    Mixin._statistics.update();
    equal(Mixin._statistics.byInstance_withData().length, 1, '1 instance with data');
    equal(Mixin._statistics.byInstance_getMixins().length, 1, '1 instance');
    equal(_.size(Mixin._statistics.byMixin_getInstances()), 3, '3 live mixins on 1 view');
    view2 = new AutoUnmixView();
    equal(view2.refCount(), 1);
    ok(view2.loading_el !== null);
    equal(view2.active_el, null);
    deepEqual(view2.timeouts(), ['Loading Animation'], 'animation timeout');
    Mixin._statistics.update();
    equal(Mixin._statistics.byInstance_withData().length, 2, '2 instances with data');
    equal(Mixin._statistics.byInstance_getMixins().length, 2, '2 instances');
    equal(_.size(Mixin._statistics.byMixin_getInstances()), 3, '3 live mixins on 2 views');
    equal($('body').children('.loading').length, 2, 'view1.loading_el X 2');
    equal($('body').children('.active').length, 0, 'view1.active_el X 0');
    view1.release();
    ok(view1.loading_el === null, 'view1 no loading_el');
    equal(view1.active_el, null, 'view1 no active_el');
    equal($('body').children('.loading').length, 1, 'view1 still loading_el');
    Mixin._statistics.update();
    equal(Mixin._statistics.byInstance_withData().length, 1, '1 instance with data');
    equal(Mixin._statistics.byInstance_getMixins().length, 1, '1 instance');
    equal(_.size(Mixin._statistics.byMixin_getInstances()), 3, '3 live mixins on 1 view');
    stop();
    return setTimeout((function() {
      equal($('body').children('.loading').length, 0, 'view1 done loading_el');
      equal($('body').children('.active').length, 1, 'view1 now active_el');
      ok(view2.loading_el === null);
      ok(view2.active_el !== null);
      deepEqual(view2.timeouts(), [], 'Loading Animation timeer finished');
      view2.release();
      equal($('body').children('.active').length, 0, 'view2 no longer active_el');
      ok(view2.loading_el === null);
      ok(view2.active_el === null);
      Mixin._statistics.update();
      equal(Mixin._statistics.byInstance_withData().length, 0, '0 instances with data');
      equal(Mixin._statistics.byInstance_getMixins().length, 0, '0 instances');
      equal(_.size(Mixin._statistics.byMixin_getInstances()), 0, '0 live mixins');
      return start();
    }), 101);
  });
  return test("Use case: Backbone.Event 'destroy'", function() {
    var SelfDestructructive, character1, character2;
    Mixin.UNMIX_ON_BACKBONE_DESTROY = true;
    SelfDestructructive = (function() {
      function SelfDestructructive() {
        Mixin["in"](this, 'Backbone.Events', 'AutoMemory', 'Timeouts');
        this.addTimeout('Waiting for Godot', (__bind(function() {}, this)), 1000000000);
        this.give_this_to_godot = 'time insenstive information';
        this.autoProperty('give_this_to_godot');
      }
      return SelfDestructructive;
    })();
    character1 = new SelfDestructructive();
    character2 = new SelfDestructructive();
    ok(character1.give_this_to_godot !== null, 'something to share');
    ok(character2.give_this_to_godot !== null, 'something to share');
    deepEqual(character1.timeouts(), ['Waiting for Godot'], 'Waiting for Godot');
    deepEqual(character2.timeouts(), ['Waiting for Godot'], 'Waiting for Godot');
    character1.trigger('destroy');
    ok(character1.give_this_to_godot === null, 'it was a dream');
    ok(character2.give_this_to_godot !== null, 'something to share');
    character2.trigger('destroy');
    ok(character2.give_this_to_godot === null, 'it was...');
    Mixin._statistics.update();
    equal(Mixin._statistics.byInstance_withData().length, 0, '0 instances with data');
    equal(Mixin._statistics.byInstance_getMixins().length, 0, '0 instances');
    return equal(_.size(Mixin._statistics.byMixin_getInstances()), 0, '0 live mixins');
  });
});