var Canvas = require('canvas')
  , Image = Canvas.Image
  , fs = require('fs');
dimension = 1000;

mongo = require('mongodb')
Server = mongo.Server
Db = mongo.Db
BSON = mongo.BSONPure;

con = null;
connection = null;


largestX = -50;
largestY = -50;
smallestX = 50;
smallestY = 50;
changedEdges = false;

server = new Server('linus.mongohq.com', '10045', {auto_reconnect: true});
DBCon = new Db('app15526437', server, {safe: false});
DBCon.open(function(err, db) {
  if(!err) {
    db.authenticate(process.env.DB_ACCOUNT, process.env.DB_PASSWORD, function(err){
      if(!err) {
      	con = db;
				collection = new mongo.Collection(con, "canvasURI");

				startApp();
	    }
    })
  }
});


//Data Structure for Rooms
function Room(x, y){
	this.x = x;
	this.y = y;
	this.history = [];

	this.offsetX = x*dimension;
	this.offsetY = y*dimension;
	this.updated = false;
	this.unchanged = true;
	this.canvas = new Canvas(dimension, dimension);
	this.context = this.canvas.getContext('2d');	
}

Room.prototype.loadStyle = function(style) {

	if (this.context.strokeStyle != style.color) {
		this.context.strokeStyle = style.color;
	}
	if (this.context != style.width) {
		this.context.lineWidth = style.width;
	}
	if (this.context.lineCap != style.lineCap) {
		this.context.lineCap = style.lineCap;
	}
	if (this.context.lineJoin != style.lineJoin) {
		this.context.lineJoin = style.lineJoin;
	}
}

Room.prototype.drawPath = function(style, data) {
	this.loadStyle(style);

	console.log(data);
	this.context.beginPath();
	this.context.moveTo(data[0].x- this.offsetX, data[0].y- this.offsetY)
	for (var i = 1; i < data.length; i++) {
		this.context.lineTo(data[i].x - this.offsetX, data[i].y - this.offsetY)
	}
	this.context.stroke();
	this.context.closePath();
	this.updated = true;
	if (this.unchanged) {
		this.unchanged = false;
	}
}

Room.prototype.loadURI = function(uri) {
		var img = new Image;
		var that = this;
		img.onload = function() {
			that.context.drawImage(img, 0, 0);
		};
		img.src = uri;
}

var activeRooms = {};
var startX = 0;
var startY = 0;
//Node Server
var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var port = process.env.PORT || 5000;

startApp = function() {
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
		socket.emit('start', startX, startY); // how to decide best spot to start

		socket.on('subscribe', function(roomID) {
			socket.join(roomID);

			// if this is the first person accessing this room
			if (activeRooms[roomID]) {
				socket.emit('loadhistory', roomID, activeRooms[roomID].canvas.toDataURL());
			// if instance of room already available, send it
			} else {
				loadRoom(socket, roomID);
			}
		})
		socket.on('getOverview', function() {
			metaCollection.find({overview: {$exists: true}}).nextObject(function(err, docs) {
				if (err) {
					console.log(err);
				} else if (docs) {
					socket.emit('loadOverview', docs.overview);
				}
			});
		})
		socket.on('unsubscribe', function(roomID) {
			socket.leave(roomID);
		})

		socket.on('drawPath', function(roomID, style, history) {
			if (!activeRooms[roomID]) {
				loadRoom(roomID);
			}
			activeRooms[roomID].drawPath(style, history);

			var parsedID = roomID.slice(1).split('y');
			startX = parseInt(parsedID[0]);
			startY = parseInt(parsedID[1]);

			socket.broadcast.to(roomID).emit('drawPath', roomID, style, history)
		})
	});
	setInterval(updateActiveRooms, 200000);
}

loadRoom = function(socket, roomID) {
	var parsedID = roomID.slice(1).split('y');
	activeRooms[roomID] = new Room(parseInt(parsedID[0]), parseInt(parsedID[1]))
	// load uri from db if available
	collection.find({roomID: roomID}).nextObject(function(err,docs) {
		if (err) {
			console.log(err);
		} else if (docs) {
			activeRooms[roomID].loadURI(docs.uri);
			socket.emit('loadhistory', roomID, docs.uri);	
		}
	});
}




updateActiveRooms = function() {
	for (var roomID in activeRooms) {
	  if (!activeRooms[roomID].updated) {
	  	if (!activeRooms[roomID].unchanged) {
				collection.update({roomID: roomID}, {$set: {uri: activeRooms[roomID].canvas.toDataURL()}}, {safe: true, upsert: true}, function(err, object) {
					if (err) {
						console.log(roomID + ": " + err);
					} else {
						console.log(roomID + " updated");
				  	delete activeRooms[roomID];
					}
				})
			}
	  } else {
	  	activeRooms[roomID].updated = false;
	  }
	}
}
