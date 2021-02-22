const gulp = require("gulp");
const sass = require("gulp-sass");
const minifyCSS = require("gulp-csso");
const minifyJS = require("gulp-minify");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const sassGlob = require("gulp-sass-glob"); // fixes the imports **/*
const connect = require("gulp-connect"); // start the server
const clean = require("gulp-clean");
require("dotenv").config();

gulp.task("fonts", function () {
  return gulp
    .src("./src/fonts", { allowEmpty: true })
    .pipe(gulp.dest("./build/fonts"));
});
gulp.task("css", function () {
  return gulp
    .src("./src/scss/root.scss")
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(concat("app.min.css"))
    .pipe(minifyCSS())
    .pipe(gulp.dest("./build/css"))
    .pipe(connect.reload());
});

gulp.task("js-slider", function () {
  return gulp
    .src(["./src/slides/**/*.js"], { sourcemaps: true })
    .pipe(concat("slider.js"))
    .pipe(minifyJS())
    .pipe(gulp.dest("./build/js", { sourcemaps: true }))
    .pipe(connect.reload());
});

gulp.task("js-slidecow", function () {
  return gulp
    .src(
      [
        "./src/slidecow/js/saddledollar.js",
        "./src/slidecow/js/slidecow.js",
        "./src/slidecow/js/slide.js",
      ],
      { sourcemaps: true }
    )
    .pipe(concat("slidecow.js"))
    .pipe(minifyJS())
    .pipe(gulp.dest("./build/js", { sourcemaps: true }))
    .pipe(connect.reload());
});
gulp.task("js-copy", function () {
  return gulp
    .src("./node_modules/jquery/dist/jquery.js")
    .pipe(minifyJS())
    .pipe(gulp.dest("./build/js"))
    .pipe(connect.reload());
});
gulp.task("js-app", function () {
  return gulp
    .src("./src/js/*.js", { sourcemaps: true })
    .pipe(concat("app.js"))
    .pipe(minifyJS())
    .pipe(gulp.dest("./build/js", { sourcemaps: true }))
    .pipe(connect.reload());
});
gulp.task(
  "js",
  gulp.parallel(["js-slider", "js-slidecow", "js-copy", "js-app"])
);

gulp.task("html-base", function () {
  return gulp
    .src("./src/*.html")
    .pipe(gulp.dest("./build/"))
    .pipe(connect.reload());
});
gulp.task("html-slide", function () {
  return gulp
    .src("./src/slides/*/*.html")
    .pipe(rename({ dirname: "" }))
    .pipe(gulp.dest("./build/slides"))
    .pipe(connect.reload());
});
gulp.task("html", gulp.parallel(["html-base", "html-slide"]));

gulp.task("clean-img", function () {
  return gulp
    .src("./build/img", {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

gulp.task("copy-img", function () {
  return gulp
    .src(["./src/img/*", "./src/slides/*/img/*"])
    .pipe(rename({ dirname: "" }))
    .pipe(gulp.dest("./build/img"))
    .pipe(connect.reload());
});

gulp.task("img", gulp.series("clean-img", "copy-img"));

gulp.task("build", gulp.parallel("fonts", "css", "js", "html", "img"));

gulp.task(
  "webserver",
  gulp.series("build", function () {
    console.log(process.env.PORT);
    return connect.server({
      port: process.env.PORT,
      host: process.env.HOST,
      root: "build",
      livereload: true,
    });
  })
);

gulp.task("watch", function () {
  gulp.watch(["./src/*.html"], gulp.series("html-base"));
  gulp.watch(["./src/slides/*/*.html"], gulp.series("html-slide"));
  gulp.watch(["./src/img/*", "./src/slides/*/img/*"], gulp.series("img"));
  gulp.watch(
    ["./src/scss/*.scss", "./src/slides/**/*.scss"],
    gulp.series("css")
  );
  gulp.watch("./src/js/*.js", gulp.series("js-app"));
  gulp.watch("./src/slides/**/*.js", gulp.series("js-slider"));
  //gulp.watch('./src/slidecow/js/*.js', gulp.series('js-slidecow'));
  //gulp.watch('./src/slides/*/*.js', gulp.series('js-slider'));
});

gulp.task("default", gulp.parallel("webserver", "watch"));
