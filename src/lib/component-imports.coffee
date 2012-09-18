# import Mixin and Underscore replacement
Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin-js') else window.Mixin
_ = Mixin._