import { Image } from 'react-native';
import type {
  ImageRequireSource,
  ImageResolvedAssetSource,
  ImageURISource,
} from 'react-native';

import { HMSVideoPlugin } from './HMSVideoPlugin';

export class HMSVirtualBackgroundPlugin extends HMSVideoPlugin {
  static NAME = 'HMSVirtualBackgroundPlugin';

  constructor() {
    super(HMSVirtualBackgroundPlugin.NAME);
  }

  /**
   * Sets Blur as background
   * @returns {Promise<boolean>} A promise that resolves to true when blur effect has been applied as background, otherwise, rejected promise is returned
   */
  setBlur(blurRadius: number): Promise<boolean> {
    const data = {
      id: '12345',
      background: { type: 'blur', blurRadius },
    };
    return this.nativeModule.changeVirtualBackground(data);
  }

  /**
   * Sets provided image as background
   * @param backgroundImage An image to apply as background on
   * @returns {Promise<boolean>} A promise that resolves to true when provided background image has been applied as background, otherwise, rejected promise is returned
   *
   * Example Usage:
   * ```
   * // Create instance of `HMSVirtualBackgroundPlugin` class
   * const hmsVirtualBackgroundPlugin = HMSVirtualBackgroundPlugin();
   * ...
   * // In ON_PREVIEW or ON_JOIN event callback method
   * const image = require('path to image file');
   * hmsVirtualBackgroundPlugin.setBackground(image);
   *
   *
   * ```
   */
  setBackground(
    backgroundImage: ImageURISource | ImageRequireSource
  ): Promise<boolean> {
    const background = resolveBackground(backgroundImage);
    const data = {
      id: '12345',
      background,
    };
    return this.nativeModule.changeVirtualBackground(data);
  }
}

function resolveBackground(background: ImageURISource | ImageRequireSource): {
  type: 'image';
  source: ImageResolvedAssetSource;
} {
  return {
    type: 'image',
    source: Image.resolveAssetSource(background),
  };
}
