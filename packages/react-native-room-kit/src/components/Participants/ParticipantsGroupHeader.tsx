import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useHMSRoomStyleSheet } from '../../hooks-util';
import type {
  ListItemUI,
  ParticipantHandRaisedHeaderData,
  ParticipantHeaderData,
} from '../../hooks-util';
import { ChevronIcon, ThreeDotsIcon } from '../../Icons';
import { Menu } from '../MenuModal';
import { ParticipantsGroupOptions } from './ParticipantsGroupOptions';

interface ParticipantsGroupHeaderProps {
  data: ListItemUI<ParticipantHeaderData | ParticipantHandRaisedHeaderData>;
  setExpandedGroups: React.Dispatch<React.SetStateAction<string[]>>;
}

const _ParticipantsGroupHeader: React.FC<ParticipantsGroupHeaderProps> = ({
  data,
  setExpandedGroups,
}) => {
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

  const showOptions = () => setOptionsVisible(true);

  const hideOptions = () => setOptionsVisible(false);

  const hide3Dots = true;

  const expanded = data.type === 'EXPANDED_HEADER';

  const toggleGroupExpand = () => {
    const groupName = data.key;

    setExpandedGroups((expandedGroups) => {
      if (expandedGroups.includes(groupName)) {
        return expandedGroups.filter((group) => group !== groupName);
      }
      return [...expandedGroups, groupName];
    });
  };

  return (
    <View
      style={[
        styles.container,
        expanded ? styles.expandedContainer : null,
        hmsRoomStyles.container,
      ]}
    >
      <Text style={[styles.label, hmsRoomStyles.label]}>{data.data.label}</Text>

      <View style={styles.controls}>
        {hide3Dots ? null : (
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
            <ParticipantsGroupOptions data={data} />
          </Menu>
        )}

        <TouchableOpacity
          style={[styles.control, expanded ? styles.expandedArrowIcon : null]}
          onPress={toggleGroupExpand}
        >
          <ChevronIcon direction="down" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
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
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderRadius: 0,
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
