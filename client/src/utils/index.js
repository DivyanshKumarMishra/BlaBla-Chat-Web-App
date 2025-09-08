import moment from 'moment';

const getShortName = (name) => {
  return name
    ?.split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

const checkIfImage = (filePath) => {
  const imageRegex = /\.(jpe?g|png|gif|bmp|tiff?|webp|svg|ico|heic|heif)$/i;
  return imageRegex.test(filePath);
};

const getSender = (user, members) => {
  return members.find((member) => member._id !== user.id);
};

function formatTimestamp(timestamp) {
  if (!timestamp) return '';

  const time = moment(timestamp).local(); // Ensure local time
  const now = moment();

  if (time.isSame(now, 'day')) {
    return time.format('h:mm A'); // Example: 6:26 PM
  } else if (time.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else if (now.diff(time, 'days') < 7) {
    return time.format('dddd'); // Example: Wednesday
  } else if (now.diff(time, 'months') < 12) {
    return time.format('ddd DD'); // Example: Wed 09
  } else {
    return time.format('MMM DD, YYYY'); // Example: Sep 09, 2024
  }
}

export { getShortName, checkIfImage, getSender, formatTimestamp };
