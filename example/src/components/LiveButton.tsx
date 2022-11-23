import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  StyleProp,
  TextStyle,
} from 'react-native';

export enum LiveStates {
  LIVE = 10,
  BEHIND_LIVE = 20,
  LOADING_LIVE = 30,
}

export interface LiveButtonProps {
  containerStyle?: StyleProp<ViewStyle>;
  isLive: boolean;
  onPress(): void;
  disabled?: boolean;
  size?: 'normal' | 'small'
}

const LiveButton: React.FC<LiveButtonProps> = ({
  containerStyle,
  isLive,
  onPress,
  disabled,
  size = 'normal'
}) => {
  const textStyle: StyleProp<TextStyle> = size !== 'normal' ? { fontSize: 10 } : null;
  const indicatorStyle: StyleProp<ViewStyle> = size !== 'normal' ? { width: 4, height: 4, borderRadius: 2 } : null;
  const pressableStyle: StyleProp<ViewStyle> = size !== 'normal' ? { padding: 4 } : null;

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.touchable, pressableStyle]}
        disabled={disabled}>
        <View
          style={[
            styles.liveIndicator,
            indicatorStyle,
            {backgroundColor: isLive ? 'red' : 'gray'},
          ]}
        />
        <Text style={[styles.liveText, textStyle]}>LIVE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LiveButton;

const styles = StyleSheet.create({
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  liveText: {
    color: '#fff',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
    marginRight: 4,
  },
});
