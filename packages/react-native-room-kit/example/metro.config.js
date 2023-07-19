const path = require('path');
const blacklist = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const root_pak = require('../package.json');
const rnhms_root_pak = require('../../react-native-hms/package.json');

const root = path.resolve(__dirname, '..');
const rnhms_root = path.resolve(__dirname, '../../react-native-hms');

const modules = Object.keys({
  ...root_pak.peerDependencies,
  ...rnhms_root_pak.peerDependencies,
});

module.exports = {
  projectRoot: __dirname,
  watchFolders: [root, rnhms_root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we blacklist them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blacklistRE: blacklist(
      ['@100mslive/react-native-hms', ...modules].map(
        m => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`),
      ),
    ),

    extraNodeModules: modules.reduce((acc, name) => {
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
