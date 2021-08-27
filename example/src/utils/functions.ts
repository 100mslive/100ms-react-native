export const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getInitials = (name: String): String => {
  let initials = '';
  if (name.includes(' ')) {
    const nameArray = name.split(' ');
    if (nameArray[1].length > 0) {
      initials = nameArray[0].substring(0, 1) + nameArray[1].substring(0, 1);
    } else {
      if (nameArray[0].length > 1) initials = nameArray[0].substring(0, 2);
      else initials = nameArray[0].substring(0, 1);
    }
  } else {
    if (name.length > 1) initials = name.substring(0, 2);
    else initials = name.substring(0, 1);
  }
  return initials.toUpperCase();
};
