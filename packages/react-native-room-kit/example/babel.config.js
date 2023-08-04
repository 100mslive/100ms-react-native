const path = require('path');

const rnrkLibPackageJson = require('../package.json');

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
            rnrkLibPackageJson.source
          ),
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
