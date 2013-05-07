dimension = 1000;


BC = {
	moveX: 0,
	moveY: 0,
	offsetX: 0,
	offsetY: 0,
	fromX: null,
	fromY: null,
	rooms: [],

	initialize: function(x, y) {
		BC.offsetX = dimension * x;
		BC.offsetY = dimension * y;

		BC.initializeRooms(x, y);

		BC.installKeyListeners();
		BC.installMouseListeners();

		//BC.installSocketListeners();

		BC.run();
	},

	initializeRooms: function(x, y) {
		BC.rooms.push(new Room(x, y, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x-1, y, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x+1, y, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x, y-1, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x-1, y-1, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x+1, y-1, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x, y+1, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x-1, y+1, BC.offsetX, BC.offsetY));
		BC.rooms.push(new Room(x+1, y+1, BC.offsetX, BC.offsetY));
	},

	run: function() {
		BC.move();
		for (var i = 0; i < BC.rooms.length; i++) {
			BC.rooms[i].sendData();
		}
	  setTimeout(BC.run, 75);
	},

	move: function() {
		if (BC.moveY != 0) {
			var top = -(0.025 * dimension * BC.moveY);

			if (BC.offsetY%dimension === 0) {
				BC.updateRooms();
			}
			BC.offsetY += top;

			$('.canvas-container').css('top', function(i, v) {
			    return (parseFloat(v) - top) + 'px';
			});
		}
		if (BC.moveX != 0) {
			var left = 0.025 * dimension * BC.moveX;
			
			if (BC.offsetX%dimension === 0) {
				BC.updateRooms();
			}

			BC.offsetX += left;

			$('.canvas-container').css('left', function(i, v) {
			    return (parseFloat(v) - left) + 'px';
			});
		}
	},

	installMouseListeners: function() {
		$('#viewport').mousedown(function(e) {
			BC.fromX = e.pageX + BC.offsetX
			BC.fromY = e.pageY + BC.offsetY
		});
		$('#viewport').mousemove(function(e) {
			if (BC.fromX) {
				BC.toX = e.pageX + BC.offsetX
				BC.toY = e.pageY + BC.offsetY
				data = {
					fromX:BC.fromX,
					fromY:BC.fromY,
					toX: BC.toX,
					toY: BC.toY	
				};

				console.log("Context")
				var lineStartRoom = BC.findRoom(Math.floor(BC.fromX/dimension), Math.floor(BC.fromY/dimension));
				
				lineStartRoom.drawLine(data);

				if (Math.floor(BC.fromX/dimension) != Math.floor(BC.toX/dimension) || Math.floor(BC.fromY/dimension) != Math.floor(BC.toY/dimension)) {
					var lineEndRoom = BC.findRoom(Math.floor(BC.toX/dimension), Math.floor(BC.toY/dimension));
					lineEndRoom.drawLine(data);

					var halfX = Math.floor((BC.fromX+(BC.toX-BC.fromX)/2)/dimension)
					var halfY = Math.floor((BC.fromY+(BC.toY-BC.fromY)/2)/dimension)
					// if (Math.floor(halfX/dimension) != Math.floor(BC.fromX/dimension) || Math.floor(halfX/dimension) != Math.floor(BC.toX/dimension)) {
					// 	if (Math.floor(halfY/dimension) != Math.floor(BC.fromY/dimension) || Math.floor(halfY/dimension) != Math.floor(BC.toY/dimension)) {
					// 		var lineMidRoom = BC.findRoom(Math.floor(halfX/dimension), Math.floor(halfY/dimension));
					// 		lineMidRoom.drawLine(data);	
					// 		console.log("HELPING")			
					// 	}
					// }
				}
				console.log(data);

				BC.fromX = BC.toX
				BC.fromY = BC.toY
			}
		});
		$('#viewport').mouseup(function(e) {
			if (BC.fromX) {
				BC.fromX = null;
				BC.fromY = null;
			}
		})
	},

	findRoom: function(x, y) {
		for (var i = 0; i < BC.rooms.length; i++) {
			if (BC.rooms[i].x === x && BC.rooms[i].y === y) {
				console.log(BC.rooms[i]);
				return BC.rooms[i];
			}
		}
		return false;
	},

	installKeyListeners: function() {


		$(document).keyup(function(e) {
			var pressedKey = e.which
			if (pressedKey === 37 || pressedKey === 39) {
				BC.moveX = 0;
			} else if (pressedKey === 38 || pressedKey === 40) {
				BC.moveY = 0;
			}
		});
		$(document).keydown(function(e) {
			var pressedKey = e.which
			if (BC.moveX != 0 && (pressedKey === 37 || pressedKey === 39)) {
				return false;
			}
			if (BC.moveY != 0 && (pressedKey === 38 || pressedKey === 40)) {
				return false;
			}
			switch (pressedKey) {
				case 37:
					BC.moveX = -1;
					break;
				case 38:
					BC.moveY = 1;
					break;
				case 39:
					BC.moveX = 1;
					break;
				case 40:
					BC.moveY = -1;
					break;
			}
		});
	},

	installSocketListeners: function() {
	  socket.on('connect', function(){
	    console.log("connected")
	  });
	},

	updateRooms: function() {
		//check room of top left
		//check room of top right
		//check room of top 
		var $window = $(window);
		var corners = []
		corners.push([Math.floor(BC.offsetX/dimension), Math.floor(BC.offsetY/dimension)]);
		corners.push([Math.floor((BC.offsetX+$window.width())/dimension), Math.floor((BC.offsetY+$window.height())/dimension)]);
		corners.push([Math.floor(BC.offsetX/dimension), Math.floor((BC.offsetY+$window.height())/dimension)]);
		corners.push([Math.floor((BC.offsetX+$window.width())/dimension), Math.floor(BC.offsetY/dimension)]);

		var uniqueCorners = BC.uniqueCoordinates(corners);
		var adjacents = []

		for (var i = 0; i < corners.length; i++) {
			for (var x = -1; x <= 1; x++) {
				for (var y = -1; y <= 1; y++) {
					adjacents.push([corners[i][0]+x, corners[i][1]+y]);
				}
			}
		}
		BC.setRooms(BC.uniqueCoordinates(adjacents));
		return BC.uniqueCoordinates(adjacents);
	},

	uniqueCoordinates: function(arr) {
		uniques = [];
		for (var i = 0; i < arr.length; i++) {
			var unique = true;
			for (var j = 0; j < uniques.length; j++) {
				if (uniques[j][0] === arr[i][0] && uniques[j][1] === arr[i][1]) {
					unique = false;
					break;
				}
			}
			uniques.push(arr[i]);
		}

		return uniques;
	},

	setRooms: function(roomCoordinates) {
		var newRooms = [];
		var reusedRooms = [];
		for (var i = 0; i < roomCoordinates.length; i++) {
			var existing = BC.findRoom(roomCoordinates[i][0], roomCoordinates[i][1])
			if (existing) {
				newRooms.push(existing);
				reusedRooms.push(existing);
			} else {
				newRooms.push(new Room(roomCoordinates[i][0], roomCoordinates[i][1], BC.offsetX, BC.offsetY));
			}
		}

		for (var i = 0; i < BC.rooms.length; i++) {
			for (var j = 0; j < reusedRooms.length; j++) {
				var used = false;
				if (BC.rooms[i] === reusedRooms[j]) {
					used = true;
					break;
				}
			}
			if (!used) {
				BC.rooms[i].remove();
			}
		}
		BC.rooms = newRooms;
 	}
};

