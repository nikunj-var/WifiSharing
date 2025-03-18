
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NEW_MESSAGE") {
    console.log("New message Recieved", message.data);
    chrome.runtime.sendMessage({
      type: "SHOW_POPUP",
      data: message.data,
    });
  }
});
