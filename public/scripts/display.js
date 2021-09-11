let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let size = Math.min(window.innerWidth, window.innerHeight);
canvas.width = size;
canvas.height = size;

let pawn1 = new Image();
pawn1.src = "./public/assets/pawn1.png";
let pawn2 = new Image();
pawn2.src = "./public/assets/pawn2.png";
let knight1 = new Image();
knight1.src = "./public/assets/knight1.png";
let knight2 = new Image();
knight2.src = "./public/assets/knight2.png";
let bishop1 = new Image();
bishop1.src = "./public/assets/bishop1.png";
let bishop2 = new Image();
bishop2.src = "./public/assets/bishop2.png";
let rook1 = new Image();
rook1.src = "./public/assets/rook1.png";
let rook2 = new Image();
rook2.src = "./public/assets/rook2.png";
let queen1 = new Image();
queen1.src = "./public/assets/queen1.png";
let queen2 = new Image();
queen2.src = "./public/assets/queen2.png";
let king1 = new Image();
king1.src = "./public/assets/king1.png";
let king2 = new Image();
king2.src = "./public/assets/king2.png";

let move = new Image();
move.src = "./public/assets/move.png";

//local board variable
let board = [];

//legal moves for currently selected piece
let legalPositions = [];

function updateBoard(newBoard) {
    board = newBoard;
}

//draw the board
function draw() {
    //clear screen
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, size, size);

    //draw squares
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            context.fillStyle = (i + j) % 2 == 0 ? "#E6BEF0" : "#909090";
            context.fillRect(i * size / 8, j * size / 8, size / 8, size / 8);
        }
    }

    //draw pieces
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            switch (board[i][j]) {
                case 1:
                    context.drawImage(pawn2, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 11:
                    context.drawImage(pawn1, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 2:
                    context.drawImage(knight2, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 12:
                    context.drawImage(knight1, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 3:
                    context.drawImage(bishop2, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 13:
                    context.drawImage(bishop1, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 4:
                    context.drawImage(rook2, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 14:
                    context.drawImage(rook1, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 5:
                    context.drawImage(queen2, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 15:
                    context.drawImage(queen1, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 6:
                    context.drawImage(king2, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
                case 16:
                    context.drawImage(king1, i * size / 8, j * size / 8, size / 8, size / 8);
                    break;
            }
        }
    }

    //draw legal moves
    for (let i = 0; i < legalPositions.length - 1; i += 2) {
        context.drawImage(move, legalPositions[i] * size / 8, legalPositions[i + 1] * size / 8, size / 8, size / 8);
    }
}

setInterval(draw, 50);