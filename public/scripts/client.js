let rect = canvas.getBoundingClientRect();

let solo = false;
let selecting = false;
let selected = true;
let king = [-1, -1];

//0 is observer, 1 is white player, 2 is black player
player = 0;

startPos = [0, 0];
endPos = [0, 0];
canvas.addEventListener('mousedown', function(event) {
    startPos = [parseInt(((event.clientX - rect.left) / size * 8), 10), parseInt(((event.clientY - rect.top) / size * 8), 10)];
    if (player == 2) {
        startPos[0] = 7 - startPos[0];
        startPos[1] = 7 - startPos[1];
    }
}, false);
canvas.addEventListener('mouseup', function(event) {
    endPos = [parseInt(((event.clientX - rect.left) / size * 8), 10), parseInt(((event.clientY - rect.top) / size * 8), 10)];
    if (player == 2) {
        endPos[0] = 7 - endPos[0];
        endPos[1] = 7 - endPos[1];
    }
    console.log(startPos, endPos);
    if (startPos[0] == endPos[0] && startPos[1] == endPos[1]) {
        //select
        selected = true;
        send('s', startPos[0] + ':' + startPos[1] + ':' + endPos[0] + ':' + endPos[1]);
    } else {
        //move
        send('m', startPos[0] + ':' + startPos[1] + ':' + endPos[0] + ':' + endPos[1]);
    }
}, false);

let HOST = window.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST);
ws.onopen = (evt) => {
    console.log('Connected');
};
ws.onclose = (evt) => {
    console.log('Connection closed');
};
ws.onmessage = (evt) => {
    switch (evt.data[0]) {
        case 'i':
            //ID
            ID = evt.data.replace('i', '');
            break;
        case 'n':
            //player number
            player = Number(evt.data.replace('n', ''));
            break;
        case 'a':
            //legal positions to move to
            legalPositions = evt.data.replace('a', '').split(',');
            break;
        case 'w':
            //waiting for another player
            solo = true;
            break;
        case 'p':
            //second player joined
            solo = false;
            break;
        case 's':
            //selecting king piece
            if (selecting) {
                selecting = false
            } else {
                selecting = true;
                selected = false;
            }
        case 'k':
            //update position of king piece
            king = evt.data.replace('k', '').split(',');
            break;
        default:
            //update board
            updateBoard(JSON.parse(evt.data));
            break;
    }
};
ws.onerror = (evt) => { console.log('Connection error'); };

function send(value, message) {
    ws.send(ID + value + message);
}

function close() {
    ws.close();
}