import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { useHMSRoomColorPalette, useHMSRoomStyleSheet } from '../hooks-util';
import { HMSBaseButton } from './HMSBaseButton';
import type { HMSBaseButtonProps } from './HMSBaseButton';

export interface HMSPrimaryButtonProps {
  title: string;
  loading: boolean;
  onPress(e: any): void;
  testId?: HMSBaseButtonProps['testID'];
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  leftComponent?: React.ReactElement | null;
  wrapWithGestureDetector?: boolean;
}

export const HMSPrimaryButton: React.FC<HMSPrimaryButtonProps> = ({
  title,
  loading,
  onPress,
  testId,
  style,
  disabled,
  leftComponent,
  wrapWithGestureDetector,
}) => {
  const { primary_dim: primaryDarkColor, on_primary_high: onPrimaryHighColor } =
    useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.primary_default,
    },
    disabledButton: {
      backgroundColor: theme.palette.primary_disabled,
    },
    buttonText: {
      color: theme.palette.on_primary_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    disabledText: {
      color: theme.palette.on_primary_low,
    },
  }));

  return (
    <HMSBaseButton
      testID={testId}
      loaderColor={onPrimaryHighColor}
      loading={loading}
      onPress={onPress}
      title={title}
      underlayColor={primaryDarkColor}
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
