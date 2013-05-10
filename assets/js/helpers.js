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
	validateNumber: function(event) {
		console.log(this);
    var key = window.event ? event.keyCode : event.which;

    if (key === 8 || key === 46
     || key === 37 || key === 39) {
     		if ($(this).hasClass('coord-picker')) {
     			Helper.loadCoordinates();
				} else {
					BC.style.width = $('#size-picker').val();
				}
				return true;
    }
    else if ( key < 48 || key > 57 ) {
    	switch (key) {
				case 120:
				$('#x-picker.coord-picker').focus();
					break;
				case 121:
				$('#y-picker.coord-picker').focus();
					break;
				case 98:
				$('#brush-picker').focus();
					break;
				case 99:
				$('.sp-replacer').trigger('click');
					break;
				case 115:
				$('#size-picker').focus();
					break;
    	}
      return false;
    }
    else {
   		if ($(this).hasClass('coord-picker')) {
   			Helper.loadCoordinates();
			} else {
				BC.style.width = $('#size-picker').val();
			}
			return true;
    }
	},

	loadCoordinates:function() {
		if ($('#x-picker').val().length != 0 && $('#y-picker').val().length != 0) {
			BC.loadCoordinates(parseInt($('#x-picker').val()), parseInt($('#y-picker').val()));		
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