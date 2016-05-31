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
      dist: {
        src: 'build/*.css'
      },
      docs: {
        src: '_site/*.css'
      }
    },

    jekyll: {
      options: {
        src: 'docs',
        dest: '_site',
        config: '_config.yml',
        raw: "version: <%= pkg.version %>"
      },
      dist: {
        serve: false
      },
      serve: {
        serve: true
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
    }
  });

  // Load dependencies
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-build-control');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-sass');

  // Generate and format the CSS
  grunt.registerTask('default', ['sass', 'jekyll:dist', 'postcss']);

  // Publish to GitHub
  grunt.registerTask('publish', ['jekyll:dist', 'postcss:docs', 'buildcontrol:pages']);
};
