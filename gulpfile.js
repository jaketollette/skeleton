(function(){
    "use strict";

    var gulp = require("gulp"),
            concat = require("gulp-concat"),
            uglify = require("gulp-uglify"),
            cleanCSS = require("gulp-clean-css"),
            rename = require("gulp-rename"),
            sass = require("gulp-sass"),
            maps = require("gulp-sourcemaps"),
            del = require("del"),
            ts = require("gulp-typescript");

    // Transpile TypeSript
    gulp.task("transpileTs", function(){
            return gulp.src("src/ts/*.ts")
            .pipe(ts({
                noImplicitAny: true,
                out: "main.js"
            }))
            .pipe(gulp.dest("src/js"));
    });

    // Concat All JS (Order Matters!)
    gulp.task("concatScripts", function(){
        return gulp.src([
            "src/js/libs/zepto.js",
            "src/js/libs/move.js"
        ])
        .pipe(maps.init())
        .pipe(concat("libs.js"))
        .pipe(maps.write("./"))
        .pipe(gulp.dest("src/js"));
    });

    // Minify JS. This will Transpile TS and Concat JS first
    gulp.task("minifyScripts", ["transpileTs", "concatScripts"], function(){
        return gulp.src("src/js/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("src/js"));
    });

    // Compile SASS
    gulp.task("compileSass", function(){
        return gulp.src("src/scss/style.scss")
        .pipe(maps.init())
        .pipe(sass())
        .pipe(maps.write("./"))
        .pipe(gulp.dest("src/css"));
    });

    // Concat all CSS (Order Matters!)
    // Compiles SASS first and then concats other css from libraries
    gulp.task("concatCss", ["compileSass"], function(){
        return gulp.src([
            "src/css/libs/*.css",
            "src/css/style.css"
        ])
        .pipe(concat("style.css"))
        .pipe(gulp.dest("src/css"));
    });

    // Minify CSS. Calls Concat first. Which also compiles SASS.
    // Compatibility is set to ie9 by default
    gulp.task("minifyCSS", ["concatCss"], function(){
        return gulp.src("src/css/*.css")
        .pipe(cleanCSS({compatibility: "ie9"}))
        .pipe(gulp.dest("src/css"));
    });

    // Watches SCSS, JS, and TS for changes and
    // calls Concat for each (Which will build SASS, JS, and TS)
    // Does not minify scripts for development debugging
    gulp.task("watchFiles", function(){
        gulp.watch("src/scss/**/*.scss", ["concatCss"]);
        gulp.watch("src/ts/**/*.ts", ["transpileTs"]);
        gulp.watch("src/js/*.js", ["concatScripts"]);
    });

    // Cleans up files created by gulp tasks
    gulp.task("clean", function(){
        del(['dist']);
    });

    // Builds the project. Compiles Sass, Transpiles TS, Concats Scripts and CSS
    // Creates "dist" directory and copies files ready for production
    gulp.task("build", ["minifyScripts", "minifyCSS"], function(){
        return gulp.src(["src/css/**/*.css", "src/js/**/*.js", "src/images/**", "src/*.+(html|txt|config)"], { base: 'src'})
        .pipe(gulp.dest("dist"));
    });

    // Better named task for watching files. This will do what "watchFiles" does above.
    gulp.task("serve", ["watchFiles"]);

    // Default task "gulp" in command line. This will run "clean" and then "build"
    // which will remove all gulp created files and build from scratch
    gulp.task("default", ["clean"], function(){
        gulp.start("build");
    });

})();
