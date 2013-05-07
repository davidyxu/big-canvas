var Canvas = require('canvas')
  , canvas = new Canvas(600, 600)
  , context = canvas.getContext('2d')
  , fs = require('fs');


var drawHistory = []

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
	socket.emit('drawBoard', canvas.toDataURL());

	socket.on('draw', function(data) {

		//keep server-side canvas on 
		context.beginPath();
		context.moveTo(data.fromX, data.fromY);
		context.lineTo(data.toX, data.toY);
		context.stroke();
		context.closePath();
		
		drawHistory.push(data);

		socket.broadcast.emit('updatecanvas', data);
	});
});

