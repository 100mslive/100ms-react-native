import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import * as services from './service.js';
import HmssdkViewManager from 'react-native-hmssdk';

const callService = async (userId, roomId, role, setToken) => {
  const response = await services.fetchToken({
    userId,
    roomId,
    role,
  });

  if (response.error) {
    console.log(response.error);
  } else {
    setToken(response.token);
  }
  return response;
};

export default function App() {
  const [userId, setUserId] = React.useState('userHere');
  const [roomId, setRoomId] = React.useState('60c894b331e717b8a9fcfccb');
  const [role, setRole] = React.useState('host');
  const [token, setToken] = React.useState('');

  React.useEffect(() => {
    if (token === '') callService(userId, roomId, role, setToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);

  return (
    <View style={styles.container}>
      {token !== '' && (
        <HmssdkViewManager
          color="#32a852"
          userId={userId}
          roomId={roomId}
          authToken={token}
          style={styles.box}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '100%',
    height: '100%',
    marginVertical: 20,
  },
});
