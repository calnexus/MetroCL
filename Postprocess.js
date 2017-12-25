module.exports = function(grunt) {

    "use strict";

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            adsense: ['adsense']
        },

        replace: {
            adsense: {
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
                        src: ['docs/*.html'], dest: 'adsense/'
                    }
                ]
            }
        }
    });

    grunt.registerTask('default', [
        'clean', 'replace'
    ]);

};