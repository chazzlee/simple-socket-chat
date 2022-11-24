document.addEventListener("DOMContentLoaded", () => {
  const $chatForm = document.getElementById("chat-form");
  const $chatMessages = document.querySelector(".chat-messages");

  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("username");
  const room = urlParams.get("room");

  const socket = io();

  socket.emit("join", { username, room });

  socket.on("room-users", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
  });

  socket.on("message", (message) => {
    console.log(message);
    outputMessage(message);

    $chatMessages.scrollTop = $chatMessages.scrollHeight;
  });

  $chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = e.target.elements.msg.value;

    socket.emit("chat-message", message);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  });
});

function outputMessage(message) {
  const $messageContainer = document.createElement("div");
  $messageContainer.classList.add("message");

  const $metaHeader = document.createElement("p");
  $metaHeader.classList.add("meta");

  $metaHeader.innerHTML = `${message.username} <span>${message.time}<span>`;

  const $messageContent = document.createElement("p");
  $messageContent.classList.add("text");
  $messageContent.textContent = message.text;

  $messageContainer.append($metaHeader, $messageContent);

  document.querySelector(".chat-messages").append($messageContainer);
}

function outputRoomName(room) {
  const $roomName = document.getElementById("room-name");
  $roomName.textContent = room;
}

function outputUsers(users) {
  const $userList = document.getElementById("users");
  if ($userList.hasChildNodes()) {
    $userList.innerHTML = "";
  }
  users.forEach((user) => {
    const $listItem = document.createElement("li");
    $listItem.textContent = user.username;
    $userList.append($listItem);
  });
}
