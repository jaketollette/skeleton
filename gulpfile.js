(function(){
    "use strict";
    var appName = "skeleton",
            devPath = "../../dev/",
            proPath = "../../production/";

    var gulp = require("gulp"),
            concat = require("gulp-concat"),
            uglify = require("gulp-uglify"),
            cleanCSS = require("gulp-clean-css"),
            rename = require("gulp-rename"),
            sass = require("gulp-sass"),
            maps = require("gulp-sourcemaps"),
            del = require("del"),
            ts = require("gulp-typescript"),
            syncy = require("syncy"),
            imagemin = require("gulp-imagemin"),
            browserSync = require("browser-sync").create();

    // Transpile TypeSript
    gulp.task("transpileTs", function(){
            return gulp.src("src/ts/*.ts")
            .pipe(ts({
                noImplicitAny: true,
                out: "main.js"
            }))
            .pipe(gulp.dest("src/js"))
            .pipe(browserSync.stream());
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
        .pipe(gulp.dest("src/js"))
        .pipe(browserSync.stream());
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
        .pipe(gulp.dest("src/css"))
        .pipe(browserSync.stream());
    });

    // Minify CSS. Calls Concat first. Which also compiles SASS.
    // Compatibility is set to ie9 by default
    gulp.task("minifyCSS", ["concatCss"], function(){
        return gulp.src("src/css/*.css")
        .pipe(cleanCSS({compatibility: "ie9"}))
        .pipe(gulp.dest("src/css"));
    });

    // Compress images
    gulp.task("minifyImg", function(){
        return gulp.src("src/img/*")
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
    });

    // Watches SCSS, JS, and TS for changes and
    // calls Concat for each (Which will build SASS, JS, and TS)
    // Does not minify scripts for development debugging
    gulp.task("watchFiles", function(){

        browserSync.init({
            server: "./src"
        });

        gulp.watch("src/scss/**/*.scss", ["concatCss"]);
        gulp.watch("src/ts/**/*.ts", ["transpileTs"]);
        gulp.watch("src/js/*.js", ["concatScripts"]);
        gulp.watch("src/*+(html|asp|php|txt)").on('change', browserSync.reload);
    });

    // Cleans up files created by gulp tasks
    gulp.task("clean", function(){
        del(['dist']);
    });

    // Builds the project. Compiles Sass, Transpiles TS, Concats Scripts and CSS
    // Creates "dist" directory and copies files ready for production
    gulp.task("build", ["minifyScripts", "minifyCSS", "minifyImg"], function(){
        return gulp.src(["src/css/**/*.css", "src/js/**/*.js", "src/*.+(html|txt|config)"], { base: 'src'})
        .pipe(gulp.dest("dist"));
    });

    // Better named task for watching files. This will do what "watchFiles" does above.
    gulp.task("serve", ["watchFiles"]);

    // Default task "gulp" in command line. This will run "clean" and then "build"
    // which will remove all gulp created files and build from scratch
    gulp.task("default", ["clean"], function(){
        gulp.start("build");
    });

    gulp.task("browser-sync", function(){
        browserSync.init({
            server: {
                baseDir: "./"
            }
        });
    });

    // Deploy to develoment server on local disk
    gulp.task("deployDev", function(){
        return syncy(['dist/**'], devPath + appName, {verbose: true, base: "dist"})
        .then(function (){
            console.log("Done");
        })
        .catch(function(err) {
            console.log(err);
        });
    });

    // Deploy to develoment server on local disk
    gulp.task("deployPro", function(){
        return syncy(['dist/**'], proPath + appName, {verbose: true, base: "dist"})
        .then(function (){
            console.log("Done");
        })
        .catch(function(err) {
            console.log(err);
        });
    });

})();
