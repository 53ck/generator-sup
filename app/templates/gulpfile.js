// generated on <%= date %> using <%= name %> <%= version %>
var browserSync = require('browser-sync'),
  modRewrite = require('connect-modrewrite'),
  gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  cached = require('gulp-cached'),
  changed = require('gulp-changed'),
  clean = require('gulp-clean'),
  csso = require('gulp-csso'),
  gif = require('gulp-if'),
  imagemin = require('gulp-imagemin'),
  plumber = require('gulp-plumber'),
  jade = require('gulp-jade'),
  inheritance = require('gulp-jade-inheritance'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  uncss = require('gulp-uncss'),
  useref = require('gulp-useref'),
  mainBowerFiles = require('main-bower-files'),
  runSequence = require('run-sequence')
  wiredep = require('wiredep').stream,
  reload = browserSync.reload;

var rewriteRules = [
  '^/$ - [L]',
  '.html$ - [L]',
  '(.*)/$ $1/index.html [L]',
  '\\/\[a-zA-Z0-9_\\-\@.]+\\.\[a-zA-Z0-9]+$ - [L]',
  '(.*)$ $1.html [L]'
];

// sass
gulp.task('sass', function() {
  return gulp.src('app/sass/**/*.sass')
    .pipe(sass())
    .pipe(gulp.dest('dist/assets/css'));
});

gulp.task('sass:watch', function() {
  return gulp.src('app/sass/**/*.sass')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(changed('dist/assets/css', {extension: '.css'}))
    .pipe(sass.sync({
      precision: 10,
      includePaths: ['.'],
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: [
        'last 15 versions', '> 1%', 'ie 8', 'ie 9', 'Firefox ESR'
      ]
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(reload({stream: true}));
});

gulp.task('sass:build', function() {
  return gulp.src('app/sass/**/*.sass')
    .pipe(sass.sync({
      precision: 10,
      includePaths: ['.'],
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: [
        'last 15 versions', '> 1%', 'ie 8', 'ie 9', 'Firefox ESR'
      ]
    }))
    .pipe(gulp.dest('dist/assets/css'));
});

gulp.task('uncss', function() {
  return gulp.src('dist/assets/css/**/*.css')
    .pipe(uncss({html: ['dist/**/*.html']}))
    .pipe(csso())
    .pipe(gulp.dest('dist/assets/css'));
});

// js
gulp.task('js', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('js:watch', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(changed('dist/assets/js', {extension: '.js'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(reload({stream: true}));
});

gulp.task('js:build', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'));
});

// jade
gulp.task('jade', function() {
  return gulp.src('app/views/**/[^_]*.jade')
    .pipe(jade())
    .pipe(gulp.dest('dist/'));
});

gulp.task('jade:watch', function() {
  return gulp.src('app/views/**/[^_]*.jade')
    .pipe(plumber())
    .pipe(cached('jade:watch'))
    .pipe(inheritance({basedir: 'app/views'}))
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('dist/'))
    .pipe(reload({stream: true}));
});

gulp.task('jade:backup', function() {
  return gulp.src('app/views/layouts/*.jade')
    .pipe(gulp.dest('app/views/tmp'));
});

gulp.task('useref', function() {
  return gulp.src('app/views/layouts/*.jade')
    .pipe(useref({searchPath: ['dist']}))
    .pipe(gif('*.css', csso()))
    .pipe(gif('*.js', uglify()))
    .pipe(gulp.dest('dist/'));
});

gulp.task('jade:move', function() {
  return gulp.src('dist/*.jade')
    .pipe(gulp.dest('app/views/layouts'));
});

gulp.task('jade:replace', function() {
  return gulp.src('app/views/tmp/*.jade')
    .pipe(gulp.dest('app/views/layouts'));
});

gulp.task('jade:clean', function() {
  return gulp.src(['dist/*jade', 'app/views/tmp'], {read: false})
    .pipe(clean());
});

gulp.task('jade:build', function() {
  runSequence(
    ['jade:backup', 'sass:build'],
    'useref',
    'jade:move',
    'jade',
    'jade:replace',
    'jade:clean'
  );
});

// serve
gulp.task('serve', ['sass', 'js', 'jade'], function() {
  browserSync({
    notify: false,
    server: {
      baseDir: ['app', 'dist'],
      routes: {
        '/bower_components': 'bower_components'
      }
    },
    middleware: [
      modRewrite(rewriteRules)
    ]
  });

  gulp.watch('app/sass/**/*.sass', ['sass:watch']);
  gulp.watch('app/views/**/*.jade', ['jade:watch']);
  gulp.watch('app/js/**/*.js', ['js:watch']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
  gulp.watch(['app/images/**/*', 'dist/fonts/**/*']).on('change', reload);
});

// other
gulp.task('wiredep', function() {
  gulp.src('app/sass/*.sass')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('dist/assets/css'));

  gulp.src('app/views/layouts/*.jade')
    .pipe(wiredep({<% if (includeBootstrap) { %>
      exclude: ['bootstrap-sass'],<% } %>
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app/views/layouts'));
});

gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe(cached(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('fonts', function() {
  return gulp.src(mainBowerFiles('**/*.{eot,svg,ttf,woff,woff2}')
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task('copy', function() {
  return gulp.src([
    'app/*.*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/'));
});

gulp.task('clean', function() {
  return gulp.src('dist/', {read: false})
    .pipe(clean());
});

// build
gulp.task('build', ['clean'], function() {
  runSequence(
    ['jade:build', 'js:build'],
    'uncss',
    ['images', 'fonts', 'copy']
  );
});

gulp.task('default', ['serve']);