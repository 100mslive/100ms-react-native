import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { useCanPublishScreen, useHMSActions } from '../hooks-sdk';
import { PressableIcon } from './PressableIcon';
import { ScreenShareIcon } from '../Icons';

interface HMSShareScreenProps extends ScreenShareButtonProps {}

export const HMSShareScreen: React.FC<HMSShareScreenProps> = ({
  screenShareDelegate,
}) => {
  const canPublishScreen = useCanPublishScreen();

  if (!canPublishScreen) {
    return null;
  }

  return <ScreenShareButton screenShareDelegate={screenShareDelegate} />;
};

interface ScreenShareButtonProps {
  screenShareDelegate?: React.ReactElement;
}

const ScreenShareButton: React.FC<ScreenShareButtonProps> = ({
  screenShareDelegate = <DefaultScreenShareButtonDelegate />,
}) => {
  const hmsActions = useHMSActions();

  const isLocalScreenShared = useSelector(
    (state: RootState) => state.hmsStates.isLocalScreenShared
  );

  const handleScreenShareTogglePress = async () => {
    await hmsActions.setScreenShareEnabled(!isLocalScreenShared);
  };

  return React.cloneElement(screenShareDelegate, {
    onPress: handleScreenShareTogglePress,
    isLocalScreenShared,
  });
};

interface DefaultScreenShareButtonDelegateProps {
  onPress?: () => void;
  isLocalScreenShared?: boolean;
}

const DefaultScreenShareButtonDelegate: React.FC<
  DefaultScreenShareButtonDelegateProps
> = ({ onPress, isLocalScreenShared }) => {
  return (
    <PressableIcon
      onPress={onPress}
      style={isLocalScreenShared ? styles.mutedButton : undefined}
    >
      <ScreenShareIcon />
    </PressableIcon>
  );
};

const styles = StyleSheet.create({
  mutedButton: {
    backgroundColor: COLORS.SECONDARY.DIM,
    borderColor: COLORS.SECONDARY.DIM,
  },
});
