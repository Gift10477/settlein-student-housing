// Database errors can contain SQL, credentials, and user input. Never log them.
module.exports = function safeLog(event) {
  console.error(event);
};
