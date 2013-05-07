var Canvas = require('canvas')
  , canvas = new Canvas(1000, 1000)
  , context = canvas.getContext('2d')
  , fs = require('fs');


var drawHistory = [];

var activeRooms = {};

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var port = process.env.PORT || 5000;

server.listen(port);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function(socket) {

	//alternative to drawboard, returns history of drawn points
	// socket.emit('drawAll', drawHistory);

	// return canvas

	//inititalize at origin, later to be determiend by algorithm
	socket.emit('start', 0, 0);

	//socket.emit('drawBoard', canvas.toDataURL());

	socket.on('subscribe', function(data) {
		socket.join(data);
		socket.emit('test', "joining");
		
	})
	socket.on('unsubscribe', function(data) {
		socket.leave(data);
		socket.emit('test', "leaving");
	})

	socket.on('drawHistory', function(roomID, data) {
		socket.broadcast.to(roomID).emit('updatecanvas', roomID, data);		
	})

	//maintain serverside rooms
	socket.on('draw', function(roomID, data) {

		//keep server-side canvas on 
		// context.beginPath();
		// context.moveTo(data.fromX, data.fromY);
		// context.lineTo(data.toX, data.toY);
		// context.stroke();
		// context.closePath();
		
		// drawHistory.push(data);

		socket.broadcast.to(roomID).emit('updatecanvas', roomID, data);
	});
});

