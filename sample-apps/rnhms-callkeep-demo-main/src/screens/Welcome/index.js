import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { version } from 'react-native/package.json';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { version as hmsVersion } from '@100mslive/react-native-hms/package.json';

import { styles } from './styles';

import { validateUrl } from '../../utils/functions';
import { COLORS } from '../../utils/theme';
import {
  CustomButton,
  CustomInput,
  DefaultModal,
  JoinSettingsModalContent,
} from '../../components';
import { saveUserData } from '../../redux/actions';
import { Constants } from '../../utils/types';

export const Welcome = () => {
  const dispatch = useDispatch();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const navigation = useNavigation();
  const roomLink = useSelector((state) => state.user.roomLink);

  const [joinDisabled, setJoinDisabled] = useState(true);
  const [joiningLink, setJoiningLink] = useState(roomLink);
  const [moreModalVisible, setMoreModalVisible] = useState(false);

  const handleJoinPress = () => {
    // Saving entered Joining Link to use it in "Meeting Setup" screen
    dispatch(
      saveUserData({
        roomLink: joiningLink.replace('meeting', 'preview'),
      }),
    );

    navigation.navigate('MeetingSetupScreen');
  };

  const openJoinConfigModal = () => setMoreModalVisible(true);

  const closeJoinConfigModal = () => setMoreModalVisible(false);

  const goToQRCodeScannerScreen = () => navigation.navigate('QRCodeScannerScreen');

  // Validate entered "Joining Link" on change
  useEffect(() => {
    const isJoiningLinkValid = validateUrl(joiningLink);

    // If Joining Link is invalid, Disable "Join Button"
    setJoinDisabled(!isJoiningLinkValid);
  }, [joiningLink]);

  // Using last saved Meeting URL, Whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(Constants.MEET_URL, (_error, url) => {
        if (url) {
          setJoiningLink(url);
        }
      });
    }, []),
  );

  return (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.container}
    >
      <StatusBar barStyle={"light-content"} />
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
          source={require('../../assets/illustration.png')}
        />
        <View>
          <Text style={styles.heading}>Experience the power of 100ms</Text>
          <Text style={styles.description}>
            Jump right in by pasting a room link or scanning a QR code
          </Text>
          <Text style={[styles.description, {color: COLORS.TWIN.ORANGE}]}>
            RN Version: {version}
          </Text>
          <Text style={[styles.description, {color: COLORS.TWIN.ORANGE}]}>
            RN HMS Version: {hmsVersion}
          </Text>
        </View>
        <View style={styles.joiningLinkInputView}>
          <Text style={styles.joiningLinkInputText}>Joining Link</Text>
        </View>
        <CustomInput
          value={joiningLink}
          onChangeText={setJoiningLink}
          inputStyle={styles.joiningLinkInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Paste the link here"
          multiline
          blurOnSubmit
        />
        <View style={{ flexDirection: 'row' }}>
          <CustomButton
            title="Join Now"
            onPress={handleJoinPress}
            disabled={joinDisabled}
            viewStyle={[styles.joinButton, joinDisabled && styles.disabled]}
            textStyle={[
              styles.joinButtonText,
              joinDisabled && styles.disabledText,
            ]}
          />
          <CustomButton
            onPress={openJoinConfigModal}
            viewStyle={styles.moreButton}
            RightIcon={
              <MaterialIcons
                name="more-vert"
                style={styles.moreButtonIcon}
                size={24}
              />
            }
          />
        </View>
        <View style={styles.horizontalSeparator} />
        <CustomButton
          title="Scan QR Code"
          onPress={goToQRCodeScannerScreen}
          viewStyle={styles.scanQRButton}
          textStyle={styles.joinButtonText}
          LeftIcon={
            <MaterialCommunityIcons
              name="qrcode"
              style={styles.scanQRButtonIcon}
              size={24}
            />
          }
        />
      </ScrollView>

      <DefaultModal
        modalVisible={moreModalVisible}
        viewStyle={{ height: 500 }}
        setModalVisible={closeJoinConfigModal}
      >
        <JoinSettingsModalContent />
      </DefaultModal>
    </KeyboardAvoidingView>
  );
};
