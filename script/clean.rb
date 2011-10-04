# Run me with: 'ruby script/clean.rb'
require 'rubygems'
require 'fileutils'

PROJECT_ROOT = File.expand_path('../..', __FILE__)
CLEAN_PATTERNS = [
  # Library
  '**.js',
  'build/**.js',

  # Tests - Stand Alone Mixins
  'test/mixin_core/build/**.js',
  'test/mixin_auto_memory/build/**.js',
  'test/mixin_backbone_events/build/**.js',
  'test/mixin_backbone_local_collection/build/**.js',
  'test/mixin_flags/build/**.js',
  'test/mixin_ref_count/build/**.js',
  'test/mixin_subscriptions/build/**.js',
  'test/mixin_timeouts/build/**.js',

  # Tests - Integration
  'test/integration_auto_unmix/build/**.js'
]

CLEAN_PATTERNS.each do |pattern|
  full_dir = "#{PROJECT_ROOT}/pattern"
  dir = File.dirname(pattern)

  if(dir && File.exists?(dir))
    file_pattern = File.basename(pattern)
    Dir.entries(dir).each do |filename|
      if (filename != ".") && (filename != "..")
        pathed_file = "#{dir}/#{filename}"
        if(!File.directory?(pathed_file) && File.fnmatch?(file_pattern, filename))
          File.delete(pathed_file)
        end
      end
    end
  end
end
