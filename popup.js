const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
  console.log("Connected to websocket server");
  socket.send("hello");
};

socket.onmessage = (e) => {
  const messageBox = document.getElementById("messages");
  const newMessage = document.createElement("p");
  console.log("e", e);
  newMessage.textContent = `Recieved from client:${e.data}`;
  messageBox.appendChild(newMessage);
  showNotification("New message recieved", e.data);
};

document.getElementById("sendBtn").addEventListener("click", () => {
  const message = document.getElementById("messageInput").value;
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    document.getElementById("messageInput").value = "";
  } else {
    alert("Websocket connection is not open");
  }
});

function showNotification(title, message) {
  chrome.notifictions.create({
    type: "basic",
    iconUrl: "icons/icon.png",
    title: title,
    message: message,
  });
}
