import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DesignHeight = 896;
const DesignWidth = 414;

// It is based on the screen width of your design layouts e.g Height 896 x Width 414

// function normalize(size) {
//   return PixelRatio.roundToNearestPixel(size * scale);
// }

const viewWidth = (width: number) => {
  // Parse string percentage input and convert it to number.
  const percent = (width / DesignWidth) * 100;
  const elemWidth = parseFloat(percent + '%');

  // size (dp) to the nearest one that corresponds to an integer number of pixels.
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

const viewHeight = (height: number) => {
  // Parse string percentage input and convert it to number.
  const percent = (height / DesignHeight) * 100;
  const elemHeight = parseFloat(percent + '%');

  // size (dp) to the nearest one that correspons to an integer number of pixels.
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

export enum Orientation {
  PORTRAIT,
  LANDSCAPE,
}

export const useOrientation = () => {
  const { height, width } = useWindowDimensions();

  return width < height ? Orientation.PORTRAIT : Orientation.LANDSCAPE;
};

export const useIsLandscapeOrientation = () => {
  return useOrientation() === Orientation.LANDSCAPE;
};

export const useIsPortraitOrientation = () => {
  return useOrientation() === Orientation.PORTRAIT;
};

export default {
  screenWidth,
  screenHeight,
  viewHeight,
  viewWidth,
};
