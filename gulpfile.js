// Required plugins
const gulp = require('gulp');
const less = require('gulp-less');
const path = require('path'); // For handling file paths

// Paths
const paths = {
  allLess: 'less/**/*.less', // Watch all LESS files recursively in the less folder
  themes: 'less/themes/*/styles.less', // Glob for all styles.less in theme subfolders
  output: './styles/', // Output folder for compiled CSS
};

// LESS compilation task
gulp.task('themes', () => {
  return gulp
    .src(paths.themes)
    .pipe(less().on('error', function (err) {
      console.error('Error in LESS compilation:', err.message);
      this.emit('end');
    }))
    .pipe(gulp.dest((file) => {
      // Extract the theme folder name
      const themeName = path.basename(path.dirname(file.path));
      // Set the destination file name
      file.path = path.join(file.base, `sr3d-${themeName}.css`);
      return paths.output;
    }));
});

// Watch task
gulp.task('watch', () => {
  gulp.watch(paths.allLess, gulp.series('themes')).on('change', (file) => {
    console.log(`File changed: ${file}`);
  });
});

// Default task: Compile all themes and start watching
gulp.task('default', gulp.series('themes', 'watch'));
