import * as React from 'react';
import {StatusBar, Platform} from 'react-native';

import {useShowLandscapeLayout} from '../hooks-util';

type HMSStatusBarProps = {
  hidden?: boolean;
};

export const HMSStatusBar: React.FC<HMSStatusBarProps> = ({hidden}) => {
  const showLandscapeLayout = useShowLandscapeLayout();

  return (
    <StatusBar
      hidden={(Platform.OS === 'ios' && hidden) || showLandscapeLayout} // use `hidden` prop to hide Status bar on iOS
      barStyle={
        Platform.OS === 'android' && hidden ? 'dark-content' : 'default'
      } // hack: use `dark-content` value to make StatusBar look like it's hidden
      animated={true}
    />
  );
};
