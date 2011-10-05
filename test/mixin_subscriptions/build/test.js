$(document).ready(function() {
  module("Mixin.Subscriptions");
  test("TEST DEPENDENCY MISSING", function() {
    _.VERSION;
    _.AWESOMENESS.Underscore_Awesome;
    return Mixin.Subscriptions.Subscriptions;
  });
  test("Use case: simple scenario", function() {
    var ObservableSubscriber, Observerable, Subscriber, observable_subscriber, source, subscriber;
    Observerable = (function() {
      function Observerable() {
        Mixin["in"](this, 'Observable', 'update', 'destroy');
      }
      Observerable.prototype.destroy = function() {
        this.notifySubscribers('destroy');
        return Mixin.out(this, 'Observable');
      };
      Observerable.prototype.sendUpdate = function(update) {
        return this.notifySubscribers('update', update);
      };
      return Observerable;
    })();
    Subscriber = (function() {
      function Subscriber() {
        Mixin["in"](this, 'Subscriber');
        this.observable_updates = [];
        this.observable_was_destroyed = false;
      }
      Subscriber.prototype.destroy = function() {
        return Mixin.out(this, 'Subscriber');
      };
      Subscriber.prototype.observableWasUpdated = function(update) {
        return this.observable_updates.push(update);
      };
      Subscriber.prototype.observableWasDestroyed = function() {
        return this.observable_was_destroyed = true;
      };
      return Subscriber;
    })();
    ObservableSubscriber = (function() {
      function ObservableSubscriber() {
        Mixin["in"](this, 'ObservableSubscriber', 'update');
        this.observable_updates = [];
        this.observable_was_destroyed = false;
      }
      ObservableSubscriber.prototype.destroy = function() {
        return Mixin.out(this, 'ObservableSubscriber');
      };
      ObservableSubscriber.prototype.sendUpdate = function(update) {
        return this.notifySubscribers('update', update);
      };
      ObservableSubscriber.prototype.observableWasUpdated = function(update) {
        return this.observable_updates.push(update);
      };
      return ObservableSubscriber;
    })();
    source = new Observerable();
    equal(source.hasSubscription('update'), true, 'can subscribe to update');
    equal(source.hasSubscription('destroy'), true, 'can subscribe to destroy');
    equal(source.hasSubscription('walk'), false, 'cannot subscribe to walk');
    deepEqual(source.subscriptions(), ['update', 'destroy'], 'can subscribe to update and destroy');
    subscriber = new Subscriber();
    source.addSubscriber(subscriber, ['update', subscriber.observableWasUpdated], ['destroy', subscriber.observableWasDestroyed]);
    equal(_.difference(source.subscribers('update'), [subscriber]).length, 0, 'subscriber is subscribed to update');
    equal(_.difference(source.subscribers('destroy'), [subscriber]).length, 0, 'subscriber is subscribed to destroy');
    equal(_.difference(source.subscribers(), [subscriber]).length, 0, 'subscriber is subscribed to the source');
    equal(_.difference(subscriber.observables('update'), [source]).length, 0, 'subscriber is observing the source update');
    equal(_.difference(subscriber.observables('destroy'), [source]).length, 0, 'subscriber is observing the source');
    equal(_.difference(subscriber.observables(), [source]).length, 0, 'subscriber is observing the source');
    equal(subscriber.observable_updates.length, 0, "not received yet");
    source.sendUpdate('Pontificate');
    deepEqual(subscriber.observable_updates, ['Pontificate'], "received: ['Pontificate']");
    source.sendUpdate('somewhat').sendUpdate('for').sendUpdate('me.');
    equal(subscriber.observable_updates.join(' '), 'Pontificate somewhat for me.', "received: 'Pontificate somewhat for me.'");
    observable_subscriber = new ObservableSubscriber();
    deepEqual(observable_subscriber.subscriptions(), ['update'], 'can subscribe to update');
    Mixin["in"](source, 'Subscriber');
    source.addSubscriber(observable_subscriber, [
      'update', observable_subscriber.observableWasUpdated, {
        destroy: function() {
          return Mixin.out(source, 'Subscriber');
        }
      }
    ]);
    observable_subscriber.addSubscriber(source, 'update', function(update) {
      return source.sendUpdate(update);
    });
    equal(_.difference(source.subscribers('update'), [subscriber, observable_subscriber]).length, 0, 'source is subscribed to update');
    equal(_.difference(source.subscribers('destroy'), [subscriber]).length, 0, 'source is subscribed to destroy');
    equal(_.difference(source.subscribers(), [subscriber, observable_subscriber]).length, 0, 'source is subscribed to the source');
    equal(_.difference(observable_subscriber.subscribers('update'), [source]).length, 0, 'observable_subscriber is subscribed to update');
    raises((function() {
      return observable_subscriber.subscribers('destroy');
    }), "Mixin.Subscriptions: subscriber 'ObservableSubscriber' does not recognize 'destroy'");
    equal(_.difference(observable_subscriber.subscribers(), [source]).length, 0, 'observable_subscriber is subscribed to the observable_subscriber');
    equal(_.difference(observable_subscriber.observables('update'), [source]).length, 0, 'observable_subscriber is observing the source update');
    equal(_.difference(observable_subscriber.observables('destroy'), [source]).length, 0, 'observable_subscriber is observing the source');
    equal(_.difference(observable_subscriber.observables(), [source]).length, 0, 'observable_subscriber is observing the source');
    observable_subscriber.sendUpdate('OK!').sendUpdate('To').sendUpdate('be');
    source.removeSubscriber(observable_subscriber, ['update', observable_subscriber.observableWasUpdated]);
    source.sendUpdate('or');
    source.addSubscriber(observable_subscriber, ['update', observable_subscriber.observableWasUpdated]);
    source.sendUpdate('not');
    source.removeSubscriber(observable_subscriber, 'update', observable_subscriber.observableWasUpdated);
    source.sendUpdate('to');
    source.addSubscriber(observable_subscriber, 'update', observable_subscriber.observableWasUpdated);
    source.sendUpdate('be');
    deepEqual(subscriber.observable_updates.join(' '), 'Pontificate somewhat for me. OK! To be or not to be', "received: 'Pontificate somewhat for me. OK! To be or not to be'");
    deepEqual(observable_subscriber.observable_updates.join(' '), 'OK! To be not be', "received: 'OK! To be not be'");
    subscriber.destroy();
    equal(_.difference(source.subscribers('update'), [observable_subscriber]).length, 0, 'observable_subscriber is subscribed to update');
    equal(_.difference(source.subscribers('destroy'), []).length, 0, 'observable_subscriber is subscribed to destroy');
    equal(_.difference(source.subscribers(), [observable_subscriber]).length, 0, 'observable_subscriber is subscribed to the source');
    equal(_.difference(observable_subscriber.subscribers('update'), [source]).length, 0, 'observable_subscriber is subscribed to update');
    raises((function() {
      return observable_subscriber.subscribers('destroy');
    }), "Mixin.Subscriptions: subscriber 'ObservableSubscriber' does not recognize 'destroy'");
    equal(_.difference(observable_subscriber.subscribers(), [source]).length, 0, 'observable_subscriber is subscribed to the observable_subscriber');
    source.destroy();
    equal(_.difference(observable_subscriber.subscribers('update'), []).length, 0, 'no one is subscribed to update');
    equal(_.difference(observable_subscriber.subscribers(), []).length, 0, 'no one is subscribed to the observable_subscriber');
    return observable_subscriber.destroy();
  });
  test("Use case: valid and invalid checking", function() {
    var Observerable, Subscriber, observable, subscriber;
    Observerable = (function() {
      function Observerable() {
        Mixin["in"](this, 'Observable');
      }
      Observerable.prototype.destroy = function() {
        return this.notifySubscribers('destroy');
      };
      return Observerable;
    })();
    Subscriber = (function() {
      function Subscriber() {
        Mixin["in"](this, 'Subscriber');
      }
      Subscriber.prototype.destroy = function() {
        return Mixin.out(this, 'Subscriber');
      };
      return Subscriber;
    })();
    observable = new Observerable();
    raises((function() {
      return observable.hasSubscription();
    }), Error, "Mixin.Observable.hasSubscription: subscription_name missing");
    raises((function() {
      return observable.hasSubscription(0);
    }), Error, "Mixin.Observable.hasSubscription: subscription_name invalid");
    raises((function() {
      return observable.hasSubscription({});
    }), Error, "Mixin.Observable.hasSubscription: subscription_name invalid");
    raises((function() {
      return observable.hasSubscription([]);
    }), Error, "Mixin.Observable.hasSubscription: subscription_name invalid");
    raises((function() {
      return observable.hasSubscription(observable);
    }), Error, "Mixin.Observable.hasSubscription: subscription_name invalid");
    raises((function() {
      return observable.hasSubscription(Observerable);
    }), Error, "Mixin.Observable.hasSubscription: subscription_name invalid");
    observable = new Observerable();
    raises((function() {
      return observable.addSubscription();
    }), Error, "Mixin.Observable.addSubscription: subscription_name missing");
    raises((function() {
      return observable.addSubscription(0);
    }), Error, "Mixin.Observable.addSubscription: subscription_name invalid");
    raises((function() {
      return observable.addSubscription({});
    }), Error, "Mixin.Observable.addSubscription: subscription_name invalid");
    raises((function() {
      return observable.addSubscription([]);
    }), Error, "Mixin.Observable.addSubscription: subscription_name invalid");
    raises((function() {
      return observable.addSubscription(observable);
    }), Error, "Mixin.Observable.addSubscription: subscription_name invalid");
    raises((function() {
      return observable.addSubscription(Observerable);
    }), Error, "Mixin.Observable.addSubscription: subscription_name invalid");
    raises((function() {
      return observable.addSubscription('Hello', 42);
    }), Error, "Mixin.Observable.addSubscription: options invalid");
    raises((function() {
      return observable.addSubscription('Hello', []);
    }), Error, "Mixin.Observable.addSubscription: options invalid");
    raises((function() {
      return observable.addSubscription('Hello', observable);
    }), Error, "Mixin.Observable.addSubscription: options invalid");
    raises((function() {
      return observable.addSubscription('Hello', Observerable);
    }), Error, "Mixin.Observable.addSubscription: options invalid");
    observable = new Observerable();
    raises((function() {
      return observable.subscribers('Hello');
    }), Error, "Mixin.Observable.subscribers: subscriber 'Observerable' does not recognize 'Hello'");
    raises((function() {
      return observable.subscribers(0);
    }), Error, "Mixin.Observable.subscribers: subscription_name invalid");
    raises((function() {
      return observable.subscribers({});
    }), Error, "Mixin.Observable.subscribers: subscription_name invalid");
    raises((function() {
      return observable.subscribers([]);
    }), Error, "Mixin.Observable.subscribers: subscription_name invalid");
    raises((function() {
      return observable.subscribers(observable);
    }), Error, "Mixin.Observable.subscribers: subscription_name invalid");
    raises((function() {
      return observable.subscribers(Observerable);
    }), Error, "Mixin.Observable.subscribers: subscription_name invalid");
    observable = new Observerable();
    raises((function() {
      return observable.addSubscriber();
    }), Error, "Mixin.Observable.subscribe: subscriber missing");
    raises((function() {
      return observable.addSubscriber('Hello');
    }), Error, "Mixin.Observable.subscribe: subscriber invalid");
    raises((function() {
      return observable.addSubscriber(0);
    }), Error, "Mixin.Observable.subscribe: subscriber invalid");
    raises((function() {
      return observable.addSubscriber({});
    }), Error, "Mixin.Observable.subscribe: subscriber invalid");
    raises((function() {
      return observable.addSubscriber([]);
    }), Error, "Mixin.Observable.subscribe: subscriber invalid");
    raises((function() {
      return observable.addSubscriber(observable);
    }), Error, "Mixin.Observable.subscribe: subscriber invalid");
    raises((function() {
      return observable.addSubscriber(Observerable);
    }), Error, "Mixin.Observable.subscribe: subscriber invalid");
    subscriber = new Subscriber();
    raises((function() {
      return observable.addSubscriber(subscriber, 'Hello');
    }), Error, "Mixin.Observable.subscribe: Hello does not exist for subscription_name");
    raises((function() {
      return observable.addSubscriber(subscriber, ['Hello']);
    }), Error, "Mixin.Observable.subscribe: Hello does not exist for subscription_name");
    observable.addSubscription('Hello');
    raises((function() {
      return observable.addSubscriber(subscriber, ['Hello', (function() {})], 'Goodbye');
    }), Error, "Mixin.Observable.subscribe: Goodbye does not exist for subscription_name");
    raises((function() {
      return observable.addSubscriber(subscriber, ['Hello', (function() {})], ['Goodbye']);
    }), Error, "Mixin.Observable.subscribe: Goodbye does not exist for subscription_name");
    raises((function() {
      return observable.addSubscriber(subscriber, ['Hello', (function() {})], ['Good day', 'sir!']);
    }), Error, "Mixin.Observable.subscribe: Goodbye does not exist for subscription_name");
    raises((function() {
      return observable.addSubscriber(subscriber, 'Hello');
    }), Error, "Mixin.Observable.subscribe: notification_callback missing");
    raises((function() {
      return observable.addSubscriber(subscriber, ['Hello']);
    }), Error, "Mixin.Observable.subscribe: notification_callback missing");
    raises((function() {
      return observable.addSubscriber(subscriber, 'Hello', 0);
    }), Error, "Mixin.Observable.subscribe: notification_callback invalid");
    raises((function() {
      return observable.addSubscriber(subscriber, 'Hello', {});
    }), Error, "Mixin.Observable.subscribe: notification_callback invalid");
    raises((function() {
      return observable.addSubscriber(subscriber, ['Hello', []]);
    }), Error, "Mixin.Observable.subscribe: notification_callback invalid");
    raises((function() {
      return observable.addSubscriber(subscriber, ['Hello', observable]);
    }), Error, "Mixin.Observable.subscribe: notification_callback invalid");
    raises((function() {
      return observable.addSubscriber(subscriber, 'Hello', (function() {}), {
        destroy: 0
      });
    }), Error, "Mixin.Observable.subscribe: destroy_callback invalid");
    raises((function() {
      return observable.addSubscriber(subscriber, [
        'Hello', (function() {}), {
          destroy: []
        }
      ]);
    }), Error, "Mixin.Observable.subscribe: destroy_callback invalid");
    raises((function() {
      return observable.addSubscriber(subscriber, [
        'Hello', (function() {}), {
          destroy: observable
        }
      ]);
    }), Error, "Mixin.Observable.subscribe: destroy_callback invalid");
    observable = new Observerable();
    raises((function() {
      return observable.notifySubscribers('Goodbye');
    }), Error, "Mixin.Observable.notifySubscribers: subscription 'Hello' does not exist for 'Goodbye'");
    raises((function() {
      return observable.notifySubscribers();
    }), Error, "Mixin.Observable.notifySubscribers: subscription_name missing");
    raises((function() {
      return observable.notifySubscribers(0);
    }), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid");
    raises((function() {
      return observable.notifySubscribers({});
    }), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid");
    raises((function() {
      return observable.notifySubscribers([]);
    }), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid");
    raises((function() {
      return observable.notifySubscribers(observable);
    }), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid");
    raises((function() {
      return observable.notifySubscribers(Observerable);
    }), Error, "Mixin.Observable.notifySubscribers: subscription_name invalid");
    observable = new Observerable();
    raises((function() {
      return observable.removeSubscriber(subscriber, 'Goodbye', function() {});
    }), Error, "Mixin.Observable.unsubscribe: subscription 'Goodbye' does not exist for 'Observer'");
    raises((function() {
      return observable.removeSubscriber();
    }), Error, "Mixin.Observable.unsubscribe: subscriber missing");
    raises((function() {
      return observable.removeSubscriber('Hello');
    }), Error, "Mixin.Observable.unsubscribe: subscriber invalid");
    raises((function() {
      return observable.removeSubscriber(0);
    }), Error, "Mixin.Observable.unsubscribe: subscriber invalid");
    raises((function() {
      return observable.removeSubscriber({});
    }), Error, "Mixin.Observable.unsubscribe: subscriber invalid");
    raises((function() {
      return observable.removeSubscriber([]);
    }), Error, "Mixin.Observable.unsubscribe: subscriber invalid");
    raises((function() {
      return observable.removeSubscriber(observable);
    }), Error, "Mixin.Observable.unsubscribe: subscriber invalid");
    raises((function() {
      return observable.removeSubscriber(Observerable);
    }), Error, "Mixin.Observable.unsubscribe: subscriber invalid");
    raises((function() {
      return observable.removeSubscriber(subscriber, 'Hello');
    }), Error, "Mixin.Observable.unsubscribe: Hello does not exist for subscription_name");
    raises((function() {
      return observable.removeSubscriber(subscriber, ['Hello']);
    }), Error, "Mixin.Observable.unsubscribe: Hello does not exist for subscription_name");
    raises((function() {
      return observable.removeSubscriber(subscriber, ['Hello', (function() {})], 'Goodbye');
    }), Error, "Mixin.Observable.unsubscribe: Goodbye does not exist for subscription_name");
    raises((function() {
      return observable.removeSubscriber(subscriber, ['Hello', (function() {})], ['Goodbye']);
    }), Error, "Mixin.Observable.unsubscribe: Goodbye does not exist for subscription_name");
    raises((function() {
      return observable.removeSubscriber(subscriber, ['Hello', (function() {})], ['Good day', 'sir!']);
    }), Error, "Mixin.Observable.unsubscribe: Goodbye does not exist for subscription_name");
    raises((function() {
      return observable.removeSubscriber(subscriber, 'Hello');
    }), Error, "Mixin.Observable.unsubscribe: notification_callback missing");
    raises((function() {
      return observable.removeSubscriber(subscriber, ['Hello']);
    }), Error, "Mixin.Observable.unsubscribe: notification_callback missing");
    raises((function() {
      return observable.removeSubscriber(subscriber, 'Hello', 0);
    }), Error, "Mixin.Observable.unsubscribe: notification_callback invalid");
    raises((function() {
      return observable.removeSubscriber(subscriber, 'Hello', {});
    }), Error, "Mixin.Observable.unsubscribe: notification_callback invalid");
    raises((function() {
      return observable.removeSubscriber(subscriber, ['Hello', []]);
    }), Error, "Mixin.Observable.unsubscribe: notification_callback invalid");
    raises((function() {
      return observable.removeSubscriber(subscriber, ['Hello', observable]);
    }), Error, "Mixin.Observable.unsubscribe: notification_callback invalid");
    observable = new Observerable();
    raises((function() {
      return observable.removeSubscribers('Goodbye', function() {});
    }), Error, "Mixin.Observable.removeSubscribers: subscription 'Goodbye' does not exist for 'Observer'");
    raises((function() {
      return observable.removeSubscribers(0);
    }), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid");
    raises((function() {
      return observable.removeSubscribers({});
    }), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid");
    raises((function() {
      return observable.removeSubscribers([]);
    }), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid");
    raises((function() {
      return observable.removeSubscribers(observable);
    }), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid");
    raises((function() {
      return observable.removeSubscribers(Observerable);
    }), Error, "Mixin.Observable.removeSubscribers: subscription_name invalid");
    observable.addSubscription('Hello');
    observable.removeSubscribers('Hello');
    raises((function() {
      return observable.removeSubscribers('Hello', 0);
    }), Error, "Mixin.Observable.removeSubscribers: test_fn invalid");
    raises((function() {
      return observable.removeSubscribers('Hello', {});
    }), Error, "Mixin.Observable.removeSubscribers: test_fn invalid");
    raises((function() {
      return observable.removeSubscribers('Hello', []);
    }), Error, "Mixin.Observable.removeSubscribers: test_fn invalid");
    raises((function() {
      return observable.removeSubscribers('Hello', observable);
    }), Error, "Mixin.Observable.removeSubscribers: test_fn invalid");
    subscriber = new Subscriber();
    equal(subscriber.observables('Hello').length, 0, 'no observables for Hello');
    equal(subscriber.observables().length, 0, 'no observables at all');
    raises((function() {
      return subscriber.observables(0);
    }), Error, "Mixin.Subscriber.observables: subscription_name invalid");
    raises((function() {
      return subscriber.observables({});
    }), Error, "Mixin.Subscriber.observables: subscription_name invalid");
    raises((function() {
      return subscriber.observables([]);
    }), Error, "Mixin.Subscriber.observables: subscription_name invalid");
    raises((function() {
      return subscriber.observables(observable);
    }), Error, "Mixin.Subscriber.observables: subscription_name invalid");
    return raises((function() {
      return subscriber.observables(Observerable);
    }), Error, "Mixin.Subscriber.observables: subscription_name invalid");
  });
  return test("Use case: exclusive subscription tests", function() {
    var ObservableSubscriberAlwaysObserving, Observerable, Subscriber, source, subscriber1, subscriber2, subscriber3;
    Observerable = (function() {
      function Observerable() {
        Mixin["in"](this, 'Observable', 'Everyone is welcome', ['Limited access', Mixin.Subscription.TYPE.EXCLUSIVE]);
      }
      Observerable.prototype.destroy = function() {
        return Mixin.out(this, 'Observable');
      };
      return Observerable;
    })();
    ObservableSubscriberAlwaysObserving = (function() {
      function ObservableSubscriberAlwaysObserving() {
        Mixin["in"](this, 'ObservableSubscriber', 'Everyone is welcome', ['Limited access', Mixin.Subscription.TYPE.EXCLUSIVE]);
        this.addSubscriber(this, [
          'Everyone is welcome', (function() {}), {
            keep_until_destroyed: true
          }
        ], [
          'Limited access', (function() {}), {
            keep_until_destroyed: true
          }
        ]);
      }
      ObservableSubscriberAlwaysObserving.prototype.destroy = function() {
        return Mixin.out(this, 'Observable');
      };
      return ObservableSubscriberAlwaysObserving;
    })();
    Subscriber = (function() {
      function Subscriber() {
        Mixin["in"](this, 'Subscriber');
      }
      Subscriber.prototype.destroy = function() {
        return Mixin.out(this, 'Subscriber');
      };
      return Subscriber;
    })();
    source = new Observerable();
    subscriber1 = new Subscriber();
    subscriber2 = new Subscriber();
    subscriber3 = new Subscriber();
    source.addSubscriber(subscriber1, ['Everyone is welcome', (function() {})], ['Limited access', (function() {})]);
    equal(_.difference(source.subscribers('Everyone is welcome'), [subscriber1]).length, 0, 'Everyone is welcome has subscriber1');
    equal(_.difference(source.subscribers('Limited access'), [subscriber1]).length, 0, 'Limited access has subscriber1');
    source.addSubscriber(subscriber2, ['Everyone is welcome', (function() {})], ['Limited access', (function() {})]);
    equal(_.difference(source.subscribers('Everyone is welcome'), [subscriber1, subscriber2]).length, 0, 'Everyone is welcome has subscriber1 and subscriber2');
    equal(_.difference(source.subscribers('Limited access'), [subscriber2]).length, 0, 'Limited access has subscriber2');
    source.addSubscriber(subscriber3, ['Everyone is welcome', (function() {})], ['Limited access', (function() {})]);
    equal(_.difference(source.subscribers('Everyone is welcome'), [subscriber1, subscriber2, subscriber3]).length, 0, 'Everyone is welcome has subscriber1 and subscriber2 and subscriber3');
    equal(_.difference(source.subscribers('Limited access'), [subscriber3]).length, 0, 'Limited access has subscriber3');
    source = new ObservableSubscriberAlwaysObserving();
    subscriber1 = new Subscriber();
    subscriber2 = new Subscriber();
    subscriber3 = new Subscriber();
    source.addSubscriber(subscriber1, ['Everyone is welcome', (function() {})], ['Limited access', (function() {})]);
    equal(_.difference(source.subscribers('Everyone is welcome'), [source, subscriber1]).length, 0, 'Everyone is welcome has source and subscriber1');
    equal(_.difference(source.subscribers('Limited access'), [source, subscriber1]).length, 0, 'Limited access has source and subscriber1');
    source.addSubscriber(subscriber2, ['Everyone is welcome', (function() {})], ['Limited access', (function() {})]);
    equal(_.difference(source.subscribers('Everyone is welcome'), [source, subscriber1, subscriber2]).length, 0, 'Everyone is welcome has source and subscriber1 and subscriber2');
    equal(_.difference(source.subscribers('Limited access'), [source, subscriber2]).length, 0, 'Limited access has source and subscriber2');
    source.removeSubscribers('Everyone is welcome').removeSubscribers('Limited access');
    source.addSubscriber(subscriber3, ['Everyone is welcome', (function() {})], ['Limited access', (function() {})]);
    equal(_.difference(source.subscribers('Everyone is welcome'), [source, subscriber3]).length, 0, 'Everyone is welcome has source and subscriber3');
    return equal(_.difference(source.subscribers('Limited access'), [source, subscriber3]).length, 0, 'Limited access has source and subscriber3');
  });
});