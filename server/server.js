const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("New Client connected. Total:", clients.size);

  ws.on("message", (message) => {
    const text = message.toString();
    console.log("Recieved", text);
    clients.forEach((client) => {
      if (client != wss && client.readState === WebSocket.OPEN) {
        console.log(`"Recieved from ${client}:${text}`);
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client discconected. Total:", clients.size);
  });
});

server.listen(3000, () => console.log("Websocket server running on port 3000"));
