const WebSocketServer = require('ws');
const GameManager = require('./GameManager');
const { v4: uuidv4 } = require('uuid');  // For generating unique IDs

const wss = new WebSocketServer.Server({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    ws.id = uuidv4();  // Assign a unique ID to the socket
    console.log(`User connected with ID: ${ws.id}`);
    
    gameManager.addUser(ws);

    ws.on('close', () => gameManager.removeUser(ws));
});
