try
  require.config({
    paths:
      'underscore': "../../vendor/underscore-1.5.2",
      'mixin-js-core': "../../mixin-js-core",
      'mixin-js-subscriptions': "../../lib/mixin-js-subscriptions"
  })

  # library and dependencies
  require ['underscore', 'mixin-js-core', 'mixin-js-subscriptions', 'qunit_test_runner'], (_, mx, _mx, runner) ->
    window._ = window.Mixin = null # force each test to require dependencies synchronously
    require ['./build/test'], -> runner.start()