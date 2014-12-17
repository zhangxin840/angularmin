module.exports = function (grunt) {
  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-file-blocks');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-browser-sync');

  var karmaConfig = function (configFile, customOptions) {
    var options = { configFile: configFile, keepalive: true };
    return grunt.util._.extend(options, customOptions);
  };

  // configure the tasks
  grunt.initConfig({
    // distdir: 'D:\\Codes\\addev.com_631007158\\addev.com_631007158\\src\\web',
    distdir: 'dist',
    releasedir: 'D:\\Codes\\addev.com_631007158\\addev.com_631007158\\src\\web',
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n<%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %> ' +
      '\nAuthor: <%= pkg.author %>\n*/\n\n',
    src: {
      js: ['src/**/*.js'],
      css: ['src/**/*.css'],
      less: ['src/**/*.less'],
      jsTpl: ['<%= distdir %>/templates/**/*.js'],
      specs: ['test/**/*.spec.js'],
      scenarios: ['test/**/*.scenario.js'],
      html: ['src/**/*.html', '!*.tpl.html'],
      tpl: ['src/**/*.tpl.html'],
      mocks: ['src/mocks/**/*.json']
    },
    clean: {
      build: ['<%= distdir %>/*'],
      release: [ // not used
        '<%= distdir %>/**/*.css',
        '!<%= distdir %>/**/*.min.css',
        '<%= distdir %>/**/*.js',
        '!<%= distdir %>/**/*.min.js',
        '!<%= distdir %>/**/*.head.min.js'
      ]
    },
    copy: {
      assets: {
        files: [
          {
            expand: true,
            cwd: 'src/common/assets/',
            src: '**',
            dest: '<%= distdir %>'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/**/*.jpg', 'src/**/*.png', 'src/**/*.gif'],
            dest: '<%= distdir %>/img'
          }
        ]
      },
      src: {
        files: [
          {
            dest: '<%= distdir %>/js',
            src: '<%= src.js %>',
            expand: true,
            flatten: true
          },
          {
            dest: '<%= distdir %>/css',
            src: '<%= src.css %>',
            expand: true,
            flatten: true
          },
          {
            dest: '<%= distdir %>/partials',
            src: '<%= src.tpl %>',
            expand: true,
            flatten: true
          }
        ]
      },
      vendor: {
        files: [
          {
            src: ['vendor/**/images/*.*', 'vendor/**/*.png', 'vendor/**/*.jpg', 'vendor/**/*.gif'],
            dest: '<%= distdir %>/css/images',
            expand: true,
            flatten: true
          },
          {
            src: 'vendor/**/fonts/*.*',
            dest: '<%= distdir %>/fonts',
            expand: true,
            flatten: true
          },
          {
            src: 'vendor/**/*.swf',
            dest: '<%= distdir %>/js',
            expand: true,
            flatten: true
          }
        ]
      }
    },
    less: {
      build: {
        options: {
          cleancss: false
        },
        files: [
          {
            dest: '<%= distdir %>/css/',
            src: '<%= src.less %>',
            flatten: true,
            expand: true,
            ext: '.css'
          }
        ]
      }
    },
    autoprefixer: {
      options: {
        diff: false
      },
      css: {
        src: '<%= distdir %>/**/*.css'
      }
    },
    concat: { // not used
      index: {
        src: ['src/app/index.html'],
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      },
      head: {
        files: [
          {
            src: ['vendor/head/**/*.js'],
            dest: '<%= distdir %>/js/head.js'
          }
        ]
      },
      jquery: {
        files: [
          {
            src: ['vendor/jquery/jquery*.js', 'vendor/jquery/**/*.js'],
            dest: '<%= distdir %>/js/jquery.js'
          },
          {
            src: ['vendor/jquery/**/*.css'],
            dest: '<%= distdir %>/css/jquery.css'
          }
        ]
      },
      bootstrap: {
        files: [
          {
            src: ['vendor/bootstrap/bootstrap.js', 'vendor/bootstrap/**/*.js'],
            dest: '<%= distdir %>/js/bootstrap.js'
          },
          {
            src: ['vendor/bootstrap/bootstrap.css', 'vendor/bootstrap/**/*.css'],
            dest: '<%= distdir %>/css/bootstrap.css'
          }
        ]
      },
      plugins: {
        files: [
          {
            src: ['vendor/plugins/**/*.js'],
            dest: '<%= distdir %>/js/plugins.js'
          },
          {
            src: ['vendor/plugins/**/*.css'],
            dest: '<%= distdir %>/css/plugins.css'
          }
        ]
      },
      angular: {
        files: [
          {
            src: ['vendor/angular/angular.js', 'vendor/angular/**/*.js'],
            dest: '<%= distdir %>/js/angular.js'
          },
          {
            src: ['vendor/angular/**/*.css'],
            dest: '<%= distdir %>/css/angular.css'
          }
        ]
      }
    },
    ngmin: {
      release: {
        files: [
          {
            expand: true, // use expand if output to a folder
            src: [
              '<%= distdir %>/js/*.js'
            ],
            // if cwd is null, dest will refer to the same folder with src,
            // if cwd is not null, dest will refer to root folder
            dest: ''
          }
        ]
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap: true
      },
      release: {
        files: [
          {
            src: [
              '<%= distdir %>/js/jquery.js',
              '<%= distdir %>/js/bootstrap.js',
              '<%= distdir %>/js/plugins.js',
              '<%= distdir %>/js/angular.js',
              '<%= distdir %>/js/**/*.js',
              '!<%= distdir %>/js/head.js'
              // '<%= distdir %>/js/**/*.angular.js'
            ],
            dest: '<%= distdir %>/js/<%= pkg.name %>-<%= pkg.version %>.min.js'
          },
          {
            src: [
              '<%= distdir %>/js/head.js',
            ],
            dest: '<%= distdir %>/js/<%= pkg.name %>-<%= pkg.version %>.head.min.js'
          }
        ]
      }
    },
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      release: {
        files: [
          {
            dest: '<%= distdir %>/css/<%= pkg.name %>-<%= pkg.version %>.min.css',
            src: [
              '<%= distdir %>/css/jquery.css',
              '<%= distdir %>/css/bootstrap.css',
              '<%= distdir %>/css/plugins.css',
              '<%= distdir %>/css/angular.css',
              '<%= distdir %>/css/base.css',
              '<%= distdir %>/**/*.css',
              '!<%= distdir %>/**/*.min.css'
            ]
          }
        ]
      }
    },
    imagemin: {
      release: {
        options: {
          optimizationLevel: 0 // For png,
        },
        files: [
          {
            expand: true,
            cwd: '<%= distdir %>/img',
            src: [
              '*.{png,jpg,gif}'
            ],
            dest: '<%= distdir %>/img'
          }
        ]
      }
    },
    filerev: {
      options: {
        algorithm: 'md5',
        length: 8
      },
      release: {
        src: ['<%= distdir %>/**/*.min.{js,css}']
      }
    },
    fileblocks: {
      build: {
        options: {
          rebuild: 'true',
          cwd: '<%= distdir %>'
        },
        src: '<%= distdir %>/index.html',
        blocks: {
          'js': { src: [
            'js/jquery.js',
            'js/bootstrap.js',
            'js/plugins.js',
            'js/angular.js',
            'js/**/*.js'
          ]},
          'head': {src: ['js/head.js']},
          'css': { src: [
            'css/bootstrap.css',
            'css/jquery.css',
            'css/angular.css',
            'css/plugins.css' ,
            'css/angular.css',
            'css/base.css',
            'css/**/*.css']}
        }
      },
      test: {
        options: {
          rebuild: 'true'
        },
        src: 'test/unit/runner.html',
        blocks: {
          'js': { cwd: "test/unit", src: [
            '../../dist/js/jquery.js',
            '../../dist/js/bootstrap.js',
            '../../dist/js/plugins.js',
            '../../dist/js/angular.js',
            '../../dist/js/**/*.js']},
          'head': {cwd: "test/unit", src: ['../../dist/js/head.js']},
          'specs': {cwd: "test/unit", src: ['spec/**/*.spec.js']}
        }
      },
      release: {
        options: {
          rebuild: 'true',
          cwd: '<%= distdir %>'
        },
        src: ['<%= distdir %>/index.html'],
        blocks: {
          'js': { src: ['**/*.min*js', '!**/*.head.min*js']},
          'head': {src: ['**/*.head.min*js']},
          'css': { src: ['**/*.min*css']}
        }
      }
    },
    karma: {
      options: {
        configFile: 'test/unit/config.js'
      },
      unit: { singleRun: true, autoWatch: false},
      watch: { singleRun: false, autoWatch: true}
    },
    watch: {
      files: ['<%= src.js %>', '<%= src.css %>', '<%= src.less %>', '<%= src.html %>'],
      tasks: ['build-src', 'timestamp']
    },
    browserSync: {
      build: {
        bsFiles: {
          src: '<%= distdir %>/css/*.css'
        },
        options: {
          server: {
            baseDir: "<%= distdir %>"
          },
        }
      }
    }
  });

  // Print a timestamp (useful for when watching)
  grunt.registerTask('timestamp', function () {
    grunt.log.subhead(Date());
  });

  // define the tasks
  grunt.registerTask(
    'build',
    'Compiles all of the assets and copies the files to the build directory.',
    [
      'clean:build',
      'concat',
      'copy',
      'less',
      'autoprefixer',
      'fileblocks:build', 'fileblocks:test',
    ]
  );

  // define the tasks
  grunt.registerTask(
    'build-src',
    'Build source code only.',
    [
      'concat:index',
      'copy:src',
      'less',
      'autoprefixer',
      'fileblocks:build', 'fileblocks:test',
    ]
  );

  // define the tasks
  grunt.registerTask(
    'test',
    'Run unit test and E2E test.',
    [
      'karma:unit'
    ]
  );

  // define the tasks
  grunt.registerTask(
    'release',
    'Minimize resources usage and copy to release directory.',
    [
      'build',
      'test',
      'ngmin',
      'uglify',
      'cssmin',
      // 'imagemin',
      // 'clean:release',
      'filerev',
      'fileblocks:release'
    ]
  );

  grunt.registerTask(
    'default',
    'Watches the project for changes, automatically builds them and runs a server.',
    [ 'build', 'browserSync', 'watch' ]
  );
};