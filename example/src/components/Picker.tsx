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

export default App;
