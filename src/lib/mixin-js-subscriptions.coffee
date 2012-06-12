###
  mixin_subscriptions.js
  (c) 2011, 2012 Kevin Malakoff.
  Mixin.Subscriptions is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Underscore-Awesomer.js
###

# import Mixin and UnderscoreJS (or a minimal replacement)
Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin-js-core') else window.Mixin
_ = if not window._ and (typeof(require) != 'undefined') then require('underscore') else window._
_ = _._ if _ and not _.VERSION # LEGACY
_ = Mixin._ unless _
_.mixin(Mixin._) unless _.keypathExists  # mixin the additional functions

Mixin.Subscriptions||Mixin.Subscriptions={}

####################################################
# Classes
#   options:
#     destroy -> calls  you back when link is destroyed
#     keep_until_destroyed -> overrides the Mixin.Subscription.TYPE.EXCLUSIVE flag
####################################################
class Mixin.Subscriptions._SubscriptionLink
  constructor: (@subscription, @subscriber, @notification_callback, options) ->
    @options = _.clone(options||{})

    # register the back link
    subscriber_instance_data = Mixin.instanceData(@subscriber, 'Subscriber')
    subscriber_instance_data.subscription_backlinks.push(this) # store us so they can remove us if they are destroyed

  mustKeepUntilDestroyed: -> return ((@options.keep_until_destroyed==undefined) or not @options.keep_until_destroyed)

  destroy: ->
    throw new Error("Mixin.Subscriptions: _SubscriptionLink destroyed multiple times") if not @subscription # already destroyed
    (@options.destroy(); @options.destroy=null) if @options.destroy

    # unregister back links
    subscriber_instance_data = Mixin.instanceData(@subscriber, 'Subscriber')
    _.remove(subscriber_instance_data.subscription_backlinks, this)

    # remove from subscription - it won't exist if destroy called by the subscription destroy
    _.remove(@subscription.subscription_links, this)

    @subscription = null
    @subscriber = null
    @notification_callback = null
    @options = null

Mixin.Subscription||Mixin.Subscription={}
Mixin.Subscription.TYPE = {}
Mixin.Subscription.TYPE.MULTIPLE = 0
Mixin.Subscription.TYPE.EXCLUSIVE = 1

class Mixin.Subscriptions._Subscription
  constructor: (@observable, @subscription_type) ->
    if Mixin.DEBUG
      throw new Error("Mixin.Subscriptions: Mixin.Subscription.TYPE is invalid") if (typeof(@subscription_type) != 'number') or (@subscription_type<Mixin.Subscription.TYPE.MULTIPLE) or (@subscription_type>Mixin.Subscription.TYPE.EXCLUSIVE)

    @subscription_links = []

  addSubscriber: (subscriber, notification_callback, options) ->
    @removeSubscribers((test_subscription)-> return test_subscription.mustKeepUntilDestroyed()) if (@subscription_type==Mixin.Subscription.TYPE.EXCLUSIVE)
    @subscription_links.push(new Mixin.Subscriptions._SubscriptionLink(this, subscriber, notification_callback, options))

  removeSubscriber: (subscriber, notification_callback, subscription_name) ->
    subscription_link = _.find(@subscription_links, (test) -> return (subscriber==test.subscriber) and (notification_callback==test.notification_callback))
    throw new Error("Mixin.Subscriptions.removeSubscriber: subscription '#{subscription_name}' does not exist for '#{_.classOf(subscriber)}'") if not subscription_link
    _.remove(@subscription_links, subscription_link)
    subscription_link.destroy()

  subscribers: (subscribers) ->
    subscribers.push(subscription_link.subscriber) for subscription_link in @subscription_links

  notifySubscribers: ->
    args = Array.prototype.slice.call(arguments)
    subscription_link.notification_callback.apply(subscription_link.subscriber, args) for subscription_link in @subscription_links

  removeSubscribers: (test_fn) ->
    if (test_fn)
      removed_subscription_links = _.select(@subscription_links, test_fn)
      return if (removed_subscription_links.length == 0)
      @subscription_links = _.difference(@subscription_links, removed_subscription_links)
      subscription_link.destroy() for subscription_link in removed_subscription_links
    else
      removed_subscription_links = @subscription_links
      @subscription_links = []
      subscription_link.destroy() for subscription_link in removed_subscription_links

  destroy: ->
    subscription_links = @subscription_links; @subscription_links = []
    link.destroy() for link in subscription_links

