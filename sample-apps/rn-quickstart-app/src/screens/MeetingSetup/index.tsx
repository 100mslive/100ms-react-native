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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { styles } from './styles';

import { CustomButton, CustomInput } from '../../components';
import { saveUserData } from '../../redux/actions';
import { callService } from '../../utils/functions';
import { COLORS } from '../../utils/theme';
import type { AppStackParamList } from '../../navigator';
import type { RootState } from '../../redux';

type MeetingSetupScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'MeetingSetupScreen'
>;

export const MeetingSetup = () => {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation<MeetingSetupScreenProp>();
  const userName = useSelector((state: RootState) => state.user.userName);
  const roomLink = useSelector((state: RootState) => state.user.roomLink);

  const [peerName, setPeerName] = useState<string>(userName);
  const [loading, setLoading] = useState(false);

  const setup = async () => {
    try {
      setLoading(true);

      /**
       * Extracting "Room Code" from given room link, and
       * getting extra metadata like userId, tokenEndpoint, initEndpoint
       * 
       * @param roomCode Room Code of the 100ms Room
       * @param userId [Optional] - Unique Id for the user to get 100ms Auth Token
       * 
       * For more info about required parameters to join meeting, Check out - 
       * {@link https://www.100ms.live/docs/react-native/v2/guides/quickstart#joining-a-room | Joining a Room}
       * 
       * For more info Token, Check out - 
       * {@link https://www.100ms.live/docs/react-native/v2/foundation/security-and-tokens | Auth & Token Concepts},
       * {@link https://www.100ms.live/docs/react-native/v2/guides/token | Token Quickstart Guide},
       * {@link https://www.100ms.live/docs/react-native/v2/guides/token-endpoint | Token Endpoint Guide}
       */
      const data = await callService(roomLink);

      // Saving data into redux store
      dispatch(
        saveUserData({
          userName: peerName,
          roomCode: data.roomCode,
        })
      );

      /**
       * Since, now we have both "token" and "Username". We can go to Meeting screen to join meeting.
       * We are passing fetched "token" via screen params and we have "username" in redux store.
       */
      navigation.replace('MeetingScreen', { ...data });
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Error',
        (error as string) || 'Something went wrong',
      );
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
