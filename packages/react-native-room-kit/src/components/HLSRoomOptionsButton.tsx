import * as React from 'react';
import { View } from 'react-native';

import { useCanShowRoomOptionsButton } from '../hooks-util';
import { HMSRoomOptions } from './HMSRoomOptions';

export const HLSRoomOptionsButton = () => {
  const canShowOptions = useCanShowRoomOptionsButton();

  if (!canShowOptions) {
    return null;
  }

  return (
    <View style={{ marginLeft: 12 }}>
      <HMSRoomOptions />
    </View>
  );
};
