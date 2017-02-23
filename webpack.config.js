var webpack = require('webpack');
var JasmineWebpackPlugin = require('jasmine-webpack-plugin');
// var UglifyParallel = require('webpack-parallel-uglify-plugin');
// var CompressionPlugin = require('compression-webpack-plugin');
// var HappyPack = require('happypack');
var path = require('path');

// exports.plugins = [
//   new HappyPack({
//     id: 'jsx',
//     threads: 4,
//     loaders: [ 'tpl-loader' ]
//   }),

//   new HappyPack({
//     id: 'coffeescripts',
//     threads: 4,
//     loaders: [ 'coffee-loader' ]
//   })
// ];

module.exports = function (env) {
  return {
    watchOptions: {
      aggregateTimeout: 500,
      poll: 1000,
      ignored: /node_modules/
    },
    entry: {
      specs: './specRoot.js',
      public_editor: './lib/assets/core/javascripts/cartodb3/public_editor.js',
      dataset: './lib/assets/core/javascripts/cartodb3/dataset.js',
      editor: './lib/assets/core/javascripts/cartodb3/editor.js'
    },
    output: {
      filename: '[chunkhash].[name].min.js',
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor', // Specify the common bundle's name.
        minChunks: function (module) {
          // this assumes your vendor imports exist in the node_modules directory
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
      }),
      new JasmineWebpackPlugin()
      // new UglifyParallel({
      //   uglifyJS: {
      //     beautify: false,
      //     extractComments: false,
      //     comments: false
      //   }
      // }),
      // new CompressionPlugin({
      //   asset: '[path].gz[query]',
      //   algorithm: 'gzip',
      //   test: /\.js$/,
      //   threshold: 10240
      // })
    ],
    module: {
      loaders: [
        { test: /\.tpl$/, loader: 'tpl-loader' },
        { test: /\.json$/, loader: 'json-loader' }
      ]
    },
    node: {
      fs: 'empty'
    }
  };
};
