'use strict';

var generators = require('yeoman-generator'),
  yosay = require('yosay'),
  chalk = require('chalk'),
  wiredep = require('wiredep'),
  mkdirp = require('mkdirp'),
  _ = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Yo, sup?'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'Yo, what you need?',
      choices: [{
        name: 'Html5shiv',
        value: 'includeShiv',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }, {
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: false
      }]
    }, {
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Yo, you need jQuery?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBootstrap') === -1;
      }
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      this.includeShiv = hasFeature('includeShiv');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeJQuery = answers.includeJQuery;

      done();
    }.bind(this));
  },

  writing: {
    gulp: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          includeBootstrap: this.includeBootstrap
        }
      );
    },

    package: function () {
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'));
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeBootstrap) {
        bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
        bowerJson.overrides = {
          'bootstrap-sass': {
            'main': [
              'assets/fonts/bootstrap/*',
              'assets/stylesheets/_bootstrap.scss',
              'assets/javascripts/bootstrap.js'
            ]
          }
        };
      } else if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.1';
      }

      if (this.includeShiv) {
        bowerJson.dependencies['html5shiv'] = '~3.7.3';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    config: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    sass: function () {
      this.fs.copyTpl(
        this.templatePath('sass/main.sass'),
        this.destinationPath('app/sass/main.sass'),
        {
          includeBootstrap: this.includeBootstrap
        }
      );
    },

    js: function () {
      this.fs.copy(
        this.templatePath('js/main.js'),
        this.destinationPath('app/js/main.js')
      );
    },

    jade: function () {
      var bsPath;

      if (this.includeBootstrap) {
        bsPath = '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';
      }

      this.fs.copy(
        this.templatePath('views/index.jade'),
        this.destinationPath('app/views/index.jade')
      );

      this.fs.copyTpl(
        this.templatePath('views/default.jade'),
        this.destinationPath('app/views/layouts/_default.jade'),
        {
          appname: this.appname,
          includeShiv: this.includeShiv,
          includeModernizr: this.includeModernizr,
          includeBootstrap: this.includeBootstrap,
          bsPath: bsPath,
          bsPlugins: [
            'affix',
            'alert',
            'dropdown',
            'tooltip',
            'modal',
            'transition',
            'button',
            'popover',
            'carousel',
            'scrollspy',
            'collapse',
            'tab'
          ]
        }
      );
    },

    misc: function () {
      mkdirp('app/images');
      mkdirp('app/fonts');
    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howTo =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howTo);
      return;
    }

    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      exclude: ['bootstrap-sass', 'bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/views/layouts/*.jade'
    });

    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      ignorePath: /^(\.\.\/)+/,
      src: 'app/styles/*.sass'
    });
  }
});
