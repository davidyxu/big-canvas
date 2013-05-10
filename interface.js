$(function() {
	$('#size-picker').change(function() {
		BC.style.width = $('#size-picker').val();
	});

	$('#size-picker').keypress(Helper.setSize);

	$('#color-label').mouseup(function() {
		if ($('.sp-active').length === 0) {
			window.setTimeout(function() {
				$('.sp-replacer').trigger('click')
			}, 10);		
		}
	});

	$('#brush-picker').change(function() {
		BC.style.lineCap = $('#brush-picker').val();
		if (BC.style.lineCap === "round") {
			BC.style.lineJoin = "round";
		} else {
			BC.style.lineJoin = "bevel";
		}
	});


	$('#color-picker').spectrum({
    showAlpha: true,
    showPalette: true,
    showInitial: true,
    showInput: true,
    showButtons: false,
    preferredFormat: "hex6",
    palette: [['black', 'gray', 'white']],
    localStorageKey: "big.canvas",
    move: function(color) {
    	BC.style.color = color.toRgbString();
    }
	});

	Helper.resize();
	$(window).resize(function() {
		Helper.resize();
	});
});

