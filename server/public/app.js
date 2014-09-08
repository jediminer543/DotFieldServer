$(function() {
    console.log('creating grid');
    var grid = new Grid(8, $('#gridContainer'));

    grid.bind('activate', function (coord) {
        socket.emit('activate', coord);
    });

    grid.bind('deactivate', function (coord) {
        socket.emit('deactivate', coord);
    });

    var socket = io.connect('http://192.168.0.11');
    socket.on('connect', function() {
        console.log('connected');

        // TODO: wait for "welcome" message

        socket.on('activate', function (data) {
            grid.activateCell(data.x, data.y);
        });

        socket.on('deactivate', function (data) {
            grid.deactivateCell(data.x, data.y);
        });
    });
});