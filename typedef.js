/**
 * @typedef {Object} Packet
 * @property {"host"|"all"} recipient
 * @property {String} senderId
 * @property {Payload} payload
 * @property {Boolean} [gamePacket=]
 */

/**
 * @typedef {Object} Payload
 */

/**
 * @typedef {Object} HostGameProperties
 * @property {{[socketId: String]: [name: String] }} socketIdToPlayer
 * @property {{[name: String]: [socketId: String] }} playerNameToSocketId
 * @property {{[gameFolderName: String]: GameManifest|null}} gameList
 */

/**
 * @typedef {Object} GameManifest
 * @property {String} name
 * @property {String} uuid
 * @property {String} description
 * @property {String} icon
 */

/**
 * @typedef {GameState & HostGameProperties} HostGameState
 */

/**
 * @typedef {Object} GameState
 * @property {Game|null} activeGame
 */

/**
 * @typedef {Object} Game
 * @property {InputGameMethod} input
 */

/**
 * @callback InputGameMethod
 * @param {Payload} Payload
 * @returns {Void}
 */