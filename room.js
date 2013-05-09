function Room(x, y, offsetX, offsetY) {
	this.x = x;
	this.y = y;
	this.history = [];
	this.offsetX = x*dimension;
	this.offsetY = y*dimension;
	this.$container = $('<div></div>').addClass('canvas-container');

	this.roomID = 'x' + x + 'y' + y;

	this.$container.attr('id', this.roomID);
	this.$container.css('left', x*dimension-offsetX).css('top', y*dimension-offsetY);
	this.$canvas = $('<canvas>').addClass('sketchpad');

	this.$canvas.width(dimension).height(dimension);
	this.$canvas[0].width = dimension;
	this.$canvas[0].height = dimension;

	this.$container.html(this.$canvas);
	this.context = this.$canvas[0].getContext("2d");

	socket.emit('subscribe', this.roomID);


	Helper.loadStyle(this.context, BC.style);

	$('#viewport').append(this.$container);

}

Room.prototype.startStroke = function(startX, startY) {
	Helper.loadStyle(this.context, BC.style);
	this.context.beginPath();
	this.context.moveTo(startX - this.offsetX, startY - this.offsetY);
	this.history.push({x: startX, y: startY})
}

Room.prototype.drawStroke = function(pointX, pointY) {
	this.context.lineTo(pointX - this.offsetX, pointY - this.offsetY);
	this.history.push({x: pointX, y: pointY})
}

Room.prototype.endStroke = function() {
	this.context.stroke();
	this.context.closePath();
	console.log("path closed")
	// emit drawline;
	socket.emit('drawPath', this.roomID, BC.style, this.history);
	console.log(this.history)
	this.history = [];
}

Room.prototype.drawPath = function(style, data) {
	Helper.loadStyle(this.context, style);

	this.context.beginPath();
	this.context.moveTo(data[0].x - this.offsetX, data[0].y - this.offsetY)
	for (var i = 1; i < data.length; i++) {
		this.context.lineTo(data[i].x - this.offsetX, data[i].y - this.offsetY)
	}
	this.context.stroke();
	this.context.closePath();
}

Room.prototype.loadURI = function(uri) {
		var img = new Image;
		var that = this;
		img.onload = function() {
			that.context.drawImage(img, 0, 0);
		};
		img.src = uri;
}

Room.prototype.remove = function() {
	socket.emit('unsubscribe', this.roomID);
	this.$container.remove();
}
