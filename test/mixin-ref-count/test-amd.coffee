try
  require.config({
    paths:
      'mixin-js-core': "../../mixin-js-core",
      'mixin-js-ref-count': "../../lib/mixin-js-ref-count"
  })

  # library and dependencies
  require ['mixin-js-core', 'mixin-js-ref-count', 'qunit_test_runner'], (mx, _mx, runner) ->
    window.Mixin = null # force each test to require dependencies synchronously
    runner.start(); require ['./build/test'], ->