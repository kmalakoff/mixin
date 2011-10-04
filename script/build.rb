# Run me with: 'ruby script/build.rb'
require 'rubygems'
PROJECT_ROOT = File.expand_path('../..', __FILE__)

# Library
`cd #{PROJECT_ROOT}; coffee -b -o build -c src`
`cd #{PROJECT_ROOT}; jammit -c config/assets.yaml -o .`

# Tests - Stand Alone Mixins
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_core/build -c test/mixin_core`
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_auto_memory/build -c test/mixin_auto_memory`
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_backbone_events/build -c test/mixin_backbone_events`
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_backbone_local_collection/build -c test/mixin_backbone_local_collection`
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_flags/build -c test/mixin_flags`
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_ref_count/build -c test/mixin_ref_count`
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_subscriptions/build -c test/mixin_subscriptions`
`cd #{PROJECT_ROOT}; coffee -b -o test/mixin_timeouts/build -c test/mixin_timeouts`

# Tests - Integration
`cd #{PROJECT_ROOT}; coffee -b -o test/integration_auto_unmix/build -c test/integration_auto_unmix`
