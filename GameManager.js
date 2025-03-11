const Game = require('./Game');
const { INIT_GAME, MOVE } = require('./messages');

class GameManager {
    #games;
    #pendingUser;
    #users;

    constructor() {
        this.#games = [];
        this.#pendingUser = null;
        this.#users = [];
    }

    addUser(socket) {
        this.#users.push(socket);
        this.#addHandler(socket);
    }

    removeUser(socket) {
        this.#users = this.#users.filter(user => user.id !== socket.id);
        console.log(`User disconnected: ${socket.id}`);
        // Stop the game if user quit
        const game = this.#games.find(g => g.player1 === socket || g.player2 === socket);
        if (game) {
            game.endGame(socket);  // End the game gracefully
        }
    }

    #addHandler(socket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                if (this.#pendingUser) {
                    // Start the game
                    const game = new Game(this.#pendingUser, socket);
                    this.#games.push(game);
                    this.#pendingUser = null;
                } else {
                    this.#pendingUser = socket;
                }
            }

            if (message.type === MOVE) {
                const game = this.#games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    console.log(`Move from ${socket.id}:`, message);
                    game.makeMove(socket, message.payload.move);
                }
            }

            if (message.type === 'message') {
                const game = this.#games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    console.log(`Message from ${socket.id}:`, message);
                    game.message(socket, message.payload);
                }
            }
        });
    }
}

module.exports = GameManager;
