const { Chess } = require("chess.js");
const { GAME_OVER, INIT_GAME, MOVE } = require("./messages");

class Game {
    player1;
    player2;
    board;
    #startTime;
    #moveCount = 0;

    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.#startTime = new Date();

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'w',
                id: player1.id
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'b',
                id: player2.id
            }
        }));
    }

    message(socket, message) {
        const recipient = (socket === this.player1) ? this.player2 : this.player1;

        recipient.send(JSON.stringify({
            type: 'message_received',
            payload: {
                message: message,
                id: socket.id  // Use the unique ID for the message
            }
        }));
    }

    makeMove(socket, move) {
        if ((this.#moveCount % 2 === 0 && socket !== this.player1) ||
            (this.#moveCount % 2 === 1 && socket !== this.player2)) {
            return;  // It's not the player's turn
        }

        try {
            this.board.move(move);
        } catch (e) {
            console.log('Invalid move:', move, e);
            return;
        }

        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? 'black' : 'white';
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: { winner }
            }));
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: { winner }
            }));
            return;
        }

        const recipient = (socket === this.player1) ? this.player2 : this.player1;
        recipient.send(JSON.stringify({
            type: MOVE,
            payload: move
        }));

        this.#moveCount++;
    }

    endGame(quittingPlayer) {
        const otherPlayer = (quittingPlayer === this.player1) ? this.player2 : this.player1;

        otherPlayer.send(JSON.stringify({
            type: GAME_OVER,
            payload: { winner: 'opponent quit' }
        }));
    }
}

module.exports = Game;
