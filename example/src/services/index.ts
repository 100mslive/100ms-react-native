export const fetchToken = async ({
  roomID,
  userID,
  role,
}: {
  roomID: string;
  userID: string;
  role: string;
}) => {
  const endPoint =
    'https://prod-in.100ms.live/hmsapi/random.app.100ms.live/api/token';
  const body = {
    room_id: roomID,
    user_id: userID,
    role: role,
  };
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(endPoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });

  const result = await response.json();
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
}) => {
  let endPoint = 'https://prod-in.100ms.live/hmsapi/get-token';
  let body: any = null;
  if (subdomain.search('.qa-') >= 0) {
    endPoint = 'https://qa-in.100ms.live/hmsapi/get-token';
    body = {
      user_id: userID,
      code,
    };
  } else {
    body = {
      code,
    };
  }

  console.log(code, subdomain, endPoint, body);
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    subdomain,
  };

  const response = await fetch(endPoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });

  const result = await response.json();
  return result;
};
