/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require("path");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/electron/index.ts",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
    alias: {
      awsIoT: path.resolve(__dirname, "../awsIoT/src")
    }
  },
  node: {
    __dirname: true,
  },
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /osx-temperature-sensor$/, }),
  ],
};
