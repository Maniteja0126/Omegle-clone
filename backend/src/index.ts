import { Socket , Server } from 'socket.io';
import http from 'http'
import { UserManager } from "./managers/UserManager";

const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
  userManager.addUser("randomName", socket);


  socket.on('sendMessage', (message : string) => {
    io.emit('receiveMessage', message);
  });


  socket.on("disconnect", () => {
    userManager.removeUser(socket.id);
  })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});