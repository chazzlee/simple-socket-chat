const format = require("date-fns/format");

function formatMessage(username, text) {
  return {
    username,
    text,
    time: format(new Date(), "h:mm a"),
  };
}

module.exports = formatMessage;
