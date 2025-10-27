const path = require('path');

const rnrkLibPackageJson = require('../package.json');
const rnhmsLibPackageJson = require('../../react-native-hms/package.json');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'babel-plugin-syntax-hermes-parser',
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
