module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: "node-loader",
    exclude: /node_modules/,
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    exclude: /node_modules/,
    use: {
      loader: "@marshallofsound/webpack-asset-relocator-loader",
      options: {
        outputAssetBase: "native_modules",
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
      },
    },
  },
];
