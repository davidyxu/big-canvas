var socket = io.connect(window.location.hostname);
socket.on('connect', function(){
  console.log("connected")
});

socket.on('start', function(x, y) {
	$(function() {
		if (window.location.search) {
			var parsedID = window.location.search.slice(2).split('y');
			var startX = parseInt(parsedID[0]);
			var startY = parseInt(parsedID[1]);
			console.log(startX);
			console.log(startY);
			if (isFinite(startX) && isFinite(startY)) {
				console.log('test');
				BC.initialize(startX, startY);
			} else {
				BC.initialize(x, y);
			}
		} else {
			BC.initialize(x, y);	
		}
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

socket.on('removeMouse', function(sessionID) {
	console.log("removing");
	console.log(sessionID);
	BC.removeMouse(sessionID);
});

socket.on('drawMouse', function(sessionID, mousePosition) {
	BC.drawMouse(sessionID, mousePosition);
});