import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

export enum LiveStates {
  LIVE = 10,
  BEHIND_LIVE = 20,
  LOADING_LIVE = 30,
}

export interface LiveButtonProps {
  containerStyle?: ViewStyle;
  isLive: boolean;
  onPress(): void;
  disabled?: boolean;
}

const LiveButton: React.FC<LiveButtonProps> = ({
  containerStyle,
  isLive,
  onPress,
  disabled,
}) => {
  return (
    <View style={containerStyle}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.touchable}
        disabled={disabled}>
        <View
          style={[
            styles.liveIndicator,
            {backgroundColor: isLive ? 'red' : 'gray'},
          ]}
        />
        <Text style={styles.liveText}>LIVE</Text>
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
