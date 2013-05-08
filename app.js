var Canvas = require('canvas')
  , Image = Canvas.Image
  , fs = require('fs');
dimension = 1000;

mongo = require('mongodb')
Server = mongo.Server
Db = mongo.Db
BSON = mongo.BSONPure;
con = null;

server = new Server('linus.mongohq.com', '10045', {auto_reconnect: true});
DBCon = new Db('app15526437', server, {safe: false});
DBCon.open(function(err, db) {
  if(!err) {
    db.authenticate(process.env.DB_ACCOUNT, process.env.DB_PASSWORD, function(err){
      if(!err) con = db;
      collection = new mongo.Collection(con, "canvasURI");
    })
  }
});

//Data Structure for Rooms
function Room(x, y){
	this.x = x;
	this.y = y;
	this.history = [];

	this.lastUpdated = (new Date).getTime();

	this.offsetX = x*dimension;
	this.offsetY = y*dimension;

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
Room.prototype.drawHistory = function(style, history) {
	this.loadStyle(style);
	if (history.length === 0) {
		return false;
	} else {
		this.lastUpdated =(new Date).getTime();
		for (var i = 0; i < history.length; i++) {
		  this.context.beginPath();
		  this.context.moveTo(history[i].fromX - this.offsetX, history[i].fromY - this.offsetY);
		  this.context.lineTo(history[i].toX - this.offsetX, history[i].toY - this.offsetY);
		  this.context.stroke();
		  this.context.closePath();
		}
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


//Node Server
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
	socket.emit('start', 0, 0); // how to decide best spot to start
	socket.on('subscribe', function(roomID) {
		socket.join(roomID);

		// if this is the first person accessing this room
		if (activeRooms[roomID]) {
			socket.emit('loadhistory', roomID, activeRooms[roomID].canvas.toDataURL());
		// if instance of room already available, send it
		} else {
			var parsedID = roomID.slice(1).split('y');
			activeRooms[roomID] = new Room(parseInt(parsedID[0]), parseInt(parsedID[1]))
			// load uri from db if available
			collection.find({roomID: roomID}).nextObject(function(err,docs) {
				if (err) {
					console.log(err);
				} else if (docs) {
					console.log("====");
					console.log(roomID);
					console.log("====");
					activeRooms[roomID].loadURI(docs.uri);
					socket.emit('loadhistory', roomID, docs.uri);	
				}
			});
			//socket.emit()
		}

		for (var name in activeRooms) {
		  console.log(name);
		}
	})
	socket.on('unsubscribe', function(roomID) {
		socket.leave(roomID);
		socket.emit('test', "leaving");
		console.log("===========");
		console.log(roomID)
		console.log("===========");
		if (io.sockets.clients(roomID).length === 0) {
			
			collection.update({roomID: roomID}, {$set: {uri: activeRooms[roomID].canvas.toDataURL()}}, {safe: true, upsert: true}, function(err, object) {
				if (err) {
					console.log(roomID + ": " + err);
				} else {
					console.log(roomID + " updated");
				}
				//delete activeRooms[roomID];
			})
			// persist data to database
		}
	})

	socket.on('drawHistory', function(roomID, style, history) {
		if (activeRooms[roomID]) {
			activeRooms[roomID].drawHistory(style, history);
		}
		socket.broadcast.to(roomID).emit('updatecanvas', roomID, style, history);		
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

