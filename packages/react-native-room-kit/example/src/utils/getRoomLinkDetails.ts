export const getRoomLinkDetails = (
  roomLink: string
): { roomCode: string; roomDomain: string } => {
  const codeObject = RegExp(/(?!\/)[a-zA-Z\-0-9]*$/g).exec(roomLink);

  const domainObject = RegExp(/(https:\/\/)?(?:[a-zA-Z0-9.-])+(?!\\)/).exec(
    roomLink
  );

  let roomCode = '';
  let roomDomain = '';

  if (codeObject && domainObject) {
    roomCode = codeObject[0];
    roomDomain = domainObject[0];
    roomDomain = roomDomain.replace('https://', '');
  }

  return {
    roomCode,
    roomDomain,
  };
};
