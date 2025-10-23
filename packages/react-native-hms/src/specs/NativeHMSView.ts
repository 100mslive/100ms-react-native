/**
 * This is a Fabric component spec for HMSView (Video Display)
 * It defines the props interface for the native video view component
 */

import type { ViewProps, HostComponent } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  /**
   * Data object containing track and peer information for rendering video
   */
  data?: Readonly<{
    trackId?: string;
    id?: string;
    mirror?: boolean;
  }>;

  /**
   * Enable simulcast layer switching
   */
  autoSimulcast?: boolean;

  /**
   * Scale type for video rendering (ASPECT_FIT, ASPECT_FILL, ASPECT_BALANCED)
   */
  scaleType?: string;
}

export default codegenNativeComponent<NativeProps>(
  'HMSView'
) as HostComponent<NativeProps>;
