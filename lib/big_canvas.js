BC = {
	initialize: function() {
		moveX = 0;
		moveY = 0;
		offsetX = 0;
		offsetY = 0;
		loadedCanvas = 0;

		if (window.innerWidth < window.innerHeight) {
			dimension = window.innerWidth
		} else {
			dimension = window.innerHeight
		}
		$('#canvas-bounds').width(dimension).height(dimension)

		var $canvasWindow = $("#canvas-bounds");

		for (var x = -1; x < 2; x++) {
			for (var y = -1; y < 2; y++) {
				var $container = $('<div/>').addClass('canvas-container')
				var $canvas = $('<canvas/>').addClass('sketchpad').width(dimension).height(dimension)
				$canvas.attr({
					width: dimension,
					height: dimension
				});
				$container.attr('id', 'x'+x+'y'+y);

				$container.css('left', x * dimension);
				$container.css('top', y * dimension);
				$container.append($canvas);
				$canvasWindow.append($container);
			}
		}

		BC.run();
	},

	resizeCanvas: function() {

	},

	run: function() {
		BC.move()
    setTimeout(BC.run, 50);
	},

	move: function() {
		//console.log($('.canvas-container').position());
		if (moveY != 0) {
			var top = 0.1 * dimension * moveY
			offsetY += top
			console.log(top)
			$('.canvas-container').css('top', function(i, v) {
			    return (parseFloat(v) + top) + 'px';
			});
		}
		if (moveX != 0) {
			var left = 0.1 * dimension * moveX
			offsetX += left
			$('.canvas-container').css('left', function(i, v) {
			    return (parseFloat(v) - left) + 'px';
			});
		}
	},


	visible: function(container) {
		//check container left
		//check container top
		// check if left is <  600 && >-600
		// check if top is < 600 && -600
		//if both true return true
	},

	parseID: function(id) {
		var coord = id.slice(1).split('y')
		return {
			x: parseInt(coord[0]),
			y: parseInt(coord[1])
		}
	}
}