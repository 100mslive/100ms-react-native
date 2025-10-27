const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  projectRoot: __dirname,
  watchFolders: [
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '../../react-native-hms'),
    path.resolve(__dirname, '../../../../react-native-video-plugin'),
  ],

  resolver: {
    // Block ALL node_modules from parent packages to prevent duplicate instances
    // Only use dependencies from example/node_modules
    blockList: [
      /.*\/react-native-room-kit\/node_modules\/.*/,
      /.*\/react-native-hms\/node_modules\/.*/,
      /.*\/react-native-video-plugin\/node_modules\/.*/,
    ],

    // Ensure all packages use dependencies from example/node_modules
    // This is critical for monorepo setup to prevent Metro from searching in parent node_modules
    extraNodeModules: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      '@100mslive/react-native-hms': path.resolve(
        __dirname,
        'node_modules/@100mslive/react-native-hms'
      ),
      '@100mslive/react-native-video-plugin': path.resolve(
        __dirname,
        'node_modules/@100mslive/react-native-video-plugin'
      ),
      '@100mslive/types-prebuilt': path.resolve(
        __dirname,
        'node_modules/@100mslive/types-prebuilt'
      ),
      '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
      '@react-native-community/blur': path.resolve(
        __dirname,
        'node_modules/@react-native-community/blur'
      ),
      '@react-native-masked-view/masked-view': path.resolve(
        __dirname,
        'node_modules/@react-native-masked-view/masked-view'
      ),
      '@react-navigation/native': path.resolve(
        __dirname,
        'node_modules/@react-navigation/native'
      ),
      '@shopify/flash-list': path.resolve(
        __dirname,
        'node_modules/@shopify/flash-list'
      ),
      'lottie-react-native': path.resolve(
        __dirname,
        'node_modules/lottie-react-native'
      ),
      'react-native-gesture-handler': path.resolve(
        __dirname,
        'node_modules/react-native-gesture-handler'
      ),
      'react-native-linear-gradient': path.resolve(
        __dirname,
        'node_modules/react-native-linear-gradient'
      ),
      'react-native-modal': path.resolve(
        __dirname,
        'node_modules/react-native-modal'
      ),
      'react-native-reanimated': path.resolve(
        __dirname,
        'node_modules/react-native-reanimated'
      ),
      'react-native-safe-area-context': path.resolve(
        __dirname,
        'node_modules/react-native-safe-area-context'
      ),
      'react-native-simple-toast': path.resolve(
        __dirname,
        'node_modules/react-native-simple-toast'
      ),
      'react-native-webview': path.resolve(
        __dirname,
        'node_modules/react-native-webview'
      ),
      'react-redux': path.resolve(__dirname, 'node_modules/react-redux'),
      'redux': path.resolve(__dirname, 'node_modules/redux'),
      'zustand': path.resolve(__dirname, 'node_modules/zustand'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
