var webpack = require('webpack');

module.exports = {
  context: __dirname + '/src',
  entry: './index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'dispatchbot-authentication.js'
  },

  plugins: [
    new webpack.DefinePlugin({
      ON_TEST: process.env.NODE_ENV === 'test'
    })
  ],

  module: {
    loaders: [
      //{ test: /\.js$/, loader: 'babel', exclude: /node_modules/ }
    ]
  }
}
