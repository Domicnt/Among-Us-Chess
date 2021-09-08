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

//find piece at location on board
function pieceFromLocation(pieces, x, y) {
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].x === x && pieces[i].y === y) {
            return i;
        }
    }
    return -1;
}

class Piece {
    constructor(Player, X, Y) {
        this.player = Player;
        this.x = X;
        this.y = Y;
        this.boardValue = 0;
    }
    sameTeam(piece) {
        return this.player == 1 ? piece.boardValue < 10 : piece.boardValue > 10;
    }
}

class Pawn extends Piece {
    constructor(Player = 1, X = 0, Y = 0) {
        super(Player, X, Y);
        this.boardValue = this.player === 1 ? 1 : 11;
        this.moved = false;
        this.enPassantAble = false;
    }
    findLegalMoves(pieces) {
        let board = piecesToBoard(pieces);
        //array of vectors of legal moves
        let moves = [];
        let direction = this.player === 1 ? 1 : -1;

        //normal moves
        if (board[this.x][this.y - (1 * direction)] === 0) {
            moves.push([0, -1 * direction]);
        }
        if (board[this.x][this.y - (2 * direction)] === 0 && !this.moved) {
            moves.push([0, -2 * direction]);
        }

        //normal capture
        let index = pieceFromLocation(pieces, this.x - 1, this.y - direction);
        if (index != -1) {
            if (this.player == 1 ? pieces[index].boardValue > 10 : (pieces[index].boardValue < 10 && pieces[index].boardValue != 0)) {
                moves.push([-1, -1 * direction]);
            }
        }
        index = pieceFromLocation(pieces, this.x + 1, this.y - direction);
        if (index != -1) {
            if (this.player == 1 ? pieces[index].boardValue > 10 : (pieces[index].boardValue < 10 && pieces[index].boardValue != 0)) {
                moves.push([1, -1 * direction]);
            }
        }

        //en passant
        index = pieceFromLocation(pieces, this.x - 1, this.y);
        if (index != -1) {
            if (pieces[index].boardValue == (this.player == 1 ? 11 : 1) && pieces[index].enPassantAble) {
                moves.push([-1, -1 * direction, true]);
            }
        }
        index = pieceFromLocation(pieces, this.x + 1, this.y);
        if (index != -1) {
            if (pieces[index].boardValue == (this.player == 1 ? 11 : 1) && pieces[index].enPassantAble) {
                moves.push([1, -1 * direction, true]);
            }
        }
        return moves;
    }
    move(pieces, startPos, endPos) {
        let legalMoves = this.findLegalMoves(pieces);
        for (let i = 0; i < legalMoves.length; i++) {
            if (legalMoves[i][0] == endPos[0] - startPos[0] && legalMoves[i][1] == endPos[1] - startPos[1]) {
                let index = pieceFromLocation(pieces, endPos[0], endPos[1]);
                if (index != -1) {
                    pieces.splice(index, 1);
                }
                if (legalMoves[i].length > 2) {
                    let index = pieceFromLocation(pieces, endPos[0], startPos[1]);
                    if (index != -1) {
                        pieces.splice(index, 1);
                    }
                }
                this.x = endPos[0];
                this.y = endPos[1];
                this.moved = true;
                if (this.enPassantAble) {
                    this.enPassantAble = false;
                } else if (Math.abs(legalMoves[i][1]) == 2) {
                    this.enPassantAble = true;
                }
            }
        }
    }
}

class Rook extends Piece {
    constructor(Player = 1, X = 0, Y = 0) {
        super(Player, X, Y);
        this.boardValue = this.player === 1 ? 4 : 14;
        this.moved = false;
    }
    findLegalMoves(pieces) {
        //array of vectors of legal moves
        let moves = [];
        let direction = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ];
        for (let i = 0; i < 4; i++) {
            let pos = [this.x, this.y];
            let moving = true;
            while (moving) {
                pos[0] += direction[i][0];
                pos[1] += direction[i][1];
                if (pos[0] < 0 || pos[1] < 0 || pos[0] > 7 || pos[1] > 7) {
                    break;
                }
                if (pieceFromLocation(pieces, pos[0], pos[1]) == -1) {
                    moves.push([pos[0] - this.x, pos[1] - this.y]);
                } else if (!this.sameTeam(pieces[pieceFromLocation(pieces, pos[0], pos[1])])) {
                    moves.push([pos[0] - this.x, pos[1] - this.y]);
                    break;
                } else {
                    break;
                }
            }
        }
        return moves;
    }
    move(pieces, startPos, endPos) {
        let legalMoves = this.findLegalMoves(pieces);
        for (let i = 0; i < legalMoves.length; i++) {
            if (legalMoves[i][0] == endPos[0] - startPos[0] && legalMoves[i][1] == endPos[1] - startPos[1]) {
                let index = pieceFromLocation(pieces, endPos[0], endPos[1]);
                if (index != -1) {
                    pieces.splice(index, 1);
                }
                this.x = endPos[0];
                this.y = endPos[1];
                this.moved = true;
            }
        }
    }
}

