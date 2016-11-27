'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({camelize:true});
// Document Sass
var sassdoc = require('sassdoc');
var browserSync = require('browser-sync');

// Concats your JS files
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');


var config = require('./config.json');
var normalize = require('node-normalize-scss').includePaths;
var path = {
	'src': 'lib/',
	'dest': 'src/',
	'docs': 'docs/'
}

function handleErrors() {
	var args = Array.prototype.slice.call(arguments);

	plugins.notify.onError({
		title: "Compile Error",
		message: "<%= error %>"
	}).apply(this.args);
	// Keep gulp from hanging on this task
  this.emit('end');
}

gulp.task('sass', function() {
	return gulp.src(path.src + 'scss/**/*.scss')
		.pipe(sassdoc({
			dest: path.docs
		}))
		.pipe(plugins.sass({
			includePaths: [normalize],
			outputStyle: 'expanded'
		}))
		// .on('error', handleErrors)
		.pipe(plugins.autoprefixer({browsers: ['last 2 versions']}))
		.pipe(plugins.concat('main.scss.liquid'))
		.pipe(gulp.dest(path.dest + 'assets'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('browserify', function() {
  return browserify(path.src + 'js/app.js')
      .bundle()
      .on('error', handleErrors)
      //Pass desired output filename to vinyl-source-stream
      .pipe(source('bundle.js.liquid'))
      // Start piping stream to tasks!
      .pipe(gulp.dest(path.dest + 'assets/'));
});

gulp.task('images', function() {
  return gulp.src(path.src + 'images/**')
    .pipe(plugins.changed(path.dest + 'assets/')) // Ignore unchanged files
    .pipe(plugins.imagemin()) // Optimize
    .pipe(gulp.dest(path.dest + 'assets/'))
});

gulp.task('browserSync', function() {
	return browserSync({
		server: {
			baseDir: path.docs
		}
	})
});

gulp.task('watch', function() {
	// Watch Sass Files
	gulp.watch(path.src + 'scss/**/*.scss', ['sass']);
	gulp.watch(path.src + 'js/**/*.js', ['browserify']);
	gulp.watch(path.src + 'images/*.{jpg,jpeg,png,gif,svg}', ['images']);

	var watcher = watchify(browserify({
    // Specify the entry point of your app
    entries: [path.src + 'js/app.js'],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  return watcher.on('update', function() {
    watcher.bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(path.dest + 'assets/'))
  });

});

gulp.task('shopifyWatch', function() {
	var options = {
		'basePath': './src/'
	};
	return plugins.watch(options.basePath + '(assets|layout|config|snippets|templates|locales)/**')
	.pipe(plugins.shopifyUpload(config.shopify_api_key, config.shopify_password, config.shopify_url, config.shopify_theme_id, options))
});

gulp.task('default', [
	'browserify',
	'sass',
	'browserSync',
	'shopifyWatch',
  'watch'
]);
