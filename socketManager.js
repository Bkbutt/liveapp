// Initialize the connectedUsers object to keep track of Socket.io connections
const connectedUsers = {};

// Function to handle Socket.io connection events
function handleSocketConnection(socket) {
  // Get the user ID when the user connects (you should have a mechanism to get the user ID)
  const userId = getUserIDSomehow(socket);

  // Store the socket instance in the connectedUsers object with the user ID as the key
  connectedUsers[userId] = socket;

  // Handle any other events or logic related to the Socket.io connection here
}

// Export the connectedUsers object and the handleSocketConnection function
module.exports = {
  connectedUsers,
  handleSocketConnection,
};