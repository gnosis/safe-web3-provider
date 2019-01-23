const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    'index': './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          path.resolve(__dirname, './node_modules/')
        ],
        loader: 'babel-loader'
      }
    ]
  }
}