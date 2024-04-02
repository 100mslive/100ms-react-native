import { WaveIcon } from '../Icons';
import React from 'react';
import { PressableIcon } from './PressableIcon';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux';

export const HMSManageNoiseCancellation = () => {
  const noiseCancellationPlugin = useSelector(
    (state: RootState) => state.hmsStates.noiseCancellationPlugin
  );
  const [isNoiseCancellationEnabled, setIsNoiseCancellationEnabled] =
    React.useState(false);

  const handleButtonPress = async () => {
    const isAvailable =
      await noiseCancellationPlugin?.isNoiseCancellationAvailable();

    if (!noiseCancellationPlugin && isAvailable) {
      console.error('Noise Cancellation Plugin not found');
      return;
    }

    if (isNoiseCancellationEnabled) {
      await noiseCancellationPlugin?.disable();
    } else {
      await noiseCancellationPlugin?.enable();
    }
    setIsNoiseCancellationEnabled(!isNoiseCancellationEnabled);
  };

  return (
    <PressableIcon
      style={styles.noiseButton}
      onPress={handleButtonPress}
      active={isNoiseCancellationEnabled}
    >
      <WaveIcon />
    </PressableIcon>
  );
};
