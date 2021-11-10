import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import ModalDropdown from 'react-native-modal-dropdown';
import Material from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const CustomPicker = ({
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
      <Picker
        selectedValue={selectedItem}
        onValueChange={onPress}
        dropdownIconColor="black"
        dropdownIconRippleColor="grey">
        {data.map((item, index) => (
          <Picker.Item key={index} label={item.name} value={item} />
        ))}
      </Picker>
    </View>
  );
};

export const CustomModalDropdown = ({
  selectedItem,
  data,
  onItemSelected,
}: {
  selectedItem: any;
  data: Array<any>;
  onItemSelected: any;
  style?: Object;
}) => {
  const onSelect = (index: string) => {
    onItemSelected(index);
  };
  const modalRef = React.useRef<any>();
  return (
    <View>
      <ModalDropdown
        ref={modalRef}
        defaultValue={data[0]?.name}
        defaultIndex={selectedItem}
        onSelect={onSelect}
        options={data.map(item => item.name)}
        style={styles.modalDropdown}
        textStyle={styles.textStyle}
        dropdownStyle={styles.dropdownStyle}
        dropdownTextStyle={styles.dropdownTextStyle}
        renderRow={(value, index: string) => {
          const type = data[parseInt(index)]?.type;
          return (
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownRowText}>{value}</Text>
              {type === 'everyone' ? (
                <Ionicons
                  size={25}
                  style={styles.dropdownIcons}
                  name="volume-high-outline"
                />
              ) : type === 'group' ? (
                <Material
                  size={25}
                  style={styles.dropdownIcons}
                  name="groups"
                />
              ) : (
                <Ionicons
                  size={25}
                  style={styles.dropdownIcons}
                  name="person-circle-outline"
                />
              )}
            </View>
          );
        }}
      />
      <TouchableOpacity
        style={styles.dropdownArrowContainer}
        onPress={() => modalRef?.current?.show()}>
        <Material
          size={30}
          style={styles.dropdownArrow}
          name="arrow-drop-down"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownArrowContainer: {
    position: 'absolute',
    right: 0,
    top: 10,
  },
  dropdownArrow: {
    color: '#4578e0',
  },
  dropdownIcons: {
    color: 'black',
  },
  modalDropdown: {
    minWidth: 120,
  },
  textStyle: {
    fontSize: 20,
    padding: 10,
    color: '#4578e0',
  },
  dropdownStyle: {
    minWidth: '50%',
    borderRadius: 10,
    elevation: 5,
  },
  dropdownTextStyle: {
    fontSize: 15,
    padding: 10,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  dropdownRowText: {
    padding: 5,
  },
});
