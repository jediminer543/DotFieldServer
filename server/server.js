var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var CubeClientManager = require('./lib/CubeClientManager');
var DotFieldServer = require('./lib/DotFieldServer');

var config = require(__dirname + '/../config.json');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || config.listenWebPort);
app.use(express.static(__dirname + '/public'));

server.listen(app.get('port'), function() {
    console.log('Web server listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
    res.render('index', {config: config});
});

var cubeManager = new CubeClientManager(config);
var dfServer = new DotFieldServer(io, cubeManager, config.inactivityAutopilotStart || 10);
