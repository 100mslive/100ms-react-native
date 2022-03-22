import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import dimension from '../utils/dimension';

export const ChatBubble = ({
  data,
  isLocal,
  name,
}: {
  data: any;
  isLocal: boolean;
  name: string;
}) => {
  return (
    <View style={isLocal ? styles.senderMessageBubble : styles.messageBubble}>
      <View style={styles.textContainer}>
        <View style={styles.textSubContainer}>
          <Text style={isLocal ? styles.senderText : styles.receiverText}>
            {isLocal ? 'You' : data.sender}
          </Text>
          {name && <Text style={styles.text}>{' to ' + name}</Text>}
        </View>
        <Text style={[styles.message, isLocal && styles.data]}>
          {data.message}
        </Text>
      </View>
    </View>
  );
};

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
  textSubContainer: {
    flexDirection: 'row',
  },
  text: {
    color: 'white',
  },
  data: {
    textAlign: 'right',
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
