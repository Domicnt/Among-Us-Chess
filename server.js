const http = require('http');
const WebSocketServer = require('websocket').server;
const fs = require('fs');

const game = require('./game');

//create server
let server = http.createServer((request, response) => {
    if (request.url === "/") {
        request.url = "/public/index.html";
    }
    fs.readFile(__dirname + request.url, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.write('File at url: ' + request.url + ' Not Found');
        } else {
            let fileTypes = {
                html: "text/html",
                css: "text/css",
                js: "application/javascript",
                ico: 'image/png',
                png: 'image/png'
            };
            let fileType = request.url.split(".").pop();
            if (fileType === 'html' || fileType === 'css' || fileType === 'js' || fileType === 'ico' || fileType === 'png') {
                response.writeHead(200, { 'Content-Type': fileTypes[fileType], 'Content-Length': data.length });
                response.write(data);
            }
        }
        response.end();
    });
});

server.listen(process.env.PORT || 80);

//create webSocket server with server
wss = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

//array for connections
let connections = [];
let connectionIDs = [];

//set up game
let pieces = game.reset();

let moveSuccess;
let Player1ID;
let Player2ID;

let whiteTurn;
let Player1selecting;
let Player2selecting;
let selected = [0, 0];

let selecting;
let Player1King;
let Player2King;

//start selecting pieces
function startPreGame() {
    pieces = game.reset();

    Player1ID = connectionIDs[0];
    Player2ID = connectionIDs[1];

    connections[0].sendUTF('s');
    connections[1].sendUTF('s');
    selecting = true;

    Player1King = -1;
    Player2King = -1;
}
//start the game
function startGame() {
    moveSuccess = false;
    whiteTurn = true;
    Player1selecting = false;
    Player2selecting = false;
    selected = [0, 0];
    updateClients(0);
}
//reset the game
function reset() {
    startPreGame();
    startGame();
    for (let i = 0; i < connections.length; i++) {
        connections[i].sendUTF('r');
    }
}

//update clients with changes to the board
function updateClients(winner) {
    for (let i = 0; i < connections.length; i++) {
        if (winner == 1) {
            connections[i].sendUTF('1');
        } else if (winner == 2) {
            connections[i].sendUTF('2');
        }
        connections[i].sendUTF(JSON.stringify(game.piecesToBoard(pieces)));
        if (connectionIDs[i] == Player1ID) {
            connections[i].sendUTF('k' + Player1King.x + ',' + Player1King.y);
        } else if (connectionIDs[i] == Player2ID) {
            connections[i].sendUTF('k' + Player2King.x + ',' + Player2King.y);
        }
    }
}

function parseMessage(message, connection) {
    let ID = message.substring(0, 10); //ID for client
    let value = message.substring(10, 11); //What value is being passed
    message = message.substring(11); //The message passed

    if (!selecting) {
        if (whiteTurn) {
            if (ID != Player1ID) {
                return;
            }
        } else {
            if (ID != Player2ID) {
                return;
            }
        }
    }

    let piece = game.pieceFromLocation(pieces, parseInt(message.split(":")[0], 10), parseInt(message.split(":")[1], 10));
    team = 1;
    if (piece != -1) {
        team = pieces[piece].boardValue < 10 ? 1 : 2;
    }
    if (Player1selecting) {
        team = 1;
    } else if (Player2selecting) {
        team = 2;
    }

    if (ID == Player1ID && team == 2) {
        return;
    } else if (ID == Player2ID && team == 1) {
        return;
    }

    //client that sent the message
    switch (value) {
        case 'm':
            //move a piece
            if (selecting)
                break;
            moveSuccess = game.move(pieces, message);
            Player1selecting = false;
            Player2selecting = false;
            connection.sendUTF('a');
            updateClients(0);
            break;
        case 's':
            //select a position
            if (selecting) {
                if (ID == Player1ID && piece != -1) {
                    Player1King = pieces[piece];
                } else if (ID == Player2ID && piece != -1) {
                    Player2King = pieces[piece];
                }
                updateClients(0);
                if (Player1King != -1 && Player2King != -1) {
                    connections[0].sendUTF('s');
                    connections[1].sendUTF('s');
                    selecting = false;
                    startGame();
                }
                break
            } else if (Player1selecting || Player2selecting) {
                moveSuccess = game.move(pieces, selected[0] + ":" + selected[1] + ":" + parseInt(message.split(":")[0], 10) + ":" + parseInt(message.split(":")[1], 10));
                connection.sendUTF('a');
                updateClients(0);
                Player1selecting = false;
                Player2selecting = false;
            } else {
                selected[0] = parseInt(message.split(":")[0], 10);
                selected[1] = parseInt(message.split(":")[1], 10);
                let arr = game.findLegalPositions(pieces, selected);
                if (arr.length > 0) {
                    connection.sendUTF('a' + arr);
                    if (team == 1) {
                        Player1selecting = true;
                    } else {
                        Player2selecting = true;
                    }
                } else {
                    break;
                }
            }
            break;
    }
    if (moveSuccess) {
        whiteTurn = !whiteTurn;
        moveSuccess = false;
    }

    //check if a player has won
    if (Player1King != -1 && Player2King != -1) {
        if (!pieces.includes(Player1King)) {
            updateClients(2);
            setTimeout(() => { reset(); }, 2000);
        } else if (!pieces.includes(Player2King)) {
            updateClients(1);
            setTimeout(() => { reset(); }, 2000);
        }
    }
}

function createID() {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

wss.on('request', (request) => {
    let connection = request.accept('', request.origin);
    let ID = createID();

    connections.push(connection);
    connectionIDs.push(ID);

    //send connection their ID
    connection.sendUTF('i' + ID);
    //send player their player number
    if (connections.length == 1) {
        connection.sendUTF('n' + 1);
        connection.sendUTF('w');
    } else if (connections.length == 2) {
        connection.sendUTF('n' + 2);
        startPreGame();
        for (let i = 0; i < connections.length; i++) {
            connections[i].sendUTF('p');
        }
    } else {
        connection.sendUTF('n' + 0);
    }
    //send current board array
    connection.sendUTF(JSON.stringify(game.piecesToBoard(pieces)));

    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            parseMessage(message.utf8Data, connection);
        }
    });

    console.log('Connection accepted at ' + (new Date()));
    connection.on('close', (reasonCode, description) => {
        //update player on their player number
        for (let i = 0; i < connections.length; i++) {
            if (connections[i] == connection) {
                connections.splice(i, 1);
                connectionIDs.splice(i, 1);
                if (connections.length == 1) {
                    connections[0].sendUTF('w');
                }
                i--;
                continue;
            }
            connections[i].sendUTF('n' + i + 1);
        }
        console.log('Player' + connection.remoteAddress + ' disconnected at ' + (new Date()));
    });
});