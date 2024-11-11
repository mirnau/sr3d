// Less configuration
var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function(cb) {
  gulp
    .src('less/sr3d.less') // Compile the main LESS file
    .pipe(less())
    .pipe(gulp.dest('./styles/'));
  cb();
});

gulp.task(
  'default',
  gulp.series('less', function(cb) {
    // Watch all .less files in the 'less' directory
    gulp.watch('less/**/*.less', gulp.series('less'));
    cb();
  })
);
