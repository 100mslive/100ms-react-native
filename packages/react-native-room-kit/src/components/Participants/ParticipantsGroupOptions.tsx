import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { useHMSRoomStyleSheet } from '../../hooks-util';
import { HandIcon } from '../../Icons';
import { ParticipantsItemOption } from './ParticipantsItemOption';

interface ParticipantsGroupOptionsProps {
  // data: any;
}

const _ParticipantsGroupOptions: React.FC<
  ParticipantsGroupOptionsProps
> = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    divider: {
      backgroundColor: theme.palette.border_bright,
    },
  }));

  const handleBringOnStagePress = () => {};

  const handleLowerHandPress = () => {};

  const handleRemoveParticipantPress = () => {};

  return (
    <>
      {[
        {
          id: 'bring-on-stage',
          icon: <HandIcon style={{ width: 20, height: 20 }} />,
          label: 'Bring on Stage',
          pressHandler: handleBringOnStagePress,
          isActive: false,
          hide: false,
        },
        {
          id: 'lower-hand',
          icon: <HandIcon style={{ width: 20, height: 20 }} />,
          label: 'Lower Hand',
          pressHandler: handleLowerHandPress,
          isActive: false,
          hide: false,
        },
        {
          id: 'remove-participant',
          icon: <HandIcon style={{ width: 20, height: 20 }} />,
          label: 'Remove Participant',
          pressHandler: handleRemoveParticipantPress,
          isActive: false,
          hide: false,
        },
      ].map((item, idx) => {
        const isFirst = idx === 0;

        return (
          <React.Fragment key={item.id}>
            {isFirst ? null : (
              <View style={[styles.divider, hmsRoomStyles.divider]} />
            )}

            <ParticipantsItemOption
              label={item.label}
              onPress={item.pressHandler}
              icon={item.icon}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});

export const ParticipantsGroupOptions = React.memo(_ParticipantsGroupOptions);
