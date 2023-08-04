const path = require('path');
const blacklist = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const rnrkLibRoot = path.resolve(__dirname, '..');

const rnrkLibPackageJson = require('../package.json');

const modules = Object.keys({
  ...rnrkLibPackageJson.peerDependencies,
  ...rnrkLibPackageJson.dependencies, // This is temporary as we have duplicate dependencies because of which, native modules tries to register twice
});

module.exports = {
  projectRoot: __dirname,
  watchFolders: [rnrkLibRoot],

  resolver: {
    blockList: blacklist(
      modules.map(
        (m) =>
          new RegExp(
            `^${escape(path.join(rnrkLibRoot, 'node_modules', m))}\\/.*$`
          )
      )
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
