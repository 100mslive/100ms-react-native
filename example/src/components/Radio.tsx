import React from 'react';
import {View, StyleSheet} from 'react-native';

function RadioButton(props: any) {
  return (
    <View style={styles.container}>
      {props.selected ? <View style={styles.radio} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: '#000',
  },
});

export default RadioButton;
