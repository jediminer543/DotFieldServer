$(function() {
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
    var myColor = null;

    var socket = io.connect('http://192.168.0.11');
    socket.on('connect', function() {
        console.log('Connected to server');

        // If we have connected before (so we're reconnecting), id WON'T be null
        socket.emit('join', id);
    });

    socket.on('welcome', function (data) {
        console.log('Welcome received', data);

        if (data.app !== 'GravityBlocks') {
            alert('Connected to unknown server');
            return;
        }

        id = data.id;
        colors = data.colors;
        myColorIndex = data.colorIndex;
        myColor = colors[myColorIndex];

        socket.removeAllListeners('activate').on('activate', function (data) {
            console.log('color ' + data.color);
            grid.activateCell(data.coords.x, data.coords.y);
        });

        socket.removeAllListeners('deactivate').on('deactivate', function (data) {
            grid.deactivateCell(data.coords.x, data.coords.y);
        });
    });

    socket.on('restart', function() {
        // The server is telling us that the server has restarted, so we should reload the page
        window.location.reload();
    });
});
