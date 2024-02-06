import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { useHMSRoomColorPalette, useHMSRoomStyleSheet } from '../hooks-util';
import { HMSBaseButton } from './HMSBaseButton';
import type { HMSBaseButtonProps } from './HMSBaseButton';

export interface HMSPrimaryButtonProps {
  title: string;
  loading: boolean;
  onPress(): void;
  testId?: HMSBaseButtonProps['testID'];
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  leftComponent?: React.ReactElement | null;
  wrapWithGestureDetector?: boolean;
}

export const HMSSecondaryButton: React.FC<HMSPrimaryButtonProps> = ({
  title,
  loading,
  onPress,
  testId,
  style,
  disabled,
  leftComponent,
  wrapWithGestureDetector,
}) => {
  const {
    secondary_dim: secondaryDarkColor,
    on_secondary_high: onSecondaryHighColor,
  } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.secondary_default,
    },
    disabledButton: {
      backgroundColor: theme.palette.secondary_disabled,
    },
    buttonText: {
      color: theme.palette.on_secondary_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    disabledText: {
      color: theme.palette.on_secondary_low,
    },
  }));

  return (
    <HMSBaseButton
      testID={testId}
      loaderColor={onSecondaryHighColor}
      loading={loading}
      onPress={onPress}
      title={title}
      underlayColor={secondaryDarkColor}
      disabled={disabled}
      leftComponent={leftComponent}
      style={[
        hmsRoomStyles.button,
        disabled ? hmsRoomStyles.disabledButton : null,
        style,
      ]}
      textStyle={[
        hmsRoomStyles.buttonText,
        disabled ? hmsRoomStyles.disabledText : null,
      ]}
      wrapWithGestureDetector={wrapWithGestureDetector}
    />
  );
};
