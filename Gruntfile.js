'use strict';

var lrSnippet = require('connect-livereload')();
var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var pathConfig = {
        app : 'app',
        dist : 'dist',
        tmp : '.tmp',
        test : 'test'
    };

    grunt.initConfig({
        paths : pathConfig,
        watch : {
            compass : {
                files : ['<%= paths.app %>/compass/{,*/}*/{,*/}*.{scss,sass,png,ttf,otf}'],
                tasks : ['compass:server']
            },
            jade : {
                files : ['<%= paths.app %>/**/*.jade'],
                tasks : ['jade:server'],
                options : {
                    spawn : false
                }
            },
            stencil : {
                files : ['<%= paths.app %>/**/*.html'],
                tasks : ['stencil:server'],
                options : {
                    spawn : false
                }
            },
            test : {
                files : ['<%= paths.app %>/javascripts/**/*.js'],
                tasks : ['jshint:test', 'karma:server:run'],
                options : {
                    spawn : false
                }
            },
            livereload: {
                files: [
                    '<%= paths.app %>/**/*.html',
                    '<%= paths.app %>/**/*.jade',
                    '<%= paths.app %>/javascripts/**/*.js',
                    '<%= paths.app %>/images/**/*.{webp,jpg,jpeg,png,gif,ttf,otf}',
                    '<%= paths.tmp %>/stylesheets/**/*.css',
                    '<%= paths.tmp %>/images/**/*.{webp,jpg,jpeg,png,gif,ttf,otf}'
                ],
                options : {
                    livereload : true,
                    spawn : false
                }
            }
        },
        connect : {
            options : {
                port : 9999,
                hostname : '0.0.0.0'
            },
            rules : [{
                from : '^/$',
                to : '/templates/index.html'
            }],
            server : {
                options : {
                    middleware : function (connect) {
                        return [
                            lrSnippet,
                            rewriteRulesSnippet,
                            mountFolder(connect, pathConfig.tmp),
                            mountFolder(connect, pathConfig.app)
                        ];
                    }
                }
            }
        },
        open: {
            server : {
                path : 'http://127.0.0.1:<%= connect.options.port %>',
                app : 'Google Chrome'
            }
        },
        clean : {
            dist : ['<%= paths.tmp %>', '<%= paths.dist %>'],
            server : '<%= paths.tmp %>'
        },
        useminPrepare : {
            html : ['<%= paths.app %>/**/*.html'],
            options : {
                dest : '<%= paths.dist %>'
            }
        },
        usemin: {
            html : ['<%= paths.dist %>/**/*.html'],
            css : ['<%= paths.dist %>/stylesheets/**/*.css'],
            options : {
                dirs : ['<%= paths.dist %>'],
                assetsDirs : ['<%= paths.dist %>']
            }
        },
        htmlmin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= paths.app %>',
                    src : ['**/*.html'],
                    dest : '<%= paths.dist %>'
                }]
            }
        },
        copy : {
            dist : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= paths.app %>',
                    dest : '<%= paths.dist %>',
                    src : [
                        'images/**/*.{webp,gif,png,jpg,jpeg,ttf,otf}',
                        '!**/*.jade'
                    ]
                }]
            }
        },
        compass : {
            options : {
                sassDir : '<%= paths.app %>/compass/sass',
                imagesDir : '<%= paths.app %>/compass/images',
                fontsDir : '<%= paths.app %>/images/fonts',
                relativeAssets : true
            },
            dist : {
                options : {
                    cssDir : '<%= paths.dist %>/stylesheets',
                    generatedImagesDir : '<%= paths.dist %>/images',
                    outputStyle : 'compressed',
                    environment : 'production'
                }
            },
            server : {
                options : {
                    cssDir : '<%= paths.tmp %>/stylesheets',
                    generatedImagesDir : '<%= paths.tmp %>/images',
                    debugInfo : true,
                    environment : 'development'
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= paths.dist %>/javascripts/**/*.js',
                        '<%= paths.dist %>/stylesheets/**/*.css',
                        '<%= paths.dist %>/images/**/*.{webp,gif,png,jpg,jpeg,ttf,otf}'
                    ]
                }
            }
        },
        imagemin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= paths.dist %>/images',
                    src : '**/*.{png,jpg,jpeg}',
                    dest : '<%= paths.dist %>/images'
                }]
            }
        },
        requirejs : {
            dist : {
                options : {
                    optimize : 'uglify',
                    uglify : {
                        toplevel : true,
                        ascii_only : false,
                        beautify : false
                    },
                    preserveLicenseComments : true,
                    useStrict : false,
                    wrap : true
                }
            }
        },
        concurrent: {
            dist : ['copy:dist', 'compass:dist']
        },
        jshint : {
            options : {
                jshintrc : '.jshintrc'
            },
            test : ['<%= paths.app %>/javascripts/**/*.js']
        },
        karma : {
            options : {
                configFile : '<%= paths.test %>/karma.conf.js',
                browsers : ['Chrome_without_security']
            },
            server : {
                reporters : ['progress'],
                background : true
            },
            test : {
                reporters : ['progress', 'junit', 'coverage'],
                preprocessors : {
                    '<%= paths.app %>/javascripts/**/*.js' : 'coverage'
                },
                junitReporter : {
                    outputFile : '<%= paths.test %>/output/test-results.xml'
                },
                coverageReporter : {
                    type : 'html',
                    dir : '<%= paths.test %>/output/coverage/'
                },
                singleRun : true
            },
            travis : {
                browsers : ['PhantomJS'],
                reporters : ['progress'],
                singleRun : true
            }
        },
        bump : {
            options : {
                files : ['package.json', 'bower.json'],
                updateConfigs : [],
                commit : true,
                commitMessage : 'Release v%VERSION%',
                commitFiles : ['-a'],
                createTag : true,
                tagName : 'v%VERSION%',
                tagMessage : 'Version %VERSION%',
                push : false
            }
        },
        jade: {
            server : {
                options: {
                    data: {
                        debug : true,
                        timestamp: '<%= new Date().getTime() %>'
                    }
                },
                files: [{
                    expand: true,
                    dest: '<%= paths.tmp %>',
                    cwd: '<%= paths.app %>',
                    src: [ '**/*.jade' ],
                    ext: '.html'
                }]
            },
            compile: {
                options: {
                    data: {
                        debug : false
                    }
                },
                files: [{
                    expand: true,
                    dest: '<%= paths.dist %>',
                    cwd: '<%= paths.app %>',
                    src: [ '**/*.jade' ],
                    ext: '.html'
                }]
            }
        },
        stencil : {
            options : {
                partials : '<%= paths.app %>/partials',
                templates : '<%= paths.app %>/templates',
                dot_template_settings : {
                    strip : false
                }
            },
            server : {
                options : {
                    env : {
                        title : '豌豆荚',
                        prefix : '',
                        debug : true
                    }
                },
                files : [{
                    expand : true,
                    cwd : '<%= paths.app %>/pages/',
                    src : '**/*.jade',
                    dest : '<%= paths.tmp %>',
                    ext : '.html',
                    flatten : false
                }]
            },
            dist : {
                options : {
                    env : {
                        title : '豌豆荚',
                        prefix : 'http://www.wandoujia.com',
                        debug : false
                    }
                },
                files : [{
                    expand : true,
                    cwd : '<%= paths.app %>/pages/',
                    src : '**/*.jade',
                    dest : '<%= paths.tmp %>',
                    ext : '.html',
                    flatten : false
                }]
            }
        }
    });

    grunt.registerTask('server', [
        'clean:server',
        'jade:server',
        'compass:server',
        'configureRewriteRules',
        'connect:server',
        // 'stencil:server',
        'karma:server',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'jshint:test',
        'karma:test'
    ]);

    grunt.registerTask('test:travis', [
        'jshint:test',
        'karma:travis'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'concurrent:dist',
        'jade:compile',
        'useminPrepare',
        'concat',
        'uglify',
        // 'requirejs:dist', // Uncomment this line if using RequireJS in your project
        'imagemin',
        'htmlmin',
        'rev',
        'usemin'
    ]);

    grunt.registerTask(['update'], [
        'bump-only:patch',
        'changelog',
        'bump-commit'
    ]);

    grunt.registerTask(['update:minor'], [
        'bump-only:minor',
        'changelog',
        'bump-commit'
    ]);

    grunt.registerTask(['update:major'], [
        'bump-only:major',
        'changelog',
        'bump-commit'
    ]);
};
