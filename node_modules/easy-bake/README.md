[![Build Status](https://secure.travis-ci.org/kmalakoff/easy-bake.png)](http://travis-ci.org/kmalakoff/easy-bake)

````
                                    ,--.           ,--.
 ,---.  ,--,--. ,---.,--. ,--.,-----.|  |-.  ,--,--.|  |,-. ,---.
| .-. :' ,-.  |(  .-' \  '  / '-----'| .-. '' ,-.  ||     /| .-. :
\   --.\ '-'  |.-'  `) \   '         | `-' |\ '-'  ||  \  \\   --.
 `----' `--`--'`----'.-'  /           `---'  `--`--'`--'`--'`----'
                     `---'
````

EasyBake provides YAML-based Cakefile helpers for common CoffeeScript library packaging functionality

Just include it as a development dependency to your package.json:

```
"devDependencies": {
  "easy-bake": ">=0.1.0"
},
```

Install it:

```
npm install
```

Create a YAML file to specify what needs to be built (for example easy-bake-config.yaml):

```
some_group:
  join: your_library_name.js
  minimize: true
  files:
    - src/knockback_core.coffee
    - src/lib/**.*coffee

some_other_group:
  join: helpers.js
  output: build
  directories:
    - lib/your_helpers1
    - lib/your_helpers2

some_testing_group:
  output: build
  directories:
    - test/some_tests
    - test/some_more_tests
  tests:
    timeout: 60000
    runner: phantomjs-qunit-runner.js
```

Include it in your Cakefile:

```
require('easy-bake')('easy-bake-config.yaml')
```

And that's it! You will have access to the following in your projects:

Commands Supplied by EasyBake
-----------------------

1. 'cake clean' - cleans the project of all compiled files
2. 'cake build' - performs a single build
3. 'cake watch' - automatically scans for and builds the project when changes are detected
3. 'cake test' - cleans, builds, and runs tests. Note: the tests require installing phantomjs: ('brew install phantomjs' or http://phantomjs.org/)

Options:

1. '-c' or '--clean'  - cleans the project before running a new command
2. '-w' or '--watch'  - watches for changes
3. '-s' or '--silent' - does not output messages to the console (unless errors occur)
4. '-p' or '--preview' - preview the action


**Note:** currently the library only has a test-runner for phantomjs-qunit-runner.js and phantomjs-jasmine-runner.js. Feel free to add more and to submit a pull request.


Building the library
-----------------------

###Installing:

1. install node.js: http://nodejs.org
2. install node packages: (sudo) 'npm install'

###Commands:

1. 'cake clean' - cleans the project of all compiled files
2. 'cake build' - performs a single build
3. 'cake watch' - automatically scans for and builds the project when changes are detected