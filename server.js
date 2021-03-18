console.log("SocketServer running");

// start with express
var express = require('express'); // these variables are function calls
var app = express();
var server = app.listen(3000);

app.use(express.static('public')); 

// serve favicon
var favicon = require('serve-favicon');
const path = require('path');
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));


// setup socket
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);
function newConnection(socket)
{
    console.log('new connection: ' + socket.id);
}
