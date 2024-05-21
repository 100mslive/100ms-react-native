const path = require('path');

const rnrkLibPackageJson = require('../package.json');
const rnhmsLibPackageJson = require('../../react-native-hms/package.json');
const rnvpLibPackageJson = require('../../react-native-video-plugin/package.json');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [rnrkLibPackageJson.name]: path.join(
            __dirname,
            '..',
            rnrkLibPackageJson.source,
          ),
          [rnhmsLibPackageJson.name]: path.join(
            __dirname,
            '../../react-native-hms',
            rnhmsLibPackageJson.source,
          ),
          [rnvpLibPackageJson.name]: path.join(
            __dirname,
            '../../react-native-video-plugin',
            rnvpLibPackageJson.source,
          ),
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
