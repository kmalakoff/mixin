{print} = require 'util'
{spawn} = require 'child_process'
fs = require 'fs'
wrench = require 'wrench'

build = (watch) ->
  coffee = spawn 'coffee', (if watch then ['-w'] else []).concat(['-b', '-o', '.', '-c', 'src'])
  coffee.stderr.on 'data', (data) -> process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()

clean = ->
  fs.unlink('easy-bake.js')
  wrench.rmdirSyncRecursive('lib', true)

##############################
# COMMANDS
##############################
task 'clean', 'Remove generated JavaScript files',  -> clean()
task 'build', 'Build library and tests',            -> clean(); build(false) # just build
task 'watch', 'Watch library and tests',            -> clean(); build(true) # build with watch