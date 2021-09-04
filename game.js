/*
Board values
For white:
Empty = 0,
Pawn = 1,
Knight = 2,
Bishop = 3,
Rook = 4,
Queen = 5,
King = 6

For black, add 10
*/

//Array of pieces to 2d array for board
function piecesToBoard(pieces) {
    let board = [];
    for (let i = 0; i < 8; i++) {
        board.push([]);
        for (let j = 0; j < 8; j++) {
            board[i].push(0);
        }
    }
    for (let i = 0; i < pieces.length; i++) {
        board[pieces[i].x][pieces[i].y] = pieces[i].boardValue;
    }
    return board;
}

class Piece {
    constructor(Player, X, Y) {
        this.player = Player;
        this.x = X;
        this.y = Y;
    }
}

class Pawn extends Piece {
    constructor(Player = 1, X = 0, Y = 0) {
        super(Player, X, Y);
        this.boardValue = this.player === 1 ? 1 : 11;
        this.moved = false;
    }
    findLegalMoves(board) {
        //array of vectors of legal moves
        let moves = [];
        let direction = this.player === 1 ? 1 : -1;
        if (board[this.x][this.y - (1 * direction)] === 0) {
            moves.push([0, -1 * direction])
        }
        if (board[this.x][this.y - (2 * direction)] === 0 && !this.moved) {
            moves.push([0, -2 * direction])
        }
        if (this.player == 1 ? board[this.x - 1][this.y - (1 * direction)] > 10 : (board[this.x - 1][this.y - (1 * direction)] < 10 && board[this.x - 1][this.y - (1 * direction)] != 0)) {
            moves.push([-1, -1 * direction])
        }
        if (this.player == 1 ? board[this.x + 1][this.y - (1 * direction)] > 10 : (board[this.x - 1][this.y - (1 * direction)] < 10 && board[this.x - 1][this.y - (1 * direction)] != 0)) {
            moves.push([1, -1 * direction])
        }
        return moves;
    }
    move(pieces, startPos, endPos) {
        let legalMoves = this.findLegalMoves(piecesToBoard(pieces));
        for (let i = 0; i < legalMoves.length; i++) {
            if (legalMoves[i][0] == endPos[0] - startPos[0] && legalMoves[i][1] == endPos[1] - startPos[1]) {
                this.x = endPos[0];
                this.y = endPos[1];
                this.moved = true;
            }
        }
    }
}



module.exports = {
    //reset board
    reset: function() {
        let pieces = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (j === 1 || j === 6)
                    pieces.push(new Pawn(j === 6 ? 1 : 2, i, j))
            }
        }
        return pieces;
    },

    //make a move
    move: function(pieces, move) {
        positions = move.split(":");
        startPos = [parseInt(positions[0], 10), parseInt(positions[1], 10)];
        endPos = [parseInt(positions[2], 10), parseInt(positions[3], 10)];
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].x === startPos[0] && pieces[i].y === startPos[1]) {
                pieces[i].move(pieces, startPos, endPos);
                break;
            }
        }
        return pieces;
    },

    //pieces to board array 
    piecesToBoard,
}