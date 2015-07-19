/*eslint-env node */
module.exports = function(config) {
	var reporters = process.env.COVERALLS_REPO_TOKEN ? ['dots', 'coverage', 'coveralls'] : ['dots', 'coverage'];

	config.set({
	basePath: '',
	plugins: [
		'karma-systemjs',
		'karma-jasmine',
		'karma-coverage',
		'karma-coveralls',
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
		'src/js/*.js': ['babel', 'coverage'],
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
			'src/bower_components/jspack-arraybuffer/struct.js',
			'src/bower_components/utf8/utf8.js',
			'src/js/*.js',
			'test/*.spec.js'
		]
	},
	reporters: reporters,
	coverageReporter: {
		type: 'lcov',
		dir: 'coverage/'
	},
	port: 9876,
	colors: true,
	logLevel: config.LOG_INFO,
	autoWatch: true,
	browsers: ['Chrome'],
	singleRun: false
	});
};