function Room(x, y, offsetX, offsetY) {
	this.x = x;
	this.y = y;
	this.history = [];
	this.offsetX = x*dimension;
	this.offsetY = y*dimension;
	this.$container = $('<div></div>').addClass('canvas-container');

	this.roomID = 'x' + x + 'y' + y;
	socket.emit('subscribe', this.roomID);

	this.$container.attr('id', this.roomID);
	this.$container.css('left', x*dimension-offsetX).css('top', y*dimension-offsetY);
	this.$canvas = $('<canvas>').addClass('sketchpad');

	this.$canvas.width(dimension).height(dimension);
	this.$canvas[0].width = dimension;
	this.$canvas[0].height = dimension;

	this.$container.html(this.$canvas);
	this.context = this.$canvas[0].getContext("2d");

	this.context.strokeStyle = "red";
	this.context.lineWidth = 1.0;
	this.context.lineJoin = "round";
	$('#viewport').append(this.$container);
}

Room.prototype.drawLine = function(data) {
  this.context.beginPath();
  this.context.moveTo(data.fromX - this.offsetX, data.fromY - this.offsetY);
  this.context.lineTo(data.toX - this.offsetX, data.toY - this.offsetY);
  this.context.stroke();
  this.context.closePath();

  this.history.push(data);
},

Room.prototype.drawHistory = function(history) {
	for (var i = 0; i < history.length; i++) {
	  this.context.beginPath();
	  this.context.moveTo(history[i].fromX - this.offsetX, history[i].fromY - this.offsetY);
	  this.context.lineTo(history[i].toX - this.offsetX, history[i].toY - this.offsetY);
	  this.context.stroke();
	  this.context.closePath();
	}
}

Room.prototype.remove = function() {
	socket.emit('unsubscribe', this.roomID);
	this.$container.remove();
	// submit data
}

Room.prototype.sendData = function() {
	if (this.history.length > 0) {
		socket.emit('drawHistory', this.roomID, this.history);
		this.history = [];
	}
}
