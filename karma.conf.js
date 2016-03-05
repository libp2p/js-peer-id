module.exports = (config) => {
  const path = require('path')
  const node_modules_dir = path.join(__dirname, 'node_modules')
  const deps = [
    'deps/forge.bundle.js'
  ]
  config.set({
    basePath: '',
    frameworks: ['mocha'],

    files: [
      'tests/test.js'
    ],

    preprocessors: {
      'tests/*': ['webpack']
    },

    webpack: {
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
      },
      resolve: {
        extensions: ['', '.js', '.json'],
        alias: { 'node-forge': path.resolve(__dirname, 'deps/forge.bundle.js') }
      },
      externals: {
        fs: '{}'
      },
      node: {
        Buffer: true
      },
      module: {
        loaders: [
          { test: /\.json$/, loader: 'json' }
        ],
        noParse: []
      }
    },

    webpackMiddleware: {
      noInfo: true,
      stats: {
        colors: true
      }
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],
    singleRun: true
  })

  deps.forEach((dep) => {
    const depPath = path.resolve(node_modules_dir, dep)
    config.webpack.module.noParse.push(depPath)
  })
}
