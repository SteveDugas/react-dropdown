var gulp = require('gulp'),
    gutil = require('gulp-util'),
    react = require('gulp-react'),
    coffee = require('gulp-coffee'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'scripts');
});

gulp.task('watch', function() {
  // Listen on port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err)
    };
    // Watch .scss files
    gulp.watch('src/styles/*.scss', ['styles']);
    // Watch .js files
    gulp.watch('src/scripts/*.js*', ['scripts']);
  });
});

gulp.task('styles', function() {
  return gulp.src('src/styles/*.scss')
    .pipe(sass({ style: 'expanded' }))
    //.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('app/styles'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('app/styles'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
})

gulp.task('scripts', function() {
  return gulp.src('src/scripts/*.js*')
    .pipe(react())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('dropdown.js'))
    .pipe(gulp.dest('app/scripts'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('app/scripts'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('clean', function() {
  return gulp.src(['app/styles', 'app/scripts'], {read: false})
    .pipe(clean());
});