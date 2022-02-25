import axios from 'axios';

export const fetchToken = async ({
  roomID,
  userID,
}: {
  roomID: string;
  userID: string;
}): Promise<{
  msg: string;
  status: number;
  token: string;
  success: boolean;
  error: any;
}> => {
  // TOKEN_ENDPOINT="https://prod-in.100ms.live/hmsapi/<your-subdomain>/api/token" # Valid
  const endPoint =
    'https://prod-in.100ms.live/hmsapi/random.app.100ms.live/api/token';
  const body = {
    room_id: roomID,
    user_id: userID,
    role: 'host', // select role from your dashboard
  };
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await axios.post(endPoint, JSON.stringify(body), {
    headers: headers,
  });

  const result = await response.data;
  return result;
};

export const fetchTokenFromLink = async ({
  code,
  subdomain,
  userID,
}: {
  code: string;
  subdomain: string;
  userID: string;
}): Promise<{msg: string; status: number; token: string; error: any}> => {
  let endPoint = 'https://prod-in.100ms.live/hmsapi/get-token';
  let body: any = null;
  if (subdomain.search('.qa-') >= 0) {
    endPoint = 'https://qa-in2.100ms.live/hmsapi/get-token';
    body = {
      user_id: userID,
      code,
    };
  } else {
    body = {
      code,
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    subdomain,
  };

  const response = await axios.post(endPoint, JSON.stringify(body), {
    headers: headers,
  });

  const result = await response.data;
  return result;
};
