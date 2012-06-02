{print} = require 'util'
{spawn} = require 'child_process'
fs = require 'fs'
path = require 'path'
yaml = require 'js-yaml'
wrench = require 'wrench'
_ = require 'underscore'
globber = require 'glob-whatev'

TEST_DEFAULT_TIMEOUT = 60000

class Utils
  @extractSetOptions: (set, mode, defaults) ->
    set_options = _.clone(set)
    if set.options
      _.extend(set_options, set.options['global']) if set.options['global']
      _.extend(set_options, set.options[mode]) if set.options[mode]
      delete set_options['options']
    _.defaults(set_options, defaults) if defaults
    return set_options

  @setOptionsFileGroups: (set_options, YAML_dir) ->
    file_groups = []

    directories = if set_options.hasOwnProperty('directories') then set_options.directories else ['.']
    files = if set_options.hasOwnProperty('files') then set_options.files else ['**/*']
    no_files_ok = if set_options.hasOwnProperty('no_files_ok') then set_options.no_files_ok

    # build the list of files per directory if there are any matching files
    for directory in directories
      if not path.existsSync(directory)
        console.log("warning: directory is missing #{directory}")
        continue
      directory = fs.realpathSync(directory) # resolve the real path

      pathed_files = []
      _.each(files, (rel_file) ->
        count = pathed_files.length
        globber.glob("#{directory}/#{rel_file}").forEach((pathed_file) -> pathed_files.push(pathed_file))
        if count == pathed_files.length
          rel_directory = directory.replace("#{YAML_dir}/", '')
          console.log("warning: files not found #{directory}/#{rel_file}") if not no_files_ok or not _.contains(no_files_ok, rel_directory)
      )
      continue if not pathed_files.length
      file_groups.push(directory: directory, files:pathed_files)

    return file_groups

  @afterWithCollect: (count, callback) ->
    return (code) ->
      result = code if _.isUndefined(result)
      result != code
      return result if --count>0
      result |= callback(result)
      return result

