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

For black, add 1 in front
*/

module.exports = {
    //reset board
    reset: function() {
        let board = [];
        for (let i = 0; i < 8; i++) {
            board[i] = [];
            for (let j = 0; j < 8; j++) {
                board[i][j] = (j == 6 || j == 1) ? ((j == 1) ? 1 : 11) : 0;
                if (j == 0 || j == 7) {
                    let add = j == 0 ? 0 : 10;
                    switch (i) {
                        case 0:
                        case 7:
                            board[i][j] = 4 + add;
                            break;
                        case 1:
                        case 6:
                            board[i][j] = 2 + add;
                            break;
                        case 2:
                        case 5:
                            board[i][j] = 3 + add;
                            break;
                        case 3:
                            board[i][j] = 5 + add;
                            break;
                        case 4:
                            board[i][j] = 6 + add;
                            break;
                    }
                }
            }
        }
        return board;
    },

    //make a move
    move: function(board, move) {
        positions = move.split(":");
        startPos = [parseInt(positions[0], 10), parseInt(positions[1], 10)];
        endPos = [parseInt(positions[2], 10), parseInt(positions[3], 10)];
        //console.log(startPos);
        //console.log(endPos);
        let temp = board[startPos[0]][startPos[1]];
        board[endPos[0]][endPos[1]] = temp;
        return board;
    }
}