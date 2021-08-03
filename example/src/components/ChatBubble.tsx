import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import dimension from '../utils/dimension';

const ChatBubble = ({data, isLocal}: {data: any; isLocal: boolean}) => {
  return (
    <View style={isLocal ? styles.senderMessageBubble : styles.messageBubble}>
      <View style={styles.textContainer}>
        <Text style={isLocal ? styles.senderText : styles.receiverText}>
          {isLocal ? 'You' : data.sender}
        </Text>
        <Text style={styles.message}>{data.message}</Text>
      </View>
    </View>
  );
};

export default ChatBubble;

const styles = StyleSheet.create({
  textContainer: {
    marginVertical: dimension.viewHeight(6),
    backgroundColor: '#67cd99',
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderTopRightRadius: 30,
    maxWidth: '80%',
  },
  messageBubble: {
    flexDirection: 'row',
  },
  senderMessageBubble: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  message: {
    color: 'white',
    fontSize: dimension.viewHeight(18),
    textAlign: 'left',
  },
  senderText: {
    textAlign: 'right',
    color: '#ccffee',
    fontWeight: 'bold',
  },

  receiverText: {
    color: '#ccffee',
    fontWeight: 'bold',
  },
});
