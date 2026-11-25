const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    if (numClients >= 2) {
      socket.emit('room-full');
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;

    if (numClients === 1) {
      socket.to(roomId).emit('peer-joined');
    }
  });

  socket.on('signal', ({ roomId, data }) => {
    socket.to(roomId).emit('signal', data);
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('peer-left');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WarpDrop server running on port ${PORT}`);
});
