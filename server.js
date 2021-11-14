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
let moveSuccess = false;
let Player1ID;
let Player2ID;
let whiteTurn = true;
let Player1selecting = false;
let Player2selecting = false;
let selected = [0, 0];

//update clients with changes to the board
function updateClients() {
    for (let i = 0; i < connections.length; i++) {
        connections[i].sendUTF(JSON.stringify(game.piecesToBoard(pieces)));
    }
}

function parseMessage(message, connection) {
    let ID = message.substring(0, 10); //ID for client
    let value = message.substring(10, 11); //What value is being passed
    message = message.substring(11); //The message passed

    if (whiteTurn) {
        if (ID != Player1ID) {
            return;
        }
    } else {
        if (ID != Player2ID) {
            return;
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
            moveSuccess = game.move(pieces, message);
            selecting = false;
            connection.sendUTF('a');
            updateClients();
            break;
        case 's':
            //select a position
            if (Player1selecting || Player2selecting) {
                moveSuccess = game.move(pieces, selected[0] + ":" + selected[1] + ":" + parseInt(message.split(":")[0], 10) + ":" + parseInt(message.split(":")[1], 10));
                connection.sendUTF('a');
                updateClients();
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
        Player1ID = ID;
        connection.sendUTF('w');
    } else if (connections.length == 2) {
        connection.sendUTF('n' + 2);
        Player2ID = ID;
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