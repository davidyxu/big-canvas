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

io.sockets.on('connection', function(socket) {
	socket.on('somestuff', function(data) {
		io.sockets.emit('updatecanvas', data)
	});
	socket.on('draw', function(data) {
		io.sockets.emit('updatecanvas', data)
	});
});