'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({camelize:true});


var config = require('./config.json');
var normalize = require('node-normalize-scss').includePaths;
var path = {
	'src': './lib/',
	'dest': './src/'
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
		.pipe(plugins.sass({
			includePaths: [normalize],
			outputStyle: 'expanded'
		}))
		.on('error', handleErrors)
		.pipe(plugins.autoprefixer({browsers: ['last 2 versions']}))
		.pipe(plugins.concat('main.scss.liquid'))
		.pipe(gulp.dest(path.dest + 'assets'))
});


gulp.task('watch', function() {
	// Watch Sass Files
	gulp.watch(path.src + 'scss/**/*.scss', ['sass'])

});

gulp.task('shopifyWatch', function() {
	var options = {
		'basePath': './src/'
	};
	return plugins.watch(options.basePath + '(assets|layout|config|snippets|templates|locales)/**')
	.pipe(plugins.shopifyUpload(config.shopify_api_key, config.shopify_password, config.shopify_url, config.shopify_theme_id, options))
});

gulp.task('default', [
	'sass',
	'shopifyWatch',
  'watch'
]);
