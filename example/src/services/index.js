export const fetchToken = async ({ roomID, userID, role }) => {
  const endPoint =
    'https://prod-in.100ms.live/hmsapi/yogi.app.100ms.live/api/token';
  const body = {
    room_id: roomID,
    user_id: userID,
    role: role,
  };
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(endPoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });

  const result = await response.json();
  return result;
};
