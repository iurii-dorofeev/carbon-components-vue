/**
 * Copyright IBM Corp. 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        actions: true,
        backgrounds: false,
        controls: true,
        docs: true,
        toolbars: true,
        viewport: true,
      },
    },
    '@storybook/addon-storysource',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-webpack5',
    options: {},
  },
  stories: [
    './Welcome/__welcome-story.js',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    // MDX files temporarily disabled - need migration to MDX2 format
    // '../src/**/*.stories.mdx',
  ],
  docs: {
    autodocs: true,
  },
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need

    const vueLoader = config.module.rules.find(
      r => r.loader && r.loader.includes('/vue-loader/')
    );
    if (vueLoader)
      vueLoader.options = {
        ...vueLoader.options,
        compilerOptions: {
          // treat any tag that starts with ion- as custom elements
          isCustomElement: tag => tag.startsWith('bx-'),
        },
      };
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            context: 'docs/carbon-vue-icon/',
            from: '*',
            to: 'static/media/carbon-vue-icon/',
          },
        ],
      })
    );

    config.performance = {
      ...config.performance,
      maxEntrypointSize: 5000000,
      maxAssetSize: 4000000,
    };

    // Fix chunk loading issues in Storybook 7
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    };

    // Return the altered config
    return config;
  },
};
