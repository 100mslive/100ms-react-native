import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {HMSMessage} from '@100mslive/react-native-hms';

import dimension from '../utils/dimension';

export const ChatBubble = ({
  data,
  isLocal,
  name,
}: {
  data: HMSMessage;
  isLocal: boolean;
  name: string;
}) => {
  return (
    <View>
      <View style={isLocal ? styles.senderMessageBubble : styles.messageBubble}>
        <View style={styles.textContainer}>
          <View style={styles.textSubContainer}>
            <Text style={[styles.senderText, isLocal && styles.data]}>
              {isLocal ? 'You' : data?.sender?.name}
            </Text>
            {name && <Text style={styles.text}>{' to ' + name}</Text>}
          </View>
          <Text style={[styles.message, isLocal && styles.data]}>
            {data.message}
          </Text>
        </View>
      </View>
      <Text style={[styles.message, isLocal && styles.data, styles.time]}>
        {data.time?.getHours() +
          '.' +
          data.time?.getMinutes() +
          '.' +
          data.time?.getSeconds()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    marginTop: dimension.viewHeight(12),
    marginBottom: dimension.viewHeight(4),
    backgroundColor: '#67cd99',
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderRadius: 24,
    maxWidth: '80%',
  },
  textSubContainer: {
    flexDirection: 'row',
  },
  text: {
    color: '#ccffee',
    fontWeight: 'bold',
    fontSize: dimension.viewHeight(16),
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
    fontSize: dimension.viewHeight(20),
    textAlign: 'left',
  },
  senderText: {
    textAlign: 'right',
    color: '#ccffee',
    fontWeight: 'bold',
    fontSize: dimension.viewHeight(16),
  },
  time: {
    fontSize: dimension.viewHeight(12),
    color: 'black',
    paddingHorizontal: 8,
  },
});
