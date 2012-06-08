###
  mixin_timeouts.js
  (c) 2011, 2012 Kevin Malakoff.
  Mixin.Timeouts is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
###

# import Mixin and UnderscoreJS (or a minimal replacement)
Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin-js-core') else window.Mixin
_ = if not window._ and (typeof(require) != 'undefined') then require('underscore')?._ else window._
_ = Mixin._ unless _
Mixin.Timeouts||Mixin.Timeouts={}

Mixin.Timeouts._mixin_info =
  mixin_name: 'Timeouts'

  initialize: ->
    Mixin.instanceData(this, 'Timeouts', {timeouts: {}})

  destroy: ->
    @killAllTimeouts()

  mixin_object: {
    addTimeout: (timeout_name, callback, wait) ->
      Mixin.Core._Validate.string(timeout_name, 'Mixin.Timeouts.addTimeout', 'timeout_name')
      Mixin.Core._Validate.callback(callback, 'Mixin.Timeouts.addTimeout', 'callback')
      throw new Error("Mixin.Timeouts: missing wait on '#{_.classOf(this)}'") if wait == undefined
      throw new Error("Mixin.Timeouts: wait invalid on '#{_.classOf(this)}'") if (typeof(wait) != 'number') or (wait<0) or (Math.floor(wait)!=wait)
      instance_data = Mixin.instanceData(this, 'Timeouts')
      throw new Error("Mixin.Timeouts: timeout '#{timeout_name}' already exists on '#{_.classOf(this)}'") if @hasTimeout(timeout_name)

      callback_args = Array.prototype.slice.call(arguments, 3)
      timeout = setTimeout((=> @killTimeout(timeout_name); callback.apply(this, callback_args)), wait)
        # timeout = _.delay((=> @killTimeout(timeout_name); callback.apply(this, callback_args)),
        #   wait, timeout_name, callback, callback_args)
      instance_data.timeouts[timeout_name] = timeout
      return this

    hasTimeout: (timeout_name) ->
      instance_data = Mixin.instanceData(this, 'Timeouts')
      return (timeout_name of instance_data.timeouts)

    timeoutCount: ->
      instance_data = Mixin.instanceData(this, 'Timeouts')
      count = 0; count++ for key, timeout of instance_data.timeouts; return count

    timeouts: ->
      instance_data = Mixin.instanceData(this, 'Timeouts')
      result = []; result.push(key) for key, timeout of instance_data.timeouts; return result

    killTimeout: (timeout_name) ->
      instance_data = Mixin.instanceData(this, 'Timeouts')
      throw new Error("Mixin.Timeouts: timeout '#{timeout_name}' does not exist. For a less-strict check, use killTimeoutIfExists") if not @hasTimeout(timeout_name)
      @killTimeoutIfExists(timeout_name)
      return this

    killTimeoutIfExists: (timeout_name) ->
      instance_data = Mixin.instanceData(this, 'Timeouts')
      timeout = instance_data.timeouts[timeout_name]
      clearTimeout(timeout) if timeout
      delete instance_data.timeouts[timeout_name]
      return this

    killAllTimeouts: ->
      instance_data = Mixin.instanceData(this, 'Timeouts')
      @killTimeoutIfExists(timeout_name) for timeout_name, callback of instance_data.timeouts
      return this
  }

####################################################
# Make mixin available
####################################################
Mixin.registerMixin(Mixin.Timeouts._mixin_info)