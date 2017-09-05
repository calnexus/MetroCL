module.exports = function(grunt) {

    "use strict";

    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
        ' * Metro UI CSS v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
        ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed under <%= pkg.license %>\n' +
        ' */\n',

        requirejs_banner: "\n(function( factory ) {\n"+
        "    if ( typeof define === 'function' && define.amd ) {\n" +
        "        define([ 'jquery' ], factory );\n"+
        "    } else {\n" +
        "        factory( jQuery );\n"+
        "    }\n"+
        "}(function( jQuery ) { \n'use strict';\n\nvar $ = jQuery;\n\n",

        clean: {
            build: ['build/js', 'build/css']
        },

        concat: {
            js: {
                options: {
                    banner: '<%= banner %>' + '<%= requirejs_banner%>',
                    footer: "\n\n return Metro.init();\n\n}));",
                    stripBanners: true,
                    process: function(src, filepath) {
                        return '// Source: ' + filepath + '\n' +
                            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    }
                },
                src: [
                    'js/*.js',
                    'js/utils/*.js',
                    'js/plugins/*.js'
                ],
                dest: 'build/js/metro.js'
            },
            css: {
                src: [
                    'build/css/metro.css',
                    'build/css/metro-colors.css',
                    'build/css/metro-rtl.css',
                    'build/css/metro-schemes.css',
                    'build/css/metro-icons.css'
                ],
                dest: 'build/css/metro-all.css'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>',
                stripBanners: false,
                sourceMap: false,
                preserveComments: false
            },
            core: {
                src: 'build/js/metro.js',
                dest: 'build/js/metro.min.js'
            }
        },

        less: {
            options: {
                paths: ['less'],
                strictMath: false,
                sourceMap: false
            },
            compileCore: {
                src: 'less/metro.less',
                dest: 'build/css/metro.css'
            },
            compileColors: {
                src: 'less/metro-colors.less',
                dest: 'build/css/metro-colors.css'
            },
            compileIcons: {
                src: 'less/metro-icons.less',
                dest: 'build/css/metro-icons.css'
            },
            compileRtl: {
                src: 'less/metro-rtl.less',
                dest: 'build/css/metro-rtl.css'
            },
            compileSchemes: {
                src: 'less/metro-schemes.less',
                dest: 'build/css/metro-schemes.css'
            }
        },

        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 2 versions']
                    })
                ]
            },
            dist: {
                src: 'build/css/*.css'
            }
        },

        cssmin: {
            minCore: {
                src: 'build/css/metro.css',
                dest: 'build/css/metro.min.css'
            },
            minColors: {
                src: 'build/css/metro-colors.css',
                dest: 'build/css/metro-colors.min.css'
            },
            minIcons: {
                src: 'build/css/metro-icons.css',
                dest: 'build/css/metro-icons.min.css'
            },
            minRtl: {
                src: 'build/css/metro-rtl.css',
                dest: 'build/css/metro-rtl.min.css'
            },
            minSchemes: {
                src: 'build/css/metro-schemes.css',
                dest: 'build/css/metro-schemes.min.css'
            },
            minAll: {
                src: 'build/css/metro-all.css',
                dest: 'build/css/metro-all.min.css'
            }
        },

        compress: {
            main: {
                options: {
                    archive: "target/metro_<%= pkg.version %>-<%= pkg.version_suffix %>.zip"
                },
                files: [
                    {
                        expand: true,
                        cwd: "build/",
                        src: ["**/*"],
                        dest: "."
                    },
                    {
                        src: ["README.md", "LICENSE", "CHANGELOG.md"],
                        dest: "."
                    }
                ]
            }
        },

        copy: {
            fonts: {
                expand: true,
                cwd: 'icons',
                src: '**/*',
                dest: 'build/icons'
            },
            site: {
                expand: true,
                cwd: 'build',
                src: '**/*',
                dest: 'site/metro'
            },
            public_release: {
                expand: true,
                cwd: 'target',
                src: '**/*',
                dest: 'site/files/'
            }
        },

        watch: {
            scripts: {
                files: ['js/*.js', 'js/utils/*.js', 'js/plugins/*js', 'less/*.less', 'less/include/*.less', 'less/schemes/*.less', 'Gruntfile.js'],
                tasks: ['clean', 'less', 'concat', 'postcss',  'uglify', 'cssmin', 'compress', 'copy']
            }
        }
    });

    grunt.registerTask('default', [
        'clean', 'less', 'concat', 'postcss',  'uglify', 'cssmin', 'compress', 'copy', 'watch'
    ]);

};