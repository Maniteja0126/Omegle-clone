const { Server } = require('socket.io');
const http = require('http');
const { UserManager } = require('./managers/UserManager');

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on('connection', (socket) => {
  userManager.addUser("randomName", socket);

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
  });

  socket.on("disconnect", () => {
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
