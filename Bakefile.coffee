module.exports =
  library:
    join: 'mixin-js.js'
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
        'cp mixin-js.js packages/nuget/Content/Scripts/mixin-js.js'
        'cp mixin-js.min.js packages/nuget/Content/Scripts/mixin-js.min.js'
      ]

  library_core:
    join: 'mixin-js-core.js'
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

  library_individual_mixins:
    output: '../../lib'
    compress: true
    directories: 'src/lib'
    _build:
      commands: [
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
    commands: 'cp underscore vendor/underscore-latest.js'