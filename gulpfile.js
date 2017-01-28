var gulp = require('gulp');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var prefix = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var argv = require('yargs').argv;
var plumber = require('gulp-plumber');
var changed = require('gulp-changed');

if (argv._.indexOf("install") < 0)
	livereload.listen();

/*
	./build
		/css
		/css_autoload
		/js
		/js_autoload
	./src
		/js
		/js_autoload
		/scss
		/scss_autoload
*/

var params = {
	js: {
		src: './src/js/**/*.js',
		dest: './build/js',
		src_autoload: './src/js_autoload/**/*.js',
		dest_autoload: './build/js_autoload',
		concat: "main.min.js"
	},
	styles: {
		src: './src/scss/**/*.scss',
		dest: './build/css',
		src_autoload: './src/scss_autoload/**/*.scss',
		dest_autoload: './build/css_autoload',
		concat: "style.css",
		prefixes: ['last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
		sass: {
			sourceComments: false,
			outputStyle: 'compressed',
			errLogToConsole: true
		}
	},
	html: {
		src: './src/**/*.html',
		dest: './build'
	}
}


gulp.task('html', function ()
{
	return gulp.src(params.html.src)
		.pipe(plumber())
		.pipe(gulp.dest(params.html.dest))
		.pipe(livereload());
});

gulp.task('scss', function ()
{
	return gulp.src(params.styles.src)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass(params.styles.sass).on('error', sass.logError))
		.pipe(prefix(params.styles.prefixes))
		.pipe(gulpif(argv.production, minify()))
		.pipe(concat(params.styles.concat))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(params.styles.dest))
		.pipe(livereload());
});

gulp.task('scss_autoload', function ()
{
	return gulp.src(params.styles.src_autoload)
		.pipe(plumber())
		.pipe(changed(params.styles.dest_autoload))
		.pipe(sourcemaps.init())
		.pipe(sass(params.styles.sass).on('error', sass.logError))
		.pipe(prefix(params.styles.prefixes))
		.pipe(gulpif(argv.production, minify()))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(params.styles.dest_autoload))
		.pipe(livereload());
});

gulp.task('js', function(){
	return gulp.src(params.js.src)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat(params.js.concat))
		.pipe(gulpif(argv.production, uglify()))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(params.js.dest))
		.pipe(livereload());
});

gulp.task('js_autoload', function(){
	return gulp.src(params.js.src_autoload)
		.pipe(plumber())
		.pipe(changed(params.js.dest_autoload))
		.pipe(sourcemaps.init())
		.pipe(gulpif(argv.production, uglify()))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(params.js.dest_autoload))
		.pipe(livereload());
});



gulp.task('default', ['html', 'scss', 'scss_autoload', 'js', 'js_autoload'], function()
{
	gulp.watch(params.styles.src, ['scss'])
		.on('change', function(evt) {
			console.log(
				'[watcher] File ' + evt.path.replace(/.*(?=scss)/,'') + ' was ' + evt.type + ', compiling...'
			);
		});
	gulp.watch(params.styles.src_autoload, ['scss_autoload'])
		.on('change', function(evt) {
			console.log(
				'[watcher] File ' + evt.path.replace(/.*(?=scss)/,'') + ' was ' + evt.type + ', compiling...'
			);
		});
	gulp.watch(params.js.src, ['js'])
		.on('change', function(evt) {
			console.log(
				'[watcher] File ' + evt.path + ' was ' + evt.type + ', compiling...'
			);
		});
	gulp.watch(params.js.src_autoload, ['js_autoload'])
		.on('change', function(evt) {
			console.log(
				'[watcher] File ' + evt.path + ' was ' + evt.type + ', compiling...'
			);
		});
	gulp.watch(params.html.src, ['html'])
		.on('change', function(evt) {
			console.log(
				'[watcher] File ' + evt.path + ' was ' + evt.type + ', compiling...'
			);
		});
});

gulp.task('html', function ()
{
	return gulp.src(params.html.src)
		.pipe(plumber())
		.pipe(gulpif(argv.production, minify()))
		.pipe(gulp.dest(params.html.dest))
		.pipe(livereload());
});


