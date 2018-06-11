const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

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

gulp.task('json_files', function () {
  return gulp.src(['src/*.json', 'src/**/*.json'])
    .pipe(gulp.dest('dist'));
});

gulp.task('certificates', () => {
  return gulp.src(['certificates/*.*'])
    .pipe(gulp.dest('dist/certificates'));
});

gulp.task('assets', () => {
  return gulp.src(['src/assets/**/*.*'])
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('watch', ['scripts', 'json_files', 'assets'], () => {
  gulp.watch('src/**/*.*', ['scripts', 'json_files', 'assets']);
});

gulp.task('default', ['watch', 'json_files', 'assets', 'certificates']);