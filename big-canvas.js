dimension = 1000;


BC = {
	rightClick: false,
	leftClick: false,
	modifier: false,
	offsetX: 0,
	offsetY: 0,
	colorHolder: null,
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

	startStroke: function(startX, startY) {
		Helper.loadStyle(this.context, this.style);

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

	strokeRooms: function(coordinate) {
		var radius = (BC.style.width)/2
		var currentRooms = []
				currentRooms.push([Math.floor((coordinate.x+radius)/dimension), Math.floor((coordinate.y+radius)/dimension)]);
				currentRooms.push([Math.floor((coordinate.x-radius)/dimension), Math.floor((coordinate.y+radius)/dimension)]);
				currentRooms.push([Math.floor((coordinate.x+radius)/dimension), Math.floor((coordinate.y-radius)/dimension)]);
				currentRooms.push([Math.floor((coordinate.x-radius)/dimension), Math.floor((coordinate.y-radius)/dimension)]);
		return this.uniqueCoordinates(currentRooms);
	},

	processStroke: function() {
		var activeRooms = [BC.findRoom(Math.floor(this.stroke[0].x/dimension), Math.floor(this.stroke[0].y/dimension))];
		activeRooms[0].startStroke(this.stroke[0].x, this.stroke[0].y);

		for (var i = 1; i < this.stroke.length; i++) {
			var uniqueRooms = this.strokeRooms(this.stroke[i]);

			for (var a = 0; a < uniqueRooms.length; a++) {
				var currentRoom = BC.findRoom(uniqueRooms[a][0], uniqueRooms[a][1]);
				var newRoom = true;
				for (var j = 0; j < activeRooms.length; j++) {
					if (activeRooms[j].roomID === currentRoom.roomID) {
						newRoom = false;
						break;
					}
				}
				if (newRoom) {
					activeRooms.push(currentRoom)
					currentRoom.startStroke(this.stroke[i-1].x, this.stroke[i-1].y);
				}
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

	moveCanvas: function() {
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
	},

	installKeyListeners: function() {
		$(document).keydown(function(e) {
			if (BC.modifier != e.which && !BC.colorHolder) {
				BC.modifier = e.which;
			}
		});
		$(document).keypress(function(e) {
			switch (e.which) {
				case 98:
				$('#brush-picker').focus();
				return false;
					break;
				case 99:
				$('.sp-replacer').trigger('click');
					break;
				case 115:
				$('#size-picker').focus();
				return false;
					break;
			}
		})
		$(document).keyup(function(e) {
			console.log(BC.modifier);
			BC.modifier = false;
		});
	},

	installMouseListeners: function() {		
		document.oncontextmenu = function() {return false};

		$('#viewport').mousedown(function(e) {
			if ($('#size-picker').is(':focus')) {
				$('#size-picker').blur();
			}
			if (e.which === 3 || e.button === 2) {
				BC.fromX = e.pageX + BC.offsetX;
				BC.fromY = e.pageY + BC.offsetY;
				BC.rightClick = true;
				document.body.style.cursor = 'move';
			} else {
				BC.leftClick = true;
				document.body.style.cursor = 'crosshair';
				if (BC.modifier === 17) {
					BC.colorHolder = BC.style.color;
					BC.style.color = "#FFFFFF";
					console.log(BC.style.color);
					console.log(BC.colorHolder);
				}
				BC.startStroke(e.pageX + BC.offsetX, e.pageY + BC.offsetY);
			}
			return false;
		});

		$('#viewport').mousemove(function(e) {
			if (BC.rightClick) {
				BC.toX = e.pageX + BC.offsetX;
				BC.toY = e.pageY + BC.offsetY;
				BC.moveCanvas();
			} else if (BC.leftClick) {
				BC.drawStroke(e.pageX + BC.offsetX, e.pageY + BC.offsetY);
			}
		});

		$('#viewport').mouseup(function(e) {
			if (BC.rightClick) {
				BC.rightClick = false;
				BC.updateRooms();
			} else if (BC.leftClick) {
				BC.leftClick = false;
				BC.endStroke(e.pageX + BC.offsetX, e.pageY + BC.offsetY);
				if (BC.colorHolder) {
					BC.style.color = BC.colorHolder;
					BC.colorHolder = null;
				}
			}
			document.body.style.cursor = 'default';
		});
	},

	findRoom: function(x, y) {
		for (var i = 0; i < BC.rooms.length; i++) {
			if (BC.rooms[i].x === x && BC.rooms[i].y === y) {
				return BC.rooms[i];
			}
		}
		return false;
	},

	updateRooms: function() {
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
		this.removeUnused(reusedRooms);

		BC.rooms = newRooms;
 	},

 	removeUnused: function(reusedRooms) {
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
 	}
};