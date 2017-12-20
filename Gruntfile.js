module.exports = function(grunt) {

    "use strict";

    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
        ' * Metro 4 Components Library v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
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
                    footer: "\n\n return METRO_INIT === true ? Metro.init() : Metro;\n\n}));",
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
                    'build/css/metro-icons.css'
                ],
                dest: 'build/css/metro-all.css'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>',
                stripBanners: false,
                sourceMap: true,
                preserveComments: false
            },
            core: {
                src: 'build/js/metro.js',
                dest: 'build/js/metro.min.js'
            }
        },

        less: {
            options: {
                paths: "less/",
                strictMath: false,
                sourceMap: false
            },
            src: {
                expand: true,
                cwd: "less/",
                src: ["metro.less", "metro-rtl.less", "metro-colors.less", "metro-icons.less"],
                ext: ".css",
                dest: "build/css"
            },
            schemes: {
                expand: true,
                cwd: "less/schemes/",
                src: ["*.less"],
                ext: ".css",
                dest: "build/css/schemes"
            }
        },

        postcss: {
            options: {
                map: {
                    inline: false,
                    annotation: 'build/css/maps/'
                },
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 2 versions']
                    })
                ]
            },
            dist: {
                src: 'build/css/*.css'
            },
            schemes: {
                src: 'build/css/schemes/*.css'
            }
        },

        cssmin: {
            src: {
                expand: true,
                cwd: "build/css",
                src: ['*.css', '!*.min.css'],
                dest: "build/css",
                ext: ".min.css"
            },
            schemes: {
                expand: true,
                cwd: "build/css/schemes",
                src: ['*.css', '!*.min.css'],
                dest: "build/css/schemes",
                ext: ".min.css"
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'target/metro-<%= pkg.version %>-alpha.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: "build/",
                        src: ['**/*'],
                        dest: '.'
                    },
                    {
                        src: ['README.md', 'CHANGELOG.md', 'LICENSE'],
                        dest: '.'
                    }
                ]
            }
        },

        copy: {
            fonts: {
                expand: true,
                cwd: 'icons',
                src: '**/*',
                dest: 'build/mif'
            },
            docs: {
                expand: true,
                cwd: 'build',
                src: '**/*',
                dest: 'docs/metro'
            },
            target: {
                expand: true,
                cwd: 'target',
                src: '**/*',
                dest: 'docs/files'
            }
        },

        replace: {
            advert: {
                options: {
                    patterns: [
                        {
                            match: /<!-- ads-html -->/g,
                            replacement: '' +
                            '<div style="margin:10px 0">' +
                            '<!-- Metro UI Responsive 1 -->\n' +
                            '<ins class="adsbygoogle" ' +
                            '     style="display:block" ' +
                            '     data-ad-client="ca-pub-1632668592742327" ' +
                            '     data-ad-slot="8347181909" ' +
                            '     data-ad-format="auto"></ins>' +
                            '</div>' +
                            '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
                        },
                        {
                            match: /<!-- ads-side -->/g,
                            replacement: '' +
                            '<div style="margin:10px 0">' +
                            '<!-- Metro 4 side -->\n' +
                            '<ins class="adsbygoogle"\n' +
                            '     style="display:block"\n' +
                            '     data-ad-client="ca-pub-1632668592742327"\n' +
                            '     data-ad-slot="3568893396"\n' +
                            '     data-ad-format="auto"></ins>\n' +
                            '</div>' +
                            '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
                        },
                        {
                            match: /<!-- ads-script -->/g,
                            replacement: '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['docs/*.html'], dest: '.adsense/'
                    }
                ]
            }
        },

        watch: {
            scripts: {
                files: ['js/i18n/*.json', 'js/*.js', 'js/utils/*.js', 'js/plugins/*js', 'less/*.less', 'less/include/*.less', 'less/schemes/*.less', 'less/schemes/builder/*.less', 'Gruntfile.js'],
                tasks: ['clean',  'less', 'postcss', 'concat',  'uglify', 'cssmin', 'compress', 'copy', 'replace']
            }
        }
    });

    grunt.registerTask('default', [
        'clean', 'less', 'postcss', 'concat',  'uglify', 'cssmin', 'compress', 'copy', 'replace', 'watch'
    ]);

};