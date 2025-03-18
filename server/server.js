const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("New Client connected. Total:", clients.size);

  ws.on("message", (data) => {
    try {
      const text = data.toString();
      if (!text.startsWith("{")) {
        console.log(`recieved a plain text message: "${text}"`);
        return;
      }

      const messageData = JSON.parse(text);

      if (!messageData.sender || !messageData.message) {
        console.log("⚠️ Received an invalid message:", data);
        return;
      }
      console.log(
        `Received from ${messageData.sender}: ${messageData.message}`
      );
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              sender: messageData.sender,
              message: messageData.message,
            })
          );
        }
      });
    } catch (err) {
      console.log(err);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client discconected. Total:", clients.size);
  });
});

server.listen(3000, () => console.log("Websocket server running on port 3000"));
