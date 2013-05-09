var socket = io.connect(window.location.hostname);
socket.on('connect', function(){
  console.log("connected")
});

socket.on('start', function(x, y) {
	$(function() {
		BC.initialize(x, y);
	});
});

socket.on('loadhistory', function(roomID, uri) {
	var parsedID = roomID.slice(1).split('y');
	var room = BC.findRoom(parseInt(parsedID[0]), parseInt(parsedID[1]))
	if (room) {
		room.loadURI(uri);
	}
});

socket.on('drawPath', function(roomID, style, history) {
	var parsedID = roomID.slice(1).split('y');
	var room = BC.findRoom(parseInt(parsedID[0]), parseInt(parsedID[1]))
	if (room) {	
		room.drawPath(style, history);
	}
});