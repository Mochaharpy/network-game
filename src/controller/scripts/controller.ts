import {io} from 'socket.io-client';
const nameForm = document.getElementById('name-form') as HTMLFormElement;
const socket = io();

const state: GameState = {
  activeGame: null
};

nameForm.addEventListener('submit', (submitEvent) => {
  submitEvent.preventDefault();
  if (!submitEvent.target) return;

  const nameFormData = new FormData(nameForm);
  const username = nameFormData.get('username');

  socket.emit('registerPlayer', { name: username });
});

socket.on('registerSuccess', () => {
  nameForm.style.display = 'none';
});

socket.on('usernameTaken', () => {
  console.warn('username is taken');
});

socket.on('receivePacket', (packet: Packet) => {
  if (state.activeGame && packet.gamePacket) {
    state.activeGame.input(packet.payload);
  }
});

socket.on('loadGame', (gameFolderName) => {loadGame(gameFolderName)})

async function loadGame(gameFolderName: string) {
  try {
    // grab manifest to find the entrypoint
    const gameEntry = await fetch(window.location.origin + "/games/" + gameFolderName + "/manifest.json").then((response)=> {return response.text()}); 
    const gameManifest: GameManifest = JSON.parse(gameEntry)
  } catch (uhoh) {
    
  }
} 