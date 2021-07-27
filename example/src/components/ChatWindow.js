import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Feather from 'react-native-vector-icons/Feather';
import dimension from '../utils/dimension';
import ChatBubble from './ChatBubble';

const ChatWindow = ({ messages, cancel, send }) => {
  const [text, setText] = useState('');
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.closeIconContainer}>
          <Feather
            size={dimension.viewHeight(32)}
            style={styles.closeIcon}
            name="x"
            onPress={cancel}
          />
        </View>
        <ScrollView style={styles.chatContainer}>
          {messages.map((item, index) => {
            return (
              <ChatBubble
                key={index.toString()}
                data={item.data}
                isLocal={item.isLocal}
              />
            );
          })}
        </ScrollView>
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Enter Message"
            placeholderTextColor="black"
            style={styles.textInput}
            onChangeText={(value) => {
              setText(value);
            }}
            value={text}
          />
          <View style={styles.sendContainer}>
            <Feather
              size={dimension.viewHeight(24)}
              style={styles.sendIcon}
              name="send"
              onPress={() => {
                send(text);
                setText('');
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatWindow;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34, 34, 34, 0.3)',
    justifyContent: 'center',
    zIndex: 502,
  },
  keyboardAvoidingView: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    paddingTop: dimension.viewHeight(40),
    paddingHorizontal: dimension.viewWidth(24),
  },
  chatContainer: {
    flex: 1,
  },
  textContainer: {
    marginVertical: dimension.viewHeight(12),
    backgroundColor: '#67ed99',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  },
  textInput: {
    borderColor: 'black',
    borderWidth: 1,
    height: dimension.viewHeight(42),
    marginHorizontal: dimension.viewWidth(16),
    paddingHorizontal: dimension.viewWidth(16),
    flex: 1,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingTop: 10,
  },
  sendContainer: {
    marginRight: dimension.viewWidth(24),
  },
  closeIcon: {
    color: 'black',
  },
  closeIconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
