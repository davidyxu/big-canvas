load = function() {
	function Room(x, y){
		this.x = x;
		this.y = y;
		this.history = [];

		this.offsetX = x*dimension;
		this.offsetY = y*dimension;
		this.canvas = new Canvas(dimension, dimension);
		this.context = this.canvas.getContext('2d');
		console.log(this.context);
		this.context.strokeStyle = "red";
		this.context.lineWidth = 1.0;
		this.context.lineJoin = "round";	
	}

	Room.prototype.drawHistory = function(history) {

		for (var i = 0; i < history.length; i++) {
		  this.context.beginPath();
		  this.context.moveTo(history[i].fromX - this.offsetX, history[i].fromY - this.offsetY);
		  this.context.lineTo(history[i].toX - this.offsetX, history[i].toY - this.offsetY);
		  this.context.stroke();
		  this.context.closePath();
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
}

exports.load