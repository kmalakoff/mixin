/*
  mixin_subscriptions.js
  (c) 2011 Kevin Malakoff.
  Mixin.Subscriptions is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Underscore-Awesomer.js
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.Subscriptions: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (!_.VERSION) {
  throw new Error('Mixin.Subscriptions: Dependency alert! Underscore.js must be included before this file');
}
if (!_.AWESOMENESS) {
  throw new Error("Mixin.Subscriptions: Dependency alert! Underscore-Awesomer.js must be included before this file");
}
Mixin.Subscriptions || (Mixin.Subscriptions = {});
Mixin.Subscriptions._SubscriptionLink = (function() {
  function _SubscriptionLink(subscription, subscriber, notification_callback, options) {
    var subscriber_instance_data;
    this.subscription = subscription;
    this.subscriber = subscriber;
    this.notification_callback = notification_callback;
    this.options = _.clone(options || {});
    subscriber_instance_data = Mixin.instanceData(this.subscriber, 'Subscriber');
    subscriber_instance_data.subscription_backlinks.push(this);
  }
  _SubscriptionLink.prototype.mustKeepUntilDestroyed = function() {
    return (this.options.keep_until_destroyed === void 0) || !this.options.keep_until_destroyed;
  };
  _SubscriptionLink.prototype.destroy = function() {
    var subscriber_instance_data;
    if (!this.subscription) {
      throw new Error("Mixin.Subscriptions: _SubscriptionLink destroyed multiple times");
    }
    if (this.options.destroy) {
      this.options.destroy();
      this.options.destroy = null;
    }
    subscriber_instance_data = Mixin.instanceData(this.subscriber, 'Subscriber');
    _.remove(subscriber_instance_data.subscription_backlinks, this);
    _.remove(this.subscription.subscription_links, this);
    this.subscription = null;
    this.subscriber = null;
    this.notification_callback = null;
    return this.options = null;
  };
  return _SubscriptionLink;
})();
Mixin.Subscription || (Mixin.Subscription = {});
Mixin.Subscription.TYPE = {};
Mixin.Subscription.TYPE.MULTIPLE = 0;
Mixin.Subscription.TYPE.EXCLUSIVE = 1;
Mixin.Subscriptions._Subscription = (function() {
  function _Subscription(observable, subscription_type) {
    this.observable = observable;
    this.subscription_type = subscription_type;
    if (Mixin.DEBUG) {
      if ((typeof this.subscription_type !== 'number') || (this.subscription_type < Mixin.Subscription.TYPE.MULTIPLE) || (this.subscription_type > Mixin.Subscription.TYPE.EXCLUSIVE)) {
        throw new Error("Mixin.Subscriptions: Mixin.Subscription.TYPE is invalid");
      }
    }
    this.subscription_links = [];
  }
  _Subscription.prototype.addSubscriber = function(subscriber, notification_callback, options) {
    if (this.subscription_type === Mixin.Subscription.TYPE.EXCLUSIVE) {
      this.removeSubscribers(function(test_subscription) {
        return test_subscription.mustKeepUntilDestroyed();
      });
    }
    return this.subscription_links.push(new Mixin.Subscriptions._SubscriptionLink(this, subscriber, notification_callback, options));
  };
  _Subscription.prototype.removeSubscriber = function(subscriber, notification_callback, subscription_name) {
    var subscription_link;
    subscription_link = _.find(this.subscription_links, function(test) {
      return (subscriber === test.subscriber) && (notification_callback === test.notification_callback);
    });
    if (!subscription_link) {
      throw new Error("Mixin.Subscriptions.removeSubscriber: subscription '" + subscription_name + "' does not exist for '" + (_.classOf(subscriber)) + "'");
    }
    _.remove(this.subscription_links, subscription_link);
    return subscription_link.destroy();
  };
  _Subscription.prototype.subscribers = function(subscribers) {
    var subscription_link, _i, _len, _ref, _results;
    _ref = this.subscription_links;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription_link = _ref[_i];
      _results.push(subscribers.push(subscription_link.subscriber));
    }
    return _results;
  };
  _Subscription.prototype.notifySubscribers = function() {
    var args, subscription_link, _i, _len, _ref, _results;
    args = Array.prototype.slice.call(arguments);
    _ref = this.subscription_links;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription_link = _ref[_i];
      _results.push(subscription_link.notification_callback.apply(subscription_link.subscriber, args));
    }
    return _results;
  };
  _Subscription.prototype.removeSubscribers = function(test_fn) {
    var removed_subscription_links, subscription_link, _i, _j, _len, _len2, _results, _results2;
    if (test_fn) {
      removed_subscription_links = _.select(this.subscription_links, test_fn);
      if (removed_subscription_links.length === 0) {
        return;
      }
      this.subscription_links = _.difference(this.subscription_links, removed_subscription_links);
      _results = [];
      for (_i = 0, _len = removed_subscription_links.length; _i < _len; _i++) {
        subscription_link = removed_subscription_links[_i];
        _results.push(subscription_link.destroy());
      }
      return _results;
    } else {
      removed_subscription_links = this.subscription_links;
      this.subscription_links = [];
      _results2 = [];
      for (_j = 0, _len2 = removed_subscription_links.length; _j < _len2; _j++) {
        subscription_link = removed_subscription_links[_j];
        _results2.push(subscription_link.destroy());
      }
      return _results2;
    }
  };
  _Subscription.prototype.destroy = function() {
    return _.remove(this.subscription_links, void 0, {
      callback: (function(item) {
        return item.destroy();
      }),
      preclear: true
    });
  };
  return _Subscription;
})();
Mixin.Subscriptions.Observable || (Mixin.Subscriptions.Observable = {});
Mixin.Subscriptions.Observable._mixin_info = {
  mixin_name: 'Observable',
  initialize: function() {
    var arg, _i, _len, _results;
    Mixin.instanceData(this, 'Observable', {
      subscriptions: {},
      is_destroyed: false
    });
    _results = [];
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      _results.push(this.addSubscription.apply(this, _.isArray(arg) ? arg : [arg]));
    }
    return _results;
  },
  destroy: function() {
    var instance_data;
    instance_data = Mixin.instanceData(this, 'Observable');
    if (instance_data.is_destroyed) {
      throw new Error("Mixin.Observable.destroy: already destroyed");
    }
    instance_data.is_destroyed = true;
    return _.remove(instance_data.subscriptions, void 0, {
      callback: (function(item) {
        return item.destroy();
      })
    });
  },
  mixin_object: {
    hasSubscription: function(subscription_name) {
      var instance_data;
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.hasSubscription', 'subscription_name');
      }
      instance_data = Mixin.instanceData(this, 'Observable');
      return instance_data.subscriptions.hasOwnProperty(subscription_name);
    },
    addSubscription: function(subscription_name, subscription_type) {
      var instance_data;
      instance_data = Mixin.instanceData(this, 'Observable');
      if (subscription_type === void 0) {
        subscription_type = Mixin.Subscription.TYPE.MULTIPLE;
      }
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.addSubscription', 'subscription_name');
        Mixin.Core._Validate.noKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.addSubscription', 'subscription_name');
      }
      instance_data.subscriptions[subscription_name] = new Mixin.Subscriptions._Subscription(this, subscription_type);
      return this;
    },
    subscriptions: function() {
      var instance_data, key, subscriptions, value, _ref;
      instance_data = Mixin.instanceData(this, 'Observable');
      subscriptions = [];
      _ref = instance_data.subscriptions;
      for (key in _ref) {
        value = _ref[key];
        subscriptions.push(key);
      }
      return subscriptions;
    },
    subscribers: function(subscription_name) {
      var instance_data, key, subscribers, subscription, _ref, _ref2;
      subscribers = [];
      instance_data = Mixin.instanceData(this, 'Observable');
      if (subscription_name === void 0) {
        _ref = instance_data.subscriptions;
        for (key in _ref) {
          subscription = _ref[key];
          subscription.subscribers(subscribers);
        }
      } else {
        if (!instance_data.subscriptions.hasOwnProperty(subscription_name)) {
          throw new Error("Mixin.Observable.subscribers: subscriber '" + (_classOf(this)) + "' does not recognize '" + subscription_name + "'");
        }
        _ref2 = instance_data.subscriptions;
        for (key in _ref2) {
          subscription = _ref2[key];
          if (subscription.subscription_name === subscription_name) {
            subscription.subscribers(subscribers);
          }
        }
      }
      return _.uniq(subscribers);
    },
    addSubscriber: function(subscriber, subscription_parameters) {
      var args, check_arg, instance_data, parameter, _doSubscribe, _i, _len;
      instance_data = Mixin.instanceData(this, 'Observable');
      _doSubscribe = function(subscription_name, notification_callback, options) {
        var subscription;
        options || (options = {});
        if (Mixin.DEBUG) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.addSubscriber', 'subscription_name');
          Mixin.Core._Validate.callback(notification_callback, 'Mixin.Observable.addSubscriber', 'notification_callback');
          Mixin.Core._Validate.object(options, 'Mixin.Observable.addSubscriber', 'options');
          if (options.destroy !== void 0) {
            Mixin.Core._Validate.callback(options.destroy, 'Mixin.Observable.addSubscriber', 'options.destroy');
          }
        }
        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.addSubscriber', 'subscription_name');
        subscription = instance_data.subscriptions[subscription_name];
        return subscription.addSubscriber(subscriber, notification_callback, options);
      };
      args = Array.prototype.slice.call(arguments, 1);
      Mixin.Core._Validate.instanceWithMixin(subscriber, 'Subscriber', 'Mixin.Observable.addSubscriber', 'subscriber');
      if (args.length > 1) {
        check_arg = args[1];
        if (!((_.isString(check_arg) && this.hasSubscription(check_arg)) || (_.isArray(check_arg) && (check_arg.length >= 1) && _.isString(check_arg[0]) && this.hasSubscription(check_arg[0])))) {
          _doSubscribe.apply(this, Array.prototype.slice.call(arguments, 1));
          return this;
        }
      }
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        parameter = args[_i];
        if (_.isArray(parameter)) {
          _doSubscribe.apply(this, parameter);
        } else {
          _doSubscribe.apply(parameter);
        }
      }
      return this;
    },
    notifySubscribers: function(subscription_name) {
      var instance_data, subscription;
      instance_data = Mixin.instanceData(this, 'Observable');
      if (instance_data.is_destroyed) {
        return;
      }
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.notifySubscribers', 'subscription_name');
        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.notifySubscribers');
      }
      subscription = instance_data.subscriptions[subscription_name];
      if (!subscription) {
        return;
      }
      subscription.notifySubscribers.apply(subscription, Array.prototype.slice.call(arguments, 1));
      return this;
    },
    removeSubscriber: function(subscriber, subscription_name, notification_callback) {
      var args, check_arg, instance_data, parameter, _doUnsubscribe, _i, _len;
      instance_data = Mixin.instanceData(this, 'Observable');
      _doUnsubscribe = function(subscription_name, notification_callback) {
        var subscription;
        if (Mixin.DEBUG) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.removeSubscriber', 'subscription_name');
          Mixin.Core._Validate.callback(notification_callback, 'Mixin.Observable.removeSubscriber', 'notification_callback');
        }
        Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.removeSubscriber', 'subscription_name');
        subscription = instance_data.subscriptions[subscription_name];
        return subscription.removeSubscriber(subscriber, notification_callback, subscription_name);
      };
      args = Array.prototype.slice.call(arguments, 1);
      if (Mixin.DEBUG) {
        Mixin.Core._Validate.instanceWithMixin(subscriber, 'Subscriber', 'Mixin.Observable.removeSubscriber', 'subscriber');
      }
      if (args.length > 1) {
        check_arg = args[1];
        if (!((_.isString(check_arg) && this.hasSubscription(check_arg)) || (_.isArray(check_arg) && (check_arg.length >= 1) && _.isString(check_arg[0]) && this.hasSubscription(check_arg[0])))) {
          _doUnsubscribe.apply(this, Array.prototype.slice.call(arguments, 1));
          return this;
        }
      }
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        parameter = args[_i];
        if (_.isArray(parameter)) {
          _doUnsubscribe.apply(this, parameter);
        } else {
          _doUnsubscribe.apply(parameter);
        }
      }
      return this;
    },
    removeSubscribers: function(subscription_name, test_fn) {
      var instance_data, key, subscription, _ref;
      instance_data = Mixin.instanceData(this, 'Observable');
      if (Mixin.DEBUG) {
        if (subscription_name !== void 0) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Observable.removeSubscribers', 'subscription_name');
          Mixin.Core._Validate.hasKey(instance_data.subscriptions, subscription_name, 'Mixin.Observable.removeSubscribers');
        }
        if (test_fn !== void 0) {
          Mixin.Core._Validate.callback(test_fn, 'Mixin.Observable.removeSubscribers', 'test_fn');
        }
      }
      if (subscription_name) {
        subscription = instance_data.subscriptions[subscription_name];
        if (!subscription) {
          return;
        }
        subscription.removeSubscribers(test_fn);
      } else {
        _ref = instance_data.subscriptions;
        for (key in _ref) {
          subscription = _ref[key];
          subscription.removeSubscribers(test_fn);
        }
      }
      return this;
    }
  }
};
Mixin.Subscriptions.Subscriber || (Mixin.Subscriptions.Subscriber = {});
Mixin.Subscriptions.Subscriber._mixin_info = {
  mixin_name: 'Subscriber',
  initialize: function() {
    return Mixin.instanceData(this, 'Subscriber', {
      subscription_backlinks: [],
      is_destroyed: false
    });
  },
  destroy: function() {
    var instance_data;
    instance_data = Mixin.instanceData(this, 'Subscriber');
    if (instance_data.is_destroyed) {
      throw new Error("Mixin.Subscriber.destroy: already destroyed");
    }
    instance_data.is_destroyed = true;
    return _.remove(instance_data.subscription_backlinks, void 0, {
      callback: (function(item) {
        return item.destroy();
      }),
      preclear: true
    });
  },
  mixin_object: {
    observables: function(subscription_name) {
      var instance_data, obserables, subscription_link, _i, _j, _len, _len2, _ref, _ref2;
      instance_data = Mixin.instanceData(this, 'Subscriber');
      obserables = [];
      if (subscription_name === void 0) {
        _ref = instance_data.subscription_backlinks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subscription_link = _ref[_i];
          if (subscription_link.subscription && (subscription_link.subscription.subscription_name === subscription_name)) {
            obserables.push(subscription_link.subscription.observable);
          }
        }
      } else {
        if (Mixin.DEBUG) {
          Mixin.Core._Validate.string(subscription_name, 'Mixin.Subscriptions.observables', 'subscription_name');
        }
        _ref2 = instance_data.subscription_backlinks;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          subscription_link = _ref2[_j];
          if (subscription_link.subscription) {
            obserables.push(subscription_link.subscription.observable);
          }
        }
      }
      return _.uniq(obserables);
    }
  }
};
Mixin.Subscriptions.ObservableSubscriber || (Mixin.Subscriptions.ObservableSubscriber = {});
Mixin.Subscriptions.ObservableSubscriber._mixin_info = {
  mixin_name: 'ObservableSubscriber',
  mixin_object: {},
  initialize: function() {
    return Mixin["in"](this, 'Subscriber', ['Observable'].concat(Array.prototype.slice.call(arguments)));
  },
  destroy: function() {
    return Mixin.out(this, 'Subscriber', 'Observable');
  }
};
Mixin.registerMixin(Mixin.Subscriptions.Observable._mixin_info);
Mixin.registerMixin(Mixin.Subscriptions.Subscriber._mixin_info);
Mixin.registerMixin(Mixin.Subscriptions.ObservableSubscriber._mixin_info);