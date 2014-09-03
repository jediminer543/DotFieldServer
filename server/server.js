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
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});