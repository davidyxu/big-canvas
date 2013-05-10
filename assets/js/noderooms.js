module.exports = function() {
	Constr =  Room (x, y) {
		this.x = x;
		this.y = y;
		this.history = [];

		this.offsetX = x*dimension;
		this.offsetY = y*dimension;
		this.updated = false;
		this.unchanged = true;
		this.canvas = new Canvas(dimension, dimension);
		this.context = this.canvas.getContext('2d');	
	};

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
	};

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
	};

	Room.prototype.loadURI = function(uri) {
			var img = new Image;
			var that = this;
			img.onload = function() {
				that.context.drawImage(img, 0, 0);
			};
			img.src = uri;
	};
	return Room;
}