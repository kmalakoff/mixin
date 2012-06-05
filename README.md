[![Build Status](https://secure.travis-ci.org/kmalakoff/mixin.png)](http://travis-ci.org/kmalakoff/mixin)

````
        _        _           _
  /\/\ (_)__  __(_)_ __     (_)___
 /    \| |\ \/ /| | '_ \    | / __|
/ /\/\ \ | >  < | | | | |_  | \__ \
\/    \/_|/_/\_\|_|_| |_(_)_/ |___/
                          |__/
````

Mixin.js is the 'reuse more' Javascript nano-framework. Stay DRY...mixin!

You can get the library with standard mixins here:

* Development version: https://github.com/kmalakoff/mixin/raw/master/mixin-js.js
* Production version: https://github.com/kmalakoff/mixin/raw/master/mixin.min.js

You can get the minimal library (no standard mixins included) here:

* Development version: https://github.com/kmalakoff/mixin/raw/master/mixin-js-core.js
* Production version: https://github.com/kmalakoff/mixin/raw/master/mixin-js-core.min.js

# Introducing Mixin.js
Mixin.js brings "dynamic aspect-oriented programming" to Javascript. "Dynamic" means you can add and remove independently encapsulated functionality and data to your instances on-the-fly. "Aspect-oriented" means you can flatten your class hierarchy and add/remove functionality only where & when needed.

Classic object-oriented design can force you to regularly make tradeoff decisions based on your evolving subclasses like deciding between polluting common super classes  (eg. push common functionality up the hierarchy whenever it needs to be reused) vs making un-DRY code when only a subset of sub-classes require common functionality (eg. cut/paste and maintain the code). Mixin.js provides you with a light framework to avoid the decision altogether...make a mixin, use it where & when you need it...decisions made, stay made.

# Why?
I bet you're asking yourself what made me I write this anyways and...isn't it overkill?

The problem I had was that I was implementing Backbone.Views. Some of them needed scrollable content areas (using iScroll), some of them needed to be dynamically rendered based on Backbone.Models loading and unloading whereas others needed to render collections, some of them needed to have timers to change state after a specific timeout, all of them had custom destroy methods to unbind jQuery events, some views needed to subscribe to state changes on other views, etc. My base view class was becoming a kitchen sink class and I thought, there's got to be a better way!

So I started on the path of factoring out each aspect, providing initialize and destroy code for each, and mixing-in functionality on the fly. Now, I have a very simple view base class that only provides the minimal & common view functionality (it actually doesn't even need to be a Backbone.View anymore since all the functionality is now in mixins) and a view hierarchy two deep. Each view is simple to read, light on code, and customized to meet its unique needs.

Overkill? Try it and you can decide.

# Compared to Object.extend or _.extend()
Mixin.js goes beyond Javascript's 'Object.extend' by providing:

* optional initialize and destroy methods that are called when the mixin is added or removed using Mixin.in(instance, 'MixinName') and Mixin.out(instance, 'MixinName') respectively.

* instance data through a dual-purpose function: 'setter' Mixin.instanceData(instance, 'MixinName', SOMETHING) or 'getter' Mixin.instanceData(instance, 'MixinName'). This keeps your mixin instance data in its own 'namespace' both protecting independent mixins from naming collisions but also keeps your instance data away from the root of the object prototype isolating the implementation details of your mixin.

* dynamic mixins where you can call Mixin.in then Mixin.out and then Mixin.in again as many times as you like! Use Mixin.hasMixin(instance, 'MixinName') to check if an instance has a specific Mixin.

* easy cleanup of mixin (if required). Unmix a specific mixin or all the mixins using Mixin.out(instance, 'MixinName') or Mixin.out(instance) respectively.

* Property clobbering checking. Before mixing in, a check is performed on existing properties to make sure they don't already exist (unless you use the 'force' option in which clobbering checks are ignored).

In the most basic scenario (eg. when you don't have per-instance data that needs to be linked to an object lifecycle), Mixin reduces to a solution similar to the 'Object.extend' paradigm although it is definitely overkill in those simple situations because you first need to register the mixin and you also need to mix it into each instance of your class so you can call hasMixin(). If there is a need for class-level mixins, it can be added to Mixin.js (just let me know!), but of course, there are already more simple solutions built into the language for that like 'Object.extend'!


# An Example:

````
  # define a new mixin for a superstar with fans
  Mixin.registerMixin({
    mixin_name: 'Superstar'

    initialize: ->
      # create instance data with an array of fans
      Mixin.instanceData(this, 'Superstar', {fans: []})

    mixin_object: {
      addFan: (fan) ->
        # get the instance data, and add the fan to the fans array
        Mixin.instanceData(this, 'Superstar').fans.push(fan)
        return this # allow chaining

      getFans: ->
        return Mixin.instanceData(this, 'Superstar').fans
    }
  })

  # make rockstar1 a superstar
  class Rockstar
  rockstar1 = new Rockstar()
  Mixin.in(rockstar1, 'Superstar')

  # create new fans of rockstar1
  class Fan
  fan1 = new Fan(); fan2 = new Fan()
  rockstar1.addFan(fan1).addFan(fan2)

  # fan1 now becomes a superstar and rockstar1 loses his status
  Mixin.in(fan1, 'Superstar'); Mixin.out(rockstar1, 'Superstar')

  # now everyone becomes a fan of fan1 (even rockstar1!)
  fan1.addFan(fan2).addFan(rockstar1)

  # cleanup after the new 'Superstar' (he doesn't do anything for himself anymore)
  Mixin.out(fan1)
````
* Note: this example demonstrates the API, but isn't indicative of the value of Mixin.js. Checkout the Subscriptions or Timeouts mixin for a more valuable usage.

You can find more examples on my blog: http://braincode.tumblr.com/ or in a repository I set up specifically for examples: https://github.com/kmalakoff/examples-kmalakoff

Please look at the provided tests for sample code (Documentation is light at the moment!):
  - https://github.com/kmalakoff/mixin/blob/master/test

# Mixins bundled with Mixin.js
The library is composed of the following mixins:

## AutoMemory
Provides ways to clean up your objects when they are destroyed (for example, breaking DOM reference cycles, calling cleanup methods, etc).

## Flags
Provides ways to manage flags and to get a callback when they change.

## RefCount
Provides ways some basic reference counting and to get a callback when your instance is released.

## Subscriptions
Provides a way to publish subscriptions (publishSubscription) and notify subscribers when they change. You can mixin: Observable, Subscriber or ObservableSubscriber.
      -> this give a more advanced example of what is possible.

## Timeouts
Provides named timeout management and automatically cleaning them up when an instance is destroyed.


Building, Running and Testing the library
-----------------------

###Installing:

1. install node.js: http://nodejs.org
2. install node packages: (sudo) 'npm install'

###Commands:

Look at: https://github.com/kmalakoff/easy-bake