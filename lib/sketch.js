$(function() {
	x = 0
	y = 0
	//$left = $('<div></div>').css('background-color', 'red').width(dimension * 0.03).height(dimension)
	//$(document).append($left)
	context = null;

	$(document).keyup(function(e) {
		var pressedKey = e.which
		if (pressedKey === 37 || pressedKey === 39) {
			moveX = 0;
		} else if (pressedKey === 38 || pressedKey === 40) {
			moveY = 0;
		}
	});
	$(document).keydown(function(e) {
		var pressedKey = e.which
		if (moveX != 0 && (pressedKey === 37 || pressedKey === 39)) {
			return false;
		}
		if (moveY != 0 && (pressedKey === 38 || pressedKey === 40)) {
			return false;
		}
		switch (pressedKey) {
			case 37:
				console.log("left");
				moveX = -1;
				break;
			case 38:
				console.log("up");
				moveY = 1;
				break;
			case 39:
				console.log("right");
				moveX = 1;
				break;
			case 40:
				console.log("down");
				moveY = -1;
				break;
		}
	});

	$('#canvas-bounds').mousedown(function(e) {
		test = $(event.target)
		if ($(e.target).hasClass("sketchpad") && e.target.getContext) {
			context = e.target.getContext("2d");
			//x = e.pageX
			//y = e.pageY
			x = (e.clientX - parseFloat($('#canvas-bounds').css('margin-left')) + offsetX+dimension)// + $(e.target).parent().offset().left
			y = (e.clientY - parseFloat($('#canvas-bounds').css('margin-top')) - offsetY+dimension)// 
			console.log(x + ", " + y);
			context.strokeStyle = "red";
			context.lineWidth = 1.0;
			context.lineJoin = "round";
		}
	});

	$('#canvas-bounds').mousemove(function(e) {
		if (context) {
			context.beginPath();
			context.moveTo(x%dimension,y%dimension);

			x = (e.clientX - parseFloat($('#canvas-bounds').css('margin-left')) + offsetX+dimension)// - $(e.target).parent().offset().left
			y = (e.clientY - parseFloat($('#canvas-bounds').css('margin-top')) - offsetY+dimension)// + $(e.target).parent().offset().top

			context.lineTo(x%dimension,y%dimension);
			context.stroke();
			context.closePath();
		}
	});

	$('.canvas-container').mouseleave(function(e) {

	lastCanvas = BC.parseID($(e.target).closest('.canvas-container').attr('id'))
	console.log(lastCanvas)
	});


	$('canvas').mouseenter(function(e) {
		if (context && context != e.target.getContext("2d")) {
			var previousX = x
			var previousY = y
			currentCanvas = BC.parseID($(e.target).closest('.canvas-container').attr('id'))
			console.log(currentCanvas)


			x = (e.clientX - parseFloat($('#canvas-bounds').css('margin-left')) + offsetX+dimension)// - $(e.target).parent().offset().left
			y = (e.clientY - parseFloat($('#canvas-bounds').css('margin-top')) - offsetY+dimension)// + $(e.target).parent().offset().top
			console.log("X: " + previousX + " to " + x);
			console.log("Y: " + previousY + " to " + y);
			context.beginPath();
			context.moveTo(previousX%dimension, previousY%dimension);
			console.log(lastCanvas.x)
			context.lineTo(x%dimension - (lastCanvas.x - currentCanvas.x)*dimension,y%dimension - (lastCanvas.y - currentCanvas.y)*dimension);
			context.stroke();
			context.closePath();

			context = e.target.getContext("2d");
			// console.log(x + ", " + y);
			context.strokeStyle = "red";
			context.lineWidth = 5.0;
			context.lineJoin = "round";

			context.beginPath();
			context.moveTo(previousX%dimension - (currentCanvas.x - lastCanvas.x)*dimension, previousY%dimension - (currentCanvas.y - lastCanvas.y)*dimension);
			console.log(lastCanvas.x)
			context.lineTo(x%dimension,y%dimension);
			context.stroke();
			context.closePath();

		}
	});

	$('#canvas-bounds').mouseup(function(e) {
		if (context) {
			context = null;
			console.log("released");
		}
	});

	$(window).resize(function(e) {
		BC.resizeCanvas();	
		console.log(window.innerHeight);
	});
});