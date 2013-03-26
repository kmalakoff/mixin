module.exports =
  library:
    join: 'mixin-js.js'
    wrapper: 'src/module-loader.js'
    compress: true
    files: [
      'src/mixin-core.coffee'
      'src/mixin-core-statistics.coffee'
      'src/lib/**.*coffee'
    ]
    _build:
      commands: [
        'cp mixin-js.js packages/npm/mixin-js.js'
        'cp mixin-js.min.js packages/npm/mixin-js.min.js'
        'cp README.md packages/npm/README.md'
        'cp mixin-js.js packages/nuget/Content/Scripts/mixin-js.js'
        'cp mixin-js.min.js packages/nuget/Content/Scripts/mixin-js.min.js'
      ]

  library_core:
    join: 'mixin-js-core.js'
    wrapper: 'src/module-loader.js'
    compress: true
    files: [
      'src/mixin-core.coffee'
      'src/mixin-core-statistics.coffee'
    ]
    _build:
      commands: [
        'cp mixin-js-core.js packages/npm/mixin-js-core.js'
        'cp mixin-js-core.min.js packages/npm/mixin-js-core.min.js'
        'cp mixin-js-core.js packages/nuget/Content/Scripts/mixin-js-core.js'
        'cp mixin-js-core.min.js packages/nuget/Content/Scripts/mixin-js-core.min.js'
      ]

  mixin_js_auto_memory:
    join: 'mixin-js-auto-memory.js'
    wrapper: 'src/lib/module-loader-auto-memory.js'
    output: 'lib'
    compress: true
    files: [
      'src/lib/component-imports.coffee'
      'src/lib/mixin-js-auto-memory.coffee'
    ]

  mixin_js_flags:
    join: 'mixin-js-flags.js'
    wrapper: 'src/lib/module-loader-flags.js'
    output: 'lib'
    compress: true
    files: [
      'src/lib/component-imports.coffee'
      'src/lib/mixin-js-flags.coffee'
    ]

  mixin_js_ref_count:
    join: 'mixin-js-ref-count.js'
    wrapper: 'src/lib/module-loader-ref-count.js'
    output: 'lib'
    compress: true
    files: [
      'src/lib/component-imports.coffee'
      'src/lib/mixin-js-ref-count.coffee'
    ]

  mixin_js_subscriptions:
    join: 'mixin-js-subscriptions.js'
    wrapper: 'src/lib/module-loader-subscriptions.js'
    output: 'lib'
    compress: true
    files: [
      'src/lib/component-imports.coffee'
      'src/lib/mixin-js-subscriptions.coffee'
    ]

  mixin_js_timeouts:
    join: 'mixin-js-timeouts.js'
    wrapper: 'src/lib/module-loader-timeouts.js'
    output: 'lib'
    compress: true
    files: [
      'src/lib/component-imports.coffee'
      'src/lib/mixin-js-timeouts.coffee'
    ]

  lib:
    commands: [

      # publish to npm and NuGet
      'cp -r lib packages/npm/lib'
      'cp -r lib packages/nuget/Content/Scripts/lib'
    ]

  tests:
    _build:
      output: 'build'
      directories: [
        'test/core'
        'test/integration-auto-unmix'
        'test/mixin-auto-memory'
        'test/mixin-flags'
        'test/mixin-ref-count'
        'test/mixin-subscriptions'
        'test/mixin-timeouts'
      ]
      commands: [
        'mbundle test/packaging/bundle-config.coffee'
        'mbundle test/lodash/bundle-config.coffee'
      ]
    _test:
      command: 'phantomjs'
      runner: 'phantomjs-qunit-runner.js'
      files: '**/*.html'
      directories: [
        'test/core'
        'test/integration-auto-unmix'
        'test/mixin-auto-memory'
        'test/mixin-flags'
        'test/mixin-ref-count'
        'test/mixin-subscriptions'
        'test/mixin-timeouts'
        'test/packaging'
        'test/lodash'
      ]

  _postinstall:
    commands: [
      'cp -v underscore vendor/underscore.js'
      'cp -v lodash vendor/optional/lodash.js'
    ]