/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import { dependencies } from '../../release/app/package.json';
import path from "path";

interface External {
  [key: string]: string;
}

const externals: External = {};

Object.keys(dependencies).forEach((key) => {
  externals[key] = process.env.NODE_ENV === "production" ? path.join("..", "..", "..", "app.asar.unpacked", "node_modules", key) : path.join(__dirname, "release", "app", "node_modules", key);
});

const configuration: webpack.Configuration = {
  externals,

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, webpackPaths.appNodeModulesPath, 'node_modules'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
};

export default configuration;
