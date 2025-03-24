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

  const selectedDevices = new Set();

  if (!deviceListBox) {
    console.error("deviceListBox not found!");
    return;
  }
  deviceListBox.innerHTML = "<h3>Available Devices:</h3>";

  const dropdown = document.createElement("div");
  dropdown.classList.add("custom-dropdown");

  const dropdownButton = document.createElement("button");
  dropdownButton.textContent = "Select a device";
  dropdownButton.classList.add("dropdown-button");

  const dropdownList = document.createElement("ul");
  dropdownList.classList.add("dropdown-list"); // ✅ Fixed

  devices.forEach((device) => {
    const deviceItem = document.createElement("li");
    deviceItem.classList.add("dropdown-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = device; // ✅ Fixed

    checkbox.style.marginRight = "8px";

    // const userIcon = document.createElement("img");
    // userIcon.src = "https://cdn-icons-png.flaticon.com/128/1144/1144760.png";
    // userIcon.alt = "UserIcon";
    // userIcon.style.width = "20px";
    // userIcon.style.height = "20px";
    // userIcon.style.marginRight = "5px";

    const deviceText = document.createElement("span");
    deviceText.textContent = device === user ? `${device} (you)` : device; // ✅ Fixed
    deviceText.style.width = "200px";
    deviceItem.appendChild(checkbox);
    // deviceItem.appendChild(userIcon);
    deviceItem.appendChild(deviceText);
    dropdownList.appendChild(deviceItem);

    deviceItem.addEventListener("change", (e) => {
      e.stopPropagation();
      checkbox.checked = !checkbox.checked;

      if (checkbox.checked) {
        selectedDevices.add(device);
      } else {
        selectedDevices.delete(device);
      }

      updateDropdownButton();
    });
  });

  function updateDropdownButton() {
    if (selectedDevices.size > 0) {
      dropdownButton.textContent = Array.from(selectedDevices).join(", ");
    } else {
      dropdownButton.textContent = "Select devices";
    }
  }

  dropdownButton.addEventListener("click", () => {
    dropdownList.classList.toggle("show");
  });

  dropdown.appendChild(dropdownButton);
  dropdown.appendChild(dropdownList);
  deviceListBox.appendChild(dropdown);

  console.log("Updated device list:", devices);
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

// if (device === user) {
//   deviceItem.appendChild(document.createTextNode(device + " (you)"));
// } else {
//   deviceItem.appendChild(document.createTextNode(device));
// }
// deviceItem.style.display = "flex";
// deviceItem.style.alignItems = "center";
// deviceItem.style.justifyContent = "center";
