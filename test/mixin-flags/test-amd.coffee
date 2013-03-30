try
  require.config({
    paths:
      'mixin-js-core': "../../mixin-js-core",
      'mixin-js-flags': "../../lib/mixin-js-flags"
  })

  # library and dependencies
  require ['mixin-js-core', 'mixin-js-flags', 'qunit_test_runner'], (mx, _mx, runner) ->
    window.Mixin = null # force each test to require dependencies synchronously
    require ['./build/test'], -> runner.start()