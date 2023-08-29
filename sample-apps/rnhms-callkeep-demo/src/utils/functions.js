import { Platform } from 'react-native';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';

import * as services from '../services/index';

export const getMeetingUrl = () =>
  'https://yogi.app.100ms.live/streaming/meeting/nih-bkn-vek';

export const getMeetingCode = () => 'nih-bkn-vek';

export const getInitials = (name) => {
  let initials = '';
  if (name) {
    if (name.includes(' ')) {
      const nameArray = name.split(' ');
      if (nameArray[1].length > 0) {
        initials = nameArray[0].substring(0, 1) + nameArray[1].substring(0, 1);
      } else {
        if (nameArray[0].length > 1) {
          initials = nameArray[0].substring(0, 2);
        } else {
          initials = nameArray[0].substring(0, 1);
        }
      }
    } else {
      if (name.length > 1) {
        initials = name.substring(0, 2);
      } else {
        initials = name.substring(0, 1);
      }
    }
  }
  return initials.toUpperCase();
};

export const getRoomCodeAndUserId = async (
  roomLink,
) => {
  if (!validateUrl(roomLink)) {
    return Promise.reject('Invalid room join link');
  }

  const {roomCode, roomDomain: subdomain} = getRoomLinkDetails(roomLink);

  if (!roomCode || !subdomain) {
    return Promise.reject('Room Code, Subdomain not found');
  }

  const permissions = await checkPermissions([
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    // PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  ]);

  if (!permissions) {
    return Promise.reject('permission not granted');
  }

  return {
    roomCode,
    userId: getRandomUserId(6),
  };
};

/**
 * @param min minimum range value
 * @param max maximum range value
 * @returns value between min and max, min is inclusive and max is exclusive
 */
export const getRandomNumberInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const getRandomUserId = (length) => {
  return Array.from({length}, () => {
    const randomAlphaAsciiCode = getRandomNumberInRange(97, 123); // 97 - 122 is the ascii code range for a-z chars
    const alphaCharacter = String.fromCharCode(randomAlphaAsciiCode);
    return alphaCharacter;
  }).join('');
};

export const checkPermissions = async (
  permissions,
) => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    const requiredPermissions = permissions.filter(
      permission =>
        permission.toString() !== PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    );

    const results = await requestMultiple(requiredPermissions);

    let allPermissionsGranted = true;
    for (let permission in requiredPermissions) {
      if (!(results[requiredPermissions[permission]] === RESULTS.GRANTED)) {
        allPermissionsGranted = false;
      }
      console.log(
        requiredPermissions[permission],
        ':',
        results[requiredPermissions[permission]],
      );
    }

    // Bluetooth Connect Permission handling
    if (
      permissions.findIndex(
        permission =>
          permission.toString() === PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      ) >= 0
    ) {
      const bleConnectResult = await request(
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      );
      console.log(
        `${PERMISSIONS.ANDROID.BLUETOOTH_CONNECT} : ${bleConnectResult}`,
      );
    }

    return allPermissionsGranted;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getRoomLinkDetails = (
  roomLink,
) => {
  const codeObject = RegExp(/(?!\/)[a-zA-Z\-0-9]*$/g).exec(roomLink);

  const domainObject = RegExp(/(https:\/\/)?(?:[a-zA-Z0-9.-])+(?!\\)/).exec(
    roomLink,
  );

  let roomCode = '';
  let roomDomain = '';

  if (codeObject && domainObject) {
    roomCode = codeObject[0];
    roomDomain = domainObject[0];
    roomDomain = roomDomain.replace('https://', '');
  }

  return {
    roomCode,
    roomDomain,
  };
};

export const validateUrl = (url) => {
  if (url) {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i',
    );
    return pattern.test(url) && url.includes('app.100ms.live/');
  }
  return false;
};
