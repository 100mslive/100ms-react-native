/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
// import './fcm-background.service';

// Check if app was launched in the background and conditionally render null if so
const HeadlessCheck = ({isHeadless, ...restProps}) => {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return <App {...restProps} />;
};

AppRegistry.registerComponent(appName, () => HeadlessCheck);

AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () =>
    ({name, callUUID, handle}) => {
      // Make your call here

      console.log(
        '`RNCallKeepBackgroundMessage` task called',
        name,
        callUUID,
        handle,
      );
      return Promise.resolve();
    },
);
