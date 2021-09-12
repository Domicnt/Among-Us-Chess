let rect = canvas.getBoundingClientRect()
startPos = [0, 0];
endPos = [0, 0];
canvas.addEventListener('mousedown', function(event) {
    startPos = [parseInt(((event.clientX - rect.left) / size * 8), 10), parseInt(((event.clientY - rect.top) / size * 8), 10)];
}, false);
canvas.addEventListener('mouseup', function(event) {
    endPos = [parseInt(((event.clientX - rect.left) / size * 8), 10), parseInt(((event.clientY - rect.top) / size * 8), 10)];
    console.log(startPos, endPos);
    if (startPos[0] == endPos[0] && startPos[1] == endPos[1]) {
        //select
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
            num = Number(evt.data.replace('n', ''));
            break;
        case 'a':
            //legal positions to move to
            legalPositions = evt.data.replace('a', '').split(',');
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