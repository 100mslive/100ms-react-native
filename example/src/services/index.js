export const fetchToken = async ({ roomID, userID, role }) => {
  const endPoint = 'https://ms-services-o0e1jijzwvka.runkit.sh/';
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
