$(function() {
    var grid = new Grid(8, $('#gridContainer'));

    grid.bind('activate', function (coord) {
        console.log('activate', coord);
        socket.emit('activate', coord);
    });

    grid.bind('deactivate', function (coord) {
        console.log('deactivate', coord);
        socket.emit('deactivate', coord);
    });

    var id = null;
    var colors = null;
    var startColorIndex = null;
    var endColorIndex = null;
    var myColor = null;

    var socket = io.connect('http://' + config.listenIp);
    socket.on('connect', function() {
        console.log('Connected to server');

        // If we have connected before (so we're reconnecting), id WON'T be null
        socket.emit('join', id);
    });

    socket.on('welcome', function (data) {
        console.log('Welcome received', data);

        if (data.app !== 'DotField') {
            alert('Connected to unknown server');
            return;
        }

        id = data.id;
        colors = data.colors;
        startColorIndex = data.startColorIndex;
        endColorIndex = data.endColorIndex;
        startColor = colors[startColorIndex];

        console.log('Allocated colour indexes ' + startColorIndex + ',' + endColorIndex + ' %cstart preview', 'color: ' + colorToCSS(startColor));

        socket.removeAllListeners('activate').on('activate', function (data) {
            console.log('color ' + data.color);
            grid.activateCell(data.coords.y, data.coords.x);
        });

        socket.removeAllListeners('deactivate').on('deactivate', function (data) {
            grid.deactivateCell(data.coords.y, data.coords.x);
        });

        // Create colour selector buttons
        for (var colorIndex=0; colorIndex < colors.length; colorIndex++) {
            var startButton = $('<button>');
            startButton.attr('data-colorindex', colorIndex)
            startButton.css('background-color', colorToCSS(colors[colorIndex]));
            startButton.addClass('color-select');
            startButton.addClass('start-color');

            if (colorIndex == startColorIndex) {
                startButton.addClass('selected');
            }

            $('#start-color-selector').append(startButton);

            var endButton = $('<button>');
            endButton.attr('data-colorindex', colorIndex)
            endButton.css('background-color', colorToCSS(colors[colorIndex]));
            endButton.addClass('color-select');
            endButton.addClass('end-color');

            if (colorIndex == endColorIndex) {
                endButton.addClass('selected');
            }

            $('#end-color-selector').append(endButton);
        }

        $('.face-select').prop('disabled', false);

        showSelectedFace(data.face);
    });

    socket.on('restart', function() {
        // The server is telling us that the server has restarted, so we should reload the page
        window.location.reload();
    });


    // Setup controls
    $('#controls').on('click', '.face-select', function() {
        var selectedFace = $(this).attr('data-face');
        socket.emit('faceselect', selectedFace);

        showSelectedFace(selectedFace);
    });

    $('#controls').on('click', '.color-select', function() {
        var selectedColor = parseInt($(this).attr('data-colorindex'), 10);
        var isStartColor = $(this).hasClass('start-color');

        var socketPayload = {
            isStartColor: isStartColor,
            colorIndex: selectedColor
        };
        socket.emit('colorselect', socketPayload);

        showSelectedColor(isStartColor, selectedColor);
    });

    function showSelectedFace(face) {
        $('.face-select').removeClass('selected');
        $('.face-select[data-face=' + face + ']').addClass('selected');
    }

    function showSelectedColor(isStartColor, selectedColor) {
        var classPrefix = isStartColor ? 'start' : 'end';

        $('.' + classPrefix + '-color').removeClass('selected');
        $('.' + classPrefix + '-color[data-colorindex=' + selectedColor + ']').addClass('selected');
    }

    function colorToCSS(colorArray) {
        return 'rgb(' + colorArray[0] + ', ' + colorArray[1] + ', ' + colorArray[2] + ')';
    }
});