class Bishop extends Piece {
    constructor(Player = 1, X = 0, Y = 0) {
        super(Player, X, Y);
        this.boardValue = this.player === 1 ? 3 : 13;
    }
    findLegalMoves(pieces) {
        //array of vectors of legal moves
        let moves = [];
        let direction = [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1]
        ];
        for (let i = 0; i < 4; i++) {
            let pos = [this.x, this.y];
            let moving = true;
            while (moving) {
                pos[0] += direction[i][0];
                pos[1] += direction[i][1];
                if (pos[0] < 0 || pos[1] < 0 || pos[0] > 7 || pos[1] > 7) {
                    break;
                }
                if (pieceFromLocation(pieces, pos[0], pos[1]) == -1) {
                    moves.push([pos[0] - this.x, pos[1] - this.y]);
                } else if (!this.sameTeam(pieces[pieceFromLocation(pieces, pos[0], pos[1])])) {
                    moves.push([pos[0] - this.x, pos[1] - this.y]);
                    break;
                } else {
                    break;
                }
            }
        }
        return moves;
    }
    move(pieces, startPos, endPos) {
        let legalMoves = this.findLegalMoves(pieces);
        for (let i = 0; i < legalMoves.length; i++) {
            if (legalMoves[i][0] == endPos[0] - startPos[0] && legalMoves[i][1] == endPos[1] - startPos[1]) {
                let index = pieceFromLocation(pieces, endPos[0], endPos[1]);
                if (index != -1) {
                    pieces.splice(index, 1);
                }
                this.x = endPos[0];
                this.y = endPos[1];
            }
        }
    }
}

class Queen extends Piece {
    constructor(Player = 1, X = 0, Y = 0) {
        super(Player, X, Y);
        this.boardValue = this.player === 1 ? 5 : 15;
    }
    findLegalMoves(pieces) {
        //array of vectors of legal moves
        let moves = [];
        let direction = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1]
        ];
        for (let i = 0; i < 8; i++) {
            let pos = [this.x, this.y];
            let moving = true;
            while (moving) {
                pos[0] += direction[i][0];
                pos[1] += direction[i][1];
                if (pos[0] < 0 || pos[1] < 0 || pos[0] > 7 || pos[1] > 7) {
                    break;
                }
                if (pieceFromLocation(pieces, pos[0], pos[1]) == -1) {
                    moves.push([pos[0] - this.x, pos[1] - this.y]);
                } else if (!this.sameTeam(pieces[pieceFromLocation(pieces, pos[0], pos[1])])) {
                    moves.push([pos[0] - this.x, pos[1] - this.y]);
                    break;
                } else {
                    break;
                }
            }
        }
        return moves;
    }
    move(pieces, startPos, endPos) {
        let legalMoves = this.findLegalMoves(pieces);
        for (let i = 0; i < legalMoves.length; i++) {
            if (legalMoves[i][0] == endPos[0] - startPos[0] && legalMoves[i][1] == endPos[1] - startPos[1]) {
                let index = pieceFromLocation(pieces, endPos[0], endPos[1]);
                if (index != -1) {
                    pieces.splice(index, 1);
                }
                this.x = endPos[0];
                this.y = endPos[1];
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
                    pieces.push(new Pawn(j === 6 ? 1 : 2, i, j));
                if (j === 0 || j === 7)
                    pieces.push(new Queen(j === 7 ? 1 : 2, i, j));
            }
        }
        return pieces;
    },

    //make a move
    move: function(pieces, move) {
        positions = move.split(":");
        startPos = [parseInt(positions[0], 10), parseInt(positions[1], 10)];
        endPos = [parseInt(positions[2], 10), parseInt(positions[3], 10)];
        let index = pieceFromLocation(pieces, startPos[0], startPos[1]);
        if (index != -1) {
            pieces[index].move(pieces, startPos, endPos);
        }
        return pieces;
    },

    //pieces to board array 
    piecesToBoard,
}