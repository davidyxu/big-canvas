dimension = 1000;


BC = {
	rightClick: false,
	moveX: 0,
	moveY: 0,
	offsetX: 0,
	offsetY: 0,
	fromX: null,
	fromY: null,
	style: {
		color: "#000000",
		width: 5.0,
		lineCap: "round",
		lineJoin: "round"
	},
	stroke: [],
	rooms: [],

	initialize: function(x, y) {
		BC.offsetX = dimension * x;
		BC.offsetY = dimension * y;

		BC.initializeRooms(x, y);

		BC.installKeyListeners();
		BC.installMouseListeners();
		BC.installOverlay();

		//BC.installSocketListeners();
		BC.run();
	},

	installOverlay: function() {
		this.$canvas = $('<canvas>');
		$('#overlay').append(this.$canvas);
		this.context = this.$canvas[0].getContext('2d');
		this.$canvas.width($(window).width()).height($(window).height());

		this.$canvas[0].width = $(window).width();
		this.$canvas[0].height = $(window).height();

		this.context.strokeStyle = this.style.color;
		this.context.lineWidth = this.style.width;
		this.context.lineCap = this.style.lineCap;
		this.context.lineJoin = this.style.lineJoin;
	},

	initializeRooms: function(x, y) {
		BC.rooms.push(new Room(x, y, BC.offsetX, BC.offsetY));
		for (var shiftX = -1; shiftX <= 1; shiftX++) {
			for (var shiftY = -1; shiftY <= 1; shiftY++) {
				if (shiftX === 0 && shiftY === 0) {
					continue;
				}
				BC.rooms.push(new Room(x + shiftX, y + shiftY, BC.offsetX, BC.offsetY));
			}
		}
	},
//remove this and keylistener later
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

// pass in context and throw into helper library
	setOverlayStyle: function() {
		if (this.context.strokeStyle != this.style.color) {
			this.context.strokeStyle = this.style.color;
		}
		if (this.context.lineWidth != this.style.width) {
			this.context.lineWidth = this.style.width;
		}
		if (this.context.lineCap != this.style.lineCap) {
			this.context.lineCap = this.style.lineCap;
		}
		if (this.context.lineJoin != this.style.lineJoin) {
			this.context.lineJoin = this.style.lineJoin;
		}
	},

	startStroke: function(startX, startY) {
		this.setOverlayStyle();

		this.context.beginPath();
		this.context.moveTo(startX-BC.offsetX, startY-BC.offsetY);
		this.stroke = [{x: startX, y: startY}];
	},

	drawStroke: function(pointX, pointY) {
		this.context.lineTo(pointX-BC.offsetX, pointY-BC.offsetY);

		this.clearOverlay();
		this.context.stroke();

		this.stroke.push({x: pointX, y: pointY});
	},

	endStroke: function(endX, endY) {
		this.clearOverlay();

		this.stroke.push({x: endX, y: endY});
		this.processStroke();
	},

	processStroke: function() {
		var activeRooms = [BC.findRoom(Math.floor(this.stroke[0].x/dimension), Math.floor(this.stroke[0].y/dimension))];
		activeRooms[0].startStroke(this.stroke[0].x, this.stroke[0].y);

		for (var i = 1; i < this.stroke.length; i++) {
			currentRoom = BC.findRoom(Math.floor(this.stroke[i].x/dimension), Math.floor(this.stroke[i].y/dimension));

			var newRoom = true;
			for (var j = 0; j < activeRooms.length; j++) {
				console.log(activeRooms[j].roomID)
				if (activeRooms[j].roomID === currentRoom.roomID) {
					newRoom = false;
					break;
				}
			}
			if (newRoom) {
				activeRooms.push(currentRoom)
				currentRoom.startStroke(this.stroke[i-1].x, this.stroke[i-1].y);
			}

			for (var j = 0; j < activeRooms.length; j++) {
				activeRooms[j].drawStroke(this.stroke[i].x, this.stroke[i].y);
			}

		}

		for (var j = 0; j < activeRooms.length; j++) {
			activeRooms[j].endStroke();
			activeRooms[j].roomID
		}
		this.stroke = [];
	},

	clearOverlay: function() {
		this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height);
	},

	drawLine: function() {
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
	},

	installMouseListeners: function() {		
		document.oncontextmenu = function() {return false};

		$('#viewport').mousedown(function(e) {
			if (e.which === 3 || e.button === 2) {
				BC.rightClick = true;
				document.body.style.cursor = 'move';
			}
			BC.startStroke(e.pageX + BC.offsetX, e.pageY + BC.offsetY);
			BC.fromX = e.pageX + BC.offsetX;
			BC.fromY = e.pageY + BC.offsetY;
		});
		$('#viewport').mousemove(function(e) {
			if (BC.fromX) {
				BC.toX = e.pageX + BC.offsetX;
				BC.toY = e.pageY + BC.offsetY;
				
				if (BC.rightClick) {
					// move to movecanvas function
					var shiftLeft = BC.fromX - BC.toX;
					var shiftTop = BC.fromY - BC.toY;
					BC.offsetX += shiftLeft;
					BC.offsetY += shiftTop;
					$('.canvas-container').css('top', function(i, v) {
				    return (parseFloat(v) - shiftTop) + 'px';
					});

					$('.canvas-container').css('left', function(i, v) {
				    return (parseFloat(v) - shiftLeft) + 'px';
					});

					BC.updateRooms();
				} else {
					BC.drawStroke(e.pageX + BC.offsetX, e.pageY + BC.offsetY);
					//BC.drawLine();
				}
			}
		});
		$('#viewport').mouseup(function(e) {
			if (BC.rightClick) {
				BC.rightClick = false;
				document.body.style.cursor = 'default';
			}
			if (BC.fromX) {
				BC.fromX = null;
				BC.fromY = null;
				BC.endStroke(e.pageX + BC.offsetX, e.pageY + BC.offsetY);
			}
		});
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