Mixin.Subscriptions.Observable||Mixin.Subscriptions.Observable={}
Mixin.Subscriptions.Observable._mixin_info =
  mixin_name: 'Observable'

  initialize: ->
    Mixin.instanceData(this, 'Observable', {subscriptions: {}, is_destroyed: false})
    (@publishSubscription.apply(this, if _.isArray(arg) then arg else [arg])) for arg in arguments

  destroy: ->
    instance_data = Mixin.instanceData(this, 'Observable')
    throw new Error("Mixin.Observable.destroy: already destroyed") if instance_data.is_destroyed
    instance_data.is_destroyed = true
    subscriptions = instance_data.subscriptions; instance_data.subscriptions = []
    subscription.destroy() for subscription in subscriptions # clear all of the subscriptions to me

  mixin_object: {
    hasSubscription: (subscription_name) ->
      if Mixin.DEBUG
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.hasSubscription', 'subscription_name')
      instance_data = Mixin.instanceData(this, 'Observable')
      return (instance_data.subscriptions.hasOwnProperty(subscription_name))

    publishSubscription: (subscription_name, subscription_type) ->
      instance_data = Mixin.instanceData(this, 'Observable')
      subscription_type = Mixin.Subscription.TYPE.MULTIPLE if (subscription_type == undefined)
      if Mixin.DEBUG
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.publishSubscription', 'subscription_name')
        Mixin.Core._Validate.noKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.publishSubscription', 'subscription_name')
      instance_data.subscriptions[subscription_name] = new Mixin.Subscriptions._Subscription(this, subscription_type)
      return this

    subscriptions: ->
      instance_data = Mixin.instanceData(this, 'Observable')
      subscriptions = []; subscriptions.push(key) for key, value of instance_data.subscriptions
      return subscriptions

    subscribers: (subscription_name) ->
      subscribers = []
      instance_data = Mixin.instanceData(this, 'Observable')
      if subscription_name==undefined
        subscription.subscribers(subscribers) for key, subscription of instance_data.subscriptions
      else
        throw new Error("Mixin.Observable.subscribers: subscriber '#{_classOf(this)}' does not recognize '#{subscription_name}'") if not instance_data.subscriptions.hasOwnProperty(subscription_name)
        (subscription.subscribers(subscribers) if (subscription.subscription_name==subscription_name)) for key, subscription of instance_data.subscriptions
      return _.uniq(subscribers)

    # Accepts forms:
    #   subscriber, subscription1, subscription2
    #   subscriber, [subscription1, param1, etc], subscription2
    addSubscriber: (subscriber, subscription_parameters) ->
      instance_data = Mixin.instanceData(this, 'Observable')

      _doSubscribe = (subscription_name, notification_callback, options) ->
        options||options={}
        if Mixin.DEBUG
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.addSubscriber', 'subscription_name')
          Mixin.Core._Validate.callback(notification_callback, 'Mixin.Observable.addSubscriber', 'notification_callback')
          Mixin.Core._Validate.object(options, 'Mixin.Observable.addSubscriber', 'options')
          Mixin.Core._Validate.callback(options.destroy, 'Mixin.Observable.addSubscriber', 'options.destroy') if (options.destroy!=undefined)

        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.addSubscriber', 'subscription_name')
        subscription = instance_data.subscriptions[subscription_name]
        subscription.addSubscriber(subscriber, notification_callback, options)

      # check for infering parameters
      args = Array.prototype.slice.call(arguments, 1)
      Mixin.Core._Validate.instanceWithMixin(subscriber, 'Subscriber', 'Mixin.Observable.addSubscriber', 'subscriber')
      if (args.length>1)
        check_arg = args[1]
        # the next parameter after the first subscription is not a subscription
        if not ((_.isString(check_arg) and @hasSubscription(check_arg)) or (_.isArray(check_arg) and (check_arg.length>=1) and _.isString(check_arg[0]) and @hasSubscription(check_arg[0])))
          _doSubscribe.apply(this, Array.prototype.slice.call(arguments,1))
          return this

      (if _.isArray(parameter) then _doSubscribe.apply(this, parameter) else _doSubscribe.apply(parameter)) for parameter in args
      return this

    notifySubscribers: (subscription_name) ->
      instance_data = Mixin.instanceData(this, 'Observable')
      return if instance_data.is_destroyed
      if Mixin.DEBUG
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.notifySubscribers', 'subscription_name')
        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.notifySubscribers')
      subscription = instance_data.subscriptions[subscription_name]; return if not subscription
      subscription.notifySubscribers.apply(subscription, Array.prototype.slice.call(arguments,1))
      return this

    removeSubscriber: (subscriber, subscription_name, notification_callback) ->
      instance_data = Mixin.instanceData(this, 'Observable')

      _doUnsubscribe = (subscription_name, notification_callback) ->
        if Mixin.DEBUG
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.removeSubscriber', 'subscription_name')
          Mixin.Core._Validate.callback(notification_callback, 'Mixin.Observable.removeSubscriber', 'notification_callback')

        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.removeSubscriber', 'subscription_name')
        subscription = instance_data.subscriptions[subscription_name]
        subscription.removeSubscriber(subscriber, notification_callback, subscription_name)

      # check for infering parameters
      args = Array.prototype.slice.call(arguments, 1)
      if Mixin.DEBUG
        Mixin.Core._Validate.instanceWithMixin(subscriber, 'Subscriber', 'Mixin.Observable.removeSubscriber', 'subscriber')
      if (args.length>1)
        check_arg = args[1]
        # the next parameter after the first subscription is not a subscription
        if not ((_.isString(check_arg) and @hasSubscription(check_arg)) or (_.isArray(check_arg) and (check_arg.length>=1) and _.isString(check_arg[0]) and @hasSubscription(check_arg[0])))
          _doUnsubscribe.apply(this, Array.prototype.slice.call(arguments,1))
          return this

      (if _.isArray(parameter) then _doUnsubscribe.apply(this, parameter) else _doUnsubscribe.apply(parameter)) for parameter in args
      return this

    removeSubscribers: (subscription_name, test_fn) ->
      instance_data = Mixin.instanceData(this, 'Observable')
      if Mixin.DEBUG
        if (subscription_name!=undefined)
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.removeSubscribers', 'subscription_name')
          Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.removeSubscribers')
        Mixin.Core._Validate.callback(test_fn, 'Mixin.Observable.removeSubscribers', 'test_fn') if (test_fn!=undefined)

      if (subscription_name)
        subscription = instance_data.subscriptions[subscription_name]; return if not subscription
        subscription.removeSubscribers(test_fn)
      else
        subscription.removeSubscribers(test_fn) for key, subscription of instance_data.subscriptions

      return this
  }

