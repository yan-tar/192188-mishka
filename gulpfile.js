"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require("gulp-imagemin");
var server = require("browser-sync").create();
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var del = require("del");
var run = require("run-sequence");

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "style",
    "images",
    "symbols",
    fn
  );
});

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("build/style.min.css"))
    .pipe(gulp.dest("css"))
    .pipe(server.stream());
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: ".",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html")
    .on("change", server.reload);
});

gulp.task("images", function(){
  return gulp.src("build/img/**/*.{png,jpg}")
  .pipe(imagemin([imagemin.optipng({
    optimizationLevel:3}),
    imagemin.jpegtran({
      progressive: true
    })
  ]))
  .pipe(gulp.dest("build/img"))
})

gulp.task("copy", function() {
 return gulp.src([
  "fonts/**/*.{woff,woff2}",
  "img/**",
  "js/**",
  "*.html"
 ], {
  base: "."
 })
 .pipe(gulp.dest("build"))
});

gulp.task("symbols", function() {
  return gulp.src("build/img/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("clean", function() {
  return del("build");
});
