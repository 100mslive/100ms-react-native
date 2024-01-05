import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { useHMSRoomColorPalette, useHMSRoomStyleSheet } from '../hooks-util';
import { HMSBaseButton } from './HMSBaseButton';
import type { HMSBaseButtonProps } from './HMSBaseButton';
import { COLORS } from '../utils/theme';

export interface HMSDangerButtonProps {
  title: string;
  loading: boolean;
  onPress(): void;
  testID?: HMSBaseButtonProps['testID'];
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  leftComponent?: React.ReactElement | null;
  wrapWithGestureDetector?: boolean;
}

export const HMSDangerButton: React.FC<HMSDangerButtonProps> = ({
  title,
  loading,
  onPress,
  testID,
  style,
  disabled,
  leftComponent,
  wrapWithGestureDetector,
}) => {
  const {
    alert_error_dim: alertErrorDimColor,
    alert_error_brighter: alertErrorBrighterColor,
  } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.alert_error_default,
    },
    disabledButton: {
      backgroundColor: theme.palette.alert_error_dim,
    },
    buttonText: {
      color: COLORS.WHITE,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    disabledText: {
      color: theme.palette.alert_error_bright,
    },
  }));

  return (
    <HMSBaseButton
      testID={testID}
      loaderColor={alertErrorBrighterColor}
      loading={loading}
      onPress={onPress}
      title={title}
      underlayColor={alertErrorDimColor}
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
