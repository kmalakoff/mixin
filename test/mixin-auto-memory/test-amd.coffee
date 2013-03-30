try
  require.config({
    paths:
      'underscore': "../../vendor/underscore-1.4.4",
      'mixin-js-core': "../../mixin-js-core",
      'mixin-js-auto-memory': "../../lib/mixin-js-auto-memory"
  })

  # library and dependencies
  require ['underscore', 'mixin-js-core', 'mixin-js-auto-memory', 'qunit_test_runner'], (_, mx, _mx, runner) ->
    window._ = window.Mixin = null # force each test to require dependencies synchronously
    require ['./build/test'], -> runner.start()