const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const JSON_FILES = ['src/*.json', 'src/**/*.json'];

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');
gulp.task('scripts', () => {
  const tsResult = tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject());
  return tsResult.js.pipe(sourcemaps.write('../maps', {
      includeContent: false,
      sourceRoot: function (file) {
        var length = file.sourceMap.file.split('/').length;
        var before = '';
        for (var i = 0; i < length; i++)
          before += '../'
        return before + 'src'
      }
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('assets', function () {
  return gulp.src(JSON_FILES)
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch('src/**/*.*', ['scripts']);
});

gulp.task('default', ['watch', 'assets']);