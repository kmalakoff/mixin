$(document).ready( ->
  module("Mixin.Subscriptions")

  # import Underscore
  _ = if not window._ and (typeof(require) != 'undefined') then require('underscore') else window._
  _ = Mixin._ unless _

  test("TEST DEPENDENCY MISSING", ->
    ok(!!Mixin); ok(!!Mixin.Subscriptions)
    ok(!!_)
  )

  test("Use case: reasonably complex scenario", ->
    class Observerable
      constructor: ->
        Mixin.in(this, 'Observable', 'update', 'destroy')
      destroy: ->
        @notifySubscribers('destroy')
        Mixin.out(this, 'Observable')
      sendUpdate: (update) -> @notifySubscribers('update', update)

    class Subscriber
      constructor: ->
        Mixin.in(this, 'Subscriber')
        @observable_updates=[]; @observable_was_destroyed=false
      destroy: ->
        Mixin.out(this, 'Subscriber')
      observableWasUpdated: (update) -> @observable_updates.push(update)
      observableWasDestroyed: -> @observable_was_destroyed=true

    class ObservableSubscriber
      constructor: ->
        Mixin.in(this, 'ObservableSubscriber', 'update')
        @observable_updates=[]; @observable_was_destroyed=false
      destroy: ->
        Mixin.out(this, 'ObservableSubscriber')
      sendUpdate: (update) -> @notifySubscribers('update', update)
      observableWasUpdated: (update) -> @observable_updates.push(update)

    # observable
    source = new Observerable()
    equal(source.hasSubscription('update'), true, 'can subscribe to update')
    equal(source.hasSubscription('destroy'), true, 'can subscribe to destroy')
    equal(source.hasSubscription('walk'), false, 'cannot subscribe to walk')
    deepEqual(source.subscriptions(), ['update', 'destroy'], 'can subscribe to update and destroy')

    # subscriber to observable
    subscriber = new Subscriber()
    source.addSubscriber(subscriber, ['update', subscriber.observableWasUpdated], ['destroy', subscriber.observableWasDestroyed])
    # subscribers to source
    equal(_.difference(source.subscribers('update'), [subscriber]).length, 0, 'subscriber is subscribed to update')
    equal(_.difference(source.subscribers('destroy'), [subscriber]).length, 0, 'subscriber is subscribed to destroy')
    equal(_.difference(source.subscribers(), [subscriber]).length, 0, 'subscriber is subscribed to the source')
    # observed from subscriber
    equal(_.difference(subscriber.observables('update'), [source]).length, 0, 'subscriber is observing the source update')
    equal(_.difference(subscriber.observables('destroy'), [source]).length, 0, 'subscriber is observing the source')
    equal(_.difference(subscriber.observables(), [source]).length, 0, 'subscriber is observing the source')

    # updates
    equal(subscriber.observable_updates.length, 0, "not received yet")
    source.sendUpdate('Pontificate')
    deepEqual(subscriber.observable_updates, ['Pontificate'], "received: ['Pontificate']")
    source.sendUpdate('somewhat').sendUpdate('for').sendUpdate('me.')
    equal(subscriber.observable_updates.join(' '), 'Pontificate somewhat for me.', "received: 'Pontificate somewhat for me.'")

    # add a second subscriber to observable
    observable_subscriber = new ObservableSubscriber()
    deepEqual(observable_subscriber.subscriptions(), ['update'], 'can subscribe to update')
    Mixin.in(source, 'Subscriber')
    source.addSubscriber(observable_subscriber, ['update', observable_subscriber.observableWasUpdated, {destroy: -> Mixin.out(source, 'Subscriber')}]) # auto cleanup when destroyed
    observable_subscriber.addSubscriber(source, 'update', (update) -> source.sendUpdate(update))
    # subscribers to source
    equal(_.difference(source.subscribers('update'), [subscriber, observable_subscriber]).length, 0, 'source is subscribed to update')
    equal(_.difference(source.subscribers('destroy'), [subscriber]).length, 0, 'source is subscribed to destroy')
    equal(_.difference(source.subscribers(), [subscriber, observable_subscriber]).length, 0, 'source is subscribed to the source')
    # subscribers to observable_subscriber
    equal(_.difference(observable_subscriber.subscribers('update'), [source]).length, 0, 'observable_subscriber is subscribed to update')
    raises((->observable_subscriber.subscribers('destroy')), "Mixin.Subscriptions: subscriber 'ObservableSubscriber' does not recognize 'destroy'")
    equal(_.difference(observable_subscriber.subscribers(), [source]).length, 0, 'observable_subscriber is subscribed to the observable_subscriber')
    # observed from subscriber
    equal(_.difference(observable_subscriber.observables('update'), [source]).length, 0, 'observable_subscriber is observing the source update')
    equal(_.difference(observable_subscriber.observables('destroy'), [source]).length, 0, 'observable_subscriber is observing the source')
    equal(_.difference(observable_subscriber.observables(), [source]).length, 0, 'observable_subscriber is observing the source')

    # updates
    observable_subscriber.sendUpdate('OK!').sendUpdate('To').sendUpdate('be')
    source.removeSubscriber(observable_subscriber, ['update', observable_subscriber.observableWasUpdated])
    source.sendUpdate('or')
    source.addSubscriber(observable_subscriber, ['update', observable_subscriber.observableWasUpdated])
    source.sendUpdate('not')
    source.removeSubscriber(observable_subscriber, 'update', observable_subscriber.observableWasUpdated)
    source.sendUpdate('to')
    source.addSubscriber(observable_subscriber, 'update', observable_subscriber.observableWasUpdated)
    source.sendUpdate('be')
    deepEqual(subscriber.observable_updates.join(' '), 'Pontificate somewhat for me. OK! To be or not to be', "received: 'Pontificate somewhat for me. OK! To be or not to be'")
    deepEqual(observable_subscriber.observable_updates.join(' '), 'OK! To be not be', "received: 'OK! To be not be'")

    # cleanup subscriber
    subscriber.destroy()
    # subscribers to source
    equal(_.difference(source.subscribers('update'), [observable_subscriber]).length, 0, 'observable_subscriber is subscribed to update')
    equal(_.difference(source.subscribers('destroy'), []).length, 0, 'observable_subscriber is subscribed to destroy')
    equal(_.difference(source.subscribers(), [observable_subscriber]).length, 0, 'observable_subscriber is subscribed to the source')
    # subscribers to observable_subscriber
    equal(_.difference(observable_subscriber.subscribers('update'), [source]).length, 0, 'observable_subscriber is subscribed to update')
    raises((->observable_subscriber.subscribers('destroy')), "Mixin.Subscriptions: subscriber 'ObservableSubscriber' does not recognize 'destroy'")
    equal(_.difference(observable_subscriber.subscribers(), [source]).length, 0, 'observable_subscriber is subscribed to the observable_subscriber')

    # cleanup source
    source.destroy()
    # subscribers to observable_subscriber
    equal(_.difference(observable_subscriber.subscribers('update'), []).length, 0, 'no one is subscribed to update')
    equal(_.difference(observable_subscriber.subscribers(), []).length, 0, 'no one is subscribed to the observable_subscriber')
    observable_subscriber.destroy()
  )

  test("Use case: valid and invalid checking", ->
    class Observerable
      constructor:  -> Mixin.in(this, 'Observable')
      destroy:      -> @notifySubscribers('destroy')
    class Subscriber
      constructor:  -> Mixin.in(this, 'Subscriber')
      destroy:      -> Mixin.out(this, 'Subscriber')

    observable = new Observerable()
    raises((->observable.hasSubscription()), Error, "Mixin.Observable.hasSubscription: subscription_name missing")
    raises((->observable.hasSubscription(0)), Error, "Mixin.Observable.hasSubscription: subscription_name invalid")
    raises((->observable.hasSubscription({})), Error, "Mixin.Observable.hasSubscription: subscription_name invalid")
    raises((->observable.hasSubscription([])), Error, "Mixin.Observable.hasSubscription: subscription_name invalid")
    raises((->observable.hasSubscription(observable)), Error, "Mixin.Observable.hasSubscription: subscription_name invalid")
    raises((->observable.hasSubscription(Observerable)), Error, "Mixin.Observable.hasSubscription: subscription_name invalid")

    observable = new Observerable()
    raises((->observable.publishSubscription()), Error, "Mixin.Observable.publishSubscription: subscription_name missing")
    raises((->observable.publishSubscription(0)), Error, "Mixin.Observable.publishSubscription: subscription_name invalid")
    raises((->observable.publishSubscription({})), Error, "Mixin.Observable.publishSubscription: subscription_name invalid")
    raises((->observable.publishSubscription([])), Error, "Mixin.Observable.publishSubscription: subscription_name invalid")
    raises((->observable.publishSubscription(observable)), Error, "Mixin.Observable.publishSubscription: subscription_name invalid")
    raises((->observable.publishSubscription(Observerable)), Error, "Mixin.Observable.publishSubscription: subscription_name invalid")
    raises((->observable.publishSubscription('Hello', 42)), Error, "Mixin.Observable.publishSubscription: options invalid")
    raises((->observable.publishSubscription('Hello', [])), Error, "Mixin.Observable.publishSubscription: options invalid")
    raises((->observable.publishSubscription('Hello', observable)), Error, "Mixin.Observable.publishSubscription: options invalid")
    raises((->observable.publishSubscription('Hello', Observerable)), Error, "Mixin.Observable.publishSubscription: options invalid")

    observable = new Observerable()
    raises((->observable.subscribers('Hello')), Error, "Mixin.Observable.subscribers: subscriber 'Observerable' does not recognize 'Hello'")
    raises((->observable.subscribers(0)), Error, "Mixin.Observable.subscribers: subscription_name invalid")
    raises((->observable.subscribers({})), Error, "Mixin.Observable.subscribers: subscription_name invalid")
    raises((->observable.subscribers([])), Error, "Mixin.Observable.subscribers: subscription_name invalid")
    raises((->observable.subscribers(observable)), Error, "Mixin.Observable.subscribers: subscription_name invalid")
    raises((->observable.subscribers(Observerable)), Error, "Mixin.Observable.subscribers: subscription_name invalid")

    observable = new Observerable()
    raises((->observable.addSubscriber()), Error, "Mixin.Observable.addSubscriber: subscriber missing")
    raises((->observable.addSubscriber('Hello')), Error, "Mixin.Observable.addSubscriber: subscriber invalid")
    raises((->observable.addSubscriber(0)), Error, "Mixin.Observable.addSubscriber: subscriber invalid")
    raises((->observable.addSubscriber({})), Error, "Mixin.Observable.addSubscriber: subscriber invalid")
    raises((->observable.addSubscriber([])), Error, "Mixin.Observable.addSubscriber: subscriber invalid")
    raises((->observable.addSubscriber(observable)), Error, "Mixin.Observable.addSubscriber: subscriber invalid")
    raises((->observable.addSubscriber(Observerable)), Error, "Mixin.Observable.addSubscriber: subscriber invalid")
    subscriber = new Subscriber()
    raises((->observable.addSubscriber(subscriber, 'Hello')), Error, "Mixin.Observable.subscribe: Hello does not exist for subscription_name")
    raises((->observable.addSubscriber(subscriber, ['Hello'])), Error, "Mixin.Observable.subscribe: Hello does not exist for subscription_name")
    observable.publishSubscription('Hello')
    raises((->observable.addSubscriber(subscriber, ['Hello', (->)], 'Goodbye')), Error, "Mixin.Observable.subscribe: Goodbye does not exist for subscription_name")
    raises((->observable.addSubscriber(subscriber, ['Hello', (->)], ['Goodbye'])), Error, "Mixin.Observable.subscribe: Goodbye does not exist for subscription_name")
    raises((->observable.addSubscriber(subscriber, ['Hello', (->)], ['Good day', 'sir!'])), Error, "Mixin.Observable.subscribe: Goodbye does not exist for subscription_name")
    raises((->observable.addSubscriber(subscriber, 'Hello')), Error, "Mixin.Observable.subscribe: notification_callback missing")
    raises((->observable.addSubscriber(subscriber, ['Hello'])), Error, "Mixin.Observable.subscribe: notification_callback missing")
    raises((->observable.addSubscriber(subscriber, 'Hello', 0)), Error, "Mixin.Observable.subscribe: notification_callback invalid")
    raises((->observable.addSubscriber(subscriber, 'Hello', {})), Error, "Mixin.Observable.subscribe: notification_callback invalid")
    raises((->observable.addSubscriber(subscriber, ['Hello', []])), Error, "Mixin.Observable.subscribe: notification_callback invalid")
    raises((->observable.addSubscriber(subscriber, ['Hello', observable])), Error, "Mixin.Observable.subscribe: notification_callback invalid")
    # raises((->observable.addSubscriber(subscriber, ['Hello', Observerable])), Error, "Mixin.Observable.subscribe: notification_callback invalid")
    raises((->observable.addSubscriber(subscriber, 'Hello', (->), {destroy: 0})), Error, "Mixin.Observable.subscribe: destroy_callback invalid")
    raises((->observable.addSubscriber(subscriber, ['Hello', (->), {destroy: []}])), Error, "Mixin.Observable.subscribe: destroy_callback invalid")
    raises((->observable.addSubscriber(subscriber, ['Hello', (->), {destroy: observable}])), Error, "Mixin.Observable.subscribe: destroy_callback invalid")
    # raises((->observable.addSubscriber(subscriber, ['Hello', (->), {destroy: Observerable}])), Error, "Mixin.Observable.subscribe: destroy_callback invalid")

    observable = new Observerable()
    raises((->observable.notifySubscribers('Goodbye')), Error, "Mixin.Observable.notifySubscribers: subscription 'Hello' does not exist for 'Goodbye'")
    raises((->observable.notifySubscribers()), Error, "Mixin.Observable.notifySubscribers: subscription_name missing")
    raises((->observable.notifySubscribers(0)), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid")
    raises((->observable.notifySubscribers({})), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid")
    raises((->observable.notifySubscribers([])), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid")
    raises((->observable.notifySubscribers(observable)), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid")
    raises((->observable.notifySubscribers(Observerable)), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid")

    observable = new Observerable()
    raises((->observable.removeSubscriber(subscriber, 'Goodbye', ->)), Error, "Mixin.Observable.unsubscribe: subscription 'Goodbye' does not exist for 'Observer'")
    raises((->observable.removeSubscriber()), Error, "Mixin.Observable.unsubscribe: subscriber missing")
    raises((->observable.removeSubscriber('Hello')), Error, "Mixin.Observable.unsubscribe: subscriber invalid")
    raises((->observable.removeSubscriber(0)), Error, "Mixin.Observable.unsubscribe: subscriber invalid")
    raises((->observable.removeSubscriber({})), Error, "Mixin.Observable.unsubscribe: subscriber invalid")
    raises((->observable.removeSubscriber([])), Error, "Mixin.Observable.unsubscribe: subscriber invalid")
    raises((->observable.removeSubscriber(observable)), Error, "Mixin.Observable.unsubscribe: subscriber invalid")
    raises((->observable.removeSubscriber(Observerable)), Error, "Mixin.Observable.unsubscribe: subscriber invalid")
    raises((->observable.removeSubscriber(subscriber, 'Hello')), Error, "Mixin.Observable.unsubscribe: Hello does not exist for subscription_name")
    raises((->observable.removeSubscriber(subscriber, ['Hello'])), Error, "Mixin.Observable.unsubscribe: Hello does not exist for subscription_name")
    raises((->observable.removeSubscriber(subscriber, ['Hello', (->)], 'Goodbye')), Error, "Mixin.Observable.unsubscribe: Goodbye does not exist for subscription_name")
    raises((->observable.removeSubscriber(subscriber, ['Hello', (->)], ['Goodbye'])), Error, "Mixin.Observable.unsubscribe: Goodbye does not exist for subscription_name")
    raises((->observable.removeSubscriber(subscriber, ['Hello', (->)], ['Good day', 'sir!'])), Error, "Mixin.Observable.unsubscribe: Goodbye does not exist for subscription_name")
    raises((->observable.removeSubscriber(subscriber, 'Hello')), Error, "Mixin.Observable.unsubscribe: notification_callback missing")
    raises((->observable.removeSubscriber(subscriber, ['Hello'])), Error, "Mixin.Observable.unsubscribe: notification_callback missing")
    raises((->observable.removeSubscriber(subscriber, 'Hello', 0)), Error, "Mixin.Observable.unsubscribe: notification_callback invalid")
    raises((->observable.removeSubscriber(subscriber, 'Hello', {})), Error, "Mixin.Observable.unsubscribe: notification_callback invalid")
    raises((->observable.removeSubscriber(subscriber, ['Hello', []])), Error, "Mixin.Observable.unsubscribe: notification_callback invalid")
    raises((->observable.removeSubscriber(subscriber, ['Hello', observable])), Error, "Mixin.Observable.unsubscribe: notification_callback invalid")
    # raises((->observable.removeSubscriber(subscriber, ['Hello', Observerable])), Error, "Mixin.Observable.unsubscribe: notification_callback invalid")

    observable = new Observerable()
    raises((->observable.removeSubscribers('Goodbye', ->)), Error, "Mixin.Observable.removeSubscribers: subscription 'Goodbye' does not exist for 'Observer'")
    raises((->observable.removeSubscribers(0)), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid")
    raises((->observable.removeSubscribers({})), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid")
    raises((->observable.removeSubscribers([])), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid")
    raises((->observable.removeSubscribers(observable)), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid")
    raises((->observable.removeSubscribers(Observerable)), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid")
    observable.publishSubscription('Hello'); observable.removeSubscribers('Hello')
    raises((->observable.removeSubscribers('Hello', 0)), Error, "Mixin.Observable.removeSubscribers: test_fn invalid")
    raises((->observable.removeSubscribers('Hello', {})), Error, "Mixin.Observable.removeSubscribers: test_fn invalid")
    raises((->observable.removeSubscribers('Hello', [])), Error, "Mixin.Observable.removeSubscribers: test_fn invalid")
    raises((->observable.removeSubscribers('Hello', observable)), Error, "Mixin.Observable.removeSubscribers: test_fn invalid")
    # raises((->observable.removeSubscribers('Hello', Observerable)), Error, "Mixin.Observable.removeSubscribers: test_fn invalid")

    subscriber = new Subscriber()
    equal(subscriber.observables('Hello').length, 0, 'no observables for Hello')
    equal(subscriber.observables().length, 0, 'no observables at all')
    raises((->subscriber.observables(0)), Error, "Mixin.Subscriber.observables: subscription_name invalid")
    raises((->subscriber.observables({})), Error, "Mixin.Subscriber.observables: subscription_name invalid")
    raises((->subscriber.observables([])), Error, "Mixin.Subscriber.observables: subscription_name invalid")
    raises((->subscriber.observables(observable)), Error, "Mixin.Subscriber.observables: subscription_name invalid")
    raises((->subscriber.observables(Observerable)), Error, "Mixin.Subscriber.observables: subscription_name invalid")
  )

  test("Use case: exclusive subscription tests", ->
    class Observerable
      constructor:  -> Mixin.in(this, 'Observable', 'Everyone is welcome', ['Limited access', Mixin.Subscription.TYPE.EXCLUSIVE])
      destroy:      -> Mixin.out(this, 'Observable')
    class ObservableSubscriberAlwaysObserving
      constructor:  ->
        Mixin.in(this, 'ObservableSubscriber', 'Everyone is welcome', ['Limited access', Mixin.Subscription.TYPE.EXCLUSIVE])
        @addSubscriber(this,
          ['Everyone is welcome', (->), {keep_until_destroyed: true}],
          ['Limited access', (->), {keep_until_destroyed: true}]
        )
      destroy:      -> Mixin.out(this, 'Observable')
    class Subscriber
      constructor:  -> Mixin.in(this, 'Subscriber')
      destroy:      -> Mixin.out(this, 'Subscriber')

    # exclusive
    source = new Observerable()
    subscriber1 = new Subscriber(); subscriber2 = new Subscriber(); subscriber3 = new Subscriber()
    source.addSubscriber(subscriber1, ['Everyone is welcome', (->)], ['Limited access', (->)])
    equal(_.difference(source.subscribers('Everyone is welcome'), [subscriber1]).length, 0, 'Everyone is welcome has subscriber1')
    equal(_.difference(source.subscribers('Limited access'), [subscriber1]).length, 0, 'Limited access has subscriber1')
    source.addSubscriber(subscriber2, ['Everyone is welcome', (->)], ['Limited access', (->)])
    equal(_.difference(source.subscribers('Everyone is welcome'), [subscriber1, subscriber2]).length, 0, 'Everyone is welcome has subscriber1 and subscriber2')
    equal(_.difference(source.subscribers('Limited access'), [subscriber2]).length, 0, 'Limited access has subscriber2')
    source.addSubscriber(subscriber3, ['Everyone is welcome', (->)], ['Limited access', (->)])
    equal(_.difference(source.subscribers('Everyone is welcome'), [subscriber1, subscriber2, subscriber3]).length, 0, 'Everyone is welcome has subscriber1 and subscriber2 and subscriber3')
    equal(_.difference(source.subscribers('Limited access'), [subscriber3]).length, 0, 'Limited access has subscriber3')

    # keep_until_destroyed
    source = new ObservableSubscriberAlwaysObserving()
    subscriber1 = new Subscriber(); subscriber2 = new Subscriber(); subscriber3 = new Subscriber()
    source.addSubscriber(subscriber1, ['Everyone is welcome', (->)], ['Limited access', (->)])
    equal(_.difference(source.subscribers('Everyone is welcome'), [source, subscriber1]).length, 0, 'Everyone is welcome has source and subscriber1')
    equal(_.difference(source.subscribers('Limited access'), [source, subscriber1]).length, 0, 'Limited access has source and subscriber1')
    source.addSubscriber(subscriber2, ['Everyone is welcome', (->)], ['Limited access', (->)])
    equal(_.difference(source.subscribers('Everyone is welcome'), [source, subscriber1, subscriber2]).length, 0, 'Everyone is welcome has source and subscriber1 and subscriber2')
    equal(_.difference(source.subscribers('Limited access'), [source, subscriber2]).length, 0, 'Limited access has source and subscriber2')
    source.removeSubscribers('Everyone is welcome').removeSubscribers('Limited access')
    source.addSubscriber(subscriber3, ['Everyone is welcome', (->)], ['Limited access', (->)])
    equal(_.difference(source.subscribers('Everyone is welcome'), [source, subscriber3]).length, 0, 'Everyone is welcome has source and subscriber3')
    equal(_.difference(source.subscribers('Limited access'), [source, subscriber3]).length, 0, 'Limited access has source and subscriber3')
  )
)