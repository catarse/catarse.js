const path = require('path');


module.exports = {
  entry: "./src/c.js", 
  
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "catarse.js",
    publicPath: "/assets/",
    library: "c",
    libraryTarget: "window",
  },
  
  module: {
    rules: [ 
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, "src")
        ],
        exclude: [
          path.resolve(__dirname, "node_modules")
        ],
        loader: "babel-loader",
        options: {
          presets: [
          ["env", {
            "targets": {
              "browsers": []
            }
          }], "flow"]
        },
      },
      
    ],
  },

  resolve: {
    modules: [
      "node_modules"
    ],

    extensions: [".js"],
  },

  performance: {
    // hints: "warning", // enum
    // maxAssetSize: 200000, // int (in bytes),
    // maxEntrypointSize: 400000, // int (in bytes)
    // assetFilter: function(assetFilename) {
    //   // Function predicate that provides asset filenames
    //   return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    // }
  },

  devtool: "source-map", 

  context: __dirname,

  target: "web",

  externals: [
    "chartjs",
    "mithril",
    "mithril-postgrest",
    "moment",
    "i18n-js",
    "replaceDiacritics",
    "select",
    "underscore",
    "CatarseAnalytics"
  ],

  devServer: {
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    noInfo: true, // only errors & warns on hot reload
  },

  plugins: [
  ],
}