var Canvas = require('canvas')

fs = require('fs');
dimension = 1000;

function Room(x, y){
	this.x = x;
	this.y = y;
	this.history = [];

	this.offsetX = x*dimension;
	this.offsetY = y*dimension;
	this.canvas = new Canvas(dimension, dimension);
	this.context = this.canvas.getContext('2d');
	console.log(this.context);
	this.context.strokeStyle = "red";
	this.context.lineWidth = 1.0;
	this.context.lineJoin = "round";	
}

Room.prototype.drawHistory = function(history) {

	for (var i = 0; i < history.length; i++) {
	  this.context.beginPath();
	  this.context.moveTo(history[i].fromX - this.offsetX, history[i].fromY - this.offsetY);
	  this.context.lineTo(history[i].toX - this.offsetX, history[i].toY - this.offsetY);
	  this.context.stroke();
	  this.context.closePath();
	}
}

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

	socket.on('subscribe', function(roomID) {
		socket.join(roomID);
		socket.emit('test', "joining");

		if (io.sockets.clients(roomID).length === 1) {
			var parsedID = roomID.slice(1).split('y');
			// add a load from db info
			activeRooms[roomID] = new Room(parseInt(parsedID[0]), parseInt(parsedID[1]))
		} else {
			socket.emit('loadhistory', roomID, activeRooms[roomID].canvas.toDataURL());
			//socket.emit()
		}
	})
	socket.on('unsubscribe', function(roomID) {
		socket.leave(roomID);
		socket.emit('test', "leaving");

		if (io.sockets.clients(roomID).length === 0) {
			// persist data to database
			delete activeRooms[roomID];
		}
	})

	socket.on('drawHistory', function(roomID, history) {
		if (activeRooms[roomID]) {
			activeRooms[roomID].drawHistory(history);
		}
		socket.broadcast.to(roomID).emit('updatecanvas', roomID, history);		
	})

	//maintain serverside rooms
	socket.on('draw', function(roomID, data) {
		// activeRooms[roomID].drawLine(data);
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

