const path = require('path');

const rnrkLibPackageJson = require('../package.json');
const rnhmsLibPackageJson = require('../../react-native-hms/package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Hermes parser is included in @react-native/babel-preset 0.78+, no need
    // for the explicit babel-plugin-syntax-hermes-parser here.
    ['@babel/plugin-transform-private-methods', { loose: true }],
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [rnrkLibPackageJson.name]: path.join(
            __dirname,
            '..',
            rnrkLibPackageJson.source
          ),
          [rnhmsLibPackageJson.name]: path.join(
            __dirname,
            '../../react-native-hms',
            rnhmsLibPackageJson.source
          ),
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
