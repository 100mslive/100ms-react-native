const path = require('path');
const blacklist = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const rnrkLibRoot = path.resolve(__dirname, '..');
const rnhmsLibRoot = path.resolve(__dirname, '../../react-native-hms');

const rnrkLibPackageJson = require('../package.json');
const rnhmsLibPackageJson = require('../../react-native-hms/package.json');

const rnrkModules = Object.keys({
  ...rnrkLibPackageJson.peerDependencies,
  ...rnrkLibPackageJson.optionalDependencies,
});

const rnhmsModules = Object.keys({
  ...rnhmsLibPackageJson.peerDependencies,
});

module.exports = {
  projectRoot: __dirname,
  watchFolders: [rnrkLibRoot, rnhmsLibRoot],

  resolver: {
    blockList: blacklist([
      ...rnrkModules.map(
        m =>
          new RegExp(
            `^${escape(path.join(rnrkLibRoot, 'node_modules', m))}\\/.*$`,
          ),
      ),
      ...rnhmsModules.map(
        m =>
          new RegExp(
            `^${escape(path.join(rnhmsLibRoot, 'node_modules', m))}\\/.*$`,
          ),
      ),
    ]),

    extraNodeModules: [
      ...new Set([
        ...rnrkModules.filter(module => module !== rnhmsLibPackageJson.name),
        ...rnhmsModules,
      ]),
    ].reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
