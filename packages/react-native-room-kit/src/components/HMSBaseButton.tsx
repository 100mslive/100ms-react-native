import * as React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle, TextStyle, ColorValue, TouchableHighlightProps } from 'react-native';

export interface HMSBaseButtonProps {
  title: string;
  loading: boolean;
  onPress(): void;
  testID?: TouchableHighlightProps['testID'];
  underlayColor?: ColorValue | undefined;
  loaderColor?: ColorValue | undefined;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  leftComponent?: React.ReactElement | null;
}

export const HMSBaseButton: React.FC<HMSBaseButtonProps> = ({
  testID,
  underlayColor,
  loaderColor,
  title,
  loading,
  onPress,
  style,
  textStyle,
  disabled,
  leftComponent,
}) => {
  return (
    <TouchableHighlight
      testID={testID}
      underlayColor={underlayColor}
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <>
        {loading ? (
          <ActivityIndicator
            size={'small'}
            color={loaderColor}
            style={styles.loader}
          />
        ) : null}

        <View
          style={[
            styles.buttonContentWrapper,
            loading ? styles.hiddenView : null,
          ]}
        >
          {leftComponent}

          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    marginHorizontal: 8,
  },
  loader: {
    position: 'absolute',
  },
  hiddenView: {
    opacity: 0,
  },
});
