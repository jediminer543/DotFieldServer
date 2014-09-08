var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var WEB_PORT = 47284;

app.set('view engine', 'ejs');
app.set('port', process.env.PORT || WEB_PORT);
app.use(express.static(__dirname + '/public'));

server.listen(app.get('port'), function() {
    console.log('Web server listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('welcome', { app: 'GravityBlocks' });

  socket.on('activate', function (data) {
    console.log('activate', data);
    socket.broadcast.emit('activate', {x: data.x, y: data.y});
  });

  socket.on('deactivate', function (data) {
    console.log('deactivate', data);
    socket.broadcast.emit('deactivate', {x: data.x, y: data.y});
  });
});