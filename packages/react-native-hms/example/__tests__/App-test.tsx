/**
 * @format
 */

import 'react-native';
import {fetchToken, fetchTokenFromLink} from '../src/services';

const userID = 'test';
const roomID = '61b6d809b682a91dd54b5d72';
const code = 'nih-bkn-vek';
const subdomain = 'yogi.app.100ms.live';
const response = {
  token: 'token',
  status: 200,
  msg: 'token generated successfully',
  success: true,
  api_version: '2.0.166',
};

test('Fetch Token From Link API', async () => {
  const data = await fetchTokenFromLink({
    userID,
    code,
    subdomain,
  });

  console.log(data.token);
  expect(data.status).toBe(response.status);
  expect(data.msg).toBe(response.msg);
  expect(data.token).toBeTruthy();
});

test('Fetch Token From RoomID API', async () => {
  const data = await fetchToken({
    userID,
    roomID,
  });

  console.log(data.token);
  expect(data.status).toBe(response.status);
  expect(data.msg).toBe(response.msg);
  expect(data.success).toBe(response.success);
  expect(data.token).toBeTruthy();
});
