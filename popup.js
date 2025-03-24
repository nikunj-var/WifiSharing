const socket = new WebSocket("ws://localhost:3000");

const username = "";

socket.onopen = () => {
  console.log("Connected to websocket server");
  socket.send(JSON.stringify({ type: "REGISTER", username: username }));
};

socket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log(data);
  if (data.type === "DEVICE_LIST") {
    console.log(data.devices);
    updateDeviceList(data.devices, data.user);
  } else if (data.type === "FILE") {
    displayRecievedFile(data.sender, data.fileName, data.fileData);
  } else if (data.type === "MESSAGE") {
    updateChat(data.sender, data.message, "recieved");
  }
};

document.getElementById("sendBtn").addEventListener("click", () => {
  const message = document.getElementById("messageInput").value.trim();
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  let sent = false;

  if (message !== "" && socket.readyState === WebSocket.OPEN) {
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
      sent = true;
    }
  }

  if (file && socket.readyState === WebSocket.OPEN) {
    const reader = new FileReader();
    reader.onload = function () {
      const fileData = reader.result.split(",")[1];
      socket.send(
        JSON.stringify({
          type: "FILE",
          sender: username,
          fileName: file.name,
          fileData: fileData,
        })
      );
    };
    reader.readAsDataURL(file);
    fileInput.value = "";
    sent = true;
  }
  if (!sent) {
    console.log("No message or file send");
    alert("Please enter message or select a file");
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

function updateDeviceList(devices, user) {
  const deviceListBox = document.getElementById("devices");
  if (!deviceListBox) {
    console.error(" deviceListBox not found!");
    return;
  }
  deviceListBox.innerHTML = "<h3>Available Devices:</h3>";
  devices.forEach((device) => {
    const deviceItem = document.createElement("p");
    if (device === user) {
      deviceItem.textContent = device + " (you)";
    } else {
      deviceItem.textContent = device;
    }
    deviceListBox.appendChild(deviceItem);
  });
  console.log("update device list", devices);
}

function displayRecievedFile(sender, fileName, fileData) {
  const fileInput = document.getElementById("messages");
  const fileLink = document.createElement("a");
  fileLink.href = `data:application/octet-stream;base64,${fileData}`;
  fileLink.download = fileName;
  fileLink.innerHTML = `<b>${sender}:</b> ${fileName}(Click to download)`;
  fileLink.style.display = "block";
  fileInput.appendChild(fileLink);
}
