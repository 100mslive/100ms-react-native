import React from 'react';
import {View} from 'react-native';
import {Picker} from '@react-native-picker/picker';

export const RolePicker = ({
  selectedItem,
  data,
  onItemSelected,
}: {
  selectedItem: any;
  data: Array<any>;
  onItemSelected: any;
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
        dropdownIconColor="black"
        dropdownIconRippleColor="grey">
        {data.map((item, index) => (
          <Picker.Item key={index} label={item.name} value={item?.name} />
        ))}
      </Picker>
    </View>
  );
};
