import React, {useState} from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Menu, MenuItem} from './MenuModal';
import {COLORS} from '../utils/theme';

export const CustomPicker = ({
  data,
  selectedItem,
  onItemSelected,
  viewStyle,
}: {
  data: any[];
  selectedItem: any;
  onItemSelected: React.Dispatch<React.SetStateAction<any>>;
  viewStyle?: StyleProp<ViewStyle>;
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  return (
    <Menu
      visible={visible}
      anchor={
        <TouchableOpacity
          style={[styles.chatFilterContainer, viewStyle]}
          onPress={showMenu}
        >
          <Text style={styles.chatFilterText} numberOfLines={1}>
            {selectedItem}
          </Text>
          <MaterialIcons
            name={visible ? 'arrow-drop-up' : 'arrow-drop-down'}
            style={styles.chatFilterIcon}
            size={24}
          />
        </TouchableOpacity>
      }
      onRequestClose={hideMenu}
      style={styles.chatMenuContainer}
    >
      {data?.map(value => {
        return (
          <MenuItem
            onPress={() => {
              hideMenu();
              onItemSelected(value);
            }}
            key={value}
          >
            <View style={styles.chatMenuItem}>
              <Text style={styles.chatMenuItemName}>{value}</Text>
            </View>
          </MenuItem>
        );
      })}
    </Menu>
  );
};

const styles = StyleSheet.create({
  chatFilterContainer: {
    padding: 8,
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatFilterText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginRight: 12,
    textTransform: 'capitalize',
  },
  chatFilterIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    position: 'absolute',
    right: 0,
  },
  chatMenuContainer: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  chatMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Platform.OS === 'ios' ? 16 : 0,
  },
  chatMenuItemName: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
});
