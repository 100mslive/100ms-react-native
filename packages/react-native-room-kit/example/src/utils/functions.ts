import { Platform } from 'react-native';

import {
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import { getRoomLinkDetails } from './getRoomLinkDetails';

export const getMeetingUrl = () =>
  'https://reactnative.app.100ms.live/meeting/rlk-lsml-aiy';

export const callService = async (
  roomID: string,
  success: Function,
  failure: Function
) => {
  let roomCode;
  let subdomain;
  try {
    if (validateUrl(roomID)) {
      const { roomCode: code, roomDomain: domain } = getRoomLinkDetails(roomID);
      roomCode = code;
      subdomain = domain;

      if (!code || !domain) {
        failure('code, domain not found');
        return;
      }
    } else {
      failure('Invalid room join link');
      return;
    }

    const userId = getRandomUserId(6);
    const isQARoom = subdomain && subdomain.search('.qa-') >= 0;
    success(
      roomCode,
      userId,
      isQARoom
        ? `https://auth-nonprod.100ms.live${Platform.OS === 'ios' ? '/' : ''}`
        : undefined, // Auth Endpoint
      isQARoom ? 'https://qa-init.100ms.live/init' : undefined, // HMSConfig Endpoint
      isQARoom ? 'https://api-nonprod.100ms.live' : undefined // Room Layout endpoint
    );
  } catch (error) {
    console.log(error);
    failure('error in call service');
    return;
  }
};

/**
 * @param min minimum range value
 * @param max maximum range value
 * @returns value between min and max, min is inclusive and max is exclusive
 */
export const getRandomNumberInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const getRandomUserId = (length: number) => {
  return Array.from({ length }, () => {
    const randomAlphaAsciiCode = getRandomNumberInRange(97, 123); // 97 - 122 is the ascii code range for a-z chars
    const alphaCharacter = String.fromCharCode(randomAlphaAsciiCode);
    return alphaCharacter;
  }).join('');
};

export const validateUrl = (url?: string): boolean => {
  if (url) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return pattern.test(url);
  }
  return false;
};

export const checkPermissions = async (
  permissions: Array<
    (typeof PERMISSIONS.ANDROID)[keyof typeof PERMISSIONS.ANDROID]
  >
): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    const requiredPermissions = permissions.filter(
      (permission) =>
        permission.toString() !== PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
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
        results[requiredPermissions[permission]]
      );
    }

    // Bluetooth Connect Permission handling
    if (
      permissions.findIndex(
        (permission) =>
          permission.toString() === PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
      ) >= 0
    ) {
      const bleConnectResult = await request(
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
      );
      console.log(
        `${PERMISSIONS.ANDROID.BLUETOOTH_CONNECT} : ${bleConnectResult}`
      );
    }

    return allPermissionsGranted;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const validateJoiningLink = (url: string) => {
  return url && validateUrl(url) && url.includes('app.100ms.live/');
};