####################################################
# Mixin.Subscriber
# Usage:
####################################################
Mixin.Subscriptions.Subscriber||Mixin.Subscriptions.Subscriber={}

Mixin.Subscriptions.Subscriber._mixin_info =
  mixin_name: 'Subscriber'

  initialize: ->
    Mixin.instanceData(this, 'Subscriber', {subscription_backlinks: [], is_destroyed: false})

  destroy: ->
    instance_data = Mixin.instanceData(this, 'Subscriber')
    throw new Error("Mixin.Subscriber.destroy: already destroyed") if instance_data.is_destroyed
    instance_data.is_destroyed = true
    backlinks = instance_data.subscription_backlinks; instance_data.subscription_backlinks = []
    backlink.destroy() for backlink in backlinks # clear all of my subscriptions to others

  mixin_object: {
    observables: (subscription_name) ->
      instance_data = Mixin.instanceData(this, 'Subscriber')
      obserables = []

      if (subscription_name==undefined)
        (obserables.push(subscription_link.subscription.observable) if (subscription_link.subscription and (subscription_link.subscription.subscription_name==subscription_name))) for subscription_link in instance_data.subscription_backlinks
      else
        if Mixin.DEBUG
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Subscriptions.observables', 'subscription_name')
        (obserables.push(subscription_link.subscription.observable) if (subscription_link.subscription)) for subscription_link in instance_data.subscription_backlinks
      return _.uniq(obserables)
  }

####################################################
# Mixin.ObservableSubscriber
# Usage:
####################################################
Mixin.Subscriptions.ObservableSubscriber||Mixin.Subscriptions.ObservableSubscriber={}

Mixin.Subscriptions.ObservableSubscriber._mixin_info =
  mixin_name: 'ObservableSubscriber'
  mixin_object: {}
  initialize: -> Mixin.in(this, 'Subscriber', ['Observable'].concat(Array.prototype.slice.call(arguments)))
  destroy: -> Mixin.out(this, 'Subscriber', 'Observable')

####################################################
# Make mixins available
####################################################
Mixin.registerMixin(Mixin.Subscriptions.Observable._mixin_info)
Mixin.registerMixin(Mixin.Subscriptions.Subscriber._mixin_info)
Mixin.registerMixin(Mixin.Subscriptions.ObservableSubscriber._mixin_info)


