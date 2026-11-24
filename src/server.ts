import express, { type Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Bonjour } from 'bonjour-service';
import path from 'path';
import fs from 'fs/promises';
console.clear();
const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 8080;
const HOST_NAME = 'game.local';

const state: ServerState = {
  hostId: null,
  socketIdToName: {},
  playerNameToSocketId: {},
  activeGame: null,
};

app.get('/', (request, response) => {
  response.sendFile(
    path.resolve(import.meta.dirname, 'dist/controller/index.html'),
  );
});

app.use('/games', express.static(path.join(import.meta.dirname, 'games')));

app.get('/controller', (request, response) => {
  response.sendFile(
    path.resolve(import.meta.dirname, 'dist/controller/index.html'),
  );
});

app.get('/host', (request, response) => {
  response.sendFile(path.resolve(import.meta.dirname, 'dist/host/index.html'));
});

app.get('/', (request, response) => {
  response.redirect('/controller');
});

app.get('/api/games', async (request, response) => {
  const gamesDirectoryPath = path.join(import.meta.dirname, '/games/');
  try {
    const gamesDirectory = await fs.readdir(gamesDirectoryPath, {
      withFileTypes: true,
    });
    const allGames: GameList = {};
    for (const folderEntry of gamesDirectory) {
      if (folderEntry.isFile()) {
        continue;
      }
      // we know it is a folder
      const manifestPath = path.join(
        folderEntry.parentPath,
        folderEntry.name,
        'manifest.json',
      );
      try {
        let manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
        delete manifest.$schema;
        allGames[folderEntry.name] = manifest;
      } catch (error) {
        console.warn(error)
      }
    }

    response.json(allGames);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'oopsie, bad thingy in server side' });
  }
});

io.on('connection', (socket) => {
  if (socket.handshake.auth.clientType) {
    const role = socket.handshake.auth.clientType;
    if (role == 'host') {
      if (!state.hostId || state.hostId == socket.id) {
        socket.data.role = 'host';
        state.hostId = socket.id;
        socket.emit('playerList', state.socketIdToName);
      } else {
        socket.emit('redirect', '/controller');
      }
    }
  }

  socket.on('registerPlayer', (data) => {
    const { name } = data;

    if (name in state.playerNameToSocketId) {
      socket.emit('usernameTaken');
    } else {
      socket.data.role = 'player';
      addPlayer({ socketId: socket.id, name: name });
      if (!state.hostId) return;
      io.to(state.hostId).emit('addPlayer', {
        socketId: socket.id,
        name: name,
      });
      socket.emit('registerSuccess');
    }
  });

  socket.on(
    'sendPacket',
    /** @param {Packet} packet*/ (packet) => {
      if (packet.recipient === 'host' && state.hostId) {
        io.to(state.hostId).emit('receivePacket', packet);
      } else if (packet.recipient === 'all' && socket.id == state.hostId) {
        socket.broadcast.emit('receivePacket', packet);
      }
    },
  );

  socket.on('disconnect', () => {
    if (socket.data.role == 'player') {
      if (!state.hostId) return;
      io.to(state.hostId).emit('removePlayer', {
        socketId: socket.id,
        name: state.socketIdToName[socket.id],
      });
      removePlayerFromSocketId(socket.id);
    } else if (socket.data.role === 'host') {
      state.hostId = null;
    }
  });
});

/**
 * @param {{socketId: String, name: String}} player
 */
function addPlayer(player: Player) {
  state.playerNameToSocketId[player.name] = player.socketId;
  state.socketIdToName[player.socketId] = player.name;
}

function removePlayerFromName(playerName: PlayerName) {
  const socketId = state.playerNameToSocketId[playerName];
  if (!socketId) return;
  delete state.playerNameToSocketId[playerName];
  delete state.socketIdToName[socketId];
}

function removePlayerFromSocketId(socketId: SocketId) {
  const playerName = state.socketIdToName[socketId];
  if (!playerName) return;
  delete state.playerNameToSocketId[playerName];
  delete state.socketIdToName[socketId];
}

server.listen(PORT, '0.0.0.0', () => {
  const bonjour = new Bonjour();

  bonjour.publish({
    name: 'network-game',
    type: 'http',
    port: PORT,
    host: HOST_NAME,
    // txt: { path: '/' }
  });
});
