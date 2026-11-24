declare global {
  export interface Packet<T = any> {
    recipient: 'host' | 'all';
    senderId: string;
    payload: T;
    gamePacket?: boolean;
  }

  export interface Player {
    socketId: SocketId,
    name: PlayerName,
  }

  type SocketId = string;
  type PlayerName = string

  export interface ServerProperties {
    hostId: string | null,
    socketIdToName: Record<SocketId, PlayerName>,
    playerNameToSocketId: Record<PlayerName, SocketId>
  }

  export interface ServerState extends GameState, ServerProperties {

  }

  export interface HostGameProperties {
    socketIdToPlayer: Record<SocketId, Player>;
    playerNameToSocketId: Record<PlayerName, SocketId>;
    gameList: Record<string, GameManifest> | null;
  }

export type GameList = Record<string, GameManifest>

  export interface GameManifest {
    name: string;
    description: string;
    icon: string;
  }

  export type HostGameState = GameState & HostGameProperties;

  export interface GameState {
    activeGame: Game | null;
  }

  export interface Game<T = any> {
    input: InputGameMethod<T>;
    init(container: HTMLElement, api: GameAPI);
    destroy(): void;
  }

  export type InputGameMethod<T = any> = (Payload: T) => void;
}

export {};
