import createDebugger from "debug";
import { WebSocketServer } from "ws";

const debug = createDebugger("express-api:messaging");

const clients = [];

export function createWebSocketServer(httpServer) {
  debug("Creating WebSocket server");
  const wss = new WebSocketServer({
    server: httpServer,
  });

  // Handle new client connections.
  wss.on("connection", function (ws) {
    debug("New WebSocket client connected");

    // Keep track of clients.
    clients.push(ws);

    // Listen for messages sent by clients.
    ws.on("message", (message) => {
      // Make sure the message is valid JSON.
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(message);
      } catch (err) {
        // Send an error message to the client with "ws" if you want...
        return debug("Invalid JSON message received from client");
      }

      // Handle the message.
      onMessageReceived(ws, parsedMessage);
    });

    // Clean up disconnected clients.
    ws.on("close", () => {
      clients.splice(clients.indexOf(ws), 1);
      debug("WebSocket client disconnected");
    });
  });
}

export function broadcastMessage(message, action, type, info = null) {
  const messageFormat = {
    message: message,
    action: action,
    type: type,
    info: info,
  };

  // Map each send operation to a Promise.
  const sendPromises = clients.map((client) => {
    return new Promise((resolve, reject) => {
      try {
        client.send(JSON.stringify(messageFormat), (error) => {
          if (error) {
            reject({
              success: false,
              error: "Failed to send message to client",
            });
          } else {
            resolve({ success: true, message: "Message sent successfully" });
          }
        });
      } catch (error) {
        reject({
          success: false,
          error: "Exception while sending message to client",
        });
      }
    });
  });

  // Use Promise.all to wait for all send operations to complete.
  return Promise.all(sendPromises)
    .then((results) => {
      // If all sends were successful, return a success response.
      return {
        success: true,
        message: "All messages sent successfully",
        results,
      };
    })
    .catch((error) => {
      // If any send failed, return an error response.
      return {
        success: false,
        error: "Some messages failed to send",
        errorDetails: error,
      };
    });
}

function onMessageReceived(ws, message) {
  debug(`Received WebSocket message: ${JSON.stringify(message)}`);
  // Do something with message...
}
