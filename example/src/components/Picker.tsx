import React from 'react';
import {View} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const App = ({
  selectedItem,
  data,
  onItemSelected,
}: {
  selectedItem: any;
  data: Array<any>;
  onItemSelected: any;
}) => {
  const onPress = (value: any) => {
    onItemSelected(value);
  };
  return (
    <View>
      <Picker selectedValue={selectedItem} onValueChange={onPress}>
        {data.map((item, index) => (
          <Picker.Item key={index} label={item.name} value={item.name} />
        ))}
      </Picker>
    </View>
  );
};

export const CustomPicker = ({
  selectedItem,
  data,
  onItemSelected,
  style,
}: {
  selectedItem: any;
  data: Array<any>;
  onItemSelected: any;
  style?: Object;
}) => {
  const onPress = (value: any) => {
    data.map(item => {
      if (item?.name === value) onItemSelected(item);
    });
  };
  return (
    <Picker
      selectedValue={selectedItem?.name}
      onValueChange={onPress}
      style={style}>
      {data.map((item, index) => (
        <Picker.Item key={index} label={item?.name} value={item?.name} />
      ))}
    </Picker>
  );
};

export default App;
