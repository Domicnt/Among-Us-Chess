let rect = canvas.getBoundingClientRect()
startPos = [0, 0];
endPos = [0, 0];
canvas.addEventListener('mousedown', function(event) {
    startPos = [event.clientX - rect.left, event.clientY - rect.top];
}, false);
canvas.addEventListener('mouseup', function(event) {
    endPos = [event.clientX - rect.left, event.clientY - rect.top];
    send('m', (startPos[0] / size * 8) + ':' + (startPos[1] / size * 8) + ':' + (endPos[0] / size * 8) + ':' + (endPos[1] / size * 8))
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
        default:
            //update board
            let board = JSON.parse(evt.data);
            setTimeout(function() { draw(board) }, 50);
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