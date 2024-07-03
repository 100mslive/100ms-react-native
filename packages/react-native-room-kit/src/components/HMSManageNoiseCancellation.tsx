import { WaveIcon } from '../Icons';
import React from 'react';
import { PressableIcon } from './PressableIcon';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux';
import { useHMSLayoutConfig } from '../hooks-util';

export const HMSManageNoiseCancellation = () => {
  const noiseCancellationPlugin = useSelector(
    (state: RootState) => state.hmsStates.noiseCancellationPlugin
  );
  const [isNoiseCancellationEnabled, setIsNoiseCancellationEnabled] =
    React.useState(false);

  const enabledByDefault = useHMSLayoutConfig((layoutConfig) => {
    return (
      layoutConfig?.screens?.preview?.default?.elements?.noise_cancellation
        ?.enabled_by_default || false
    );
  });

  React.useEffect(() => {
    if (enabledByDefault) {
      noiseCancellationPlugin?.enable();
      setIsNoiseCancellationEnabled(true);
    }
  }, []);

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
