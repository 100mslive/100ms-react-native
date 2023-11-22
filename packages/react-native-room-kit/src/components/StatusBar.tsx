import * as React from 'react';
import { StatusBar, Platform } from 'react-native';
import type { StatusBarProps } from 'react-native';

import { useShowLandscapeLayout } from '../hooks-util';

type HMSStatusBarProps = StatusBarProps & {
  hidden?: boolean;
};

export const HMSStatusBar: React.FC<HMSStatusBarProps> = ({ hidden, ...resetProps }) => {
  const showLandscapeLayout = useShowLandscapeLayout();

  return (
    <StatusBar
      {...resetProps}
      hidden={(Platform.OS === 'ios' && hidden) || showLandscapeLayout} // use `hidden` prop to hide Status bar on iOS
      barStyle={
        Platform.OS === 'android' && hidden ? 'dark-content' : resetProps.barStyle
      } // hack: use `dark-content` value to make StatusBar look like it's hidden
      animated={resetProps.animated ?? true}
    />
  );
};
