console.log("SocketServer running");

var express = require('express'); // these variables are function calls
var app = express();
var server = app.listen(3000);

app.use(express.static('public')); // hosts app

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket)
{
    console.log('new connection: ' + socket.id);
}
