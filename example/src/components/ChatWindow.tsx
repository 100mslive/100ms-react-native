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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import dimension from '../utils/dimension';
import {ChatBubble} from './ChatBubble';
import {CustomModalDropdown} from './Picker';
import {COLORS, FONTS} from '../utils/theme';

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
          <MaterialCommunityIcons
            name="message-outline"
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
              accessible={true}
              accessibilityLabel="messageInput"
              testID="messageInput"
              placeholder="Enter Message"
              placeholderTextColor="#454545"
              style={styles.textInput}
              onChangeText={value => {
                setText(value);
              }}
              value={text}
            />
          </View>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel="sendMessage"
            testID="sendMessage"
            style={styles.sendContainer}
            onPress={() => {
              send(text, messageToList[messageTo]);
              setText('');
            }}>
            <MaterialCommunityIcons
              style={styles.closeIcon}
              size={dimension.viewHeight(28)}
              name="send"
            />
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
    justifyContent: 'center',
    zIndex: 1,
  },
  flex: {
    flex: 1,
  },
  keyboardAvoidingView: {
    backgroundColor: COLORS.WHITE,
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
    borderTopColor: COLORS.BORDER.DEFAULT,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BORDER.DEFAULT,
  },
  textInput: {
    borderColor: COLORS.PRIMARY.DEFAULT,
    borderWidth: 1,
    paddingHorizontal: dimension.viewWidth(16),
    flex: 1,
    color: COLORS.PRIMARY.DEFAULT,
    fontFamily: 'Inter-Regular',
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
    color: COLORS.PRIMARY.DEFAULT,
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
    paddingLeft: 10,
    ...FONTS.H5,
    color: COLORS.PRIMARY.DEFAULT,
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
    fontFamily: 'Inter-Medium',
    color: COLORS.PRIMARY.LIGHT,
  },
  picker: {width: '50%'},
});
