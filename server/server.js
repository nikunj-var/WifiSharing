const WebSocket = require("ws");
const express = require("express");
const os = require("os");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Map();
const deviceName = os.hostname();

wss.on("connection", (ws) => {
  // clients.add(ws);
  console.log(`${deviceName} connected`);
  clients.set(ws, deviceName);

  ws.on("message", (data) => {
    try {
      const messageData = JSON.parse(data);
      if (messageData.type === "REGISTER") {
        console.log(`Registered client - ${clients.get(ws)}`);
        broadCastDeviceList();
        return;
      }
      if (messageData.type === "FILE") {
        console.log(
          `Received from ${clients.get(ws)}: ${messageData.FileName}`
        );
        broadCast(
          {
            type: "FILE",
            sender: clients.get(ws),
            fileName: messageData.fileName,
            fileData: messageData.fileData,
          },
          ws,
          messageData.recipients
        );
      } else if (messageData.type === "MESSAGE") {
        console.log(`Received from ${clients.get(ws)}: ${messageData.message}`);
        broadCast(
          {
            type: "MESSAGE",
            sender: clients.get(ws),
            message: messageData.message,
          },
          ws,
          messageData.recipients
        );
      }
    } catch (err) {
      console.log(err);
    }
  });

  ws.on("close", () => {
    console.log(`Client discconected.  ${clients.get(ws)}`);
    clients.delete(ws);
    broadCastDeviceList();
  });
});

function broadCastDeviceList() {
  const deviceList = Array.from(clients.values());
  const message = JSON.stringify({
    type: "DEVICE_LIST",
    devices: deviceList,
    user: deviceName,
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  console.log("Updated devices list send", deviceList);
}

function broadCast(data, ws) {
  wss.clients.forEach((client) => {
    if (
      client !== ws &&
      client.readyState === WebSocket.OPEN &&
      recipients.includes(clients.get(client))
    ) {
      client.send(JSON.stringify(data));
    }
  });
}
server.listen(3000, () => console.log("Websocket server running on port 3000"));
