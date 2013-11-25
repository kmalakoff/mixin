try
  require.config({
    paths:
      'underscore': "../../vendor/underscore-1.5.2",
      'mixin-js': "../../mixin-js"
  })

  # library and dependencies
  require ['underscore', 'mixin-js', 'qunit_test_runner'], (_, mx, runner) ->
    window._ = window.Mixin = null # force each test to require dependencies synchronously
    require ['./build/test'], -> runner.start()