import React from 'react';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';

export const HLSPlayerEmoticons = () => {
  // const [messages] = React.useState([]);

  return (
    // <View style={{flex:1, backgroundColor: 'pink'}}>
    <Emoticons />
    //   {messages.map(() => {
    //     return (
    //       <Emoticons />
    //     )
    //   })}
    // </View>
  );
};

const Emoticons = () => {
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          justifyContent: 'center',
          alignContent: 'center',
          bottom: 0,
          left: 0,
        },
        { transform: [{ translateX: 100 }, { translateY: -100 }] },
      ]}
    >
      <Text style={{ fontSize: 48, textAlign: 'center' }}>🥳</Text>
      <Text
        style={{
          backgroundColor: 'darkgray',
          padding: 6,
          borderRadius: 4,
          marginTop: 4,
        }}
      >
        Jatin Nagar
      </Text>
    </Animated.View>
  );
};