class EasyBake
  constructor: (YAML, tasks) ->
    @YAML_dir = path.dirname(fs.realpathSync(YAML))
    @YAML = yaml.load(fs.readFileSync(YAML, 'utf8'))

    ##############################
    # COMMANDS
    ##############################
    option '-c', '--clean', 'clean the project'
    option '-w', '--watch', 'watch for changes'
    option '-s', '--silent', 'silence the console output'
    option '-p', '--preview', 'preview the action'

    task('clean', 'Remove generated JavaScript files', (options) => @clean(options)) if not tasks or _.contains(tasks, 'clean')
    task 'build', 'Build library and tests', (options) => @build(options)  if not tasks or _.contains(tasks, 'build')
    task 'watch', 'Watch library and tests', (options) => @watch(options) if not tasks or _.contains(tasks, 'watch')
    task 'test', 'Test library', (options) => @test(options) if not tasks or _.contains(tasks, 'test')

  timeLog: (message) -> console.log("#{(new Date).toLocaleTimeString()} - #{message}")
  resolveDirectory: (directory, current_root) ->
    if (directory[0]=='.')
      stripped_directory = if(directory[1]=='/') then directory.substr(2) else directory.substr(1)
      return "#{current_root}/#{stripped_directory}"
    else if (directory[0]=='/')
      return directory
    else
      return "#{@YAML_dir}/#{directory}"
  minifiedName: (src) -> return src.replace(/\.js$/, ".min.js")

  runClean: (array, directory, options) =>
    for item in array
      continue unless path.existsSync(item)

      @timeLog("cleaned #{item}")
      if directory then wrench.rmdirSyncRecursive(item) else fs.unlink(item) unless options.preview

  clean: (options={}) ->
    directories_to_delete = []
    files_to_delete = []

    # collect files and directories to clean
    for set_name, set of @YAML
      # extract test settings
      set_options = Utils.extractSetOptions(set, 'build', {
        directories: [@YAML_dir]
      })
      _.extend(set_options, set.options.clean) if set.options and set.options.clean

      for directory in set_options.directories
        if set_options.output
          if set_options.output[0]=='.'
            resolved_path = then @resolveDirectory(set_options.output, directory)
          else
            continue unless path.existsSync(set_options.output) # doesn't exist so skip
            resolved_path = fs.realpathSync(set_options.output)
          directories_to_delete.push(resolved_path)
        else
          resolved_path = @YAML_dir
        if set_options.join
          files_to_delete.push("#{resolved_path}/#{set_options.join}")
          files_to_delete.push("#{resolved_path}/#{@minifiedName(set_options.join)}") if set_options.minimize

    # execute or preview
    console.log('************clean preview*************') if options.preview
    @runClean(directories_to_delete, true, options)
    @runClean(files_to_delete, false, options)
    options.callback?(0)

  minify: (src, options={}, code) ->
    result = code
    spawned = spawn "#{__dirname}/node_modules/.bin/uglifyjs", ['-o', @minifiedName(src), src]
    spawned.on 'exit', (code) =>
      result |= code
      @timeLog("minified #{src.replace("#{@YAML_dir}/", '')}") unless options.silent
      options.callback?(result)

  runCoffee: (args, options={}) ->
    output_directory = if ((index = _.indexOf(args, '-o')) >= 0) then "#{args[index+1]}" else ''
    if ((index = _.indexOf(args, '-j')) >= 0)
      source_name = args[index+1]
    else
      filenames = args.slice(_.indexOf(args, '-c')+1)

    spawned = spawn "#{__dirname}/node_modules/.bin/coffee", args
    spawned.stderr.on 'data', (data) ->
      process.stderr.write data.toString()

    notify = (code) =>
      if filenames
        original_callback = options.callback; options = _.clone(options); options.callback = null
        options.callback = Utils.afterWithCollect(filenames.length, (result) =>
          result |= original_callback(result) if original_callback
          return result
        )
        for source_name in filenames
          output_directory = @resolveDirectory(output_directory, path.dirname(source_name))
          output_name = "#{output_directory}/#{path.basename(source_name).replace(/\.coffee$/, ".js")}"
          @timeLog("built #{output_name.replace("#{@YAML_dir}/", '')}") unless options.silent
          @minify(output_name, options, code) if options.minimize
        original_callback?(code) unless options.minimize
      else
        output_directory = @resolveDirectory(output_directory, path.dirname(source_name))
        output_name = "#{output_directory}/#{path.basename(source_name).replace(/\.coffee$/, ".js")}"
        @timeLog("built #{output_name.replace("#{@YAML_dir}/", '')}") unless options.silent
        if options.minimize then @minify(output_name, options, code) else options.callback?(code)

    # watch vs build callbacks are slightly different
    if options.watch then spawned.stdout.on('data', (data) -> notify(0)) else spawned.on('exit', (code) -> notify(code))

  build: (options={}) ->
    coffee_commands_to_run = []

    # collect files to build
    for set_name, set of @YAML
      # extract test settings
      set_options = Utils.extractSetOptions(set, 'build', {
        directories: ['.']
        files: ['**/*.coffee']
      })

      file_groups = Utils.setOptionsFileGroups(set_options, @YAML_dir)
      for file_group in file_groups
        args = []
        args.push('-w') if options.watch
        args.push('-b') if set_options.bare
        args.push(['-j', set_options.join]) if set_options.join
        if set_options.output
          args.push(['-o', @resolveDirectory(set_options.output, file_group.directory)])
        else
          args.push(['-o', @YAML_dir])
        args.push(['-c', file_group.files])
        coffee_commands_to_run.push({args: _.flatten(args), minimize: set_options.minimize})

    # execute or preview callback
    original_callback = options.callback; options = _.clone(options); options.callback = null
    run_build_fn = (code) =>
      if options.preview
        console.log('************build preview*************')
        for coffee_command in coffee_commands_to_run
          console.log("coffee #{coffee_command.args.join(' ')}#{if coffee_command.minimize then ' ***minimized***' else ''}")
        original_callback?(0)

      else
        options.callback = Utils.afterWithCollect(coffee_commands_to_run.length, (result) =>
          result |= original_callback(result) if original_callback
          return result
        )
        for coffee_command in coffee_commands_to_run
          @runCoffee(coffee_command.args, _.extend(_.clone(options), {minimize: coffee_command.minimize}))

    # start the execution chain
    if options.clean
      @clean(_.extend(_.clone(options), {callback: run_build_fn}))
    else
      run_build_fn(0)

  watch: (options={}) ->
    @build(_.extend(options, {watch: true}))

  runTest: (args, options={}) ->
    spawned = spawn 'phantomjs', args
    spawned.stdout.on 'data', (data) ->
      process.stderr.write data.toString()
    spawned.on 'exit', (code) =>
      test_filename = args[1].replace("file://#{@YAML_dir}/", '')
      if code is 0
        @timeLog("tests passed #{test_filename}") unless options.silent
      else
        @timeLog("tests failed #{test_filename}")
      code != options.callback?(code)
      return code

  test: (options={}) ->
    tests_to_run = []

    # collect tests to run
    for set_name, set of @YAML
      continue unless set.options and set.options.test

      # extract test settings
      set_options = Utils.extractSetOptions(set, 'test', {
        timeout: TEST_DEFAULT_TIMEOUT
        directories: ['.']
        files: ['**/*.html']
      })
      set_options.runner = "#{__dirname}/lib/#{set_options.runner}" unless path.existsSync(set_options.runner)

      file_groups = Utils.setOptionsFileGroups(set_options, @YAML_dir)
      for file_group in file_groups
        for file in file_group.files
          tests_to_run.push({args: [set_options.runner, "file://#{fs.realpathSync(file)}", set_options.timeout]})

    # execute or preview callback
    original_callback = options.callback; options = _.clone(options); options.callback = null
    run_tests_fn = =>
      if options.preview
        console.log('************test preview**************')
        for test_to_run in tests_to_run
          console.log("phantomjs #{test_to_run.args.join(' ')}")
        original_callback?(0)

      else
        @timeLog("************tests started*************")
        options.callback = Utils.afterWithCollect(tests_to_run.length, (result) =>
          if result then @timeLog("************tests failed**************") else @timeLog("************tests succeeded***********")
          result |= original_callback(result) if original_callback
          process.exit(result) unless options.watch
          return result
        )

        for test_to_run in tests_to_run
          @runTest(test_to_run.args, options)

    # start the execution chain
    @build(_.extend(_.clone(options), {callback: run_tests_fn, clean: options.clean}))

module.exports = (YAML, tasks) -> new EasyBake(YAML, tasks)