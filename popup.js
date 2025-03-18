const socket = new WebSocket("ws://localhost:3000");

const username = "User - " + Math.floor(Math.random() * 1000);

socket.onopen = () => {
  console.log("Connected to websocket server");
};

socket.onmessage = (e) => {
  const recievedData = JSON.parse(e.data);
  updateChat(recievedData.sender, recievedData.message, "recieved");
};

document.getElementById("sendBtn").addEventListener("click", () => {
  const message = document.getElementById("messageInput").value;

  if (socket.readyState === WebSocket.OPEN) {
    if (message.trim() !== "") {
      const messageData = {
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

// function showNotification(title, message) {
//   chrome.notifictions.create({
//     type: "basic",
//     iconUrl: "icons/icon.png",
//     title: title,
//     message: message,
//   });
// }

function updateChat(sender, message, type) {
  console.log("📌 Updating Chat UI:", { sender, message, type });
  const messageBox = document.getElementById("messages");

  if (!messageBox) {
    console.error("❌ Message container not found!");
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
