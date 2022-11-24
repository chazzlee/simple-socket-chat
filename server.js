const http = require("http");
const Koa = require("koa");
const logger = require("koa-logger");
const Router = require("@koa/router");
const serveStatic = require("koa-static");
const { Server } = require("socket.io");
const formatMessage = require("./utils/formatMessage");
const {
  joinUser,
  getCurrentUser,
  removeUser,
  getRoomUsers,
} = require("./utils/users");

const PORT = 5500 || process.env.PORT;

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const io = new Server(server);

app
  .use(logger())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serveStatic(__dirname + "/public"));

const botName = "Chatcord Bot";

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }) => {
    const user = joinUser(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Chatcord!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("room-users", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat message
  socket.on("chat-message", (message) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  // When client disconnects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat!`)
      );

      io.to(user.room).emit("room-users", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Listening on *:${PORT}`);
});
