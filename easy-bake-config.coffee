module.exports =
  library:
    join: 'mixin-js.js'
    compress: true
    files: [
      'src/mixin-core.coffee'
      'src/mixin-core-statistics.coffee'
      'src/lib/**.*coffee'
    ]
    modes:
      build:
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
    modes:
      build:
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
    modes:
      build:
        commands: [
          'cp -r lib packages/npm/lib'
          'cp -r lib packages/nuget/Content/Scripts/lib'
        ]

  tests:
    output: 'build'
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
    modes:
      build:
        bundles:
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
          'test/lodash/build/bundle-lodash.js':
            lodash: 'vendor/lodash-0.3.2.js'
            'mixin-js': 'mixin-js.js'
        no_files_ok: 'test/packaging'
      test:
        command: 'phantomjs'
        runner: 'phantomjs-qunit-runner.js'
        files: '**/*.html'

  postinstall:
    commands: 'cp underscore vendor/underscore-latest.js'