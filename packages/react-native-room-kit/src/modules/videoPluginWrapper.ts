import type { ImageRequireSource, ImageURISource } from 'react-native';

export declare class HMSVideoPlugin {
  protected type: string;
  constructor(pluginType: string);
  protected get nativeModule(): any;
  enable(): Promise<boolean>;
  disable(): Promise<boolean>;
}

export declare class HMSVirtualBackgroundPlugin extends HMSVideoPlugin {
  static NAME: string;
  constructor();
  setBlur(blurRadius: number): Promise<boolean>;
  setBackground(
    backgroundImage: ImageURISource | ImageRequireSource
  ): Promise<boolean>;
}

let VideoPlugin:
  | {
      HMSVirtualBackgroundPlugin: typeof HMSVirtualBackgroundPlugin;
    }
  | undefined;

try {
  VideoPlugin = require('@100mslive/react-native-video-plugin');
} catch (error) {
  VideoPlugin = undefined;
}

export { VideoPlugin };
