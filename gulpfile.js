var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('uglify', function(){

    return gulp.src('src/GMSandbox.js')
        .pipe(uglify())
        .pipe(rename('GMSandbox.min.js'))
        .pipe(gulp.dest('src/'))

});

gulp.task('default', ['uglify'], function(){

});
