import { io } from 'socket.io-client';

const socket = io({
  auth: {
    clientType: 'host',
  },
});

const state: HostGameState = {
  socketIdToPlayer: {},
  playerNameToSocketId: {},
  activeGame: null,
  gameList: null,
};

// elements
const playerListElement = document.getElementById(
  'player-list',
) as HTMLUListElement | null;
const gameListElement = document.getElementById('game-list');

socket.on('playerList', (playerList) => {
  for (const socketId in playerList) {
    if (!Object.hasOwn(playerList, socketId)) continue;

    const name = playerList[socketId];

    addPlayer({ socketId: socketId, name: name });
  }
});

socket.on('removePlayer', (player) => {
  const { socketId } = player;
  removePlayerFromSocketId(socketId);
  removePlayerCard(socketId);
});

socket.on('addPlayer', (player) => {
  addPlayer(player);
});

socket.on('redirect', (path) => {
  window.location.replace(path);
});

socket.on(
  'receivePacket',
  /** @param {Packet} packet*/ (packet) => {
    if (packet.gamePacket && state.activeGame?.input) {
      state.activeGame.input(packet.payload);
    }
  },
);

function addPlayer(player: Player) {
  const { socketId, name } = player;

  state.playerNameToSocketId[name] = socketId;
  state.socketIdToPlayer[socketId] = { name: name, socketId: socketId };

  addPlayerCard(player);
}

function removePlayerFromSocketId(socketId: SocketId) {
  const player = state.socketIdToPlayer[socketId]
  if (!player) return;
  const name = player.name;
  delete state.playerNameToSocketId[name];
  delete state.socketIdToPlayer[socketId];
}

function removePlayerFromName(playerName: PlayerName) {
  const socketId = state.playerNameToSocketId[playerName];
  if (!socketId) return;
  delete state.playerNameToSocketId[playerName];
  delete state.socketIdToPlayer[socketId];
}

function addPlayerCard(player: Player) {
  const { name, socketId } = player;

  const template = document.getElementById(
    'player-card-template',
  ) as HTMLTemplateElement | null;

  if (!template) return;

  const clone = document.importNode(template.content, true);

  let gameCard = clone.querySelector('.player-card') as HTMLLIElement;

  if (gameCard) {
    gameCard.setAttribute('name', name);
    gameCard.setAttribute('socketId', socketId);

    gameCard.textContent = name;
  }

  if (playerListElement) {
    playerListElement.appendChild(clone);
  }
}

function removePlayerCard(socketId: SocketId) {
  if (!playerListElement) return;

  const playerCard = playerListElement.querySelector(
    `[socketId="${socketId}"]`,
  ) as HTMLLIElement | null;

  if (!playerCard) return;
  playerCard.remove();
}

async function getGames() {
  const games = await fetch(window.location.origin + '/api/games');
  state.gameList = await JSON.parse(await games.text());
  return state.gameList;
}

function startGame(game: Game) {}

async function populateGameCards() {
  const template = document.getElementById(
    'game-card-template',
  ) as HTMLTemplateElement | null;
  if (!template) return;
  if (!gameListElement) return;

  await getGames();

  for (const gameDirectoryName in state.gameList) {
    if (!Object.hasOwn(state.gameList, gameDirectoryName)) continue;

    const gameManifest = state.gameList[gameDirectoryName];
    if (!gameManifest) continue;

    const clone = document.importNode(template.content, true);

    const gameCard = clone.querySelector('.game-card') as HTMLLIElement;

    const gameName = gameCard.querySelector('.game-name') as HTMLSpanElement;
    const gameDescription = gameCard.querySelector(
      '.game-description',
    ) as HTMLLIElement;
    const gameIcon = gameCard.querySelector('.game-icon') as HTMLImageElement;

    gameName.textContent = gameManifest.name;
    gameDescription.textContent = gameManifest.description;
    if (gameManifest.icon) {
      gameIcon.src = gameManifest.icon;
    } else {
      gameIcon.src = '/src/assets/noimage.svg';
    }

    gameListElement.appendChild(clone);

    gameCard.addEventListener('click', () => {
      console.log('hi');
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  populateGameCards();
});
