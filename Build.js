module.exports = function(grunt) {

    "use strict";

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        buildnumber: {
            options: {
                field: 'build'
            },
            files: ['package.json']
        }
    });

    grunt.registerTask('default', [
        'buildnumber'
    ]);

};