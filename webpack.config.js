var path = require('path')

module.exports = {
  name: 'peerid',
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'peer-id.js',
    libraryTarget: 'var',
    library: 'PeerId'
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
}
