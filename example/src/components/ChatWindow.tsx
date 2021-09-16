import React, {useState, useEffect, useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import dimension from '../utils/dimension';
import ChatBubble from './ChatBubble';
import {CustomModalDropdown} from '../components/Picker';

const ChatWindow = ({
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

  useEffect(() => {
    scollviewRef?.current?.scrollToEnd({animated: false});
  }, []);

  useEffect(() => {
    scollviewRef?.current?.scrollToEnd({animated: true});
  }, [messages]);
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardAvoidingView}>
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
        <ScrollView ref={scollviewRef} style={styles.chatContainer}>
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
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Enter Message"
            placeholderTextColor="black"
            style={styles.textInput}
            onChangeText={value => {
              setText(value);
            }}
            value={text}
          />
          <TouchableOpacity
            style={styles.sendContainer}
            onPress={() => {
              send(text, messageToList[messageTo]);
              setText('');
            }}>
            <Feather
              size={dimension.viewHeight(24)}
              style={styles.sendIcon}
              name="send"
            />
          </TouchableOpacity>
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
  sendIcon: {},
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
    height: dimension.viewHeight(52),
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
    padding: 8,
  },
  closeIcon: {
    color: '#4578e0',
  },
  closeIconContainer: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
  headingContainer: {
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  },
  subHeading: {
    fontSize: 16,
  },
  picker: {width: '50%'},
});
