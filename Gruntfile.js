module.exports = function(grunt) {

  grunt.initConfig({
    // Project configuration.
    pkg: grunt.file.readJSON('package.json'),

    // Compiles our Sass
    sass: {
      options: {
        precision: 6,
        sourceComments: false,
        outputStyle: 'compressed',
        includePaths: [
          "node_modules"
        ]
      },
      dist: {
        files: {
          'docs/docs.css': 'index.scss'
        }
      }
    },

    // Handle vendor prefixing
    postcss: {
      options: {
        processors: [
          require('autoprefixer-core')({ browsers: ['> 5%'] })
        ]
      },
      docs: {
        src: 'docs/docs.css'
      }
    },

    jekyll: {
      options: {
        src: 'docs',
        dest: '_site',
        config: '_config.yml',
        raw: "version: <%= pkg.version %>",
        serve: true
      },
      dist: {
        options: {
          serve: false
        }
      }
    },

    buildcontrol: {
      options: {
        dir: '_site',
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'git@github.com:primer/primer.git',
          branch: 'gh-pages'
        }
      }
    },

    copy: {
      main: {
        files: [
          // includes files within path
          {
            expand: true,
            flatten: true,
            src: [
              'node_modules/octicons/octicons/octicons.eot',
              'node_modules/octicons/octicons/octicons.svg',
              'node_modules/octicons/octicons/octicons.ttf',
              'node_modules/octicons/octicons/octicons.woff'
            ],
            dest: 'docs/fonts/',
            filter: 'isFile'
          }
        ],
      },
    }
  });

  // Load dependencies
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-build-control');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Generate and format the CSS
  grunt.registerTask('default', ['sass', 'postcss', 'copy', 'jekyll:dist']);

  grunt.registerTask('serve', ['sass', 'postcss', 'copy', 'jekyll']);

  // Publish to GitHub
  grunt.registerTask('publish', ['default', 'buildcontrol:pages']);
};
