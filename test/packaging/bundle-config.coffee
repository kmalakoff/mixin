module.exports =
  'test/packaging/build/bundle-bundled.js':
    underscore: 'vendor/underscore-latest.js'
    'mixin-js': 'mixin-js.js'
  'test/packaging/build/bundle-unbundled.js':
    underscore: 'vendor/underscore-latest.js'
    'mixin-js-core': 'mixin-js-core.js'
    'mixin-js-auto-memory': 'lib/mixin-js-auto-memory.js'
    'mixin-js-flags': 'lib/mixin-js-flags.js'
    'mixin-js-ref-count': 'lib/mixin-js-ref-count.js'
    'mixin-js-subscriptions': 'lib/mixin-js-subscriptions.js'
    'mixin-js-timeouts': 'lib/mixin-js-timeouts.js'