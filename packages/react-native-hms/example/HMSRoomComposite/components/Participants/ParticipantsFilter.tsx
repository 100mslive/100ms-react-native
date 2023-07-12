import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Menu, MenuItem, MenuDivider} from '../MenuModal';
import {COLORS} from '../../utils/theme';
import type {RootState} from '../../redux';
import {Platform} from 'react-native';

export const ParticipantFilter = ({
  filter,
  setFilter,
}: {
  filter?: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const roles = useSelector((state: RootState) => state.hmsStates.roles);

  const [visible, setVisible] = React.useState(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  return (
    <Menu
      visible={visible}
      anchor={
        <TouchableOpacity
          style={styles.participantFilterContainer}
          onPress={showMenu}
        >
          <Text style={styles.participantFilterText} numberOfLines={1}>
            {filter}
          </Text>
          <MaterialIcons
            name={visible ? 'arrow-drop-up' : 'arrow-drop-down'}
            style={styles.participantFilterIcon}
            size={24}
          />
        </TouchableOpacity>
      }
      onRequestClose={hideMenu}
      style={styles.participantsMenuContainer}
    >
      <MenuItem
        onPress={() => {
          hideMenu();
          setFilter('everyone');
        }}
      >
        <View style={styles.participantMenuItem}>
          <Ionicons
            name="people-outline"
            style={styles.participantMenuItemIcon}
            size={20}
          />
          <Text style={styles.participantMenuItemName}>Everyone</Text>
        </View>
      </MenuItem>
      <MenuItem
        onPress={() => {
          hideMenu();
          setFilter('raised hand');
        }}
      >
        <View style={styles.participantMenuItem}>
          <Ionicons
            name="hand-left-outline"
            style={styles.participantMenuItemIcon}
            size={20}
          />
          <Text style={styles.participantMenuItemName}>Raised Hand</Text>
        </View>
      </MenuItem>
      <MenuDivider color={COLORS.BORDER.LIGHT} />
      {roles?.map((knownRole: any) => {
        return (
          <MenuItem
            onPress={() => {
              hideMenu();
              setFilter(knownRole?.name!);
            }}
            key={knownRole.name}
          >
            <View style={styles.participantMenuItem}>
              <Text style={styles.participantMenuItemName}>
                {knownRole?.name}
              </Text>
            </View>
          </MenuItem>
        );
      })}
    </Menu>
  );
};

const styles = StyleSheet.create({
  participantFilterContainer: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: COLORS.BORDER.LIGHT,
    borderRadius: 8,
  },
  participantFilterText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginRight: 12,
    textTransform: 'capitalize',
  },
  participantFilterIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    position: 'absolute',
    right: 0,
  },
  participantsMenuContainer: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  participantMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Platform.OS === 'ios' ? 16 : 0,
  },
  participantMenuItemIcon: {
    color: COLORS.WHITE,
    paddingRight: 16,
    height: 24,
  },
  participantMenuItemName: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
});
