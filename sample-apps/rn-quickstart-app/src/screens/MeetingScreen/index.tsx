import React, {useState} from 'react';
import {SafeAreaView} from 'react-native';

import {styles} from './styles';

import {ModalTypes} from '../../utils/types';
import {Header} from './components/Header';
import {Content} from './components/Content';
import {Footer} from './components/Footer';

export const Meeting = () => {
  const [modalVisible, setModalVisible] = useState(ModalTypes.DEFAULT);

  return (
    <SafeAreaView style={styles.container}>
      <Header setModalVisible={setModalVisible} />

      <Content modalVisible={modalVisible} setModalVisible={setModalVisible} />

      <Footer />
    </SafeAreaView>
  );
};
