module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    version: {
      defaults: {
        src: ['src/pocketchange.js']
      }
    },

    concat: {
      dist: {
        src: [
          'src/pocketchange.js',
          'src/util.js',
          'src/events.js',
          'src/request.js',
          'src/reward_view.js',
          'src/achievements.js',
          'src/client.js',
          'src/achievements/*.js'    
        ],
        dest: 'dist/<%= pkg.name %>.dev.js'
      }
    },

    uglify: {
      options: {
        banner: [
          '//  PocketChange JavaScript SDK',
          '//  Copyright 2013, Ian McDaniel, Pocket Change Inc.',
          '//  For all api documentation:',
          '//  http://pocketchange.com/documentation',
          '\n'
        ].join('\n')
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    qunit: {
      files: ['test/**/*.html']
    },

    jshint: {
      files: ['gruntfile.js', 'src/**/*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['version', 'jshint','concat', 'uglify']
    },

    connect: {
      server: {
        options: {
          port: 8888,
          base: '.'
        }
      }
    }

  });

  grunt.event.on('qunit.testDone', function (name, failed, passed) {
    if(passed) return grunt.log.ok(name);
    if(failed) return grunt.log.error(name);
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-version');

  grunt.registerTask('test',    ['jshint', 'qunit']);
  grunt.registerTask('build',   ['version', 'jshint', 'concat', 'uglify', 'qunit']);
  grunt.registerTask('server',  ['version', 'jshint', 'concat', 'uglify', 'connect', 'watch']);
  
  grunt.registerTask('default', 'build');

  // deploy with:
  // ruby deploy.rb dist/pocketchange-js-sdk.js

};