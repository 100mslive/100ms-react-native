import React from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BarCodeReadEvent, RNCamera} from 'react-native-camera';
import QRScanner from 'react-native-qrcode-scanner';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-simple-toast';

import type {AppStackParamList} from '../../navigator';
import {styles} from './styles';
import {CustomButton} from '../../components';
import {setRoomID} from '../../redux/actions';
import {validateUrl} from '../../utils/functions';

type WelcomeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'WelcomeScreen'
>;

const QRCodeScanner = () => {
  const goBack = useNavigation<WelcomeScreenProp>().goBack;
  const dispatch = useDispatch();
  const {top, bottom, left, right} = useSafeAreaInsets();

  const onScanSuccess = (e: BarCodeReadEvent) => {
    const joiningLink = e.data.replace('meeting', 'preview');

    if (validateUrl(joiningLink) && joiningLink.includes('app.100ms.live/')) {
      dispatch(setRoomID(joiningLink));
      Toast.showWithGravity('Joining Link Updated!', Toast.LONG, Toast.TOP);
    } else {
      Alert.alert('Error', 'Invalid URL');
    }

    goBack();
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
      ]}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={goBack}>
          <Ionicons size={24} style={styles.headerIcon} name="chevron-back" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan QR Code</Text>
      </View>
      <QRScanner
        onRead={onScanSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
      />
      <CustomButton
        title="Join with Link Instead"
        onPress={goBack}
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
