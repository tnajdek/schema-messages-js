/*eslint-env node */
module.exports = function(config) {
	config.set({

	basePath: '',
	plugins: [
		'karma-systemjs',
		'karma-jasmine',
		'karma-chrome-launcher',
		'karma-firefox-launcher',
		'karma-source-map-support',
		'karma-babel-preprocessor'
	],
	frameworks: [
		'systemjs',
		'jasmine',
		'source-map-support'
	],
	preprocessors: {
		'js/*.js': ['babel'],
		'test/*.js': ['babel']
	},
	babelPreprocessor: {
		options: {
			sourceMap: 'inline'
		}
	},
	systemjs: {
		config: {
			baseURL: '/',
			transpiler: null,
			// babelOptions: {
			// 	sourceMaps: 'inline'
			// },
			paths: {
				'es6-module-loader': 'node_modules/es6-module-loader/dist/es6-module-loader.js',
				'systemjs': 'node_modules/systemjs/dist/system.js',
				'system-polyfills': 'node_modules/systemjs/dist/system-polyfills.js',
				'babel': 'node_modules/babel-core/browser.js'
			}
		},

		// File patterns for your application code, dependencies, and test suites
		files: [
			'node_modules/es6-module-loader/dist/es6-module-loader.js.map',
			'node_modules/systemjs/dist/system-polyfills.js.map',
			'node_modules/systemjs/dist/system.js.map',
			'bower_components/jspack-arraybuffer/struct.js',
			'bower_components/utf8/utf8.js',
			'js/*.js',
			'test/*.spec.js'
		]

		// SystemJS configuration specifically for tests, added after your config file.
		// Good for adding test libraries and mock modules
		// config: {
		// 	paths: {
		// 		'angular-mocks': 'bower_components/angular-mocks/angular-mocks.js'
		// 	}
		// },

		// Specify the suffix used for test suite file names.	Defaults to .test.js, .spec.js, _test.js, and _spec.js
		// testFileSuffix: '.spec.js'
	},
	reporters: ['dots'],
	port: 9876,
	colors: true,
	logLevel: config.LOG_INFO,
	autoWatch: true,
	browsers: ['Chrome'],
	singleRun: false
	});
};
