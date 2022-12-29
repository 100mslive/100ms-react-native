import { Platform, Dimensions, Permission, StatusBar } from 'react-native';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';

import * as services from '../services/index';

export const getMeetingUrl = () =>
  'https://jatinnagar-jatin.app.100ms.live/streaming/meeting/mki-scw-wnw' // Broadcaster
  // 'https://jatinnagar-jatin.app.100ms.live/streaming/meeting/zrx-mkc-kpw' // Hls-Viewer

export const getMeetingCode = () => 'nih-bkn-vek';

export const getInitials = (name?: String): String => {
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

export const callService = async (
  userID: string,
  roomLink: string,
) => {
  let roomCode;
  let subdomain;
  let response;
  if (validateUrl(roomLink)) {
    const {code, domain} = getRoomLinkDetails(roomLink);
    roomCode = code;
    subdomain = domain;

    if (!code || !domain) {
      return Promise.reject('code, domain not found');
    }

    response = await services.fetchTokenFromLink({
      code,
      subdomain,
      userID,
    });
  } else {
    response = await services.fetchToken({
      userID,
      roomID: roomLink,
    });
  }

  if (response?.error || !response?.token) {
    return Promise.reject(response?.msg);
  }

  const permissions = await checkPermissions([
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
  ]);

  if (!permissions) {
    return Promise.reject('permission not granted');
  }

  return {
    token: response?.token,
    userID: userID,
    roomCode: roomCode,
    endpoint: subdomain && subdomain.search('.qa-') >= 0
      ? 'https://qa-init.100ms.live/init'
      : undefined,
  };
};

export const checkPermissions = async (
  permissions: Array<Permission>,
): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }
  return await requestMultiple(permissions)
    .then(results => {
      let allPermissionsGranted = true;
      for (let permission in permissions) {
        if (!(results[permissions[permission]] === RESULTS.GRANTED)) {
          allPermissionsGranted = false;
        }
        console.log(
          permissions[permission],
          ':',
          results[permissions[permission]],
        );
      }
      return allPermissionsGranted;
    })
    .catch(error => {
      console.log(error);
      return false;
    });
};

export const getRoomLinkDetails = (
  roomLink: string,
): {code: string; domain: string} => {
  const codeObject = RegExp(/(?!\/)[a-zA-Z\-0-9]*$/g).exec(roomLink);

  const domainObject = RegExp(/(https:\/\/)?(?:[a-zA-Z0-9.-])+(?!\\)/).exec(
    roomLink,
  );

  let code = '';
  let domain = '';

  if (codeObject && domainObject) {
    code = codeObject[0];
    domain = domainObject[0];
    domain = domain.replace('https://', '');
  }

  return {
    code,
    domain,
  };
};

export const validateUrl = (url?: string): boolean => {
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
