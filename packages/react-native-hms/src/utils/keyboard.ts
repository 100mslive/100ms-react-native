import { Platform } from 'react-native';
import HMSManager from '../modules/HMSManagerModule';

export enum SoftInputModes {
  SOFT_INPUT_ADJUST_NOTHING = 48,
  SOFT_INPUT_ADJUST_PAN = 32,
  SOFT_INPUT_ADJUST_RESIZE = 16,
  SOFT_INPUT_ADJUST_UNSPECIFIED = 0,
}

/**
 * [Android Only] Sets the `windowSoftInputMode` value for the current activity
 * @param inputMode window softinput moede to use. It can be any variant of the {@link SoftInputModes} enum
 */
export function setSoftInputMode(inputMode: SoftInputModes) {
  if (Platform.OS === 'android') {
    const result = HMSManager.setSoftInputMode(inputMode);
    if (result === -1) {
      throw new Error("Couln't get AppContext, Activity or Window!");
    }
  }
}

/**
 * [Android Only] Gets the current `windowSoftInputMode` value of the current activity
 * @returns current `windowSoftInputMode` ({@link SoftInputModes}) value of the current activity
 */
export function getSoftInputMode(): SoftInputModes {
  if (Platform.OS === 'android') {
    const result = HMSManager.getSoftInputMode();
    if (result === -1) {
      throw new Error("Couln't get AppContext, Activity or Window!");
    }
    return result;
  }
  return SoftInputModes.SOFT_INPUT_ADJUST_UNSPECIFIED;
}
