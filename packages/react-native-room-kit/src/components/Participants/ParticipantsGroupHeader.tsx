import * as React from 'react';
// import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import type { HMSRole } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../../hooks-util';
import type { ParticipantAccordianData } from '../../hooks-util';
import { ChevronIcon, ThreeDotsIcon } from '../../Icons';
import { Menu } from '../MenuModal';
import { ParticipantsGroupOptions } from './ParticipantsGroupOptions';
import { TestIds } from '../../utils/constants';
// import type { RootState } from '../../redux';
// import { isParticipantHostOrBroadcaster } from '../../utils/functions';

interface ParticipantsGroupHeaderProps {
  id: ParticipantAccordianData['id'];
  label: ParticipantAccordianData['label'];
  expanded: boolean;
  onBackPress?: () => void;
  toggleExpanded?: (groupName: string | null) => void;
}

const _ParticipantsGroupHeader: React.FC<ParticipantsGroupHeaderProps> = ({
  id,
  label,
  expanded,
  onBackPress,
  toggleExpanded,
}) => {
  // const selfHostOrBroadcaster = useSelector((state: RootState) => {
  //   const selfRole = state.hmsStates.localPeer?.role;
  //   return selfRole && isParticipantHostOrBroadcaster(selfRole);
  // });

  const [optionsVisible, setOptionsVisible] = React.useState(false);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      borderColor: theme.palette.border_bright,
    },
    label: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    menu: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.border_bright,
    },
  }));

  const show3Dots = false;
  // const show3Dots =
  //   selfHostOrBroadcaster &&
  //   ('role' in data
  //     ? !isParticipantHostOrBroadcaster(data.role)
  //     : data.id === 'hand-raised');

  const showOptions = () => setOptionsVisible(true);

  const hideOptions = () => setOptionsVisible(false);

  const toggleGroupExpand = toggleExpanded
    ? () => {
        toggleExpanded(expanded ? null : id);
      }
    : null;

  return (
    <View
      style={[
        styles.container,
        expanded ? styles.expandedContainer : null,
        hmsRoomStyles.container,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {onBackPress ? (
          <TouchableOpacity
            testID={TestIds.participants_group_back_btn}
            style={{ marginRight: 8 }}
            onPress={onBackPress}
          >
            <ChevronIcon direction="left" />
          </TouchableOpacity>
        ) : null}

        <Text testID={TestIds.participants_group_name} style={[styles.label, hmsRoomStyles.label]}>{label}</Text>
      </View>

      <View style={styles.controls}>
        {show3Dots ? (
          <Menu
            visible={optionsVisible}
            onRequestClose={hideOptions}
            anchor={
              <TouchableOpacity style={styles.control} onPress={showOptions}>
                <ThreeDotsIcon stack="vertical" />
              </TouchableOpacity>
            }
            style={{ ...styles.menu, ...hmsRoomStyles.menu }}
          >
            <ParticipantsGroupOptions />
          </Menu>
        ) : null}

        {toggleGroupExpand ? (
          <TouchableOpacity
            testID={
              expanded
                ? TestIds.participants_group_collapse_btn
                : TestIds.participants_group_expand_btn
            }
            style={[styles.control, expanded ? styles.expandedArrowIcon : null]}
            onPress={toggleGroupExpand}
          >
            <ChevronIcon direction="down" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  expandedContainer: {
    borderBottomWidth: 1,
  },
  controls: {
    flexDirection: 'row',
  },
  control: {
    marginLeft: 16,
  },
  expandedArrowIcon: {
    transform: [{ rotateZ: '180deg' }],
  },
  menu: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
});

export const ParticipantsGroupHeader = React.memo(_ParticipantsGroupHeader);
