$(function() {
    console.log('creating grid');
    var grid = new Grid(8, $('#gridContainer'));

    grid.bind('activate', function (coord) {
        socket.emit('activate', coord);
    });

    grid.bind('deactivate', function (coord) {
        socket.emit('deactivate', coord);
    });

    var id = null;
    var colors = null;
    var myColorIndex = null;

    var socket = io.connect('http://172.31.27.102');
    socket.on('connect', function() {
        console.log('connected');

        if (id) return; // if we have already handshaken with the server, don't set up the event handlers and stuff again

        socket.once('welcome', function (data) {
            console.log('welcome received');

            if (data.app !== 'GravityBlocks') {
                alert('Connected to unknown server');
                return;
            }

            socket.emit('hello');

            id = data.id;
            colors = data.colors;
            myColorIndex = data.colorIndex;
            alert('your colour index is ' + data.colorIndex);

            socket.on('activate', function (data) {
                console.log('color ' + data.color);
                grid.activateCell(data.coords.x, data.coords.y);
            });

            socket.on('deactivate', function (data) {
                grid.deactivateCell(data.coords.x, data.coords.y);
            });
        });
    });
});
