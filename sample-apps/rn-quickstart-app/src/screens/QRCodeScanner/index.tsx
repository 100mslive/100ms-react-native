import React from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BarCodeReadEvent, RNCamera} from 'react-native-camera';
import QRScanner from 'react-native-qrcode-scanner';
import {useDispatch} from 'react-redux';

import type {AppStackParamList} from '../../navigator';
import {styles} from './styles';
import {CustomButton} from '../../components';
import {saveUserData} from '../../redux/actions';
import {validateUrl} from '../../utils/functions';

type QRCodeScannerScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'QRCodeScannerScreen'
>;

const QRCodeScanner = () => {
  const dispatch = useDispatch();
  const {top, bottom, left, right} = useSafeAreaInsets();
  const navigation = useNavigation<QRCodeScannerScreenProp>();

  const handleScanSuccess = (e: BarCodeReadEvent) => {
    const joiningLink = e.data;

    const isJoiningLinkValid = validateUrl(joiningLink);

    // If Joining Link is not valid, go back to previous screen and alert user
    if (!isJoiningLinkValid) {
      navigation.goBack();
      Alert.alert('Error', 'Invalid URL');
      return;
    }

    // Saving scanned Joining Link to use it in MeetingSetup screen
    dispatch(
      saveUserData({
        roomLink: joiningLink.replace('meeting', 'preview'),
      }),
    );

    navigation.navigate('MeetingSetupScreen');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 24 + top,
          paddingLeft: 24 + left,
          paddingRight: 24 + right,
          paddingBottom: 24 + bottom,
        },
      ]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={navigation.goBack}>
          <Ionicons size={24} style={styles.headerIcon} name="chevron-back" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan QR Code</Text>
      </View>
      <QRScanner
        onRead={handleScanSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
      />
      <CustomButton
        title="Join with Link Instead"
        onPress={navigation.goBack}
        viewStyle={styles.joinWithLink}
        textStyle={styles.joinWithLinkText}
        LeftIcon={
          <Ionicons size={24} style={styles.joinWithLinkIcon} name="link" />
        }
      />
    </View>
  );
};

export {QRCodeScanner};
