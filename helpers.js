Helper = {
	resize: function() {

		$('#viewport').width(window.innerWidth);
		$('#viewport').height(window.innerHeight - 30);
		$('#overlay').width(window.innerWidth);
		$('#overlay').height(window.innerHeight - 30);
		$('#overlay').closest('canvas').width = window.innerWidth;
		$('#overlay').closest('canvas').height = window.innerHeight - 30;

		$('#menu').width(window.innerWidth);
	},
	setSize: function(event) {
    var key = window.event ? event.keyCode : event.which;

    if (key === 8 || key === 46
     || key === 37 || key === 39) {
				BC.style.width = $('#size-picker').val();
        return true;
    }
    else if ( key < 48 || key > 57 ) {
    	if (key === 99) {
				$('.sp-replacer').trigger('click');
    	} else if (key === 98) {
				$('#brush-picker').focus();
    	}
      return false;
    }
    else {
			BC.style.width = $('#size-picker').val();
			return true;
    }
	},

	loadStyle: function(context, style) {
		if (context.strokeStyle != style.color) {
			context.strokeStyle = style.color;
		}
		if (context.lineWidth != style.width) {
			context.lineWidth = style.width;
		}
		if (context.lineCap != style.lineCap) {
			context.lineCap = style.lineCap;
		}
		if (context.lineJoin != style.lineJoin) {
			context.lineJoin = style.lineJoin;
		}
	}

}