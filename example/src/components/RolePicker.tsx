import React from 'react';
import {ColorValue, StyleProp, StyleSheet, TextStyle, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';

export const RolePicker = ({
  selectedItem,
  data,
  onItemSelected,
  viewStyle,
  itemStyle,
  dropdownIconColor = 'black',
  dropdownIconRippleColor = 'grey',
}: {
  selectedItem: any;
  data: Array<any>;
  onItemSelected: any;
  itemStyle?: StyleProp<TextStyle>;
  viewStyle?: StyleProp<TextStyle>;
  dropdownIconColor?: number | ColorValue;
  dropdownIconRippleColor?: number | ColorValue;
}) => {
  const onPress = (value: any) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].name === value) {
        onItemSelected(data[i]);
        return data[i];
      }
    }
  };
  return (
    <View>
      <Picker
        selectedValue={selectedItem?.name}
        onValueChange={onPress}
        itemStyle={[styles.itemStyle, itemStyle]}
        style={viewStyle}
        dropdownIconColor={dropdownIconColor}
        dropdownIconRippleColor={dropdownIconRippleColor}>
        {data.map((item, index) => (
          <Picker.Item key={index} label={item.name} value={item?.name} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  itemStyle: {
    fontFamily: 'Inter-Regular',
  },
});
