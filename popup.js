const socket = new WebSocket("ws://localhost:3000");

const username = "User - " + Math.floor(Math.random() * 1000);

socket.onopen = () => {
  console.log("Connected to websocket server");
  socket.send(JSON.stringify({ type: "REGISTER", username: username }));
};

socket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log(data);
  if (data.type === "DEVICE_LIST") {
    console.log("function called");
    console.log(data.devices);
    updateDeviceList(data.devices);
  } else if (data.type === "MESSAGE") {
    updateChat(data.sender, data.message, "recieved");
  }
};

document.getElementById("sendBtn").addEventListener("click", () => {
  const message = document.getElementById("messageInput").value;

  if (socket.readyState === WebSocket.OPEN) {
    if (message.trim() !== "") {
      const messageData = {
        type: "MESSAGE",
        sender: username,
        message: message,
      };

      socket.send(JSON.stringify(messageData)); // ✅ Now inside the if block
      console.log("📤 Sent message:", messageData);
      updateChat("You", message, "sent");
      document.getElementById("messageInput").value = "";
    } else {
      console.log("Message is empty");
    }
  } else {
    alert("WebSocket connection is not open");
  }
});

function updateChat(sender, message, type) {
  const messageBox = document.getElementById("messages");

  if (!messageBox) {
    console.error(" Message container not found!");
    return;
  }
  const newMessage = document.createElement("p");

  if (type === "sent") {
    newMessage.innerHTML = `<b>You:</b> ${message} <span style = "color:gray;">(sent to all)</span>`;
  } else {
    newMessage.innerHTML = `<b>${sender}:</b> ${message}`;
  }
  messageBox.appendChild(newMessage);
  messageBox.scrollTop = messageBox.scrollHeight;
}

function updateDeviceList(devices) {
  const deviceListBox = document.getElementById("devices");
  if (!deviceListBox) {
    console.error(" deviceListBox not found!");
    return;
  }
  deviceListBox.innerHTML = "<h3>Available Devices:</h3>";
  devices.forEach((device) => {
    const deviceItem = document.createElement("p");
    deviceItem.textContent = device;
    deviceListBox.appendChild(deviceItem);
  });
  console.log("update device list", devices);
}
