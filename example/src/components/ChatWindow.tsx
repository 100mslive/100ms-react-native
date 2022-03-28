import React, {useState, useEffect, useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import dimension from '../utils/dimension';
import {ChatBubble} from './ChatBubble';
import {CustomModalDropdown} from './Picker';

export const ChatWindow = ({
  messages,
  cancel,
  send,
  messageToList,
}: {
  messages: any;
  cancel: ((event: GestureResponderEvent) => void) | undefined;
  send: Function;
  messageToList: Array<any>;
}) => {
  const [text, setText] = useState('');
  const [messageTo, setMessageTo] = useState(0);
  const scollviewRef = useRef<ScrollView>(null);
  const {top, bottom} = useSafeAreaInsets();

  useEffect(() => {
    scollviewRef?.current?.scrollToEnd({animated: false});
  }, []);

  useEffect(() => {
    scollviewRef?.current?.scrollToEnd({animated: true});
  }, [messages]);
  return (
    <View style={styles.container}>
      <View style={[styles.keyboardAvoidingView, {paddingTop: top}]}>
        <View style={styles.headingContainer}>
          <Feather
            name="message-circle"
            style={styles.closeIcon}
            size={dimension.viewHeight(30)}
          />
          <Text style={styles.heading}>Chat</Text>
          <TouchableOpacity
            style={[styles.closeIconContainer]}
            onPress={cancel}>
            <Feather
              size={dimension.viewHeight(32)}
              style={styles.closeIcon}
              name="x"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.subHeadingContainer}>
          <Text style={styles.subHeading}>Send Message to</Text>
          <CustomModalDropdown
            selectedItem={messageTo}
            onItemSelected={setMessageTo}
            data={messageToList}
          />
        </View>
        <ScrollView
          ref={scollviewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.contentContainerStyle}>
          {messages.map((item: any, index: number) => {
            return (
              <ChatBubble
                key={index.toString()}
                data={item.data}
                isLocal={item.isLocal}
                name={item?.name}
              />
            );
          })}
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.textInputContainer, {marginBottom: bottom}]}>
          <View style={styles.flex}>
            <TextInput
              placeholder="Enter Message"
              placeholderTextColor="black"
              style={styles.textInput}
              onChangeText={value => {
                setText(value);
              }}
              value={text}
            />
          </View>
          <TouchableOpacity
            style={styles.sendContainer}
            onPress={() => {
              send(text, messageToList[messageTo]);
              setText('');
            }}>
            <Feather size={dimension.viewHeight(24)} name="send" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34, 34, 34, 0.3)',
    justifyContent: 'center',
    zIndex: 1,
  },
  flex: {
    flex: 1,
  },
  keyboardAvoidingView: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  contentContainerStyle: {
    paddingBottom: 8,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: dimension.viewWidth(24),
    borderTopWidth: 2,
    borderTopColor: 'lightgrey',
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey',
  },
  textContainer: {
    marginVertical: dimension.viewHeight(12),
    backgroundColor: '#67ed99',
    paddingHorizontal: 12,
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
    paddingHorizontal: dimension.viewWidth(16),
    flex: 1,
    color: 'black',
  },
  textInputContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    paddingTop: 10,
    paddingHorizontal: dimension.viewWidth(24),
  },
  sendContainer: {
    padding: 8,
  },
  closeIcon: {
    color: '#4578e0',
  },
  closeIconContainer: {
    position: 'absolute',
    right: 20,
    padding: 10,
  },
  headingContainer: {
    paddingTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: dimension.viewWidth(24),
  },
  heading: {
    fontSize: 20,
    paddingLeft: 10,
  },
  subHeadingContainer: {
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: dimension.viewWidth(24),
  },
  subHeading: {
    fontSize: 16,
  },
  picker: {width: '50%'},
});
