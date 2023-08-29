import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';

import { CustomButton, CustomInput } from '../../components';
import { saveUserData } from '../../redux/actions';
import { getRoomCodeAndUserId } from '../../utils/functions';
import { COLORS } from '../../utils/theme';

export const MeetingSetup = () => {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userName = useSelector((state) => state.user.userName);
  const roomLink = useSelector((state) => state.user.roomLink);

  const [peerName, setPeerName] = useState(userName);
  const [loading, setLoading] = useState(false);

  const setup = async () => {
    try {
      setLoading(true);

      const data = await getRoomCodeAndUserId(roomLink);

      // Saving data into redux store
      dispatch(
        saveUserData({
          userName: peerName,
          roomCode: data.roomCode,
        })
      );

      /**
       * Since, now we have both "room code" and "userId". We can go to Meeting screen to join meeting.
       */
      navigation.replace('MeetingScreen', { roomCode: data.roomCode, userId: data.userId });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error || 'Something went wrong');
    }
  }

  const disableSetupButton = peerName.length <= 0 || loading;

  return (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contentContainerStyle,
          {
            paddingTop: 24 + top,
            paddingLeft: 24 + left,
            paddingRight: 24 + right,
            paddingBottom: 24 + bottom,
          },
        ]}
        style={styles.container}
        keyboardShouldPersistTaps="always"
      >
        <Image
          style={styles.image}
          resizeMode="stretch"
          source={require('../../assets/user_music.png')}
        />
        <View>
          <Text style={styles.heading}>Go live in five!</Text>
          <Text style={styles.description}>
            Let’s get your studio setup ready in less than 5 minutes!
          </Text>
        </View>
        <CustomInput
          value={peerName}
          onChangeText={setPeerName}
          textStyle={styles.userNameInputText}
          viewStyle={styles.userNameInputView}
          inputStyle={styles.userNameInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Enter your name"
          title="Name"
        />
        <CustomButton
          title="Get Started ->"
          onPress={setup}
          disabled={disableSetupButton}
          viewStyle={[styles.startButton, disableSetupButton && styles.disabled]}
          textStyle={[
            styles.startButtonText,
            disableSetupButton && styles.disabledText,
          ]}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
