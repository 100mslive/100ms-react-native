export const getRoomLinkDetails = (
  roomLink: string,
): {code: string; domain: string} => {
  const codeObject = RegExp(/(?!\/)[a-zA-Z\-0-9]*$/g).exec(roomLink);

  const domainObject = RegExp(/(https:\/\/)?(?:[a-zA-Z0-9.-])+(?!\\)/).exec(
    roomLink,
  );

  let code = '';
  let domain = '';

  if (codeObject && domainObject) {
    code = codeObject[0];
    domain = domainObject[0];
    domain = domain.replace('https://', '');
  }

  return {
    code,
    domain,
  };
};
